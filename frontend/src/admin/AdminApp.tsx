import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties, FormEvent, ReactNode } from 'react'
import { useLanguage } from '../i18n/useLanguage'
import {
  fetchProductImages,
  fetchAdminProducts,
  fetchAdminCollections,
  removeAdminCollection,
  saveAdminCollection,
  saveAdminProduct,
  updateProductImage,
  uploadCollectionCoverImage,
  uploadProductImage,
} from './adminApi'
import type { ApiProductImage, ProductImageUsage } from './adminApi'
import {
  activityLog,
  adminProducts,
  analytics,
  campaigns,
  collections as fallbackCollections,
  coupons,
  customers,
  getStockStatus,
  lookbooks,
  orders,
  permissionMatrix,
  productById,
  recentActivity,
  returnRequests,
  staff,
  tryOnGarments,
  variants,
} from './adminData'
import type {
  AdminProduct,
  Order,
  OrderStatus,
  ProductVariant,
  ReturnRequest,
  StockStatus,
  Collection as AdminCollection,
} from './adminData'
import './Admin.css'

type AdminView =
  | 'overview'
  | 'orders'
  | 'order-detail'
  | 'products'
  | 'product-new'
  | 'product-detail'
  | 'inventory'
  | 'customers'
  | 'customer-detail'
  | 'returns'
  | 'promotions'
  | 'collections'
  | 'lookbook'
  | 'content'
  | 'try-on'
  | 'reports'
  | 'staff'
  | 'settings'

type AdminRoute = {
  view: AdminView
  id?: string
}

type NavItem = {
  key: AdminView
  label: string
  href: string
}

const navItems: NavItem[] = [
  { key: 'overview', label: 'Tổng quan', href: '/admin' },
  { key: 'orders', label: 'Đơn hàng', href: '/admin/orders' },
  { key: 'products', label: 'Sản phẩm', href: '/admin/products' },
  { key: 'inventory', label: 'Tồn kho', href: '/admin/inventory' },
  { key: 'customers', label: 'Khách hàng', href: '/admin/customers' },
  { key: 'returns', label: 'Đổi trả', href: '/admin/returns' },
  { key: 'promotions', label: 'Khuyến mãi', href: '/admin/promotions' },
  { key: 'collections', label: 'Bộ sưu tập', href: '/admin/collections' },
  { key: 'lookbook', label: 'Phối đồ', href: '/admin/lookbook' },
  { key: 'content', label: 'Nội dung', href: '/admin/content' },
  { key: 'try-on', label: 'Thử đồ ảo', href: '/admin/try-on' },
  { key: 'reports', label: 'Báo cáo', href: '/admin/reports' },
  { key: 'staff', label: 'Nhân sự', href: '/admin/staff' },
  { key: 'settings', label: 'Cài đặt', href: '/admin/settings' },
]

const productTabs = [
  'Thông tin cơ bản',
  'Hình ảnh',
  'Biến thể',
  'Tồn kho',
  'Tối ưu tìm kiếm',
  'Dữ liệu thử đồ',
] as const

type ProductTab = (typeof productTabs)[number]
type ProductMutation = Parameters<typeof saveAdminProduct>[0]
type CollectionMutation = Parameters<typeof saveAdminCollection>[0]

type ProductDraft = {
  name: string
  slug: string
  description: string
  category: string
  collection: string
  price: string
  salePrice: string
  material: string
  fitType: AdminProduct['fitType']
  tags: string
  status: AdminProduct['status']
}

type ProductImageItem = {
  id: string
  url: string
  altText: string
  position: number
  isPrimary: boolean
  isGallery: boolean
  usage: ProductImageUsage
  tryOnSize?: string | null
  width?: number | null
  height?: number | null
  persisted: boolean
}

type TryOnUploadItem = {
  size: string
  image: ProductImageItem | null
  uploading: boolean
}

type AdminSearchResult = {
  id: string
  title: string
  subtitle: string
  href: string
  score: number
}

const orderStatuses: OrderStatus[] = [
  'Pending confirmation',
  'Confirmed',
  'Preparing',
  'Shipping',
  'Completed',
  'Cancelled',
  'Return requested',
  'Refunded',
]

const dateRanges = ['Today', '7 days', '30 days', 'This month', 'Custom']
const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL']
const colors = ['Trắng ngà', 'Be', 'Đen', 'Nâu xám', 'Than chì', 'Ngọc trai']
const categories = ['Tất cả danh mục', 'Áo sơ mi', 'Áo blazer', 'Quần âu', 'Đầm', 'Chân váy', 'Áo blouse']
const allStatusFilter = 'Tất cả trạng thái'
const allStockFilter = 'Tất cả tồn kho'
const allSizeFilter = 'Tất cả kích cỡ'
const allColorFilter = 'Tất cả màu'
const allPaymentFilter = 'Tất cả thanh toán'
const allDeliveryFilter = 'Tất cả giao hàng'

const viLabels: Record<string, string> = {
  Active: 'Đang hoạt động',
  Confirmed: 'Đã xác nhận',
  Published: 'Đã xuất bản',
  Visible: 'Hiển thị',
  Paid: 'Đã thanh toán',
  Unpaid: 'Chưa thanh toán',
  Ready: 'Sẵn sàng',
  Completed: 'Hoàn tất',
  'In stock': 'Còn hàng',
  Approved: 'Đã duyệt',
  'Pending confirmation': 'Chờ xác nhận',
  Preparing: 'Đang chuẩn bị',
  Shipping: 'Đang giao',
  'Low stock': 'Sắp hết hàng',
  Requested: 'Đã yêu cầu',
  Scheduled: 'Đã lên lịch',
  Processing: 'Đang xử lý',
  Draft: 'Bản nháp',
  Invited: 'Đã mời',
  Cancelled: 'Đã hủy',
  'Out of stock': 'Hết hàng',
  Rejected: 'Đã từ chối',
  Failed: 'Thất bại',
  Expired: 'Hết hạn',
  Suspended: 'Tạm khóa',
  'Needs image': 'Cần hình ảnh',
  Hidden: 'Đã ẩn',
  Paused: 'Tạm dừng',
  Refunded: 'Đã hoàn tiền',
  'Return requested': 'Yêu cầu đổi trả',
  'Partially refunded': 'Hoàn tiền một phần',
  draft: 'Bản nháp',
  active: 'Đang bán',
  hidden: 'Đã ẩn',
  slim: 'Ôm',
  regular: 'Vừa',
  relaxed: 'Rộng nhẹ',
  oversized: 'Rộng',
  Today: 'Hôm nay',
  '7 days': '7 ngày',
  '30 days': '30 ngày',
  'This month': 'Tháng này',
  Custom: 'Tùy chỉnh',
  Standard: 'Tiêu chuẩn',
  Express: 'Nhanh',
  'Store pickup': 'Nhận tại cửa hàng',
  New: 'Mới',
  Returning: 'Quay lại',
  Inactive: 'Không hoạt động',
  Owner: 'Chủ sở hữu',
  Manager: 'Quản lý',
  Sales: 'Bán hàng',
  Inventory: 'Tồn kho',
  Content: 'Nội dung',
  'Wrong size': 'Sai kích cỡ',
  'Wrong color': 'Sai màu',
  'Does not fit': 'Không vừa',
  'Product defect': 'Lỗi sản phẩm',
  'Changed mind': 'Đổi ý',
  Received: 'Đã nhận hàng trả',
  Exchanged: 'Đã đổi hàng',
  percentage: 'Phần trăm',
  fixed: 'Số tiền cố định',
  'free shipping': 'Miễn phí vận chuyển',
  upper_body: 'Nửa thân trên',
  lower_body: 'Nửa thân dưới',
  dress: 'Đầm',
  outerwear: 'Áo khoác',
  shirt: 'Áo sơ mi',
  blazer: 'Áo blazer',
  true: 'Có',
  false: 'Không',
  Pending: 'Chờ xử lý',
}

function viText(value: string) {
  return viLabels[value] ?? value
}

function resolveAdminRoute(pathname: string): AdminRoute {
  const cleanPath = pathname.replace(/\/+$/, '') || '/admin'
  const parts = cleanPath.split('/').filter(Boolean)
  const section = parts[1]
  const id = parts[2]

  if (!section) {
    return { view: 'overview' }
  }

  if (section === 'orders' && id) {
    return { view: 'order-detail', id }
  }

  if (section === 'products' && id === 'new') {
    return { view: 'product-new' }
  }

  if (section === 'products' && id) {
    return { view: 'product-detail', id }
  }

  if (section === 'customers' && id) {
    return { view: 'customer-detail', id }
  }

  const routeMap: Record<string, AdminView> = {
    orders: 'orders',
    products: 'products',
    inventory: 'inventory',
    customers: 'customers',
    returns: 'returns',
    promotions: 'promotions',
    collections: 'collections',
    lookbook: 'lookbook',
    content: 'content',
    'try-on': 'try-on',
    reports: 'reports',
    staff: 'staff',
    settings: 'settings',
  }

  return { view: routeMap[section] ?? 'overview' }
}

function getActiveNav(view: AdminView) {
  if (view === 'order-detail') {
    return 'orders'
  }

  if (view === 'product-detail' || view === 'product-new') {
    return 'products'
  }

  if (view === 'customer-detail') {
    return 'customers'
  }

  return view
}

function getPageCopy(route: AdminRoute) {
  const idCopy = route.id ? ` ${route.id}` : ''

  const map: Record<AdminView, { title: string; subtitle: string }> = {
    overview: {
      title: 'Tổng quan quản trị',
      subtitle: 'Theo dõi doanh thu, đơn hàng, tồn kho và việc biên tập trong ngày.',
    },
    orders: {
      title: 'Đơn hàng',
      subtitle: 'Xác nhận, chuẩn bị, giao hàng và rà soát đơn của khách hàng.',
    },
    'order-detail': {
      title: `Đơn hàng${idCopy}`,
      subtitle: 'Khách hàng, xử lý đơn, thanh toán và lịch sử trong một màn hình.',
    },
    products: {
      title: 'Sản phẩm',
      subtitle: 'Quản lý sản phẩm công sở, trạng thái bán hàng, hiển thị và biến thể.',
    },
    'product-new': {
      title: 'Tạo sản phẩm',
      subtitle: 'Soạn sản phẩm mới với thông tin hàng hóa, tồn kho, tối ưu tìm kiếm và dữ liệu thử đồ.',
    },
    'product-detail': {
      title: `Sản phẩm${idCopy}`,
      subtitle: 'Chỉnh sửa chi tiết sản phẩm theo từng tab rõ ràng.',
    },
    inventory: {
      title: 'Tồn kho',
      subtitle: 'Theo dõi tồn kho theo kích cỡ, màu sắc và cảnh báo sắp hết hàng.',
    },
    customers: {
      title: 'Khách hàng',
      subtitle: 'Xem chi tiêu, kích cỡ, sở thích và ghi chú của khách hàng.',
    },
    'customer-detail': {
      title: `Khách hàng${idCopy}`,
      subtitle: 'Lịch sử mua hàng, sở thích, ghi chú và đổi trả trong hồ sơ khách.',
    },
    returns: {
      title: 'Đổi trả',
      subtitle: 'Xử lý đổi size, hoàn tiền và từ chối yêu cầu với luồng rõ ràng.',
    },
    promotions: {
      title: 'Khuyến mãi',
      subtitle: 'Quản lý mã giảm giá và chiến dịch với biểu mẫu gọn nhẹ.',
    },
    collections: {
      title: 'Bộ sưu tập',
      subtitle: 'Sắp xếp trang capsule và nhóm sản phẩm theo nhịp biên tập.',
    },
    lookbook: {
      title: 'Phối đồ',
      subtitle: 'Tạo gợi ý trang phục kèm sản phẩm liên quan và thẻ hình ảnh.',
    },
    content: {
      title: 'Nội dung',
      subtitle: 'Cập nhật trang chủ, banner, hướng dẫn, câu hỏi thường gặp và chính sách.',
    },
    'try-on': {
      title: 'Thử đồ ảo',
      subtitle: 'Chuẩn bị ảnh sản phẩm, dữ liệu và bản xem trước cho luồng thử đồ.',
    },
    reports: {
      title: 'Báo cáo',
      subtitle: 'Các biểu đồ và bảng số liệu phục vụ quyết định vận hành.',
    },
    staff: {
      title: 'Nhân sự và vai trò',
      subtitle: 'Quản lý quyền truy cập, phân quyền và hoạt động nội bộ.',
    },
    settings: {
      title: 'Cài đặt',
      subtitle: 'Điều chỉnh cửa hàng, ngôn ngữ, vận chuyển, thanh toán, đổi trả và thông báo.',
    },
  }

  return map[route.view]
}

function formatMoney(value: number) {
  const vndAmount = value < 100000 ? value * 25000 : value

  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(vndAmount)
}

function statusTone(status: string) {
  if (['Active', 'Published', 'Visible', 'Paid', 'Ready', 'Completed', 'In stock', 'Approved'].includes(status)) {
    return 'success'
  }

  if (
    [
      'Pending confirmation',
      'Preparing',
      'Low stock',
      'Requested',
      'Scheduled',
      'Processing',
      'Draft',
      'Invited',
    ].includes(status)
  ) {
    return 'warning'
  }

  if (
    ['Cancelled', 'Out of stock', 'Rejected', 'Failed', 'Expired', 'Suspended', 'Needs image'].includes(status)
  ) {
    return 'danger'
  }

  if (['Hidden', 'Paused', 'Refunded', 'Return requested', 'Partially refunded'].includes(status)) {
    return 'muted'
  }

  return 'neutral'
}

function getProductStockStatus(productId: string): StockStatus {
  const productVariants = variants.filter((variant) => variant.productId === productId)

  if (productVariants.length === 0) {
    return 'In stock'
  }

  if (productVariants.every((variant) => variant.stock === 0)) {
    return 'Out of stock'
  }

  if (productVariants.some((variant) => getStockStatus(variant) === 'Low stock')) {
    return 'Low stock'
  }

  return 'In stock'
}

function getVariantLabel(variant: ProductVariant) {
  const product = productById(variant.productId)
  return `${product?.name ?? 'Sản phẩm'} - ${variant.size}, ${viText(variant.color)}`
}

