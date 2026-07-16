import { ArrowUpLeft, CircleCheck, Clock3, EyeOff, FileWarning, ShieldCheck } from 'lucide-react'
import { formatMonth } from '../lib/achievement-engine'
import type { Achievement } from '../types'
import { ScoreRing } from './ScoreRing'

interface AchievementCardProps {
  achievement: Achievement
  onOpen: (achievement: Achievement) => void
  compact?: boolean
}

const statusMeta = {
  ready: { label: 'جاهز للاستخدام', icon: CircleCheck, className: 'ready' },
  'needs-proof': { label: 'يحتاج دليلًا', icon: FileWarning, className: 'needs-proof' },
  draft: { label: 'مسودة', icon: Clock3, className: 'draft' },
}

export function AchievementCard({ achievement, onOpen, compact = false }: AchievementCardProps) {
  const status = statusMeta[achievement.status]
  const StatusIcon = status.icon

  return (
    <article className={`achievement-card ${compact ? 'compact' : ''}`} onClick={() => onOpen(achievement)}>
      <div className="achievement-card-top">
        <div className={`status-chip ${status.className}`}>
          <StatusIcon size={13} />
          {status.label}
        </div>
        {achievement.isDemo && <span className="demo-chip">تجريبي</span>}
        <ScoreRing score={achievement.score} size="small" label={false} />
      </div>

      <div className="achievement-card-copy">
        <span className="achievement-context">{achievement.project} · {formatMonth(achievement.date)}</span>
        <h3>{achievement.title}</h3>
        {!compact && <p>{achievement.result || achievement.context}</p>}
      </div>

      <div className="skill-row">
        {achievement.skills.slice(0, compact ? 2 : 3).map((skill) => <span key={skill}>{skill}</span>)}
        {achievement.skills.length > (compact ? 2 : 3) && <span>+{achievement.skills.length - (compact ? 2 : 3)}</span>}
      </div>

      <footer>
        <span className="privacy-label">
          {achievement.visibility === 'private' ? <EyeOff size={14} /> : <ShieldCheck size={14} />}
          {achievement.visibility === 'private' ? 'خاص' : achievement.visibility === 'shareable' ? 'قابل للمشاركة' : 'مجهّل'}
        </span>
        <button aria-label={`فتح ${achievement.title}`}><ArrowUpLeft size={18} /></button>
      </footer>
    </article>
  )
}
