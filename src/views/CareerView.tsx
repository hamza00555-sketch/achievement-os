import { useMemo } from 'react'
import { ArrowUpLeft, Award, BarChart3, FileWarning, Layers3, Sparkles } from 'lucide-react'
import { motion } from 'motion/react'
import type { Achievement, AppView } from '../types'
import { Reveal } from '../components/MotionSystem'

interface CareerViewProps {
  achievements: Achievement[]
  onNavigate: (view: AppView) => void
  onOpen: (achievement: Achievement) => void
}

export function CareerView({ achievements, onNavigate, onOpen }: CareerViewProps) {
  const skills = useMemo(() => {
    const counts = new Map<string, number>()
    achievements.forEach((achievement) => achievement.skills.forEach((skill) => counts.set(skill, (counts.get(skill) ?? 0) + 1)))
    return [...counts.entries()].sort((a, b) => b[1] - a[1])
  }, [achievements])

  const maxSkill = Math.max(...skills.map(([, count]) => count), 1)
  const strongest = [...achievements].sort((a, b) => b.score - a.score)[0]
  const weak = achievements.filter((achievement) => achievement.score < 75)
  const topSkills = skills.slice(0, 3).map(([skill]) => skill)

  return (
    <div className="page career-page">
      <header className="page-header">
        <div>
          <span className="eyebrow">مسارك المهني</span>
          <h1>المسار الذي تصنعه أعمالك.</h1>
          <p>صورة مبنية على الإنجازات التي وثّقتها، لا على مهارات غير مدعومة بأمثلة.</p>
        </div>
      </header>

      <Reveal className="career-narrative" y={14}>
        <div className="narrative-label"><Sparkles size={16} /> أبرز اتجاه في منجزاتك</div>
        <h2>{topSkills.length ? <>أنت تبني مسارًا يجمع بين <em>{topSkills.join(' × ')}</em></> : 'ابدأ بتسجيل منجزاتك حتى يظهر اتجاه مسارك.'}</h2>
        <p>{topSkills.length ? 'كل إنجاز جديد يعزّز هذا الاتجاه أو يكشف جانبًا مختلفًا من خبرتك. الهدف هو إثبات تخصصك بأعمال واضحة.' : 'بعد توثيق ثلاثة إنجازات، ستبدأ صورة مهاراتك واتجاهك في الظهور.'}</p>
        <motion.button onClick={() => onNavigate('capture')} whileTap={{ scale: 0.98 }}>أضف إنجازًا جديدًا <ArrowUpLeft size={17} /></motion.button>
      </Reveal>

      <div className="career-grid">
        <section className="skills-panel">
          <div className="section-heading">
            <div><span className="eyebrow">الأدلة المهارية</span><h2>المهارات المثبتة</h2></div>
            <span className="panel-icon"><BarChart3 size={18} /></span>
          </div>
          {skills.length ? (
            <div className="skill-bars">
              {skills.slice(0, 8).map(([skill, count], index) => (
                <div key={skill}>
                  <header><span><i>{String(index + 1).padStart(2, '0')}</i>{skill}</span><b>{count} {count === 1 ? 'دليل' : 'أدلة'}</b></header>
                  <span className="skill-track"><motion.i initial={{ width: 0 }} whileInView={{ width: `${Math.max((count / maxSkill) * 100, 12)}%` }} viewport={{ once: true }} transition={{ duration: 0.7, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }} /></span>
                </div>
              ))}
            </div>
          ) : <p className="panel-empty">لا توجد مهارات مثبتة بعد.</p>}
        </section>

        <aside className="career-aside">
          <article className="career-stat-card">
            <span><Layers3 size={19} /></span>
            <strong>{achievements.length}</strong>
            <p>إجمالي المنجزات</p>
          </article>
          <article className="career-stat-card accent">
            <span><Award size={19} /></span>
            <strong>{strongest?.score ?? 0}</strong>
            <p>أقوى درجة جاهزية</p>
          </article>
        </aside>
      </div>

      <section className="evidence-gaps">
        <div className="section-heading">
          <div><span className="eyebrow">نقاط تحتاج توثيقًا</span><h2>منجزات تستحق تقويتها</h2></div>
          <span className="panel-icon warning"><FileWarning size={18} /></span>
        </div>
        {weak.length ? (
          <div className="gap-list">
            {weak.slice(0, 4).map((achievement) => (
              <button key={achievement.id} onClick={() => onOpen(achievement)}>
                <span className="gap-score">{achievement.score}</span>
                <span><strong>{achievement.title}</strong><small>{achievement.status === 'needs-proof' ? 'يحتاج دليلًا يدعم النتيجة' : 'يحتاج نتيجة أو دورًا أكثر تحديدًا'}</small></span>
                <ArrowUpLeft size={17} />
              </button>
            ))}
          </div>
        ) : <div className="all-documented"><Award size={22} /> كل المنجزات الحالية جاهزة للاستخدام.</div>}
      </section>
    </div>
  )
}
