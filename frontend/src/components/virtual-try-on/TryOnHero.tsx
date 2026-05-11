import { useState, useRef } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { useLanguage } from '../../i18n/useLanguage'

import modelBase from '../../assets/model-base.png'
import modelBlazer from '../../assets/model-blazer.png'
import garmentBlouse from '../../assets/garment-blouse.png'
import garmentBlazer from '../../assets/garment-blazer.png'
import garmentSkirt from '../../assets/garment-skirt.png'

export function TryOnHero() {
  const reduceMotion = useReducedMotion()
  const { m } = useLanguage()
  const t = m.virtualTryOn.hero

  const [sliderPos, setSliderPos] = useState(50)
  const containerRef = useRef<HTMLDivElement>(null)

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!containerRef.current) return
    if (e.buttons !== 1) return // only update if button is pressed
    const rect = containerRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const pos = Math.max(0, Math.min(100, (x / rect.width) * 100))
    setSliderPos(pos)
  }

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const pos = Math.max(0, Math.min(100, (x / rect.width) * 100))
    setSliderPos(pos)
  }

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
                <div 
                  className="tryon-slider" 
                  ref={containerRef}
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  style={{ touchAction: 'none' }}
                >
                  <img src={modelBase} alt="Before" className="tryon-slider__img" />
                  <div 
                    className="tryon-slider__overlay" 
                    style={{ clipPath: `polygon(0 0, ${sliderPos}% 0, ${sliderPos}% 100%, 0 100%)` }}
                  >
                    <img src={modelBlazer} alt="After" className="tryon-slider__img" />
                  </div>
                  <div className="tryon-slider__handle" style={{ left: `${sliderPos}%` }}>
                    <div className="tryon-slider__handle-line" />
                    <div className="tryon-slider__handle-button">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="10 16 6 12 10 8" />
                        <polyline points="14 16 18 12 14 8" />
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="tryon-mock__tag">{t.mockTag}</div>
              </div>
              <div className="tryon-mock__products">
                <div className="tryon-mini-card">
                  <img src={garmentBlouse} alt="" className="tryon-mini-card__img" />
                  <div className="tryon-mini-card__text">
                    <strong>{t.miniCards[0].name}</strong>
                    <small>{t.miniCards[0].status}</small>
                  </div>
                </div>
                <div className="tryon-mini-card tryon-mini-card--active">
                  <img src={garmentBlazer} alt="" className="tryon-mini-card__img" />
                  <div className="tryon-mini-card__text">
                    <strong>{t.miniCards[1].name}</strong>
                    <small>{t.miniCards[1].status}</small>
                  </div>
                </div>
                <div className="tryon-mini-card">
                  <img src={garmentSkirt} alt="" className="tryon-mini-card__img" />
                  <div className="tryon-mini-card__text">
                    <strong>{t.miniCards[2].name}</strong>
                    <small>{t.miniCards[2].status}</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
