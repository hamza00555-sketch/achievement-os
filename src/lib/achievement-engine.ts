import type {
  Achievement,
  AchievementDraft,
  AchievementStatus,
  GeneratedOutput,
  MissingPrompt,
  OutputType,
  Ownership,
} from '../types'

const metricPattern = /(?:\d+[\d,.]*\s*(?:%|٪|x|×|ساعة|يوم|أسبوع|شهر|ريال|ر\.س|مستخدم|مشروع|قالب|دقيقة))|(?:ضعف|مرتين|ثلاث)/iu

const ownershipLabels: Record<Ownership, { ar: string; en: string }> = {
  led: { ar: 'قدت', en: 'Led' },
  'co-led': { ar: 'شاركت في قيادة', en: 'Co-led' },
  contributed: { ar: 'ساهمت في', en: 'Contributed to' },
  delivered: { ar: 'نفّذت', en: 'Delivered' },
}

export function splitList(value: string): string[] {
  return value
    .split(/\n|،|,/)
    .map((item) => item.trim())
    .filter(Boolean)
}

export function calculateScore(input: Pick<AchievementDraft, 'ownership' | 'context' | 'actionsText' | 'result' | 'evidenceText'>): number {
  let score = 0

  if (input.ownership) score += 20

  if (input.context.trim().length >= 20) score += 10

  const actions = splitList(input.actionsText)
  if (actions.length >= 1) score += 12
  if (actions.length >= 2 || input.actionsText.trim().length >= 80) score += 8

  if (input.result.trim().length >= 20) score += 15
  if (metricPattern.test(input.result)) score += 10

  const evidence = splitList(input.evidenceText)
  if (evidence.length >= 1) score += 15
  if (evidence.length >= 2) score += 10

  return Math.min(score, 100)
}

export function statusFromScore(score: number, hasEvidence: boolean): AchievementStatus {
  if (score >= 75 && hasEvidence) return 'ready'
  if (!hasEvidence) return 'needs-proof'
  return 'draft'
}

export function getMissingPrompts(draft: AchievementDraft): MissingPrompt[] {
  const prompts: MissingPrompt[] = []

  if (draft.context.trim().length < 20) {
    prompts.push({
      field: 'context',
      title: 'وش المشكلة قبل تدخلك؟',
      hint: 'صف الوضع السابق، التعطّل، أو الفرصة التي لاحظتها.',
    })
  }

  if (splitList(draft.actionsText).length < 2) {
    prompts.push({
      field: 'actionsText',
      title: 'وش سويت أنت تحديدًا؟',
      hint: 'أضف قرارين أو إجراءين كان لك دور مباشر فيهما.',
    })
  }

  if (draft.result.trim().length < 20) {
    prompts.push({
      field: 'result',
      title: 'وش تغيّر بعد شغلك؟',
      hint: 'فكّر في الوقت، الجودة، التكلفة، التبنّي أو رضا أصحاب المصلحة.',
    })
  } else if (!metricPattern.test(draft.result)) {
    prompts.push({
      field: 'result',
      title: 'هل تقدر تثبت النتيجة برقم؟',
      hint: 'عدد المشاريع، نسبة التحسن، وقت تم توفيره، أو حجم الاستخدام.',
    })
  }

  if (splitList(draft.evidenceText).length === 0) {
    prompts.push({
      field: 'evidenceText',
      title: 'وين الدليل؟',
      hint: 'رابط، ملف، رسالة شكر، نتيجة قياس، أو اسم شخص يستطيع تأكيد الإنجاز.',
    })
  }

  return prompts
}

export function createAchievement(draft: AchievementDraft, id: string = crypto.randomUUID()): Achievement {
  const now = new Date().toISOString()
  const score = calculateScore(draft)
  const evidence = splitList(draft.evidenceText).map((value, index) => ({
    id: `${id}-evidence-${index}`,
    label: value,
    type: metricPattern.test(value) ? ('metric' as const) : ('feedback' as const),
    value,
  }))

  return {
    id,
    title: draft.title.trim(),
    project: draft.project.trim(),
    company: draft.company.trim(),
    date: draft.date,
    ownership: draft.ownership,
    context: draft.context.trim(),
    actions: splitList(draft.actionsText),
    result: draft.result.trim(),
    evidence,
    skills: splitList(draft.skillsText),
    visibility: draft.visibility,
    status: statusFromScore(score, evidence.length > 0),
    score,
    createdAt: now,
    updatedAt: now,
  }
}

