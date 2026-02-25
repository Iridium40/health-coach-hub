"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/hooks/use-auth"

export interface CoachClient {
  id: string
  user_id: string
  coach_id: string
  label: string
  is_potential_coach: boolean
  notes: string | null
  created_at: string
  updated_at: string
}

export interface NewCoachClient {
  coach_id: string
  label: string
  is_potential_coach?: boolean
  notes?: string
}

export interface UpdateCoachClient {
  label?: string
  is_potential_coach?: boolean
  notes?: string | null
}

export function useCoachClients() {
  const { user } = useAuth()
  const supabase = useMemo(() => createClient(), [])

  const [coachClients, setCoachClients] = useState<CoachClient[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadCoachClients = useCallback(async () => {
    if (!user) {
      setCoachClients([])
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    const { data, error: fetchError } = await supabase
      .from("coach_clients")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (fetchError) {
      setError(fetchError.message)
      setLoading(false)
      return
    }

    setCoachClients(data || [])
    setLoading(false)
  }, [user, supabase])

  useEffect(() => {
    loadCoachClients()
  }, [loadCoachClients])

  const addCoachClient = useCallback(async (newCoachClient: NewCoachClient): Promise<CoachClient | null> => {
    if (!user) return null

    const payload = {
      user_id: user.id,
      coach_id: newCoachClient.coach_id,
      label: newCoachClient.label.trim(),
      is_potential_coach: Boolean(newCoachClient.is_potential_coach),
      notes: newCoachClient.notes?.trim() || null,
    }

    const { data, error: insertError } = await supabase
      .from("coach_clients")
      .insert(payload)
      .select()
      .single()

    if (insertError) {
      setError(insertError.message)
      return null
    }

    setCoachClients((prev) => [data, ...prev])
    return data
  }, [user, supabase])

  const updateCoachClient = useCallback(async (id: string, updates: UpdateCoachClient): Promise<boolean> => {
    if (!user) return false

    const { error: updateError } = await supabase
      .from("coach_clients")
      .update(updates)
      .eq("id", id)
      .eq("user_id", user.id)

    if (updateError) {
      setError(updateError.message)
      return false
    }

    setCoachClients((prev) =>
      prev.map((entry) =>
        entry.id === id
          ? { ...entry, ...updates, updated_at: new Date().toISOString() }
          : entry
      )
    )
    return true
  }, [user, supabase])

  const deleteCoachClient = useCallback(async (id: string): Promise<boolean> => {
    if (!user) return false

    const { error: deleteError } = await supabase
      .from("coach_clients")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id)

    if (deleteError) {
      setError(deleteError.message)
      return false
    }

    setCoachClients((prev) => prev.filter((entry) => entry.id !== id))
    return true
  }, [user, supabase])

  const getByCoachId = useCallback((coachId: string) => {
    return coachClients.filter((entry) => entry.coach_id === coachId)
  }, [coachClients])

  return {
    coachClients,
    loading,
    error,
    addCoachClient,
    updateCoachClient,
    deleteCoachClient,
    getByCoachId,
    refresh: loadCoachClients,
  }
}
