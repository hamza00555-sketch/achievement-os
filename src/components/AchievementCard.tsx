import { ArrowUpLeft, CircleCheck, Clock3, EyeOff, FileWarning, ShieldCheck } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import { formatMonth } from '../lib/achievement-engine'
import type { Achievement } from '../types'
import { ScoreRing } from './ScoreRing'

interface AchievementCardProps {
  achievement: Achievement
  onOpen: (achievement: Achievement) => void
  compact?: boolean
}

const statusMeta = {
  ready: { label: 'جاهز', icon: CircleCheck, className: 'ready' },
  'needs-proof': { label: 'ينقصه دليل', icon: FileWarning, className: 'needs-proof' },
  draft: { label: 'مسودة', icon: Clock3, className: 'draft' },
}

export function AchievementCard({ achievement, onOpen, compact = false }: AchievementCardProps) {
  const reducedMotion = useReducedMotion()
  const status = statusMeta[achievement.status]
  const StatusIcon = status.icon

  return (
    <motion.article
      layout
      className={`achievement-card ${compact ? 'compact' : ''}`}
      onClick={() => onOpen(achievement)}
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      viewport={{ once: true, amount: 0.15 }}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.99 }}
      transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="achievement-card-top">
        <div className={`status-chip ${status.className}`}>
          <motion.span
            className="status-motion-icon"
            animate={reducedMotion ? undefined : { scale: [1, 1.16, 1], rotate: [0, -6, 4, 0] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut', delay: (achievement.score % 5) * 0.16 }}
          ><StatusIcon size={13} /></motion.span>
          {status.label}
        </div>
        {achievement.isDemo && <span className="demo-chip">تجريبي</span>}
        <ScoreRing score={achievement.score} size="small" label={false} />
      </div>

      <div className="achievement-card-copy">
        <span className="achievement-context">{achievement.project || achievement.company || 'إنجاز مهني'} · {formatMonth(achievement.date)}</span>
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
          {achievement.visibility === 'private' ? 'خاص' : achievement.visibility === 'shareable' ? 'قابل للمشاركة' : 'الأسماء مخفية'}
        </span>
        <button aria-label={`فتح ${achievement.title}`}><ArrowUpLeft size={18} /></button>
      </footer>
    </motion.article>
  )
}
