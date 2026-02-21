"use client"

import { useMemo, useState, useCallback } from "react"
import { useClients, getProgramDay, getDayPhase, type Client } from "@/hooks/use-clients"
import { useProspects, type Prospect } from "@/hooks/use-prospects"
import { isMilestoneDay } from "@/hooks/use-touchpoint-templates"

export type AlertSeverity = "urgent" | "high" | "normal"
export type AlertCategory = "check-in" | "milestone" | "prospect" | "critical-phase"

export interface SmartAlert {
  id: string
  title: string
  description: string
  severity: AlertSeverity
  category: AlertCategory
  entityType: "client" | "prospect"
  entityName: string
  entityId: string
  programDay?: number // for milestone alerts
}

/**
 * Computes smart alerts from client and prospect data.
 * These are not stored in the database — they're derived in real time.
 */
export function useSmartAlerts() {
  const { clients, toggleTouchpoint, updateClient } = useClients()
  const { prospects } = useProspects()

  // Dismissed alerts persist for this session only
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set())

  const today = new Date().toISOString().split("T")[0]
  const now = new Date()

  const allAlerts = useMemo(() => {
    const result: SmartAlert[] = []

    // --- CLIENT ALERTS ---
    const activeClients = clients.filter((c) => c.status === "active")

    for (const client of activeClients) {
      const programDay = getProgramDay(client.start_date)
      const phase = getDayPhase(programDay)
      const alreadyCheckedInToday =
        client.last_touchpoint_date === today && client.am_done

      // 1. Critical Phase (Days 1-3) — needs daily contact
      if (programDay <= 3 && !alreadyCheckedInToday) {
        result.push({
          id: `critical-${client.id}`,
          title: `${client.label} — Critical Phase (Day ${programDay})`,
          description:
            "New clients need daily support in their first 3 days. Reach out today!",
          severity: "urgent",
          category: "critical-phase",
          entityType: "client",
          entityName: client.label,
          entityId: client.id,
        })
      }

      // 2. Milestone day — celebrate!
      if (
        isMilestoneDay(programDay) &&
        client.last_celebrated_day !== programDay
      ) {
        result.push({
          id: `milestone-${client.id}`,
          title: `${client.label} — ${phase.label}`,
          description: `Today is Day ${programDay}! Send a celebration message.`,
          severity: "high",
          category: "milestone",
          entityType: "client",
          entityName: client.label,
          entityId: client.id,
          programDay,
        })
      }

      // 3. No check-in for 5+ days
      if (client.last_touchpoint_date && !alreadyCheckedInToday) {
        const lastCheckIn = new Date(client.last_touchpoint_date)
        const daysSince = Math.floor(
          (now.getTime() - lastCheckIn.getTime()) / (1000 * 60 * 60 * 24)
        )

        if (daysSince >= 10) {
          result.push({
            id: `overdue-${client.id}`,
            title: `${client.label} — ${daysSince} days since last check-in`,
            description:
              "This client may be losing momentum. Reach out before they disengage.",
            severity: "urgent",
            category: "check-in",
            entityType: "client",
            entityName: client.label,
            entityId: client.id,
          })
        } else if (daysSince >= 5) {
          result.push({
            id: `overdue-${client.id}`,
            title: `${client.label} — ${daysSince} days since last check-in`,
            description: "It's been a few days. A quick check-in can make a big difference.",
            severity: "high",
            category: "check-in",
            entityType: "client",
            entityName: client.label,
            entityId: client.id,
          })
        }
      } else if (!client.last_touchpoint_date && !alreadyCheckedInToday) {
        // Never checked in
        result.push({
          id: `never-${client.id}`,
          title: `${client.label} — Never checked in`,
          description: "This client hasn't had their first check-in yet. Start building the relationship!",
          severity: "urgent",
          category: "check-in",
          entityType: "client",
          entityName: client.label,
          entityId: client.id,
        })
      }

      // 4. Overdue scheduled check-in
      if (client.next_scheduled_at) {
        const scheduled = new Date(client.next_scheduled_at)
        if (scheduled < now && !alreadyCheckedInToday) {
          result.push({
            id: `sched-overdue-${client.id}`,
            title: `${client.label} — Overdue scheduled check-in`,
            description: `Check-in was scheduled for ${scheduled.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}. Follow up now.`,
            severity: "urgent",
            category: "check-in",
            entityType: "client",
            entityName: client.label,
            entityId: client.id,
          })
        }
      }
    }

    // --- PROSPECT ALERTS ---
    const activeProspects = prospects.filter(
      (p) => !["converted", "not_interested", "not_closed"].includes(p.status)
    )

    for (const prospect of activeProspects) {
      // 1. Overdue HA (health assessment scheduled in the past)
      if (prospect.ha_scheduled_at) {
        const haDate = new Date(prospect.ha_scheduled_at)
        if (haDate < now) {
          result.push({
            id: `ha-overdue-${prospect.id}`,
            title: `${prospect.label} — Overdue Health Assessment`,
            description: `HA was scheduled for ${haDate.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}. Follow up on results.`,
            severity: "urgent",
            category: "prospect",
            entityType: "prospect",
            entityName: prospect.label,
            entityId: prospect.id,
          })
        }
      }

      // 2. Overdue follow-up (next_action date is past)
      if (prospect.next_action) {
        const nextAction = new Date(prospect.next_action)
        if (nextAction < now) {
          const daysPast = Math.floor(
            (now.getTime() - nextAction.getTime()) / (1000 * 60 * 60 * 24)
          )
          result.push({
            id: `followup-overdue-${prospect.id}`,
            title: `${prospect.label} — Overdue follow-up`,
            description: daysPast <= 1
              ? "Follow-up was due today. Reach out now."
              : `Follow-up was due ${daysPast} days ago. Don't let this one slip.`,
            severity: daysPast >= 3 ? "urgent" : "high",
            category: "prospect",
            entityType: "prospect",
            entityName: prospect.label,
            entityId: prospect.id,
          })
        }
      }

      // 3. Stale prospect — no action in 7+ days
      if (prospect.last_action) {
        const lastAction = new Date(prospect.last_action)
        const daysSince = Math.floor(
          (now.getTime() - lastAction.getTime()) / (1000 * 60 * 60 * 24)
        )

        if (daysSince >= 14) {
          result.push({
            id: `stale-${prospect.id}`,
            title: `${prospect.label} — ${daysSince} days without action`,
            description: "This prospect may go cold. Take the next step.",
            severity: "high",
            category: "prospect",
            entityType: "prospect",
            entityName: prospect.label,
            entityId: prospect.id,
          })
        } else if (daysSince >= 7) {
          result.push({
            id: `stale-${prospect.id}`,
            title: `${prospect.label} — ${daysSince} days without action`,
            description: "Haven't engaged in a week. Consider a follow-up.",
            severity: "normal",
            category: "prospect",
            entityType: "prospect",
            entityName: prospect.label,
            entityId: prospect.id,
          })
        }
      } else {
        // Never had an action taken
        const created = new Date(prospect.created_at)
        const daysSince = Math.floor(
          (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)
        )
        if (daysSince >= 3) {
          result.push({
            id: `new-no-action-${prospect.id}`,
            title: `${prospect.label} — No action taken yet`,
            description: "This prospect was added but no outreach has been logged.",
            severity: "high",
            category: "prospect",
            entityType: "prospect",
            entityName: prospect.label,
            entityId: prospect.id,
          })
        }
      }
    }

    // Sort: urgent first, then high, then normal
    const severityOrder: Record<AlertSeverity, number> = {
      urgent: 0,
      high: 1,
      normal: 2,
    }
    result.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity])

    return result
  }, [clients, prospects, today, now])

  // Filter out dismissed alerts
  const alerts = useMemo(
    () => allAlerts.filter((a) => !dismissedIds.has(a.id)),
    [allAlerts, dismissedIds]
  )

  // Dismiss an alert for this session
  const dismissAlert = useCallback((alertId: string) => {
    setDismissedIds((prev) => new Set([...prev, alertId]))
  }, [])

  // Check in a client (marks am_done) and dismiss the alert
  const checkInClient = useCallback(
    async (alertId: string, clientId: string) => {
      const success = await toggleTouchpoint(clientId, "am_done")
      if (success) {
        setDismissedIds((prev) => new Set([...prev, alertId]))
      }
      return success
    },
    [toggleTouchpoint]
  )

  // Mark a milestone as celebrated and dismiss
  const celebrateMilestone = useCallback(
    async (alertId: string, clientId: string, programDay: number) => {
      const success = await updateClient(clientId, { last_celebrated_day: programDay })
      if (success) {
        setDismissedIds((prev) => new Set([...prev, alertId]))
      }
      return success
    },
    [updateClient]
  )

  const stats = useMemo(
    () => ({
      total: alerts.length,
      urgent: alerts.filter((a) => a.severity === "urgent").length,
      high: alerts.filter((a) => a.severity === "high").length,
      clientAlerts: alerts.filter((a) => a.entityType === "client").length,
      prospectAlerts: alerts.filter((a) => a.entityType === "prospect").length,
    }),
    [alerts]
  )

  return { alerts, stats, dismissAlert, checkInClient, celebrateMilestone }
}
