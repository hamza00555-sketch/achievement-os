import { useEffect, useMemo, useState } from 'react'
import { Check, Copy, FileText, Languages, Plus, Sparkles } from 'lucide-react'
import { generateOutput } from '../lib/achievement-engine'
import type { Achievement, AppView, OutputType } from '../types'
import { EmptyState } from '../components/EmptyState'

interface StudioViewProps {
  achievements: Achievement[]
  onNavigate: (view: AppView) => void
}

const outputTypes: { id: OutputType; label: string; hint: string }[] = [
  { id: 'cv', label: 'CV', hint: 'سطر مختصر' },
  { id: 'executive', label: 'تنفيذي', hint: 'قيادة وأثر' },
  { id: 'promotion', label: 'ترقية', hint: 'دور ونتيجة' },
  { id: 'portfolio', label: 'بورتفوليو', hint: 'مقدمة مشروع' },
  { id: 'interview', label: 'مقابلة', hint: 'قصة STAR' },
]

export function StudioView({ achievements, onNavigate }: StudioViewProps) {
  const [selectedId, setSelectedId] = useState(achievements[0]?.id ?? '')
  const [outputType, setOutputType] = useState<OutputType>('cv')
  const [language, setLanguage] = useState<'ar' | 'en'>('ar')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!achievements.some((item) => item.id === selectedId)) setSelectedId(achievements[0]?.id ?? '')
  }, [achievements, selectedId])

  const selected = achievements.find((achievement) => achievement.id === selectedId)
  const output = useMemo(() => selected ? generateOutput(selected, outputType) : null, [selected, outputType])

  const copy = async () => {
    if (!output) return
    await navigator.clipboard.writeText(output[language])
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1600)
  }

  if (!achievements.length) {
    return <div className="page studio-page"><EmptyState title="الاستديو ينتظر أول إنجاز" body="سجّل إنجازًا، وبعدها نحوله إلى خمس صيغ مهنية مختلفة." onAction={() => onNavigate('capture')} /></div>
  }

  return (
    <div className="page studio-page">
      <header className="page-header">
        <div>
          <span className="eyebrow">Output Studio</span>
          <h1>اكتبها مرة. استخدمها كل مرة.</h1>
          <p>اختر إنجازًا والهدف؛ المحرك يعيد صياغة الحقائق بدون اختراعها.</p>
        </div>
        <button className="button secondary" onClick={() => onNavigate('capture')}><Plus size={17} /> أضف إنجازًا</button>
      </header>

      <div className="studio-layout">
        <aside className="studio-source">
          <span className="panel-title"><FileText size={16} /> مصدر المحتوى</span>
          <div className="source-list">
            {achievements.map((achievement) => (
              <button key={achievement.id} className={selectedId === achievement.id ? 'active' : ''} onClick={() => setSelectedId(achievement.id)}>
                <i>{selectedId === achievement.id && <Check size={11} />}</i>
                <span><strong>{achievement.title}</strong><small>{achievement.project || achievement.company}</small></span>
                <b>{achievement.score}</b>
              </button>
            ))}
          </div>
        </aside>

        <section className="studio-workspace">
          <div className="output-type-grid">
            {outputTypes.map((type) => (
              <button key={type.id} className={outputType === type.id ? 'active' : ''} onClick={() => setOutputType(type.id)}>
                <strong>{type.label}</strong><small>{type.hint}</small>
              </button>
            ))}
          </div>

          <article className="generated-card">
            <header>
              <div>
                <span className="generated-icon"><Sparkles size={16} /></span>
                <div><span>صياغة مولّدة</span><strong>{output?.label}</strong></div>
              </div>
              <div className="language-switch">
                <Languages size={15} />
                <button className={language === 'ar' ? 'active' : ''} onClick={() => setLanguage('ar')}>عربي</button>
                <button className={language === 'en' ? 'active' : ''} onClick={() => setLanguage('en')}>EN</button>
              </div>
            </header>
            <div className={`generated-text ${language === 'en' ? 'ltr' : ''}`}>{output?.[language]}</div>
            <footer>
              <span>{output?.[language].length ?? 0} حرفًا</span>
              <button className={copied ? 'copied' : ''} onClick={copy}>{copied ? <Check size={16} /> : <Copy size={16} />}{copied ? 'تم النسخ' : 'نسخ النص'}</button>
            </footer>
          </article>

          {selected && selected.score < 75 && (
            <div className="quality-warning">
              <i>{selected.score}</i>
              <div><strong>الصياغة صحيحة، لكن المصدر يحتاج تقوية.</strong><p>إضافة نتيجة قابلة للقياس أو دليل سترفع مصداقية النص أكثر من أي فعل لغوي فاخر.</p></div>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
