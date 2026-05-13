export type StockStatus = 'In stock' | 'Low stock' | 'Out of stock'
export type ProductStatus = 'draft' | 'active' | 'hidden'
export type FitType = 'slim' | 'regular' | 'relaxed' | 'oversized'

export type ProductVariant = {
  id: string
  productId: string
  size: 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL'
  color: string
  sku: string
  stock: number
  lowStockThreshold: number
  priceOverride?: number
}

export type AdminProduct = {
  id: string
  name: string
  slug: string
  category: string
  collection: string
  price: number
  salePrice?: number
  material: string
  fitType: FitType
  tags: string[]
  status: ProductStatus
  visibility: 'Visible' | 'Hidden'
  updatedAt: string
  image: string
  description: string
  seoTitle: string
  seoDescription: string
  tryOnStatus: 'Ready' | 'Needs image' | 'Processing' | 'Failed'
}

export type OrderStatus =
  | 'Pending confirmation'
  | 'Confirmed'
  | 'Preparing'
  | 'Shipping'
  | 'Completed'
  | 'Cancelled'
  | 'Return requested'
  | 'Refunded'

export type Order = {
  id: string
  customerId: string
  customerName: string
  phone: string
  email: string
  status: OrderStatus
  paymentStatus: 'Paid' | 'Unpaid' | 'Partially refunded' | 'Refunded'
  deliveryMethod: 'Standard' | 'Express' | 'Store pickup'
  date: string
  total: number
  address: string
  internalNote: string
  items: {
    productName: string
    image: string
    size: string
    color: string
    quantity: number
    price: number
  }[]
  timeline: {
    time: string
    event: string
    actor: string
  }[]
}

export type Customer = {
  id: string
  name: string
  phone: string
  email: string
  totalOrders: number
  totalSpent: number
  lastOrder: string
  type: 'New' | 'Returning' | 'VIP' | 'Inactive'
  preferredSize: string
  favoriteColors: string[]
  favoriteStyles: string[]
  notes: string
  returnHistory: string[]
}

export type ReturnRequest = {
  id: string
  orderId: string
  customer: string
  product: string
  size: string
  color: string
  reason:
    | 'Wrong size'
    | 'Wrong color'
    | 'Does not fit'
    | 'Product defect'
    | 'Changed mind'
  status: 'Requested' | 'Approved' | 'Rejected' | 'Received' | 'Exchanged' | 'Refunded'
  requestedAt: string
  notes: string
}

export type Coupon = {
  id: string
  code: string
  discountType: 'percentage' | 'fixed' | 'free shipping'
  value: string
  startDate: string
  endDate: string
  usageLimit: number
  minimumOrderValue: number
  status: 'Scheduled' | 'Active' | 'Paused' | 'Expired'
}

export type Collection = {
  id: string
  name: string
  description: string
  coverImage: string
  status: 'Draft' | 'Published' | 'Hidden'
  productCount: number
}

export type Lookbook = {
  id: string
  title: string
  image: string
  linkedProducts: string[]
  description: string
  visibility: 'Visible' | 'Hidden'
}

export type TryOnGarment = {
  id: string
  product: string
  cleanImage: string
  modelImage: string
  previewImage: string
  category: 'upper_body' | 'lower_body' | 'dress' | 'outerwear'
  garmentType: string
  color: string
  size: string
  enabled: boolean
  processingStatus: 'Ready' | 'Needs image' | 'Processing' | 'Failed'
}

export type StaffMember = {
  id: string
  name: string
  email: string
  role: 'Owner' | 'Manager' | 'Sales' | 'Inventory' | 'Content'
  status: 'Active' | 'Invited' | 'Suspended'
  lastLogin: string
}

export const productImages = {
  ivoryShirt:
    'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=900&q=80',
  beigeBlazer:
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=900&q=80',
  blackTrousers:
    'https://images.unsplash.com/photo-1483988350575-af1b22408832?auto=format&fit=crop&w=900&q=80',
  knitDress:
    'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=900&q=80',
  pencilSkirt:
    'https://images.unsplash.com/photo-1551803091-e20673f15770?auto=format&fit=crop&w=900&q=80',
  silkBlouse:
    'https://images.unsplash.com/photo-1554412933-514a83d2f3c8?auto=format&fit=crop&w=900&q=80',
}