function createSlug(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function toProductDraft(product: AdminProduct, isNew = false): ProductDraft {
  return {
    name: isNew ? '' : product.name,
    slug: isNew ? '' : product.slug,
    description: isNew ? '' : product.description,
    category: product.category || categories[1],
    collection: isNew ? '' : product.collection,
    price: isNew ? '' : String(product.price),
    salePrice: isNew ? '' : String(product.salePrice ?? ''),
    material: isNew ? '' : product.material,
    fitType: product.fitType,
    tags: isNew ? '' : product.tags.join(', '),
    status: isNew ? 'active' : product.status,
  }
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
}

function toProductImageItem(image: ApiProductImage): ProductImageItem {
  return {
    id: image.id,
    url: image.url,
    altText: image.altText ?? '',
    position: image.position,
    isPrimary: image.isPrimary,
    isGallery: image.isGallery,
    usage: image.usage,
    tryOnSize: image.tryOnSize,
    width: image.width,
    height: image.height,
    persisted: true,
  }
}

function createCurrentProductImage(product: AdminProduct): ProductImageItem {
  return {
    id: `${product.id}-current-image`,
    url: product.image,
    altText: product.name,
    position: 0,
    isPrimary: true,
    isGallery: true,
    usage: 'gallery',
    persisted: false,
  }
}

function orderGalleryImages(images: ProductImageItem[]) {
  return [...images].sort((first, second) => {
    if (first.isPrimary !== second.isPrimary) {
      return first.isPrimary ? -1 : 1
    }

    return first.position - second.position
  })
}

function getGalleryImageLabel(index: number) {
  return index === 0 ? 'Main image' : `Detail image ${index}`
}

function normalizeSearchText(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

function getAdminSearchScore(query: string, title: string, subtitle: string) {
  const normalizedQuery = normalizeSearchText(query)
  const normalizedTitle = normalizeSearchText(title)
  const normalizedSubtitle = normalizeSearchText(subtitle)
  const titleWords = normalizedTitle.split(/\s+/)

  if (!normalizedQuery) {
    return 0
  }

  if (normalizedTitle === normalizedQuery) {
    return 120
  }

  if (normalizedTitle.startsWith(normalizedQuery)) {
    return 100
  }

  if (titleWords.some((word) => word.startsWith(normalizedQuery))) {
    return 84
  }

  const titleIndex = normalizedTitle.indexOf(normalizedQuery)
  if (titleIndex >= 0) {
    return 70 - Math.min(titleIndex, 30)
  }

  if (normalizedSubtitle.includes(normalizedQuery)) {
    return 48
  }

  return 0
}

function Button({
  children,
  onClick,
  href,
  variant = 'secondary',
  type = 'button',
}: {
  children: ReactNode
  onClick?: () => void
  href?: string
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  type?: 'button' | 'submit'
}) {
  const className = `admin-button admin-button--${variant}`

  if (href) {
    return (
      <a className={className} href={href}>
        {children}
      </a>
    )
  }

  return (
    <button className={className} type={type} onClick={onClick}>
      {children}
    </button>
  )
}

function Badge({ children, tone }: { children: ReactNode; tone?: string }) {
  return <span className={`admin-badge admin-badge--${tone ?? 'neutral'}`}>{typeof children === 'string' ? viText(children) : children}</span>
}

function Panel({
  title,
  eyebrow,
  action,
  children,
  className = '',
}: {
  title?: string
  eyebrow?: string
  action?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <section className={`admin-panel ${className}`}>
      {(title || eyebrow || action) && (
        <div className="admin-panel__head">
          <div>
            {eyebrow && <p className="admin-eyebrow">{eyebrow}</p>}
            {title && <h2>{title}</h2>}
          </div>
          {action && <div className="admin-panel__action">{action}</div>}
        </div>
      )}
      {children}
    </section>
  )
}

function Field({
  label,
  children,
  hint,
}: {
  label: string
  children: ReactNode
  hint?: string
}) {
  return (
    <label className="admin-field">
      <span>{label}</span>
      {children}
      {hint && <small>{hint}</small>}
    </label>
  )
}

function TextInput({
  defaultValue,
  placeholder,
  type = 'text',
}: {
  defaultValue?: string | number
  placeholder?: string
  type?: string
}) {
  return <input type={type} defaultValue={defaultValue} placeholder={placeholder} />
}

function SelectInput({
  value,
  defaultValue,
  onChange,
  children,
}: {
  value?: string
  defaultValue?: string
  onChange?: (value: string) => void
  children: ReactNode
}) {
  return (
    <select value={value} defaultValue={defaultValue} onChange={(event) => onChange?.(event.target.value)}>
      {children}
    </select>
  )
}

function EmptyState({ title, text, action }: { title: string; text: string; action?: ReactNode }) {
  return (
    <div className="admin-empty">
      <div className="admin-empty__mark" aria-hidden="true" />
      <h3>{title}</h3>
      <p>{text}</p>
      {action}
    </div>
  )
}

function SkeletonStack() {
  return (
    <div className="admin-skeleton-stack" aria-label="Đang tải bản xem trước">
      <span />
      <span />
      <span />
    </div>
  )
}

function Modal({
  title,
  children,
  onClose,
  footer,
  className = '',
}: {
  title: string
  children: ReactNode
  onClose: () => void
  footer?: ReactNode
  className?: string
}) {
  return (
    <div className="admin-overlay" role="presentation">
      <section className={`admin-modal ${className}`} role="dialog" aria-modal="true" aria-labelledby="admin-modal-title">
        <div className="admin-modal__head">
          <h2 id="admin-modal-title">{title}</h2>
          <button type="button" className="admin-icon-button" onClick={onClose} aria-label="Đóng hộp thoại">
            x
          </button>
        </div>
        <div className="admin-modal__body">{children}</div>
        {footer && <div className="admin-modal__foot">{footer}</div>}
      </section>
    </div>
  )
}

function Drawer({
  title,
  children,
  onClose,
  footer,
}: {
  title: string
  children: ReactNode
  onClose: () => void
  footer?: ReactNode
}) {
  return (
    <div className="admin-overlay admin-overlay--drawer" role="presentation">
      <aside className="admin-drawer" role="dialog" aria-modal="true" aria-labelledby="admin-drawer-title">
        <div className="admin-modal__head">
          <h2 id="admin-drawer-title">{title}</h2>
          <button type="button" className="admin-icon-button" onClick={onClose} aria-label="Đóng ngăn chi tiết">
            x
          </button>
        </div>
        <div className="admin-drawer__body">{children}</div>
        {footer && <div className="admin-modal__foot">{footer}</div>}
      </aside>
    </div>
  )
}

function ConfirmDialog({
  title,
  text,
  confirmLabel,
  onCancel,
  onConfirm,
}: {
  title: string
  text: string
  confirmLabel: string
  onCancel: () => void
  onConfirm: () => void
}) {
  return (
    <Modal
      title={title}
      onClose={onCancel}
      footer={
        <>
          <Button onClick={onCancel} variant="ghost">
            Hủy
          </Button>
          <Button onClick={onConfirm} variant="danger">
            {confirmLabel}
          </Button>
        </>
      }
    >
      <p className="admin-muted-copy">{text}</p>
    </Modal>
  )
}

function BarChart({ data }: { data: { label: string; value: number }[] }) {
  const max = Math.max(...data.map((item) => item.value))

  return (
    <div className="admin-bars" role="img" aria-label="Biểu đồ cột doanh số theo danh mục">
      {data.map((item) => (
        <div key={item.label} className="admin-bar-row">
          <span>{viText(item.label)}</span>
          <div>
            <i style={{ inlineSize: `${(item.value / max) * 100}%` }} />
          </div>
          <strong>{item.value}</strong>
        </div>
      ))}
    </div>
  )
}

function DonutChart({ data }: { data: { label: string; value: number; color: string }[] }) {
  const total = data.reduce((sum, item) => sum + item.value, 0)
  const segments = data.reduce<{ cursor: number; parts: string[] }>(
    (accumulator, item) => {
      const start = (accumulator.cursor / total) * 100
      const nextCursor = accumulator.cursor + item.value
      const end = (nextCursor / total) * 100

      return {
        cursor: nextCursor,
        parts: [...accumulator.parts, `${item.color} ${start}% ${end}%`],
      }
    },
    { cursor: 0, parts: [] },
  ).parts
  const style = { '--donut-fill': `conic-gradient(${segments.join(', ')})` } as CSSProperties

  return (
    <div className="admin-donut-wrap">
      <div className="admin-donut" style={style} role="img" aria-label="Biểu đồ tròn trạng thái đơn hàng">
        <span>{total}</span>
      </div>
      <div className="admin-donut-legend">
        {data.map((item) => (
          <span key={item.label}>
            <i style={{ background: item.color }} />
            {viText(item.label)}
          </span>
        ))}
      </div>
    </div>
  )
}

function HorizontalBars({
  data,
  valueLabel = (value) => `${value}%`,
}: {
  data: { label: string; value: number }[]
  valueLabel?: (value: number) => string
}) {
  const max = Math.max(...data.map((item) => item.value))

  return (
    <div className="admin-horizontal-bars">
      {data.map((item) => (
        <div key={item.label} className="admin-horizontal-bar">
          <span>{viText(item.label)}</span>
          <i style={{ inlineSize: `${(item.value / max) * 100}%` }} />
          <strong>{valueLabel(item.value)}</strong>
        </div>
      ))}
    </div>
  )
}

function AdminSidebar({
  activeNav,
  mobileOpen,
  onCloseMobile,
}: {
  activeNav: AdminView
  mobileOpen: boolean
  onCloseMobile: () => void
}) {
  return (
    <>
      <aside className="admin-sidebar">
        <SidebarContent activeNav={activeNav} onNavigate={onCloseMobile} />
      </aside>
      <div className={`admin-mobile-sheet${mobileOpen ? ' admin-mobile-sheet--open' : ''}`}>
        <button type="button" className="admin-mobile-sheet__veil" onClick={onCloseMobile} aria-label="Đóng menu" />
        <nav className="admin-mobile-sheet__panel" aria-label="Điều hướng quản trị trên di động">
          <SidebarContent activeNav={activeNav} onNavigate={onCloseMobile} />
        </nav>
      </div>
    </>
  )
}

function SidebarContent({ activeNav, onNavigate }: { activeNav: AdminView; onNavigate: () => void }) {
  return (
    <div className="admin-sidebar__inner">
      <a className="admin-brand" href="/admin" onClick={onNavigate}>
        <span>Hichic</span>
        <small>Quản trị xưởng</small>
      </a>
      <nav className="admin-nav" aria-label="Điều hướng quản trị">
        {navItems.map((item) => (
          <a
            key={item.key}
            href={item.href}
            className={activeNav === item.key ? 'admin-nav__item admin-nav__item--active' : 'admin-nav__item'}
            aria-current={activeNav === item.key ? 'page' : undefined}
            onClick={onNavigate}
          >
            <span className="admin-nav__dot" aria-hidden="true" />
            {item.label}
          </a>
        ))}
      </nav>
      <div className="admin-sidebar__note">
        <p>Trang bán hàng được tách riêng.</p>
        <a href="/">Xem cửa hàng</a>
      </div>
    </div>
  )
}

function AdminTopbar({
  products,
  collectionItems,
  onOpenMobileNav,
  profileOpen,
  onToggleProfile,
  onNotify,
}: {
  products: AdminProduct[]
  collectionItems: AdminCollection[]
  onOpenMobileNav: () => void
  profileOpen: boolean
  onToggleProfile: () => void
  onNotify: (message: string) => void
}) {
  const { setLocale } = useLanguage()
  const [search, setSearch] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)

  useEffect(() => {
    setLocale('vi')
  }, [setLocale])

  const searchResults = useMemo<AdminSearchResult[]>(() => {
    const query = search.trim()

    if (!query) {
      return []
    }

    const entries: Omit<AdminSearchResult, 'score'>[] = [
      ...products.map((product) => ({
        id: `product-${product.id}`,
        title: product.name,
        subtitle: `${product.category} / ${formatMoney(product.salePrice ?? product.price)}`,
        href: `/admin/products/${product.id}`,
      })),
      ...orders.map((order) => ({
        id: `order-${order.id}`,
        title: order.id,
        subtitle: `${order.customerName} / ${viText(order.status)}`,
        href: `/admin/orders/${order.id}`,
      })),
      ...customers.map((customer) => ({
        id: `customer-${customer.id}`,
        title: customer.name,
        subtitle: `${customer.email} / ${customer.phone}`,
        href: `/admin/customers/${customer.id}`,
      })),
      ...collectionItems.map((collection) => ({
        id: `collection-${collection.id}`,
        title: collection.name,
        subtitle: `${viText(collection.status)} / ${collection.productCount} san pham`,
        href: '/admin/collections',
      })),
    ]

    return entries
      .map((entry) => ({
        ...entry,
        score: getAdminSearchScore(query, entry.title, entry.subtitle),
      }))
      .filter((entry) => entry.score > 0)
      .sort((first, second) => second.score - first.score || first.title.localeCompare(second.title))
      .slice(0, 7)
  }, [collectionItems, products, search])

  return (
    <header className="admin-topbar">
      <button type="button" className="admin-topbar__menu" onClick={onOpenMobileNav} aria-label="Mở menu">
        Mở menu
      </button>
      <label className="admin-topbar__search">
        <span className="visually-hidden">Tìm trong quản trị</span>
        <input
          value={search}
          placeholder="Tìm đơn hàng, sản phẩm, khách hàng"
          onFocus={() => setSearchOpen(true)}
          onBlur={() => window.setTimeout(() => setSearchOpen(false), 120)}
          onChange={(event) => {
            setSearch(event.target.value)
            setSearchOpen(true)
          }}
        />
        {searchOpen && search.trim() && (
          <div className="admin-search-results" role="listbox" aria-label="Kết quả tìm kiếm gần nhất">
            {searchResults.length > 0 ? (
              searchResults.map((result) => (
                <a key={result.id} href={result.href} role="option">
                  <strong>{result.title}</strong>
                  <span>{result.subtitle}</span>
                </a>
              ))
            ) : (
              <p>Không có kết quả phù hợp.</p>
            )}
          </div>
        )}
      </label>
      <div className="admin-topbar__actions">
        <button type="button" className="admin-icon-button admin-icon-button--soft" onClick={() => onNotify('Bảng thông báo đã sẵn sàng để nối API.')}>
          Thông báo
        </button>
        <div className="admin-profile">
          <button type="button" className="admin-profile__button" onClick={onToggleProfile} aria-expanded={profileOpen}>
            <span>NP</span>
            <strong>Nhi Pham</strong>
          </button>
          {profileOpen && (
            <div className="admin-profile__menu">
              <button type="button" onClick={() => onNotify('Đã mở cài đặt hồ sơ.')}>
                Cài đặt hồ sơ
              </button>
              <button type="button" onClick={() => onNotify('Đã đưa yêu cầu xuất hoạt động vào hàng chờ.')}>
                Xuất hoạt động
              </button>
              <a href="/">Về cửa hàng</a>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

function PageChrome({
  route,
  children,
}: {
  route: AdminRoute
  children: ReactNode
}) {
  const copy = getPageCopy(route)

  return (
    <>
      <div className="admin-page-title">
        <div>
          <p className="admin-eyebrow">Khu quản trị Hichic</p>
          <h1>{copy.title}</h1>
          <p>{copy.subtitle}</p>
        </div>
      </div>
      {children}
    </>
  )
}

function OverviewPage({
  onNotify,
}: {
  onNotify: (message: string) => void
}) {
  const [dateRange, setDateRange] = useState('7 days')
  const todaysRevenue = orders.filter((order) => order.date === '2026-05-13').reduce((sum, order) => sum + order.total, 0)
  const weekRevenue = orders.reduce((sum, order) => sum + order.total, 0)
  const monthRevenue = 18640
  const pendingOrders = orders.filter((order) => order.status === 'Pending confirmation').length
  const lowStockCount = variants.filter((variant) => getStockStatus(variant) === 'Low stock').length
  const outOfStockCount = variants.filter((variant) => getStockStatus(variant) === 'Out of stock').length

  return (
    <div className="admin-page-grid">
      <div className="admin-overview-toolbar">
        <Field label="Khoảng thời gian">
          <SelectInput value={dateRange} onChange={setDateRange}>
            {dateRanges.map((range) => (
              <option key={range} value={range}>{viText(range)}</option>
            ))}
          </SelectInput>
        </Field>
        <details className="admin-dropdown">
          <summary>Thao tác nhanh</summary>
          <div className="admin-dropdown__menu">
            <a href="/admin/products/new">Thêm sản phẩm</a>
            <a href="/admin/collections">Tạo bộ sưu tập</a>
            <a href="/admin/orders">Xem đơn chờ xác nhận</a>
            <a href="/admin/inventory">Kiểm tra hàng sắp hết</a>
          </div>
        </details>
      </div>

      <Panel className="admin-revenue-panel">
        <div className="admin-revenue-strip">
          <div>
            <span>Doanh thu hôm nay</span>
            <strong>{formatMoney(todaysRevenue)}</strong>
          </div>
          <div>
            <span>Tuần này</span>
            <strong>{formatMoney(weekRevenue)}</strong>
          </div>
          <div>
            <span>Tháng này</span>
            <strong>{formatMoney(monthRevenue)}</strong>
          </div>
        </div>
      </Panel>

      <div className="admin-metric-grid">
        <MetricCard label="Đơn mới" value="12" detail="+4 so với hôm qua" />
        <MetricCard label="Đơn chờ xử lý" value={pendingOrders.toString()} detail="Cần xác nhận" tone="warning" />
        <MetricCard label="Sản phẩm sắp hết" value={lowStockCount.toString()} detail={`${outOfStockCount} hết hàng`} tone="danger" />
        <MetricCard label="Yêu cầu đổi trả" value={returnRequests.length.toString()} detail="2 yêu cầu cần xem" tone="muted" />
      </div>

      <div className="admin-dashboard-layout">
        <Panel title="Xu hướng doanh thu" eyebrow={viText(dateRange)}>
          <HorizontalBars data={analytics.revenueTrend} valueLabel={formatMoney} />
        </Panel>
        <Panel title="Doanh số theo danh mục">
          <BarChart data={analytics.salesByCategory} />
        </Panel>
        <Panel title="Trạng thái đơn hàng" className="admin-panel--compact">
          <DonutChart data={analytics.orderStatus} />
        </Panel>
      </div>

      <div className="admin-two-column">
        <Panel title="Sản phẩm bán chạy" action={<Button href="/admin/reports" variant="ghost">Xem báo cáo</Button>}>
          <div className="admin-product-rank">
            {adminProducts.slice(0, 4).map((product, index) => (
              <div key={product.id} className="admin-product-rank__row">
                <img src={product.image} alt="" />
                <div>
                  <strong>{product.name}</strong>
                  <span>{product.category} - {formatMoney(product.price)}</span>
                </div>
                <Badge tone={index === 0 ? 'success' : 'neutral'}>{index + 1}</Badge>
              </div>
            ))}
          </div>
        </Panel>
        <Panel title="Hoạt động gần đây" action={<Button onClick={() => onNotify('Đã làm mới hoạt động gần đây.')} variant="ghost">Làm mới</Button>}>
          <ol className="admin-activity-list">
            {recentActivity.map((activity) => (
              <li key={`${activity.time}-${activity.text}`}>
                <span>{activity.time}</span>
                <p>{activity.text}</p>
              </li>
            ))}
          </ol>
          <div className="admin-sync-preview">
            <span>Trạng thái tải dữ liệu</span>
            <SkeletonStack />
          </div>
        </Panel>
      </div>
    </div>
  )
}

function MetricCard({
  label,
  value,
  detail,
  tone = 'neutral',
}: {
  label: string
  value: string
  detail: string
  tone?: string
}) {
  return (
    <article className={`admin-metric admin-metric--${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
      <p>{detail}</p>
    </article>
  )
}

function ProductListPage({
  products,
  onNotify,
  onConfirmDelete,
}: {
  products: AdminProduct[]
  onNotify: (message: string) => void
  onConfirmDelete: (product: AdminProduct) => void
}) {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('Tất cả danh mục')
  const [status, setStatus] = useState(allStatusFilter)
  const [stock, setStock] = useState(allStockFilter)

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase())
      const matchesCategory = category === 'Tất cả danh mục' || product.category === category
      const matchesStatus = status === allStatusFilter || product.status === status
      const matchesStock = stock === allStockFilter || getProductStockStatus(product.id) === stock
      return matchesSearch && matchesCategory && matchesStatus && matchesStock
    })
  }, [category, products, search, status, stock])

  return (
    <div className="admin-page-grid">
      <div className="admin-command-row">
        <div className="admin-filter-grid admin-filter-grid--wide">
          <Field label="Tìm kiếm">
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm tên sản phẩm" />
          </Field>
          <Field label="Danh mục">
            <SelectInput value={category} onChange={setCategory}>
              {categories.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </SelectInput>
          </Field>
          <Field label="Trạng thái">
            <SelectInput value={status} onChange={setStatus}>
              <option value={allStatusFilter}>{allStatusFilter}</option>
              <option value="draft">{viText('draft')}</option>
              <option value="active">{viText('active')}</option>
              <option value="hidden">{viText('hidden')}</option>
            </SelectInput>
          </Field>
          <Field label="Tồn kho">
            <SelectInput value={stock} onChange={setStock}>
              <option value={allStockFilter}>{allStockFilter}</option>
              <option value="In stock">{viText('In stock')}</option>
              <option value="Low stock">{viText('Low stock')}</option>
              <option value="Out of stock">{viText('Out of stock')}</option>
            </SelectInput>
          </Field>
        </div>
        <Button href="/admin/products/new" variant="primary">Thêm sản phẩm</Button>
      </div>
      <Panel title="Danh sách sản phẩm" eyebrow={`${filteredProducts.length} sản phẩm`}>
        {filteredProducts.length > 0 ? (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Ảnh sản phẩm</th>
                  <th>Tên</th>
                  <th>Danh mục</th>
                  <th>Giá</th>
                  <th>Biến thể</th>
                  <th>Trạng thái kho</th>
                  <th>Hiển thị</th>
                  <th>Ngày cập nhật</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product.id}>
                    <td>
                      <img className="admin-table-image" src={product.image} alt="" />
                    </td>
                    <td>
                      <a className="admin-table-link" href={`/admin/products/${product.id}`}>{product.name}</a>
                      <small>{product.slug}</small>
                    </td>
                    <td>{product.category}</td>
                    <td>{formatMoney(product.salePrice ?? product.price)}</td>
                    <td>{variants.filter((variant) => variant.productId === product.id).length}</td>
                    <td><Badge tone={statusTone(getProductStockStatus(product.id))}>{getProductStockStatus(product.id)}</Badge></td>
                    <td><Badge tone={statusTone(product.visibility)}>{product.visibility}</Badge></td>
                    <td>{product.updatedAt}</td>
                    <td>
                      <details className="admin-row-actions">
                        <summary>Thao tác</summary>
                        <div>
                          <a href={`/admin/products/${product.id}`}>Sửa</a>
                          <button type="button" onClick={() => onNotify(`Đã nhân bản ${product.name} thành bản nháp.`)}>Nhân bản</button>
                          <button type="button" onClick={() => onNotify(`Đã đổi trạng thái hiển thị của ${product.name}.`)}>Ẩn/hiện</button>
                          <a href={`/admin/products/${product.id}`}>Quản lý biến thể</a>
                          <button type="button" onClick={() => onConfirmDelete(product)}>Xóa</button>
                        </div>
                      </details>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            title="Không có sản phẩm phù hợp"
            text="Hãy mở rộng bộ lọc danh mục, trạng thái hoặc tồn kho trước khi tạo sản phẩm mới."
            action={<Button href="/admin/products/new" variant="primary">Tạo sản phẩm</Button>}
          />
        )}
      </Panel>
    </div>
  )
}

function ProductDetailPage({
  products,
  productId,
  isNew,
  activeTab,
  onChangeTab,
  onNotify,
  onSaveProduct,
}: {
  products: AdminProduct[]
  productId?: string
  isNew?: boolean
  activeTab: ProductTab
  onChangeTab: (tab: ProductTab) => void
  onNotify: (message: string) => void
  onSaveProduct: (product: ProductMutation) => Promise<AdminProduct>
}) {
  const product = productId ? products.find((item) => item.id === productId) : undefined
  const fallbackProduct = product ?? products[0] ?? adminProducts[0]
  const [savedProduct, setSavedProduct] = useState<AdminProduct | null>(null)
  const [primaryImageUrl, setPrimaryImageUrl] = useState('')
  const [draft, setDraft] = useState<ProductDraft>(() => toProductDraft(fallbackProduct, Boolean(isNew)))
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setSavedProduct(null)
    setPrimaryImageUrl('')
    setDraft(toProductDraft(fallbackProduct, Boolean(isNew)))
  }, [product?.id, productId, isNew])

  const updateDraft = (patch: Partial<ProductDraft>) => {
    setDraft((current) => {
      const next = { ...current, ...patch }

      if (patch.name !== undefined && (!current.slug || current.slug === createSlug(current.name))) {
        next.slug = createSlug(patch.name)
      }

      return next
    })
  }

  const workingProduct = savedProduct ?? fallbackProduct
  const productForForms: AdminProduct = {
    ...workingProduct,
    name: draft.name || workingProduct.name,
    slug: draft.slug || createSlug(draft.name || workingProduct.name),
    description: draft.description || workingProduct.description,
    category: draft.category,
    collection: draft.collection || workingProduct.collection,
    price: Number(draft.price) || 0,
    salePrice: draft.salePrice ? Number(draft.salePrice) || undefined : undefined,
    material: draft.material || workingProduct.material,
    fitType: draft.fitType,
    tags: draft.tags
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean),
    status: draft.status,
    visibility: draft.status === 'hidden' ? 'Hidden' : 'Visible',
    image: primaryImageUrl || workingProduct.image,
  }
  const productVariants = variants.filter((variant) => variant.productId === productForForms.id)

  const handleSaveProduct = async () => {
    const name = draft.name.trim()

    if (!name) {
      onNotify('Hãy nhập tên sản phẩm trước khi lưu.')
      return
    }

    setSaving(true)

    try {
      const saved = await onSaveProduct({
        id: isUuid(workingProduct.id) ? workingProduct.id : savedProduct?.id,
        name,
        category: draft.category,
        price: Number(draft.price) || 0,
        description: draft.description.trim(),
        image: productForForms.image,
        status: draft.status,
      })
      setSavedProduct(saved)
      setDraft(toProductDraft(saved))
      onNotify('Đã lưu sản phẩm vào cơ sở dữ liệu.')
    } catch (error) {
      onNotify(error instanceof Error ? `Không thể lưu sản phẩm: ${error.message}` : 'Không thể lưu sản phẩm.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="admin-page-grid">
      <Panel>
        <div className="admin-detail-hero">
          <img src={productForForms.image} alt="" />
          <div>
            <p className="admin-eyebrow">{productForForms.category}</p>
            <h2>{draft.name || 'Sản phẩm chưa đặt tên'}</h2>
            <p>{draft.description || productForForms.description}</p>
            <div className="admin-inline-badges">
              <Badge tone={statusTone(productForForms.status)}>{productForForms.status}</Badge>
              <Badge tone={statusTone(productForForms.tryOnStatus)}>{productForForms.tryOnStatus}</Badge>
              <Badge>{productForForms.fitType}</Badge>
            </div>
          </div>
          <div className="admin-detail-hero__actions">
            <Button onClick={() => void handleSaveProduct()} variant="primary">{saving ? 'Đang lưu...' : 'Lưu sản phẩm'}</Button>
            <Button href="/admin/products" variant="ghost">Về danh sách</Button>
          </div>
        </div>
      </Panel>
      <div className="admin-tabs" role="tablist" aria-label="Tab chi tiết sản phẩm">
        {productTabs.map((tab) => (
          <button
            key={tab}
            type="button"
            className={activeTab === tab ? 'admin-tab admin-tab--active' : 'admin-tab'}
            onClick={() => onChangeTab(tab)}
            role="tab"
            aria-selected={activeTab === tab}
          >
            {tab}
          </button>
        ))}
      </div>
      <Panel title={activeTab}>
        {activeTab === 'Thông tin cơ bản' && <ProductBasicForm draft={draft} onChange={updateDraft} />}
        {activeTab === 'Hình ảnh' && (
          <ProductImagesForm
            product={productForForms}
            onPrimaryImageChange={setPrimaryImageUrl}
            onNotify={onNotify}
          />
        )}
        {activeTab === 'Biến thể' && <ProductVariantsForm product={productForForms} productVariants={productVariants} onNotify={onNotify} />}
        {activeTab === 'Tồn kho' && <ProductInventoryForm productVariants={productVariants} />}
        {activeTab === 'Tối ưu tìm kiếm' && <ProductSeoForm product={productForForms} />}
        {activeTab === 'Dữ liệu thử đồ' && <ProductTryOnForm product={productForForms} onNotify={onNotify} />}
      </Panel>
    </div>
  )
}

function ProductBasicForm({
  draft,
  onChange,
}: {
  draft: ProductDraft
  onChange: (patch: Partial<ProductDraft>) => void
}) {
  return (
    <form className="admin-form-grid">
      <Field label="Tên"><input value={draft.name} placeholder="Tên sản phẩm" onChange={(event) => onChange({ name: event.target.value })} /></Field>
      <Field label="Slug"><input value={draft.slug} placeholder="product-slug" onChange={(event) => onChange({ slug: event.target.value })} /></Field>
      <Field label="Mô tả">
        <textarea value={draft.description} rows={4} onChange={(event) => onChange({ description: event.target.value })} />
      </Field>
      <Field label="Danh mục">
        <SelectInput value={draft.category} onChange={(value) => onChange({ category: value })}>
          {categories.filter((item) => item !== 'Tất cả danh mục').map((item) => (
            <option key={item}>{item}</option>
          ))}
        </SelectInput>
      </Field>
      <Field label="Bộ sưu tập"><input value={draft.collection} onChange={(event) => onChange({ collection: event.target.value })} /></Field>
      <Field label="Giá"><input type="number" value={draft.price} onChange={(event) => onChange({ price: event.target.value })} /></Field>
      <Field label="Giá khuyến mãi"><input type="number" value={draft.salePrice} onChange={(event) => onChange({ salePrice: event.target.value })} /></Field>
      <Field label="Chất liệu"><input value={draft.material} onChange={(event) => onChange({ material: event.target.value })} /></Field>
      <Field label="Kiểu dáng">
        <SelectInput value={draft.fitType} onChange={(value) => onChange({ fitType: value as AdminProduct['fitType'] })}>
          <option value="slim">{viText('slim')}</option>
          <option value="regular">{viText('regular')}</option>
          <option value="relaxed">{viText('relaxed')}</option>
          <option value="oversized">{viText('oversized')}</option>
        </SelectInput>
      </Field>
      <Field label="Thẻ" hint="Phân tách bằng dấu phẩy">
        <input value={draft.tags} onChange={(event) => onChange({ tags: event.target.value })} />
      </Field>
      <Field label="Trạng thái">
        <SelectInput value={draft.status} onChange={(value) => onChange({ status: value as AdminProduct['status'] })}>
          <option value="draft">{viText('draft')}</option>
          <option value="active">{viText('active')}</option>
          <option value="hidden">{viText('hidden')}</option>
        </SelectInput>
      </Field>
    </form>
  )
}

function ProductImagesForm({
  product,
  onPrimaryImageChange,
  onNotify,
}: {
  product: AdminProduct
  onPrimaryImageChange: (url: string) => void
  onNotify: (message: string) => void
}) {
  const [altText, setAltText] = useState(product.name)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [lastUploadedNames, setLastUploadedNames] = useState<string[]>([])
  const [images, setImages] = useState<ProductImageItem[]>(() => [createCurrentProductImage(product)])
  const canUploadToBackend = isUuid(product.id)
  const galleryImages = orderGalleryImages(images.filter((image) => image.usage === 'gallery'))

  useEffect(() => {
    setAltText(product.name)
    setUploadError('')
    setLastUploadedNames([])
    setImages([createCurrentProductImage(product)])
  }, [product.id, product.image, product.name])

  useEffect(() => {
    let active = true

    if (!canUploadToBackend) {
      return () => {
        active = false
      }
    }

    fetchProductImages(product.id)
      .then((result) => {
        if (!active) return

        const gallery = result
          .filter((image) => image.usage === 'gallery')
          .map(toProductImageItem)

        setImages(gallery.length > 0 ? gallery : [createCurrentProductImage(product)])
      })
      .catch(() => {
        if (active) {
          setImages([createCurrentProductImage(product)])
        }
      })

    return () => {
      active = false
    }
  }, [canUploadToBackend, product.id, product.image, product.name])

  const handleImageSelection = async (fileList: FileList | null) => {
    const files = Array.from(fileList ?? [])
    setUploadError('')
    setLastUploadedNames(files.map((file) => file.name))

    if (files.length === 0) {
      return
    }

    if (!canUploadToBackend) {
      setUploadError('Hãy lưu sản phẩm vào cơ sở dữ liệu trước khi thêm ảnh.')
      return
    }

    setUploading(true)

    try {
      const uploadedImages: ProductImageItem[] = []

      for (const file of files) {
        const result = await uploadProductImage({
          productId: product.id,
          file,
          altText,
          usage: 'gallery',
          isGallery: true,
        })

        uploadedImages.push(toProductImageItem(result.image))
      }

      setImages((current) => orderGalleryImages([...current.filter((image) => image.persisted), ...uploadedImages]))

      const primaryUpload = uploadedImages.find((image) => image.isPrimary)
      if (primaryUpload) {
        onPrimaryImageChange(primaryUpload.url)
      }

      onNotify(`Đã lưu ${uploadedImages.length} ảnh sản phẩm.`)
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Không thể lưu ảnh.')
    } finally {
      setUploading(false)
    }
  }

  const handleStarImage = async (image: ProductImageItem) => {
    setImages((current) =>
      current.map((item) => ({
        ...item,
        isPrimary: item.id === image.id,
        isGallery: item.id === image.id ? true : item.isGallery,
      })),
    )
    onPrimaryImageChange(image.url)

    if (!image.persisted || !canUploadToBackend) {
      onNotify('Đã chọn ảnh chính cho bản xem trước.')
      return
    }

    try {
      const result = await updateProductImage({
        productId: product.id,
        imageId: image.id,
        isPrimary: true,
        isGallery: true,
        usage: 'gallery',
      })
      const nextImage = toProductImageItem(result.image)
      setImages((current) =>
        current.map((item) =>
          item.id === nextImage.id ? nextImage : { ...item, isPrimary: false },
        ),
      )
      onNotify('Đã đặt ảnh này làm ảnh đầu tiên trong chi tiết sản phẩm.')
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Không thể cập nhật ảnh chính.')
    }
  }

  const handleGalleryToggle = async (image: ProductImageItem) => {
    const nextIsGallery = !image.isGallery
    setImages((current) =>
      current.map((item) =>
        item.id === image.id ? { ...item, isGallery: nextIsGallery } : item,
      ),
    )

    if (!image.persisted || !canUploadToBackend) {
      return
    }

    try {
      const result = await updateProductImage({
        productId: product.id,
        imageId: image.id,
        isGallery: nextIsGallery,
      })
      const nextImage = toProductImageItem(result.image)
      setImages((current) => current.map((item) => (item.id === nextImage.id ? nextImage : item)))
    } catch (error) {
      setImages((current) =>
        current.map((item) =>
          item.id === image.id ? { ...item, isGallery: image.isGallery } : item,
        ),
      )
      setUploadError(error instanceof Error ? error.message : 'Không thể cập nhật thư viện ảnh.')
    }
  }

  return (
    <div className="admin-images-layout">
      <div className="admin-upload-card">
        <label className="admin-upload-zone">
          <input
            type="file"
            accept="image/*"
            multiple
            disabled={uploading}
            onChange={(event) => {
              void handleImageSelection(event.target.files)
              event.target.value = ''
            }}
          />
          <span>{lastUploadedNames.length > 0 ? lastUploadedNames.join(', ') : 'Chọn ảnh sản phẩm'}</span>
          <small>{uploading ? 'Đang lưu ảnh...' : 'Có thể chọn nhiều ảnh để thêm vào thư viện sản phẩm.'}</small>
        </label>
        <Field label="Văn bản thay thế">
          <input
            value={altText}
            placeholder="Mô tả ảnh"
            onChange={(event) => setAltText(event.target.value)}
          />
        </Field>
        {!canUploadToBackend && (
          <p className="admin-form-error">
            Sản phẩm mẫu chỉ cho phép xem trước ảnh. Hãy lưu sản phẩm trước khi thêm ảnh chính thức.
          </p>
        )}
        {uploadError && <p className="admin-form-error">{uploadError}</p>}
      </div>
      <div className="admin-image-list">
        {galleryImages.map((image, index) => (
          <article
            key={image.id}
            className={image.isPrimary ? 'admin-image-card admin-image-card--primary' : 'admin-image-card'}
          >
            <img src={image.url} alt="" />
            <div className="admin-image-card__meta">
              <div className="admin-image-card__title">
                <strong>{getGalleryImageLabel(index)}</strong>
                {image.isPrimary && <Badge tone="success">First detail image</Badge>}
                {image.isGallery && <Badge>Gallery</Badge>}
              </div>
              <span>{image.altText || product.name}</span>
              {image.width && image.height && <small>{image.width} x {image.height}px</small>}
            </div>
            <div className="admin-image-card__actions">
              <button
                type="button"
                className={image.isPrimary ? 'admin-star-button admin-star-button--active' : 'admin-star-button'}
                onClick={() => void handleStarImage(image)}
                aria-label={`Star ${getGalleryImageLabel(index)} for gallery and product detail`}
              >
                ★
              </button>
              <label className="admin-checkbox-row">
                <input
                  type="checkbox"
                  checked={image.isGallery}
                  onChange={() => void handleGalleryToggle(image)}
                />
                Gallery
              </label>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}

function ProductVariantsForm({
  product,
  productVariants,
  onNotify,
}: {
  product: AdminProduct
  productVariants: ProductVariant[]
  onNotify: (message: string) => void
}) {
  return (
    <div className="admin-page-grid">
      <div className="admin-inline-actions">
        <Button onClick={() => onNotify(`Đã thêm dòng biến thể mới cho ${product.name}.`)} variant="primary">Thêm biến thể</Button>
        <Button onClick={() => onNotify('Đã nhân bản bộ kích cỡ sang các màu đã chọn.')} variant="ghost">Nhân bản bộ kích cỡ</Button>
      </div>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Kích cỡ</th>
              <th>Màu</th>
              <th>SKU</th>
              <th>Số lượng tồn</th>
              <th>Ngưỡng sắp hết</th>
              <th>Giá riêng</th>
            </tr>
          </thead>
          <tbody>
            {productVariants.map((variant) => (
              <tr key={variant.id}>
                <td>{variant.size}</td>
                <td>{variant.color}</td>
                <td>{variant.sku}</td>
                <td>{variant.stock}</td>
                <td>{variant.lowStockThreshold}</td>
                <td>{variant.priceOverride ? formatMoney(variant.priceOverride) : 'Không có'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function ProductInventoryForm({ productVariants }: { productVariants: ProductVariant[] }) {
  return (
    <div className="admin-inventory-summary">
      {productVariants.map((variant) => (
        <article key={variant.id}>
          <span>{variant.size} / {variant.color}</span>
          <strong>{variant.stock} sản phẩm</strong>
          <Badge tone={statusTone(getStockStatus(variant))}>{getStockStatus(variant)}</Badge>
          <small>Ngưỡng: {variant.lowStockThreshold}</small>
        </article>
      ))}
    </div>
  )
}

function ProductSeoForm({ product }: { product: AdminProduct }) {
  return (
    <form className="admin-form-grid">
      <Field label="Tiêu đề tìm kiếm"><TextInput defaultValue={product.seoTitle} /></Field>
      <Field label="Mô tả tìm kiếm">
        <textarea defaultValue={product.seoDescription} rows={4} />
      </Field>
      <Field label="Slug chuẩn"><TextInput defaultValue={`/products/${product.slug}`} /></Field>
      <Field label="Từ khóa tìm kiếm"><TextInput defaultValue={product.tags.join(', ')} /></Field>
    </form>
  )
}

function ProductTryOnForm({ product, onNotify }: { product: AdminProduct; onNotify: (message: string) => void }) {
  const canUploadToBackend = isUuid(product.id)
  const [tryOnUploads, setTryOnUploads] = useState<TryOnUploadItem[]>(() =>
    sizes.map((size) => ({ size, image: null, uploading: false })),
  )
  const [uploadError, setUploadError] = useState('')

  useEffect(() => {
    let active = true
    setUploadError('')
    setTryOnUploads(sizes.map((size) => ({ size, image: null, uploading: false })))

    if (!canUploadToBackend) {
      return () => {
        active = false
      }
    }

    fetchProductImages(product.id)
      .then((result) => {
        if (!active) return

        const imagesBySize = new Map(
          result
            .filter((image) => image.usage === 'try_on' && image.tryOnSize)
            .map((image) => [image.tryOnSize, toProductImageItem(image)]),
        )

        setTryOnUploads(
          sizes.map((size) => ({
            size,
            image: imagesBySize.get(size) ?? null,
            uploading: false,
          })),
        )
      })
      .catch(() => {
        if (active) {
          setTryOnUploads(sizes.map((size) => ({ size, image: null, uploading: false })))
        }
      })

    return () => {
      active = false
    }
  }, [canUploadToBackend, product.id])

  const handleTryOnImageSelection = async (size: string, file: File | null) => {
    setUploadError('')

    if (!file) {
      return
    }

    if (!canUploadToBackend) {
      setUploadError('Hãy lưu sản phẩm vào cơ sở dữ liệu trước khi thêm ảnh thử đồ.')
      return
    }

    setTryOnUploads((current) =>
      current.map((item) => (item.size === size ? { ...item, uploading: true } : item)),
    )

    try {
      const result = await uploadProductImage({
        productId: product.id,
        file,
        altText: `${product.name} ${size} try-on`,
        usage: 'try_on',
        tryOnSize: size,
        isGallery: false,
      })
      const nextImage = toProductImageItem(result.image)

      setTryOnUploads((current) =>
        current.map((item) =>
          item.size === size ? { size, image: nextImage, uploading: false } : item,
        ),
      )
      onNotify(`Đã lưu ảnh thử đồ size ${size}.`)
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Không thể lưu ảnh thử đồ.')
      setTryOnUploads((current) =>
        current.map((item) => (item.size === size ? { ...item, uploading: false } : item)),
      )
    }
  }

  return (
    <form className="admin-form-grid">
      <Field label="Danh mục">
        <SelectInput defaultValue={product.category === 'Quần âu' || product.category === 'Chân váy' ? 'lower_body' : 'upper_body'}>
          <option value="upper_body">{viText('upper_body')}</option>
          <option value="lower_body">{viText('lower_body')}</option>
          <option value="dress">{viText('dress')}</option>
          <option value="outerwear">{viText('outerwear')}</option>
        </SelectInput>
      </Field>
      <Field label="Kiểu trang phục"><TextInput defaultValue={product.category.toLowerCase()} /></Field>
      <Field label="Màu"><TextInput defaultValue={product.tags[0] ?? 'Trung tính'} /></Field>
      <Field label="Kích cỡ"><TextInput defaultValue="S, M, L" /></Field>
      <Field label="Bật thử đồ">
        <SelectInput defaultValue={product.tryOnStatus === 'Ready' ? 'true' : 'false'}>
          <option value="true">{viText('true')}</option>
          <option value="false">{viText('false')}</option>
        </SelectInput>
      </Field>
      <Field label="Trạng thái xử lý">
        <SelectInput defaultValue={product.tryOnStatus}>
          <option value="Ready">{viText('Ready')}</option>
          <option value="Needs image">{viText('Needs image')}</option>
          <option value="Processing">{viText('Processing')}</option>
          <option value="Failed">{viText('Failed')}</option>
        </SelectInput>
      </Field>
      <div className="admin-tryon-data">
        <div>
          <h3>Size images for 2D photo try-on</h3>
          <p>Upload each product size from the same camera angle so the storefront 2D photo try-on can pick the closest garment layer.</p>
        </div>
        <div className="admin-tryon-upload-grid">
          {tryOnUploads.map((item) => (
            <article
              key={item.size}
              className={item.image ? 'admin-tryon-upload-card admin-tryon-upload-card--ready' : 'admin-tryon-upload-card'}
            >
              <div>
                <strong>Size {item.size}</strong>
                {item.image && <Badge tone="success">Ready</Badge>}
              </div>
              {item.image ? (
                <img src={item.image.url} alt="" />
              ) : (
                <span className="admin-tryon-upload-placeholder">No image</span>
              )}
              <label className="admin-upload-zone admin-upload-zone--compact">
                <input
                  type="file"
                  accept="image/*"
                  disabled={item.uploading}
                  onChange={(event) => {
                    void handleTryOnImageSelection(item.size, event.target.files?.[0] ?? null)
                    event.target.value = ''
                  }}
                />
                <span>{item.uploading ? 'Uploading...' : item.image ? 'Replace image' : 'Upload image'}</span>
                <small>Same angle / size {item.size}</small>
              </label>
            </article>
          ))}
        </div>
        {!canUploadToBackend && (
          <p className="admin-form-error">
            Hãy lưu sản phẩm trước khi tải ảnh dữ liệu thử đồ.
          </p>
        )}
        {uploadError && <p className="admin-form-error">{uploadError}</p>}
      </div>
      <div className="admin-form-actions">
        <Button onClick={() => onNotify('Đã đưa yêu cầu tạo lại bản xem trước thử đồ vào hàng chờ.')} variant="primary">Tạo lại xem trước</Button>
        <Button onClick={() => onNotify('Đã tắt thử đồ cho sản phẩm này.')} variant="ghost">Tắt thử đồ</Button>
      </div>
    </form>
  )
}

function InventoryPage({
  onAdjustVariant,
}: {
  onAdjustVariant: (variant: ProductVariant) => void
}) {
  const [category, setCategory] = useState('Tất cả danh mục')
  const [size, setSize] = useState(allSizeFilter)
  const [color, setColor] = useState(allColorFilter)
  const [stockStatus, setStockStatus] = useState(allStockFilter)

  const enrichedVariants = variants.map((variant) => ({
    ...variant,
    product: productById(variant.productId),
  }))
  const lowStock = enrichedVariants.filter((variant) => getStockStatus(variant) === 'Low stock')
  const outOfStock = enrichedVariants.filter((variant) => getStockStatus(variant) === 'Out of stock')
  const filteredVariants = enrichedVariants.filter((variant) => {
    const matchesCategory = category === 'Tất cả danh mục' || variant.product?.category === category
    const matchesSize = size === allSizeFilter || variant.size === size
    const matchesColor = color === allColorFilter || variant.color === color
    const matchesStock = stockStatus === allStockFilter || getStockStatus(variant) === stockStatus
    return matchesCategory && matchesSize && matchesColor && matchesStock
  })

  return (
    <div className="admin-page-grid">
      <div className="admin-filter-grid">
        <Field label="Danh mục">
          <SelectInput value={category} onChange={setCategory}>
            {categories.map((item) => <option key={item}>{item}</option>)}
          </SelectInput>
        </Field>
        <Field label="Kích cỡ">
          <SelectInput value={size} onChange={setSize}>
            <option value={allSizeFilter}>{allSizeFilter}</option>
            {sizes.map((item) => <option key={item}>{item}</option>)}
          </SelectInput>
        </Field>
        <Field label="Màu">
          <SelectInput value={color} onChange={setColor}>
            <option value={allColorFilter}>{allColorFilter}</option>
            {colors.map((item) => <option key={item}>{item}</option>)}
          </SelectInput>
        </Field>
        <Field label="Trạng thái kho">
          <SelectInput value={stockStatus} onChange={setStockStatus}>
            <option value={allStockFilter}>{allStockFilter}</option>
            <option value="In stock">{viText('In stock')}</option>
            <option value="Low stock">{viText('Low stock')}</option>
            <option value="Out of stock">{viText('Out of stock')}</option>
          </SelectInput>
        </Field>
      </div>
      <div className="admin-two-column">
        <Panel title="Cảnh báo sắp hết hàng" eyebrow={`${lowStock.length} biến thể`}>
          <AlertList variants={lowStock} onAdjustVariant={onAdjustVariant} />
        </Panel>
        <Panel title="Hết hàng" eyebrow={`${outOfStock.length} biến thể`}>
          <AlertList variants={outOfStock} onAdjustVariant={onAdjustVariant} />
        </Panel>
      </div>
      <Panel title="Bảng tồn kho">
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Sản phẩm</th>
                <th>Danh mục</th>
                <th>Kích cỡ</th>
                <th>Màu</th>
                <th>SKU</th>
                <th>Tồn kho</th>
                <th>Trạng thái</th>
                <th>Điều chỉnh</th>
              </tr>
            </thead>
            <tbody>
              {filteredVariants.map((variant) => (
                <tr key={variant.id}>
                  <td>{variant.product?.name ?? 'Sản phẩm chưa xác định'}</td>
                  <td>{variant.product?.category ?? 'Chưa phân loại'}</td>
                  <td>{variant.size}</td>
                  <td>{variant.color}</td>
                  <td>{variant.sku}</td>
                  <td>{variant.stock}</td>
                  <td><Badge tone={statusTone(getStockStatus(variant))}>{getStockStatus(variant)}</Badge></td>
                  <td><Button onClick={() => onAdjustVariant(variant)} variant="ghost">Điều chỉnh</Button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  )
}

function AlertList({
  variants: alertVariants,
  onAdjustVariant,
}: {
  variants: (ProductVariant & { product?: AdminProduct })[]
  onAdjustVariant: (variant: ProductVariant) => void
}) {
  if (alertVariants.length === 0) {
    return <EmptyState title="Không có biến thể" text="Tồn kho đã chọn hiện đang ổn định." />
  }

  return (
    <div className="admin-alert-list">
      {alertVariants.map((variant) => (
        <article key={variant.id}>
          <div>
            <strong>{variant.product?.name}</strong>
            <span>{variant.size} / {variant.color} - {variant.stock} sản phẩm</span>
          </div>
          <Button onClick={() => onAdjustVariant(variant)} variant="ghost">Điều chỉnh</Button>
        </article>
      ))}
    </div>
  )
}

function InventoryAdjustmentModal({
  variant,
  onClose,
  onNotify,
}: {
  variant: ProductVariant
  onClose: () => void
  onNotify: (message: string) => void
}) {
  return (
    <Modal
      title="Điều chỉnh tồn kho"
      onClose={onClose}
      footer={
        <>
          <Button onClick={onClose} variant="ghost">Hủy</Button>
          <Button
            onClick={() => {
              onNotify(`Đã lưu điều chỉnh tồn kho cho ${getVariantLabel(variant)}.`)
              onClose()
            }}
            variant="primary"
          >
            Lưu điều chỉnh
          </Button>
        </>
      }
    >
      <div className="admin-form-grid">
        <p className="admin-muted-copy">{getVariantLabel(variant)}</p>
        <Field label="Hành động">
          <SelectInput defaultValue="Add stock">
            <option value="Add stock">Nhập thêm hàng</option>
            <option value="Remove stock">Trừ tồn kho</option>
            <option value="Set exact stock">Đặt số lượng chính xác</option>
          </SelectInput>
        </Field>
        <Field label="Số lượng"><TextInput type="number" defaultValue={variant.stock} /></Field>
        <Field label="Lý do">
          <textarea rows={4} placeholder="Nhập hàng, hàng lỗi, điều chỉnh, nhận hàng trả..." />
        </Field>
      </div>
    </Modal>
  )
}

function OrdersPage({
  statusOverrides,
  onStatusChange,
  onPreviewOrder,
}: {
  statusOverrides: Record<string, OrderStatus>
  onStatusChange: (orderId: string, status: OrderStatus) => void
  onPreviewOrder: (order: Order) => void
}) {
  const [status, setStatus] = useState(allStatusFilter)
  const [payment, setPayment] = useState(allPaymentFilter)
  const [delivery, setDelivery] = useState(allDeliveryFilter)
  const [dateRange, setDateRange] = useState('30 days')
  const [search, setSearch] = useState('')

  const visibleOrders = orders.filter((order) => {
    const effectiveStatus = statusOverrides[order.id] ?? order.status
    const searchText = `${order.customerName} ${order.id} ${order.phone}`.toLowerCase()
    return (
      (status === allStatusFilter || effectiveStatus === status) &&
      (payment === allPaymentFilter || order.paymentStatus === payment) &&
      (delivery === allDeliveryFilter || order.deliveryMethod === delivery) &&
      searchText.includes(search.toLowerCase()) &&
      dateRange.length > 0
    )
  })

  return (
    <div className="admin-page-grid">
      <div className="admin-filter-grid admin-filter-grid--wide">
        <Field label="Tìm kiếm"><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Khách hàng, mã đơn, số điện thoại" /></Field>
        <Field label="Trạng thái">
          <SelectInput value={status} onChange={setStatus}>
            <option value={allStatusFilter}>{allStatusFilter}</option>
            {orderStatuses.map((item) => <option key={item} value={item}>{viText(item)}</option>)}
          </SelectInput>
        </Field>
        <Field label="Thanh toán">
          <SelectInput value={payment} onChange={setPayment}>
            <option value={allPaymentFilter}>{allPaymentFilter}</option>
            <option value="Paid">{viText('Paid')}</option>
            <option value="Unpaid">{viText('Unpaid')}</option>
            <option value="Partially refunded">{viText('Partially refunded')}</option>
            <option value="Refunded">{viText('Refunded')}</option>
          </SelectInput>
        </Field>
        <Field label="Giao hàng">
          <SelectInput value={delivery} onChange={setDelivery}>
            <option value={allDeliveryFilter}>{allDeliveryFilter}</option>
            <option value="Standard">{viText('Standard')}</option>
            <option value="Express">{viText('Express')}</option>
            <option value="Store pickup">{viText('Store pickup')}</option>
          </SelectInput>
        </Field>
        <Field label="Khoảng thời gian">
          <SelectInput value={dateRange} onChange={setDateRange}>
            {dateRanges.map((range) => <option key={range} value={range}>{viText(range)}</option>)}
          </SelectInput>
        </Field>
      </div>
      <Panel title="Danh sách đơn hàng" eyebrow={`${visibleOrders.length} đơn hàng`}>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Đơn hàng</th>
                <th>Khách hàng</th>
                <th>Trạng thái</th>
                <th>Thanh toán</th>
                <th>Giao hàng</th>
                <th>Ngày</th>
                <th>Tổng tiền</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {visibleOrders.map((order) => {
                const effectiveStatus = statusOverrides[order.id] ?? order.status

                return (
                  <tr key={order.id}>
                    <td><a className="admin-table-link" href={`/admin/orders/${order.id}`}>{order.id}</a></td>
                    <td>{order.customerName}<small>{order.phone}</small></td>
                    <td>
                      <SelectInput value={effectiveStatus} onChange={(nextStatus) => onStatusChange(order.id, nextStatus as OrderStatus)}>
                        {orderStatuses.map((item) => <option key={item} value={item}>{viText(item)}</option>)}
                      </SelectInput>
                    </td>
                    <td><Badge tone={statusTone(order.paymentStatus)}>{order.paymentStatus}</Badge></td>
                    <td>{viText(order.deliveryMethod)}</td>
                    <td>{order.date}</td>
                    <td>{formatMoney(order.total)}</td>
                    <td>
                      <div className="admin-table-actions">
                        <Button onClick={() => onPreviewOrder(order)} variant="ghost">Xem nhanh</Button>
                        <Button href={`/admin/orders/${order.id}`} variant="ghost">Mở</Button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  )
}

function OrderDetailPage({
  orderId,
  statusOverrides,
  onStatusChange,
  onNotify,
}: {
  orderId?: string
  statusOverrides: Record<string, OrderStatus>
  onStatusChange: (orderId: string, status: OrderStatus) => void
  onNotify: (message: string) => void
}) {
  const order = orders.find((item) => item.id === orderId) ?? orders[0]
  const effectiveStatus = statusOverrides[order.id] ?? order.status

  return (
    <div className="admin-page-grid">
      <Panel>
        <div className="admin-order-heading">
          <div>
            <p className="admin-eyebrow">{order.id}</p>
            <h2>{order.customerName}</h2>
            <p>{order.address}</p>
          </div>
          <div className="admin-detail-hero__actions">
            <SelectInput value={effectiveStatus} onChange={(nextStatus) => onStatusChange(order.id, nextStatus as OrderStatus)}>
              {orderStatuses.map((item) => <option key={item} value={item}>{viText(item)}</option>)}
            </SelectInput>
            <Button onClick={() => onNotify(`Đã đưa hóa đơn ${order.id} vào hàng chờ in.`)} variant="ghost">In hóa đơn</Button>
            <Button onClick={() => onNotify(`Đã đưa phiếu đóng gói ${order.id} vào hàng chờ in.`)} variant="ghost">Phiếu đóng gói</Button>
          </div>
        </div>
      </Panel>
      <div className="admin-two-column">
        <Panel title="Thông tin khách hàng">
          <DescriptionList
            items={[
              ['Tên', order.customerName],
              ['Số điện thoại', order.phone],
              ['Email', order.email],
              ['Mã khách hàng', order.customerId],
            ]}
          />
        </Panel>
        <Panel title="Thanh toán và giao hàng">
          <DescriptionList
            items={[
              ['Thanh toán', order.paymentStatus],
              ['Phương thức giao hàng', order.deliveryMethod],
              ['Tổng tiền', formatMoney(order.total)],
              ['Địa chỉ', order.address],
            ]}
          />
        </Panel>
      </div>
      <Panel title="Sản phẩm đã đặt">
        <div className="admin-item-list">
          {order.items.map((item) => (
            <article key={`${order.id}-${item.productName}`}>
              <img src={item.image} alt="" />
              <div>
                <strong>{item.productName}</strong>
                <span>{item.size} / {item.color} - SL {item.quantity}</span>
              </div>
              <b>{formatMoney(item.price)}</b>
            </article>
          ))}
        </div>
      </Panel>
      <div className="admin-two-column">
        <Panel title="Ghi chú nội bộ">
          <textarea defaultValue={order.internalNote} rows={5} />
        </Panel>
        <Panel title="Dòng thời gian">
          <ol className="admin-activity-list">
            {order.timeline.map((entry) => (
              <li key={`${entry.time}-${entry.event}`}>
                <span>{entry.time}</span>
                <p>{entry.event}<small>{entry.actor}</small></p>
              </li>
            ))}
          </ol>
        </Panel>
      </div>
    </div>
  )
}

function OrderPreviewDrawer({ order, onClose, onNotify }: { order: Order; onClose: () => void; onNotify: (message: string) => void }) {
  return (
    <Drawer
      title={`Xem nhanh ${order.id}`}
      onClose={onClose}
      footer={
        <>
          <Button href={`/admin/orders/${order.id}`} variant="primary">Mở đơn hàng</Button>
          <Button onClick={() => onNotify(`Đã đưa phiếu đóng gói ${order.id} vào hàng chờ in.`)} variant="ghost">In phiếu đóng gói</Button>
        </>
      }
    >
      <div className="admin-page-grid">
        <DescriptionList
          items={[
            ['Khách hàng', order.customerName],
            ['Số điện thoại', order.phone],
            ['Trạng thái', order.status],
            ['Thanh toán', order.paymentStatus],
            ['Giao hàng', order.deliveryMethod],
            ['Tổng tiền', formatMoney(order.total)],
          ]}
        />
        <div className="admin-item-list admin-item-list--compact">
          {order.items.map((item) => (
            <article key={`${order.id}-${item.productName}-preview`}>
              <img src={item.image} alt="" />
              <div>
                <strong>{item.productName}</strong>
                <span>{item.size} / {item.color}</span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </Drawer>
  )
}

function DescriptionList({ items }: { items: [string, string][] }) {
  return (
    <dl className="admin-description-list">
      {items.map(([term, description]) => (
        <div key={term}>
          <dt>{term}</dt>
          <dd>{viText(description)}</dd>
        </div>
      ))}
    </dl>
  )
}

function CustomersPage() {
  const [search, setSearch] = useState('')
  const visibleCustomers = customers.filter((customer) =>
    `${customer.name} ${customer.phone} ${customer.email}`.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className="admin-page-grid">
      <Field label="Tìm khách hàng">
        <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tên, số điện thoại hoặc email" />
      </Field>
      <Panel title="Danh sách khách hàng">
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Tên</th>
                <th>Điện thoại/email</th>
                <th>Tổng đơn</th>
                <th>Tổng chi tiêu</th>
                <th>Đơn gần nhất</th>
                <th>Nhóm khách</th>
              </tr>
            </thead>
            <tbody>
              {visibleCustomers.map((customer) => (
                <tr key={customer.id}>
                  <td><a className="admin-table-link" href={`/admin/customers/${customer.id}`}>{customer.name}</a></td>
                  <td>{customer.phone}<small>{customer.email}</small></td>
                  <td>{customer.totalOrders}</td>
                  <td>{formatMoney(customer.totalSpent)}</td>
                  <td>{customer.lastOrder}</td>
                  <td><Badge tone={statusTone(customer.type)}>{customer.type}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  )
}

function CustomerProfilePage({ customerId }: { customerId?: string }) {
  const customer = customers.find((item) => item.id === customerId) ?? customers[0]
  const purchaseHistory = orders.filter((order) => order.customerId === customer.id)

  return (
    <div className="admin-page-grid">
      <Panel>
        <div className="admin-order-heading">
          <div>
            <p className="admin-eyebrow">{viText(customer.type)}</p>
            <h2>{customer.name}</h2>
            <p>{customer.phone} - {customer.email}</p>
          </div>
          <Badge tone={statusTone(customer.type)}>{customer.type}</Badge>
        </div>
      </Panel>
      <div className="admin-two-column">
        <Panel title="Sở thích">
          <DescriptionList
            items={[
              ['Kích cỡ ưa thích', customer.preferredSize],
              ['Màu yêu thích', customer.favoriteColors.join(', ')],
              ['Kiểu dáng yêu thích', customer.favoriteStyles.join(', ')],
              ['Ghi chú', customer.notes],
            ]}
          />
        </Panel>
        <Panel title="Lịch sử đổi trả">
          <ul className="admin-simple-list">
            {customer.returnHistory.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </Panel>
      </div>
      <Panel title="Lịch sử mua hàng">
        {purchaseHistory.length > 0 ? (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Đơn hàng</th>
                  <th>Ngày</th>
                  <th>Trạng thái</th>
                  <th>Tổng tiền</th>
                </tr>
              </thead>
              <tbody>
                {purchaseHistory.map((order) => (
                  <tr key={order.id}>
                    <td><a className="admin-table-link" href={`/admin/orders/${order.id}`}>{order.id}</a></td>
                    <td>{order.date}</td>
                    <td><Badge tone={statusTone(order.status)}>{order.status}</Badge></td>
                    <td>{formatMoney(order.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState title="Chưa có lịch sử mua hàng" text="Đơn hàng sẽ xuất hiện tại đây sau khi thanh toán." />
        )}
      </Panel>
    </div>
  )
}

function ReturnsPage({ onOpenReturn }: { onOpenReturn: (request: ReturnRequest) => void }) {
  return (
    <div className="admin-page-grid">
      <Panel title="Danh sách yêu cầu đổi trả" eyebrow={`${returnRequests.length} yêu cầu`}>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Mã đơn</th>
                <th>Khách hàng</th>
                <th>Sản phẩm</th>
                <th>Kích cỡ/màu</th>
                <th>Lý do</th>
                <th>Trạng thái</th>
                <th>Chi tiết</th>
              </tr>
            </thead>
            <tbody>
              {returnRequests.map((request) => (
                <tr key={request.id}>
                  <td>{request.orderId}</td>
                  <td>{request.customer}</td>
                  <td>{request.product}</td>
                  <td>{request.size} / {request.color}</td>
                  <td>{viText(request.reason)}</td>
                  <td><Badge tone={statusTone(request.status)}>{request.status}</Badge></td>
                  <td><Button onClick={() => onOpenReturn(request)} variant="ghost">Mở chi tiết</Button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  )
}

function ReturnDetailDrawer({
  request,
  onClose,
  onNotify,
}: {
  request: ReturnRequest
  onClose: () => void
  onNotify: (message: string) => void
}) {
  return (
    <Drawer
      title={`Đổi trả ${request.id}`}
      onClose={onClose}
      footer={
        <>
          <Button onClick={() => onNotify(`Đã bắt đầu luồng đổi hàng cho ${request.id}.`)} variant="primary">Đổi hàng</Button>
          <Button onClick={() => onNotify(`Đã bắt đầu luồng hoàn tiền cho ${request.id}.`)} variant="ghost">Hoàn tiền</Button>
        </>
      }
    >
      <div className="admin-page-grid">
        <DescriptionList
          items={[
            ['Đơn hàng', request.orderId],
            ['Khách hàng', request.customer],
            ['Sản phẩm', request.product],
            ['Kích cỡ/màu', `${request.size} / ${request.color}`],
            ['Lý do', request.reason],
            ['Trạng thái', request.status],
          ]}
        />
        <div className="admin-form-grid">
          <Field label="Cách xử lý">
            <SelectInput defaultValue="Exchange to another size/color">
              <option value="Exchange to another size/color">Đổi sang kích cỡ/màu khác</option>
              <option value="Refund">Hoàn tiền</option>
              <option value="Reject with reason">Từ chối kèm lý do</option>
            </SelectInput>
          </Field>
          <Field label="Kích cỡ đổi"><SelectInput defaultValue="L">{sizes.map((item) => <option key={item}>{item}</option>)}</SelectInput></Field>
          <Field label="Màu đổi"><SelectInput defaultValue={request.color}>{colors.map((item) => <option key={item}>{item}</option>)}</SelectInput></Field>
          <Field label="Ghi chú nội bộ"><textarea rows={4} defaultValue={request.notes} /></Field>
        </div>
      </div>
    </Drawer>
  )
}

function PromotionsPage({ onOpenCampaignModal }: { onOpenCampaignModal: () => void }) {
  return (
    <div className="admin-page-grid">
      <div className="admin-command-row">
        <div />
        <Button onClick={onOpenCampaignModal} variant="primary">Tạo chiến dịch</Button>
      </div>
      <Panel title="Mã giảm giá">
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Mã</th>
                <th>Loại giảm giá</th>
                <th>Ngày bắt đầu/kết thúc</th>
                <th>Giới hạn dùng</th>
                <th>Đơn tối thiểu</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((coupon) => (
                <tr key={coupon.id}>
                  <td><strong>{coupon.code}</strong><small>{coupon.value}</small></td>
                  <td>{viText(coupon.discountType)}</td>
                  <td>{coupon.startDate} - {coupon.endDate}</td>
                  <td>{coupon.usageLimit}</td>
                  <td>{formatMoney(coupon.minimumOrderValue)}</td>
                  <td><Badge tone={statusTone(coupon.status)}>{coupon.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
      <Panel title="Chiến dịch">
        <div className="admin-card-grid">
          {campaigns.map((campaign) => (
            <article key={campaign.id} className="admin-soft-card">
              <Badge tone={statusTone(campaign.status)}>{campaign.status}</Badge>
              <h3>{campaign.name}</h3>
              <p>{campaign.products} sản phẩm - {viText(campaign.uplift)}</p>
            </article>
          ))}
        </div>
      </Panel>
    </div>
  )
}

function CampaignModal({ onClose, onNotify }: { onClose: () => void; onNotify: (message: string) => void }) {
  return (
    <Modal
      title="Tạo chiến dịch"
      onClose={onClose}
      footer={
        <>
          <Button onClick={onClose} variant="ghost">Hủy</Button>
          <Button
            onClick={() => {
              onNotify('Đã tạo bản nháp chiến dịch.')
              onClose()
            }}
            variant="primary"
          >
            Lưu chiến dịch
          </Button>
        </>
      }
    >
      <form className="admin-form-grid">
        <Field label="Loại chiến dịch">
          <SelectInput defaultValue="Office set combo">
            <option value="Office set combo">Combo đồ công sở</option>
            <option value="Blazer sale">Giảm giá blazer</option>
            <option value="New arrival discount">Giảm giá hàng mới</option>
          </SelectInput>
        </Field>
        <Field label="Tên chiến dịch"><TextInput placeholder="Tên chiến dịch" /></Field>
        <Field label="Ngày bắt đầu"><TextInput type="date" /></Field>
        <Field label="Ngày kết thúc"><TextInput type="date" /></Field>
        <Field label="Sản phẩm"><textarea rows={4} placeholder="Chọn hoặc dán mã sản phẩm" /></Field>
      </form>
    </Modal>
  )
}

type CollectionDraft = {
  id?: string
  name: string
  description: string
  coverImage: string
  status: AdminCollection['status']
  productCount: string
}

const emptyCollectionDraft: CollectionDraft = {
  name: '',
  description: '',
  coverImage: '',
  status: 'Draft',
  productCount: '0',
}

const collectionPageSize = 8

function getPaginationItems(currentPage: number, totalPages: number): Array<number | 'ellipsis'> {
  const pages = [1, currentPage - 1, currentPage, currentPage + 1, totalPages]
    .filter((page) => page >= 1 && page <= totalPages)
    .filter((page, index, array) => array.indexOf(page) === index)
    .sort((firstPage, secondPage) => firstPage - secondPage)

  return pages.flatMap((page, index) => {
    const previousPage = pages[index - 1]

    if (previousPage && page - previousPage > 1) {
      return ['ellipsis', page] as const
    }

    return [page]
  })
}

function toCollectionDraft(collection: AdminCollection): CollectionDraft {
  return {
    id: collection.id,
    name: collection.name,
    description: collection.description,
    coverImage: collection.coverImage,
    status: collection.status,
    productCount: String(collection.productCount),
  }
}

function CollectionCover({ src }: { src: string }) {
  const coverSource = src.trim()
  const [failedSource, setFailedSource] = useState('')
  const imageFailed = failedSource === coverSource

  if (!coverSource || imageFailed) {
    return <span className="admin-editorial-placeholder">Ảnh bìa</span>
  }

  return <img src={coverSource} alt="" onError={() => setFailedSource(coverSource)} />
}

function CollectionsPage({
  collectionItems,
  onSaveCollection,
  onDeleteCollection,
  onUploadCoverImage,
}: {
  collectionItems: AdminCollection[]
  onSaveCollection: (collection: CollectionMutation) => Promise<AdminCollection | void>
  onDeleteCollection: (collection: AdminCollection) => Promise<void>
  onUploadCoverImage: (file: File) => Promise<string>
}) {
  const [draft, setDraft] = useState<CollectionDraft>(emptyCollectionDraft)
  const [collectionDialogOpen, setCollectionDialogOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [coverFileName, setCoverFileName] = useState('')
  const [coverUploading, setCoverUploading] = useState(false)
  const [coverUploadError, setCoverUploadError] = useState('')
  const [coverUploadSuccess, setCoverUploadSuccess] = useState('')
  const [currentCollectionPage, setCurrentCollectionPage] = useState(1)
  const editing = Boolean(draft.id)
  const coverPreview = draft.coverImage.trim()
  const totalCollectionPages = Math.max(1, Math.ceil(collectionItems.length / collectionPageSize))
  const activeCollectionPage = Math.min(currentCollectionPage, totalCollectionPages)
  const collectionPageStart = (activeCollectionPage - 1) * collectionPageSize
  const visibleCollectionItems = collectionItems.slice(collectionPageStart, collectionPageStart + collectionPageSize)
  const collectionPaginationItems = getPaginationItems(activeCollectionPage, totalCollectionPages)
  const previewName = draft.name.trim() || 'Tên bộ sưu tập'
  const previewDescription = draft.description.trim() || 'Mô tả bộ sưu tập sẽ hiển thị ở đây.'
  const previewProductCount = Number(draft.productCount) || 0

  const updateDraft = (key: keyof CollectionDraft, value: string) => {
    setDraft((current) => ({ ...current, [key]: value }))
  }

  const resetCollectionForm = () => {
    setDraft(emptyCollectionDraft)
    setCoverFileName('')
    setCoverUploadError('')
    setCoverUploadSuccess('')
  }

  const openCreateCollectionDialog = () => {
    resetCollectionForm()
    setCollectionDialogOpen(true)
  }

  const openEditCollectionDialog = (collection: AdminCollection) => {
    setDraft(toCollectionDraft(collection))
    setCoverFileName('')
    setCoverUploadError('')
    setCoverUploadSuccess('')
    setCollectionDialogOpen(true)
  }

  const closeCollectionDialog = () => {
    setCollectionDialogOpen(false)
    resetCollectionForm()
  }

  const buildCollectionMutation = (coverImage = draft.coverImage): CollectionMutation => {
    const collection: CollectionMutation = {
      name: draft.name.trim(),
      description: draft.description.trim(),
      coverImage: coverImage.trim(),
      status: draft.status,
      productCount: Number(draft.productCount) || 0,
    }

    if (draft.id) {
      collection.id = draft.id
    }

    return collection
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSaving(true)

    try {
      await onSaveCollection(buildCollectionMutation())
      if (!editing) {
        setCurrentCollectionPage(1)
      }
      closeCollectionDialog()
    } finally {
      setSaving(false)
    }
  }

  const handleCoverImageSelection = async (file: File | null) => {
    setCoverUploadError('')
    setCoverUploadSuccess('')

    if (!file) {
      return
    }

    setCoverFileName(file.name)
    setCoverUploading(true)

    try {
      const coverImage = await onUploadCoverImage(file)
      setDraft((current) => ({ ...current, coverImage }))

      if (draft.id && draft.name.trim()) {
        const saved = await onSaveCollection(buildCollectionMutation(coverImage))

        if (saved) {
          setDraft(toCollectionDraft(saved))
        }
      }

      setCoverUploadSuccess(draft.id ? 'Đã lưu ảnh bìa.' : 'Đã thêm ảnh bìa. Hãy lưu bộ sưu tập để hoàn tất.')
    } catch (error) {
      setCoverUploadError(error instanceof Error ? error.message : 'Không thể lưu ảnh bìa.')
    } finally {
      setCoverUploading(false)
    }
  }

  return (
    <div className="admin-page-grid">
      <Panel
        title="Danh sách bộ sưu tập"
        eyebrow={`${collectionItems.length} bộ sưu tập`}
        action={<Button onClick={openCreateCollectionDialog} variant="primary">Tạo bộ sưu tập</Button>}
      >
        {collectionItems.length > 0 ? (
          <>
            <div className="admin-collection-grid">
              {visibleCollectionItems.map((collection) => (
                <article key={collection.id} className="admin-collection-card">
                  <div className="admin-collection-card__media">
                    <CollectionCover src={collection.coverImage} />
                    <span className="admin-collection-card__shine" aria-hidden="true" />
                  </div>
                  <div className="admin-collection-card__body">
                    <div className="admin-collection-card__meta">
                      <span>{collection.productCount} sản phẩm</span>
                      <Badge tone={statusTone(collection.status)}>{collection.status}</Badge>
                    </div>
                    <h3>{collection.name}</h3>
                    <p>{collection.description}</p>
                    <div className="admin-inline-actions admin-collection-card__actions">
                      <Button onClick={() => openEditCollectionDialog(collection)} variant="ghost">Sửa</Button>
                      <Button onClick={() => void onDeleteCollection(collection)} variant="danger">Xóa</Button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
            {totalCollectionPages > 1 && (
              <nav className="admin-pagination" aria-label="Phân trang bộ sưu tập">
                <button
                  type="button"
                  className="admin-pagination__step"
                  disabled={activeCollectionPage === 1}
                  onClick={() => setCurrentCollectionPage((page) => Math.max(1, page - 1))}
                >
                  Trước
                </button>
                <div className="admin-pagination__pages">
                  {collectionPaginationItems.map((item, index) => (
                    item === 'ellipsis' ? (
                      <span key={`ellipsis-${index}`} className="admin-pagination__ellipsis">...</span>
                    ) : (
                      <button
                        key={item}
                        type="button"
                        className={item === activeCollectionPage ? 'admin-pagination__page admin-pagination__page--active' : 'admin-pagination__page'}
                        aria-current={item === activeCollectionPage ? 'page' : undefined}
                        onClick={() => setCurrentCollectionPage(item)}
                      >
                        {item}
                      </button>
                    )
                  ))}
                </div>
                <button
                  type="button"
                  className="admin-pagination__step"
                  disabled={activeCollectionPage === totalCollectionPages}
                  onClick={() => setCurrentCollectionPage((page) => Math.min(totalCollectionPages, page + 1))}
                >
                  Sau
                </button>
              </nav>
            )}
          </>
        ) : (
          <EmptyState
            title="Chưa có bộ sưu tập"
            text="Tạo bộ sưu tập đầu tiên để hiển thị trên trang chủ và trang danh mục."
            action={<Button onClick={openCreateCollectionDialog} variant="primary">Tạo bộ sưu tập</Button>}
          />
        )}
      </Panel>
      {collectionDialogOpen && (
        <Modal
          title={editing ? 'Sửa bộ sưu tập' : 'Tạo bộ sưu tập'}
          onClose={closeCollectionDialog}
          className="admin-modal--collection"
        >
          <div className="admin-collection-dialog">
            <form className="admin-collection-form" onSubmit={handleSubmit}>
              <Field label="Tên">
                <input
                  value={draft.name}
                  required
                  onChange={(event) => updateDraft('name', event.target.value)}
                />
              </Field>
              <div className="admin-collection-form__row">
                <Field label="Số sản phẩm">
                  <input
                    type="number"
                    min="0"
                    value={draft.productCount}
                    onChange={(event) => updateDraft('productCount', event.target.value)}
                  />
                </Field>
                <Field label="Trạng thái">
                  <SelectInput value={draft.status} onChange={(value) => updateDraft('status', value)}>
                    <option value="Draft">{viText('Draft')}</option>
                    <option value="Published">{viText('Published')}</option>
                    <option value="Hidden">{viText('Hidden')}</option>
                  </SelectInput>
                </Field>
              </div>
              <Field label="Mô tả">
                <textarea
                  rows={4}
                  value={draft.description}
                  onChange={(event) => updateDraft('description', event.target.value)}
                />
              </Field>
              <div className="admin-field">
                <span>Ảnh bìa</span>
                <div className="admin-cover-picker">
                  <label>
                    <input
                      type="file"
                      accept="image/*"
                      disabled={coverUploading}
                      onChange={(event) => {
                        void handleCoverImageSelection(event.target.files?.[0] ?? null)
                      }}
                    />
                    <strong>{coverFileName || 'Chọn ảnh bìa'}</strong>
                    <small>{coverUploading ? 'Đang lưu ảnh...' : 'Ảnh bìa dùng cho thẻ bộ sưu tập trên trang chủ.'}</small>
                  </label>
                  {coverUploadError && <p className="admin-form-error">{coverUploadError}</p>}
                  {coverUploadSuccess && <p className="admin-form-success">{coverUploadSuccess}</p>}
                </div>
              </div>
              <div className="admin-form-actions">
                <Button type="submit" variant="primary">
                  {saving ? 'Đang lưu...' : editing ? 'Lưu thay đổi' : 'Tạo bộ sưu tập'}
                </Button>
                <Button onClick={closeCollectionDialog} variant="ghost">
                  Hủy
                </Button>
              </div>
            </form>
            <aside className="admin-collection-preview" aria-label="Xem trước bộ sưu tập">
              <p className="admin-eyebrow">Xem trước trang chủ</p>
              <article className="admin-collection-card admin-collection-card--preview">
                <div className="admin-collection-card__media">
                  <CollectionCover src={coverPreview} />
                  <span className="admin-collection-card__shine" aria-hidden="true" />
                </div>
                <div className="admin-collection-card__body">
                  <span className="admin-collection-card__count">{previewProductCount} sản phẩm</span>
                  <h3>{previewName}</h3>
                  <p>{previewDescription}</p>
                </div>
              </article>
            </aside>
          </div>
        </Modal>
      )}
    </div>
  )
}

function LookbookPage() {
  return (
    <div className="admin-page-grid">
      <Panel title="Gợi ý phối đồ">
        <div className="admin-lookbook-grid">
          {lookbooks.map((lookbook) => (
            <article key={lookbook.id} className="admin-lookbook-card">
              <img src={lookbook.image} alt="" />
              <div>
                <Badge tone={statusTone(lookbook.visibility)}>{lookbook.visibility}</Badge>
                <h3>{lookbook.title}</h3>
                <p>{lookbook.description}</p>
                <ul>
                  {lookbook.linkedProducts.map((product) => <li key={product}>{product}</li>)}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </Panel>
      <Panel title="Tạo phối đồ">
        <form className="admin-form-grid">
          <Field label="Tiêu đề phối đồ"><TextInput defaultValue="Sơ mi trắng, blazer be, quần âu đen" /></Field>
          <Field label="Hình ảnh"><TextInput placeholder="Tải lên hoặc chọn ảnh" /></Field>
          <Field label="Sản phẩm liên kết"><textarea rows={4} defaultValue="Sơ mi trắng&#10;Blazer be&#10;Quần âu đen&#10;Giày tối giản" /></Field>
          <Field label="Mô tả"><textarea rows={4} /></Field>
          <Field label="Hiển thị"><SelectInput defaultValue="Visible"><option value="Visible">{viText('Visible')}</option><option value="Hidden">{viText('Hidden')}</option></SelectInput></Field>
        </form>
      </Panel>
    </div>
  )
}

function ContentPage() {
  return (
    <div className="admin-page-grid">
      <Panel title="Quản lý hero trang chủ">
        <form className="admin-form-grid">
          <Field label="Ảnh hero"><TextInput defaultValue="hero-cong-so.jpg" /></Field>
          <Field label="Tiêu đề"><TextInput defaultValue="Tự tin nhẹ nhàng cho ngày làm việc" /></Field>
          <Field label="Phụ đề"><textarea rows={3} defaultValue="Thời trang công sở tối giản cho nhịp sống hiện đại." /></Field>
          <Field label="Nội dung nút"><TextInput defaultValue="Mua bộ sưu tập" /></Field>
          <Field label="Liên kết nút"><TextInput defaultValue="/#collection" /></Field>
        </form>
      </Panel>
      <div className="admin-content-accordion">
        {['Quản lý banner', 'Quản lý câu hỏi thường gặp', 'Quản lý hướng dẫn kích cỡ', 'Quản lý hướng dẫn chất liệu'].map((section) => (
          <details key={section} className="admin-collapsible">
            <summary>{section}</summary>
            <div className="admin-form-grid">
              <Field label="Tiêu đề"><TextInput defaultValue={section.replace('Quản lý ', '')} /></Field>
              <Field label="Nội dung"><textarea rows={4} /></Field>
              <Button variant="ghost">Lưu mục</Button>
            </div>
          </details>
        ))}
      </div>
      <Panel title="Trang chính sách">
        <div className="admin-card-grid">
          {['Vận chuyển', 'Đổi trả', 'Quyền riêng tư', 'Điều khoản'].map((policy) => (
            <article key={policy} className="admin-soft-card">
              <h3>{policy}</h3>
              <p>Chỉnh sửa lần cuối tháng 5/2026. Nên rà soát bản nháp trước khi xuất bản.</p>
              <Button variant="ghost">Sửa chính sách</Button>
            </article>
          ))}
        </div>
      </Panel>
    </div>
  )
}

function TryOnAdminPage({ onNotify }: { onNotify: (message: string) => void }) {
  return (
    <div className="admin-page-grid">
      <Panel title="Quản lý ảnh thử đồ">
        <div className="admin-tryon-grid">
          {tryOnGarments.map((garment) => (
            <article key={garment.id} className="admin-tryon-card">
              <img src={garment.previewImage} alt="" />
              <div>
                <Badge tone={statusTone(garment.processingStatus)}>{garment.processingStatus}</Badge>
                <h3>{garment.product}</h3>
                <DescriptionList
                  items={[
                    ['Danh mục', garment.category],
                    ['Kiểu trang phục', garment.garmentType],
                    ['Màu', garment.color],
                    ['Kích cỡ', garment.size],
                    ['Bật thử đồ', garment.enabled ? 'true' : 'false'],
                  ]}
                />
                <div className="admin-inline-actions">
                  <Button onClick={() => onNotify(`Đã mở tải ảnh cho ${garment.product}.`)} variant="ghost">Tải ảnh trang phục</Button>
                  <Button onClick={() => onNotify(`Đã đưa yêu cầu tạo lại bản thử đồ cho ${garment.product} vào hàng chờ.`)} variant="ghost">Tạo lại xem trước</Button>
                  <Button onClick={() => onNotify(`Đã tắt thử đồ cho ${garment.product}.`)} variant="ghost">Tắt thử đồ</Button>
                  <Button onClick={() => onNotify(`Đã mở bản xem trước cho ${garment.product}.`)} variant="primary">Xem trước</Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </Panel>
    </div>
  )
}

function ReportsPage() {
  return (
    <div className="admin-page-grid">
      <div className="admin-overview-toolbar">
        <Field label="Khoảng thời gian">
          <SelectInput defaultValue="30 days">
            {dateRanges.map((range) => <option key={range} value={range}>{viText(range)}</option>)}
          </SelectInput>
        </Field>
        <Button variant="primary">Xuất CSV</Button>
      </div>
      <div className="admin-dashboard-layout">
        <Panel title="Xu hướng doanh thu">
          <HorizontalBars data={analytics.revenueTrend} valueLabel={formatMoney} />
        </Panel>
        <Panel title="Doanh số theo danh mục">
          <BarChart data={analytics.salesByCategory} />
        </Panel>
        <Panel title="Trạng thái đơn hàng">
          <DonutChart data={analytics.orderStatus} />
        </Panel>
      </div>
      <div className="admin-two-column">
        <Panel title="Sản phẩm bán chạy nhất">
          <CompactProductTable products={adminProducts.slice(0, 4)} />
        </Panel>
        <Panel title="Sản phẩm bị trả nhiều nhất">
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead><tr><th>Sản phẩm</th><th>Tỷ lệ</th><th>Lý do</th></tr></thead>
              <tbody>
                {analytics.topReturned.map((item) => (
                  <tr key={item.product}><td>{item.product}</td><td>{item.rate}</td><td>{viText(item.reason)}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>
      <div className="admin-two-column">
        <Panel title="Kích cỡ bán chạy"><HorizontalBars data={analytics.topSizes} /></Panel>
        <Panel title="Màu bán chạy"><BarChart data={analytics.topColors} /></Panel>
      </div>
      <Panel title="Sản phẩm hiệu quả thấp">
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead><tr><th>Sản phẩm</th><th>Lượt xem</th><th>Chuyển đổi</th><th>Ghi chú</th></tr></thead>
            <tbody>
              {analytics.lowPerforming.map((item) => (
                <tr key={item.product}><td>{item.product}</td><td>{item.views}</td><td>{item.conversion}</td><td>{item.note}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  )
}

function CompactProductTable({ products }: { products: AdminProduct[] }) {
  return (
    <div className="admin-table-wrap">
      <table className="admin-table">
        <thead><tr><th>Sản phẩm</th><th>Danh mục</th><th>Doanh thu</th></tr></thead>
        <tbody>
          {products.map((product, index) => (
            <tr key={product.id}>
              <td>{product.name}</td>
              <td>{product.category}</td>
              <td>{formatMoney((products.length - index) * 940)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function StaffPage() {
  return (
    <div className="admin-page-grid">
      <Panel title="Danh sách người dùng">
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead><tr><th>Tên</th><th>Email</th><th>Vai trò</th><th>Trạng thái</th><th>Đăng nhập gần nhất</th></tr></thead>
            <tbody>
              {staff.map((member) => (
                <tr key={member.id}>
                  <td>{member.name}</td>
                  <td>{member.email}</td>
                  <td>{viText(member.role)}</td>
                  <td><Badge tone={statusTone(member.status)}>{member.status}</Badge></td>
                  <td>{member.lastLogin}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
      <div className="admin-two-column">
        <Panel title="Mô hình phân quyền">
          <div className="admin-permission-list">
            {permissionMatrix.map((role) => (
              <article key={role.role}>
                <strong>{viText(role.role)}</strong>
                <span>{role.permissions}</span>
              </article>
            ))}
          </div>
        </Panel>
        <Panel title="Nhật ký hoạt động">
          <ol className="admin-activity-list">
            {activityLog.map((entry) => (
              <li key={`${entry.actor}-${entry.time}`}>
                <span>{entry.time}</span>
                <p>{entry.actor}<small>{entry.action}</small></p>
              </li>
            ))}
          </ol>
        </Panel>
      </div>
    </div>
  )
}

function SettingsPage() {
  return (
    <div className="admin-page-grid">
      <div className="admin-settings-grid">
        {[
          'Thông tin cửa hàng',
          'Tiền tệ',
          'Cài đặt ngôn ngữ',
          'Cài đặt vận chuyển',
          'Cài đặt thanh toán',
          'Cài đặt chính sách đổi trả',
          'Ngưỡng sắp hết hàng',
          'Cài đặt thông báo',
        ].map((section) => (
          <Panel key={section} title={section}>
            <form className="admin-form-grid admin-form-grid--single">
              <Field label="Thiết lập chính"><TextInput defaultValue={section === 'Tiền tệ' ? 'Đồng Việt Nam (VND)' : 'Đang bật'} /></Field>
              <Field label="Ghi chú"><textarea rows={3} placeholder="Ghi chú cấu hình nội bộ" /></Field>
              <Button variant="ghost">Lưu cài đặt</Button>
            </form>
          </Panel>
        ))}
      </div>
    </div>
  )
}

function Toast({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  return (
    <div className="admin-toast" role="status">
      <span>{message}</span>
      <button type="button" onClick={onDismiss} aria-label="Tắt thông báo">Tắt</button>
    </div>
  )
}

function AdminPageContent({
  route,
  products,
  collectionItems,
  productTab,
  onChangeProductTab,
  statusOverrides,
  onStatusChange,
  onPreviewOrder,
  onAdjustVariant,
  onOpenReturn,
  onOpenCampaignModal,
  onConfirmDelete,
  onSaveProduct,
  onSaveCollection,
  onDeleteCollection,
  onUploadCollectionCoverImage,
  onNotify,
}: {
  route: AdminRoute
  products: AdminProduct[]
  collectionItems: AdminCollection[]
  productTab: ProductTab
  onChangeProductTab: (tab: ProductTab) => void
  statusOverrides: Record<string, OrderStatus>
  onStatusChange: (orderId: string, status: OrderStatus) => void
  onPreviewOrder: (order: Order) => void
  onAdjustVariant: (variant: ProductVariant) => void
  onOpenReturn: (request: ReturnRequest) => void
  onOpenCampaignModal: () => void
  onConfirmDelete: (product: AdminProduct) => void
  onSaveProduct: (product: ProductMutation) => Promise<AdminProduct>
  onSaveCollection: (collection: CollectionMutation) => Promise<void>
  onDeleteCollection: (collection: AdminCollection) => Promise<void>
  onUploadCollectionCoverImage: (file: File) => Promise<string>
  onNotify: (message: string) => void
}) {
  switch (route.view) {
    case 'overview':
      return <OverviewPage onNotify={onNotify} />
    case 'orders':
      return <OrdersPage statusOverrides={statusOverrides} onStatusChange={onStatusChange} onPreviewOrder={onPreviewOrder} />
    case 'order-detail':
      return <OrderDetailPage orderId={route.id} statusOverrides={statusOverrides} onStatusChange={onStatusChange} onNotify={onNotify} />
    case 'products':
      return <ProductListPage products={products} onNotify={onNotify} onConfirmDelete={onConfirmDelete} />
    case 'product-new':
      return <ProductListPage products={products} onNotify={onNotify} onConfirmDelete={onConfirmDelete} />
    case 'product-detail':
      return <ProductDetailPage products={products} productId={route.id} activeTab={productTab} onChangeTab={onChangeProductTab} onNotify={onNotify} onSaveProduct={onSaveProduct} />
    case 'inventory':
      return <InventoryPage onAdjustVariant={onAdjustVariant} />
    case 'customers':
      return <CustomersPage />
    case 'customer-detail':
      return <CustomerProfilePage customerId={route.id} />
    case 'returns':
      return <ReturnsPage onOpenReturn={onOpenReturn} />
    case 'promotions':
      return <PromotionsPage onOpenCampaignModal={onOpenCampaignModal} />
    case 'collections':
      return <CollectionsPage collectionItems={collectionItems} onSaveCollection={onSaveCollection} onDeleteCollection={onDeleteCollection} onUploadCoverImage={onUploadCollectionCoverImage} />
    case 'lookbook':
      return <LookbookPage />
    case 'content':
      return <ContentPage />
    case 'try-on':
      return <TryOnAdminPage onNotify={onNotify} />
    case 'reports':
      return <ReportsPage />
    case 'staff':
      return <StaffPage />
    case 'settings':
      return <SettingsPage />
    default:
      return <OverviewPage onNotify={onNotify} />
  }
}

export function AdminApp() {
  const route = resolveAdminRoute(window.location.pathname)
  const activeNav = getActiveNav(route.view)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [toast, setToast] = useState('')
  const [databaseProducts, setDatabaseProducts] = useState<AdminProduct[]>([])
  const [databaseCollections, setDatabaseCollections] = useState<AdminCollection[]>([])
  const [localCollections, setLocalCollections] = useState<AdminCollection[]>(fallbackCollections)
  const [productTab, setProductTab] = useState<ProductTab>('Thông tin cơ bản')
  const [statusOverrides, setStatusOverrides] = useState<Record<string, OrderStatus>>({})
  const [previewOrderId, setPreviewOrderId] = useState<string | null>(null)
  const [adjustVariantId, setAdjustVariantId] = useState<string | null>(null)
  const [openReturnId, setOpenReturnId] = useState<string | null>(null)
  const [campaignModalOpen, setCampaignModalOpen] = useState(false)
  const [deleteProductId, setDeleteProductId] = useState<string | null>(null)

  const previewOrder = orders.find((order) => order.id === previewOrderId)
  const adjustVariant = variants.find((variant) => variant.id === adjustVariantId)
  const openReturn = returnRequests.find((request) => request.id === openReturnId)
  const productCatalog = databaseProducts.length > 0 ? databaseProducts : adminProducts
  const collectionCatalog = databaseCollections.length > 0 ? databaseCollections : localCollections
  const deleteProduct = productCatalog.find((product) => product.id === deleteProductId)
  const chromeRoute: AdminRoute = route.view === 'product-new' ? { view: 'products' } : route

  useEffect(() => {
    let active = true

    fetchAdminProducts()
      .then((products) => {
        if (active && products.length > 0) {
          setDatabaseProducts(products)
        }
      })
      .catch(() => {
        if (active) {
          setDatabaseProducts([])
        }
      })

    fetchAdminCollections()
      .then((collections) => {
        if (active && collections.length > 0) {
          setDatabaseCollections(collections)
        }
      })
      .catch(() => {
        if (active) {
          setDatabaseCollections([])
        }
      })

    return () => {
      active = false
    }
  }, [])

  const notify = (message: string) => {
    setToast(message)
    window.setTimeout(() => setToast(''), 3600)
  }

  const handleStatusChange = (orderId: string, status: OrderStatus) => {
    setStatusOverrides((current) => ({ ...current, [orderId]: status }))
    notify(`${orderId} đã chuyển sang ${viText(status)}.`)
  }

  const handleSaveProduct = async (product: ProductMutation) => {
    const payload = product.id && isUuid(product.id) ? product : { ...product, id: undefined }
    const saved = await saveAdminProduct(payload)

    setDatabaseProducts((current) => [
      saved,
      ...current.filter((item) => item.id !== saved.id && item.id !== product.id),
    ])

    return saved
  }

  const handleSaveCollection = async (collection: CollectionMutation) => {
    const payload = collection.id && isUuid(collection.id)
      ? collection
      : { ...collection, id: undefined }

    try {
      const saved = await saveAdminCollection(payload)

      setDatabaseCollections((current) => [
        saved,
        ...current.filter((item) => item.id !== saved.id && item.id !== collection.id),
      ])
      setLocalCollections((current) => [
        saved,
        ...current.filter((item) => item.id !== saved.id && item.id !== collection.id),
      ])
      notify(collection.id && isUuid(collection.id) ? 'Đã lưu bộ sưu tập.' : 'Đã tạo bộ sưu tập trong cơ sở dữ liệu.')
    } catch (error) {
      const fallbackCollection: AdminCollection = {
        ...collection,
        id: collection.id ?? `COL-${Date.now()}`,
      }
      setLocalCollections((current) => [
        fallbackCollection,
        ...current.filter((item) => item.id !== fallbackCollection.id),
      ])
      notify(error instanceof Error ? `Chưa lưu được vào cơ sở dữ liệu: ${error.message}` : 'Chưa lưu được vào cơ sở dữ liệu.')
    }
  }

  const handleDeleteCollection = async (collection: AdminCollection) => {
    if (!isUuid(collection.id)) {
      setLocalCollections((current) => current.filter((item) => item.id !== collection.id))
      notify('Đã xóa bộ sưu tập khỏi danh sách.')
      return
    }

    try {
      await removeAdminCollection(collection.id)
      setDatabaseCollections((current) => current.filter((item) => item.id !== collection.id))
      setLocalCollections((current) => current.filter((item) => item.id !== collection.id))
      notify('Đã xóa bộ sưu tập khỏi cơ sở dữ liệu.')
    } catch (error) {
      notify(error instanceof Error ? `Không thể xóa bộ sưu tập: ${error.message}` : 'Không thể xóa bộ sưu tập.')
    }
  }

  return (
    <div className="admin-shell">
      <AdminSidebar activeNav={activeNav} mobileOpen={mobileNavOpen} onCloseMobile={() => setMobileNavOpen(false)} />
      <div className="admin-main">
        <AdminTopbar
          products={productCatalog}
          collectionItems={collectionCatalog}
          onOpenMobileNav={() => setMobileNavOpen(true)}
          profileOpen={profileOpen}
          onToggleProfile={() => setProfileOpen((current) => !current)}
          onNotify={notify}
        />
        <main className="admin-content" id="main">
          <PageChrome route={chromeRoute}>
            <AdminPageContent
              route={route}
              products={productCatalog}
              collectionItems={collectionCatalog}
              productTab={productTab}
              onChangeProductTab={setProductTab}
              statusOverrides={statusOverrides}
              onStatusChange={handleStatusChange}
              onPreviewOrder={(order) => setPreviewOrderId(order.id)}
              onAdjustVariant={(variant) => setAdjustVariantId(variant.id)}
              onOpenReturn={(request) => setOpenReturnId(request.id)}
              onOpenCampaignModal={() => setCampaignModalOpen(true)}
              onConfirmDelete={(product) => setDeleteProductId(product.id)}
              onSaveProduct={handleSaveProduct}
              onSaveCollection={handleSaveCollection}
              onDeleteCollection={handleDeleteCollection}
              onUploadCollectionCoverImage={uploadCollectionCoverImage}
              onNotify={notify}
            />
          </PageChrome>
        </main>
      </div>

      {route.view === 'product-new' && (
        <Modal
          title="Tạo sản phẩm"
          onClose={() => {
            window.location.href = '/admin/products'
          }}
          className="admin-modal--product-editor"
        >
          <ProductDetailPage
            products={productCatalog}
            isNew
            activeTab={productTab}
            onChangeTab={setProductTab}
            onNotify={notify}
            onSaveProduct={handleSaveProduct}
          />
        </Modal>
      )}
      {previewOrder && <OrderPreviewDrawer order={previewOrder} onClose={() => setPreviewOrderId(null)} onNotify={notify} />}
      {adjustVariant && <InventoryAdjustmentModal variant={adjustVariant} onClose={() => setAdjustVariantId(null)} onNotify={notify} />}
      {openReturn && <ReturnDetailDrawer request={openReturn} onClose={() => setOpenReturnId(null)} onNotify={notify} />}
      {campaignModalOpen && <CampaignModal onClose={() => setCampaignModalOpen(false)} onNotify={notify} />}
      {deleteProduct && (
        <ConfirmDialog
          title="Xóa sản phẩm?"
          text={`${deleteProduct.name} sẽ được xóa sau khi API xóa thật được kết nối. Giao diện này chỉ xác nhận thao tác xóa và chưa gỡ dòng dữ liệu.`}
          confirmLabel="Xóa"
          onCancel={() => setDeleteProductId(null)}
          onConfirm={() => {
            notify(`Đã xác nhận xóa ${deleteProduct.name}.`)
            setDeleteProductId(null)
          }}
        />
      )}
      {toast && <Toast message={toast} onDismiss={() => setToast('')} />}
    </div>
  )
}
