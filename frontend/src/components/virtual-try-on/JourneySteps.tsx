import { useLanguage } from '../../i18n/useLanguage'

export function JourneySteps() {
  const { m } = useLanguage()
  const t = m.virtualTryOn.journey

  return (
    <section
      className="tryon-journey"
      id="how-it-works"
      aria-labelledby="journey-heading"
    >
      <div className="tryon-section-heading">
        <p className="section-label">{t.label}</p>
        <h2 id="journey-heading" className="section-title">
          {t.heading}
        </h2>
      </div>
      <ol className="journey-steps">
        {t.steps.map((step) => (
          <li key={step.step} className="journey-step">
            <span className="journey-step__number">{step.step}</span>
            <h3>{step.title}</h3>
            <p>{step.text}</p>
          </li>
        ))}
      </ol>
    </section>
  )
}
