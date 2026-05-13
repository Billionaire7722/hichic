import { motion, useReducedMotion } from 'framer-motion'
import type { StorefrontCollection } from '../data/products'
import { useLanguage } from '../i18n/useLanguage'

type Props = {
  collections: StorefrontCollection[]
}

export function Collection({ collections }: Props) {
  const reduceMotion = useReducedMotion()
  const { locale, m } = useLanguage()
  const collectionCards = collections.slice(0, 3)

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
    <section className="collection home-rail" id="collection" aria-labelledby="collection-heading">
      <div className="collection__intro">
        <h2 id="collection-heading" className="section-title">
          {m.commerce.home.collectionTitle}
        </h2>
        <p className="section-copy">{m.commerce.home.collectionCopy}</p>
      </div>

      <motion.ul
        className="collection__grid"
        variants={listVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-12% 0px' }}
      >
        {collectionCards.map((collection) => (
          <motion.li key={collection.id} variants={itemVariants}>
            <a
              className="product-card product-card--link"
              href={`/collections?collection=${encodeURIComponent(collection.name)}`}
            >
              <div className="product-card__media">
                <img src={collection.coverImage} alt={collection.name} loading="eager" decoding="async" />
                <div className="product-card__shine" aria-hidden />
              </div>
              <div className="product-card__body">
                <span className="product-card__category">
                  {collection.productCount ?? 0} {m.commerce.collectionsPage.productCount}
                </span>
                <h3 className="product-card__name">{collection.name}</h3>
                <p className="product-card__desc">
                  {locale === 'vi' ? collection.descriptionVi || collection.description : collection.description}
                </p>
              </div>
            </a>
          </motion.li>
        ))}
      </motion.ul>
    </section>
  )
}
