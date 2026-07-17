import { Inbox, Plus } from 'lucide-react'

interface EmptyStateProps {
  title?: string
  body?: string
  onAction: () => void
}

export function EmptyState({
  title = 'ابدأ بأول إنجاز',
  body = 'سجّل ما أنجزته الآن، حتى تجد التفاصيل جاهزة عند تحديث سيرتك الذاتية أو الاستعداد للمقابلة.',
  onAction,
}: EmptyStateProps) {
  return (
    <div className="empty-state">
      <span className="empty-icon"><Inbox size={28} /></span>
      <h3>{title}</h3>
      <p>{body}</p>
      <button className="button primary" onClick={onAction}><Plus size={17} /> سجّل أول إنجاز</button>
    </div>
  )
}
