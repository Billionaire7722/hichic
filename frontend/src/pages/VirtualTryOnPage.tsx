import { BusinessValueCards } from '../components/virtual-try-on/BusinessValueCards'
import { CTASection } from '../components/virtual-try-on/CTASection'
import { DemoTryOn } from '../components/virtual-try-on/DemoTryOn'
import { FeatureLevelCard } from '../components/virtual-try-on/FeatureLevelCard'
import { JourneySteps } from '../components/virtual-try-on/JourneySteps'
import { PrivacyTrustSection } from '../components/virtual-try-on/PrivacyTrustSection'
import { TryOnHero } from '../components/virtual-try-on/TryOnHero'
import { useLanguage } from '../i18n/useLanguage'

function ShoppingInsight() {
  const { m } = useLanguage()
  const t = m.virtualTryOn.insight

  return (
    <section className="shopping-insight" aria-labelledby="insight-heading">
      <div className="tryon-section-heading">
        <p className="section-label">{t.label}</p>
        <h2 id="insight-heading" className="section-title">
          {t.heading}
        </h2>
        <p className="section-copy">{t.copy}</p>
      </div>
      <div className="insight-grid">
        {t.cards.map((card) => (
          <article className="insight-card" key={card.title}>
            <h3>{card.title}</h3>
            <p>{card.text}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

function FeatureLevels() {
  const { m } = useLanguage()
  const t = m.virtualTryOn.levels

  return (
    <section className="feature-levels" aria-labelledby="levels-heading">
      <div className="tryon-section-heading">
        <p className="section-label">{t.label}</p>
        <h2 id="levels-heading" className="section-title">
          {t.heading}
        </h2>
        <p className="section-copy">{t.copy}</p>
      </div>
      <div className="feature-levels__grid">
        {t.cards.map((level, index) => (
          <FeatureLevelCard key={level.title} level={level} index={index} />
        ))}
      </div>
    </section>
  )
}

export function VirtualTryOnPage() {
  return (
    <>
      <TryOnHero />
      <ShoppingInsight />
      <FeatureLevels />
      <DemoTryOn />
      <JourneySteps />
      <BusinessValueCards />
      <PrivacyTrustSection />
      <CTASection />
    </>
  )
}
