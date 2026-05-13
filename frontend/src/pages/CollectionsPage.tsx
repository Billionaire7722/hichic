import { useEffect, useMemo, useState } from 'react'
import type { Product, StorefrontCollection } from '../data/products'
import { useLanguage } from '../i18n/useLanguage'
import { getProductCollection, productDetailPath } from '../utils/catalog'

type CollectionsPageProps = {
  products: Product[]
  collections: StorefrontCollection[]
}

function normalizeText(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
}

function productMatchesCollection(product: Product, collection: StorefrontCollection) {
  const collectionText = normalizeText(`${collection.name} ${collection.description} ${collection.descriptionVi ?? ''} ${collection.id}`)
  const productText = normalizeText(`${product.name} ${product.category} ${product.description}`)

  if (productText.includes(normalizeText(collection.name)) || collectionText.includes(normalizeText(product.category))) {
    return true
  }

  if (collection.id.includes('secretary') || collectionText.includes('thu ki')) {
    return productText.includes('top') || productText.includes('blouse') || productText.includes('silk') || productText.includes('ao')
  }

  if (collection.id.includes('pencil') || collectionText.includes('but chi')) {
    return productText.includes('skirt') || productText.includes('pencil') || productText.includes('chan vay')
  }

  if (collection.id.includes('blazer') || collectionText.includes('blazer')) {
    return productText.includes('blazer')
  }

  return false
}

function getCollectionProductCount(products: Product[], collection: StorefrontCollection) {
  const matchedCount = products.filter((product) => productMatchesCollection(product, collection)).length
  return matchedCount || collection.productCount || 0
}

export function CollectionsPage({ products, collections }: CollectionsPageProps) {
  const { m } = useLanguage()
  const visibleCollections = useMemo(
    () => collections.filter((collection) => collection.status !== 'Hidden'),
    [collections],
  )
  const initialCollection = new URLSearchParams(window.location.search).get('collection') ?? ''
  const [selectedCollection, setSelectedCollection] = useState(
    visibleCollections.some((collection) => collection.name === initialCollection) ? initialCollection : '',
  )
  const selectedCollectionItem = visibleCollections.find((collection) => collection.name === selectedCollection)
  const visibleProducts = selectedCollection
    ? selectedCollectionItem
      ? products.filter((product) => productMatchesCollection(product, selectedCollectionItem))
      : []
    : products

  useEffect(() => {
    if (selectedCollection && !visibleCollections.some((collection) => collection.name === selectedCollection)) {
      setSelectedCollection('')
    }
  }, [selectedCollection, visibleCollections])

  const selectCollection = (collection: string) => {
    setSelectedCollection(collection)
    const params = new URLSearchParams(window.location.search)

    if (collection) {
      params.set('collection', collection)
    } else {
      params.delete('collection')
    }

    const query = params.toString()
    window.history.replaceState(null, '', query ? `/collections?${query}` : '/collections')
  }

  return (
    <section className="shop-page collections-page" aria-labelledby="collections-page-heading">
      <div className="shop-page__intro">
        <a className="shop-page__breadcrumb" href="/">
          Hichic
        </a>
        <h1 id="collections-page-heading">{m.commerce.collectionsPage.title}</h1>
        <p>{m.commerce.collectionsPage.intro}</p>
      </div>

      <div className="collections-layout">
        <aside className="collection-filter" aria-label={m.commerce.collectionsPage.filtersLabel}>
          <p>{m.commerce.collectionsPage.filtersLabel}</p>
          <button
            type="button"
            className={!selectedCollection ? 'collection-filter__btn collection-filter__btn--active' : 'collection-filter__btn'}
            onClick={() => selectCollection('')}
            aria-pressed={!selectedCollection}
          >
            <span>{m.commerce.collectionsPage.allCollections}</span>
            <small>{products.length}</small>
          </button>
          {visibleCollections.map((collection) => {
            const count = getCollectionProductCount(products, collection)

            return (
              <button
                key={collection.id}
                type="button"
                className={
                  selectedCollection === collection.name
                    ? 'collection-filter__btn collection-filter__btn--active'
                    : 'collection-filter__btn'
                }
                onClick={() => selectCollection(collection.name)}
                aria-pressed={selectedCollection === collection.name}
              >
                <span>{collection.name}</span>
                <small>{count}</small>
              </button>
            )
          })}
        </aside>

        <div className="collection-results">
          <div className="collection-results__bar">
            <h2>{selectedCollection || m.commerce.collectionsPage.allCollections}</h2>
            <span>
              {visibleProducts.length} {m.commerce.collectionsPage.productCount}
            </span>
          </div>

          {visibleProducts.length > 0 ? (
            <ul className="collection-product-grid">
              {visibleProducts.map((product) => (
                <li key={product.id}>
                  <article className="collection-product-card">
                    <a className="collection-product-card__media" href={productDetailPath(product)}>
                      <img src={product.image} alt={product.name} loading="lazy" decoding="async" />
                    </a>
                    <div className="collection-product-card__body">
                      <span>{getProductCollection(product)}</span>
                      <h3>
                        <a href={productDetailPath(product)}>{product.name}</a>
                      </h3>
                      <p>{product.description}</p>
                      <a className="text-link" href={productDetailPath(product)}>
                        {m.commerce.collectionsPage.viewDetails}
                      </a>
                    </div>
                  </article>
                </li>
              ))}
            </ul>
          ) : (
            <div className="commerce-empty">
              <h2>{m.commerce.collectionsPage.emptyTitle}</h2>
              <p>{m.commerce.collectionsPage.emptyText}</p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
