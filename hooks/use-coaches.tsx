"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/hooks/use-auth"

// Types
export type CoachStage = 'new_coach' | 'building' | 'certified' | 'leader'

export interface Coach {
  id: string
  user_id: string
  label: string
  stage: CoachStage
  rank: number
  launch_date: string
  clients_count: number
  prospects_count: number
  notes: string | null
  last_check_in: string | null
  next_scheduled_at: string | null
  created_at: string
  updated_at: string
}

export interface NewCoach {
  label: string
  stage?: CoachStage
  rank?: number
  launch_date: string
  clients_count?: number
  prospects_count?: number
  notes?: string
}

export interface UpdateCoach {
  label?: string
  stage?: CoachStage
  rank?: number
  launch_date?: string
  clients_count?: number
  prospects_count?: number
  notes?: string | null
  last_check_in?: string | null
  next_scheduled_at?: string | null
}

// Stage configuration
export const stageConfig: Record<CoachStage, { label: string; color: string; borderColor: string; bg: string; icon: string }> = {
  new_coach: { label: 'New Coach', color: '#3B82F6', borderColor: '#93C5FD', bg: '#EFF6FF', icon: '🌟' },
  building: { label: 'Building', color: '#F59E0B', borderColor: '#FCD34D', bg: '#FFFBEB', icon: '🔨' },
  certified: { label: 'Certified', color: '#14B8A6', borderColor: '#5EEAD4', bg: '#F0FDFA', icon: '✅' },
  leader: { label: 'Leader', color: '#8B5CF6', borderColor: '#C4B5FD', bg: '#F5F3FF', icon: '👑' },
}

// OPTAVIA Ranks
export const OPTAVIA_RANKS = [
  { rank: 1, title: "New Coach" },
  { rank: 2, title: "Associate Coach" },
  { rank: 3, title: "Senior Coach" },
  { rank: 4, title: "Certified Coach" },
  { rank: 5, title: "Certified Executive Coach" },
  { rank: 6, title: "Manager" },
  { rank: 7, title: "Senior Manager" },
  { rank: 8, title: "Executive Manager" },
  { rank: 9, title: "Director" },
  { rank: 10, title: "Executive Director" },
  { rank: 11, title: "Senior Director" },
  { rank: 12, title: "Regional Director" },
  { rank: 13, title: "National Director" },
  { rank: 14, title: "Presidential Director" },
  { rank: 15, title: "Integrated Presidential Director" },
]

export function getRankTitle(rank: number): string {
  return OPTAVIA_RANKS.find(r => r.rank === rank)?.title || "New Coach"
}

/**
 * Maps the Coach Tracker's 1-15 OPTAVIA rank numbers to the
 * compensation-plan RankType used by the Rank Calculator.
 * Best-fit mapping based on the official rank ladder.
 */
export function mapRankNumberToRankType(rank: number): string {
  const mapping: Record<number, string> = {
    1: "Coach",
    2: "Coach",
    3: "Senior Coach",
    4: "Senior Coach",
    5: "Senior Coach",
    6: "Manager",
    7: "Manager",
    8: "Executive Director",
    9: "Director",
    10: "Executive Director",
    11: "Regional Director",
    12: "Regional Director",
    13: "National Director",
    14: "Presidential Director",
    15: "IPD",
  }
  return mapping[rank] || "Coach"
}

export function daysSinceLaunch(launchDate: string): number {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const [y, m, d] = launchDate.split('-').map(Number)
  const launch = new Date(y, m - 1, d)
  return Math.max(0, Math.floor((today.getTime() - launch.getTime()) / (1000 * 60 * 60 * 24)))
}

export function weekNumber(launchDate: string): number {
  return Math.max(1, Math.ceil(daysSinceLaunch(launchDate) / 7))
}

