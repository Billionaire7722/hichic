export type FeatureLevel = {
  title: string
  badge: string
  description: string
  bullets: string[]
}

export type DemoProduct = {
  id: string
  name: string
  category: string
  garment: 'shirt' | 'blazer' | 'trousers' | 'skirt'
  swatch: string
}

export type ProductRegion = 'upper' | 'lower'

export type ProductColor = {
  id: string
  name: string
  swatch: string
  stock: 'in-stock' | 'out-of-stock'
}

export type FitProduct = {
  id: string
  region: ProductRegion
  name: string
  category: string
  price: string
  garment: 'shirt' | 'blazer' | 'trousers' | 'skirt'
  image: string
  defaultLength: number
  lengthRange?: [number, number]
  colors: ProductColor[]
}

export type TextCard = {
  title: string
  text: string
}

export type JourneyStep = TextCard & {
  step: string
}

export const insightCards: TextCard[] = [
  {
    title: 'Fit confidence',
    text: 'Preview how shirts and blazers may look on your own body before buying.',
  },
  {
    title: 'Style clarity',
    text: 'See whether a color, collar, or silhouette matches your personal office style.',
  },
  {
    title: 'Less hesitation',
    text: 'Make faster decisions and reduce the fear of ordering the wrong item online.',
  },
]

export const featureLevels: FeatureLevel[] = [
  {
    title: 'Level 1 - Quick Photo Overlay',
    badge: 'MVP',
    description:
      'Upload a half-body photo and preview office tops with a simple adjustable overlay. Fast to build, easy to test, and perfect for validating user interest.',
    bullets: [
      'Upload half-body photo',
      'Adjust product overlay',
      'Preview shirts and blazers',
      'Save or share the look',
      'Add item to cart',
    ],
  },
  {
    title: 'Level 2 - Personal Style Profile',
    badge: 'Personalized',
    description:
      'Customers save their body photo, usual size, fit preference, and style profile. Every product page can then show a View on me preview.',
    bullets: [
      'Saved body photo',
      'Height, weight, usual size',
      'Fit preference: slim, regular, relaxed',
      'Favorite colors and office style',
      'Faster repeat try-ons',
      'Better size recommendations',
    ],
  },
  {
    title: 'Level 3 - AI Virtual Try-On',
    badge: 'Future upgrade',
    description:
      'AI generates a more realistic preview of the customer wearing selected office outfits, including shirts, blazers, trousers, skirts, and full looks.',
    bullets: [
      'Realistic AI-generated preview',
      'Full outfit try-on',
      'Lighting and body proportion awareness',
      'Outfit comparison',
      'Save and share looks',
      'Personalized recommendations',
    ],
  },
]

export const demoProducts: DemoProduct[] = [
  {
    id: 'white-shirt',
    name: 'White shirt',
    category: 'Crisp cotton poplin',
    garment: 'shirt',
    swatch: '#f9f7f2',
  },
  {
    id: 'beige-blazer',
    name: 'Beige blazer',
    category: 'Soft tailored layer',
    garment: 'blazer',
    swatch: '#c7aa84',
  },
  {
    id: 'black-trousers',
    name: 'Black trousers',
    category: 'Straight-leg office pant',
    garment: 'trousers',
    swatch: '#24211f',
  },
  {
    id: 'navy-shirt',
    name: 'Navy shirt',
    category: 'Polished evening blue',
    garment: 'shirt',
    swatch: '#1f3147',
  },
  {
    id: 'pencil-skirt',
    name: 'Pencil skirt',
    category: 'High-rise work skirt',
    garment: 'skirt',
    swatch: '#3b3430',
  },
]

