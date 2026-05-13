import { useState, type FormEvent } from 'react'
import type { Product } from '../data/products'
import { useLanguage } from '../i18n/useLanguage'
import { defaultSizes, findProductById, getDefaultColors, productDetailPath } from '../utils/catalog'

type CartPageProps = {
  products: Product[]
}

function parsePrice(price: string) {
  return Number(price.replace(/\D/g, '')) || 0
}

function formatMoney(value: number) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value)
}

export function CartPage({ products }: CartPageProps) {
  const { locale, m } = useLanguage()
  const params = new URLSearchParams(window.location.search)
  const product = findProductById(products, params.get('product')) ?? products[0]
  const [quantity, setQuantity] = useState(Number(params.get('qty')) || 1)
  const [saved, setSaved] = useState(false)
  const selectedSize = params.get('size') ?? defaultSizes[1]
  const selectedColor = params.get('color') ?? getDefaultColors(locale)[0]
  const unitPrice = product ? parsePrice(product.price) : 0
  const subtotal = unitPrice * quantity

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSaved(true)
  }

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
    <section className="shop-page cart-page" aria-labelledby="cart-heading">
      <div className="shop-page__intro shop-page__intro--narrow">
        <a className="shop-page__breadcrumb" href="/collections">
          {m.commerce.cart.continueShopping}
        </a>
        <h1 id="cart-heading">{m.commerce.cart.title}</h1>
        <p>{m.commerce.cart.intro}</p>
      </div>

      <div className="cart-layout">
        <section className="cart-summary" aria-labelledby="summary-heading">
          <h2 id="summary-heading">{m.commerce.cart.orderSummary}</h2>
          <article className="cart-line-item">
            <a href={productDetailPath(product)}>
              <img src={product.image} alt={product.name} />
            </a>
            <div>
              <p>{product.category}</p>
              <h3>
                <a href={productDetailPath(product)}>{product.name}</a>
              </h3>
              <small>
                {selectedSize} / {selectedColor}
              </small>
            </div>
          </article>

          <label className="cart-quantity">
            <span>{m.commerce.cart.quantity}</span>
            <input
              type="number"
              min="1"
              max="9"
              value={quantity}
              onChange={(event) => setQuantity(Math.max(1, Number(event.target.value) || 1))}
            />
          </label>

          <dl className="cart-totals">
            <div>
              <dt>{m.commerce.cart.subtotal}</dt>
              <dd>{formatMoney(subtotal)}</dd>
            </div>
            <div>
              <dt>{m.commerce.cart.shipping}</dt>
              <dd>{m.commerce.cart.shippingValue}</dd>
            </div>
            <div className="cart-totals__total">
              <dt>{m.commerce.cart.total}</dt>
              <dd>{formatMoney(subtotal)}</dd>
            </div>
          </dl>
        </section>

        <form className="payment-form" onSubmit={handleSubmit}>
          <section aria-labelledby="contact-heading">
            <h2 id="contact-heading">{m.commerce.cart.contactInfo}</h2>
            <div className="payment-form__grid">
              <label>
                <span>{m.commerce.cart.fullName}</span>
                <input name="fullName" defaultValue="Linh Tran" autoComplete="name" />
              </label>
              <label>
                <span>{m.commerce.cart.email}</span>
                <input name="email" type="email" defaultValue="linh.tran@example.com" autoComplete="email" />
              </label>
              <label>
                <span>{m.commerce.cart.phone}</span>
                <input name="phone" defaultValue="+84 912 345 001" autoComplete="tel" />
              </label>
              <label className="payment-form__wide">
                <span>{m.commerce.cart.address}</span>
                <input
                  name="address"
                  defaultValue="24 Nguyen Hue, District 1, Ho Chi Minh City"
                  autoComplete="shipping street-address"
                />
              </label>
            </div>
          </section>

          <section aria-labelledby="payment-heading">
            <h2 id="payment-heading">{m.commerce.cart.paymentInfo}</h2>
            <div className="payment-form__grid">
              <label className="payment-form__wide">
                <span>{m.commerce.cart.cardName}</span>
                <input name="cardName" defaultValue="Linh Tran" autoComplete="cc-name" />
              </label>
              <label className="payment-form__wide">
                <span>{m.commerce.cart.cardNumber}</span>
                <input name="cardNumber" inputMode="numeric" defaultValue="4242 4242 4242 4242" autoComplete="cc-number" />
              </label>
              <label>
                <span>{m.commerce.cart.expiry}</span>
                <input name="expiry" defaultValue="12/29" autoComplete="cc-exp" />
              </label>
              <label>
                <span>{m.commerce.cart.cvc}</span>
                <input name="cvc" inputMode="numeric" defaultValue="123" autoComplete="cc-csc" />
              </label>
            </div>
            <p className="payment-form__note">{m.commerce.cart.paymentNote}</p>
          </section>

          <button className="btn btn--ink payment-form__submit" type="submit">
            {m.commerce.cart.savePayment}
          </button>
          {saved && <p className="payment-form__confirmation">{m.commerce.cart.confirmation}</p>}
        </form>
      </div>
    </section>
  )
}
