"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
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
  last_celebrated_day: number | null  // Track which milestone day was last celebrated
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
  last_celebrated_day?: number | null
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

/** Parse a YYYY-MM-DD string as a local date (avoids UTC midnight shift). */
export function parseLocalDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function getProgramDay(startDate: string): number {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const startDay = parseLocalDate(startDate)
  const diffTime = today.getTime() - startDay.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
  return Math.max(1, diffDays)
}

export function useClients() {
  const { user } = useAuth()
  // Memoize supabase client to prevent re-creation on every render
  const supabase = useMemo(() => createClient(), [])
  
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(false)
  const [page, setPage] = useState(0)

  // Server-side stats (RPC) so we don't need to load all rows for counts
  const [stats, setStats] = useState({
    active: 0,
    paused: 0,
    completed: 0,
    needsAttention: 0,
    coachProspects: 0,
    milestonesToday: 0,
  })
  const [statsLoading, setStatsLoading] = useState(true)

  const today = new Date().toISOString().split('T')[0]
  const PAGE_SIZE = 200

  const applyDailyTouchpointView = useCallback((rows: Client[]): Client[] => {
    // Avoid daily "reset" write bursts:
    // If the stored touchpoint date isn't today, treat AM/PM as not done for the UI,
    // but do NOT write to the database.
    return rows.map((c) => {
      if (c.last_touchpoint_date !== today) {
        return { ...c, am_done: false, pm_done: false }
      }
      return c
    })
  }, [today])

  const loadStats = useCallback(async () => {
    if (!user) {
      setStatsLoading(false)
      setStats({
        active: 0,
        paused: 0,
        completed: 0,
        needsAttention: 0,
        coachProspects: 0,
        milestonesToday: 0,
      })
      return
    }

    setStatsLoading(true)
    try {
      const { data } = await supabase.rpc("get_client_stats")
      if (data && typeof data === "object") {
        setStats((prev) => ({
          ...prev,
          active: Number((data as any).active ?? prev.active),
          paused: Number((data as any).paused ?? prev.paused),
          completed: Number((data as any).completed ?? prev.completed),
          needsAttention: Number((data as any).needsAttention ?? prev.needsAttention),
          coachProspects: Number((data as any).coachProspects ?? prev.coachProspects),
          // milestonesToday stays client-side (needs program-day calc)
        }))
      }
    } catch (e) {
      // Fallback: keep existing stats (client-side computed from loaded rows below)
    } finally {
      setStatsLoading(false)
    }
  }, [user, supabase])

  // Load clients and reset touchpoints if needed
  const loadClients = useCallback(async (opts?: { append?: boolean }) => {
    if (!user) {
      setClients([])
      setLoading(false)
      return
    }

    const append = Boolean(opts?.append)
    if (append) setLoadingMore(true)
    else setLoading(true)
    setError(null)

    const nextPage = append ? page + 1 : 0
    const from = nextPage * PAGE_SIZE
    const to = from + PAGE_SIZE - 1

    const { data, error: fetchError } = await supabase
      .from('clients')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(from, to)

    if (fetchError) {
      setError(fetchError.message)
      setLoading(false)
      setLoadingMore(false)
      return
    }

    const normalized = applyDailyTouchpointView(data || [])

    setHasMore((data || []).length === PAGE_SIZE)
    setPage(nextPage)
    setClients((prev) => (append ? [...prev, ...normalized] : normalized))

    setLoading(false)
    setLoadingMore(false)

    // Maintain a client-side milestone count (requires program day calc)
    setStats((prev) => ({
      ...prev,
      milestonesToday: normalized.filter(c => {
        if (c.status !== 'active') return false
        const day = getProgramDay(c.start_date)
        return [7, 14, 21, 30].includes(day)
      }).length,
    }))
  }, [user, supabase, page, PAGE_SIZE, applyDailyTouchpointView])

  // Combined load function to prevent double fetches
  const loadData = useCallback(async () => {
    await Promise.all([loadClients(), loadStats()])
  }, [loadClients, loadStats])

  // Initial load
  useEffect(() => {
    loadData()
  }, [loadData])

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
    loadStats()
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
    loadStats()
    return true
  }, [user, supabase, loadStats])

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
    loadStats()
    return true
  }, [user, supabase, loadStats])

  // Toggle touchpoint
  const toggleTouchpoint = useCallback(async (id: string, type: 'am_done' | 'pm_done'): Promise<boolean> => {
    const client = clients.find(c => c.id === id)
    if (!client) return false

    // If touchpoints are from a previous day, treat them as false for toggling.
    const effectiveValue = client.last_touchpoint_date === today ? client[type] : false

    return updateClient(id, {
      [type]: !effectiveValue,
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

  // Check if client needs attention
  // 1. Has a scheduled check-in for today or past (and not checked in yet)
  // 2. Last check-in was over 10 days ago
  const needsAttention = useCallback((client: Client): boolean => {
    if (client.status !== 'active') return false
    
    // If already checked in today, no attention needed
    if (client.last_touchpoint_date === today && client.am_done) return false
    
    const now = new Date()
    const todayStr = now.toISOString().split('T')[0]
    
    // Check if there's a scheduled check-in for today or past
    if (client.next_scheduled_at) {
      const scheduledDate = new Date(client.next_scheduled_at)
      const scheduledDateStr = scheduledDate.toISOString().split('T')[0]
      if (scheduledDateStr <= todayStr) {
        return true
      }
    }
    
    // Check if last check-in was over 10 days ago
    if (client.last_touchpoint_date) {
      const lastCheckIn = new Date(client.last_touchpoint_date)
      const daysSinceLastCheckIn = Math.floor((now.getTime() - lastCheckIn.getTime()) / (1000 * 60 * 60 * 24))
      if (daysSinceLastCheckIn >= 10) {
        return true
      }
    } else {
      // No last check-in date means they've never been checked in
      return true
    }
    
    return false
  }, [today])

  // If RPC isn't available yet, keep stats in sync from loaded rows.
  useEffect(() => {
    if (statsLoading) return
    setStats((prev) => ({
      ...prev,
      active: prev.active || clients.filter(c => c.status === 'active').length,
      paused: prev.paused || clients.filter(c => c.status === 'paused').length,
      completed: prev.completed || clients.filter(c => c.status === 'completed').length,
      needsAttention: prev.needsAttention || clients.filter(c => c.status === 'active' && needsAttention(c)).length,
      coachProspects: prev.coachProspects || clients.filter(c => c.is_coach_prospect && c.status === 'active').length,
    }))
  }, [clients, needsAttention, statsLoading])

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
    loadingMore,
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
    hasMore,
    loadMore: () => loadClients({ append: true }),
    refresh: () => {
      setPage(0)
      return loadClients({ append: false })
    },
    refreshStats: loadStats,
  }
}
