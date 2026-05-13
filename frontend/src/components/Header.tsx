import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { useLanguage } from '../i18n/useLanguage'

type HeaderProps = {
  currentPage?: 'home' | 'virtual-try-on' | 'collections' | 'product' | 'cart'
}

export function Header({ currentPage = 'home' }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false)
  const reduceMotion = useReducedMotion()
  const { locale, setLocale, m } = useLanguage()
  const isHome = currentPage === 'home'
  const isCommerce = currentPage === 'collections' || currentPage === 'product' || currentPage === 'cart'
  const solidHeader = scrolled || isCommerce
  const homeHref = (hash: string) => (isHome ? hash : `/${hash}`)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const links = [
    {
      href: '/collections',
      label: m.nav.collection,
      current: currentPage === 'collections' || currentPage === 'product',
    },
    { href: homeHref('#craft'), label: m.nav.craft },
    {
      href: '/virtual-try-on',
      label: m.nav.virtualTryOn,
      current: currentPage === 'virtual-try-on',
    },
    { href: homeHref('#newsletter'), label: m.nav.updates },
  ]

  return (
    <motion.header
      className={`site-header${solidHeader ? ' site-header--scrolled' : ''}`}
      initial={reduceMotion ? false : { y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
    >
      <a className="site-header__brand" href={isHome ? '#top' : '/'}>
        Hichic
      </a>
      <nav className="site-header__nav" aria-label={m.ariaNavPrimary}>
        <ul>
          {links.map((l) => (
            <li key={l.href}>
              <a href={l.href} aria-current={l.current ? 'page' : undefined}>
                {l.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <div className="site-header__actions">
        <div
          className="lang-switch"
          role="group"
          aria-label={m.langSwitcher.label}
        >
          <button
            type="button"
            className={`lang-switch__btn${locale === 'en' ? ' lang-switch__btn--active' : ''}`}
            onClick={() => setLocale('en')}
            aria-pressed={locale === 'en'}
          >
            {m.langSwitcher.en}
          </button>
          <button
            type="button"
            className={`lang-switch__btn${locale === 'vi' ? ' lang-switch__btn--active' : ''}`}
            onClick={() => setLocale('vi')}
            aria-pressed={locale === 'vi'}
          >
            {m.langSwitcher.vi}
          </button>
        </div>
        <a className="site-header__cta" href="/collections">
          {m.header.shop}
        </a>
      </div>
    </motion.header>
  )
}