export const adminProducts: AdminProduct[] = [
  {
    id: 'PRD-1001',
    name: 'Áo sơ mi cấu trúc trắng ngà',
    slug: 'ivory-structure-shirt',
    category: 'Áo sơ mi',
    collection: 'Công sở thanh lịch',
    price: 148,
    salePrice: 132,
    material: 'Cotton poplin co giãn nhẹ',
    fitType: 'regular',
    tags: ['công sở', 'sơ mi trắng', 'phối lớp'],
    status: 'active',
    visibility: 'Visible',
    updatedAt: '2026-05-12',
    image: productImages.ivoryShirt,
    description:
      'Áo sơ mi đứng dáng nhưng mềm mại cho ngày làm việc dài, có cổ tinh gọn và đường eo nhẹ.',
    seoTitle: 'Áo sơ mi cấu trúc trắng ngà | Thời trang công sở Hichic',
    seoDescription: 'Áo sơ mi trắng chỉn chu dành cho tủ đồ công sở hiện đại.',
    tryOnStatus: 'Ready',
  },
  {
    id: 'PRD-1002',
    name: 'Áo blazer be Sandline',
    slug: 'sandline-beige-blazer',
    category: 'Áo blazer',
    collection: 'May đo thứ Hai',
    price: 218,
    material: 'Vải pha linen và viscose',
    fitType: 'relaxed',
    tags: ['blazer', 'trung tính', 'đồ công sở'],
    status: 'active',
    visibility: 'Visible',
    updatedAt: '2026-05-11',
    image: productImages.beigeBlazer,
    description:
      'Áo blazer có phom mềm, vai gọn, dễ phối từ bàn làm việc đến buổi tối.',
    seoTitle: 'Sandline Beige Blazer | Hichic',
    seoDescription: 'Áo blazer trung tính, thanh lịch cho phong cách công sở.',
    tryOnStatus: 'Processing',
  },
  {
    id: 'PRD-1003',
    name: 'Quần âu đen dáng suông',
    slug: 'black-column-trousers',
    category: 'Quần âu',
    collection: 'Tủ đồ nền tảng',
    price: 165,
    material: 'Vải twill co giãn và hồi phom',
    fitType: 'slim',
    tags: ['quần âu', 'đen', 'cơ bản'],
    status: 'active',
    visibility: 'Visible',
    updatedAt: '2026-05-10',
    image: productImages.blackTrousers,
    description:
      'Quần dài chạm mắt cá, mặt trước gọn và đường may sắc nét cho đồng phục công sở hằng ngày.',
    seoTitle: 'Quần âu đen dáng suông | Hichic',
    seoDescription: 'Quần công sở đen được may chỉnh chu với phom sắc nét.',
    tryOnStatus: 'Ready',
  },
  {
    id: 'PRD-1004',
    name: 'Đầm dệt kim nâu xám mềm',
    slug: 'soft-taupe-knit-dress',
    category: 'Đầm',
    collection: 'Điểm nhấn mềm',
    price: 188,
    material: 'Vải dệt kim viscose gân',
    fitType: 'regular',
    tags: ['đầm', 'dệt kim', 'nâu xám'],
    status: 'draft',
    visibility: 'Hidden',
    updatedAt: '2026-05-08',
    image: productImages.knitDress,
    description:
      'Đầm dệt kim tinh tế với độ rũ nhẹ, phù hợp cho buổi thuyết trình và thứ Sáu thoải mái.',
    seoTitle: 'Đầm dệt kim nâu xám mềm | Hichic',
    seoDescription: 'Đầm dệt kim nâu xám thanh lịch cho công sở và sau giờ làm.',
    tryOnStatus: 'Needs image',
  },
  {
    id: 'PRD-1005',
    name: 'Chân váy bút chì than chì',
    slug: 'graphite-pencil-skirt',
    category: 'Chân váy',
    collection: 'Tủ đồ nền tảng',
    price: 128,
    material: 'Vải twill may suit dày dặn',
    fitType: 'slim',
    tags: ['chân váy', 'than chì', 'may đo'],
    status: 'active',
    visibility: 'Visible',
    updatedAt: '2026-05-07',
    image: productImages.pencilSkirt,
    description: 'Chân váy bút chì sắc gọn với xẻ sau và lưng cao thoải mái.',
    seoTitle: 'Chân váy bút chì than chì | Hichic',
    seoDescription: 'Chân váy bút chì công sở tối giản với sắc than chì dễ phối.',
    tryOnStatus: 'Ready',
  },
  {
    id: 'PRD-1006',
    name: 'Áo blouse lụa ngọc trai',
    slug: 'pearl-drape-blouse',
    category: 'Áo blouse',
    collection: 'Công sở thanh lịch',
    price: 142,
    material: 'Satin xử lý mềm',
    fitType: 'relaxed',
    tags: ['blouse', 'satin', 'mềm mại'],
    status: 'hidden',
    visibility: 'Hidden',
    updatedAt: '2026-05-05',
    image: productImages.silkBlouse,
    description: 'Áo blouse ánh nhẹ với cổ đổ mềm và tay áo thoải mái.',
    seoTitle: 'Áo blouse lụa ngọc trai | Hichic',
    seoDescription: 'Áo blouse satin mềm cho phong cách công sở tinh tế.',
    tryOnStatus: 'Failed',
  },
]

