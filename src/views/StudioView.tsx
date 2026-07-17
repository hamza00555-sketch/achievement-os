import { useEffect, useMemo, useState } from 'react'
import { Check, Copy, FileText, Languages, Plus, Sparkles } from 'lucide-react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
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
  const reducedMotion = useReducedMotion()
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
          <span className="eyebrow studio-eyebrow">
            <motion.i
              animate={reducedMotion ? undefined : { scale: [0.75, 1.25, 0.75], opacity: [0.45, 1, 0.45] }}
              transition={{ duration: 2.1, repeat: Infinity, ease: 'easeInOut' }}
            />
            مركز الصياغات
          </span>
          <h1>حوّل الإنجاز إلى نص جاهز.</h1>
          <p>اختر الإنجاز ونوع النص. لن يضيف المحرك أرقامًا أو نتائج لم توثّقها.</p>
        </div>
        <motion.button className="button secondary" onClick={() => onNavigate('capture')} whileTap={{ scale: 0.97 }}>
          <motion.span
            className="button-motion-icon"
            animate={reducedMotion ? undefined : { rotate: [0, 90, 90, 180], scale: [1, 1.15, 1, 1] }}
            transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut' }}
          ><Plus size={17} /></motion.span>
          أضف إنجازًا
        </motion.button>
      </motion.header>

      <div className="studio-layout">
        <motion.aside
          className="studio-source"
          initial={{ opacity: 0, x: 18 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.48, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="panel-title">
            <motion.span
              className="panel-title-icon"
              animate={reducedMotion ? undefined : { y: [0, -2, 0], rotate: [0, -4, 0] }}
              transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
            ><FileText size={16} /></motion.span>
            الإنجاز الأساسي
          </span>
          <div className="source-list">
            {achievements.map((achievement) => (
              <motion.button
                key={achievement.id}
                className={selectedId === achievement.id ? 'active' : ''}
                onClick={() => setSelectedId(achievement.id)}
                animate={reducedMotion
                  ? undefined
                  : selectedId === achievement.id
                    ? { x: [-2, -5, -2], scale: [1, 1.012, 1] }
                    : { x: 0, scale: 1 }}
                whileTap={{ scale: 0.975 }}
                transition={selectedId === achievement.id
                  ? { duration: 3.4, repeat: Infinity, ease: 'easeInOut' }
                  : { type: 'spring', stiffness: 420, damping: 28 }}
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
                {outputType === type.id && (
                  <motion.i
                    className="output-active-surface"
                    layoutId="output-type-active"
                    animate={reducedMotion ? undefined : { scale: [1, 1.025, 1], opacity: [0.86, 1, 0.86] }}
                    transition={{
                      layout: { type: 'spring', stiffness: 430, damping: 32 },
                      duration: 2.7,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  />
                )}
                {outputType === type.id && (
                  <motion.i
                    className="output-active-glint"
                    aria-hidden="true"
                    animate={reducedMotion ? undefined : { x: ['-180%', '320%'] }}
                    transition={{ duration: 2.8, repeat: Infinity, ease: 'linear' }}
                  />
                )}
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
              className="generated-aurora"
              aria-hidden="true"
              animate={reducedMotion ? undefined : { x: ['-24%', '48%', '-24%'], y: ['-12%', '22%', '-12%'], scale: [1, 1.22, 1] }}
              transition={{ duration: 10.5, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.span
              className="generated-sheen"
              aria-hidden="true"
              animate={reducedMotion ? undefined : { left: ['-22%', '118%'] }}
              transition={{ duration: 4.4, repeat: Infinity, ease: 'linear' }}
            />
            <header>
              <div>
                <motion.span
                  key={`${selectedId}-${outputType}`}
                  className="generated-icon"
                  initial={{ scale: 0.55, rotate: -18 }}
                  animate={reducedMotion ? { scale: 1, rotate: 0 } : { scale: [1, 1.1, 1], rotate: [0, 7, -4, 0], y: [0, -3, 0] }}
                  transition={reducedMotion
                    ? { type: 'spring', stiffness: 390, damping: 19 }
                    : { duration: 3.4, repeat: Infinity, ease: 'easeInOut' }}
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
              <motion.button
                className={copied ? 'copied' : ''}
                onClick={copy}
                whileTap={{ scale: 0.94 }}
                animate={!copied && !reducedMotion ? { y: [0, -2, 0], boxShadow: ['0 0 0 rgba(203,250,100,0)', '0 7px 18px rgba(203,250,100,.12)', '0 0 0 rgba(203,250,100,0)'] } : undefined}
                transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
              >{copied ? <Check size={16} /> : <Copy size={16} />}{copied ? 'تم النسخ' : 'نسخ النص'}</motion.button>
            </footer>
          </motion.article>

          {selected && selected.score < 75 && (
            <motion.div className="quality-warning" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <motion.i
                animate={reducedMotion ? undefined : { scale: [1, 1.08, 1], rotate: [0, -3, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              >{selected.score}</motion.i>
              <div><strong>النص صحيح، لكن الإنجاز يحتاج إلى توثيق أقوى.</strong><p>أضف نتيجة قابلة للقياس أو دليلًا يدعمها؛ فالمعلومة الموثّقة أهم من الصياغة المنمّقة.</p></div>
            </motion.div>
          )}
        </motion.section>
      </div>
    </div>
  )
}
