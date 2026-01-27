"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"

// Rank order (simplified for the calculator)
export const RANK_ORDER = [
  'Coach',
  'Senior Coach',
  'Executive Director',
  'Global Director',
  'Presidential Director',
  'IPD'
] as const

export type RankType = typeof RANK_ORDER[number]

// Get rank index (higher = more senior)
export function getRankIndex(rank: string): number {
  const index = RANK_ORDER.indexOf(rank as RankType)
  return index >= 0 ? index : 0
}

// Check if a coach qualifies as a "qualifying leg" (Senior Coach or higher)
export function isQualifyingLeg(rank: string): boolean {
  return getRankIndex(rank) >= 1 // Senior Coach or higher
}

// Check if coach is ED or higher
export function isEDOrHigher(rank: string): boolean {
  return getRankIndex(rank) >= 2 // Executive Director or higher
}

// Check if coach is GD or higher
export function isGDOrHigher(rank: string): boolean {
  return getRankIndex(rank) >= 3 // Global Director or higher
}

// Simplified requirements based on:
// - 5 EDs = Global Director (GD)
// - 10 EDs = Presidential Director (PD)
// - 10 EDs + 5 GDs = IPD
export const RANK_REQUIREMENTS: Record<RankType, {
  minClients: number
  frontlineCoaches: number
  edTeams: number      // Number of ED+ frontline coaches needed
  gdTeams: number      // Number of GD+ frontline coaches needed
  description: string
  icon: string
  note: string
}> = {
  'Coach': {
    minClients: 0,
    frontlineCoaches: 0,
    edTeams: 0,
    gdTeams: 0,
    description: 'Starting rank - welcome to the team!',
    icon: '🌱',
    note: ''
  },
  'Senior Coach': {
    minClients: 3,
    frontlineCoaches: 0,
    edTeams: 0,
    gdTeams: 0,
    description: '3+ active clients with qualifying orders',
    icon: '⭐',
    note: 'Verify FQV requirements in OPTAVIA Connect'
  },
  'Executive Director': {
    minClients: 5,
    frontlineCoaches: 3,
    edTeams: 0,
    gdTeams: 0,
    description: '5+ clients and 3+ frontline coaches',
    icon: '💫',
    note: 'Verify FQV requirements in OPTAVIA Connect'
  },
  'Global Director': {
    minClients: 8,
    frontlineCoaches: 5,
    edTeams: 5,
    gdTeams: 0,
    description: '5 ED teams (frontline coaches at ED rank)',
    icon: '🌍',
    note: '5 frontline coaches must be Executive Director or higher'
  },
  'Presidential Director': {
    minClients: 12,
    frontlineCoaches: 10,
    edTeams: 10,
    gdTeams: 0,
    description: '10 ED teams (frontline coaches at ED rank)',
    icon: '👑',
    note: '10 frontline coaches must be Executive Director or higher'
  },
  'IPD': {
    minClients: 15,
    frontlineCoaches: 15,
    edTeams: 10,
    gdTeams: 5,
    description: '10 ED teams + 5 GD teams',
    icon: '💎',
    note: '10 EDs + 5 of those must be Global Director or higher'
  }
}

export const RANK_COLORS: Record<RankType, { bg: string; text: string; accent: string }> = {
  'Coach': { bg: 'bg-gray-100', text: 'text-gray-600', accent: 'bg-gray-500' },
  'Senior Coach': { bg: 'bg-blue-50', text: 'text-blue-600', accent: 'bg-blue-500' },
  'Executive Director': { bg: 'bg-purple-50', text: 'text-purple-600', accent: 'bg-purple-500' },
  'Global Director': { bg: 'bg-yellow-50', text: 'text-yellow-700', accent: 'bg-yellow-500' },
  'Presidential Director': { bg: 'bg-orange-50', text: 'text-orange-600', accent: 'bg-orange-500' },
  'IPD': { bg: 'bg-red-50', text: 'text-red-600', accent: 'bg-red-600' }
}

// Conversion rate assumptions for projections
export const CONVERSION_RATES = {
  cold_to_ha: 0.15,
  warm_to_ha: 0.40,
  scheduled_to_ha: 0.80,
  ha_to_client: 0.50,
  client_to_coach: 0.30,
}

export interface FrontlineCoach {
  id: string
  full_name: string | null
  email: string | null
  coach_rank: string
  is_qualifying: boolean
}

