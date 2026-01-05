"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/hooks/use-auth"

// Types
export type ClientStatus = 'active' | 'paused' | 'completed' | 'churned'

export type RecurringFrequency = 'none' | 'weekly' | 'biweekly' | 'monthly'

export interface Client {
  id: string
  user_id: string
  label: string
  phone: string | null
  start_date: string
  status: ClientStatus
  is_coach_prospect: boolean
  am_done: boolean
  pm_done: boolean
  last_touchpoint_date: string | null
  next_scheduled_at: string | null
  recurring_frequency: RecurringFrequency | null
  recurring_day: number | null  // 0-6 for day of week
  recurring_time: string | null  // HH:MM format
  notes: string | null
  created_at: string
  updated_at: string
}

export interface NewClient {
  label: string
  phone?: string
  start_date: string
}

export interface UpdateClient {
  label?: string
  phone?: string | null
  start_date?: string
  status?: ClientStatus
  is_coach_prospect?: boolean
  am_done?: boolean
  pm_done?: boolean
  last_touchpoint_date?: string | null
  next_scheduled_at?: string | null
  recurring_frequency?: RecurringFrequency | null
  recurring_day?: number | null
  recurring_time?: string | null
  notes?: string | null
}

// Day phase configuration for UI
export interface DayPhase {
  label: string
  color: string
  bg: string
  milestone?: boolean
}

export function getDayPhase(day: number): DayPhase {
  if (day <= 3) return { label: 'Critical Phase', color: '#f44336', bg: '#ffebee' }
  if (day === 7) return { label: 'Week 1 Complete! 🎉', color: '#4caf50', bg: '#e8f5e9', milestone: true }
  if (day <= 7) return { label: 'Week 1', color: '#ff9800', bg: '#fff3e0' }
  if (day === 14) return { label: '2 Weeks! ⭐', color: '#4caf50', bg: '#e8f5e9', milestone: true }
  if (day <= 14) return { label: 'Week 2', color: '#2196f3', bg: '#e3f2fd' }
  if (day === 21) return { label: '21 Days - Habit Formed! 💎', color: '#4caf50', bg: '#e8f5e9', milestone: true }
  if (day <= 21) return { label: 'Week 3', color: '#9c27b0', bg: '#f3e5f5' }
  if (day === 30) return { label: 'ONE MONTH! 👑', color: '#ffd700', bg: '#fffde7', milestone: true }
  if (day < 30) return { label: 'Week 4', color: '#00bcd4', bg: '#e0f7fa' }
  return { label: `Day ${day}`, color: '#4caf50', bg: '#e8f5e9' }
}

export function getProgramDay(startDate: string): number {
  const start = new Date(startDate)
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const startDay = new Date(start.getFullYear(), start.getMonth(), start.getDate())
  const diffTime = today.getTime() - startDay.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
  return Math.max(1, diffDays)
}

