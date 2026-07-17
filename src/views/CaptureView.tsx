import { useMemo, useState } from 'react'
import { ArrowLeft, ArrowRight, Check, ChevronLeft, Info, Lightbulb, LockKeyhole, Sparkles } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { calculateScore, createAchievement, generateOutput, getMissingPrompts, splitList } from '../lib/achievement-engine'
import type { Achievement, AchievementDraft, Ownership, Visibility } from '../types'
import { ScoreRing } from '../components/ScoreRing'

interface CaptureViewProps {
  onSave: (achievement: Achievement) => void
  onCancel: () => void
  initialAchievement?: Achievement
}

function currentMonth() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

const initialDraft: AchievementDraft = {
  title: '',
  project: '',
  company: '',
  date: currentMonth(),
  ownership: 'led',
  context: '',
  actionsText: '',
  result: '',
  evidenceText: '',
  skillsText: '',
  visibility: 'private',
}

const ownershipOptions: { value: Ownership; label: string; hint: string }[] = [
  { value: 'led', label: 'قدت العمل', hint: 'كنت صاحب القرار أو المسؤول الرئيسي' },
  { value: 'co-led', label: 'شاركت في قيادته', hint: 'الملكية كانت مشتركة' },
  { value: 'contributed', label: 'ساهمت فيه', hint: 'قدمت جزءًا مؤثرًا' },
  { value: 'delivered', label: 'نفّذته', hint: 'توليت التنفيذ المباشر' },
]

function draftFromAchievement(achievement?: Achievement): AchievementDraft {
  if (!achievement) return initialDraft
  return {
    title: achievement.title,
    project: achievement.project,
    company: achievement.company,
    date: achievement.date,
    ownership: achievement.ownership,
    context: achievement.context,
    actionsText: achievement.actions.join('\n'),
    result: achievement.result,
    evidenceText: achievement.evidence.map((item) => item.value).join('\n'),
    skillsText: achievement.skills.join('، '),
    visibility: achievement.visibility,
  }
}

