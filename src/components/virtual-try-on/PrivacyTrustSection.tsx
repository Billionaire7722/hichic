import { useLanguage } from '../../i18n/useLanguage'

export function PrivacyTrustSection() {
  const { m } = useLanguage()
  const t = m.virtualTryOn.privacy

  return (
    <section className="privacy-trust" aria-labelledby="privacy-heading">
      <div className="privacy-trust__copy">
        <p className="section-label">{t.label}</p>
        <h2 id="privacy-heading" className="section-title">
          {t.heading}
        </h2>
        <p>{t.copy}</p>
      </div>
      <ul className="privacy-trust__list">
        {t.points.map((point) => (
          <li key={point}>{point}</li>
        ))}
      </ul>
    </section>
  )
}