export const variants: ProductVariant[] = [
  { id: 'VAR-001', productId: 'PRD-1001', size: 'XS', color: 'Trắng ngà', sku: 'HIC-SH-IVO-XS', stock: 18, lowStockThreshold: 6 },
  { id: 'VAR-002', productId: 'PRD-1001', size: 'S', color: 'Trắng ngà', sku: 'HIC-SH-IVO-S', stock: 4, lowStockThreshold: 7 },
  { id: 'VAR-003', productId: 'PRD-1001', size: 'M', color: 'Trắng ngà', sku: 'HIC-SH-IVO-M', stock: 0, lowStockThreshold: 7 },
  { id: 'VAR-004', productId: 'PRD-1002', size: 'S', color: 'Be', sku: 'HIC-BZ-BEI-S', stock: 11, lowStockThreshold: 5 },
  { id: 'VAR-005', productId: 'PRD-1002', size: 'M', color: 'Be', sku: 'HIC-BZ-BEI-M', stock: 3, lowStockThreshold: 5, priceOverride: 226 },
  { id: 'VAR-006', productId: 'PRD-1003', size: 'M', color: 'Đen', sku: 'HIC-TR-BLK-M', stock: 23, lowStockThreshold: 8 },
  { id: 'VAR-007', productId: 'PRD-1003', size: 'L', color: 'Đen', sku: 'HIC-TR-BLK-L', stock: 2, lowStockThreshold: 8 },
  { id: 'VAR-008', productId: 'PRD-1004', size: 'M', color: 'Nâu xám', sku: 'HIC-DR-TAU-M', stock: 0, lowStockThreshold: 4 },
  { id: 'VAR-009', productId: 'PRD-1005', size: 'S', color: 'Than chì', sku: 'HIC-SK-GRA-S', stock: 15, lowStockThreshold: 5 },
  { id: 'VAR-010', productId: 'PRD-1006', size: 'XL', color: 'Ngọc trai', sku: 'HIC-BL-PRL-XL', stock: 1, lowStockThreshold: 5 },
]

