import { motion, useReducedMotion } from 'framer-motion'
import { useLanguage } from '../../i18n/useLanguage'

export function TryOnHero() {
  const reduceMotion = useReducedMotion()
  const { m } = useLanguage()
  const t = m.virtualTryOn.hero

  return (
    <section className="tryon-hero" id="top" aria-labelledby="tryon-hero-heading">
      <div className="tryon-hero__inner">
        <motion.div
          className="tryon-hero__copy"
          initial={reduceMotion ? false : { opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.65, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="section-label">{t.label}</p>
          <h1 id="tryon-hero-heading" className="tryon-hero__title">
            {t.title}
          </h1>
          <p className="tryon-hero__lede">{t.lede}</p>
          <div className="tryon-hero__actions">
            <a className="btn btn--ink" href="#demo">
              {t.ctaPrimary}
            </a>
            <a className="btn btn--outline" href="#how-it-works">
              {t.ctaSecondary}
            </a>
          </div>
        </motion.div>

        <motion.div
          className="tryon-hero__visual"
          aria-label="Virtual try-on interface preview"
          initial={reduceMotion ? false : { opacity: 0, y: 34, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: reduceMotion ? 0 : 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="tryon-mock" aria-hidden="true">
            <div className="tryon-mock__bar">
              <span />
              <span />
              <span />
            </div>
            <div className="tryon-mock__body">
              <div className="tryon-mock__preview">
                <div className="tryon-avatar">
                  <div className="tryon-avatar__head" />
                  <div className="tryon-avatar__neck" />
                  <div className="tryon-avatar__body" />
                  <div className="tryon-avatar__shirt tryon-avatar__shirt--hero" />
                  <div className="tryon-avatar__lapel tryon-avatar__lapel--left" />
                  <div className="tryon-avatar__lapel tryon-avatar__lapel--right" />
                </div>
                <div className="tryon-mock__tag">{t.mockTag}</div>
              </div>
              <div className="tryon-mock__products">
                <div className="tryon-mini-card tryon-mini-card--active">
                  <span className="tryon-mini-card__swatch tryon-mini-card__swatch--cream" />
                  <strong>{t.miniCards[0].name}</strong>
                  <small>{t.miniCards[0].status}</small>
                </div>
                <div className="tryon-mini-card">
                  <span className="tryon-mini-card__swatch tryon-mini-card__swatch--camel" />
                  <strong>{t.miniCards[1].name}</strong>
                  <small>{t.miniCards[1].status}</small>
                </div>
                <div className="tryon-mini-card">
                  <span className="tryon-mini-card__swatch tryon-mini-card__swatch--ink" />
                  <strong>{t.miniCards[2].name}</strong>
                  <small>{t.miniCards[2].status}</small>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
