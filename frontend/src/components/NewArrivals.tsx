import type { Product } from '../data/products'
import { useLanguage } from '../i18n/useLanguage'
import { productDetailPath } from '../utils/catalog'

type NewArrivalsProps = {
  products: Product[]
}

export function NewArrivals({ products }: NewArrivalsProps) {
  const { m } = useLanguage()
  const newestProducts = products.slice(0, 8)

  return (
    <section className="home-rail new-arrivals" aria-labelledby="new-arrivals-heading">
      <div className="home-rail__head">
        <div>
          <h2 id="new-arrivals-heading">{m.commerce.home.newArrivalsTitle}</h2>
          <p>{m.commerce.home.newArrivalsCopy}</p>
        </div>
        <a className="btn btn--outline" href="/collections">
          {m.commerce.home.seeAll}
        </a>
      </div>

      <ul className="product-rail" aria-label={m.commerce.home.newArrivalsTitle}>
        {newestProducts.map((product) => (
          <li key={product.id}>
            <a className="arrival-card" href={productDetailPath(product)}>
              <span className="arrival-card__media">
                <img src={product.image} alt={product.name} loading="lazy" decoding="async" />
              </span>
              <span className="arrival-card__body">
                <small>{product.category}</small>
                <strong>{product.name}</strong>
                <span>{product.price}</span>
              </span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  )
}

