import { useEffect, useMemo, useState } from 'react'
import { Check, Copy, FileText, Languages, Plus, Sparkles } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { generateOutput } from '../lib/achievement-engine'
import type { Achievement, AppView, OutputType } from '../types'
import { EmptyState } from '../components/EmptyState'

interface StudioViewProps {
  achievements: Achievement[]
  onNavigate: (view: AppView) => void
}

const outputTypes: { id: OutputType; label: string; hint: string }[] = [
  { id: 'cv', label: 'السيرة', hint: 'سطر مختصر' },
  { id: 'executive', label: 'تنفيذي', hint: 'قيادة وأثر' },
  { id: 'promotion', label: 'ترقية', hint: 'دور ونتيجة' },
  { id: 'portfolio', label: 'ملف أعمال', hint: 'مقدمة مشروع' },
  { id: 'interview', label: 'مقابلة', hint: 'قصة منظّمة' },
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
    return <div className="page studio-page"><EmptyState title="الصياغات تنتظر أول إنجاز" body="سجّل إنجازًا واحدًا، ثم حوّله إلى نص مناسب للسيرة الذاتية أو ملف الأعمال أو المقابلة." onAction={() => onNavigate('capture')} /></div>
  }

  return (
    <div className="page studio-page">
      <motion.header
        className="page-header"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.48, ease: [0.22, 1, 0.36, 1] }}
      >
        <div>
          <span className="eyebrow">مركز الصياغات</span>
          <h1>حوّل الإنجاز إلى نص جاهز.</h1>
          <p>اختر الإنجاز ونوع النص. لن يضيف المحرك أرقامًا أو نتائج لم توثّقها.</p>
        </div>
        <motion.button className="button secondary" onClick={() => onNavigate('capture')} whileTap={{ scale: 0.97 }}><Plus size={17} /> أضف إنجازًا</motion.button>
      </motion.header>

      <div className="studio-layout">
        <motion.aside
          className="studio-source"
          initial={{ opacity: 0, x: 18 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.48, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="panel-title"><FileText size={16} /> الإنجاز الأساسي</span>
          <div className="source-list">
            {achievements.map((achievement) => (
              <motion.button
                key={achievement.id}
                className={selectedId === achievement.id ? 'active' : ''}
                onClick={() => setSelectedId(achievement.id)}
                animate={selectedId === achievement.id ? { x: -3, scale: 1.01 } : { x: 0, scale: 1 }}
                whileTap={{ scale: 0.975 }}
                transition={{ type: 'spring', stiffness: 420, damping: 28 }}
              >
                <i>{selectedId === achievement.id && <Check size={11} />}</i>
                <span><strong>{achievement.title}</strong><small>{achievement.project || achievement.company}</small></span>
                <b>{achievement.score}</b>
              </motion.button>
            ))}
          </div>
        </motion.aside>

        <motion.section
          className="studio-workspace"
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.52, delay: 0.13, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="output-type-grid">
            {outputTypes.map((type) => (
              <motion.button
                key={type.id}
                className={outputType === type.id ? 'active' : ''}
                onClick={() => setOutputType(type.id)}
                animate={outputType === type.id ? { y: -2 } : { y: 0 }}
                whileTap={{ scale: 0.96 }}
                transition={{ type: 'spring', stiffness: 440, damping: 27 }}
              >
                {outputType === type.id && <motion.i className="output-active-surface" layoutId="output-type-active" transition={{ type: 'spring', stiffness: 430, damping: 32 }} />}
                <strong>{type.label}</strong><small>{type.hint}</small>
              </motion.button>
            ))}
          </div>

          <motion.article
            className="generated-card"
            layout
            initial={{ opacity: 0, y: 28, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.55, delay: 0.2, ease: [0.22, 1, 0.36, 1], layout: { duration: 0.3 } }}
          >
            <motion.span
              className="generated-sheen"
              aria-hidden="true"
              animate={{ x: ['-150%', '280%'] }}
              transition={{ duration: 3.2, repeat: Infinity, repeatDelay: 1.8, ease: 'easeInOut' }}
            />
            <header>
              <div>
                <motion.span
                  key={`${selectedId}-${outputType}`}
                  className="generated-icon"
                  initial={{ scale: 0.55, rotate: -18 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 390, damping: 19 }}
                >
                  <Sparkles size={16} />
                </motion.span>
                <div><span>النص الناتج</span><strong>{output?.label}</strong></div>
              </div>
              <div className="language-switch">
                <Languages size={15} />
                <button className={language === 'ar' ? 'active' : ''} onClick={() => setLanguage('ar')}>عربي</button>
                <button className={language === 'en' ? 'active' : ''} onClick={() => setLanguage('en')}>EN</button>
              </div>
            </header>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={`${selectedId}-${outputType}-${language}`}
                className={`generated-text ${language === 'en' ? 'ltr' : ''}`}
                initial={{ opacity: 0, y: 18, filter: 'blur(9px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -12, filter: 'blur(7px)' }}
                transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
              >
                {output?.[language]}
              </motion.div>
            </AnimatePresence>
            <footer>
              <span>{output?.[language].length ?? 0} حرفًا</span>
              <motion.button className={copied ? 'copied' : ''} onClick={copy} whileTap={{ scale: 0.94 }}>{copied ? <Check size={16} /> : <Copy size={16} />}{copied ? 'تم النسخ' : 'نسخ النص'}</motion.button>
            </footer>
          </motion.article>

          {selected && selected.score < 75 && (
            <motion.div className="quality-warning" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <i>{selected.score}</i>
              <div><strong>النص صحيح، لكن الإنجاز يحتاج إلى توثيق أقوى.</strong><p>أضف نتيجة قابلة للقياس أو دليلًا يدعمها؛ فالمعلومة الموثّقة أهم من الصياغة المنمّقة.</p></div>
            </motion.div>
          )}
        </motion.section>
      </div>
    </div>
  )
}
