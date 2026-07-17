import { useEffect, useState } from 'react'
import { CheckCircle2 } from 'lucide-react'
import { AnimatePresence, MotionConfig, motion } from 'motion/react'
import { AppShell } from './components/AppShell'
import { AchievementDetail } from './components/AchievementDetail'
import { PageTransition } from './components/MotionSystem'
import { useAchievements } from './hooks/useAchievements'
import type { Achievement, AppView } from './types'
import { DashboardView } from './views/DashboardView'
import { CaptureView } from './views/CaptureView'
import { LibraryView } from './views/LibraryView'
import { StudioView } from './views/StudioView'
import { CareerView } from './views/CareerView'

export default function App() {
  const [view, setView] = useState<AppView>('dashboard')
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null)
  const [editingAchievement, setEditingAchievement] = useState<Achievement | undefined>()
  const [toast, setToast] = useState('')
  const {
    achievements,
    stats,
    addAchievement,
    updateAchievement,
    deleteAchievement,
    clearDemoData,
  } = useAchievements()

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setEditingAchievement(undefined)
        setView('capture')
      }
      if (event.key === 'Escape') setSelectedAchievement(null)
    }
    window.addEventListener('keydown', handleShortcut)
    return () => window.removeEventListener('keydown', handleShortcut)
  }, [])

  const navigate = (nextView: AppView) => {
    if (nextView === 'capture') setEditingAchievement(undefined)
    setView(nextView)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const showToast = (message: string) => {
    setToast(message)
    window.setTimeout(() => setToast(''), 2200)
  }

  const saveAchievement = (achievement: Achievement) => {
    if (editingAchievement) {
      updateAchievement(achievement)
      showToast('تم تحديث الإنجاز ودرجة جاهزيته')
    } else {
      addAchievement(achievement)
      showToast('تم حفظ الإنجاز في رصيدك')
    }
    setEditingAchievement(undefined)
    setView('library')
  }

  const editAchievement = (achievement: Achievement) => {
    setSelectedAchievement(null)
    setEditingAchievement(achievement)
    setView('capture')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <MotionConfig reducedMotion="user">
      <AppShell view={view} onNavigate={navigate}>
        <AnimatePresence mode="sync" initial={false}>
          <PageTransition key={`${view}-${editingAchievement?.id ?? 'default'}`} viewKey={`${view}-${editingAchievement?.id ?? 'default'}`}>
            {view === 'dashboard' && (
              <DashboardView achievements={achievements} stats={stats} onNavigate={navigate} onOpen={setSelectedAchievement} />
            )}
            {view === 'capture' && (
              <CaptureView
                key={editingAchievement?.id ?? 'new'}
                initialAchievement={editingAchievement}
                onSave={saveAchievement}
                onCancel={() => { setEditingAchievement(undefined); setView('dashboard') }}
              />
            )}
            {view === 'library' && (
              <LibraryView achievements={achievements} onOpen={setSelectedAchievement} onNavigate={navigate} onClearDemo={clearDemoData} />
            )}
            {view === 'studio' && <StudioView achievements={achievements} onNavigate={navigate} />}
            {view === 'career' && <CareerView achievements={achievements} onNavigate={navigate} onOpen={setSelectedAchievement} />}
          </PageTransition>
        </AnimatePresence>

        <AnimatePresence>
          {selectedAchievement && (
            <AchievementDetail
              achievement={selectedAchievement}
              onClose={() => setSelectedAchievement(null)}
              onEdit={editAchievement}
              onDelete={deleteAchievement}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {toast && (
            <motion.div
              className="toast"
              initial={{ opacity: 0, y: 18, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            >
              <CheckCircle2 size={18} />{toast}
            </motion.div>
          )}
        </AnimatePresence>
      </AppShell>
    </MotionConfig>
  )
}
