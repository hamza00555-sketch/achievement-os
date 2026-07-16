export type AppView = 'dashboard' | 'capture' | 'library' | 'studio' | 'career'

export type Ownership = 'led' | 'co-led' | 'contributed' | 'delivered'

export type AchievementStatus = 'draft' | 'needs-proof' | 'ready'

export type Visibility = 'private' | 'shareable' | 'anonymized'

export interface Evidence {
  id: string
  label: string
  type: 'link' | 'file' | 'feedback' | 'metric'
  value: string
}

export interface Achievement {
  id: string
  title: string
  project: string
  company: string
  date: string
  ownership: Ownership
  context: string
  actions: string[]
  result: string
  evidence: Evidence[]
  skills: string[]
  visibility: Visibility
  status: AchievementStatus
  score: number
  createdAt: string
  updatedAt: string
  isDemo?: boolean
}

export interface AchievementDraft {
  title: string
  project: string
  company: string
  date: string
  ownership: Ownership
  context: string
  actionsText: string
  result: string
  evidenceText: string
  skillsText: string
  visibility: Visibility
}

export type OutputType = 'cv' | 'executive' | 'promotion' | 'portfolio' | 'interview'

export interface GeneratedOutput {
  label: string
  ar: string
  en: string
}

export interface MissingPrompt {
  field: keyof AchievementDraft
  title: string
  hint: string
}
