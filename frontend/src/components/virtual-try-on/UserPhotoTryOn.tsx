import { useEffect, useMemo, useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import type { KonvaEventObject } from 'konva/lib/Node'
import {
  Circle,
  Group,
  Image as KonvaImage,
  Layer,
  Line,
  Rect,
  Stage,
  Text,
} from 'react-konva'
import {
  lowerPhotoGarments,
  upperPhotoGarments,
} from '../../data/photoTryOnGarments'
import defaultModelPhoto from '../../assets/model.jpg'
import {
  PHOTO_TRY_ON_CANVAS_SIZE,
  clamp,
  fitImageToCanvas,
  fitLowerGarmentToBody,
  fitUpperGarmentToBody,
  initializeBodyKeypoints,
  type BodyKeypointName,
  type BodyKeypoints,
  type GarmentTransform,
  type PhotoTryOnGarment,
  type Rect as CanvasRect,
  type Size,
} from '../../utils/photoTryOn'

type ImageResource = {
  image: HTMLImageElement | null
  size: Size | null
}

type TryOnLayer = 'upper' | 'lower'

type GarmentSize = 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL'

type ApiTryOnProduct = {
  name?: string
  nameVi?: string | null
  category?: string
  categoryVi?: string | null
  price?: string | number | null
  description?: string | null
  descriptionVi?: string | null
  material?: string | null
  garment?: string | null
  region?: string | null
}

type ApiTryOnImage = {
  id: string
  url: string
  tryOnSize?: string | null
  width?: number | null
  height?: number | null
  product?: ApiTryOnProduct
}

type RemotePhotoGarments = {
  upper: PhotoTryOnGarment[]
  lower: PhotoTryOnGarment[]
}

const keypointLabels: Record<BodyKeypointName, string> = {
  neck: 'Neck',
  leftShoulder: 'L shoulder',
  rightShoulder: 'R shoulder',
  waistLeft: 'L waist',
  waistRight: 'R waist',
  hipLeft: 'L hip',
  hipRight: 'R hip',
  crotch: 'Crotch',
  leftKnee: 'L knee',
  rightKnee: 'R knee',
  leftAnkle: 'L ankle',
  rightAnkle: 'R ankle',
}

const bodyGuideLines: BodyKeypointName[][] = [
  ['leftShoulder', 'neck', 'rightShoulder'],
  ['waistLeft', 'waistRight'],
  ['hipLeft', 'hipRight'],
  ['neck', 'crotch'],
  ['hipLeft', 'leftKnee', 'leftAnkle'],
  ['hipRight', 'rightKnee', 'rightAnkle'],
]

const garmentSizes: GarmentSize[] = ['XS', 'S', 'M', 'L', 'XL', 'XXL']

const garmentLayerLabels: Record<TryOnLayer, string> = {
  upper: 'Upper garments',
  lower: 'Lower garments',
}

const defaultModelPhotoSize: Size = {
  width: 621,
  height: 931,
}

const defaultPhotoRect: CanvasRect = fitImageToCanvas(
  defaultModelPhotoSize,
  PHOTO_TRY_ON_CANVAS_SIZE,
)

const defaultBodyKeypoints: BodyKeypoints = initializeBodyKeypoints(defaultPhotoRect)

const apiBaseUrl = (
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000/api'
).replace(/\/$/, '')

function isObjectUrl(url: string) {
  return url.startsWith('blob:')
}

function normalizeGarmentText(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

function inferRemoteLayer(product: ApiTryOnProduct | undefined): TryOnLayer {
  const text = normalizeGarmentText(
    [
      product?.region,
      product?.garment,
      product?.category,
      product?.categoryVi,
      product?.name,
      product?.nameVi,
    ]
      .filter(Boolean)
      .join(' '),
  )

  if (
    text.includes('lower') ||
    text.includes('trouser') ||
    text.includes('skirt') ||
    text.includes('quan') ||
    text.includes('chan vay')
  ) {
    return 'lower'
  }

  return 'upper'
}

function createRemoteAnchors(layer: TryOnLayer, naturalSize: Size) {
  const { width, height } = naturalSize

  if (layer === 'lower') {
    return {
      waistLeft: { x: width * 0.22, y: height * 0.14 },
      waistRight: { x: width * 0.78, y: height * 0.14 },
      hemLeft: { x: width * 0.2, y: height * 0.9 },
      hemRight: { x: width * 0.8, y: height * 0.9 },
    }
  }

  return {
    neck: { x: width * 0.5, y: height * 0.14 },
    leftShoulder: { x: width * 0.28, y: height * 0.25 },
    rightShoulder: { x: width * 0.72, y: height * 0.25 },
    leftHem: { x: width * 0.3, y: height * 0.86 },
    rightHem: { x: width * 0.7, y: height * 0.86 },
  }
}

function toRemotePhotoGarment(image: ApiTryOnImage): PhotoTryOnGarment {
  const layer = inferRemoteLayer(image.product)
  const naturalSize = {
    width: image.width || 1024,
    height: image.height || 1536,
  }
  const productName = image.product?.nameVi || image.product?.name || 'Uploaded garment'
  const sizeLabel = image.tryOnSize ? ` / ${image.tryOnSize}` : ''
  const rawPrice = image.product?.price

  return {
    id: `remote-${image.id}`,
    name: `${productName}${sizeLabel}`,
    category: layer === 'lower' ? 'Lower garment' : 'Upper garment',
    price:
      typeof rawPrice === 'number'
        ? `$${rawPrice}`
        : rawPrice || 'Store price',
    description:
      image.product?.descriptionVi ||
      image.product?.description ||
      'A store try-on product from the current catalog.',
    fit: image.tryOnSize ? `Size ${image.tryOnSize}` : 'Store fit',
    fabric: image.product?.material || 'Catalog fabric',
    imageUrl: image.url,
    layer,
    naturalSize,
    anchorPoints: createRemoteAnchors(layer, naturalSize),
  }
}

function useCanvasImage(src: string | null): ImageResource {
  const [resource, setResource] = useState<ImageResource>({
    image: null,
    size: null,
  })

  useEffect(() => {
    if (!src) {
      return
    }

    let cancelled = false
    const image = new window.Image()
    image.decoding = 'async'
    image.onload = () => {
      if (cancelled) return
      setResource({
        image,
        size: {
          width: image.naturalWidth || image.width,
          height: image.naturalHeight || image.height,
        },
      })
    }
    image.src = src

    return () => {
      cancelled = true
    }
  }, [src])

  return resource
}

function getGarmentById(garments: PhotoTryOnGarment[], id: string) {
  return garments.find((garment) => garment.id === id) ?? garments[0]
}

function renderGarmentImage(
  garment: PhotoTryOnGarment,
  image: HTMLImageElement | null,
  transform: GarmentTransform,
  onTransformChange: (transform: GarmentTransform) => void,
  onCanvasSelect: () => void,
) {
  if (!image) return null

  return (
    <KonvaImage
      image={image}
      x={transform.x}
      y={transform.y}
      width={garment.naturalSize.width * transform.scaleX}
      height={garment.naturalSize.height * transform.scaleY}
      rotation={transform.rotation}
      opacity={transform.opacity}
      shadowColor="rgba(28, 25, 23, 0.28)"
      shadowBlur={18}
      shadowOffsetY={10}
      draggable
      onClick={() => onCanvasSelect()}
      onTap={() => onCanvasSelect()}
      onMouseDown={() => onCanvasSelect()}
      onMouseEnter={(event) => {
        const container = event.target.getStage()?.container()
        if (container) container.style.cursor = 'grab'
      }}
      onMouseLeave={(event) => {
        const container = event.target.getStage()?.container()
        if (container) container.style.cursor = 'default'
      }}
      onDragStart={(event) => {
        onCanvasSelect()
        const container = event.target.getStage()?.container()
        if (container) container.style.cursor = 'grabbing'
      }}
      onDragEnd={(event) => {
        const container = event.target.getStage()?.container()
        if (container) container.style.cursor = 'grab'
        onTransformChange({
          ...transform,
          x: event.target.x(),
          y: event.target.y(),
        })
      }}
    />
  )
}

function ProductRail({
  title,
  garments,
  selectedId,
  selectedSize,
  onSelect,
  onSizeSelect,
}: {
  title: string
  garments: PhotoTryOnGarment[]
  selectedId: string
  selectedSize: GarmentSize
  onSelect: (garment: PhotoTryOnGarment) => void
  onSizeSelect: (size: GarmentSize) => void
}) {
  return (
    <div className="photo-products__group">
      <div className="photo-products__group-heading">
        <h4>{title}</h4>
        <span>{garments.length} items</span>
      </div>
      <div className="photo-size-selector" role="group" aria-label={`${title} size`}>
        {garmentSizes.map((size) => (
          <button
            key={size}
            type="button"
            className={
              selectedSize === size
                ? 'photo-size-chip photo-size-chip--active'
                : 'photo-size-chip'
            }
            onClick={() => onSizeSelect(size)}
            aria-pressed={selectedSize === size}
          >
            {size}
          </button>
        ))}
      </div>
      <div className="photo-products__list">
        {garments.map((garment) => (
          <button
            key={garment.id}
            type="button"
            className={
              selectedId === garment.id
                ? 'photo-product-card photo-product-card--active'
                : 'photo-product-card'
            }
            onClick={() => onSelect(garment)}
            aria-pressed={selectedId === garment.id}
          >
            <img src={garment.imageUrl} alt="" loading="lazy" decoding="async" />
            <span>
              <strong>{garment.name}</strong>
              <small>{garment.price} / {garment.fit}</small>
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

function ProductInfoCard({
  garment,
  selectedSize,
}: {
  garment: PhotoTryOnGarment
  selectedSize: GarmentSize
}) {
  return (
    <aside className="photo-product-detail" aria-label="Selected product information">
      <img
        className="photo-product-detail__image"
        src={garment.imageUrl}
        alt={garment.name}
        loading="lazy"
        decoding="async"
      />
      <div className="photo-product-detail__copy">
        <p className="fit-panel__eyebrow">{garment.category}</p>
        <h3>{garment.name}</h3>
        <strong>{garment.price}</strong>
        <p>{garment.description}</p>
      </div>
      <dl className="photo-product-detail__facts">
        <div>
          <dt>Size</dt>
          <dd>{selectedSize}</dd>
        </div>
        <div>
          <dt>Fit</dt>
          <dd>{garment.fit}</dd>
        </div>
        <div>
          <dt>Fabric</dt>
          <dd>{garment.fabric}</dd>
        </div>
      </dl>
    </aside>
  )
}

export function UserPhotoTryOn() {
  const canvasRef = useRef<HTMLDivElement | null>(null)
  const [remotePhotoGarments, setRemotePhotoGarments] = useState<RemotePhotoGarments>({
    upper: [],
    lower: [],
  })
  const [photoUrl, setPhotoUrl] = useState<string | null>(defaultModelPhoto)
  const [photoName, setPhotoName] = useState('model.jpg')
  const [showBodyPoints, setShowBodyPoints] = useState(false)
  const [stageScale, setStageScale] = useState(1)
  const [bodyKeypoints, setBodyKeypoints] = useState<BodyKeypoints>(() =>
    defaultBodyKeypoints,
  )
  const [activeLibraryLayer, setActiveLibraryLayer] = useState<TryOnLayer>('upper')
  const [selectedInfoLayer, setSelectedInfoLayer] = useState<TryOnLayer>('upper')
  const [selectedCanvasLayer, setSelectedCanvasLayer] = useState<TryOnLayer | null>(null)
  const [selectedUpperSize, setSelectedUpperSize] = useState<GarmentSize>('M')
  const [selectedLowerSize, setSelectedLowerSize] = useState<GarmentSize>('M')
  const [selectedUpperId, setSelectedUpperId] = useState(upperPhotoGarments[0].id)
  const [selectedLowerId, setSelectedLowerId] = useState(lowerPhotoGarments[0].id)
  const [upperTransform, setUpperTransform] = useState<GarmentTransform>(() =>
    fitUpperGarmentToBody(defaultBodyKeypoints, upperPhotoGarments[0]),
  )
  const [lowerTransform, setLowerTransform] = useState<GarmentTransform>(() =>
    fitLowerGarmentToBody(defaultBodyKeypoints, lowerPhotoGarments[0]),
  )

  const photoResource = useCanvasImage(photoUrl)
  const upperGarments = useMemo(
    () => [...remotePhotoGarments.upper, ...upperPhotoGarments],
    [remotePhotoGarments.upper],
  )
  const lowerGarments = useMemo(
    () => [...remotePhotoGarments.lower, ...lowerPhotoGarments],
    [remotePhotoGarments.lower],
  )
  const selectedUpper = getGarmentById(upperGarments, selectedUpperId)
  const selectedLower = getGarmentById(lowerGarments, selectedLowerId)
  const upperImage = useCanvasImage(selectedUpper.imageUrl)
  const lowerImage = useCanvasImage(selectedLower.imageUrl)
  const activeGarments = activeLibraryLayer === 'upper' ? upperGarments : lowerGarments
  const activeSelectedId = activeLibraryLayer === 'upper' ? selectedUpperId : selectedLowerId
  const activeSelectedSize = activeLibraryLayer === 'upper' ? selectedUpperSize : selectedLowerSize
  const selectedInfoGarment = selectedInfoLayer === 'upper' ? selectedUpper : selectedLower
  const selectedInfoSize = selectedInfoLayer === 'upper' ? selectedUpperSize : selectedLowerSize
  const selectedCanvasGarment =
    selectedCanvasLayer === 'upper'
      ? selectedUpper
      : selectedCanvasLayer === 'lower'
        ? selectedLower
        : null
  const selectedCanvasOpacity =
    selectedCanvasLayer === 'upper'
      ? upperTransform.opacity
      : selectedCanvasLayer === 'lower'
        ? lowerTransform.opacity
        : 0

  const photoRect = useMemo(() => {
    if (!photoResource.size) return defaultPhotoRect
    return fitImageToCanvas(photoResource.size, PHOTO_TRY_ON_CANVAS_SIZE)
  }, [photoResource.size])

  useEffect(() => {
    let active = true

    fetch(`${apiBaseUrl}/products/try-on`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Try-on API returned ${response.status}`)
        }

        return response.json() as Promise<ApiTryOnImage[]>
      })
      .then((images) => {
        if (!active) return

        const remoteGarments = images.map(toRemotePhotoGarment)
        setRemotePhotoGarments({
          upper: remoteGarments.filter((garment) => garment.layer !== 'lower'),
          lower: remoteGarments.filter((garment) => garment.layer === 'lower'),
        })
      })
      .catch(() => {
        if (active) {
          setRemotePhotoGarments({ upper: [], lower: [] })
        }
      })

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    if (
      remotePhotoGarments.upper.length > 0 &&
      upperPhotoGarments.some((garment) => garment.id === selectedUpperId)
    ) {
      setSelectedUpperId(remotePhotoGarments.upper[0].id)
    }
  }, [remotePhotoGarments.upper, selectedUpperId])

  useEffect(() => {
    if (
      remotePhotoGarments.lower.length > 0 &&
      lowerPhotoGarments.some((garment) => garment.id === selectedLowerId)
    ) {
      setSelectedLowerId(remotePhotoGarments.lower[0].id)
    }
  }, [remotePhotoGarments.lower, selectedLowerId])

  useEffect(() => {
    setUpperTransform(fitUpperGarmentToBody(bodyKeypoints, selectedUpper))
  }, [selectedUpperId])

  useEffect(() => {
    setLowerTransform(fitLowerGarmentToBody(bodyKeypoints, selectedLower))
  }, [selectedLowerId])

  useEffect(() => {
    return () => {
      if (photoUrl && isObjectUrl(photoUrl)) URL.revokeObjectURL(photoUrl)
    }
  }, [photoUrl])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const updateStageScale = () => {
      setStageScale(Math.min(1, canvas.clientWidth / PHOTO_TRY_ON_CANVAS_SIZE.width))
    }

    updateStageScale()
    const observer = new ResizeObserver(updateStageScale)
    observer.observe(canvas)

    return () => observer.disconnect()
  }, [])

  function handlePhotoUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    const nextUrl = URL.createObjectURL(file)
    setPhotoUrl((current) => {
      if (current && isObjectUrl(current)) URL.revokeObjectURL(current)
      return nextUrl
    })
    setPhotoName(file.name)

    const image = new window.Image()
    image.onload = () => {
      const nextPhotoRect = fitImageToCanvas(
        {
          width: image.naturalWidth || image.width,
          height: image.naturalHeight || image.height,
        },
        PHOTO_TRY_ON_CANVAS_SIZE,
      )
      const nextKeypoints = initializeBodyKeypoints(nextPhotoRect)
      setBodyKeypoints(nextKeypoints)
      setUpperTransform(fitUpperGarmentToBody(nextKeypoints, selectedUpper))
      setLowerTransform(fitLowerGarmentToBody(nextKeypoints, selectedLower))
    }
    image.src = nextUrl
  }

  function resetBodyPoints() {
    const nextKeypoints = initializeBodyKeypoints(photoRect)
    setBodyKeypoints(nextKeypoints)
    setUpperTransform(fitUpperGarmentToBody(nextKeypoints, selectedUpper))
    setLowerTransform(fitLowerGarmentToBody(nextKeypoints, selectedLower))
  }

  function autoFitUpper(garment = selectedUpper, keypoints = bodyKeypoints) {
    setUpperTransform(fitUpperGarmentToBody(keypoints, garment))
  }

  function autoFitLower(garment = selectedLower, keypoints = bodyKeypoints) {
    setLowerTransform(fitLowerGarmentToBody(keypoints, garment))
  }

  function selectLibraryLayer(layer: TryOnLayer) {
    setActiveLibraryLayer(layer)
    setSelectedInfoLayer(layer)
  }

  function selectUpper(garment: PhotoTryOnGarment) {
    setSelectedUpperId(garment.id)
    setActiveLibraryLayer('upper')
    setSelectedInfoLayer('upper')
    autoFitUpper(garment)
  }

  function selectLower(garment: PhotoTryOnGarment) {
    setSelectedLowerId(garment.id)
    setActiveLibraryLayer('lower')
    setSelectedInfoLayer('lower')
    autoFitLower(garment)
  }

  function selectActiveSize(size: GarmentSize) {
    if (activeLibraryLayer === 'upper') {
      setSelectedUpperSize(size)
      setSelectedInfoLayer('upper')
      return
    }

    setSelectedLowerSize(size)
    setSelectedInfoLayer('lower')
  }

  function selectCanvasLayer(layer: TryOnLayer) {
    setSelectedCanvasLayer(layer)
    setSelectedInfoLayer(layer)
  }

  function updateSelectedCanvasOpacity(value: number) {
    const nextOpacity = clamp(value, 0.2, 1)

    if (selectedCanvasLayer === 'upper') {
      setUpperTransform((current) => ({
        ...current,
        opacity: nextOpacity,
      }))
      return
    }

    if (selectedCanvasLayer === 'lower') {
      setLowerTransform((current) => ({
        ...current,
        opacity: nextOpacity,
      }))
    }
  }

  function updateKeypoint(name: BodyKeypointName, event: KonvaEventObject<DragEvent>) {
    const nextKeypoints = {
      ...bodyKeypoints,
      [name]: {
        x: clamp(event.target.x(), 0, PHOTO_TRY_ON_CANVAS_SIZE.width),
        y: clamp(event.target.y(), 0, PHOTO_TRY_ON_CANVAS_SIZE.height),
      },
    }
    setBodyKeypoints(nextKeypoints)
    setUpperTransform(fitUpperGarmentToBody(nextKeypoints, selectedUpper))
    setLowerTransform(fitLowerGarmentToBody(nextKeypoints, selectedLower))
  }

  return (
    <section className="photo-tryon" id="photo-try-on" aria-labelledby="photo-tryon-heading">
      <div className="tryon-section-heading photo-tryon__heading">
        <p className="section-label">2D photo try-on</p>
        <h2 id="photo-tryon-heading" className="section-title">
          Upload a full-body photo and fit garments manually
        </h2>
        <p className="section-copy">
          This mode uses adjustable body landmarks and simple 2D garment transforms, ready for
          future pose detection and background removal.
        </p>
      </div>

      <div className="photo-tryon__workspace">
        <aside className="photo-tryon__left">
          <section className="photo-panel photo-upload-panel">
            <div className="photo-panel__heading">
              <p className="fit-panel__eyebrow">User photo</p>
              <h3>Full-body upload</h3>
            </div>
            <label className="photo-upload">
              <input type="file" accept="image/*" onChange={handlePhotoUpload} />
              <span>{photoUrl ? 'Replace photo' : 'Upload full-body photo'}</span>
              <small>{photoName || 'Local preview only. No backend upload.'}</small>
            </label>
            <div className="photo-toggle-row">
              <label>
                <input
                  type="checkbox"
                  checked={showBodyPoints}
                  onChange={(event) => setShowBodyPoints(event.target.checked)}
                />
                Show body points
              </label>
              <button type="button" onClick={resetBodyPoints}>
                Reset body points
              </button>
            </div>
          </section>

          <section className="photo-panel photo-products" aria-label="Photo try-on garments">
            <div className="photo-panel__heading">
              <p className="fit-panel__eyebrow">Garment library</p>
              <h3>Choose outfit layers</h3>
            </div>
            <div className="photo-category-tabs" role="group" aria-label="Garment category">
              {(['upper', 'lower'] as TryOnLayer[]).map((layer) => (
                <button
                  key={layer}
                  type="button"
                  className={
                    activeLibraryLayer === layer
                      ? 'photo-category-tab photo-category-tab--active'
                      : 'photo-category-tab'
                  }
                  onClick={() => selectLibraryLayer(layer)}
                  aria-pressed={activeLibraryLayer === layer}
                >
                  {garmentLayerLabels[layer]}
                </button>
              ))}
            </div>
            <ProductRail
              title={garmentLayerLabels[activeLibraryLayer]}
              garments={activeGarments}
              selectedId={activeSelectedId}
              selectedSize={activeSelectedSize}
              onSelect={activeLibraryLayer === 'upper' ? selectUpper : selectLower}
              onSizeSelect={selectActiveSize}
            />
          </section>
        </aside>

        <div className="photo-canvas-shell">
          <div className="photo-canvas-shell__topline">
            <div>
              <p className="fit-panel__eyebrow">Layered canvas</p>
              <h3>2D fitting editor</h3>
            </div>
            <span>{photoUrl ? 'Photo loaded' : 'Waiting for photo'}</span>
          </div>

          <div ref={canvasRef} className="photo-canvas" aria-label="2D photo try-on canvas">
            <Stage
              width={PHOTO_TRY_ON_CANVAS_SIZE.width * stageScale}
              height={PHOTO_TRY_ON_CANVAS_SIZE.height * stageScale}
              scaleX={stageScale}
              scaleY={stageScale}
              className="photo-canvas__stage"
            >
              <Layer>
                <Rect
                  x={0}
                  y={0}
                  width={PHOTO_TRY_ON_CANVAS_SIZE.width}
                  height={PHOTO_TRY_ON_CANVAS_SIZE.height}
                  fill="#f1eadf"
                />
                {photoResource.image ? (
                  <KonvaImage
                    image={photoResource.image}
                    x={photoRect.x}
                    y={photoRect.y}
                    width={photoRect.width}
                    height={photoRect.height}
                  />
                ) : (
                  <Group>
                    <Rect
                      x={76}
                      y={68}
                      width={408}
                      height={620}
                      cornerRadius={28}
                      fill="#fffaf2"
                      stroke="rgba(58, 47, 38, 0.16)"
                      dash={[10, 10]}
                    />
                    <Text
                      x={126}
                      y={318}
                      width={308}
                      align="center"
                      text="Upload a full-body photo to begin"
                      fill="#2b241f"
                      fontFamily="Roboto"
                      fontSize={20}
                      fontStyle="700"
                    />
                    <Text
                      x={136}
                      y={354}
                      width={288}
                      align="center"
                      text="Your photo stays in the browser as a temporary preview."
                      fill="rgba(43, 36, 31, 0.58)"
                      fontFamily="Roboto"
                      fontSize={13}
                      lineHeight={1.45}
                    />
                  </Group>
                )}
              </Layer>

              <Layer>
                {photoUrl
                  ? renderGarmentImage(
                      selectedLower,
                      lowerImage.image,
                      lowerTransform,
                      setLowerTransform,
                      () => selectCanvasLayer('lower'),
                    )
                  : null}
              </Layer>
              <Layer>
                {photoUrl
                  ? renderGarmentImage(
                      selectedUpper,
                      upperImage.image,
                      upperTransform,
                      setUpperTransform,
                      () => selectCanvasLayer('upper'),
                    )
                  : null}
              </Layer>

              <Layer>
                {showBodyPoints && photoUrl
                  ? bodyGuideLines.map((line) => (
                      <Line
                        key={line.join('-')}
                        points={line.flatMap((keypoint) => [
                          bodyKeypoints[keypoint].x,
                          bodyKeypoints[keypoint].y,
                        ])}
                        stroke="rgba(124, 45, 18, 0.56)"
                        strokeWidth={1.5}
                        dash={[8, 8]}
                        lineCap="round"
                        lineJoin="round"
                      />
                    ))
                  : null}

                {showBodyPoints && photoUrl
                  ? (Object.keys(bodyKeypoints) as BodyKeypointName[]).map((name) => (
                      <Group
                        key={name}
                        x={bodyKeypoints[name].x}
                        y={bodyKeypoints[name].y}
                        draggable
                        onDragMove={(event) => updateKeypoint(name, event)}
                      >
                        <Circle
                          radius={8}
                          fill="#7c2d12"
                          stroke="#fffefd"
                          strokeWidth={3}
                          shadowColor="rgba(28, 25, 23, 0.28)"
                          shadowBlur={10}
                          shadowOffsetY={4}
                        />
                        <Text
                          x={12}
                          y={-7}
                          text={keypointLabels[name]}
                          fill="#7c2d12"
                          fontFamily="Roboto"
                          fontSize={10}
                          fontStyle="700"
                        />
                      </Group>
                    ))
                  : null}
              </Layer>
            </Stage>
          </div>
          {selectedCanvasGarment ? (
            <div className="photo-opacity-bar">
              <div className="photo-opacity-bar__heading">
                <span>{selectedCanvasGarment.name}</span>
                <output htmlFor="photo-opacity-slider">
                  {Math.round(selectedCanvasOpacity * 100)}%
                </output>
              </div>
              <input
                id="photo-opacity-slider"
                type="range"
                min="0.2"
                max="1"
                step="0.01"
                value={selectedCanvasOpacity}
                onChange={(event) =>
                  updateSelectedCanvasOpacity(Number(event.target.value))
                }
                aria-label={`${selectedCanvasGarment.name} opacity`}
              />
            </div>
          ) : null}
        </div>

        <ProductInfoCard garment={selectedInfoGarment} selectedSize={selectedInfoSize} />
      </div>
    </section>
  )
}
