import { motion, useReducedMotion } from 'framer-motion'
import type { Product } from '../data/products'
import { useLanguage } from '../i18n/useLanguage'

type Props = { products: Product[] }

export function Collection({ products }: Props) {
  const reduceMotion = useReducedMotion()
  const { m } = useLanguage()

  const listVariants = {
    hidden: {},
    show: {
      transition: reduceMotion
        ? { staggerChildren: 0, delayChildren: 0 }
        : { staggerChildren: 0.08, delayChildren: 0.06 },
    },
  }

  const itemVariants = {
    hidden: reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 28 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: reduceMotion ? 0 : 0.55,
        ease: [0.22, 1, 0.36, 1] as const,
      },
    },
  }

  return (
    <section className="collection" id="collection" aria-labelledby="collection-heading">
      <div className="collection__intro">
        <p className="section-label">{m.collection.label}</p>
        <h2 id="collection-heading" className="section-title">
          {m.collection.heading}
        </h2>
        <p className="section-copy">{m.collection.copy}</p>
      </div>

      <motion.ul
        className="collection__grid"
        variants={listVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-12% 0px' }}
      >
        {products.map((p) => (
          <motion.li key={p.id} variants={itemVariants}>
            <article className="product-card">
              <div className="product-card__media">
                <img src={p.image} alt={p.name} loading="lazy" decoding="async" />
                <div className="product-card__shine" aria-hidden />
              </div>
              <div className="product-card__body">
                <span className="product-card__category">{p.category}</span>
                <h3 className="product-card__name">{p.name}</h3>
                <p className="product-card__desc">{p.description}</p>
                <span className="product-card__price">{p.price}</span>
              </div>
            </article>
          </motion.li>
        ))}
      </motion.ul>
    </section>
  )
}
