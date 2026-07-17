import { useMemo, useState } from 'react'
import { Check, Copy, Edit3, EyeOff, FileCheck2, ShieldCheck, Trash2, X } from 'lucide-react'
import { motion } from 'motion/react'
import { formatMonth, generateOutput } from '../lib/achievement-engine'
import type { Achievement } from '../types'
import { ScoreRing } from './ScoreRing'

interface AchievementDetailProps {
  achievement: Achievement
  onClose: () => void
  onEdit: (achievement: Achievement) => void
  onDelete: (id: string) => void
}

export function AchievementDetail({ achievement, onClose, onEdit, onDelete }: AchievementDetailProps) {
  const [copied, setCopied] = useState(false)
  const output = useMemo(() => generateOutput(achievement, 'cv'), [achievement])
  const isMobile = typeof window !== 'undefined' && window.matchMedia('(max-width: 780px)').matches

  const copy = async () => {
    await navigator.clipboard.writeText(output.ar)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1500)
  }

  const remove = () => {
    const confirmed = window.confirm(`حذف «${achievement.title}» من هذا الجهاز؟`)
    if (!confirmed) return
    onDelete(achievement.id)
    onClose()
  }

  return (
    <motion.div className="modal-backdrop" onMouseDown={onClose} role="presentation" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.22 }}>
      <motion.article
        className="detail-drawer"
        onMouseDown={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={achievement.title}
        initial={isMobile ? { opacity: 0, y: 44, scale: 0.99 } : { opacity: 0, x: -32, scale: 0.985 }}
        animate={isMobile ? { opacity: 1, y: 0, scale: 1 } : { opacity: 1, x: 0, scale: 1 }}
        exit={isMobile ? { opacity: 0, y: 32, scale: 0.99 } : { opacity: 0, x: -24, scale: 0.99 }}
        transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
      >
        <header className="detail-header">
          <button className="icon-button" onClick={onClose} aria-label="إغلاق"><X size={20} /></button>
          <div className="detail-actions">
            <button className="button ghost danger" onClick={remove}><Trash2 size={16} /> حذف</button>
            <button className="button secondary" onClick={() => onEdit(achievement)}><Edit3 size={16} /> تحسين الإنجاز</button>
          </div>
        </header>

        <div className="detail-hero">
          <div>
            <span className="eyebrow">{achievement.project || achievement.company} · {formatMonth(achievement.date)}</span>
            <h2>{achievement.title}</h2>
            <div className="detail-tags">
              {achievement.skills.map((skill) => <span key={skill}>{skill}</span>)}
            </div>
          </div>
          <ScoreRing score={achievement.score} size="large" />
        </div>

        <div className="detail-section">
          <span className="detail-label">السياق</span>
          <p>{achievement.context || 'لم يُوثّق السياق بعد.'}</p>
        </div>

        <div className="detail-section">
          <span className="detail-label">دورك وإجراءاتك</span>
          {achievement.actions.length ? <ol>{achievement.actions.map((action, index) => <li key={`${action}-${index}`}>{action}</li>)}</ol> : <p>لا توجد إجراءات موثّقة.</p>}
        </div>

        <div className="detail-section result-section">
          <span className="detail-label">النتيجة</span>
          <p>{achievement.result || 'النتيجة غير موثقة حتى الآن.'}</p>
        </div>

        <div className="detail-section">
          <span className="detail-label">الأدلة</span>
          {achievement.evidence.length ? (
            <div className="evidence-list">{achievement.evidence.map((item) => <span key={item.id}><FileCheck2 size={16} />{item.label}</span>)}</div>
          ) : <div className="missing-evidence">لا يوجد دليل حتى الآن. أضف رابطًا، أو ملفًا، أو رسالة إشادة.</div>}
        </div>

        <div className="detail-output">
          <header><span>سطر جاهز للسيرة</span><button onClick={copy}>{copied ? <Check size={15} /> : <Copy size={15} />}{copied ? 'تم النسخ' : 'نسخ'}</button></header>
          <p>{output.ar}</p>
        </div>

        <footer className="detail-footer">
          <span>{achievement.visibility === 'private' ? <EyeOff size={15} /> : <ShieldCheck size={15} />}{achievement.visibility === 'private' ? 'خاص ومحفوظ على جهازك' : achievement.visibility === 'shareable' ? 'قابل للمشاركة' : 'الأسماء مخفية عند المشاركة'}</span>
        </footer>
      </motion.article>
    </motion.div>
  )
}
