import { useLanguage } from '../../i18n/useLanguage'

export function BusinessValueCards() {
  const { m } = useLanguage()
  const t = m.virtualTryOn.business

  return (
    <section className="business-value" aria-labelledby="business-heading">
      <div className="tryon-section-heading">
        <p className="section-label">{t.label}</p>
        <h2 id="business-heading" className="section-title">
          {t.heading}
        </h2>
        <p className="section-copy">{t.copy}</p>
      </div>
      <div className="business-value__grid">
        {t.cards.map((card) => (
          <article key={card.title} className="value-card">
            <h3>{card.title}</h3>
            <p>{card.text}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
