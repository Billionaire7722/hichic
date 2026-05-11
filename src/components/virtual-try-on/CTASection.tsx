import { useLanguage } from '../../i18n/useLanguage'

export function CTASection() {
  const { m } = useLanguage()
  const t = m.virtualTryOn.cta

  return (
    <section className="tryon-cta" aria-labelledby="tryon-cta-heading">
      <div className="tryon-cta__inner">
        <p className="section-label">{t.label}</p>
        <h2 id="tryon-cta-heading">{t.heading}</h2>
        <p>{t.copy}</p>
        <div className="tryon-cta__actions">
          <a className="btn btn--primary" href="#demo">
            {t.primary}
          </a>
          <a className="btn btn--ghost" href="/">
            {t.secondary}
          </a>
        </div>
      </div>
    </section>
  )
}
