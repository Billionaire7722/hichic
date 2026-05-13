import './App.css'
import { Header } from './components/Header'
import { Hero } from './components/Hero'
import { Collection } from './components/Collection'
import { NewArrivals } from './components/NewArrivals'
import { Editorial } from './components/Editorial'
import { Newsletter } from './components/Newsletter'
import { Footer } from './components/Footer'
import { CartPage } from './pages/CartPage'
import { CollectionsPage } from './pages/CollectionsPage'
import { ProductDetailsPage } from './pages/ProductDetailsPage'
import { VirtualTryOnPage } from './pages/VirtualTryOnPage'
import { useLanguage } from './i18n/useLanguage'
import { useLocalizedProducts, useStorefrontCollections } from './i18n/useLocalizedCatalog'
import { AdminApp } from './admin/AdminApp'

function HomePage({
  products,
  collections,
}: {
  products: ReturnType<typeof useLocalizedProducts>
  collections: ReturnType<typeof useStorefrontCollections>
}) {
  return (
    <>
      <Hero />
      <NewArrivals products={products} />
      <Collection collections={collections} />
      <Editorial />
      <Newsletter />
    </>
  )
}

function App() {
  const { m } = useLanguage()
  const products = useLocalizedProducts()
  const collections = useStorefrontCollections()
  const path = window.location.pathname.replace(/\/+$/, '') || '/'
  const isAdmin = path === '/admin' || path.startsWith('/admin/')
  const productMatch = path.match(/^\/products\/(.+)$/)
  const productId = productMatch?.[1] ? decodeURIComponent(productMatch[1]) : undefined
  const currentPage = path === '/virtual-try-on'
    ? 'virtual-try-on'
    : path === '/collections'
      ? 'collections'
      : productMatch
        ? 'product'
        : path === '/cart'
          ? 'cart'
          : 'home'

  if (isAdmin) {
    return <AdminApp />
  }

  return (
    <>
      <a href="#main" className="skip-link">
        {m.skipToContent}
      </a>
      <Header currentPage={currentPage} />
      <main id="main">
        {currentPage === 'virtual-try-on' && <VirtualTryOnPage />}
        {currentPage === 'collections' && <CollectionsPage products={products} collections={collections} />}
        {currentPage === 'product' && <ProductDetailsPage productId={productId} products={products} />}
        {currentPage === 'cart' && <CartPage products={products} />}
        {currentPage === 'home' && <HomePage products={products} collections={collections} />}
      </main>
      <Footer currentPage={currentPage} />
    </>
  )
}

export default App
