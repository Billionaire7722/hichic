import garmentBlazer from '../assets/garment-blazer.png'
import garmentBlouse from '../assets/garment-blouse.png'
import garmentSkirt from '../assets/garment-skirt.png'

export type Product = {
  id: string
  name: string
  category: string
  price: string
  description: string
  image: string
  createdAt?: string
  updatedAt?: string
}

export type StorefrontCollection = {
  id: string
  name: string
  description: string
  descriptionVi?: string
  coverImage: string
  status?: 'Draft' | 'Published' | 'Hidden'
  productCount?: number
  updatedAt?: string
}

/** Structural catalog — copy comes from i18n (`messages[locale].products`). */
export const catalog: Omit<Product, 'name' | 'category' | 'description'>[] = [
  {
    id: '1',
    price: '3.700.000 ₫',
    image: garmentBlouse,
    createdAt: '2026-05-13T09:00:00.000Z',
  },
  {
    id: '2',
    price: '4.125.000 ₫',
    image: garmentSkirt,
    createdAt: '2026-05-12T09:00:00.000Z',
  },
  {
    id: '3',
    price: '2.800.000 ₫',
    image: garmentBlouse,
    createdAt: '2026-05-11T09:00:00.000Z',
  },
  {
    id: '4',
    price: '3.950.000 ₫',
    image: garmentSkirt,
    createdAt: '2026-05-10T09:00:00.000Z',
  },
  {
    id: '5',
    price: '5.450.000 ₫',
    image: garmentBlazer,
    createdAt: '2026-05-09T09:00:00.000Z',
  },
]

export const fallbackStorefrontCollections: StorefrontCollection[] = [
  {
    id: 'home-secretary-kim',
    name: 'Thư kí kim',
    description: 'Soft blouses and composed desk-to-dinner layers.',
    descriptionVi: 'Áo mềm và các lớp phối chỉn chu từ bàn làm việc đến buổi tối.',
    coverImage: garmentBlouse,
    status: 'Published',
    productCount: 2,
  },
  {
    id: 'home-pencil-skirt',
    name: 'Quần bút chì',
    description: 'Sharp pencil silhouettes with clean movement.',
    descriptionVi: 'Phom bút chì sắc gọn nhưng vẫn dễ chuyển động.',
    coverImage: garmentSkirt,
    status: 'Published',
    productCount: 2,
  },
  {
    id: 'home-blazer',
    name: 'Áo blazer',
    description: 'Structured jackets for precise office polish.',
    descriptionVi: 'Blazer có cấu trúc cho vẻ ngoài công sở sắc nét.',
    coverImage: garmentBlazer,
    status: 'Published',
    productCount: 1,
  },
]

export const heroImage =
  'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=2400&q=85'

export const editorialImage =
  'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=2000&q=85'
