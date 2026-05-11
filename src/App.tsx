import './App.css'
import { Header } from './components/Header'
import { Hero } from './components/Hero'
import { Collection } from './components/Collection'
import { Editorial } from './components/Editorial'
import { Newsletter } from './components/Newsletter'
import { Footer } from './components/Footer'
import { VirtualTryOnPage } from './pages/VirtualTryOnPage'
import { useLanguage } from './i18n/useLanguage'
import { useLocalizedProducts } from './i18n/useLocalizedCatalog'

function HomePage() {
  const products = useLocalizedProducts()

  return (
    <>
      <Hero />
      <Collection products={products} />
      <Editorial />
      <Newsletter />
    </>
  )
}

function App() {
  const { m } = useLanguage()
  const path = window.location.pathname.replace(/\/+$/, '') || '/'
  const currentPage = path === '/virtual-try-on' ? 'virtual-try-on' : 'home'

  return (
    <>
      <a href="#main" className="skip-link">
        {m.skipToContent}
      </a>
      <Header currentPage={currentPage} />
      <main id="main">
        {currentPage === 'virtual-try-on' ? <VirtualTryOnPage /> : <HomePage />}
      </main>
      <Footer currentPage={currentPage} />
    </>
  )
}

export default App
