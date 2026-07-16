import { useMemo } from 'react'
import { ArrowUpLeft, Award, BarChart3, FileWarning, Layers3, Sparkles } from 'lucide-react'
import type { Achievement, AppView } from '../types'

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
          <span className="eyebrow">Career Intelligence</span>
          <h1>المسار الذي تصنعه أعمالك.</h1>
          <p>قراءة مبنية على ما أثبتّه، مو على قائمة مهارات اخترتها عشوائيًا.</p>
        </div>
      </header>

      <section className="career-narrative">
        <div className="narrative-label"><Sparkles size={16} /> الإشارة الأقوى حاليًا</div>
        <h2>{topSkills.length ? <>أنت تبني مسارًا يجمع بين<br /><em>{topSkills.join(' × ')}</em></> : 'ابدأ بتسجيل منجزاتك حتى يظهر نمط مسارك.'}</h2>
        <p>{topSkills.length ? 'كل إنجاز جديد إما يقوّي هذه الرواية المهنية أو يكشف اتجاهًا جديدًا. الهدف مو جمع تاقات؛ الهدف إثبات تخصص له وزن.' : 'أول ثلاث بطاقات كافية لبدء قراءة أولية لمهاراتك واتجاهك.'}</p>
        <button onClick={() => onNavigate('capture')}>أضف دليلًا جديدًا <ArrowUpLeft size={17} /></button>
      </section>

      <div className="career-grid">
        <section className="skills-panel">
          <div className="section-heading">
            <div><span className="eyebrow">Skill Evidence</span><h2>المهارات المثبتة</h2></div>
            <span className="panel-icon"><BarChart3 size={18} /></span>
          </div>
          {skills.length ? (
            <div className="skill-bars">
              {skills.slice(0, 8).map(([skill, count], index) => (
                <div key={skill}>
                  <header><span><i>{String(index + 1).padStart(2, '0')}</i>{skill}</span><b>{count} {count === 1 ? 'دليل' : 'أدلة'}</b></header>
                  <span className="skill-track"><i style={{ width: `${Math.max((count / maxSkill) * 100, 12)}%` }} /></span>
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
          <div><span className="eyebrow">Evidence Gaps</span><h2>منجزات تستحق تقويتها</h2></div>
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
