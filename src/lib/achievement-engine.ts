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

const ownershipLabels: Record<Ownership, { arVerb: string; arRole: string; enVerb: string; enRole: string }> = {
  led: { arVerb: 'قدت', arRole: 'قيادة العمل', enVerb: 'Led', enRole: 'leading the work' },
  'co-led': { arVerb: 'شاركت في قيادة', arRole: 'المشاركة في قيادة العمل', enVerb: 'Co-led', enRole: 'co-leading the work' },
  contributed: { arVerb: 'ساهمت في', arRole: 'تقديم مساهمة مؤثرة', enVerb: 'Contributed to', enRole: 'making a significant contribution' },
  delivered: { arVerb: 'نفّذت', arRole: 'تنفيذ العمل', enVerb: 'Delivered', enRole: 'delivering the work' },
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
      title: 'ما المشكلة التي عالجها هذا الإنجاز؟',
      hint: 'وضّح الوضع السابق، أو العائق، أو الفرصة التي لاحظتها.',
    })
  }

  if (splitList(draft.actionsText).length < 2) {
    prompts.push({
      field: 'actionsText',
      title: 'ما الذي نفّذته أنت تحديدًا؟',
      hint: 'أضف قرارين أو إجراءين كنت مسؤولًا عنهما مباشرة.',
    })
  }

  if (draft.result.trim().length < 20) {
    prompts.push({
      field: 'result',
      title: 'ما النتيجة التي تحققت؟',
      hint: 'فكّر في الوقت، أو الجودة، أو التكلفة، أو الاستخدام، أو رضا أصحاب العلاقة.',
    })
  } else if (!metricPattern.test(draft.result)) {
    prompts.push({
      field: 'result',
      title: 'هل يمكنك دعم النتيجة برقم؟',
      hint: 'أضف عددًا، أو نسبة، أو مدة، أو قيمة مالية إن كانت متاحة.',
    })
  }

  if (splitList(draft.evidenceText).length === 0) {
    prompts.push({
      field: 'evidenceText',
      title: 'أضف دليلًا على الإنجاز',
      hint: 'رابط، أو ملف، أو رسالة إشادة، أو نتيجة قياس، أو اسم شخص يمكنه تأكيد الإنجاز.',
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
  const projectScopeAr = achievement.project && achievement.project !== achievement.title ? ` ضمن مشروع «${project}»` : ''
  const projectScopeEn = achievement.project && achievement.project !== achievement.title ? ` for ${project}` : ''
  const contextAr = cleanEnd(achievement.context || 'تحدٍ قائم يحتاج إلى معالجة')
  const contextEn = cleanEnd(achievement.context || 'an existing challenge that needed to be addressed')
  const resultAr = achievement.result ? cleanEnd(achievement.result) : ''
  const resultEn = achievement.result ? cleanEnd(achievement.result) : ''

  const outputs: Record<OutputType, GeneratedOutput> = {
    cv: {
      label: 'سطر للسيرة الذاتية',
      ar: `${owner.arVerb} «${achievement.title}»${projectScopeAr}؛ ${actionsAr}${resultAr ? `؛ وكانت النتيجة: ${resultAr}` : ''}.`,
      en: `${owner.enVerb} ${achievement.title}${projectScopeEn} by ${actionsEn}.${resultEn ? ` Outcome: ${resultEn}.` : ''}`,
    },
    executive: {
      label: 'صياغة تنفيذية',
      ar: `${owner.arVerb} مبادرة «${achievement.title}»${projectScopeAr} لمعالجة ${contextAr}. وعلى مستوى التنفيذ: ${actionsAr}.${resultAr ? ` وكانت النتيجة: ${resultAr}.` : ''}`,
      en: `${owner.enVerb} the ${achievement.title} initiative${projectScopeEn} to address ${contextEn}. My work included ${actionsEn}.${resultEn ? ` Outcome: ${resultEn}.` : ''}`,
    },
    promotion: {
      label: 'ملف ترقية',
      ar: `الإنجاز: ${achievement.title}${projectScopeAr}.\nدوري: ${owner.arRole}.\nما نفّذته: ${actionsAr}.\nالأثر: ${resultAr || 'لم تُوثّق النتيجة بعد'}.`,
      en: `Achievement: ${achievement.title}${projectScopeEn}.\nMy role: ${owner.enRole}.\nWhat I did: ${actionsEn}.\nImpact: ${resultEn || 'The result has not been documented yet'}.`,
    },
    portfolio: {
      label: 'مقدمة للبورتفوليو',
      ar: `بدأ مشروع «${achievement.title}»${projectScopeAr} لمواجهة ${contextAr}. كان دوري ${owner.arRole}. وعلى مستوى التنفيذ: ${actionsAr}.${resultAr ? ` وكانت النتيجة: ${resultAr}.` : ' ولا تزال النتيجة بحاجة إلى توثيق.'}`,
      en: `${achievement.title} began as a response to ${contextEn}. My role involved ${owner.enRole}, including ${actionsEn}.${resultEn ? ` The project resulted in ${resultEn}.` : ' The outcome still needs to be documented.'}`,
    },
    interview: {
      label: 'قصة مقابلة STAR',
      ar: `الموقف: ${contextAr}.\nالمهمة: كانت مهمتي ${owner.arRole} في «${achievement.title}».\nالإجراء: ${actionsAr}.\nالنتيجة: ${resultAr || 'لا تزال النتيجة بحاجة إلى قياس وتوثيق'}.`,
      en: `Situation: ${contextEn}.\nTask: My responsibility was ${owner.enRole} on ${achievement.title}.\nAction: ${actionsEn}.\nResult: ${resultEn || 'The result still needs measurement and evidence'}.`,
    },
  }

  return outputs[type]
}

export function formatMonth(date: string): string {
  if (!date) return 'التاريخ غير محدد'
  return new Intl.DateTimeFormat('ar-SA', { month: 'short', year: 'numeric' }).format(new Date(`${date}-01T12:00:00`))
}