export const orders: Order[] = [
  {
    id: 'ORD-2401',
    customerId: 'CUS-001',
    customerName: 'Linh Tran',
    phone: '+84 912 345 001',
    email: 'linh.tran@example.com',
    status: 'Pending confirmation',
    paymentStatus: 'Paid',
    deliveryMethod: 'Express',
    date: '2026-05-13',
    total: 366,
    address: '24 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh',
    internalNote: 'Ưu tiên giao sau 18:00. Xác nhận chiều dài quần trước khi đóng gói.',
    items: [
      { productName: 'Áo blazer be Sandline', image: productImages.beigeBlazer, size: 'S', color: 'Be', quantity: 1, price: 218 },
      { productName: 'Áo sơ mi cấu trúc trắng ngà', image: productImages.ivoryShirt, size: 'S', color: 'Trắng ngà', quantity: 1, price: 148 },
    ],
    timeline: [
      { time: '09:12', event: 'Khách đặt hàng trực tuyến', actor: 'Khách hàng' },
      { time: '09:14', event: 'Thanh toán đã ghi nhận', actor: 'Hệ thống' },
      { time: '09:28', event: 'Đang chờ cuộc gọi xác nhận', actor: 'Đội bán hàng' },
    ],
  },
  {
    id: 'ORD-2400',
    customerId: 'CUS-002',
    customerName: 'Mai Nguyen',
    phone: '+84 903 221 447',
    email: 'mai.nguyen@example.com',
    status: 'Preparing',
    paymentStatus: 'Paid',
    deliveryMethod: 'Standard',
    date: '2026-05-12',
    total: 293,
    address: '18 Lê Lợi, Quận 3, TP. Hồ Chí Minh',
    internalNote: 'Khách yêu cầu thiệp tặng. Giữ bao bì tối giản.',
    items: [
      { productName: 'Quần âu đen dáng suông', image: productImages.blackTrousers, size: 'M', color: 'Đen', quantity: 1, price: 165 },
      { productName: 'Chân váy bút chì than chì', image: productImages.pencilSkirt, size: 'S', color: 'Than chì', quantity: 1, price: 128 },
    ],
    timeline: [
      { time: '12/05, 14:06', event: 'Đơn hàng đã xác nhận', actor: 'Nhi Pham' },
      { time: '12/05, 15:30', event: 'Đã giữ hàng', actor: 'Tồn kho' },
    ],
  },
  {
    id: 'ORD-2399',
    customerId: 'CUS-003',
    customerName: 'An Hoang',
    phone: '+84 988 112 220',
    email: 'an.hoang@example.com',
    status: 'Shipping',
    paymentStatus: 'Paid',
    deliveryMethod: 'Express',
    date: '2026-05-11',
    total: 188,
    address: '72 Xuân Diệu, Tây Hồ, Hà Nội',
    internalNote: 'Khách VIP. Kèm thẻ hướng dẫn chăm sóc vải.',
    items: [
      { productName: 'Đầm dệt kim nâu xám mềm', image: productImages.knitDress, size: 'M', color: 'Nâu xám', quantity: 1, price: 188 },
    ],
    timeline: [
      { time: '11/05, 10:42', event: 'Đã đóng gói kèm thẻ chăm sóc', actor: 'Kho' },
      { time: '11/05, 12:15', event: 'Đã bàn giao cho đơn vị vận chuyển', actor: 'Hệ thống' },
    ],
  },
  {
    id: 'ORD-2398',
    customerId: 'CUS-004',
    customerName: 'Thao Le',
    phone: '+84 976 501 882',
    email: 'thao.le@example.com',
    status: 'Return requested',
    paymentStatus: 'Partially refunded',
    deliveryMethod: 'Standard',
    date: '2026-05-09',
    total: 142,
    address: '9 Trần Quốc Toản, Đà Nẵng',
    internalNote: 'Đã mở yêu cầu đổi kích cỡ.',
    items: [
      { productName: 'Áo blouse lụa ngọc trai', image: productImages.silkBlouse, size: 'XL', color: 'Ngọc trai', quantity: 1, price: 142 },
    ],
    timeline: [
      { time: '10/05, 16:10', event: 'Khách yêu cầu đổi trả: không vừa', actor: 'Khách hàng' },
      { time: '10/05, 16:35', event: 'Đã gợi ý phương án đổi hàng', actor: 'Đội bán hàng' },
    ],
  },
]

