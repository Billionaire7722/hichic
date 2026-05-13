import type { Product } from '../data/products'
import type { Locale } from '../i18n/translations'

export const defaultSizes = ['XS', 'S', 'M', 'L', 'XL']
export const defaultColors = ['Ivory', 'Black', 'Graphite', 'Taupe']
export const defaultColorsVi = ['Trắng ngà', 'Đen', 'Than chì', 'Nâu xám']

export function getDefaultColors(locale: Locale) {
  return locale === 'vi' ? defaultColorsVi : defaultColors
}

export function getProductCollection(product: Product) {
  return product.category || 'Essentials'
}

export function getCollectionNames(products: Product[]) {
  return Array.from(new Set(products.map(getProductCollection))).filter(Boolean)
}

export function productDetailPath(product: Product) {
  return `/products/${encodeURIComponent(product.id)}`
}

export function cartPath(product: Product, size = defaultSizes[1], color = defaultColors[0]) {
  const params = new URLSearchParams({
    product: product.id,
    size,
    color,
    qty: '1',
  })

  return `/cart?${params.toString()}`
}

export function findProductById(products: Product[], id: string | undefined | null) {
  if (!id) {
    return undefined
  }

  return products.find((product) => product.id === id)
}
