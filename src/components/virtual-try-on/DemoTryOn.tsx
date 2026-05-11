import {
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
} from 'react'
import {
  fitProducts,
  type FitProduct,
  type ProductRegion,
} from '../../data/virtualTryOn'
import { useLanguage } from '../../i18n/useLanguage'

type MeasurementKey =
  | 'height'
  | 'shoulders'
  | 'bust'
  | 'waist'
  | 'hips'
  | 'inseam'

type DragTarget = MeasurementKey | 'lowerLength'

type Measurements = Record<MeasurementKey, number>

type MeasurementControl = {
  key: MeasurementKey
  min: number
  max: number
}

type BodyLayout = {
  headCx: number
  headCy: number
  headRx: number
  headRy: number
  neckTop: number
  neckBottom: number
  shoulderY: number
  bustY: number
  waistY: number
  hipY: number
  hemY: number
  lowerHemY: number
  shoulderHalf: number
  bustHalf: number
  waistHalf: number
  hipHalf: number
  ankleHalf: number
  heightHandleY: number
}

const measurementControls: MeasurementControl[] = [
  { key: 'height', min: 150, max: 185 },
  { key: 'shoulders', min: 34, max: 48 },
  { key: 'bust', min: 76, max: 112 },
  { key: 'waist', min: 58, max: 98 },
  { key: 'hips', min: 82, max: 122 },
  { key: 'inseam', min: 68, max: 92 },
]

const defaultMeasurements: Measurements = {
  height: 168,
  shoulders: 40,
  bust: 88,
  waist: 70,
  hips: 94,
  inseam: 78,
}

const initialUpper = fitProducts.find((product) => product.region === 'upper')!
const initialLower = fitProducts.find((product) => product.region === 'lower')!

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

function firstAvailableColor(product: FitProduct) {
  return product.colors.find((color) => color.stock === 'in-stock') ?? product.colors[0]
}

function rangeFor(key: MeasurementKey) {
  return measurementControls.find((control) => control.key === key)!
}

function deriveBody(measurements: Measurements, lowerLength: number, lowerProduct: FitProduct): BodyLayout {
  const heightDelta = measurements.height - defaultMeasurements.height
  const shoulderY = 150 - heightDelta * 0.22
  const bustY = shoulderY + 58
  const waistY = shoulderY + 136 + heightDelta * 0.2
  const hipY = waistY + 58 + heightDelta * 0.1
  const hemY = clamp(hipY + measurements.inseam * 2.75, 510, 596)
  const lowerHemY =
    lowerProduct.garment === 'trousers'
      ? clamp(hipY + lowerLength * 2.52, hipY + 210, 596)
      : clamp(waistY + 38 + lowerLength * 2.05, hipY + 95, hemY - 18)

  return {
    headCx: 160,
    headCy: shoulderY - 72,
    headRx: clamp(30 + heightDelta * 0.035, 28, 33),
    headRy: clamp(36 + heightDelta * 0.04, 34, 39),
    neckTop: shoulderY - 33,
    neckBottom: shoulderY + 8,
    shoulderY,
    bustY,
    waistY,
    hipY,
    hemY,
    lowerHemY,
    shoulderHalf: clamp(measurements.shoulders * 1.58, 54, 78),
    bustHalf: clamp(measurements.bust * 0.76, 55, 86),
    waistHalf: clamp(measurements.waist * 0.82, 46, 82),
    hipHalf: clamp(measurements.hips * 0.82, 64, 100),
    ankleHalf: clamp(24 + (measurements.hips - 94) * 0.08, 22, 28),
    heightHandleY: 58 - (measurements.height - 150) * 1.15,
  }
}

function recommendedSize(region: ProductRegion, measurements: Measurements) {
  if (region === 'upper') {
    if (measurements.bust <= 84 && measurements.shoulders <= 37) return 'XS'
    if (measurements.bust <= 90 && measurements.shoulders <= 39) return 'S'
    if (measurements.bust <= 98 && measurements.shoulders <= 42) return 'M'
    if (measurements.bust <= 106 && measurements.shoulders <= 45) return 'L'
    return 'XL'
  }

  if (measurements.waist <= 66 && measurements.hips <= 90) return 'XS'
  if (measurements.waist <= 72 && measurements.hips <= 96) return 'S'
  if (measurements.waist <= 80 && measurements.hips <= 104) return 'M'
  if (measurements.waist <= 90 && measurements.hips <= 114) return 'L'
  return 'XL'
}