export const customers: Customer[] = [
  {
    id: 'CUS-001',
    name: 'Linh Tran',
    phone: '+84 912 345 001',
    email: 'linh.tran@example.com',
    totalOrders: 3,
    totalSpent: 812,
    lastOrder: '2026-05-13',
    type: 'Returning',
    preferredSize: 'S',
    favoriteColors: ['Trắng ngà', 'Be', 'Đen'],
    favoriteStyles: ['May đo', 'Sơ mi tối giản'],
    notes: 'Thích blazer gọn gàng và ưu tiên giao nhanh.',
    returnHistory: ['Chưa có lịch sử đổi trả'],
  },
  {
    id: 'CUS-002',
    name: 'Mai Nguyen',
    phone: '+84 903 221 447',
    email: 'mai.nguyen@example.com',
    totalOrders: 8,
    totalSpent: 1840,
    lastOrder: '2026-05-12',
    type: 'VIP',
    preferredSize: 'M',
    favoriteColors: ['Than chì', 'Kem'],
    favoriteStyles: ['Chân váy bút chì', 'Set công sở'],
    notes: 'Phản hồi tốt với xem trước bộ sưu tập và quyền mua sớm.',
    returnHistory: ['Đã đổi kích cỡ blazer trong tháng 4'],
  },
  {
    id: 'CUS-003',
    name: 'An Hoang',
    phone: '+84 988 112 220',
    email: 'an.hoang@example.com',
    totalOrders: 1,
    totalSpent: 188,
    lastOrder: '2026-05-11',
    type: 'New',
    preferredSize: 'M',
    favoriteColors: ['Nâu xám'],
    favoriteStyles: ['Đầm'],
    notes: 'Đã hỏi cách chăm sóc vải trước khi thanh toán.',
    returnHistory: ['Chưa có lịch sử đổi trả'],
  },
  {
    id: 'CUS-004',
    name: 'Thao Le',
    phone: '+84 976 501 882',
    email: 'thao.le@example.com',
    totalOrders: 5,
    totalSpent: 692,
    lastOrder: '2026-05-09',
    type: 'Returning',
    preferredSize: 'L',
    favoriteColors: ['Ngọc trai', 'Đen'],
    favoriteStyles: ['Áo blouse rộng nhẹ'],
    notes: 'Thường ở giữa L và XL. Xác nhận số đo vòng ngực cho sản phẩm ôm.',
    returnHistory: ['Áo blouse lụa ngọc trai - đang chờ đổi'],
  },
]

export const returnRequests: ReturnRequest[] = [
  {
    id: 'RET-501',
    orderId: 'ORD-2398',
    customer: 'Thao Le',
    product: 'Áo blouse lụa ngọc trai',
    size: 'XL',
    color: 'Ngọc trai',
    reason: 'Does not fit',
    status: 'Requested',
    requestedAt: '2026-05-10',
    notes: 'Khách muốn đổi sang size L nếu còn hàng.',
  },
  {
    id: 'RET-500',
    orderId: 'ORD-2387',
    customer: 'Vy Pham',
    product: 'Áo sơ mi cấu trúc trắng ngà',
    size: 'M',
    color: 'Trắng ngà',
    reason: 'Wrong size',
    status: 'Approved',
    requestedAt: '2026-05-08',
    notes: 'Đã duyệt sau cuộc gọi hỗ trợ. Đang chờ ảnh biên nhận.',
  },
  {
    id: 'RET-499',
    orderId: 'ORD-2378',
    customer: 'Hanh Do',
    product: 'Quần âu đen dáng suông',
    size: 'S',
    color: 'Đen',
    reason: 'Product defect',
    status: 'Received',
    requestedAt: '2026-05-06',
    notes: 'Kho đã xác nhận lỗi đường may lai quần.',
  },
]

export const coupons: Coupon[] = [
  {
    id: 'CPN-001',
    code: 'OFFICE10',
    discountType: 'percentage',
    value: '10%',
    startDate: '2026-05-01',
    endDate: '2026-05-31',
    usageLimit: 300,
    minimumOrderValue: 180,
    status: 'Active',
  },
  {
    id: 'CPN-002',
    code: 'BLAZERDAY',
    discountType: 'fixed',
    value: '625.000 ₫',
    startDate: '2026-05-18',
    endDate: '2026-05-25',
    usageLimit: 120,
    minimumOrderValue: 220,
    status: 'Scheduled',
  },
  {
    id: 'CPN-003',
    code: 'SHIPCHIC',
    discountType: 'free shipping',
    value: 'Miễn phí vận chuyển',
    startDate: '2026-05-01',
    endDate: '2026-06-15',
    usageLimit: 500,
    minimumOrderValue: 120,
    status: 'Active',
  },
]

export const campaigns = [
  { id: 'CAM-01', name: 'Combo đồ công sở', status: 'Active', products: 12, uplift: '+18%' },
  { id: 'CAM-02', name: 'Giảm giá blazer', status: 'Scheduled', products: 8, uplift: 'Bắt đầu 18/05' },
  { id: 'CAM-03', name: 'Giảm giá hàng mới', status: 'Draft', products: 6, uplift: 'Cần nội dung' },
]

