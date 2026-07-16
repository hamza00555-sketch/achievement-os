import type { CSSProperties } from 'react'

interface ScoreRingProps {
  score: number
  size?: 'small' | 'medium' | 'large'
  label?: boolean
}

export function ScoreRing({ score, size = 'medium', label = true }: ScoreRingProps) {
  const normalized = Math.min(Math.max(score, 0), 100)
  return (
    <div
      className={`score-ring ${size}`}
      style={{ '--score': `${normalized * 3.6}deg` } as CSSProperties}
      aria-label={`درجة الجاهزية ${normalized} من 100`}
    >
      <span>{normalized}</span>
      {label && <small>جاهزية</small>}
    </div>
  )
}
