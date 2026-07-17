import { useMemo, useState } from 'react'
import { Archive, Filter, Plus, Search, X } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { AchievementCard } from '../components/AchievementCard'
import { EmptyState } from '../components/EmptyState'
import type { Achievement, AchievementStatus, AppView } from '../types'

interface LibraryViewProps {
  achievements: Achievement[]
  onOpen: (achievement: Achievement) => void
  onNavigate: (view: AppView) => void
  onClearDemo: () => void
}

type StatusFilter = 'all' | AchievementStatus

const filters: { id: StatusFilter; label: string }[] = [
  { id: 'all', label: 'الكل' },
  { id: 'ready', label: 'جاهز' },
  { id: 'needs-proof', label: 'يحتاج دليلًا' },
  { id: 'draft', label: 'مسودة' },
]

export function LibraryView({ achievements, onOpen, onNavigate, onClearDemo }: LibraryViewProps) {
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<StatusFilter>('all')

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    return achievements.filter((achievement) => {
      const matchesStatus = status === 'all' || achievement.status === status
      const haystack = [achievement.title, achievement.project, achievement.company, ...achievement.skills].join(' ').toLowerCase()
      return matchesStatus && (!normalized || haystack.includes(normalized))
    })
  }, [achievements, query, status])

  const hasDemo = achievements.some((achievement) => achievement.isDemo)

  return (
    <div className="page library-page">
      <header className="page-header library-header">
        <div>
          <span className="eyebrow">مكتبتك المهنية</span>
          <h1>كل منجزاتك، في مكان واحد.</h1>
          <p>إجمالي المنجزات: {achievements.length} · الجاهزة للاستخدام: {achievements.filter((item) => item.status === 'ready').length}</p>
        </div>
        <div className="header-actions">
          {hasDemo && <button className="button ghost" onClick={onClearDemo}><X size={16} /> حذف البيانات التجريبية</button>}
          <button className="button primary" onClick={() => onNavigate('capture')}><Plus size={18} /> إنجاز جديد</button>
        </div>
      </header>

      <div className="library-toolbar">
        <label className="search-field">
          <Search size={18} />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="ابحث بالعنوان، أو المشروع، أو الجهة، أو المهارة" />
          {query && <button onClick={() => setQuery('')} aria-label="مسح البحث"><X size={15} /></button>}
        </label>
        <div className="filter-tabs">
          <Filter size={16} />
          {filters.map((filter) => (
            <button key={filter.id} className={status === filter.id ? 'active' : ''} onClick={() => setStatus(filter.id)}>
              {status === filter.id && <motion.i className="filter-active" layoutId="library-filter" transition={{ type: 'spring', stiffness: 430, damping: 34 }} />}
              <span>{filter.label}</span>
            </button>
          ))}
        </div>
      </div>

      {filtered.length ? (
        <div className="library-grid">
          <AnimatePresence mode="popLayout">
            {filtered.map((achievement) => <AchievementCard key={achievement.id} achievement={achievement} onOpen={onOpen} />)}
          </AnimatePresence>
        </div>
      ) : achievements.length ? (
        <div className="no-results">
          <Archive size={28} />
          <h3>لا توجد نتائج مطابقة</h3>
          <p>جرّب كلمة أخرى أو اعرض جميع الحالات.</p>
          <button className="button secondary" onClick={() => { setQuery(''); setStatus('all') }}>عرض جميع المنجزات</button>
        </div>
      ) : (
        <EmptyState onAction={() => onNavigate('capture')} />
      )}
    </div>
  )
}
