import { motion, useReducedMotion } from 'framer-motion'
import { useLanguage } from '../i18n/useLanguage'

export function Newsletter() {
  const reduceMotion = useReducedMotion()
  const { m } = useLanguage()

  return (
    <section
      className="newsletter"
      id="newsletter"
      aria-labelledby="newsletter-heading"
    >
      <motion.div
        className="newsletter__panel"
        initial={reduceMotion ? false : { opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-8%' }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      >
        <h2 id="newsletter-heading" className="newsletter__title">
          {m.newsletter.title}
        </h2>
        <p className="newsletter__text">{m.newsletter.text}</p>
        <form
          className="newsletter__form"
          onSubmit={(e) => e.preventDefault()}
        >
          <label htmlFor="email" className="visually-hidden">
            {m.newsletter.emailLabel}
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder={m.newsletter.placeholder}
            className="newsletter__input"
          />
          <button type="submit" className="btn btn--primary newsletter__submit">
            {m.newsletter.submit}
          </button>
        </form>
      </motion.div>
    </section>
  )
}
