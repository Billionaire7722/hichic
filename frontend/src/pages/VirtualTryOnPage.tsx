import { BusinessValueCards } from '../components/virtual-try-on/BusinessValueCards'
import { CTASection } from '../components/virtual-try-on/CTASection'
import { JourneySteps } from '../components/virtual-try-on/JourneySteps'
import { PrivacyTrustSection } from '../components/virtual-try-on/PrivacyTrustSection'
import { TryOnHero } from '../components/virtual-try-on/TryOnHero'
import { UserPhotoTryOn } from '../components/virtual-try-on/UserPhotoTryOn'
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

export function VirtualTryOnPage() {
  return (
    <>
      <TryOnHero />
      <ShoppingInsight />
      <UserPhotoTryOn />
      <JourneySteps />
      <BusinessValueCards />
      <PrivacyTrustSection />
      <CTASection />
    </>
  )
}
