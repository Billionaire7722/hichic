import {
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
} from 'react'
import {
  fitProducts,
  type FitProduct,
  type ProductRegion,
} from '../../data/virtualTryOn'
import type { VirtualTryOnMessages } from '../../i18n/virtualTryOnTranslations'
import { useLanguage } from '../../i18n/useLanguage'

import realisticFace from '../../assets/realistic-face.png'

type DemoCopy = VirtualTryOnMessages['demo']
type ProductCopy = DemoCopy['products'][string]

type MeasurementKey =
  | 'height'
  | 'weight'
  | 'shoulders'
  | 'bust'
  | 'waist'
  | 'hips'
  | 'inseam'

type AdjustableMeasurementKey = Exclude<MeasurementKey, 'weight'>
type DragTarget = AdjustableMeasurementKey | 'lowerLength'
type ActiveMeasure = DragTarget | MeasurementKey | null
type ProductCategory = FitProduct['garment']
type ViewMode = 'front' | 'side' | 'back'

type Measurements = Record<MeasurementKey, number>

type MeasurementControl = {
  key: MeasurementKey
  min: number
  max: number
  unit: 'cm' | 'kg'
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

type ProductSelection = {
  upper: string
  lower: string
  full: string | null
}

type ColorSelection = Record<ProductRegion, string>

type FitMetric = {
  label: string
  status: string
  score: number
}

type FitAnalysis = {
  recommended: string
  score: number
  metrics: FitMetric[]
  notes: string[]
}

const measurementControls: MeasurementControl[] = [
  { key: 'height', min: 150, max: 185, unit: 'cm' },
  { key: 'weight', min: 42, max: 96, unit: 'kg' },
  { key: 'shoulders', min: 34, max: 48, unit: 'cm' },
  { key: 'bust', min: 76, max: 112, unit: 'cm' },
  { key: 'waist', min: 58, max: 98, unit: 'cm' },
  { key: 'hips', min: 82, max: 122, unit: 'cm' },
  { key: 'inseam', min: 68, max: 92, unit: 'cm' },
]

const measurementGroups: Array<{ title: string; controls: MeasurementKey[] }> = [
  { title: 'Body profile', controls: ['height', 'weight'] },
  { title: 'Upper body', controls: ['shoulders', 'bust', 'waist'] },
  { title: 'Lower body', controls: ['hips', 'inseam'] },
]

const productCategories: Array<{ key: ProductCategory; label: string }> = [
  { key: 'blazer', label: 'Blazer' },
  { key: 'shirt', label: 'Shirt' },
  { key: 'trousers', label: 'Trousers' },
  { key: 'skirt', label: 'Skirt' },
  { key: 'dress', label: 'Dress' },
]

const viewModes: Array<{ key: ViewMode; label: string }> = [
  { key: 'front', label: 'Front' },
  { key: 'side', label: 'Side' },
  { key: 'back', label: 'Back' },
]

const defaultMeasurements: Measurements = {
  height: 168,
  weight: 58,
  shoulders: 40,
  bust: 88,
  waist: 70,
  hips: 94,
  inseam: 78,
}

const initialUpper = fitProducts.find((product) => product.region === 'upper')!
const initialLower = fitProducts.find((product) => product.region === 'lower')!
const initialFull = fitProducts.find((product) => product.region === 'full')!

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

function firstAvailableColor(product: FitProduct) {
  return product.colors.find((color) => color.stock === 'in-stock') ?? product.colors[0]
}

function rangeFor(key: MeasurementKey) {
  return measurementControls.find((control) => control.key === key)!
}

function deriveBody(measurements: Measurements, length: number, lengthProduct: FitProduct): BodyLayout {
  const heightDelta = measurements.height - defaultMeasurements.height
  const shoulderY = 150 - heightDelta * 0.22
  const bustY = shoulderY + 58
  const waistY = shoulderY + 136 + heightDelta * 0.2
  const hipY = waistY + 58 + heightDelta * 0.1
  const hemY = clamp(hipY + measurements.inseam * 2.75, 510, 596)
  const lowerHemY =
    lengthProduct.garment === 'trousers'
      ? clamp(hipY + length * 2.52, hipY + 210, 596)
      : clamp(waistY + 38 + length * 2.05, hipY + 95, hemY - 18)

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

function recommendedSize(region: ProductRegion, measurements: Measurements): string {
  if (region === 'full') {
    const sizes = ['XS', 'S', 'M', 'L', 'XL']
    const upper = recommendedSize('upper', measurements)
    const lower = recommendedSize('lower', measurements)
    return sizes[Math.max(sizes.indexOf(upper), sizes.indexOf(lower))]
  }

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

function productDescription(product: FitProduct) {
  const descriptions: Record<string, string> = {
    'silk-blouse': 'Fluid charmeuse with a polished collar and easy drape for long office days.',
    'soft-blazer': 'Soft shoulder tailoring designed to sharpen a blouse or dress without bulk.',
    'crepe-shell': 'A clean sleeveless layer for suits, desk days, and after-work plans.',
    'tailored-trousers': 'Straight-leg tailoring with a refined rise and smooth office line.',
    'pencil-skirt': 'High-rise structure with a narrow silhouette and controlled stretch.',
    'midi-a-line-skirt': 'A softer midi shape that keeps movement polished and comfortable.',
    'executive-sheath-dress': 'A full-look office dress with a precise waist and boardroom finish.',
  }

  return descriptions[product.id] ?? product.category
}

function productBadges(product: FitProduct, isSelected: boolean) {
  const byGarment: Record<ProductCategory, string> = {
    blazer: 'Slim fit',
    shirt: 'Office',
    trousers: 'Straight leg',
    skirt: 'High rise',
    dress: 'Best match',
  }

  return Array.from(
    new Set(
      isSelected
        ? ['Best match', byGarment[product.garment], 'Office']
        : ['Office', byGarment[product.garment]],
    ),
  )
}

function measureLabel(t: DemoCopy, key: MeasurementKey) {
  return t.measurements[key] ?? (key === 'weight' ? 'Weight' : key)
}

function fitStatus(value: number, target: number, tolerance: number) {
  const delta = value - target
  if (delta > tolerance) return 'Relaxed'
  if (delta < -tolerance) return 'Close'
  return 'Balanced'
}

function metricScore(value: number, target: number, spread: number) {
  return Math.round(clamp(100 - Math.abs(value - target) * spread, 72, 98))
}

function createFitAnalysis(
  measurements: Measurements,
  selectedUpperCopy: ProductCopy,
  selectedLowerCopy: ProductCopy,
  selectedFullCopy: ProductCopy | null,
): FitAnalysis {
  const metrics: FitMetric[] = [
    {
      label: 'Shoulder fit',
      status: fitStatus(measurements.shoulders, 40, 2),
      score: metricScore(measurements.shoulders, 40, 4),
    },
    {
      label: 'Bust fit',
      status: fitStatus(measurements.bust, 88, 5),
      score: metricScore(measurements.bust, 88, 1.4),
    },
    {
      label: 'Waist fit',
      status: fitStatus(measurements.waist, 70, 4),
      score: metricScore(measurements.waist, 70, 1.7),
    },
    {
      label: 'Hip fit',
      status: fitStatus(measurements.hips, 94, 5),
      score: metricScore(measurements.hips, 94, 1.3),
    },
  ]
  const score = Math.round(metrics.reduce((total, metric) => total + metric.score, 0) / metrics.length)
  const recommended = selectedFullCopy
    ? recommendedSize('full', measurements)
    : `${recommendedSize('upper', measurements)} / ${recommendedSize('lower', measurements)}`

  return {
    recommended,
    score,
    metrics,
    notes: selectedFullCopy
      ? [
          `${selectedFullCopy.name} works best as a single size ${recommendedSize('full', measurements)} look.`,
          'The waist and hip balance is suitable for a structured office dress.',
        ]
      : [
          `${selectedUpperCopy.name} pairs with ${selectedLowerCopy.name} for a complete office outfit.`,
          'For a cleaner line, keep the blazer slightly relaxed through the shoulder.',
        ],
  }
}

function selectedIdFor(product: FitProduct, selectedProductIds: ProductSelection) {
  return product.region === 'full' ? selectedProductIds.full : selectedProductIds[product.region]
}

type ProductSelectorProps = {
  t: DemoCopy
  activeCategory: ProductCategory
  selectedProductIds: ProductSelection
  selectedColorIds: ColorSelection
  productCopy: (product: FitProduct) => ProductCopy
  colorName: (product: FitProduct, colorId: string) => string
  onCategoryChange: (category: ProductCategory) => void
  onSelectProduct: (product: FitProduct, colorId?: string) => void
  onSelectColor: (product: FitProduct, colorId: string) => void
}

function ProductSelector({
  t,
  activeCategory,
  selectedProductIds,
  selectedColorIds,
  productCopy,
  colorName,
  onCategoryChange,
  onSelectProduct,
  onSelectColor,
}: ProductSelectorProps) {
  const products = fitProducts.filter((product) => product.garment === activeCategory)

  return (
    <aside className="fit-products" aria-label="Product and outfit selector">
      <div className="fit-panel__intro">
        <p className="fit-panel__eyebrow">Product selector</p>
        <h3>Office wardrobe</h3>
      </div>

      <div className="fit-category-tabs" aria-label="Product categories">
        {productCategories.map((category) => (
          <button
            key={category.key}
            type="button"
            className={
              activeCategory === category.key
                ? 'fit-category fit-category--active'
                : 'fit-category'
            }
            onClick={() => onCategoryChange(category.key)}
          >
            <span>{category.label}</span>
            <small>{fitProducts.filter((product) => product.garment === category.key).length}</small>
          </button>
        ))}
      </div>

      <div className="fit-product-list">
        {products.map((product) => {
          const copy = productCopy(product)
          const isSelected = selectedIdFor(product, selectedProductIds) === product.id
          const selectedColorId = selectedColorIds[product.region]

          return (
            <article
              key={product.id}
              className={
                isSelected
                  ? 'fit-product-card fit-product-card--active'
                  : 'fit-product-card'
              }
            >
              <button
                type="button"
                className="fit-product-card__main"
                onClick={() => onSelectProduct(product)}
                aria-pressed={isSelected}
              >
                <span className="fit-product-card__media">
                  <img src={product.image} alt="" loading="lazy" decoding="async" />
                  {isSelected ? <span>Selected</span> : null}
                </span>
                <span className="fit-product-card__body">
                  <span className="fit-product-card__badges">
                    {productBadges(product, isSelected).map((badge) => (
                      <em key={badge}>{badge}</em>
                    ))}
                  </span>
                  <strong>{copy.name}</strong>
                  <small>{productDescription(product)}</small>
                  <b>{product.price}</b>
                </span>
              </button>

              <div className="fit-product-card__swatches" aria-label={`${copy.name} ${t.colorsAriaSuffix}`}>
                {product.colors.map((color) => {
                  const isOut = color.stock === 'out-of-stock'
                  const isActive = isSelected && color.id === selectedColorId
                  const label = colorName(product, color.id)

                  return (
                    <button
                      key={color.id}
                      type="button"
                      className={`fit-swatch${isActive ? ' fit-swatch--active' : ''}`}
                      style={{ backgroundColor: color.swatch }}
                      onClick={() => {
                        if (!isOut) onSelectColor(product, color.id)
                      }}
                      disabled={isOut}
                      aria-label={
                        isOut
                          ? `${label} ${t.stock.unavailableAria}`
                          : `${label} ${t.stock.availableAria}`
                      }
                    />
                  )
                })}
              </div>
            </article>
          )
        })}
      </div>
    </aside>
  )
}

type ViewControlsProps = {
  viewMode: ViewMode
  zoom: number
  onViewChange: (viewMode: ViewMode) => void
  onZoomChange: (zoom: number) => void
}

function ViewControls({ viewMode, zoom, onViewChange, onZoomChange }: ViewControlsProps) {
  return (
    <div className="fit-view-controls">
      <div className="fit-view-segment" aria-label="Preview view">
        {viewModes.map((mode) => (
          <button
            key={mode.key}
            type="button"
            className={viewMode === mode.key ? 'fit-view-btn fit-view-btn--active' : 'fit-view-btn'}
            onClick={() => onViewChange(mode.key)}
            aria-pressed={viewMode === mode.key}
          >
            {mode.label}
          </button>
        ))}
      </div>
      <button type="button" className="fit-view-badge" onClick={() => onViewChange('front')}>
        360 deg
      </button>
      <div className="fit-zoom" aria-label="Preview zoom">
        <button type="button" onClick={() => onZoomChange(clamp(zoom - 0.08, 0.92, 1.16))}>
          -
        </button>
        <span>{Math.round(zoom * 100)}%</span>
        <button type="button" onClick={() => onZoomChange(clamp(zoom + 0.08, 0.92, 1.16))}>
          +
        </button>
      </div>
    </div>
  )
}

type TryOnPreviewProps = {
  viewMode: ViewMode
  zoom: number
  lookTitle: string
  lookMeta: string
  fitScore: number
  onViewChange: (viewMode: ViewMode) => void
  onZoomChange: (zoom: number) => void
  children: ReactNode
}

function TryOnPreview({
  viewMode,
  zoom,
  lookTitle,
  lookMeta,
  fitScore,
  onViewChange,
  onZoomChange,
  children,
}: TryOnPreviewProps) {
  const stageStyle = { '--fit-zoom': zoom } as CSSProperties

  return (
    <section className="fit-preview" aria-label="Virtual fitting preview">
      <div className="fit-preview__topline">
        <div>
          <p className="fit-panel__eyebrow">Studio preview</p>
          <h3>Fitting room</h3>
        </div>
        <ViewControls
          viewMode={viewMode}
          zoom={zoom}
          onViewChange={onViewChange}
          onZoomChange={onZoomChange}
        />
      </div>

      <div className={`fit-preview__stage fit-preview__stage--${viewMode}`} style={stageStyle}>
        <div className="fit-preview__ambient" aria-hidden="true" />
        {children}
        <span className="fit-preview__badge">Live 360</span>
      </div>

      <div className="fit-preview__caption">
        <span>Now fitting</span>
        <strong>{lookTitle}</strong>
        <small>{lookMeta}</small>
        <b>{fitScore}% fit</b>
      </div>
    </section>
  )
}

type MeasurementPanelProps = {
  t: DemoCopy
  measurements: Measurements
  activeMeasure: ActiveMeasure
  lengthLabel: string
  lengthValue: number
  lengthRange: [number, number]
  onSetMeasurement: (key: MeasurementKey, value: number) => void
  onSetActiveMeasure: (key: ActiveMeasure) => void
  onSetLength: (value: number) => void
}

function MeasurementPanel({
  t,
  measurements,
  activeMeasure,
  lengthLabel,
  lengthValue,
  lengthRange,
  onSetMeasurement,
  onSetActiveMeasure,
  onSetLength,
}: MeasurementPanelProps) {
  return (
    <section className="fit-panel fit-measurement-panel" aria-label="Body customization">
      <div className="fit-panel__intro">
        <p className="fit-panel__eyebrow">{t.bodyProfileLabel}</p>
        <h3>{t.measurementsHeading}</h3>
      </div>

      {measurementGroups.map((group) => (
        <div className="fit-measurement-group" key={group.title}>
          <h4>{group.title}</h4>
          <div className="fit-measurements">
            {group.controls.map((key) => {
              const control = rangeFor(key)
              const label = measureLabel(t, key)

              return (
                <label
                  key={key}
                  className={
                    activeMeasure === key
                      ? 'fit-measurement fit-measurement--active'
                      : 'fit-measurement'
                  }
                  onPointerEnter={() => onSetActiveMeasure(key)}
                  onPointerLeave={() => onSetActiveMeasure(null)}
                >
                  <span>
                    {label}
                    <strong>
                      {measurements[key]} {control.unit}
                    </strong>
                  </span>
                  <input
                    type="range"
                    min={control.min}
                    max={control.max}
                    value={measurements[key]}
                    onFocus={() => onSetActiveMeasure(key)}
                    onBlur={() => onSetActiveMeasure(null)}
                    onChange={(event) => onSetMeasurement(key, Number(event.target.value))}
                  />
                  <input
                    type="number"
                    min={control.min}
                    max={control.max}
                    value={measurements[key]}
                    onFocus={() => onSetActiveMeasure(key)}
                    onBlur={() => onSetActiveMeasure(null)}
                    onChange={(event) => onSetMeasurement(key, Number(event.target.value))}
                    aria-label={`${label} ${control.unit === 'cm' ? t.inCentimeters : 'in kilograms'}`}
                  />
                </label>
              )
            })}
          </div>
        </div>
      ))}

      <label
        className={
          activeMeasure === 'lowerLength'
            ? 'fit-measurement fit-measurement--length fit-measurement--active'
            : 'fit-measurement fit-measurement--length'
        }
        onPointerEnter={() => onSetActiveMeasure('lowerLength')}
        onPointerLeave={() => onSetActiveMeasure(null)}
      >
        <span>
          {lengthLabel}
          <strong>
            {lengthValue} {t.cm}
          </strong>
        </span>
        <input
          type="range"
          min={lengthRange[0]}
          max={lengthRange[1]}
          value={lengthValue}
          onFocus={() => onSetActiveMeasure('lowerLength')}
          onBlur={() => onSetActiveMeasure(null)}
          onChange={(event) => onSetLength(Number(event.target.value))}
        />
        <input
          type="number"
          min={lengthRange[0]}
          max={lengthRange[1]}
          value={lengthValue}
          onFocus={() => onSetActiveMeasure('lowerLength')}
          onBlur={() => onSetActiveMeasure(null)}
          onChange={(event) => onSetLength(Number(event.target.value))}
          aria-label={t.garmentLengthAria}
        />
      </label>
    </section>
  )
}

type FitRecommendationCardProps = {
  t: DemoCopy
  analysis: FitAnalysis
  cartMessage: string
  onAddToCart: () => void
  onCheckout: () => void
}

function FitRecommendationCard({
  t,
  analysis,
  cartMessage,
  onAddToCart,
  onCheckout,
}: FitRecommendationCardProps) {
  return (
    <section className="fit-summary" aria-label="Fit recommendation">
      <div className="fit-summary__hero">
        <div>
          <p className="fit-panel__eyebrow">Fit recommendation</p>
          <h3>Recommended size</h3>
        </div>
        <strong>{analysis.recommended}</strong>
      </div>

      <div className="fit-score-card">
        <span>Overall fit score</span>
        <b>{analysis.score}%</b>
        <div className="fit-score-card__bar">
          <i style={{ width: `${analysis.score}%` }} />
        </div>
      </div>

      <div className="fit-metrics">
        {analysis.metrics.map((metric) => (
          <div className="fit-metric" key={metric.label}>
            <span>{metric.label}</span>
            <strong>{metric.status}</strong>
            <i>
              <b style={{ width: `${metric.score}%` }} />
            </i>
          </div>
        ))}
      </div>

      <div className="fit-notes">
        <h4>Fit notes</h4>
        {analysis.notes.map((note) => (
          <p key={note}>{note}</p>
        ))}
      </div>

      <div className="fit-summary__actions">
        <button type="button" className="btn btn--ink" onClick={onAddToCart}>
          {t.addToCart}
        </button>
        <button type="button" className="btn btn--outline" onClick={onCheckout}>
          {t.checkout}
        </button>
      </div>

      <p className="demo-tryon__disclaimer" aria-live="polite">
        {cartMessage || t.disclaimer}
      </p>
    </section>
  )
}

export function DemoTryOn() {
  const { m } = useLanguage()
  const t = m.virtualTryOn.demo
  const svgRef = useRef<SVGSVGElement | null>(null)
  const [measurements, setMeasurements] = useState<Measurements>(defaultMeasurements)
  const [activeRegion, setActiveRegion] = useState<ProductRegion>('upper')
  const [activeCategory, setActiveCategory] = useState<ProductCategory>('blazer')
  const [selectedProductIds, setSelectedProductIds] = useState<ProductSelection>({
    upper: initialUpper.id,
    lower: initialLower.id,
    full: null,
  })
  const [selectedColorIds, setSelectedColorIds] = useState<ColorSelection>({
    upper: firstAvailableColor(initialUpper).id,
    lower: firstAvailableColor(initialLower).id,
    full: firstAvailableColor(initialFull).id,
  })
  const [lowerLength, setLowerLength] = useState(initialLower.defaultLength)
  const [fullLength, setFullLength] = useState(initialFull.defaultLength)
  const [dragTarget, setDragTarget] = useState<DragTarget | null>(null)
  const [activeMeasure, setActiveMeasure] = useState<ActiveMeasure>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('front')
  const [zoom, setZoom] = useState(1)
  const [cartState, setCartState] = useState<'added' | 'checkout' | ''>('')

  const selectedUpper = productById(selectedProductIds.upper)
  const selectedLower = productById(selectedProductIds.lower)
  const selectedFull = selectedProductIds.full ? productById(selectedProductIds.full) : null
  const productCopy = (product: FitProduct): ProductCopy =>
    t.products[product.id] ?? {
      name: product.name,
      category: product.category,
      colors: Object.fromEntries(product.colors.map((color) => [color.id, color.name])),
    }
  const colorName = (product: FitProduct, colorId: string) =>
    productCopy(product).colors[colorId] ?? colorId
  const selectedUpperCopy = productCopy(selectedUpper)
  const selectedLowerCopy = productCopy(selectedLower)
  const selectedFullCopy = selectedFull ? productCopy(selectedFull) : null
  const upperColor =
    selectedUpper.colors.find((color) => color.id === selectedColorIds.upper) ??
    firstAvailableColor(selectedUpper)
  const lowerColor =
    selectedLower.colors.find((color) => color.id === selectedColorIds.lower) ??
    firstAvailableColor(selectedLower)
  const fullColor =
    selectedFull?.colors.find((color) => color.id === selectedColorIds.full) ??
    firstAvailableColor(selectedFull ?? initialFull)
  const upperColorName = colorName(selectedUpper, upperColor.id)
  const lowerColorName = colorName(selectedLower, lowerColor.id)
  const fullColorName = selectedFull ? colorName(selectedFull, fullColor.id) : ''
  const lengthProduct = selectedFull ?? selectedLower
  const lengthValue = selectedFull ? fullLength : lowerLength
  const lengthRange = lengthProduct.lengthRange ?? [86, 108]
  const layout = deriveBody(measurements, lengthValue, lengthProduct)
  const analysis = createFitAnalysis(
    measurements,
    selectedUpperCopy,
    selectedLowerCopy,
    selectedFullCopy,
  )
  const currentLookTitle = selectedFull
    ? selectedFullCopy?.name ?? selectedFull.name
    : `${selectedUpperCopy.name} + ${selectedLowerCopy.name}`
  const currentLookMeta = selectedFull
    ? `${fullColorName} / size ${recommendedSize('full', measurements)}`
    : `${upperColorName} ${recommendedSize('upper', measurements)} / ${lowerColorName} ${recommendedSize('lower', measurements)}`
  const cartMessage =
    cartState === 'added'
      ? selectedFull && selectedFullCopy
        ? `${t.added.prefix} ${selectedFullCopy.name} ${t.added.colorWord} ${fullColorName}. ${t.added.suffix}`
        : `${t.added.prefix} ${selectedUpperCopy.name} ${t.added.colorWord} ${upperColorName} ${t.added.and} ${selectedLowerCopy.name} ${t.added.colorWord} ${lowerColorName}. ${t.added.suffix}`
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

  const dressPath = `
    M ${160 - layout.shoulderHalf - 8} ${layout.shoulderY + 8}
    C ${160 - layout.bustHalf - 12} ${layout.bustY - 8}, ${160 - layout.waistHalf - 12} ${layout.waistY}, ${160 - layout.waistHalf - 10} ${layout.waistY + 42}
    C ${160 - layout.hipHalf - 6} ${layout.hipY + 14}, ${160 - layout.hipHalf * 0.82} ${layout.hipY + 62}, ${160 - layout.hipHalf * 0.62} ${layout.lowerHemY}
    L ${160 + layout.hipHalf * 0.62} ${layout.lowerHemY}
    C ${160 + layout.hipHalf * 0.82} ${layout.hipY + 62}, ${160 + layout.hipHalf + 6} ${layout.hipY + 14}, ${160 + layout.waistHalf + 10} ${layout.waistY + 42}
    C ${160 + layout.waistHalf + 12} ${layout.waistY}, ${160 + layout.bustHalf + 12} ${layout.bustY - 8}, ${160 + layout.shoulderHalf + 8} ${layout.shoulderY + 8}
    Q 160 ${layout.shoulderY - 12} ${160 - layout.shoulderHalf - 8} ${layout.shoulderY + 8}
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

  function chooseCategory(category: ProductCategory) {
    const firstProduct = fitProducts.find((product) => product.garment === category)
    setActiveCategory(category)
    if (firstProduct) setActiveRegion(firstProduct.region)
  }

  function selectProduct(product: FitProduct, colorId?: string) {
    const nextColor =
      product.colors.find((color) => color.id === colorId && color.stock === 'in-stock') ??
      firstAvailableColor(product)

    setCartState('')
    setActiveRegion(product.region)
    setActiveCategory(product.garment)
    setSelectedProductIds((current) => {
      if (product.region === 'full') {
        return { ...current, full: product.id }
      }

      return { ...current, [product.region]: product.id, full: null }
    })
    setSelectedColorIds((current) => ({
      ...current,
      [product.region]: nextColor.id,
    }))
    if (product.region === 'lower') {
      setLowerLength(product.defaultLength)
    }
    if (product.region === 'full') {
      setFullLength(product.defaultLength)
    }
  }

  function selectColor(product: FitProduct, colorId: string) {
    const isSelected = selectedIdFor(product, selectedProductIds) === product.id
    if (!isSelected) {
      selectProduct(product, colorId)
      return
    }

    setCartState('')
    setActiveRegion(product.region)
    setActiveCategory(product.garment)
    setSelectedColorIds((current) => ({
      ...current,
      [product.region]: colorId,
    }))
  }

  function setLength(value: number) {
    const nextValue = Math.round(clamp(value, lengthRange[0], lengthRange[1]))
    if (selectedFull) {
      setFullLength(nextValue)
      return
    }
    setLowerLength(nextValue)
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

    const startY = lengthProduct.garment === 'trousers' ? layout.hipY : layout.waistY + 38
    const divisor = lengthProduct.garment === 'trousers' ? 2.52 : 2.05
    setLength((point.y - startY) / divisor)
  }

  function startDrag(target: DragTarget, event: PointerEvent<SVGElement>) {
    setDragTarget(target)
    setActiveMeasure(target)
    event.currentTarget.setPointerCapture(event.pointerId)
    updateFromPointer(target, event)
  }

  function stopDrag() {
    setDragTarget(null)
    setActiveMeasure(null)
  }

  function onAvatarKeyDown(region: ProductRegion, category: ProductCategory, event: KeyboardEvent<SVGGElement>) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      setActiveRegion(region)
      setActiveCategory(category)
    }
  }

  function addToCart() {
    setCartState('added')
  }

  function valueForHandle(key: DragTarget) {
    return key === 'lowerLength' ? lengthValue : measurements[key]
  }

  const landmarkLines: Array<{ key: ActiveMeasure; x1: number; y1: number; x2: number; y2: number }> = [
    { key: 'height', x1: 84, y1: layout.headCy - layout.headRy, x2: 84, y2: layout.hemY },
    { key: 'shoulders', x1: 160 - layout.shoulderHalf, y1: layout.shoulderY, x2: 160 + layout.shoulderHalf, y2: layout.shoulderY },
    { key: 'bust', x1: 160 - layout.bustHalf, y1: layout.bustY, x2: 160 + layout.bustHalf, y2: layout.bustY },
    { key: 'waist', x1: 160 - layout.waistHalf, y1: layout.waistY, x2: 160 + layout.waistHalf, y2: layout.waistY },
    { key: 'hips', x1: 160 - layout.hipHalf, y1: layout.hipY, x2: 160 + layout.hipHalf, y2: layout.hipY },
    { key: 'inseam', x1: 160 + layout.ankleHalf + 28, y1: layout.hipY, x2: 160 + layout.ankleHalf + 28, y2: layout.hemY },
    { key: 'lowerLength', x1: 160 - layout.hipHalf - 26, y1: layout.lowerHemY, x2: 160 + layout.hipHalf + 26, y2: layout.lowerHemY },
  ]

  const handles: Array<{ key: DragTarget; x: number; y: number; label: string }> = [
    { key: 'height', x: 84, y: layout.heightHandleY, label: t.handles.height },
    { key: 'shoulders', x: 160 + layout.shoulderHalf, y: layout.shoulderY, label: t.handles.shoulders },
    { key: 'bust', x: 160 + layout.bustHalf, y: layout.bustY, label: t.handles.bust },
    { key: 'waist', x: 160 + layout.waistHalf, y: layout.waistY, label: t.handles.waist },
    { key: 'hips', x: 160 + layout.hipHalf, y: layout.hipY, label: t.handles.hips },
    { key: 'inseam', x: 160 + layout.ankleHalf + 28, y: layout.hemY, label: t.handles.inseam },
    {
      key: 'lowerLength',
      x: 160 - layout.hipHalf - 26,
      y: layout.lowerHemY,
      label:
        selectedFull
          ? t.handles.dressHem ?? 'Dress hem'
          : selectedLower.garment === 'trousers'
            ? t.handles.pantHem
            : t.handles.skirtHem,
    },
  ]

  return (
    <section className="demo-tryon fit-studio" id="demo" aria-labelledby="demo-heading">
      <div className="tryon-section-heading fit-studio__heading">
        <p className="section-label">{t.label}</p>
        <h2 id="demo-heading" className="section-title">
          {t.heading}
        </h2>
        <p className="section-copy">{t.copy}</p>
      </div>

      <div className="fit-studio__layout">
        <TryOnPreview
          viewMode={viewMode}
          zoom={zoom}
          lookTitle={currentLookTitle}
          lookMeta={currentLookMeta}
          fitScore={analysis.score}
          onViewChange={setViewMode}
          onZoomChange={setZoom}
        >
          <svg
            ref={svgRef}
            className={`fit-avatar fit-avatar--${viewMode}`}
            viewBox="0 0 320 620"
            role="img"
            aria-label={t.avatarAria}
            onPointerMove={(event) => {
              if (dragTarget) updateFromPointer(dragTarget, event)
            }}
            onPointerUp={stopDrag}
            onPointerLeave={stopDrag}
          >
            <defs>
              <linearGradient id="studioWall" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#fffaf2" />
                <stop offset="58%" stopColor="#eee7dd" />
                <stop offset="100%" stopColor="#ded3c5" />
              </linearGradient>
              <radialGradient id="studioGlow" cx="50%" cy="16%" r="72%">
                <stop offset="0%" stopColor="#fffefd" stopOpacity="0.95" />
                <stop offset="58%" stopColor="#fff8ed" stopOpacity="0.32" />
                <stop offset="100%" stopColor="#fff8ed" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="headGrad" cx="35%" cy="35%" r="65%">
                <stop offset="0%" stopColor="#f3dac8" />
                <stop offset="60%" stopColor="#d1a98e" />
                <stop offset="100%" stopColor="#a67b5b" />
              </radialGradient>
              <linearGradient id="neckGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#8b6347" />
                <stop offset="100%" stopColor="#d1a98e" />
              </linearGradient>
              <linearGradient id="armLeftGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#a67b5b" />
                <stop offset="60%" stopColor="#e8cfbb" />
                <stop offset="100%" stopColor="#c49a7e" />
              </linearGradient>
              <linearGradient id="armRightGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#c49a7e" />
                <stop offset="40%" stopColor="#e8cfbb" />
                <stop offset="100%" stopColor="#a67b5b" />
              </linearGradient>
              <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#a67b5b" />
                <stop offset="50%" stopColor="#e8cfbb" />
                <stop offset="100%" stopColor="#a67b5b" />
              </linearGradient>
              <linearGradient id="clothShadeCenter" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#000" stopOpacity="0.25" />
                <stop offset="35%" stopColor="#000" stopOpacity="0.0" />
                <stop offset="65%" stopColor="#000" stopOpacity="0.0" />
                <stop offset="100%" stopColor="#000" stopOpacity="0.25" />
              </linearGradient>
              <linearGradient id="clothShadeLeft" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#000" stopOpacity="0.3" />
                <stop offset="25%" stopColor="#000" stopOpacity="0.0" />
                <stop offset="100%" stopColor="#000" stopOpacity="0.1" />
              </linearGradient>
              <linearGradient id="clothShadeRight" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#000" stopOpacity="0.1" />
                <stop offset="75%" stopColor="#000" stopOpacity="0.0" />
                <stop offset="100%" stopColor="#000" stopOpacity="0.3" />
              </linearGradient>
              <linearGradient id="clothHighlight" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#fff" stopOpacity="0.0" />
                <stop offset="45%" stopColor="#fff" stopOpacity="0.15" />
                <stop offset="55%" stopColor="#fff" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#fff" stopOpacity="0.0" />
              </linearGradient>
              <filter id="shadowHeavy" x="-12%" y="-12%" width="124%" height="136%">
                <feDropShadow dx="0" dy="14" stdDeviation="16" floodOpacity="0.22" />
              </filter>
              <filter id="shadowLight" x="-12%" y="-12%" width="124%" height="136%">
                <feDropShadow dx="0" dy="5" stdDeviation="7" floodOpacity="0.14" />
              </filter>
              <clipPath id="headClip">
                <ellipse
                  cx={layout.headCx}
                  cy={layout.headCy}
                  rx={layout.headRx}
                  ry={layout.headRy}
                />
              </clipPath>
            </defs>

            <rect className="fit-avatar__room" x="20" y="18" width="280" height="584" rx="34" />
            <rect className="fit-avatar__glow" x="20" y="18" width="280" height="584" rx="34" />
            <path className="fit-avatar__mirror" d="M 56 56 H 264 V 548 H 56 Z" />
            <ellipse className="fit-avatar__shadow" cx="160" cy="594" rx="82" ry="14" />

            <path
              className="fit-avatar__arm"
              d={`
                M ${160 - layout.shoulderHalf - 8} ${layout.shoulderY + 10}
                C ${160 - layout.hipHalf - 38} ${layout.hipY + 30}, ${160 - layout.hipHalf - 18} ${layout.hipY + 122}, ${160 - layout.ankleHalf - 28} ${layout.hemY - 10}
              `}
              stroke="url(#armLeftGrad)"
            />
            <path
              className="fit-avatar__arm"
              d={`
                M ${160 + layout.shoulderHalf + 8} ${layout.shoulderY + 10}
                C ${160 + layout.hipHalf + 38} ${layout.hipY + 30}, ${160 + layout.hipHalf + 18} ${layout.hipY + 122}, ${160 + layout.ankleHalf + 28} ${layout.hemY - 10}
              `}
              stroke="url(#armRightGrad)"
            />

            {viewMode === 'back' ? (
              <ellipse
                className="fit-avatar__hair-back"
                cx={layout.headCx}
                cy={layout.headCy}
                rx={layout.headRx + 7}
                ry={layout.headRy + 10}
              />
            ) : (
              <>
                <ellipse
                  className="fit-avatar__skin"
                  cx={layout.headCx}
                  cy={layout.headCy}
                  rx={layout.headRx}
                  ry={layout.headRy}
                  fill="url(#headGrad)"
                />
                <image
                  className="fit-avatar__face"
                  href={realisticFace}
                  x={layout.headCx - layout.headRx * 1.34}
                  y={layout.headCy - layout.headRy * 1.28}
                  width={layout.headRx * 2.68}
                  height={layout.headRy * 2.68}
                  preserveAspectRatio="xMidYMid slice"
                  clipPath="url(#headClip)"
                />
              </>
            )}

            <path
              className="fit-avatar__neck"
              fill="url(#neckGrad)"
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
              fill="url(#bodyGrad)"
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
              className={`fit-avatar__zone${activeRegion === 'upper' && !selectedFull ? ' fit-avatar__zone--active' : ''}`}
              role="button"
              tabIndex={0}
              aria-label={t.upperZoneAria}
              onClick={() => {
                setActiveRegion('upper')
                setActiveCategory(selectedUpper.garment)
              }}
              onKeyDown={(event) => onAvatarKeyDown('upper', selectedUpper.garment, event)}
            >
              <path d={`M ${160 - layout.shoulderHalf - 20} ${layout.shoulderY - 10} H ${160 + layout.shoulderHalf + 20} V ${layout.waistY + 48} H ${160 - layout.shoulderHalf - 20} Z`} />
            </g>
            <g
              className={`fit-avatar__zone${activeRegion === 'lower' && !selectedFull ? ' fit-avatar__zone--active' : ''}`}
              role="button"
              tabIndex={0}
              aria-label={t.lowerZoneAria}
              onClick={() => {
                setActiveRegion('lower')
                setActiveCategory(selectedLower.garment)
              }}
              onKeyDown={(event) => onAvatarKeyDown('lower', selectedLower.garment, event)}
            >
              <path d={`M ${160 - layout.hipHalf - 24} ${layout.waistY + 36} H ${160 + layout.hipHalf + 24} V ${layout.hemY + 8} H ${160 - layout.hipHalf - 24} Z`} />
            </g>

            {selectedFull ? (
              <>
                <path className="fit-avatar__garment fit-avatar__garment--dress" d={dressPath} fill={fullColor.swatch} filter="url(#shadowHeavy)" />
                <path className="fit-avatar__garment-shade" d={dressPath} fill="url(#clothShadeCenter)" style={{ mixBlendMode: 'multiply' }} />
                <path className="fit-avatar__garment-shade" d={dressPath} fill="url(#clothHighlight)" style={{ mixBlendMode: 'screen' }} />
                <path className="fit-avatar__belt" d={`M ${160 - layout.waistHalf - 6} ${layout.waistY + 38} H ${160 + layout.waistHalf + 6}`} />
              </>
            ) : (
              <>
                {selectedLower.garment === 'trousers' ? (
                  <>
                    <path className="fit-avatar__garment fit-avatar__garment--lower" d={leftTrouserPath} fill={lowerColor.swatch} filter="url(#shadowLight)" />
                    <path className="fit-avatar__garment-shade" d={leftTrouserPath} fill="url(#clothShadeLeft)" style={{ mixBlendMode: 'multiply' }} />
                    <path className="fit-avatar__garment-shade" d={leftTrouserPath} fill="url(#clothHighlight)" style={{ mixBlendMode: 'screen' }} />
                    <path className="fit-avatar__garment fit-avatar__garment--lower" d={rightTrouserPath} fill={lowerColor.swatch} filter="url(#shadowLight)" />
                    <path className="fit-avatar__garment-shade" d={rightTrouserPath} fill="url(#clothShadeRight)" style={{ mixBlendMode: 'multiply' }} />
                    <path className="fit-avatar__garment-shade" d={rightTrouserPath} fill="url(#clothHighlight)" style={{ mixBlendMode: 'screen' }} />
                    <path className="fit-avatar__crease" d={`M 160 ${layout.waistY + 58} V ${layout.lowerHemY - 10}`} />
                  </>
                ) : (
                  <>
                    <path className="fit-avatar__garment fit-avatar__garment--lower" d={skirtPath} fill={lowerColor.swatch} filter="url(#shadowLight)" />
                    <path className="fit-avatar__garment-shade" d={skirtPath} fill="url(#clothShadeCenter)" style={{ mixBlendMode: 'multiply' }} />
                    <path className="fit-avatar__garment-shade" d={skirtPath} fill="url(#clothHighlight)" style={{ mixBlendMode: 'screen' }} />
                  </>
                )}

                <path className="fit-avatar__garment fit-avatar__garment--upper" d={upperPath} fill={upperColor.swatch} filter="url(#shadowHeavy)" />
                <path className="fit-avatar__garment-shade" d={upperPath} fill="url(#clothShadeCenter)" style={{ mixBlendMode: 'multiply' }} />
                <path className="fit-avatar__garment-shade" d={upperPath} fill="url(#clothHighlight)" style={{ mixBlendMode: 'screen' }} />
              </>
            )}

            <path
              className="fit-avatar__collar"
              d={`
                M ${160 - 42} ${layout.shoulderY + 4}
                L 160 ${layout.shoulderY + 54}
                L ${160 + 42} ${layout.shoulderY + 4}
              `}
            />
            {!selectedFull && selectedUpper.garment === 'blazer' ? (
              <>
                <path className="fit-avatar__lapel" d={`M ${160 - 52} ${layout.shoulderY + 10} L ${160 - 10} ${layout.waistY + 42} L ${160 - 2} ${layout.shoulderY + 56} Z`} />
                <path className="fit-avatar__lapel" d={`M ${160 + 52} ${layout.shoulderY + 10} L ${160 + 10} ${layout.waistY + 42} L ${160 + 2} ${layout.shoulderY + 56} Z`} />
              </>
            ) : null}

            <g className="fit-avatar__lines" aria-hidden="true">
              {landmarkLines.map((line) => (
                <line
                  key={line.key}
                  className={activeMeasure === line.key || dragTarget === line.key ? 'fit-avatar__line fit-avatar__line--active' : 'fit-avatar__line'}
                  x1={line.x1}
                  y1={line.y1}
                  x2={line.x2}
                  y2={line.y2}
                />
              ))}
            </g>

            {handles.map((handle) => {
              const isActive = activeMeasure === handle.key || dragTarget === handle.key

              return (
                <g
                  key={handle.key}
                  className={
                    isActive
                      ? 'fit-avatar__handle fit-avatar__handle--active'
                      : 'fit-avatar__handle'
                  }
                  role="slider"
                  aria-label={handle.label}
                  aria-valuenow={valueForHandle(handle.key)}
                  tabIndex={-1}
                  onPointerDown={(event) => startDrag(handle.key, event)}
                >
                  <line x1={handle.x} y1={handle.y} x2={handle.x + 20} y2={handle.y} />
                  <circle cx={handle.x} cy={handle.y} r="8" />
                  <text x={handle.x + 24} y={handle.y + 4}>{handle.label}</text>
                </g>
              )
            })}
          </svg>
        </TryOnPreview>

        <ProductSelector
          t={t}
          activeCategory={activeCategory}
          selectedProductIds={selectedProductIds}
          selectedColorIds={selectedColorIds}
          productCopy={productCopy}
          colorName={colorName}
          onCategoryChange={chooseCategory}
          onSelectProduct={selectProduct}
          onSelectColor={selectColor}
        />

        <div className="fit-studio__right">
          <MeasurementPanel
            t={t}
            measurements={measurements}
            activeMeasure={activeMeasure}
            lengthLabel={
              selectedFull
                ? 'Dress length'
                : selectedLower.garment === 'trousers'
                  ? t.pantsLength
                  : t.skirtLength
            }
            lengthValue={lengthValue}
            lengthRange={lengthRange}
            onSetMeasurement={setMeasurement}
            onSetActiveMeasure={setActiveMeasure}
            onSetLength={setLength}
          />

          <FitRecommendationCard
            t={t}
            analysis={analysis}
            cartMessage={cartMessage}
            onAddToCart={addToCart}
            onCheckout={() => setCartState('checkout')}
          />
        </div>
      </div>
    </section>
  )
}
