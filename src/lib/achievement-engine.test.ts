import { describe, expect, it } from 'vitest'
import { calculateScore, createAchievement, generateOutput } from './achievement-engine'
import type { AchievementDraft } from '../types'

const strongDraft: AchievementDraft = {
  title: 'مكتبة الحركة',
  project: 'نظام الهوية',
  company: 'جهة تجريبية',
  date: '2026-07',
  ownership: 'led',
  context: 'كانت الفرق تنتج المواد من الصفر بدون نظام موحد أو مرجع مشترك.',
  actionsText: 'صممت بنية المكتبة، بنيت القوالب الأساسية، وقدمت ورشة للفريق',
  result: 'اختصر وقت تجهيز المواد بنسبة 30% واعتمدته 4 فرق داخلية',
  evidenceText: 'عرض الاعتماد، رسالة شكر من مدير المشروع',
  skillsText: 'Motion Design، Creative Direction، Systems Design',
  visibility: 'private',
}

describe('achievement engine', () => {
  it('rewards complete, measurable and evidenced achievements', () => {
    expect(calculateScore(strongDraft)).toBe(100)
  })

  it('does not invent a result when one is missing', () => {
    const achievement = createAchievement({ ...strongDraft, result: '' }, 'test-id')
    const output = generateOutput(achievement, 'cv')
    expect(output.ar).not.toContain('مما أدى')
    expect(output.en).not.toContain('resulting in')
  })

  it('marks a strong evidenced achievement as ready', () => {
    expect(createAchievement(strongDraft, 'test-id').status).toBe('ready')
  })

  it('keeps Arabic output grammatical when the result is a complete sentence', () => {
    const achievement = createAchievement({
      ...strongDraft,
      result: 'أصبحت التجربة متاحة مباشرة من الجوال',
    }, 'grammar-test')

    const cv = generateOutput(achievement, 'cv').ar
    const portfolio = generateOutput(achievement, 'portfolio').ar

    expect(cv).toContain('وكانت النتيجة: أصبحت التجربة')
    expect(cv).not.toContain('عن أصبحت')
    expect(portfolio).not.toContain('إلى أصبحت')
  })
})