export function CaptureView({ onSave, onCancel, initialAchievement }: CaptureViewProps) {
  const [step, setStep] = useState(1)
  const [draft, setDraft] = useState(() => draftFromAchievement(initialAchievement))
  const score = useMemo(() => calculateScore(draft), [draft])
  const prompts = useMemo(() => getMissingPrompts(draft), [draft])
  const preview = useMemo(() => generateOutput(createAchievement(draft, 'preview'), 'cv'), [draft])

  const setField = <K extends keyof AchievementDraft>(field: K, value: AchievementDraft[K]) => {
    setDraft((current) => ({ ...current, [field]: value }))
  }

  const goNext = () => {
    if (step === 1 && !draft.title.trim()) return
    setStep((current) => Math.min(current + 1, 3))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const goBack = () => {
    if (step === 1) onCancel()
    else setStep((current) => current - 1)
  }

  const save = () => {
    onSave(createAchievement(draft, initialAchievement?.id))
  }

  return (
    <div className="capture-page">
      <header className="capture-header">
        <button className="icon-button" onClick={goBack} aria-label="رجوع"><ArrowRight size={20} /></button>
        <div className="capture-progress">
          {[1, 2, 3].map((item) => (
            <span key={item} className={step >= item ? 'active' : ''}>
              <i>{step > item ? <Check size={11} /> : item}</i>
              <small>{item === 1 ? 'التعريف' : item === 2 ? 'التفاصيل' : 'المراجعة'}</small>
            </span>
          ))}
        </div>
        <span className="auto-save"><i /> محفوظ على جهازك</span>
      </header>

      <div className="capture-layout">
        <section className="capture-form">
          <AnimatePresence mode="wait" initial={false}>
          {step === 1 && (
            <motion.div key="capture-step-1" className="form-step" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -18 }} transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}>
              <span className="step-kicker">01 — {initialAchievement ? 'مراجعة الإنجاز' : 'تعريف الإنجاز'}</span>
              <h1>{initialAchievement ? 'راجع تفاصيل الإنجاز.' : 'ابدأ بما أنجزته.'}</h1>
              <p className="step-intro">اكتب الإنجاز كما حدث. لا تحتاج إلى صياغة احترافية الآن؛ سنرتّب التفاصيل في الخطوات التالية.</p>

              <label className="field large-field">
                <span>ما الإنجاز؟ <b>مطلوب</b></span>
                <input
                  autoFocus
                  value={draft.title}
                  onChange={(event) => setField('title', event.target.value)}
                  placeholder="مثال: أنشأت مكتبة موشن موحّدة للفريق"
                />
              </label>

              <div className="field-grid two">
                <label className="field">
                  <span>اسم المشروع</span>
                  <input value={draft.project} onChange={(event) => setField('project', event.target.value)} placeholder="اسم المبادرة أو المشروع" />
                </label>
                <label className="field">
                  <span>الجهة أو العميل</span>
                  <input value={draft.company} onChange={(event) => setField('company', event.target.value)} placeholder="شركة، عميل، أو مشروع شخصي" />
                </label>
              </div>

              <div className="field-grid two">
                <label className="field">
                  <span>تاريخ الإنجاز</span>
                  <input type="month" value={draft.date} onChange={(event) => setField('date', event.target.value)} />
                </label>
                <label className="field">
                  <span>دورك في الإنجاز</span>
                  <select value={draft.ownership} onChange={(event) => setField('ownership', event.target.value as Ownership)}>
                    {ownershipOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                  </select>
                </label>
              </div>

              <label className="field textarea-field">
                <span>ما المشكلة أو الفرصة؟</span>
                <textarea value={draft.context} onChange={(event) => setField('context', event.target.value)} placeholder="وضّح الوضع قبل بدء العمل، وما الذي كان يحتاج إلى تغيير..." rows={5} />
                <small><Lightbulb size={14} /> ركّز على الوضع السابق، وليس على قائمة المهام.</small>
              </label>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="capture-step-2" className="form-step" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -18 }} transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}>
              <span className="step-kicker">02 — مساهمتك وأثرها</span>
              <h1>وضّح دورك والنتيجة.</h1>
              <p className="step-intro">حدّد ما نفّذته بنفسك، ثم اكتب ما تغيّر بعده. كلما كانت التفاصيل أدق، كانت الصياغة النهائية أقوى.</p>

              <label className="field textarea-field">
                <span>ما الذي نفّذته أنت؟ <b>إجراء واحد في كل سطر</b></span>
                <textarea value={draft.actionsText} onChange={(event) => setField('actionsText', event.target.value)} placeholder={'صممت النظام الأساسي\nبنيت القوالب\nقدمت المشروع للإدارة'} rows={6} />
                <small>{splitList(draft.actionsText).length} {splitList(draft.actionsText).length === 1 ? 'إجراء مسجّل' : 'إجراءات مسجّلة'}</small>
              </label>

              <label className="field textarea-field">
                <span>ما النتيجة؟</span>
                <textarea value={draft.result} onChange={(event) => setField('result', event.target.value)} placeholder="مثال: خفّض وقت الإنتاج، أو رفع جودة التسليم، أو حصل على اعتماد العميل..." rows={4} />
                <small><Info size={14} /> لا يوجد رقم؟ اكتب نتيجة نوعية صحيحة، ولن نخترع رقمًا.</small>
              </label>

              <label className="field textarea-field">
                <span>ما الدليل المتاح؟ <b>دليل واحد في كل سطر</b></span>
                <textarea value={draft.evidenceText} onChange={(event) => setField('evidenceText', event.target.value)} placeholder={'رابط المشروع\nعرض الاعتماد\nرسالة شكر من العميل'} rows={4} />
              </label>

              <label className="field">
                <span>المهارات التي استخدمتها</span>
                <input value={draft.skillsText} onChange={(event) => setField('skillsText', event.target.value)} placeholder="الإخراج الإبداعي، تصميم الحركة، ثلاثي الأبعاد" />
              </label>

              <div className="visibility-field">
                <span>من يمكنه الاطلاع؟</span>
                <div>
                  {([
                    ['private', 'خاص', 'محفوظ لك فقط'],
                    ['shareable', 'قابل للمشاركة', 'يمكن استخدام تفاصيله'],
                    ['anonymized', 'إخفاء الأسماء', 'تُخفى أسماء الجهات'],
                  ] as [Visibility, string, string][]).map(([value, label, hint]) => (
                    <button key={value} className={draft.visibility === value ? 'active' : ''} onClick={() => setField('visibility', value)}>
                      <i>{draft.visibility === value && <Check size={12} />}</i>
                      <span><strong>{label}</strong><small>{hint}</small></span>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="capture-step-3" className="form-step review-step" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -18 }} transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}>
              <span className="step-kicker">03 — مراجعة الجاهزية</span>
              <h1>هل الإنجاز جاهز للاستخدام؟</h1>
              <p className="step-intro">هذه قراءة مباشرة لما وثّقته. يمكنك حفظ الإنجاز الآن، أو استكمال النقاط المقترحة لرفع جاهزيته.</p>

              <div className="review-summary">
                <ScoreRing score={score} size="large" />
                <div>
                  <span>درجة الجاهزية</span>
                  <h2>{score >= 75 ? 'جاهز للاستخدام' : score >= 50 ? 'يحتاج إلى بعض التفاصيل' : 'يحتاج إلى توثيق أكبر'}</h2>
                  <p>{score >= 75 ? 'يمكنك استخدامه الآن في سيرتك الذاتية أو ملف أعمالك.' : 'استكمل النقاط المقترحة حتى يظهر دورك وأثر العمل بوضوح.'}</p>
                </div>
              </div>

              <div className="output-preview">
                <span><Sparkles size={15} /> معاينة سطر السيرة</span>
                <p>{preview.ar}</p>
                {!draft.result && <small>لم نضف نتيجة لأنك لم توثقها بعد.</small>}
              </div>

              <div className="missing-list">
                <div className="section-heading compact-heading">
                  <div><span className="eyebrow">ما الذي ينقص؟</span><h2>{prompts.length ? `${prompts.length} ${prompts.length === 1 ? 'نقطة مقترحة' : 'نقاط مقترحة'}` : 'التفاصيل الأساسية مكتملة'}</h2></div>
                </div>
                {prompts.length ? prompts.map((prompt) => (
                  <button key={`${prompt.field}-${prompt.title}`} onClick={() => setStep(prompt.field === 'context' ? 1 : 2)}>
                    <span><strong>{prompt.title}</strong><small>{prompt.hint}</small></span>
                    <ChevronLeft size={17} />
                  </button>
                )) : (
                  <div className="complete-message"><Check size={17} /> لا توجد نقاط أساسية ناقصة.</div>
                )}
              </div>

              <div className="privacy-confirm"><LockKeyhole size={17} /><span><strong>محفوظ على جهازك</strong><small>هذه النسخة لا ترسل المحتوى إلى أي خدمة خارجية.</small></span></div>
            </motion.div>
          )}
          </AnimatePresence>

          <footer className="capture-actions">
            <button className="button secondary" onClick={goBack}><ArrowRight size={17} /> {step === 1 ? 'إلغاء' : 'السابق'}</button>
            {step < 3 ? (
              <button className="button primary" onClick={goNext} disabled={step === 1 && !draft.title.trim()}>التالي <ArrowLeft size={17} /></button>
            ) : (
              <button className="button primary" onClick={save}><Check size={17} /> {initialAchievement ? 'احفظ التعديلات' : 'احفظ الإنجاز'}</button>
            )}
          </footer>
        </section>

        <aside className="capture-side-panel">
          <div className="side-score"><ScoreRing score={score} size="medium" /></div>
          <span className="eyebrow">تقييم مباشر</span>
          <h3>{draft.title || 'إنجازك القادم'}</h3>
          <div className="criteria-list">
            <span className="done"><i><Check size={10} /></i> ملكية الدور واضحة <b>20</b></span>
            <span className={draft.context.trim().length >= 20 ? 'done' : ''}><i>{draft.context.trim().length >= 20 && <Check size={10} />}</i> سياق واضح <b>10</b></span>
            <span className={splitList(draft.actionsText).length >= 2 ? 'done' : ''}><i>{splitList(draft.actionsText).length >= 2 && <Check size={10} />}</i> مساهمة محددة <b>20</b></span>
            <span className={draft.result.trim().length >= 20 ? 'done' : ''}><i>{draft.result.trim().length >= 20 && <Check size={10} />}</i> نتيجة موثقة <b>25</b></span>
            <span className={splitList(draft.evidenceText).length > 0 ? 'done' : ''}><i>{splitList(draft.evidenceText).length > 0 && <Check size={10} />}</i> دليل داعم <b>25</b></span>
          </div>
          <div className="side-tip"><Lightbulb size={18} /><p>أقوى الإنجازات هي التي توضّح <strong>مسؤوليتك والنتيجة التي حققتها.</strong></p></div>
        </aside>
      </div>
    </div>
  )
}
