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
import { motion, useReducedMotion } from 'motion/react'
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
  const reducedMotion = useReducedMotion()

  return (
    <div className={`app-shell ${view === 'capture' ? 'capture-mode' : ''}`}>
      <div className="ambient-field" aria-hidden="true">
        <motion.i
          className="ambient-orb ambient-orb-lime"
          animate={reducedMotion ? undefined : {
            x: ['0vw', '8vw', '-3vw', '0vw'],
            y: ['0vh', '7vh', '18vh', '0vh'],
            scale: [1, 1.18, 0.92, 1],
            opacity: [0.32, 0.48, 0.28, 0.32],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.i
          className="ambient-orb ambient-orb-blue"
          animate={reducedMotion ? undefined : {
            x: ['0vw', '-10vw', '-4vw', '0vw'],
            y: ['0vh', '-8vh', '12vh', '0vh'],
            scale: [1, 0.86, 1.16, 1],
            opacity: [0.24, 0.4, 0.22, 0.24],
          }}
          transition={{ duration: 23, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.i
          className="ambient-orb ambient-orb-amber"
          animate={reducedMotion ? undefined : {
            x: ['0vw', '7vw', '-5vw', '0vw'],
            y: ['0vh', '-14vh', '-5vh', '0vh'],
            scale: [0.92, 1.1, 0.98, 0.92],
            opacity: [0.2, 0.33, 0.18, 0.2],
          }}
          transition={{ duration: 27, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <aside className="sidebar">
        <button className="brand" onClick={() => onNavigate('dashboard')} aria-label="العودة للرئيسية">
          <motion.span
            className="brand-mark"
            animate={reducedMotion ? undefined : { rotate: [-4, 4, -2, -4], y: [0, -3, 0], scale: [1, 1.06, 1] }}
            transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Sparkles size={19} strokeWidth={1.8} />
          </motion.span>
          <span className="brand-copy">
            <strong>أثَر</strong>
            <small>رصيدك المهني</small>
          </span>
        </button>

        <motion.button
          className="primary-capture"
          onClick={() => onNavigate('capture')}
          whileTap={{ scale: 0.97 }}
          animate={reducedMotion ? undefined : { boxShadow: ['0 0 0 rgba(203,250,100,0)', '0 12px 30px rgba(203,250,100,.18)', '0 0 0 rgba(203,250,100,0)'] }}
          transition={{ duration: 3.6, repeat: Infinity, ease: 'easeInOut' }}
        >
          <motion.span
            className="capture-button-icon"
            animate={reducedMotion ? undefined : { rotate: [0, 90, 90, 180], scale: [1, 1.12, 1, 1] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          ><Plus size={19} /></motion.span>
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
              {view === id && (
                <motion.i
                  layoutId="side-nav-active"
                  animate={reducedMotion ? undefined : { opacity: [0.55, 1, 0.55], scaleY: [0.72, 1, 0.72] }}
                  transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
                />
              )}
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
          <motion.span
            className="brand-mark"
            animate={reducedMotion ? undefined : { rotate: [-5, 5, -3, -5], y: [0, -4, 0], scale: [1, 1.07, 1] }}
            transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Sparkles size={17} />
          </motion.span>
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
            {view === id && id !== 'capture' && (
              <motion.i
                className="mobile-active-pill"
                layoutId="mobile-nav-active"
                animate={reducedMotion ? undefined : { opacity: [0.58, 1, 0.58], scale: [0.96, 1, 0.96] }}
                transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
              />
            )}
            <motion.span
              className={id === 'capture' ? 'capture-tab-icon' : 'mobile-nav-icon'}
              animate={reducedMotion ? undefined : id === 'capture'
                ? { y: [0, -6, 0], rotate: [0, -5, 4, 0], scale: [1, 1.04, 1] }
                : view === id
                  ? { y: [0, -3, 0], scale: [1, 1.12, 1], rotate: [0, -4, 0] }
                  : { y: 0, scale: 1, rotate: 0 }}
              transition={id === 'capture'
                ? { duration: 2.6, repeat: Infinity, ease: 'easeInOut' }
                : view === id
                  ? { duration: 2.8, repeat: Infinity, ease: 'easeInOut' }
                  : { type: 'spring', stiffness: 420, damping: 25 }}
            >
              <Icon size={id === 'capture' ? 23 : 19} strokeWidth={view === id ? 2.4 : 1.8} />
            </motion.span>
            <span>{label}</span>
          </motion.button>
        ))}
      </nav>
    </div>
  )
}
