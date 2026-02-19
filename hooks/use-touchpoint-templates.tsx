"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { createClient } from "@/lib/supabase/client"

// Types
export interface TouchpointTrigger {
  id: string
  trigger_key: string
  trigger_label: string
  phase: string
  action_type: "text" | "call"
  emoji: string
  day_start: number | null
  day_end: number | null
  sort_order: number
  is_active: boolean
}

export interface TouchpointTemplate {
  id: string
  trigger_id: string
  title: string
  message: string
  is_default: boolean
  sort_order: number
}

export interface MeetingInvite {
  id: string
  trigger_id: string
  subject: string
  body: string
}

export interface TalkingPoint {
  id: string
  trigger_id: string
  point: string
  sort_order: number
}

// Combined trigger with all related data
export interface TouchpointTriggerWithData extends TouchpointTrigger {
  templates: TouchpointTemplate[]
  meetingInvite: MeetingInvite | null
  talkingPoints: TalkingPoint[]
}

// Get the matching trigger for a given program day
export function getTriggerForDay(
  triggers: TouchpointTriggerWithData[],
  day: number,
  options?: {
    neverCheckedIn?: boolean
    daysSinceLastContact?: number
    hasScheduledDue?: boolean
  }
): TouchpointTriggerWithData | null {
  // First check attention-based triggers
  if (options?.neverCheckedIn) {
    const neverCheckedInTrigger = triggers.find(t => t.trigger_key === "never_checked_in")
    if (neverCheckedInTrigger) return neverCheckedInTrigger
  }

  if (options?.daysSinceLastContact && options.daysSinceLastContact >= 10) {
    const noContactTrigger = triggers.find(t => t.trigger_key === "no_contact_10")
    if (noContactTrigger) return noContactTrigger
  }

  if (options?.hasScheduledDue) {
    const scheduledTrigger = triggers.find(t => t.trigger_key === "scheduled_due")
    if (scheduledTrigger) return scheduledTrigger
  }

  // Check day-based triggers (sorted by specificity - milestones first)
  // Milestones are exact day matches
  const milestones = triggers
    .filter(t => t.phase === "milestone" && t.day_start !== null)
    .sort((a, b) => (a.day_start || 0) - (b.day_start || 0))

  for (const milestone of milestones) {
    if (milestone.day_start === day) {
      return milestone
    }
  }

  // Then check phase-based triggers
  const phaseTriggers = triggers
    .filter(t => t.phase !== "milestone" && t.phase !== "attention" && t.day_start !== null)
    .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))

  for (const trigger of phaseTriggers) {
    const start = trigger.day_start || 0
    const end = trigger.day_end || Infinity

    if (day >= start && day <= end) {
      return trigger
    }
  }

  // Default to ongoing for day 31+
  if (day >= 31) {
    return triggers.find(t => t.trigger_key === "ongoing") || null
  }

  return null
}

// Check if this is a milestone day
export function isMilestoneDay(day: number): boolean {
  return [7, 14, 21, 30].includes(day)
}

// Get milestone type
export function getMilestoneType(day: number): string | null {
  switch (day) {
    case 7: return "week_1_complete"
    case 14: return "two_weeks"
    case 21: return "twenty_one_days"
    case 30: return "one_month"
    default: return null
  }
}

export function useTouchpointTemplates() {
  // Memoize supabase client to prevent re-creation on every render
  const supabase = useMemo(() => createClient(), [])

  const [triggers, setTriggers] = useState<TouchpointTrigger[]>([])
  const [templates, setTemplates] = useState<TouchpointTemplate[]>([])
  const [meetingInvites, setMeetingInvites] = useState<MeetingInvite[]>([])
  const [talkingPoints, setTalkingPoints] = useState<TalkingPoint[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load all data
  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const [triggersRes, templatesRes, invitesRes, pointsRes] = await Promise.all([
        supabase.from("touchpoint_triggers").select("*").eq("is_active", true).order("sort_order"),
        supabase.from("touchpoint_templates").select("*").order("sort_order"),
        supabase.from("touchpoint_meeting_invites").select("*"),
        supabase.from("touchpoint_talking_points").select("*").order("sort_order"),
      ])

      if (triggersRes.error) throw triggersRes.error
      if (templatesRes.error) throw templatesRes.error
      if (invitesRes.error) throw invitesRes.error
      if (pointsRes.error) throw pointsRes.error

      setTriggers(triggersRes.data || [])
      setTemplates(templatesRes.data || [])
      setMeetingInvites(invitesRes.data || [])
      setTalkingPoints(pointsRes.data || [])
    } catch (err: any) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error loading touchpoint templates:", err)
      }
      setError(err.message || "Failed to load templates")
    }

    setLoading(false)
  }, [supabase])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Combine triggers with their related data
  const triggersWithData: TouchpointTriggerWithData[] = useMemo(() => {
    return triggers.map(trigger => ({
      ...trigger,
      templates: templates.filter(t => t.trigger_id === trigger.id),
      meetingInvite: meetingInvites.find(m => m.trigger_id === trigger.id) || null,
      talkingPoints: talkingPoints.filter(tp => tp.trigger_id === trigger.id),
    }))
  }, [triggers, templates, meetingInvites, talkingPoints])

  // Get trigger for a specific day
  const getTrigger = useCallback((
    day: number,
    options?: {
      neverCheckedIn?: boolean
      daysSinceLastContact?: number
      hasScheduledDue?: boolean
    }
  ) => {
    return getTriggerForDay(triggersWithData, day, options)
  }, [triggersWithData])

  // Get default template for a trigger
  const getDefaultTemplate = useCallback((triggerId: string): TouchpointTemplate | null => {
    const triggerTemplates = templates.filter(t => t.trigger_id === triggerId)
    return triggerTemplates.find(t => t.is_default) || triggerTemplates[0] || null
  }, [templates])

  // Replace personalization tokens in a message
  const personalizeMessage = useCallback((
    message: string,
    data: {
      firstName?: string
      days?: number
      coachName?: string
      nextMilestone?: number
    }
  ): string => {
    let result = message
    if (data.firstName) result = result.replace(/\{firstName\}/g, data.firstName)
    if (data.days !== undefined) result = result.replace(/\{days\}/g, String(data.days))
    if (data.coachName) result = result.replace(/\{coachName\}/g, data.coachName)
    if (data.nextMilestone !== undefined) result = result.replace(/\{nextMilestone\}/g, String(data.nextMilestone))
    const dayName = new Date().toLocaleDateString("en-US", { weekday: "long" })
    result = result.replace(/\{today\}/g, dayName)
    return result
  }, [])

  return {
    triggers: triggersWithData,
    loading,
    error,
    getTrigger,
    getDefaultTemplate,
    personalizeMessage,
    isMilestoneDay,
    getMilestoneType,
    refresh: loadData,
  }
}
