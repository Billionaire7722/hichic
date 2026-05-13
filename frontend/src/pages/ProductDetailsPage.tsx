import { useEffect, useMemo, useState } from 'react'
import type { Product } from '../data/products'
import { useLanguage } from '../i18n/useLanguage'
import {
  cartPath,
  defaultSizes,
  findProductById,
  getDefaultColors,
  getProductCollection,
  productDetailPath,
} from '../utils/catalog'

type ProductDetailsPageProps = {
  productId?: string
  products: Product[]
}

export function ProductDetailsPage({ productId, products }: ProductDetailsPageProps) {
  const { locale, m } = useLanguage()
  const colorOptions = getDefaultColors(locale)
  const product = findProductById(products, productId) ?? products[0]
  const [selectedSize, setSelectedSize] = useState(defaultSizes[1])
  const [selectedColor, setSelectedColor] = useState(colorOptions[0])
  const relatedProducts = useMemo(() => {
    if (!product) {
      return []
    }

    return products
      .filter(
        (candidate) =>
          candidate.id !== product.id &&
          getProductCollection(candidate) === getProductCollection(product),
      )
      .slice(0, 3)
  }, [product, products])

  useEffect(() => {
    setSelectedColor(colorOptions[0])
  }, [colorOptions])

  if (!product) {
    return (
      <section className="shop-page">
        <div className="commerce-empty">
          <h1>{m.commerce.cart.emptyTitle}</h1>
          <a className="btn btn--ink" href="/collections">
            {m.commerce.cart.continueShopping}
          </a>
        </div>
      </section>
    )
  }

  return (
    <section className="shop-page product-detail-page" aria-labelledby="product-heading">
      <div className="product-detail">
        <div className="product-detail__media">
          <img src={product.image} alt={product.name} />
        </div>

        <article className="product-detail__panel">
          <a className="shop-page__breadcrumb" href="/collections">
            {m.commerce.product.backToCollections}
          </a>
          <p className="product-detail__collection">
            {m.commerce.product.collection}: {getProductCollection(product)}
          </p>
          <h1 id="product-heading">{product.name}</h1>
          <p className="product-detail__price">{product.price}</p>
          <p className="product-detail__desc">{product.description}</p>

          <div className="product-option-group" aria-label={m.commerce.product.chooseSize}>
            <div className="product-option-group__label">
              <span>{m.commerce.product.chooseSize}</span>
              <strong>{selectedSize}</strong>
            </div>
            <div className="product-option-row">
              {defaultSizes.map((size) => (
                <button
                  key={size}
                  type="button"
                  className={selectedSize === size ? 'option-chip option-chip--active' : 'option-chip'}
                  onClick={() => setSelectedSize(size)}
                  aria-pressed={selectedSize === size}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div className="product-option-group" aria-label={m.commerce.product.chooseColor}>
            <div className="product-option-group__label">
              <span>{m.commerce.product.chooseColor}</span>
              <strong>{selectedColor}</strong>
            </div>
            <div className="product-option-row">
              {colorOptions.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={selectedColor === color ? 'option-chip option-chip--active' : 'option-chip'}
                  onClick={() => setSelectedColor(color)}
                  aria-pressed={selectedColor === color}
                >
                  {color}
                </button>
              ))}
            </div>
          </div>

          <div className="product-detail__actions">
            <a className="btn btn--ink" href={cartPath(product, selectedSize, selectedColor)}>
              {m.commerce.product.addToCart}
            </a>
            <a className="btn btn--outline" href="/virtual-try-on">
              {m.commerce.product.tryOn}
            </a>
          </div>

          <dl className="product-detail__notes">
            <div>
              <dt>{m.commerce.product.details}</dt>
              <dd>{m.commerce.product.detailsText}</dd>
            </div>
            <div>
              <dt>{m.commerce.product.care}</dt>
              <dd>{m.commerce.product.careText}</dd>
            </div>
            <div>
              <dt>{m.commerce.product.shipping}</dt>
              <dd>{m.commerce.product.shippingText}</dd>
            </div>
          </dl>
        </article>
      </div>

      {relatedProducts.length > 0 && (
        <section className="related-products" aria-labelledby="related-heading">
          <div className="collection-results__bar">
            <h2 id="related-heading">{getProductCollection(product)}</h2>
            <span>
              {relatedProducts.length} {m.commerce.collectionsPage.productCount}
            </span>
          </div>
          <ul className="collection-product-grid collection-product-grid--compact">
            {relatedProducts.map((relatedProduct) => (
              <li key={relatedProduct.id}>
                <a className="product-card product-card--link" href={productDetailPath(relatedProduct)}>
                  <div className="product-card__media">
                    <img src={relatedProduct.image} alt={relatedProduct.name} loading="lazy" decoding="async" />
                  </div>
                  <div className="product-card__body">
                    <span className="product-card__category">{getProductCollection(relatedProduct)}</span>
                    <h3 className="product-card__name">{relatedProduct.name}</h3>
                    <p className="product-card__desc">{relatedProduct.description}</p>
                  </div>
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}
    </section>
  )
}
