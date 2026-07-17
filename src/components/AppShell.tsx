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
import { motion } from 'motion/react'
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
  { id: 'studio', label: 'الصياغات', icon: FileOutput },
  { id: 'career', label: 'مسارك', icon: BarChart3 },
]

const mobileNavItems: NavItem[] = [
  { id: 'dashboard', label: 'الرئيسية', icon: LayoutDashboard },
  { id: 'library', label: 'المنجزات', icon: Archive },
  { id: 'capture', label: 'إضافة', icon: Plus },
  { id: 'studio', label: 'الصياغات', icon: FileOutput },
  { id: 'career', label: 'مسارك', icon: BarChart3 },
]

export function AppShell({ view, onNavigate, children }: AppShellProps) {
  return (
    <div className={`app-shell ${view === 'capture' ? 'capture-mode' : ''}`}>
      <aside className="sidebar">
        <button className="brand" onClick={() => onNavigate('dashboard')} aria-label="العودة للرئيسية">
          <span className="brand-mark"><Sparkles size={19} strokeWidth={1.8} /></span>
          <span className="brand-copy">
            <strong>أثَر</strong>
            <small>رصيدك المهني</small>
          </span>
        </button>

        <motion.button className="primary-capture" onClick={() => onNavigate('capture')} whileTap={{ scale: 0.97 }}>
          <Plus size={19} />
          <span>سجّل إنجازًا</span>
          <kbd><Command size={11} /> K</kbd>
        </motion.button>

        <nav className="side-nav" aria-label="التنقل الرئيسي">
          <span className="nav-eyebrow">مساحة العمل</span>
          {navItems.map(({ id, label, icon: Icon }) => (
            <motion.button
              key={id}
              className={view === id ? 'active' : ''}
              onClick={() => onNavigate(id)}
              whileTap={{ scale: 0.98 }}
            >
              <Icon size={19} strokeWidth={1.8} />
              <span>{label}</span>
              {view === id && <motion.i layoutId="side-nav-active" />}
            </motion.button>
          ))}
        </nav>

        <div className="privacy-note">
          <span><LockKeyhole size={17} /></span>
          <div>
            <strong>محفوظ على هذا الجهاز</strong>
            <small>لا تُرسل البيانات خارج المتصفح.</small>
          </div>
        </div>

        <div className="sidebar-footer">
          <div className="avatar">ح</div>
          <div>
            <strong>حمزة</strong>
            <small>مساحة محلية</small>
          </div>
        </div>
      </aside>

      <header className="mobile-header">
        <button className="brand compact" onClick={() => onNavigate('dashboard')}>
          <span className="brand-mark"><Sparkles size={17} /></span>
          <strong>أثَر</strong>
        </button>
        <span className="mobile-local"><i /> حفظ محلي</span>
      </header>

      <main className="app-content">{children}</main>

      <nav className="mobile-nav" aria-label="التنقل الرئيسي للجوال">
        {mobileNavItems.map(({ id, label, icon: Icon }) => (
          <motion.button
            key={id}
            className={`${view === id ? 'active' : ''} ${id === 'capture' ? 'capture-tab' : ''}`}
            onClick={() => onNavigate(id)}
            whileTap={{ scale: 0.9 }}
          >
            {view === id && id !== 'capture' && <motion.i className="mobile-active-pill" layoutId="mobile-nav-active" />}
            <span className={id === 'capture' ? 'capture-tab-icon' : ''}><Icon size={id === 'capture' ? 23 : 19} strokeWidth={view === id ? 2.4 : 1.8} /></span>
            <span>{label}</span>
          </motion.button>
        ))}
      </nav>
    </div>
  )
}
