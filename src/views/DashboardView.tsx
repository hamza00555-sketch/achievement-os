import {
  ArrowLeft,
  ArrowUpLeft,
  CheckCircle2,
  ChevronLeft,
  CircleDashed,
  LockKeyhole,
  Plus,
  TrendingUp,
} from 'lucide-react'
import { motion } from 'motion/react'
import type { Achievement, AppView } from '../types'
import { AchievementCard } from '../components/AchievementCard'
import { EmptyState } from '../components/EmptyState'
import { KineticArtifact, Reveal } from '../components/MotionSystem'
import { formatMonth } from '../lib/achievement-engine'

interface DashboardViewProps {
  achievements: Achievement[]
  stats: { total: number; ready: number; averageScore: number; skillCount: number }
  onNavigate: (view: AppView) => void
  onOpen: (achievement: Achievement) => void
}

export function DashboardView({ achievements, stats, onNavigate, onOpen }: DashboardViewProps) {
  const recent = [...achievements].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3)
  const needsWork = achievements.filter((achievement) => achievement.status !== 'ready')

  return (
    <div className="page dashboard-page">
      <header className="page-header dashboard-intro">
        <div>
          <span className="eyebrow">مساحتك المهنية</span>
          <h1>كل إنجاز يستحق أن يُحفظ.</h1>
          <p>وثّق عملك أولًا بأول، وجهّزه للسيرة الذاتية والترقية والمقابلات.</p>
        </div>
        <motion.button className="button primary desktop-action" onClick={() => onNavigate('capture')} whileTap={{ scale: 0.97 }}>
          <Plus size={18} /> أضف إنجازًا
        </motion.button>
      </header>

      <Reveal className="dashboard-hero" y={14}>
        <div className="hero-copy">
          <span className="hero-kicker"><i /> تدوين سريع وآمن</span>
          <h2>وثّق ما أنجزته.<br /><em>واستخدمه عندما تحتاج.</em></h2>
          <p>ابدأ بجملة بسيطة. سنساعدك على توضيح دورك، النتيجة، والدليل خطوة بخطوة.</p>
          <motion.button
            className="hero-primary-action"
            onClick={() => onNavigate('capture')}
            whileHover={{ x: -3 }}
            whileTap={{ scale: 0.98 }}
          >
            سجّل إنجازًا الآن <ArrowLeft size={18} />
          </motion.button>
          <span className="hero-trust"><LockKeyhole size={13} /> يُحفظ كل شيء على جهازك</span>
        </div>
        <KineticArtifact total={stats.total} score={stats.averageScore} />
      </Reveal>

      <section className="stats-grid" aria-label="ملخص منجزاتك">
        {[
          { label: 'متوسط الجاهزية', value: stats.averageScore, suffix: '/100', icon: TrendingUp, tone: 'lime' },
          { label: 'جاهز للاستخدام', value: stats.ready, suffix: `من ${stats.total}`, icon: CheckCircle2, tone: 'blue' },
          { label: 'مهارات مثبتة', value: stats.skillCount, suffix: 'مهارة', icon: CircleDashed, tone: 'amber' },
        ].map((item, index) => {
          const Icon = item.icon
          return (
            <motion.article
              key={item.label}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.42, delay: 0.08 + index * 0.07, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -3 }}
            >
              <span className={`stat-icon ${item.tone}`}><Icon size={19} /></span>
              <div><strong>{item.value}<small>{index === 0 ? item.suffix : ''}</small></strong><span>{item.label}</span></div>
              {index > 0 && <small className="stat-aside">{item.suffix}</small>}
            </motion.article>
          )
        })}
      </section>

      <section className="dashboard-grid">
        <div className="recent-section">
          <div className="section-heading">
            <div><span className="eyebrow">آخر نشاط</span><h2>أحدث المنجزات</h2></div>
            {achievements.length > 3 && (
              <button className="text-button" onClick={() => onNavigate('library')}>جميع المنجزات <ChevronLeft size={16} /></button>
            )}
          </div>

          {recent.length ? (
            <>
              <div className="achievement-list recent-desktop-list">
                {recent.map((achievement) => (
                  <AchievementCard key={achievement.id} achievement={achievement} onOpen={onOpen} compact />
                ))}
              </div>
              <div className="recent-mobile-list">
                {recent.map((achievement, index) => (
                  <motion.button
                    key={achievement.id}
                    onClick={() => onOpen(achievement)}
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + index * 0.06 }}
                    whileTap={{ scale: 0.985 }}
                  >
                    <span className={`recent-status ${achievement.status}`}><i /></span>
                    <span className="recent-copy">
                      <strong>{achievement.title}</strong>
                      <small>{achievement.project || achievement.company || 'إنجاز مهني'} · {formatMonth(achievement.date)}</small>
                    </span>
                    <span className="recent-score">{achievement.score}</span>
                    <ChevronLeft size={17} />
                  </motion.button>
                ))}
              </div>
            </>
          ) : (
            <EmptyState onAction={() => onNavigate('capture')} />
          )}
        </div>

        <motion.aside className="next-action-card" whileHover={{ y: -3 }} transition={{ duration: 0.25 }}>
          <span className="eyebrow">اقتراح لك</span>
          {needsWork.length ? (
            <>
              <div className="next-score"><strong>{needsWork[0].score}</strong><small>/100</small></div>
              <h3>أكمل توثيق<br />«{needsWork[0].title}»</h3>
              <p>{needsWork[0].status === 'needs-proof' ? 'أضف دليلًا واحدًا يدعم النتيجة حتى يصبح الإنجاز جاهزًا للاستخدام.' : 'وضّح النتيجة أو أضف رقمًا يبيّن أثر عملك.'}</p>
              <button onClick={() => onOpen(needsWork[0])}>افتح الإنجاز <ArrowUpLeft size={17} /></button>
            </>
          ) : (
            <>
              <div className="all-ready-mark"><CheckCircle2 size={30} /></div>
              <h3>منجزاتك الحالية<br />جاهزة للاستخدام.</h3>
              <p>حوّل أقوى إنجاز إلى سطر للسيرة الذاتية أو قصة جاهزة للمقابلة.</p>
              <button onClick={() => onNavigate('studio')}>افتح الصياغات <ArrowUpLeft size={17} /></button>
            </>
          )}
        </motion.aside>
      </section>
    </div>
  )
}