export const collections: Collection[] = [
  {
    id: 'COL-01',
    name: 'Công sở thanh lịch',
    description: 'Sơ mi mềm, blouse rũ nhẹ và các thiết kế tối giản hằng ngày.',
    coverImage: productImages.ivoryShirt,
    status: 'Published',
    productCount: 14,
  },
  {
    id: 'COL-02',
    name: 'May đo thứ Hai',
    description: 'Blazer và trang phục tách bộ sắc gọn cho ngày thuyết trình.',
    coverImage: productImages.beigeBlazer,
    status: 'Published',
    productCount: 9,
  },
  {
    id: 'COL-03',
    name: 'Tủ đồ nền tảng',
    description: 'Đen, than chì, trắng ngà và các món công sở dùng quanh năm.',
    coverImage: productImages.blackTrousers,
    status: 'Draft',
    productCount: 18,
  },
]

export const lookbooks: Lookbook[] = [
  {
    id: 'LOOK-01',
    title: 'Set họp màu be',
    image: productImages.beigeBlazer,
    linkedProducts: ['Sơ mi trắng', 'Blazer be', 'Quần âu đen', 'Giày cao gót tối giản'],
    description: 'Trang phục công sở chỉn chu cho buổi gặp khách và sự kiện tối.',
    visibility: 'Visible',
  },
  {
    id: 'LOOK-02',
    title: 'Thứ Sáu mềm mại',
    image: productImages.knitDress,
    linkedProducts: ['Đầm dệt kim nâu xám', 'Thắt lưng than chì', 'Khuyên tai ngọc trai'],
    description: 'Phom dáng dịu hơn cho ngày làm việc linh hoạt.',
    visibility: 'Visible',
  },
  {
    id: 'LOOK-03',
    title: 'Đồng phục bàn biên tập',
    image: productImages.silkBlouse,
    linkedProducts: ['Áo blouse ngọc trai', 'Chân váy bút chì', 'Túi da mảnh'],
    description: 'Đường nét tối giản với điểm nhấn satin mềm.',
    visibility: 'Hidden',
  },
]

export const tryOnGarments: TryOnGarment[] = [
  {
    id: 'TRY-001',
    product: 'Áo sơ mi cấu trúc trắng ngà',
    cleanImage: productImages.ivoryShirt,
    modelImage: productImages.ivoryShirt,
    previewImage: productImages.ivoryShirt,
    category: 'upper_body',
    garmentType: 'Áo sơ mi',
    color: 'Trắng ngà',
    size: 'S',
    enabled: true,
    processingStatus: 'Ready',
  },
  {
    id: 'TRY-002',
    product: 'Áo blazer be Sandline',
    cleanImage: productImages.beigeBlazer,
    modelImage: productImages.beigeBlazer,
    previewImage: productImages.beigeBlazer,
    category: 'outerwear',
    garmentType: 'Áo blazer',
    color: 'Be',
    size: 'M',
    enabled: true,
    processingStatus: 'Processing',
  },
  {
    id: 'TRY-003',
    product: 'Đầm dệt kim nâu xám mềm',
    cleanImage: productImages.knitDress,
    modelImage: productImages.knitDress,
    previewImage: productImages.knitDress,
    category: 'dress',
    garmentType: 'Đầm',
    color: 'Nâu xám',
    size: 'M',
    enabled: false,
    processingStatus: 'Needs image',
  },
]

export const staff: StaffMember[] = [
  {
    id: 'STF-01',
    name: 'Nhi Pham',
    email: 'nhi@hichic.vn',
    role: 'Owner',
    status: 'Active',
    lastLogin: 'Hôm nay, 09:31',
  },
  {
    id: 'STF-02',
    name: 'Quynh Bui',
    email: 'quynh@hichic.vn',
    role: 'Manager',
    status: 'Active',
    lastLogin: 'Hôm qua, 18:02',
  },
  {
    id: 'STF-03',
    name: 'Ha Dang',
    email: 'ha@hichic.vn',
    role: 'Inventory',
    status: 'Active',
    lastLogin: '11/05, 14:20',
  },
  {
    id: 'STF-04',
    name: 'Minh Le',
    email: 'minh@hichic.vn',
    role: 'Content',
    status: 'Invited',
    lastLogin: 'Chưa có',
  },
]

