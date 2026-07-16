import { useMemo, useState } from 'react'
import { Archive, Filter, Plus, Search, SlidersHorizontal, X } from 'lucide-react'
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
          <span className="eyebrow">Achievement Vault</span>
          <h1>مكتبة المنجزات</h1>
          <p>{achievements.length} إنجازات محفوظة · {achievements.filter((item) => item.status === 'ready').length} جاهزة للاستخدام</p>
        </div>
        <div className="header-actions">
          {hasDemo && <button className="button ghost" onClick={onClearDemo}><X size={16} /> امسح التجريبي</button>}
          <button className="button primary" onClick={() => onNavigate('capture')}><Plus size={18} /> إنجاز جديد</button>
        </div>
      </header>

      <div className="library-toolbar">
        <label className="search-field">
          <Search size={18} />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="ابحث باسم المشروع، الجهة أو المهارة..." />
          {query && <button onClick={() => setQuery('')} aria-label="مسح البحث"><X size={15} /></button>}
        </label>
        <div className="filter-tabs">
          <Filter size={16} />
          {filters.map((filter) => (
            <button key={filter.id} className={status === filter.id ? 'active' : ''} onClick={() => setStatus(filter.id)}>{filter.label}</button>
          ))}
        </div>
        <button className="filter-icon" aria-label="خيارات تصفية إضافية"><SlidersHorizontal size={18} /></button>
      </div>

      {filtered.length ? (
        <div className="library-grid">
          {filtered.map((achievement) => <AchievementCard key={achievement.id} achievement={achievement} onOpen={onOpen} />)}
        </div>
      ) : achievements.length ? (
        <div className="no-results">
          <Archive size={28} />
          <h3>ما لقينا شيئًا بهذه المواصفات</h3>
          <p>خفف الفلاتر أو جرّب كلمة بحث ثانية.</p>
          <button className="button secondary" onClick={() => { setQuery(''); setStatus('all') }}>مسح الفلاتر</button>
        </div>
      ) : (
        <EmptyState onAction={() => onNavigate('capture')} />
      )}
    </div>
  )
}
