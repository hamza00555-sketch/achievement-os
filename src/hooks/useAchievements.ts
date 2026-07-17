import { useCallback, useEffect, useMemo, useState } from 'react'
import { demoAchievements } from '../data/demo'
import type { Achievement } from '../types'

const STORAGE_KEY = 'athar.achievements.v1'

function loadAchievements(): Achievement[] {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (!stored) return demoAchievements
    const parsed = JSON.parse(stored) as Achievement[]
    if (!Array.isArray(parsed)) return demoAchievements

    const currentDemo = new Map(demoAchievements.map((achievement) => [achievement.id, achievement]))
    return parsed.map((achievement) => (
      achievement.isDemo && currentDemo.has(achievement.id)
        ? currentDemo.get(achievement.id) as Achievement
        : achievement
    ))
  } catch {
    return demoAchievements
  }
}

export function useAchievements() {
  const [achievements, setAchievements] = useState<Achievement[]>(loadAchievements)

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(achievements))
  }, [achievements])

  const addAchievement = useCallback((achievement: Achievement) => {
    setAchievements((current) => [achievement, ...current])
  }, [])

  const updateAchievement = useCallback((achievement: Achievement) => {
    setAchievements((current) => current.map((item) => (
      item.id === achievement.id
        ? { ...achievement, createdAt: item.createdAt, updatedAt: new Date().toISOString(), isDemo: false }
        : item
    )))
  }, [])

  const deleteAchievement = useCallback((id: string) => {
    setAchievements((current) => current.filter((achievement) => achievement.id !== id))
  }, [])

  const clearDemoData = useCallback(() => {
    setAchievements((current) => current.filter((achievement) => !achievement.isDemo))
  }, [])

  const restoreDemoData = useCallback(() => {
    setAchievements(demoAchievements)
  }, [])

  const stats = useMemo(() => {
    const total = achievements.length
    const ready = achievements.filter((achievement) => achievement.status === 'ready').length
    const averageScore = total
      ? Math.round(achievements.reduce((sum, achievement) => sum + achievement.score, 0) / total)
      : 0
    const skillCount = new Set(achievements.flatMap((achievement) => achievement.skills)).size

    return { total, ready, averageScore, skillCount }
  }, [achievements])

  return {
    achievements,
    stats,
    addAchievement,
    updateAchievement,
    deleteAchievement,
    clearDemoData,
    restoreDemoData,
  }
}
