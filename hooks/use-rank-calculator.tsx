"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"

// Rank order and requirements
export const RANK_ORDER = [
  'Coach',
  'Senior Coach',
  'Executive Director',
  'FIBC',
  'Global Director',
  'Presidential Director',
  'IPD'
] as const

export type RankType = typeof RANK_ORDER[number]

export const RANK_REQUIREMENTS: Record<RankType, {
  minFQV: number
  minQP: number
  frontlineCoaches: number
  minClients: number
  description: string
  icon: string
}> = {
  'Coach': {
    minFQV: 0,
    minQP: 0,
    frontlineCoaches: 0,
    minClients: 0,
    description: 'Starting rank - welcome to the team!',
    icon: '🌱'
  },
  'Senior Coach': {
    minFQV: 1000,
    minQP: 100,
    frontlineCoaches: 0,
    minClients: 3,
    description: 'Build your client base and hit 1,000 FQV',
    icon: '⭐'
  },
  'Executive Director': {
    minFQV: 5000,
    minQP: 500,
    frontlineCoaches: 3,
    minClients: 5,
    description: 'Sponsor 3 frontline coaches and hit 5,000 FQV',
    icon: '💫'
  },
  'FIBC': {
    minFQV: 10000,
    minQP: 1000,
    frontlineCoaches: 5,
    minClients: 8,
    description: 'Front Income Business Coach - leadership begins here',
    icon: '🏆'
  },
  'Global Director': {
    minFQV: 25000,
    minQP: 2500,
    frontlineCoaches: 6,
    minClients: 10,
    description: 'Build a strong team with 25,000 FQV',
    icon: '🌍'
  },
  'Presidential Director': {
    minFQV: 50000,
    minQP: 5000,
    frontlineCoaches: 8,
    minClients: 15,
    description: 'Lead a large organization with 50,000 FQV',
    icon: '👑'
  },
  'IPD': {
    minFQV: 100000,
    minQP: 10000,
    frontlineCoaches: 10,
    minClients: 20,
    description: 'Integrated Presidential Director - top tier',
    icon: '💎'
  }
}

export const RANK_COLORS: Record<RankType, { bg: string; text: string; accent: string }> = {
  'Coach': { bg: 'bg-gray-100', text: 'text-gray-600', accent: 'bg-gray-500' },
  'Senior Coach': { bg: 'bg-blue-50', text: 'text-blue-600', accent: 'bg-blue-500' },
  'Executive Director': { bg: 'bg-purple-50', text: 'text-purple-600', accent: 'bg-purple-500' },
  'FIBC': { bg: 'bg-green-50', text: 'text-green-600', accent: 'bg-green-600' },
  'Global Director': { bg: 'bg-yellow-50', text: 'text-yellow-700', accent: 'bg-yellow-500' },
  'Presidential Director': { bg: 'bg-orange-50', text: 'text-orange-600', accent: 'bg-orange-500' },
  'IPD': { bg: 'bg-red-50', text: 'text-red-600', accent: 'bg-red-600' }
}

// Conversion rate assumptions
export const CONVERSION_RATES = {
  cold_to_ha: 0.15,
  warm_to_ha: 0.40,
  scheduled_to_ha: 0.80,
  ha_to_client: 0.50,
  client_to_coach: 0.30,
  avg_client_fqv: 300
}

export interface RankData {
  coach_id: string
  current_rank: RankType
  rank_achieved_date: string | null
  current_fqv: number
  current_pqv: number
  qualifying_points: number
  frontline_coaches: number
  total_team_size: number
  target_rank: RankType | null
  target_date: string | null
}

export interface ProspectPipeline {
  cold: number
  warm: number
  ha_scheduled: number
  ha_done: number
}

export interface ClientStats {
  active: number
  paused: number
  completed: number
  coachProspects: number
}

export interface Projections {
  totalProspects: number
  projectedHAs: number
  newClients: number
  newCoaches: number
  newFQV: number
  totalFQV: number
  totalCoaches: number
  totalClients: number
}

export interface Gaps {
  fqv: number
  coaches: number
  clients: number
  qp: number
}

