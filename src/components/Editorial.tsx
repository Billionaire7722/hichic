import { motion, useReducedMotion } from 'framer-motion'
import { editorialImage } from '../data/products'
import { useLanguage } from '../i18n/useLanguage'

export function Editorial() {
  const reduceMotion = useReducedMotion()
  const { m } = useLanguage()

  return (
    <section className="editorial" id="craft" aria-labelledby="craft-heading">
      <motion.div
        className="editorial__visual"
        initial={reduceMotion ? false : { opacity: 0, clipPath: 'inset(0 12% 0 0)' }}
        whileInView={{ opacity: 1, clipPath: 'inset(0 0% 0 0)' }}
        viewport={{ once: true, margin: '-10%' }}
        transition={{ duration: reduceMotion ? 0 : 0.9, ease: [0.22, 1, 0.36, 1] }}
      >
        <img src={editorialImage} alt="" loading="lazy" decoding="async" />
      </motion.div>

      <div className="editorial__copy">
        <p className="section-label">{m.editorial.label}</p>
        <h2 id="craft-heading" className="section-title editorial__title">
          {m.editorial.title}
        </h2>
        <p className="editorial__body">{m.editorial.body}</p>
        <ul className="editorial__list">
          <li>{m.editorial.bullet1}</li>
          <li>{m.editorial.bullet2}</li>
          <li>{m.editorial.bullet3}</li>
        </ul>
      </div>
    </section>
  )
}
