import { useEffect, useMemo, useState } from 'react'
import {
  catalog,
  fallbackStorefrontCollections,
  type Product,
  type StorefrontCollection,
} from '../data/products'
import { useLanguage } from './useLanguage'

type ApiProduct = {
  id: string
  name: string
  nameVi?: string | null
  category: string
  categoryVi?: string | null
  price: string
  description?: string | null
  descriptionVi?: string | null
  image: string
  createdAt?: string
  updatedAt?: string
}

type ApiCollection = {
  id: string
  name: string
  description?: string | null
  coverImage?: string | null
  status?: 'Draft' | 'Published' | 'Hidden'
  productCount?: number
  updatedAt?: string
}

const apiBaseUrl = (
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000/api'
).replace(/\/$/, '')

function formatPublicPrice(price: string) {
  const rawAmount = Number(price.replace(/\D/g, '')) || 0
  const vndAmount = rawAmount < 100000 ? rawAmount * 25000 : rawAmount

  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(vndAmount)
}

function toProduct(product: ApiProduct, locale: 'en' | 'vi'): Product {
  return {
    id: product.id,
    name: locale === 'vi' ? product.nameVi || product.name : product.name,
    category: locale === 'vi' ? product.categoryVi || product.category : product.category,
    price: formatPublicPrice(product.price),
    description: locale === 'vi'
      ? product.descriptionVi || product.description || ''
      : product.description || product.descriptionVi || '',
    image: product.image,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  }
}

function sortNewestFirst(products: Product[]) {
  return [...products].sort((a, b) => {
    const aTime = a.createdAt ? Date.parse(a.createdAt) : 0
    const bTime = b.createdAt ? Date.parse(b.createdAt) : 0
    return bTime - aTime
  })
}

export function useLocalizedProducts(): Product[] {
  const { locale, m } = useLanguage()
  const [databaseProducts, setDatabaseProducts] = useState<Product[]>([])
  const localizedCatalog = useMemo(
    () =>
      catalog.map((row) => {
        const copy = m.products[row.id]
        return {
          ...row,
          name: copy.name,
          category: copy.category,
          description: copy.description,
        }
      }),
    [m],
  )

  useEffect(() => {
    let active = true

    fetch(`${apiBaseUrl}/products`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Product API returned ${response.status}`)
        }
        return response.json() as Promise<ApiProduct[]>
      })
      .then((products) => {
        if (active) {
          setDatabaseProducts(sortNewestFirst(products.map((product) => toProduct(product, locale))))
        }
      })
      .catch(() => {
        if (active) {
          setDatabaseProducts([])
        }
      })

    return () => {
      active = false
    }
  }, [locale])

  return databaseProducts.length > 0 ? databaseProducts : sortNewestFirst(localizedCatalog)
}

function toStorefrontCollection(collection: ApiCollection): StorefrontCollection {
  return {
    id: collection.id,
    name: collection.name,
    description: collection.description ?? '',
    coverImage: collection.coverImage ?? '',
    status: collection.status,
    productCount: collection.productCount,
    updatedAt: collection.updatedAt,
  }
}

export function useStorefrontCollections(): StorefrontCollection[] {
  const [databaseCollections, setDatabaseCollections] = useState<StorefrontCollection[]>([])

  useEffect(() => {
    let active = true

    fetch(`${apiBaseUrl}/collections`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Collections API returned ${response.status}`)
        }
        return response.json() as Promise<ApiCollection[]>
      })
      .then((collections) => {
        if (!active) {
          return
        }

        const visibleCollections = collections
          .map(toStorefrontCollection)
          .filter((collection) => collection.status !== 'Hidden')

        setDatabaseCollections(visibleCollections)
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

  return databaseCollections.length > 0 ? databaseCollections : fallbackStorefrontCollections
}