export function useRankCalculator(user: User | null) {
  const [rankData, setRankData] = useState<RankData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  // Load rank data
  const loadRankData = useCallback(async () => {
    if (!user) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Try to get existing rank data
      const { data, error: fetchError } = await supabase
        .from("coach_rank_data")
        .select("*")
        .eq("coach_id", user.id)
        .single()

      if (fetchError && fetchError.code !== "PGRST116") {
        throw fetchError
      }

      if (data) {
        setRankData(data as RankData)
      } else {
        // Create default rank data
        const defaultData: Partial<RankData> = {
          coach_id: user.id,
          current_rank: "Coach",
          current_fqv: 0,
          current_pqv: 0,
          qualifying_points: 0,
          frontline_coaches: 0,
          total_team_size: 0
        }

        const { data: newData, error: insertError } = await supabase
          .from("coach_rank_data")
          .insert([defaultData])
          .select()
          .single()

        if (insertError) {
          // If insert fails, just use default values in memory
          setRankData(defaultData as RankData)
        } else {
          setRankData(newData as RankData)
        }
      }
    } catch (err: any) {
      console.error("Error loading rank data:", err)
      setError(err.message)
      // Set default values on error
      setRankData({
        coach_id: user.id,
        current_rank: "Coach",
        rank_achieved_date: null,
        current_fqv: 0,
        current_pqv: 0,
        qualifying_points: 0,
        frontline_coaches: 0,
        total_team_size: 0,
        target_rank: null,
        target_date: null
      })
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    loadRankData()
  }, [loadRankData])

  // Update rank data
  const updateRankData = useCallback(async (updates: Partial<RankData>) => {
    if (!user || !rankData) return

    // Optimistic update
    setRankData(prev => prev ? { ...prev, ...updates } : prev)

    try {
      const { error } = await supabase
        .from("coach_rank_data")
        .upsert({
          coach_id: user.id,
          ...rankData,
          ...updates
        })

      if (error) throw error
    } catch (err: any) {
      console.error("Error updating rank data:", err)
      // Revert on error
      loadRankData()
    }
  }, [user, rankData, loadRankData])

  // Calculate projections from pipeline
  const calculateProjections = useCallback((
    prospects: ProspectPipeline,
    clients: ClientStats,
    stats: { fqv: number; frontlineCoaches: number }
  ): Projections => {
    const totalProspects = prospects.cold + prospects.warm + prospects.ha_scheduled + prospects.ha_done

    const projectedHAs =
      (prospects.cold * CONVERSION_RATES.cold_to_ha) +
      (prospects.warm * CONVERSION_RATES.warm_to_ha) +
      (prospects.ha_scheduled * CONVERSION_RATES.scheduled_to_ha)

    const projectedNewClients =
      (prospects.ha_done * CONVERSION_RATES.ha_to_client) +
      (projectedHAs * CONVERSION_RATES.ha_to_client)

    const projectedNewCoaches = clients.coachProspects * CONVERSION_RATES.client_to_coach
    const projectedNewFQV = projectedNewClients * CONVERSION_RATES.avg_client_fqv

    return {
      totalProspects,
      projectedHAs: Math.round(projectedHAs),
      newClients: Math.round(projectedNewClients),
      newCoaches: Math.round(projectedNewCoaches),
      newFQV: Math.round(projectedNewFQV),
      totalFQV: stats.fqv + Math.round(projectedNewFQV),
      totalCoaches: stats.frontlineCoaches + Math.round(projectedNewCoaches),
      totalClients: clients.active + Math.round(projectedNewClients)
    }
  }, [])

  // Calculate gaps to next rank
  const calculateGaps = useCallback((
    currentRank: RankType,
    stats: { fqv: number; qp: number; frontlineCoaches: number },
    activeClients: number
  ): Gaps | null => {
    const currentRankIndex = RANK_ORDER.indexOf(currentRank)
    const nextRank = currentRankIndex < RANK_ORDER.length - 1
      ? RANK_ORDER[currentRankIndex + 1]
      : null

    if (!nextRank) return null

    const nextRankReqs = RANK_REQUIREMENTS[nextRank]

    return {
      fqv: Math.max(0, nextRankReqs.minFQV - stats.fqv),
      coaches: Math.max(0, nextRankReqs.frontlineCoaches - stats.frontlineCoaches),
      clients: Math.max(0, nextRankReqs.minClients - activeClients),
      qp: Math.max(0, nextRankReqs.minQP - stats.qp)
    }
  }, [])

  // Calculate progress to next rank
  const calculateProgress = useCallback((
    currentRank: RankType,
    stats: { fqv: number; frontlineCoaches: number },
    activeClients: number
  ): number => {
    const currentRankIndex = RANK_ORDER.indexOf(currentRank)
    const nextRank = currentRankIndex < RANK_ORDER.length - 1
      ? RANK_ORDER[currentRankIndex + 1]
      : null

    if (!nextRank) return 100

    const nextRankReqs = RANK_REQUIREMENTS[nextRank]
    const metrics: { weight: number; progress: number }[] = []

    if (nextRankReqs.minFQV > 0) {
      metrics.push({
        weight: 0.5,
        progress: Math.min((stats.fqv / nextRankReqs.minFQV) * 100, 100)
      })
    }

    if (nextRankReqs.frontlineCoaches > 0) {
      metrics.push({
        weight: 0.3,
        progress: Math.min((stats.frontlineCoaches / nextRankReqs.frontlineCoaches) * 100, 100)
      })
    } else {
      metrics.push({ weight: 0.3, progress: 100 })
    }

    if (nextRankReqs.minClients > 0) {
      metrics.push({
        weight: 0.2,
        progress: Math.min((activeClients / nextRankReqs.minClients) * 100, 100)
      })
    } else {
      metrics.push({ weight: 0.2, progress: 100 })
    }

    const totalWeight = metrics.reduce((sum, m) => sum + m.weight, 0)
    const weightedProgress = metrics.reduce((sum, m) => sum + (m.progress * m.weight), 0)

    return Math.round(weightedProgress / totalWeight)
  }, [])

  // Generate action items
  const generateActionItems = useCallback((
    gaps: Gaps | null,
    projections: Projections,
    prospects: ProspectPipeline,
    clients: ClientStats,
    nextRank: RankType | null
  ): { priority: "high" | "medium" | "low"; text: string }[] => {
    if (!gaps || !nextRank) return []

    const items: { priority: "high" | "medium" | "low"; text: string }[] = []

    if (gaps.fqv > 0) {
      const clientsNeeded = Math.ceil(gaps.fqv / CONVERSION_RATES.avg_client_fqv)
      if (projections.newFQV < gaps.fqv) {
        items.push({
          priority: "high",
          text: `Add ${clientsNeeded - projections.newClients} more prospects to close ${gaps.fqv.toLocaleString()} FQV gap`
        })
      }
    }

    if (gaps.coaches > 0) {
      if (clients.coachProspects > 0) {
        items.push({
          priority: "high",
          text: `Have business conversations with your ${clients.coachProspects} flagged coach prospects`
        })
      } else {
        items.push({
          priority: "medium",
          text: `Flag ${gaps.coaches} successful clients as potential coaches`
        })
      }
    }

    if (prospects.ha_done > 0) {
      items.push({
        priority: "high",
        text: `Follow up with ${prospects.ha_done} prospects who completed their Health Assessment`
      })
    }

    if (prospects.warm > 0) {
      items.push({
        priority: "medium",
        text: `Schedule HAs with your ${prospects.warm} warm prospects`
      })
    }

    if (prospects.cold > 3) {
      items.push({
        priority: "low",
        text: `Warm up ${prospects.cold} cold prospects with engagement`
      })
    }

    return items
  }, [])

  // Get next rank
  const getNextRank = useCallback((currentRank: RankType): RankType | null => {
    const currentRankIndex = RANK_ORDER.indexOf(currentRank)
    return currentRankIndex < RANK_ORDER.length - 1
      ? RANK_ORDER[currentRankIndex + 1]
      : null
  }, [])

  return {
    rankData,
    loading,
    error,
    updateRankData,
    calculateProjections,
    calculateGaps,
    calculateProgress,
    generateActionItems,
    getNextRank,
    reload: loadRankData,
    RANK_ORDER,
    RANK_REQUIREMENTS,
    RANK_COLORS,
    CONVERSION_RATES
  }
}