export function useCoaches() {
  const { user } = useAuth()
  const supabase = useMemo(() => createClient(), [])

  const [coaches, setCoaches] = useState<Coach[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [stats, setStats] = useState({
    newCoach: 0,
    building: 0,
    certified: 0,
    leader: 0,
    total: 0,
  })

  const today = new Date().toISOString().split('T')[0]

  // Load coaches
  const loadCoaches = useCallback(async () => {
    if (!user) {
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      const { data, error: fetchError } = await supabase
        .from('downline_coaches')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (fetchError) {
        setError(fetchError.message)
        return
      }

      setCoaches(data || [])

      // Compute stats client-side
      const all = data || []
      setStats({
        newCoach: all.filter(c => c.stage === 'new_coach').length,
        building: all.filter(c => c.stage === 'building').length,
        certified: all.filter(c => c.stage === 'certified').length,
        leader: all.filter(c => c.stage === 'leader').length,
        total: all.length,
      })
    } catch (e) {
      setError('Failed to load coaches')
    } finally {
      setLoading(false)
    }
  }, [user, supabase])

  // Initial load
  useEffect(() => {
    loadCoaches()
  }, [loadCoaches])

  // Add coach
  const addCoach = useCallback(async (newCoach: NewCoach): Promise<Coach | null> => {
    if (!user) return null

    const coachData = {
      user_id: user.id,
      label: newCoach.label.trim(),
      stage: newCoach.stage || 'new_coach',
      rank: newCoach.rank || 1,
      launch_date: newCoach.launch_date,
      clients_count: newCoach.clients_count || 0,
      prospects_count: newCoach.prospects_count || 0,
      notes: newCoach.notes || null,
    }

    const { data, error: insertError } = await supabase
      .from('downline_coaches')
      .insert(coachData)
      .select()
      .single()

    if (insertError) {
      setError(insertError.message)
      return null
    }

    setCoaches(prev => [data, ...prev])
    // Update stats
    setStats(prev => ({
      ...prev,
      [data.stage === 'new_coach' ? 'newCoach' : data.stage]: prev[data.stage === 'new_coach' ? 'newCoach' : data.stage as keyof typeof prev] + 1,
      total: prev.total + 1,
    }))
    return data
  }, [user, supabase])

  // Update coach
  const updateCoach = useCallback(async (id: string, updates: UpdateCoach): Promise<boolean> => {
    if (!user) return false

    const { error: updateError } = await supabase
      .from('downline_coaches')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id)

    if (updateError) {
      setError(updateError.message)
      return false
    }

    setCoaches(prev => prev.map(c =>
      c.id === id ? { ...c, ...updates, updated_at: new Date().toISOString() } : c
    ))

    // Recalculate stats if stage changed
    if (updates.stage) {
      setStats(prev => {
        const all = coaches.map(c => c.id === id ? { ...c, ...updates } : c)
        return {
          newCoach: all.filter(c => c.stage === 'new_coach').length,
          building: all.filter(c => c.stage === 'building').length,
          certified: all.filter(c => c.stage === 'certified').length,
          leader: all.filter(c => c.stage === 'leader').length,
          total: all.length,
        }
      })
    }

    return true
  }, [user, supabase, coaches])

  // Delete coach
  const deleteCoach = useCallback(async (id: string): Promise<boolean> => {
    if (!user) return false

    const { error: deleteError } = await supabase
      .from('downline_coaches')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (deleteError) {
      setError(deleteError.message)
      return false
    }

    const deleted = coaches.find(c => c.id === id)
    setCoaches(prev => prev.filter(c => c.id !== id))

    if (deleted) {
      setStats(prev => {
        const key = deleted.stage === 'new_coach' ? 'newCoach' : deleted.stage
        return {
          ...prev,
          [key]: Math.max(0, (prev[key as keyof typeof prev] as number) - 1),
          total: prev.total - 1,
        }
      })
    }

    return true
  }, [user, supabase, coaches])

  // Check in coach (update last_check_in to today)
  const checkInCoach = useCallback(async (id: string): Promise<boolean> => {
    return updateCoach(id, { last_check_in: today })
  }, [updateCoach, today])

  // Get filtered coaches
  const getFilteredCoaches = useCallback((
    filterStage: CoachStage | 'all' = 'all',
    searchTerm: string = ''
  ): Coach[] => {
    return coaches
      .filter(c => {
        if (filterStage !== 'all' && c.stage !== filterStage) return false
        if (searchTerm && !c.label.toLowerCase().includes(searchTerm.toLowerCase())) return false
        return true
      })
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
  }, [coaches])

  return {
    coaches,
    loading,
    error,
    stats,
    addCoach,
    updateCoach,
    deleteCoach,
    checkInCoach,
    getFilteredCoaches,
    refreshData: loadCoaches,
  }
}
