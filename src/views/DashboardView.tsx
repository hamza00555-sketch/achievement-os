import { ArrowLeft, ArrowUpLeft, CheckCircle2, ChevronLeft, CircleDashed, Plus, TrendingUp } from 'lucide-react'
import type { Achievement, AppView } from '../types'
import { AchievementCard } from '../components/AchievementCard'
import { EmptyState } from '../components/EmptyState'

interface DashboardViewProps {
  achievements: Achievement[]
  stats: { total: number; ready: number; averageScore: number; skillCount: number }
  onNavigate: (view: AppView) => void
  onOpen: (achievement: Achievement) => void
}

export function DashboardView({ achievements, stats, onNavigate, onOpen }: DashboardViewProps) {
  const recent = [...achievements].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3)
  const needsWork = achievements.filter((achievement) => achievement.status !== 'ready')
  const currentDate = new Intl.DateTimeFormat('ar-SA', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date())

  return (
    <div className="page dashboard-page">
      <header className="page-header">
        <div>
          <span className="eyebrow">{currentDate}</span>
          <h1>شغلك أكبر من ذاكرتك.</h1>
          <p>خلّ كل إنجاز يضيف شيئًا واضحًا لرصيدك المهني.</p>
        </div>
        <button className="button primary desktop-action" onClick={() => onNavigate('capture')}>
          <Plus size={18} /> سجّل إنجازًا
        </button>
      </header>

      <section className="dashboard-hero">
        <div className="hero-copy">
          <span className="hero-kicker"><i /> التقاط سريع</span>
          <h2>وش الشيء اللي<br />أنجزته مؤخرًا؟</h2>
          <p>اكتبه بطريقتك. «أثر» يرتبه، يكشف المعلومات الناقصة، ويجهزه للاستخدام.</p>
          <button onClick={() => onNavigate('capture')}>
            ابدأ التوثيق <ArrowLeft size={18} />
          </button>
        </div>
        <div className="hero-orbit" aria-hidden="true">
          <div className="orbit orbit-one"><span>دليل</span></div>
          <div className="orbit orbit-two"><span>أثر</span></div>
          <div className="orbit-core">
            <strong>{stats.total}</strong>
            <small>إنجاز موثّق</small>
          </div>
        </div>
      </section>

      <section className="stats-grid" aria-label="ملخص الرصيد المهني">
        <article>
          <span className="stat-icon lime"><TrendingUp size={19} /></span>
          <div><strong>{stats.averageScore}<small>/100</small></strong><span>متوسط الجاهزية</span></div>
          <i className="mini-line up" />
        </article>
        <article>
          <span className="stat-icon blue"><CheckCircle2 size={19} /></span>
          <div><strong>{stats.ready}</strong><span>جاهز للاستخدام</span></div>
          <small className="stat-aside">من {stats.total}</small>
        </article>
        <article>
          <span className="stat-icon amber"><CircleDashed size={19} /></span>
          <div><strong>{stats.skillCount}</strong><span>مهارة مثبتة</span></div>
          <i className="mini-dots" />
        </article>
      </section>

      <section className="dashboard-grid">
        <div className="recent-section">
          <div className="section-heading">
            <div><span className="eyebrow">الأحدث</span><h2>آخر المنجزات</h2></div>
            {achievements.length > 3 && (
              <button className="text-button" onClick={() => onNavigate('library')}>عرض الكل <ChevronLeft size={16} /></button>
            )}
          </div>
          {recent.length ? (
            <div className="achievement-list">
              {recent.map((achievement) => (
                <AchievementCard key={achievement.id} achievement={achievement} onOpen={onOpen} compact />
              ))}
            </div>
          ) : (
            <EmptyState onAction={() => onNavigate('capture')} />
          )}
        </div>

        <aside className="next-action-card">
          <span className="eyebrow">الخطوة التالية</span>
          {needsWork.length ? (
            <>
              <div className="next-score"><strong>{needsWork[0].score}</strong><small>%</small></div>
              <h3>قوّ إنجاز<br />«{needsWork[0].title}»</h3>
              <p>{needsWork[0].status === 'needs-proof' ? 'أضف دليلًا واحدًا على الأقل حتى يصبح جاهزًا للسيرة الذاتية.' : 'أضف نتيجة أو رقمًا يوضح الفرق الذي صنعته.'}</p>
              <button onClick={() => onOpen(needsWork[0])}>افتح الإنجاز <ArrowUpLeft size={17} /></button>
            </>
          ) : (
            <>
              <div className="all-ready-mark"><CheckCircle2 size={30} /></div>
              <h3>رصيدك الحالي<br />جاهز للاستخدام.</h3>
              <p>جرّب استديو المخرجات وحوّل أقوى إنجاز إلى قصة مقابلة أو سطر CV.</p>
              <button onClick={() => onNavigate('studio')}>افتح الاستديو <ArrowUpLeft size={17} /></button>
            </>
          )}
        </aside>
      </section>
    </div>
  )
}
