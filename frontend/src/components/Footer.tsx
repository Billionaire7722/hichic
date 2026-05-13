import { useLanguage } from '../i18n/useLanguage'

type FooterProps = {
  currentPage?: 'home' | 'virtual-try-on' | 'collections' | 'product' | 'cart'
}

export function Footer({ currentPage = 'home' }: FooterProps) {
  const { m } = useLanguage()
  const isHome = currentPage === 'home'
  const homeHref = (hash: string) => (isHome ? hash : `/${hash}`)

  return (
    <footer className="site-footer">
      <div className="site-footer__brand">
        <span className="site-footer__logo">Hichic</span>
        <p className="site-footer__tagline">{m.footer.tagline}</p>
      </div>
      <div className="site-footer__cols">
        <div>
          <h3 className="site-footer__heading">{m.footer.shopHeading}</h3>
          <ul>
            <li>
              <a href="/collections">{m.footer.skirts}</a>
            </li>
            <li>
              <a href="/collections">{m.footer.blouses}</a>
            </li>
            <li>
              <a href="/virtual-try-on">{m.footer.virtualTryOn}</a>
            </li>
            <li>
              <a href={homeHref('#newsletter')}>{m.footer.updates}</a>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="site-footer__heading">{m.footer.companyHeading}</h3>
          <ul>
            <li>
              <a href={homeHref('#craft')}>{m.footer.craft}</a>
            </li>
            <li>
              <span className="site-footer__muted">{m.footer.careersSoon}</span>
            </li>
            <li>
              <span className="site-footer__muted">{m.footer.pressSoon}</span>
            </li>
          </ul>
        </div>
      </div>
      <p className="site-footer__legal">
        © {new Date().getFullYear()} Hichic. {m.footer.legal}
      </p>
    </footer>
  )
}