export const fitProducts: FitProduct[] = [
  {
    id: 'silk-blouse',
    region: 'upper',
    name: 'Silk Charmeuse Blouse',
    category: 'Soft collar blouse',
    price: '$148',
    garment: 'shirt',
    image:
      'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=700&q=80',
    defaultLength: 58,
    colors: [
      { id: 'ivory', name: 'Ivory', swatch: '#f9f7f2', stock: 'in-stock' },
      { id: 'navy', name: 'Navy', swatch: '#1f3147', stock: 'in-stock' },
      {
        id: 'pearl-gray',
        name: 'Pearl gray',
        swatch: '#c8c2b9',
        stock: 'out-of-stock',
      },
    ],
  },
  {
    id: 'soft-blazer',
    region: 'upper',
    name: 'Soft Office Blazer',
    category: 'Single-button tailoring',
    price: '$228',
    garment: 'blazer',
    image:
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=700&q=80',
    defaultLength: 66,
    colors: [
      { id: 'beige', name: 'Beige', swatch: '#c7aa84', stock: 'in-stock' },
      { id: 'espresso', name: 'Espresso', swatch: '#4b4039', stock: 'in-stock' },
      {
        id: 'chalk',
        name: 'Chalk',
        swatch: '#e8dfd1',
        stock: 'out-of-stock',
      },
    ],
  },
  {
    id: 'crepe-shell',
    region: 'upper',
    name: 'Crêpe Shell Top',
    category: 'Sleeveless office layer',
    price: '$112',
    garment: 'shirt',
    image:
      'https://images.unsplash.com/photo-1483988350575-af1b22408832?auto=format&fit=crop&w=700&q=80',
    defaultLength: 54,
    colors: [
      { id: 'black', name: 'Black', swatch: '#24211f', stock: 'in-stock' },
      { id: 'oat', name: 'Oat', swatch: '#d8c7ac', stock: 'in-stock' },
      {
        id: 'sage',
        name: 'Sage',
        swatch: '#9aa08b',
        stock: 'out-of-stock',
      },
    ],
  },
  {
    id: 'tailored-trousers',
    region: 'lower',
    name: 'Tailored Trousers',
    category: 'Straight-leg office pant',
    price: '$176',
    garment: 'trousers',
    image:
      'https://images.unsplash.com/photo-1509551388413-e18d0ac5d495?auto=format&fit=crop&w=700&q=80',
    defaultLength: 98,
    lengthRange: [86, 108],
    colors: [
      { id: 'black', name: 'Black', swatch: '#24211f', stock: 'in-stock' },
      { id: 'charcoal', name: 'Charcoal', swatch: '#4a4642', stock: 'in-stock' },
      {
        id: 'warm-oat',
        name: 'Warm oat',
        swatch: '#d6c2a3',
        stock: 'out-of-stock',
      },
    ],
  },
  {
    id: 'pencil-skirt',
    region: 'lower',
    name: 'Tailored Pencil Skirt',
    category: 'High-rise work skirt',
    price: '$165',
    garment: 'skirt',
    image:
      'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=700&q=80',
    defaultLength: 62,
    lengthRange: [48, 76],
    colors: [
      { id: 'black', name: 'Black', swatch: '#24211f', stock: 'in-stock' },
      { id: 'taupe', name: 'Taupe', swatch: '#8a7461', stock: 'in-stock' },
      {
        id: 'deep-navy',
        name: 'Deep navy',
        swatch: '#1f3147',
        stock: 'out-of-stock',
      },
    ],
  },
  {
    id: 'midi-a-line-skirt',
    region: 'lower',
    name: 'Midi A-Line Skirt',
    category: 'Soft structured midi',
    price: '$158',
    garment: 'skirt',
    image:
      'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=700&q=80',
    defaultLength: 72,
    lengthRange: [56, 82],
    colors: [
      { id: 'ink', name: 'Ink', swatch: '#2f2a27', stock: 'in-stock' },
      { id: 'camel', name: 'Camel', swatch: '#b99672', stock: 'in-stock' },
      {
        id: 'winter-white',
        name: 'Winter white',
        swatch: '#eee8dd',
        stock: 'out-of-stock',
      },
    ],
  },
]

export const journeySteps: JourneyStep[] = [
  {
    step: '01',
    title: 'Upload your photo',
    text: 'Use a clear half-body photo with good lighting.',
  },
  {
    step: '02',
    title: 'Choose an item',
    text: 'Pick a shirt, blazer, pants, skirt, or full office outfit.',
  },
  {
    step: '03',
    title: 'Preview your look',
    text: 'Adjust the item and see how the style works on your body.',
  },
  {
    step: '04',
    title: 'Shop with confidence',
    text: 'Save the look, share it, or add the outfit to your cart.',
  },
]

export const businessValueCards: TextCard[] = [
  {
    title: 'Higher conversion',
    text: 'Customers who can visualize themselves in an outfit are more likely to add items to cart.',
  },
  {
    title: 'Lower return anxiety',
    text: 'Better visual confidence and size guidance can reduce hesitation and potential size-related returns.',
  },
  {
    title: 'More engagement',
    text: 'Try-on interactions keep customers exploring more products and outfit combinations.',
  },
  {
    title: 'Viral sharing',
    text: 'Users can save or share outfit previews with friends, creating organic social traffic.',
  },
]

export const trustPoints = [
  'Photos are used only for try-on previews.',
  'Users can delete uploaded photos.',
  'Saved body profile is optional.',
  'AI try-on should require explicit consent.',
  'The product should clearly explain how photos are stored and used.',
]