function joinArabic(items: string[]): string {
  if (items.length === 0) return 'تطوير وتنفيذ العمل المطلوب'
  if (items.length === 1) return items[0]
  return `${items.slice(0, -1).join('، ')}، و${items.at(-1)}`
}

function joinEnglish(items: string[]): string {
  if (items.length === 0) return 'developing and delivering the required work'
  if (items.length === 1) return items[0]
  return `${items.slice(0, -1).join(', ')}, and ${items.at(-1)}`
}

function cleanEnd(value: string): string {
  return value.trim().replace(/[.!،؛]+$/u, '')
}

export function generateOutput(achievement: Achievement, type: OutputType): GeneratedOutput {
  const owner = ownershipLabels[achievement.ownership]
  const project = achievement.project || achievement.title
  const actionsAr = joinArabic(achievement.actions.map(cleanEnd))
  const actionsEn = joinEnglish(achievement.actions.map(cleanEnd))
  const resultAr = achievement.result ? `، مما أدى إلى ${cleanEnd(achievement.result)}` : ''
  const resultEn = achievement.result ? `, resulting in ${cleanEnd(achievement.result)}` : ''

  const outputs: Record<OutputType, GeneratedOutput> = {
    cv: {
      label: 'سطر للسيرة الذاتية',
      ar: `${owner.ar} ${achievement.title} ضمن ${project} عبر ${actionsAr}${resultAr}.`,
      en: `${owner.en} ${achievement.title} for ${project} by ${actionsEn}${resultEn}.`,
    },
    executive: {
      label: 'صياغة تنفيذية',
      ar: `${owner.ar} مبادرة ${achievement.title}، وحوّلت ${cleanEnd(achievement.context || 'احتياجًا قائمًا')} إلى مسار تنفيذي واضح من خلال ${actionsAr}${resultAr}.`,
      en: `${owner.en} the ${achievement.title} initiative, translating ${cleanEnd(achievement.context || 'an existing need')} into a clear delivery path through ${actionsEn}${resultEn}.`,
    },
    promotion: {
      label: 'ملف ترقية',
      ar: `في مشروع ${project}، كان دوري ${ownershipLabels[achievement.ownership].ar} ${achievement.title}. عالجت ${cleanEnd(achievement.context || 'التحدي القائم')} من خلال ${actionsAr}. النتيجة: ${cleanEnd(achievement.result || 'الإنجاز ما زال يحتاج توثيق النتيجة')}.`,
      en: `In ${project}, I ${owner.en.toLowerCase()} ${achievement.title}. I addressed ${cleanEnd(achievement.context || 'the existing challenge')} through ${actionsEn}. Outcome: ${cleanEnd(achievement.result || 'the result still needs to be documented')}.`,
    },
    portfolio: {
      label: 'مقدمة للبورتفوليو',
      ar: `${achievement.title} مشروع بدأ من تحدٍ واضح: ${cleanEnd(achievement.context || 'تطوير تجربة أكثر فاعلية')}. تولّيت ${actionsAr}${resultAr}.`,
      en: `${achievement.title} began with a clear challenge: ${cleanEnd(achievement.context || 'creating a more effective experience')}. My contribution covered ${actionsEn}${resultEn}.`,
    },
    interview: {
      label: 'قصة مقابلة STAR',
      ar: `الموقف: ${cleanEnd(achievement.context || 'كان هناك تحدٍ يحتاج إلى حل')}.\nالمهمة: ${owner.ar} ${achievement.title}.\nالإجراء: ${actionsAr}.\nالنتيجة: ${cleanEnd(achievement.result || 'تحتاج النتيجة إلى قياس وتوثيق')}.`,
      en: `Situation: ${cleanEnd(achievement.context || 'There was a challenge that needed to be solved')}.\nTask: ${owner.en} ${achievement.title}.\nAction: ${actionsEn}.\nResult: ${cleanEnd(achievement.result || 'The result still needs measurement and evidence')}.`,
    },
  }

  return outputs[type]
}

export function formatMonth(date: string): string {
  if (!date) return 'بدون تاريخ'
  return new Intl.DateTimeFormat('ar-SA', { month: 'short', year: 'numeric' }).format(new Date(`${date}-01T12:00:00`))
}