function productById(id: string) {
  return fitProducts.find((product) => product.id === id) ?? fitProducts[0]
}

export function DemoTryOn() {
  const { m } = useLanguage()
  const t = m.virtualTryOn.demo
  const svgRef = useRef<SVGSVGElement | null>(null)
  const [measurements, setMeasurements] = useState<Measurements>(defaultMeasurements)
  const [activeRegion, setActiveRegion] = useState<ProductRegion>('upper')
  const [selectedProductIds, setSelectedProductIds] = useState({
    upper: initialUpper.id,
    lower: initialLower.id,
  })
  const [selectedColorIds, setSelectedColorIds] = useState({
    upper: firstAvailableColor(initialUpper).id,
    lower: firstAvailableColor(initialLower).id,
  })
  const [lowerLength, setLowerLength] = useState(initialLower.defaultLength)
  const [dragTarget, setDragTarget] = useState<DragTarget | null>(null)
  const [cartState, setCartState] = useState<'added' | 'checkout' | ''>('')

  const selectedUpper = productById(selectedProductIds.upper)
  const selectedLower = productById(selectedProductIds.lower)
  const activeProduct = activeRegion === 'upper' ? selectedUpper : selectedLower
  const productCopy = (product: FitProduct) => t.products[product.id]
  const colorName = (product: FitProduct, colorId: string) =>
    productCopy(product).colors[colorId] ?? colorId
  const selectedUpperCopy = productCopy(selectedUpper)
  const selectedLowerCopy = productCopy(selectedLower)
  const activeProductCopy = productCopy(activeProduct)
  const activeColorId = selectedColorIds[activeRegion]
  const upperColor =
    selectedUpper.colors.find((color) => color.id === selectedColorIds.upper) ??
    firstAvailableColor(selectedUpper)
  const lowerColor =
    selectedLower.colors.find((color) => color.id === selectedColorIds.lower) ??
    firstAvailableColor(selectedLower)
  const upperColorName = colorName(selectedUpper, upperColor.id)
  const lowerColorName = colorName(selectedLower, lowerColor.id)
  const activeProducts = fitProducts.filter((product) => product.region === activeRegion)
  const lowerRange = selectedLower.lengthRange ?? [86, 108]
  const layout = deriveBody(measurements, lowerLength, selectedLower)
  const cartMessage =
    cartState === 'added'
      ? `${t.added.prefix} ${selectedUpperCopy.name} ${t.added.colorWord} ${upperColorName} ${t.added.and} ${selectedLowerCopy.name} ${t.added.colorWord} ${lowerColorName}. ${t.added.suffix}`
      : cartState === 'checkout'
        ? t.checkoutMessage
        : ''

  const upperPath = `
    M ${160 - layout.shoulderHalf - (selectedUpper.garment === 'blazer' ? 14 : 4)} ${layout.shoulderY + 6}
    C ${160 - layout.bustHalf - 10} ${layout.bustY - 12}, ${160 - layout.waistHalf - 8} ${layout.waistY - 12}, ${160 - layout.waistHalf - 8} ${layout.waistY + 42}
    Q 160 ${layout.waistY + 56} ${160 + layout.waistHalf + 8} ${layout.waistY + 42}
    C ${160 + layout.waistHalf + 8} ${layout.waistY - 12}, ${160 + layout.bustHalf + 10} ${layout.bustY - 12}, ${160 + layout.shoulderHalf + (selectedUpper.garment === 'blazer' ? 14 : 4)} ${layout.shoulderY + 6}
    Q 160 ${layout.shoulderY - 14} ${160 - layout.shoulderHalf - (selectedUpper.garment === 'blazer' ? 14 : 4)} ${layout.shoulderY + 6}
    Z
  `

  const skirtPath = `
    M ${160 - layout.waistHalf - 10} ${layout.waistY + 40}
    C ${160 - layout.hipHalf - 8} ${layout.hipY - 5}, ${160 - layout.hipHalf - 2} ${layout.hipY + 38}, ${160 - layout.hipHalf * 0.78} ${layout.lowerHemY}
    L ${160 + layout.hipHalf * 0.78} ${layout.lowerHemY}
    C ${160 + layout.hipHalf + 2} ${layout.hipY + 38}, ${160 + layout.hipHalf + 8} ${layout.hipY - 5}, ${160 + layout.waistHalf + 10} ${layout.waistY + 40}
    Z
  `

  const leftTrouserPath = `
    M ${160 - layout.waistHalf - 4} ${layout.waistY + 42}
    C ${160 - layout.hipHalf - 8} ${layout.hipY}, ${160 - layout.hipHalf * 0.7} ${layout.hipY + 76}, ${160 - layout.ankleHalf - 14} ${layout.lowerHemY}
    L ${160 - 8} ${layout.lowerHemY}
    C ${160 - 8} ${layout.hipY + 112}, ${160 - 12} ${layout.hipY + 42}, ${160 - layout.waistHalf * 0.2} ${layout.waistY + 42}
    Z
  `

  const rightTrouserPath = `
    M ${160 + layout.waistHalf + 4} ${layout.waistY + 42}
    C ${160 + layout.hipHalf + 8} ${layout.hipY}, ${160 + layout.hipHalf * 0.7} ${layout.hipY + 76}, ${160 + layout.ankleHalf + 14} ${layout.lowerHemY}
    L ${160 + 8} ${layout.lowerHemY}
    C ${160 + 8} ${layout.hipY + 112}, ${160 + 12} ${layout.hipY + 42}, ${160 + layout.waistHalf * 0.2} ${layout.waistY + 42}
    Z
  `

  function setMeasurement(key: MeasurementKey, value: number) {
    const control = rangeFor(key)
    setMeasurements((current) => ({
      ...current,
      [key]: Math.round(clamp(value, control.min, control.max)),
    }))
  }

  function selectProduct(product: FitProduct) {
    const nextColor = firstAvailableColor(product)
    setCartState('')
    setSelectedProductIds((current) => ({
      ...current,
      [product.region]: product.id,
    }))
    setSelectedColorIds((current) => ({
      ...current,
      [product.region]: nextColor.id,
    }))
    if (product.region === 'lower') {
      setLowerLength(product.defaultLength)
    }
  }

  function selectColor(colorId: string) {
    setCartState('')
    setSelectedColorIds((current) => ({
      ...current,
      [activeRegion]: colorId,
    }))
  }

  function svgPoint(event: PointerEvent<SVGElement>) {
    const rect = svgRef.current?.getBoundingClientRect()
    if (!rect) return null
    return {
      x: ((event.clientX - rect.left) / rect.width) * 320,
      y: ((event.clientY - rect.top) / rect.height) * 620,
    }
  }

  function updateFromPointer(target: DragTarget, event: PointerEvent<SVGElement>) {
    const point = svgPoint(event)
    if (!point) return
    if (target === 'height') {
      setMeasurement('height', 150 + (58 - point.y) / 1.15)
      return
    }
    if (target === 'shoulders') {
      setMeasurement('shoulders', ((point.x - 160) * 2) / 1.58)
      return
    }
    if (target === 'bust') {
      setMeasurement('bust', ((point.x - 160) * 2) / 0.76)
      return
    }
    if (target === 'waist') {
      setMeasurement('waist', ((point.x - 160) * 2) / 0.82)
      return
    }
    if (target === 'hips') {
      setMeasurement('hips', ((point.x - 160) * 2) / 0.82)
      return
    }
    if (target === 'inseam') {
      setMeasurement('inseam', (point.y - layout.hipY) / 2.75)
      return
    }

    const [min, max] = lowerRange
    const startY = selectedLower.garment === 'trousers' ? layout.hipY : layout.waistY + 38
    const divisor = selectedLower.garment === 'trousers' ? 2.52 : 2.05
    setLowerLength(Math.round(clamp((point.y - startY) / divisor, min, max)))
  }

  function startDrag(target: DragTarget, event: PointerEvent<SVGElement>) {
    setDragTarget(target)
    event.currentTarget.setPointerCapture(event.pointerId)
    updateFromPointer(target, event)
  }

  function stopDrag() {
    setDragTarget(null)
  }

  function onAvatarKeyDown(region: ProductRegion, event: KeyboardEvent<SVGGElement>) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      setActiveRegion(region)
    }
  }

  function addToCart() {
    setCartState('added')
  }

  return (
    <section className="demo-tryon fit-studio" id="demo" aria-labelledby="demo-heading">
      <div className="tryon-section-heading">
        <p className="section-label">{t.label}</p>
        <h2 id="demo-heading" className="section-title">
          {t.heading}
        </h2>
        <p className="section-copy">{t.copy}</p>
      </div>

      <div className="fit-studio__panel">
        <div className="fit-studio__avatar-card">
          <div className="fit-studio__toolbar" aria-label={t.chooseBodyAreaAria}>
            <button
              type="button"
              className={activeRegion === 'upper' ? 'fit-region fit-region--active' : 'fit-region'}
              onClick={() => setActiveRegion('upper')}
            >
              {t.upperRegion}
            </button>
            <button
              type="button"
              className={activeRegion === 'lower' ? 'fit-region fit-region--active' : 'fit-region'}
              onClick={() => setActiveRegion('lower')}
            >
              {t.lowerRegion}
            </button>
          </div>

          <svg
            ref={svgRef}
            className="fit-avatar"
            viewBox="0 0 320 620"
            role="img"
            aria-label={t.avatarAria}
            onPointerMove={(event) => {
              if (dragTarget) updateFromPointer(dragTarget, event)
            }}
            onPointerUp={stopDrag}
            onPointerLeave={stopDrag}
          >
            <rect className="fit-avatar__room" x="20" y="18" width="280" height="584" rx="34" />
            <ellipse className="fit-avatar__shadow" cx="160" cy="594" rx="82" ry="14" />
            <path
              className="fit-avatar__arms"
              d={`
                M ${160 - layout.shoulderHalf - 8} ${layout.shoulderY + 10}
                C ${160 - layout.hipHalf - 38} ${layout.hipY + 30}, ${160 - layout.hipHalf - 18} ${layout.hipY + 122}, ${160 - layout.ankleHalf - 28} ${layout.hemY - 10}
                M ${160 + layout.shoulderHalf + 8} ${layout.shoulderY + 10}
                C ${160 + layout.hipHalf + 38} ${layout.hipY + 30}, ${160 + layout.hipHalf + 18} ${layout.hipY + 122}, ${160 + layout.ankleHalf + 28} ${layout.hemY - 10}
              `}
            />
            <ellipse
              className="fit-avatar__skin"
              cx={layout.headCx}
              cy={layout.headCy}
              rx={layout.headRx}
              ry={layout.headRy}
            />
            <path
              className="fit-avatar__neck"
              d={`
                M ${160 - 17} ${layout.neckTop}
                L ${160 + 17} ${layout.neckTop}
                L ${160 + 17} ${layout.neckBottom}
                Q 160 ${layout.neckBottom + 8} ${160 - 17} ${layout.neckBottom}
                Z
              `}
            />
            <path
              className="fit-avatar__body"
              d={`
                M ${160 - layout.shoulderHalf} ${layout.shoulderY}
                C ${160 - layout.bustHalf} ${layout.bustY}, ${160 - layout.waistHalf} ${layout.waistY}, ${160 - layout.hipHalf} ${layout.hipY}
                C ${160 - layout.hipHalf * 0.58} ${layout.hipY + 90}, ${160 - layout.ankleHalf} ${layout.hemY - 22}, ${160 - layout.ankleHalf} ${layout.hemY}
                L ${160 + layout.ankleHalf} ${layout.hemY}
                C ${160 + layout.ankleHalf} ${layout.hemY - 22}, ${160 + layout.hipHalf * 0.58} ${layout.hipY + 90}, ${160 + layout.hipHalf} ${layout.hipY}
                C ${160 + layout.waistHalf} ${layout.waistY}, ${160 + layout.bustHalf} ${layout.bustY}, ${160 + layout.shoulderHalf} ${layout.shoulderY}
                Q 160 ${layout.shoulderY - 18} ${160 - layout.shoulderHalf} ${layout.shoulderY}
                Z
              `}
            />
            <g
              className={`fit-avatar__zone${activeRegion === 'upper' ? ' fit-avatar__zone--active' : ''}`}
              role="button"
              tabIndex={0}
              aria-label={t.upperZoneAria}
              onClick={() => setActiveRegion('upper')}
              onKeyDown={(event) => onAvatarKeyDown('upper', event)}
            >
              <path d={`M ${160 - layout.shoulderHalf - 20} ${layout.shoulderY - 10} H ${160 + layout.shoulderHalf + 20} V ${layout.waistY + 48} H ${160 - layout.shoulderHalf - 20} Z`} />
            </g>
            <g
              className={`fit-avatar__zone${activeRegion === 'lower' ? ' fit-avatar__zone--active' : ''}`}
              role="button"
              tabIndex={0}
              aria-label={t.lowerZoneAria}
              onClick={() => setActiveRegion('lower')}
              onKeyDown={(event) => onAvatarKeyDown('lower', event)}
            >
              <path d={`M ${160 - layout.hipHalf - 24} ${layout.waistY + 36} H ${160 + layout.hipHalf + 24} V ${layout.hemY + 8} H ${160 - layout.hipHalf - 24} Z`} />
            </g>
            {selectedLower.garment === 'trousers' ? (
              <>
                <path className="fit-avatar__garment fit-avatar__garment--lower" d={leftTrouserPath} fill={lowerColor.swatch} />
                <path className="fit-avatar__garment fit-avatar__garment--lower" d={rightTrouserPath} fill={lowerColor.swatch} />
                <path className="fit-avatar__crease" d={`M 160 ${layout.waistY + 58} V ${layout.lowerHemY - 10}`} />
              </>
            ) : (
              <path className="fit-avatar__garment fit-avatar__garment--lower" d={skirtPath} fill={lowerColor.swatch} />
            )}
            <path className="fit-avatar__garment fit-avatar__garment--upper" d={upperPath} fill={upperColor.swatch} />
            <path
              className="fit-avatar__collar"
              d={`
                M ${160 - 42} ${layout.shoulderY + 4}
                L 160 ${layout.shoulderY + 54}
                L ${160 + 42} ${layout.shoulderY + 4}
              `}
            />
            {selectedUpper.garment === 'blazer' ? (
              <>
                <path className="fit-avatar__lapel" d={`M ${160 - 52} ${layout.shoulderY + 10} L ${160 - 10} ${layout.waistY + 42} L ${160 - 2} ${layout.shoulderY + 56} Z`} />
                <path className="fit-avatar__lapel" d={`M ${160 + 52} ${layout.shoulderY + 10} L ${160 + 10} ${layout.waistY + 42} L ${160 + 2} ${layout.shoulderY + 56} Z`} />
              </>
            ) : null}
            <g className="fit-avatar__lines">
              <line x1={160 - layout.shoulderHalf} y1={layout.shoulderY} x2={160 + layout.shoulderHalf} y2={layout.shoulderY} />
              <line x1={160 - layout.waistHalf} y1={layout.waistY} x2={160 + layout.waistHalf} y2={layout.waistY} />
              <line x1={160 - layout.hipHalf} y1={layout.hipY} x2={160 + layout.hipHalf} y2={layout.hipY} />
            </g>
            {[
              { key: 'height' as DragTarget, x: 108, y: layout.heightHandleY, label: t.handles.height },
              { key: 'shoulders' as DragTarget, x: 160 + layout.shoulderHalf, y: layout.shoulderY, label: t.handles.shoulders },
              { key: 'bust' as DragTarget, x: 160 + layout.bustHalf, y: layout.bustY, label: t.handles.bust },
              { key: 'waist' as DragTarget, x: 160 + layout.waistHalf, y: layout.waistY, label: t.handles.waist },
              { key: 'hips' as DragTarget, x: 160 + layout.hipHalf, y: layout.hipY, label: t.handles.hips },
              { key: 'inseam' as DragTarget, x: 160 + layout.ankleHalf + 28, y: layout.hemY, label: t.handles.inseam },
              {
                key: 'lowerLength' as DragTarget,
                x: 160 - layout.hipHalf - 26,
                y: layout.lowerHemY,
                label:
                  selectedLower.garment === 'trousers'
                    ? t.handles.pantHem
                    : t.handles.skirtHem,
              },
            ].map((handle) => (
              <g
                key={handle.key}
                className="fit-avatar__handle"
                role="slider"
                aria-label={handle.label}
                tabIndex={-1}
                onPointerDown={(event) => startDrag(handle.key, event)}
              >
                <line x1={handle.x} y1={handle.y} x2={handle.x + 20} y2={handle.y} />
                <circle cx={handle.x} cy={handle.y} r="8" />
                <text x={handle.x + 24} y={handle.y + 4}>{handle.label}</text>
              </g>
            ))}
          </svg>
        </div>

        <div className="fit-studio__controls">
          <div className="fit-panel">
            <div>
              <p className="fit-panel__eyebrow">{t.bodyProfileLabel}</p>
              <h3>{t.measurementsHeading}</h3>
            </div>
            <div className="fit-measurements">
              {measurementControls.map((control) => (
                <label key={control.key} className="fit-measurement">
                  <span>
                    {t.measurements[control.key]}
                    <strong>
                      {measurements[control.key]} {t.cm}
                    </strong>
                  </span>
                  <input
                    type="range"
                    min={control.min}
                    max={control.max}
                    value={measurements[control.key]}
                    onChange={(event) => setMeasurement(control.key, Number(event.target.value))}
                  />
                  <input
                    type="number"
                    min={control.min}
                    max={control.max}
                    value={measurements[control.key]}
                    onChange={(event) => setMeasurement(control.key, Number(event.target.value))}
                    aria-label={`${t.measurements[control.key]} ${t.inCentimeters}`}
                  />
                </label>
              ))}
            </div>
            <label className="fit-measurement fit-measurement--length">
              <span>
                {selectedLower.garment === 'trousers' ? t.pantsLength : t.skirtLength}
                <strong>
                  {lowerLength} {t.cm}
                </strong>
              </span>
              <input
                type="range"
                min={lowerRange[0]}
                max={lowerRange[1]}
                value={lowerLength}
                onChange={(event) => setLowerLength(Number(event.target.value))}
              />
              <input
                type="number"
                min={lowerRange[0]}
                max={lowerRange[1]}
                value={lowerLength}
                onChange={(event) =>
                  setLowerLength(
                    Math.round(clamp(Number(event.target.value), lowerRange[0], lowerRange[1])),
                  )
                }
                aria-label={t.garmentLengthAria}
              />
            </label>
          </div>

          <div className="fit-panel">
            <div className="fit-panel__header">
              <div>
                <p className="fit-panel__eyebrow">{t.selectedAreaLabel}</p>
                <h3>{activeRegion === 'upper' ? t.upperAreaHeading : t.lowerAreaHeading}</h3>
              </div>
              <span className="fit-size">
                {t.suggestedSize} {recommendedSize(activeRegion, measurements)}
              </span>
            </div>
            <div className="fit-product-grid">
              {activeProducts.map((product) => (
                <button
                  key={product.id}
                  type="button"
                  className={
                    activeProduct.id === product.id
                      ? 'fit-product-card fit-product-card--active'
                      : 'fit-product-card'
                  }
                  onClick={() => selectProduct(product)}
                  aria-pressed={activeProduct.id === product.id}
                >
                  <img src={product.image} alt="" loading="lazy" decoding="async" />
                  <span>
                    <strong>{productCopy(product).name}</strong>
                    <small>{productCopy(product).category}</small>
                    <em>{product.price}</em>
                  </span>
                </button>
              ))}
            </div>

            <div
              className="fit-colors"
              aria-label={`${activeProductCopy.name} ${t.colorsAriaSuffix}`}
            >
              {activeProduct.colors.map((color) => {
                const isOut = color.stock === 'out-of-stock'
                const isActive = color.id === activeColorId
                const colorLabel = colorName(activeProduct, color.id)
                return (
                  <button
                    key={color.id}
                    type="button"
                    className={`fit-color${isActive ? ' fit-color--active' : ''}${isOut ? ' fit-color--out' : ''}`}
                    onClick={() => {
                      if (!isOut) selectColor(color.id)
                    }}
                    disabled={isOut}
                    aria-label={
                      isOut
                        ? `${colorLabel} ${t.stock.unavailableAria}`
                        : `${colorLabel} ${t.stock.availableAria}`
                    }
                  >
                    <span style={{ backgroundColor: color.swatch }} aria-hidden="true" />
                    <strong>{colorLabel}</strong>
                    <small>{isOut ? t.stock.unavailable : t.stock.available}</small>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="fit-summary">
            <div>
              <p className="fit-panel__eyebrow">{t.currentOutfit}</p>
              <strong>{selectedUpperCopy.name}</strong>
              <span>
                {upperColorName} / {t.upperSize} {recommendedSize('upper', measurements)}
              </span>
              <strong>{selectedLowerCopy.name}</strong>
              <span>
                {lowerColorName} / {t.lowerSize} {recommendedSize('lower', measurements)}
              </span>
            </div>
            <div className="fit-summary__actions">
              <button type="button" className="btn btn--ink" onClick={addToCart}>
                {t.addToCart}
              </button>
              <button
                type="button"
                className="btn btn--outline"
                onClick={() => setCartState('checkout')}
              >
                {t.checkout}
              </button>
            </div>
            <p className="demo-tryon__disclaimer" aria-live="polite">
              {cartMessage || t.disclaimer}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
