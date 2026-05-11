export type Product = {
  id: string
  name: string
  category: string
  price: string
  description: string
  image: string
}

/** Structural catalog — copy comes from i18n (`messages[locale].products`). */
export const catalog: Omit<Product, 'name' | 'category' | 'description'>[] = [
  {
    id: '1',
    price: '$148',
    image:
      'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: '2',
    price: '$165',
    image:
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: '3',
    price: '$112',
    image:
      'https://images.unsplash.com/photo-1483988350575-af1b22408832?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: '4',
    price: '$158',
    image:
      'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=900&q=80',
  },
]

export const heroImage =
  'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=2400&q=85'

export const editorialImage =
  'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=2000&q=85'
