import { motion, useReducedMotion } from 'framer-motion'
import { heroImage } from '../data/products'
import { useLanguage } from '../i18n/useLanguage'

export function Hero() {
  const reduceMotion = useReducedMotion()
  const { m } = useLanguage()

  return (
    <section className="hero" id="top" aria-labelledby="hero-heading">
      <motion.div
        className="hero__media"
        aria-hidden
        initial={reduceMotion ? false : { scale: 1.06 }}
        animate={{ scale: 1 }}
        transition={{ duration: reduceMotion ? 0 : 1.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <img
          src={heroImage}
          alt=""
          className="hero__img"
          loading="eager"
          decoding="async"
          fetchPriority="high"
        />
        <div className="hero__veil" />
      </motion.div>

      <div className="hero__inner">
        <motion.p
          className="hero__eyebrow"
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: reduceMotion ? 0 : 0.15, duration: 0.6 }}
        >
          {m.hero.eyebrow}
        </motion.p>
        <motion.h1
          id="hero-heading"
          className="hero__title"
          initial={reduceMotion ? false : { opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: reduceMotion ? 0 : 0.28, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        >
          {m.hero.titleLine1}
          <span className="hero__title-break"> {m.hero.titleLine2}</span>
        </motion.h1>
        <motion.p
          className="hero__lede"
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: reduceMotion ? 0 : 0.42, duration: 0.55 }}
        >
          {m.hero.lede}
        </motion.p>
        <motion.div
          className="hero__actions"
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: reduceMotion ? 0 : 0.52, duration: 0.5 }}
        >
          <a className="btn btn--primary" href="/collections">
            {m.hero.ctaPrimary}
          </a>
          <a className="btn btn--ghost" href="#craft">
            {m.hero.ctaSecondary}
          </a>
          <a className="btn btn--ghost" href="/virtual-try-on">
            {m.hero.ctaVirtualTryOn}
          </a>
        </motion.div>
      </div>
    </section>
  )
}
