"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/hooks/use-auth"

// Types
export type ProspectStatus = 'cold' | 'warm' | 'ha_scheduled' | 'ha_done' | 'converted' | 'coach' | 'not_interested'
export type ProspectSource = 'social' | 'gym' | 'work' | 'family' | 'referral' | 'other'
export type ProspectActionType = 'reach_out' | 'follow_up' | 'schedule_ha' | 'health_assessment' | 'schedule_call' | 'close'

export interface Prospect {
  id: string
  user_id: string
  label: string
  phone: string | null
  status: ProspectStatus
  source: ProspectSource
  last_action: string | null
  next_action: string | null
  ha_scheduled_at: string | null
  action_type: ProspectActionType | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface NewProspect {
  label: string
  phone?: string
  source: ProspectSource
  notes?: string
}

export interface UpdateProspect {
  label?: string
  phone?: string | null
  status?: ProspectStatus
  source?: ProspectSource
  last_action?: string | null
  next_action?: string | null
  ha_scheduled_at?: string | null
  action_type?: ProspectActionType | null
  notes?: string | null
}

// Status configuration for UI
export const statusConfig: Record<ProspectStatus, { label: string; color: string; bg: string; icon: string }> = {
  cold: { label: 'Cold', color: '#9e9e9e', bg: '#f5f5f5', icon: '🔵' },
  warm: { label: 'Warm', color: '#ff9800', bg: '#fff3e0', icon: '🟡' },
  ha_scheduled: { label: 'HA Scheduled', color: '#2196f3', bg: '#e3f2fd', icon: '📅' },
  ha_done: { label: 'HA Done', color: '#9c27b0', bg: '#f3e5f5', icon: '✅' },
  converted: { label: 'Client!', color: '#4caf50', bg: '#e8f5e9', icon: '⭐' },
  coach: { label: 'Coach!', color: '#00A651', bg: '#e8f5e9', icon: '🏆' },
  not_interested: { label: 'Not Now', color: '#757575', bg: '#eeeeee', icon: '⏸️' }
}

// Source options for UI
export const sourceOptions: { value: ProspectSource; label: string }[] = [
  { value: 'social', label: 'Social Media' },
  { value: 'gym', label: 'Gym/Fitness' },
  { value: 'work', label: 'Work' },
  { value: 'family', label: 'Family' },
  { value: 'referral', label: 'Referral' },
  { value: 'other', label: 'Other' }
]

// Action type labels for UI
export const actionTypeLabels: Record<ProspectActionType, string> = {
  reach_out: 'Reach Out',
  follow_up: 'Follow Up',
  schedule_ha: 'Schedule HA',
  health_assessment: 'Do HA',
  schedule_call: 'Schedule Call',
  close: 'Close'
}

export function useProspects() {
  const { user } = useAuth()
  const supabase = createClient()
  
  const [prospects, setProspects] = useState<Prospect[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load prospects
  const loadProspects = useCallback(async () => {
    if (!user) {
      setProspects([])
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    const { data, error: fetchError } = await supabase
      .from('prospects')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (fetchError) {
      setError(fetchError.message)
      setLoading(false)
      return
    }

    setProspects(data || [])
    setLoading(false)
  }, [user, supabase])

  // Initial load
  useEffect(() => {
    loadProspects()
  }, [loadProspects])

  // Add prospect
  const addProspect = useCallback(async (newProspect: NewProspect): Promise<Prospect | null> => {
    if (!user) return null

    const today = new Date().toISOString().split('T')[0]
    
    const prospectData = {
      user_id: user.id,
      label: newProspect.label.trim(),
      status: 'cold' as ProspectStatus,
      source: newProspect.source,
      last_action: today,
      next_action: today,
      action_type: 'reach_out' as ProspectActionType,
      notes: newProspect.notes || null
    }

    const { data, error: insertError } = await supabase
      .from('prospects')
      .insert(prospectData)
      .select()
      .single()

    if (insertError) {
      setError(insertError.message)
      return null
    }

    // Optimistic update
    setProspects(prev => [data, ...prev])
    return data
  }, [user, supabase])

  // Update prospect
  const updateProspect = useCallback(async (id: string, updates: UpdateProspect): Promise<boolean> => {
    if (!user) return false

    // If status is being updated, also update last_action
    const updateData: UpdateProspect = { ...updates }
    if (updates.status) {
      updateData.last_action = new Date().toISOString().split('T')[0]
    }

    const { error: updateError } = await supabase
      .from('prospects')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)

    if (updateError) {
      setError(updateError.message)
      return false
    }

    // Optimistic update
    setProspects(prev => prev.map(p => 
      p.id === id ? { ...p, ...updateData, updated_at: new Date().toISOString() } : p
    ))
    return true
  }, [user, supabase])

  // Delete prospect
  const deleteProspect = useCallback(async (id: string): Promise<boolean> => {
    if (!user) return false

    const { error: deleteError } = await supabase
      .from('prospects')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (deleteError) {
      setError(deleteError.message)
      return false
    }

    // Optimistic update
    setProspects(prev => prev.filter(p => p.id !== id))
    return true
  }, [user, supabase])

  // Log action (update last_action and set next_action)
  const logAction = useCallback(async (id: string, daysUntilNext: number = 3): Promise<boolean> => {
    const today = new Date()
    const nextDate = new Date(today)
    nextDate.setDate(nextDate.getDate() + daysUntilNext)

    return updateProspect(id, {
      last_action: today.toISOString().split('T')[0],
      next_action: nextDate.toISOString().split('T')[0]
    })
  }, [updateProspect])

  // Get stats
  const stats = {
    total: prospects.filter(p => p.status !== 'not_interested').length,
    cold: prospects.filter(p => p.status === 'cold').length,
    warm: prospects.filter(p => p.status === 'warm').length,
    inProgress: prospects.filter(p => ['ha_scheduled', 'ha_done'].includes(p.status)).length,
    converted: prospects.filter(p => p.status === 'converted').length,
    coaches: prospects.filter(p => p.status === 'coach').length,
    overdue: prospects.filter(p => {
      if (!p.next_action || ['converted', 'coach', 'not_interested'].includes(p.status)) return false
      return new Date(p.next_action) < new Date(new Date().toISOString().split('T')[0])
    }).length
  }

  // Get filtered and sorted prospects
  const getFilteredProspects = useCallback((
    filterStatus: ProspectStatus | 'all' = 'all',
    searchTerm: string = ''
  ): Prospect[] => {
    const today = new Date().toISOString().split('T')[0]
    
    return prospects
      .filter(p => {
        // Exclude converted clients from the list unless specifically filtering for them
        // Converted prospects should be managed in the client tracker
        if (filterStatus === 'all' && p.status === 'converted') return false
        if (filterStatus !== 'all' && p.status !== filterStatus) return false
        if (searchTerm && !p.label.toLowerCase().includes(searchTerm.toLowerCase())) return false
        return true
      })
      .sort((a, b) => {
        // Overdue first, then by next action date
        const aOverdue = a.next_action && a.next_action < today
        const bOverdue = b.next_action && b.next_action < today
        if (aOverdue && !bOverdue) return -1
        if (!aOverdue && bOverdue) return 1
        if (a.next_action && b.next_action) return a.next_action.localeCompare(b.next_action)
        return 0
      })
  }, [prospects])

  // Calculate days until next action
  const getDaysUntil = useCallback((dateStr: string | null): number | null => {
    if (!dateStr) return null
    const today = new Date().toISOString().split('T')[0]
    const diff = Math.ceil((new Date(dateStr).getTime() - new Date(today).getTime()) / (1000 * 60 * 60 * 24))
    return diff
  }, [])

  return {
    prospects,
    loading,
    error,
    stats,
    addProspect,
    updateProspect,
    deleteProspect,
    logAction,
    getFilteredProspects,
    getDaysUntil,
    refresh: loadProspects
  }
}