export interface RankData {
  coach_id: string
  current_rank: RankType
  rank_achieved_date: string | null
}

export interface ProspectPipeline {
  new: number
  interested: number
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
  totalCoaches: number
  totalClients: number
}

export interface Gaps {
  coaches: number
  clients: number
  edTeams: number
  gdTeams: number
}

export function useRankCalculator(user: User | null) {
  const [rankData, setRankData] = useState<RankData | null>(null)
  const [frontlineCoaches, setFrontlineCoaches] = useState<FrontlineCoach[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Memoize Supabase client to prevent re-creation on every render
  const supabase = useMemo(() => createClient(), [])

  // Load rank data and frontline coaches
  const loadData = useCallback(async () => {
    if (!user) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Load rank data
      const { data: rankDataResult, error: rankError } = await supabase
        .from("coach_rank_data")
        .select("coach_id, current_rank, rank_achieved_date")
        .eq("coach_id", user.id)
        .single()

      if (rankError && rankError.code !== "PGRST116") {
        console.error("Error loading rank data:", rankError)
      }

      if (rankDataResult) {
        setRankData(rankDataResult as RankData)
      } else {
        // Create default rank data
        const defaultData: RankData = {
          coach_id: user.id,
          current_rank: "Coach",
          rank_achieved_date: null
        }
        setRankData(defaultData)

        // Try to insert default record
        await supabase
          .from("coach_rank_data")
          .insert([{ 
            coach_id: user.id,
            current_rank: "Coach",
            current_fqv: 0,
            current_pqv: 0,
            qualifying_points: 0,
            frontline_coaches: 0,
            total_team_size: 0
          }])
      }

      // Load frontline coaches from sponsor_team view (exclude self)
      const { data: coachesResult, error: coachesError } = await supabase
        .from("sponsor_team")
        .select("coach_id, coach_name, coach_email, coach_rank")
        .eq("sponsor_id", user.id)
        .neq("coach_id", user.id) // Don't include yourself as your own frontline coach

      if (coachesError) {
        console.error("Error loading frontline coaches:", coachesError)
        // Fallback: try querying profiles directly
        const { data: profilesResult } = await supabase
          .from("profiles")
          .select("id, full_name, email, coach_rank")
          .eq("sponsor_id", user.id)
          .neq("id", user.id) // Don't include yourself
        
        if (profilesResult) {
          const coaches: FrontlineCoach[] = profilesResult.map(c => ({
            id: c.id,
            full_name: c.full_name,
            email: c.email,
            coach_rank: c.coach_rank || "Coach",
            is_qualifying: isQualifyingLeg(c.coach_rank || "Coach")
          }))
          setFrontlineCoaches(coaches)
        }
      } else if (coachesResult) {
        const coaches: FrontlineCoach[] = coachesResult.map(c => ({
          id: c.coach_id,
          full_name: c.coach_name,
          email: c.coach_email,
          coach_rank: c.coach_rank || "Coach",
          is_qualifying: isQualifyingLeg(c.coach_rank || "Coach")
        }))
        setFrontlineCoaches(coaches)
      }
    } catch (err: any) {
      console.error("Error loading data:", err)
      setError(err.message)
      setRankData({
        coach_id: user.id,
        current_rank: "Coach",
        rank_achieved_date: null
      })
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Update rank data
  const updateRankData = useCallback(async (updates: Partial<RankData>) => {
    if (!user || !rankData) return

    setRankData(prev => prev ? { ...prev, ...updates } : prev)

    try {
      const { error } = await supabase
        .from("coach_rank_data")
        .upsert({
          coach_id: user.id,
          current_rank: updates.current_rank || rankData.current_rank,
          rank_achieved_date: updates.rank_achieved_date || rankData.rank_achieved_date,
          current_fqv: 0,
          current_pqv: 0,
          qualifying_points: 0,
          frontline_coaches: frontlineCoaches.length,
          total_team_size: frontlineCoaches.length
        })

      if (error) throw error
    } catch (err: any) {
      console.error("Error updating rank data:", err)
      loadData()
    }
  }, [user, rankData, frontlineCoaches.length, loadData])

  // Calculate projections from pipeline
  const calculateProjections = useCallback((
    prospects: ProspectPipeline,
    clients: ClientStats
  ): Projections => {
    const totalProspects = prospects.new + prospects.interested + prospects.ha_scheduled

    const projectedHAs =
      (prospects.new * CONVERSION_RATES.cold_to_ha) +
      (prospects.interested * CONVERSION_RATES.warm_to_ha) +
      (prospects.ha_scheduled * CONVERSION_RATES.scheduled_to_ha)

    const projectedNewClients = projectedHAs * CONVERSION_RATES.ha_to_client

    const projectedNewCoaches = clients.coachProspects * CONVERSION_RATES.client_to_coach

    return {
      totalProspects,
      projectedHAs: Math.round(projectedHAs),
      newClients: Math.round(projectedNewClients),
      newCoaches: Math.round(projectedNewCoaches),
      totalCoaches: frontlineCoaches.length + Math.round(projectedNewCoaches),
      totalClients: clients.active + Math.round(projectedNewClients)
    }
  }, [frontlineCoaches.length])

  // Calculate gaps to next rank
  const calculateGaps = useCallback((
    currentRank: RankType,
    activeClients: number,
    edCount: number,
    gdCount: number
  ): Gaps | null => {
    const currentRankIndex = RANK_ORDER.indexOf(currentRank)
    const nextRank = currentRankIndex < RANK_ORDER.length - 1
      ? RANK_ORDER[currentRankIndex + 1]
      : null

    if (!nextRank) return null

    const nextRankReqs = RANK_REQUIREMENTS[nextRank]

    return {
      coaches: Math.max(0, nextRankReqs.frontlineCoaches - frontlineCoaches.length),
      clients: Math.max(0, nextRankReqs.minClients - activeClients),
      edTeams: Math.max(0, nextRankReqs.edTeams - edCount),
      gdTeams: Math.max(0, nextRankReqs.gdTeams - gdCount)
    }
  }, [frontlineCoaches])

  // Calculate progress to next rank
  const calculateProgress = useCallback((
    currentRank: RankType,
    activeClients: number,
    edCount: number,
    gdCount: number
  ): number => {
    const currentRankIndex = RANK_ORDER.indexOf(currentRank)
    const nextRank = currentRankIndex < RANK_ORDER.length - 1
      ? RANK_ORDER[currentRankIndex + 1]
      : null

    if (!nextRank) return 100

    const nextRankReqs = RANK_REQUIREMENTS[nextRank]
    
    // Calculate client progress (30% weight)
    const clientProgress = nextRankReqs.minClients > 0
      ? Math.min((activeClients / nextRankReqs.minClients) * 100, 100)
      : 100

    // Calculate coach progress (20% weight)
    const coachProgress = nextRankReqs.frontlineCoaches > 0
      ? Math.min((frontlineCoaches.length / nextRankReqs.frontlineCoaches) * 100, 100)
      : 100

    // Calculate ED teams progress (30% weight)
    const edProgress = nextRankReqs.edTeams > 0
      ? Math.min((edCount / nextRankReqs.edTeams) * 100, 100)
      : 100

    // Calculate GD teams progress (20% weight)
    const gdProgress = nextRankReqs.gdTeams > 0
      ? Math.min((gdCount / nextRankReqs.gdTeams) * 100, 100)
      : 100

    return Math.round((clientProgress * 0.3) + (coachProgress * 0.2) + (edProgress * 0.3) + (gdProgress * 0.2))
  }, [frontlineCoaches])

  // Get next rank
  const getNextRank = useCallback((currentRank: RankType): RankType | null => {
    const currentRankIndex = RANK_ORDER.indexOf(currentRank)
    return currentRankIndex < RANK_ORDER.length - 1
      ? RANK_ORDER[currentRankIndex + 1]
      : null
  }, [])

  // Computed values
  const qualifyingLegsCount = frontlineCoaches.filter(c => c.is_qualifying).length
  const edTeamsCount = frontlineCoaches.filter(c => isEDOrHigher(c.coach_rank)).length
  const gdTeamsCount = frontlineCoaches.filter(c => isGDOrHigher(c.coach_rank)).length

  return {
    rankData,
    frontlineCoaches,
    qualifyingLegsCount,
    edTeamsCount,
    gdTeamsCount,
    loading,
    error,
    updateRankData,
    calculateProjections,
    calculateGaps,
    calculateProgress,
    getNextRank,
    reload: loadData,
    RANK_ORDER,
    RANK_REQUIREMENTS,
    RANK_COLORS
  }
}