export function useClients() {
  const { user } = useAuth()
  const supabase = createClient()
  
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const today = new Date().toISOString().split('T')[0]

  // Load clients and reset touchpoints if needed
  const loadClients = useCallback(async () => {
    if (!user) {
      setClients([])
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    const { data, error: fetchError } = await supabase
      .from('clients')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (fetchError) {
      setError(fetchError.message)
      setLoading(false)
      return
    }

    // Reset touchpoints for new day
    const clientsWithReset = (data || []).map(client => {
      if (client.last_touchpoint_date !== today) {
        return {
          ...client,
          am_done: false,
          pm_done: false,
          last_touchpoint_date: today
        }
      }
      return client
    })

    // Update any clients that need touchpoint reset in the database
    const clientsNeedingReset = (data || []).filter(c => c.last_touchpoint_date !== today)
    if (clientsNeedingReset.length > 0) {
      await supabase
        .from('clients')
        .update({ am_done: false, pm_done: false, last_touchpoint_date: today })
        .in('id', clientsNeedingReset.map(c => c.id))
    }

    setClients(clientsWithReset)
    setLoading(false)
  }, [user, supabase, today])

  // Initial load
  useEffect(() => {
    loadClients()
  }, [loadClients])

  // Add client
  const addClient = useCallback(async (newClient: NewClient): Promise<Client | null> => {
    if (!user) return null

    const clientData = {
      user_id: user.id,
      label: newClient.label.trim(),
      start_date: newClient.start_date,
      status: 'active' as ClientStatus,
      is_coach_prospect: false,
      am_done: false,
      pm_done: false,
      last_touchpoint_date: today,
      notes: null
    }

    const { data, error: insertError } = await supabase
      .from('clients')
      .insert(clientData)
      .select()
      .single()

    if (insertError) {
      setError(insertError.message)
      return null
    }

    // Optimistic update
    setClients(prev => [data, ...prev])
    return data
  }, [user, supabase, today])

  // Update client
  const updateClient = useCallback(async (id: string, updates: UpdateClient): Promise<boolean> => {
    if (!user) return false

    const { error: updateError } = await supabase
      .from('clients')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)

    if (updateError) {
      setError(updateError.message)
      return false
    }

    // Optimistic update
    setClients(prev => prev.map(c => 
      c.id === id ? { ...c, ...updates, updated_at: new Date().toISOString() } : c
    ))
    return true
  }, [user, supabase])

  // Delete client
  const deleteClient = useCallback(async (id: string): Promise<boolean> => {
    if (!user) return false

    const { error: deleteError } = await supabase
      .from('clients')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (deleteError) {
      setError(deleteError.message)
      return false
    }

    // Optimistic update
    setClients(prev => prev.filter(c => c.id !== id))
    return true
  }, [user, supabase])

  // Toggle touchpoint
  const toggleTouchpoint = useCallback(async (id: string, type: 'am_done' | 'pm_done'): Promise<boolean> => {
    const client = clients.find(c => c.id === id)
    if (!client) return false

    return updateClient(id, { 
      [type]: !client[type],
      last_touchpoint_date: today
    })
  }, [clients, updateClient, today])

  // Toggle coach prospect
  const toggleCoachProspect = useCallback(async (id: string): Promise<boolean> => {
    const client = clients.find(c => c.id === id)
    if (!client) return false

    return updateClient(id, { is_coach_prospect: !client.is_coach_prospect })
  }, [clients, updateClient])

  // Update status
  const updateStatus = useCallback(async (id: string, status: ClientStatus): Promise<boolean> => {
    return updateClient(id, { status })
  }, [updateClient])

  // Check if client needs attention (hasn't been checked in today)
  const needsAttention = useCallback((client: Client): boolean => {
    if (client.status !== 'active') return false
    // If already checked in today (am_done is true), no attention needed
    if (client.am_done) return false
    return true
  }, [])

  // Get stats
  const stats = {
    active: clients.filter(c => c.status === 'active').length,
    paused: clients.filter(c => c.status === 'paused').length,
    completed: clients.filter(c => c.status === 'completed').length,
    needsAttention: clients.filter(c => c.status === 'active' && needsAttention(c)).length,
    coachProspects: clients.filter(c => c.is_coach_prospect && c.status === 'active').length,
    milestonesToday: clients.filter(c => {
      if (c.status !== 'active') return false
      const day = getProgramDay(c.start_date)
      return [7, 14, 21, 30].includes(day)
    }).length
  }

  // Get filtered and sorted clients
  const getFilteredClients = useCallback((
    filterStatus: ClientStatus | 'all' = 'all'
  ): Client[] => {
    return clients
      .filter(c => filterStatus === 'all' || c.status === filterStatus)
      .sort((a, b) => {
        // Needs attention first
        const aNeedsAttention = needsAttention(a)
        const bNeedsAttention = needsAttention(b)
        if (aNeedsAttention && !bNeedsAttention) return -1
        if (!aNeedsAttention && bNeedsAttention) return 1
        // Then by program day (lowest first - newest clients)
        return getProgramDay(a.start_date) - getProgramDay(b.start_date)
      })
  }, [clients, needsAttention])

  return {
    clients,
    loading,
    error,
    stats,
    addClient,
    updateClient,
    deleteClient,
    toggleTouchpoint,
    toggleCoachProspect,
    updateStatus,
    needsAttention,
    getFilteredClients,
    getProgramDay,
    getDayPhase,
    refresh: loadClients
  }
}
