import type { FeatureLevel } from '../../data/virtualTryOn'

type FeatureLevelCardProps = {
  level: FeatureLevel
  index: number
}

export function FeatureLevelCard({ level, index }: FeatureLevelCardProps) {
  return (
    <article className="feature-level-card">
      <div className="feature-level-card__top">
        <span className="feature-level-card__number">
          {String(index + 1).padStart(2, '0')}
        </span>
        <span className="feature-level-card__badge">{level.badge}</span>
      </div>
      <h3>{level.title}</h3>
      <p>{level.description}</p>
      <ul>
        {level.bullets.map((bullet) => (
          <li key={bullet}>{bullet}</li>
        ))}
      </ul>
    </article>
  )
}
