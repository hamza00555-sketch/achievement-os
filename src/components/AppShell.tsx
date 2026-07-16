import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import {
  Archive,
  BarChart3,
  Command,
  FileOutput,
  LayoutDashboard,
  LockKeyhole,
  Plus,
  Sparkles,
} from 'lucide-react'
import type { AppView } from '../types'

interface AppShellProps {
  view: AppView
  onNavigate: (view: AppView) => void
  children: ReactNode
}

interface NavItem {
  id: AppView
  label: string
  icon: LucideIcon
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'الرئيسية', icon: LayoutDashboard },
  { id: 'library', label: 'المنجزات', icon: Archive },
  { id: 'studio', label: 'الاستديو', icon: FileOutput },
  { id: 'career', label: 'مساري', icon: BarChart3 },
]

export function AppShell({ view, onNavigate, children }: AppShellProps) {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <button className="brand" onClick={() => onNavigate('dashboard')} aria-label="العودة للرئيسية">
          <span className="brand-mark"><Sparkles size={19} strokeWidth={1.8} /></span>
          <span className="brand-copy">
            <strong>أثَر</strong>
            <small>رصيدك المهني</small>
          </span>
        </button>

        <button className="primary-capture" onClick={() => onNavigate('capture')}>
          <Plus size={19} />
          <span>سجّل إنجازًا</span>
          <kbd><Command size={11} /> K</kbd>
        </button>

        <nav className="side-nav" aria-label="التنقل الرئيسي">
          <span className="nav-eyebrow">مساحة العمل</span>
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              className={view === id ? 'active' : ''}
              onClick={() => onNavigate(id)}
            >
              <Icon size={19} strokeWidth={1.8} />
              <span>{label}</span>
              {view === id && <i />}
            </button>
          ))}
        </nav>

        <div className="privacy-note">
          <span><LockKeyhole size={17} /></span>
          <div>
            <strong>خاص بجهازك</strong>
            <small>لا تُرفع بياناتك لأي سيرفر.</small>
          </div>
        </div>

        <div className="sidebar-footer">
          <div className="avatar">ح</div>
          <div>
            <strong>حمزة</strong>
            <small>مساحة شخصية</small>
          </div>
          <button aria-label="إعدادات الحساب">•••</button>
        </div>
      </aside>

      <header className="mobile-header">
        <button className="brand compact" onClick={() => onNavigate('dashboard')}>
          <span className="brand-mark"><Sparkles size={17} /></span>
          <strong>أثَر</strong>
        </button>
        <button className="mobile-capture" onClick={() => onNavigate('capture')} aria-label="سجل إنجازًا">
          <Plus size={20} />
        </button>
      </header>

      <main className="app-content">{children}</main>

      <nav className="mobile-nav" aria-label="التنقل الرئيسي للجوال">
        {navItems.map(({ id, label, icon: Icon }) => (
          <button key={id} className={view === id ? 'active' : ''} onClick={() => onNavigate(id)}>
            <Icon size={19} strokeWidth={view === id ? 2.4 : 1.8} />
            <span>{label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}
