"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"

// Full OPTAVIA Rank order including integrated track
export const RANK_ORDER = [
  'Coach',
  'Senior Coach',
  'Manager',
  'Associate Director',
  'Director',
  'Executive Director',
  'FIBC',
  'Regional Director',
  'Integrated RD',
  'National Director',
  'Integrated ND',
  'Global Director',
  'FIBL',
  'Presidential Director',
  'IPD'
] as const

export type RankType = typeof RANK_ORDER[number]

// Get rank index (higher = more senior)
export function getRankIndex(rank: string): number {
  const index = RANK_ORDER.indexOf(rank as RankType)
  return index >= 0 ? index : 0
}

// Check if a coach qualifies as SC+ (Senior Coach or higher) - counts as 1 QP
export function isQualifyingLeg(rank: string): boolean {
  return getRankIndex(rank) >= 1 // Senior Coach or higher
}

// Check if coach is ED or higher
export function isEDOrHigher(rank: string): boolean {
  return getRankIndex(rank) >= 5 // Executive Director or higher
}

// Check if coach is FIBC or higher (integrated track)
export function isFIBCOrHigher(rank: string): boolean {
  const r = rank as RankType
  return ['FIBC', 'Integrated RD', 'Integrated ND', 'FIBL', 'IPD'].includes(r)
}

// Check if coach is GD or higher (for legacy compatibility)
export function isGDOrHigher(rank: string): boolean {
  return getRankIndex(rank) >= 11 // Global Director or higher
}

// Rank requirements based on simplified OPTAVIA Career Path
// Points = Qualifying Points (simplified: we'll use client count where ~5 clients = 1 point)
// SC Teams = number of SC+ frontline coaches
// ED Teams = number of ED+ frontline coaches  
// FIBC Teams = number of FIBC+ frontline coaches (integrated track)
export const RANK_REQUIREMENTS: Record<RankType, {
  points: number      // Qualifying Points needed
  scTeams: number     // SC+ frontline coaches needed
  edTeams: number     // ED+ frontline coaches needed
  fibcTeams: number   // FIBC+ frontline coaches needed
  description: string
  icon: string
  note: string
}> = {
  'Coach': {
    points: 0,
    scTeams: 0,
    edTeams: 0,
    fibcTeams: 0,
    description: 'Starting rank',
    icon: '🌱',
    note: 'Welcome to the team!'
  },
  'Senior Coach': {
    points: 1,
    scTeams: 0,
    edTeams: 0,
    fibcTeams: 0,
    description: '1 Point',
    icon: '⭐',
    note: '~5 clients with qualifying orders'
  },
  'Manager': {
    points: 2,
    scTeams: 0,
    edTeams: 0,
    fibcTeams: 0,
    description: '2 Points',
    icon: '📈',
    note: '~10 clients with qualifying orders'
  },
  'Associate Director': {
    points: 3,
    scTeams: 0,
    edTeams: 0,
    fibcTeams: 0,
    description: '3 Points',
    icon: '🎯',
    note: '~15 clients with qualifying orders'
  },
  'Director': {
    points: 4,
    scTeams: 0,
    edTeams: 0,
    fibcTeams: 0,
    description: '4 Points',
    icon: '🏅',
    note: '~20 clients with qualifying orders'
  },
  'Executive Director': {
    points: 5,
    scTeams: 0,
    edTeams: 0,
    fibcTeams: 0,
    description: '5 Points',
    icon: '💫',
    note: '~25 clients with qualifying orders'
  },
  'FIBC': {
    points: 5,
    scTeams: 5,
    edTeams: 0,
    fibcTeams: 0,
    description: '5 Points + 5 SC Teams',
    icon: '🏆',
    note: 'Fully Integrated Business Coach'
  },
  'Regional Director': {
    points: 5,
    scTeams: 0,
    edTeams: 1,
    fibcTeams: 0,
    description: '5 Points + 1 ED Team',
    icon: '🗺️',
    note: '1 frontline ED+ coach'
  },
  'Integrated RD': {
    points: 5,
    scTeams: 5,
    edTeams: 1,
    fibcTeams: 0,
    description: '5 Points + 5 SC + 1 ED',
    icon: '🌐',
    note: 'Integrated Regional Director'
  },
  'National Director': {
    points: 5,
    scTeams: 0,
    edTeams: 3,
    fibcTeams: 0,
    description: '5 Points + 3 ED Teams',
    icon: '🏛️',
    note: '3 frontline ED+ coaches'
  },
  'Integrated ND': {
    points: 5,
    scTeams: 5,
    edTeams: 3,
    fibcTeams: 0,
    description: '5 Points + 5 SC + 3 ED',
    icon: '🌟',
    note: 'Integrated National Director'
  },
  'Global Director': {
    points: 5,
    scTeams: 0,
    edTeams: 5,
    fibcTeams: 0,
    description: '5 Points + 5 ED Teams',
    icon: '🌍',
    note: '5 frontline ED+ coaches'
  },
  'FIBL': {
    points: 5,
    scTeams: 5,
    edTeams: 0,
    fibcTeams: 5,
    description: '5 Points + 5 SC + 5 FIBC',
    icon: '💎',
    note: 'Fully Integrated Business Leader'
  },
  'Presidential Director': {
    points: 5,
    scTeams: 0,
    edTeams: 10,
    fibcTeams: 0,
    description: '5 Points + 10 ED Teams',
    icon: '👑',
    note: '10 frontline ED+ coaches'
  },
  'IPD': {
    points: 5,
    scTeams: 5,
    edTeams: 10,
    fibcTeams: 5,
    description: '5 Points + 5 SC + 10 ED + 5 FIBC',
    icon: '🎖️',
    note: 'Integrated Presidential Director'
  }
}