export const analytics = {
  revenueTrend: [
    { label: '07/05', value: 860 },
    { label: '08/05', value: 1140 },
    { label: '09/05', value: 980 },
    { label: '10/05', value: 1320 },
    { label: '11/05', value: 1510 },
    { label: '12/05', value: 1760 },
    { label: '13/05', value: 1240 },
  ],
  salesByCategory: [
    { label: 'Áo blazer', value: 32 },
    { label: 'Áo sơ mi', value: 26 },
    { label: 'Quần âu', value: 21 },
    { label: 'Đầm', value: 13 },
    { label: 'Chân váy', value: 8 },
  ],
  orderStatus: [
    { label: 'Chờ xử lý', value: 10, color: '#b45309' },
    { label: 'Đang chuẩn bị', value: 18, color: '#7c2d12' },
    { label: 'Đang giao', value: 13, color: '#57534e' },
    { label: 'Hoàn tất', value: 42, color: '#1c1917' },
  ],
  topSizes: [
    { label: 'M', value: 38 },
    { label: 'S', value: 31 },
    { label: 'L', value: 19 },
    { label: 'XS', value: 8 },
    { label: 'XL', value: 4 },
  ],
  topColors: [
    { label: 'Trắng ngà', value: 34 },
    { label: 'Đen', value: 28 },
    { label: 'Be', value: 24 },
    { label: 'Than chì', value: 14 },
  ],
  topReturned: [
    { product: 'Áo blouse lụa ngọc trai', rate: '8.4%', reason: 'Không vừa' },
    { product: 'Áo sơ mi cấu trúc trắng ngà', rate: '5.1%', reason: 'Sai kích cỡ' },
    { product: 'Quần âu đen dáng suông', rate: '3.8%', reason: 'Vấn đề chiều dài' },
  ],
  lowPerforming: [
    { product: 'Đầm dệt kim nâu xám mềm', views: 1240, conversion: '0.8%', note: 'Cần ảnh người mẫu' },
    { product: 'Áo blouse lụa ngọc trai', views: 890, conversion: '1.1%', note: 'Thử đồ thất bại' },
  ],
}

export const recentActivity = [
  { time: '09:31', text: 'Nhi chuyển ORD-2401 sang trạng thái chờ xác nhận.' },
  { time: '09:18', text: 'Tồn kho đánh dấu Áo sơ mi cấu trúc trắng ngà size M là hết hàng.' },
  { time: '08:44', text: 'Đã lưu bản nháp hero trang chủ cho capsule tháng 6.' },
  { time: 'Hôm qua', text: 'Đã tạo lại bản thử đồ cho Áo blazer be Sandline.' },
]

export const activityLog = [
  { actor: 'Nhi Pham', action: 'Cập nhật nội dung chính sách đổi trả', time: 'Hôm nay, 09:02' },
  { actor: 'Ha Dang', action: 'Điều chỉnh tồn kho HIC-BZ-BEI-M giảm 2', time: 'Hôm qua, 16:41' },
  { actor: 'Quynh Bui', action: 'Duyệt yêu cầu đổi trả RET-500', time: 'Hôm qua, 11:12' },
]

export const permissionMatrix = [
  { role: 'Owner', permissions: 'Toàn quyền' },
  { role: 'Manager', permissions: 'Sản phẩm, đơn hàng, khách hàng, báo cáo' },
  { role: 'Sales', permissions: 'Đơn hàng, khách hàng' },
  { role: 'Inventory', permissions: 'Sản phẩm, tồn kho' },
  { role: 'Content', permissions: 'Trang chủ, phối đồ, blog, banner' },
]

export function getStockStatus(variant: ProductVariant): StockStatus {
  if (variant.stock === 0) {
    return 'Out of stock'
  }

  if (variant.stock <= variant.lowStockThreshold) {
    return 'Low stock'
  }

  return 'In stock'
}

export function productById(productId: string) {
  return adminProducts.find((product) => product.id === productId)
}
