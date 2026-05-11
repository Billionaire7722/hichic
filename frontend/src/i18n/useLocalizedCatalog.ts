import { useMemo } from 'react'
import { catalog, type Product } from '../data/products'
import { useLanguage } from './useLanguage'

export function useLocalizedProducts(): Product[] {
  const { m } = useLanguage()
  return useMemo(
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
}
