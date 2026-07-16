import { useMemo, useState } from 'react'
import { ArrowLeft, ArrowRight, Check, ChevronLeft, Info, Lightbulb, LockKeyhole, Sparkles } from 'lucide-react'
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
              <small>{item === 1 ? 'الأساس' : item === 2 ? 'الأثر' : 'المراجعة'}</small>
            </span>
          ))}
        </div>
        <span className="auto-save"><i /> محفوظ محليًا</span>
      </header>

      <div className="capture-layout">
        <section className="capture-form">
          {step === 1 && (
            <div className="form-step">
              <span className="step-kicker">01 — {initialAchievement ? 'راجع الأساس' : 'التقط الفكرة'}</span>
              <h1>{initialAchievement ? 'خلّ الإنجاز أوضح.' : 'وش أنجزت؟'}</h1>
              <p className="step-intro">لا تحاول تصيغها باحتراف. اكتب الشيء كما تشرحه لصديق، وإحنا نرتبه بعدين.</p>

              <label className="field large-field">
                <span>عنوان سريع للإنجاز <b>مطلوب</b></span>
                <input
                  autoFocus
                  value={draft.title}
                  onChange={(event) => setField('title', event.target.value)}
                  placeholder="مثال: أسست مكتبة موشن للفريق"
                />
              </label>

              <div className="field-grid two">
                <label className="field">
                  <span>المشروع</span>
                  <input value={draft.project} onChange={(event) => setField('project', event.target.value)} placeholder="اسم المبادرة أو المشروع" />
                </label>
                <label className="field">
                  <span>الجهة</span>
                  <input value={draft.company} onChange={(event) => setField('company', event.target.value)} placeholder="شركة، عميل، أو مشروع شخصي" />
                </label>
              </div>

              <div className="field-grid two">
                <label className="field">
                  <span>متى؟</span>
                  <input type="month" value={draft.date} onChange={(event) => setField('date', event.target.value)} />
                </label>
                <label className="field">
                  <span>مستوى الملكية</span>
                  <select value={draft.ownership} onChange={(event) => setField('ownership', event.target.value as Ownership)}>
                    {ownershipOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                  </select>
                </label>
              </div>

              <label className="field textarea-field">
                <span>كيف كان الوضع قبل تدخلك؟</span>
                <textarea value={draft.context} onChange={(event) => setField('context', event.target.value)} placeholder="كانت المشكلة أو الفرصة..." rows={5} />
                <small><Lightbulb size={14} /> ركّز على المشكلة، مو على قائمة المهام.</small>
              </label>
            </div>
          )}

          {step === 2 && (
            <div className="form-step">
              <span className="step-kicker">02 — اكشف الأثر</span>
              <h1>خلّ القيمة واضحة.</h1>
              <p className="step-intro">هنا نفصل بين «كنت مشغول» و«صنعت فرقًا». اكتب الحقائق فقط؛ المبالغة ممنوعة.</p>

              <label className="field textarea-field">
                <span>وش سويت أنت تحديدًا؟ <b>كل إجراء في سطر</b></span>
                <textarea value={draft.actionsText} onChange={(event) => setField('actionsText', event.target.value)} placeholder={'صممت النظام الأساسي\nبنيت القوالب\nقدمت المشروع للإدارة'} rows={6} />
                <small>{splitList(draft.actionsText).length} إجراءات مسجلة</small>
              </label>

              <label className="field textarea-field">
                <span>وش تغيّر بعد شغلك؟</span>
                <textarea value={draft.result} onChange={(event) => setField('result', event.target.value)} placeholder="وفّر وقتًا، حسّن الجودة، حصل على اعتماد، أو استخدمه عدد من الأشخاص..." rows={4} />
                <small><Info size={14} /> إذا ما عندك رقم، اكتب نتيجة نوعية حقيقية. لا نخترع.</small>
              </label>

              <label className="field textarea-field">
                <span>الأدلة <b>كل دليل في سطر</b></span>
                <textarea value={draft.evidenceText} onChange={(event) => setField('evidenceText', event.target.value)} placeholder={'رابط المشروع\nعرض الاعتماد\nرسالة شكر من العميل'} rows={4} />
              </label>

              <label className="field">
                <span>المهارات</span>
                <input value={draft.skillsText} onChange={(event) => setField('skillsText', event.target.value)} placeholder="Creative Direction، 3D، AR/VR" />
              </label>

              <div className="visibility-field">
                <span>خصوصية الإنجاز</span>
                <div>
                  {([
                    ['private', 'خاص', 'يبقى لك فقط'],
                    ['shareable', 'قابل للمشاركة', 'يمكن استخدام تفاصيله'],
                    ['anonymized', 'مجهّل', 'نخفي أسماء الجهات'],
                  ] as [Visibility, string, string][]).map(([value, label, hint]) => (
                    <button key={value} className={draft.visibility === value ? 'active' : ''} onClick={() => setField('visibility', value)}>
                      <i>{draft.visibility === value && <Check size={12} />}</i>
                      <span><strong>{label}</strong><small>{hint}</small></span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="form-step review-step">
              <span className="step-kicker">03 — راجع القوة</span>
              <h1>الإنجاز صار له وزن.</h1>
              <p className="step-intro">هذه قراءة صريحة لجاهزيته. النقص مو مشكلة؛ المهم نعرفه بدل ما نغطيه بكلام منمّق.</p>

              <div className="review-summary">
                <ScoreRing score={score} size="large" />
                <div>
                  <span>درجة الجاهزية</span>
                  <h2>{score >= 75 ? 'جاهز للاستخدام' : score >= 50 ? 'قوي، ويحتاج تدعيمًا' : 'البداية موجودة'}</h2>
                  <p>{score >= 75 ? 'تقدر تستخدمه الآن، ومع كل دليل إضافي يصير أقوى.' : 'أكمل النقاط المقترحة حتى لا يضيع أثر الشغل داخل وصف عام.'}</p>
                </div>
              </div>

              <div className="output-preview">
                <span><Sparkles size={15} /> معاينة سطر السيرة</span>
                <p>{preview.ar}</p>
                {!draft.result && <small>لم نضف نتيجة لأنك لم توثقها بعد.</small>}
              </div>

              <div className="missing-list">
                <div className="section-heading compact-heading">
                  <div><span className="eyebrow">فجوات التوثيق</span><h2>{prompts.length ? `${prompts.length} فرص لتقوية الإنجاز` : 'مكتمل وواضح'}</h2></div>
                </div>
                {prompts.length ? prompts.map((prompt) => (
                  <button key={`${prompt.field}-${prompt.title}`} onClick={() => setStep(prompt.field === 'context' ? 1 : 2)}>
                    <span><strong>{prompt.title}</strong><small>{prompt.hint}</small></span>
                    <ChevronLeft size={17} />
                  </button>
                )) : (
                  <div className="complete-message"><Check size={17} /> لا توجد فجوات أساسية.</div>
                )}
              </div>

              <div className="privacy-confirm"><LockKeyhole size={17} /><span><strong>بياناتك باقية على جهازك</strong><small>لا يوجد API أو سيرفر يقرأ محتوى الإنجاز.</small></span></div>
            </div>
          )}

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
          <span className="eyebrow">قراءة لحظية</span>
          <h3>{draft.title || 'إنجازك القادم'}</h3>
          <div className="criteria-list">
            <span className="done"><i><Check size={10} /></i> ملكية الدور واضحة <b>20</b></span>
            <span className={draft.context.trim().length >= 20 ? 'done' : ''}><i>{draft.context.trim().length >= 20 && <Check size={10} />}</i> سياق واضح <b>10</b></span>
            <span className={splitList(draft.actionsText).length >= 2 ? 'done' : ''}><i>{splitList(draft.actionsText).length >= 2 && <Check size={10} />}</i> مساهمة محددة <b>20</b></span>
            <span className={draft.result.trim().length >= 20 ? 'done' : ''}><i>{draft.result.trim().length >= 20 && <Check size={10} />}</i> نتيجة موثقة <b>25</b></span>
            <span className={splitList(draft.evidenceText).length > 0 ? 'done' : ''}><i>{splitList(draft.evidenceText).length > 0 && <Check size={10} />}</i> دليل داعم <b>25</b></span>
          </div>
          <div className="side-tip"><Lightbulb size={18} /><p>أقوى إنجاز مو الأطول؛ هو اللي يوضح <strong>دورك والفرق الذي حدث.</strong></p></div>
        </aside>
      </div>
    </div>
  )
}
