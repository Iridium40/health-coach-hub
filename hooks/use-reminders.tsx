"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/hooks/use-auth"

export type ReminderPriority = 'normal' | 'high' | 'urgent'
export type EntityType = 'prospect' | 'client' | null

export interface Reminder {
  id: string
  user_id: string
  title: string
  notes: string | null
  due_date: string
  due_time: string | null
  priority: ReminderPriority
  is_completed: boolean
  completed_at: string | null
  entity_type: EntityType
  entity_id: string | null
  entity_name: string | null
  created_at: string
  updated_at: string
}

export interface NewReminder {
  title: string
  notes?: string
  due_date: string
  due_time?: string
  priority?: ReminderPriority
  entity_type?: EntityType
  entity_id?: string
  entity_name?: string
}

export interface UpdateReminder {
  title?: string
  notes?: string | null
  due_date?: string
  due_time?: string | null
  priority?: ReminderPriority
  is_completed?: boolean
  completed_at?: string | null
}

export function useReminders() {
  const { user } = useAuth()
  // Memoize supabase client to prevent re-creation on every render
  const supabase = useMemo(() => createClient(), [])
  
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const today = new Date().toISOString().split('T')[0]

  // Load reminders
  const loadReminders = useCallback(async () => {
    if (!user) {
      setReminders([])
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const { data, error: fetchError } = await supabase
        .from('reminders')
        .select('*')
        .eq('user_id', user.id)
        .order('due_date', { ascending: true })

      if (fetchError) {
        console.error("Error loading reminders:", fetchError)
        // Only suppress error if table doesn't exist (code 42P01)
        if (fetchError.code === '42P01') {
          setError(null)
        } else {
          setError(fetchError.message || "Failed to load reminders")
        }
        setReminders([])
        setLoading(false)
        return
      }

      setReminders(data || [])
      setLoading(false)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to load reminders"
      console.error("Error loading reminders:", err)
      setError(errorMsg)
      setReminders([])
      setLoading(false)
    }
  }, [user, supabase])

  // Initial load
  useEffect(() => {
    loadReminders()
  }, [loadReminders])

  // Add reminder
  const addReminder = useCallback(async (newReminder: NewReminder): Promise<Reminder | null> => {
    if (!user) return null

    const reminderData = {
      user_id: user.id,
      title: newReminder.title.trim(),
      notes: newReminder.notes?.trim() || null,
      due_date: newReminder.due_date,
      due_time: newReminder.due_time || null,
      priority: newReminder.priority || 'normal',
      is_completed: false,
      entity_type: newReminder.entity_type || null,
      entity_id: newReminder.entity_id || null,
      entity_name: newReminder.entity_name || null,
    }

    const { data, error: insertError } = await supabase
      .from('reminders')
      .insert(reminderData)
      .select()
      .single()

    if (insertError) {
      setError(insertError.message)
      return null
    }

    setReminders(prev => [...prev, data].sort((a, b) => 
      new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
    ))
    return data
  }, [user, supabase])

  // Update reminder
  const updateReminder = useCallback(async (id: string, updates: UpdateReminder): Promise<boolean> => {
    if (!user) return false

    const { error: updateError } = await supabase
      .from('reminders')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)

    if (updateError) {
      setError(updateError.message)
      return false
    }

    setReminders(prev => prev.map(r => 
      r.id === id ? { ...r, ...updates } : r
    ))
    return true
  }, [user, supabase])

  // Complete reminder
  const completeReminder = useCallback(async (id: string): Promise<boolean> => {
    return updateReminder(id, { 
      is_completed: true, 
      completed_at: new Date().toISOString() 
    })
  }, [updateReminder])

  // Uncomplete reminder
  const uncompleteReminder = useCallback(async (id: string): Promise<boolean> => {
    return updateReminder(id, { 
      is_completed: false, 
      completed_at: null 
    })
  }, [updateReminder])

  // Delete reminder
  const deleteReminder = useCallback(async (id: string): Promise<boolean> => {
    if (!user) return false

    const { error: deleteError } = await supabase
      .from('reminders')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (deleteError) {
      setError(deleteError.message)
      return false
    }

    setReminders(prev => prev.filter(r => r.id !== id))
    return true
  }, [user, supabase])

  // Helper functions
  const isOverdue = useCallback((reminder: Reminder): boolean => {
    if (reminder.is_completed) return false
    return reminder.due_date < today
  }, [today])

  const isDueToday = useCallback((reminder: Reminder): boolean => {
    return reminder.due_date === today && !reminder.is_completed
  }, [today])

  // Stats
  const stats = {
    total: reminders.length,
    active: reminders.filter(r => !r.is_completed).length,
    overdue: reminders.filter(r => isOverdue(r)).length,
    dueToday: reminders.filter(r => isDueToday(r)).length,
    completed: reminders.filter(r => r.is_completed).length,
  }

  // Filtered getters
  const getUpcoming = useCallback(() => {
    return reminders
      .filter(r => !r.is_completed)
      .sort((a, b) => {
        // Overdue first, then by date
        const aOverdue = isOverdue(a)
        const bOverdue = isOverdue(b)
        if (aOverdue && !bOverdue) return -1
        if (!aOverdue && bOverdue) return 1
        return new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
      })
  }, [reminders, isOverdue])

  const getCompleted = useCallback(() => {
    return reminders
      .filter(r => r.is_completed)
      .sort((a, b) => 
        new Date(b.completed_at || b.updated_at).getTime() - 
        new Date(a.completed_at || a.updated_at).getTime()
      )
  }, [reminders])

  const getByEntity = useCallback((entityType: EntityType, entityId: string) => {
    return reminders.filter(r => 
      r.entity_type === entityType && r.entity_id === entityId
    )
  }, [reminders])

  return {
    reminders,
    loading,
    error,
    stats,
    addReminder,
    updateReminder,
    deleteReminder,
    completeReminder,
    uncompleteReminder,
    isOverdue,
    isDueToday,
    getUpcoming,
    getCompleted,
    getByEntity,
    refresh: loadReminders,
  }
}