export const RANK_COLORS: Record<RankType, { bg: string; text: string; accent: string }> = {
  'Coach': { bg: 'bg-gray-100', text: 'text-gray-600', accent: 'bg-gray-500' },
  'Senior Coach': { bg: 'bg-blue-50', text: 'text-blue-600', accent: 'bg-blue-500' },
  'Manager': { bg: 'bg-teal-50', text: 'text-teal-600', accent: 'bg-teal-500' },
  'Associate Director': { bg: 'bg-indigo-50', text: 'text-indigo-600', accent: 'bg-indigo-500' },
  'Director': { bg: 'bg-violet-50', text: 'text-violet-600', accent: 'bg-violet-500' },
  'Executive Director': { bg: 'bg-purple-50', text: 'text-purple-600', accent: 'bg-purple-500' },
  'FIBC': { bg: 'bg-fuchsia-50', text: 'text-fuchsia-600', accent: 'bg-fuchsia-500' },
  'Regional Director': { bg: 'bg-cyan-50', text: 'text-cyan-600', accent: 'bg-cyan-500' },
  'Integrated RD': { bg: 'bg-sky-50', text: 'text-sky-600', accent: 'bg-sky-500' },
  'National Director': { bg: 'bg-emerald-50', text: 'text-emerald-600', accent: 'bg-emerald-500' },
  'Integrated ND': { bg: 'bg-green-50', text: 'text-green-600', accent: 'bg-green-500' },
  'Global Director': { bg: 'bg-yellow-50', text: 'text-yellow-700', accent: 'bg-yellow-500' },
  'FIBL': { bg: 'bg-amber-50', text: 'text-amber-600', accent: 'bg-amber-500' },
  'Presidential Director': { bg: 'bg-orange-50', text: 'text-orange-600', accent: 'bg-orange-500' },
  'IPD': { bg: 'bg-red-50', text: 'text-red-600', accent: 'bg-red-600' }
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

export interface Gaps {
  points: number      // Gap in qualifying points
  scTeams: number     // Gap in SC+ teams
  edTeams: number     // Gap in ED+ teams
  fibcTeams: number   // Gap in FIBC+ teams
}

export function useRankCalculator(user: User | null) {
  const [rankData, setRankData] = useState<RankData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = useMemo(() => createClient(), [])

  const loadData = useCallback(async () => {
    if (!user) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
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
        const defaultData: RankData = {
          coach_id: user.id,
          current_rank: "Coach",
          rank_achieved_date: null
        }
        setRankData(defaultData)

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
      
      // NOTE: Frontline coaches are now manually entered in the calculator
      // No automatic fetching from sponsor_team or profiles
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
          frontline_coaches: 0,
          total_team_size: 0
        })

      if (error) throw error
    } catch (err: any) {
      console.error("Error updating rank data:", err)
      loadData()
    }
  }, [user, rankData, loadData])

  // Calculate gaps to next rank
  const calculateGaps = useCallback((
    currentRank: RankType,
    currentPoints: number,
    scCount: number,
    edCount: number,
    fibcCount: number
  ): Gaps | null => {
    const currentRankIndex = RANK_ORDER.indexOf(currentRank)
    const nextRank = currentRankIndex < RANK_ORDER.length - 1
      ? RANK_ORDER[currentRankIndex + 1]
      : null

    if (!nextRank) return null

    const nextRankReqs = RANK_REQUIREMENTS[nextRank]

    return {
      points: Math.max(0, nextRankReqs.points - currentPoints),
      scTeams: Math.max(0, nextRankReqs.scTeams - scCount),
      edTeams: Math.max(0, nextRankReqs.edTeams - edCount),
      fibcTeams: Math.max(0, nextRankReqs.fibcTeams - fibcCount)
    }
  }, [])

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
    calculateGaps,
    getNextRank,
    reload: loadData,
    RANK_ORDER,
    RANK_REQUIREMENTS,
    RANK_COLORS
  }
}
