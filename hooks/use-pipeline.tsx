"use client"

import { useMemo } from "react"
import { useProspects, type Prospect } from "@/hooks/use-prospects"
import { useClients, type Client } from "@/hooks/use-clients"

export interface PipelineStage {
  id: string
  label: string
  color: string
  bgColor: string
  icon: string
  items: (Prospect | Client)[]
  count: number
}

export interface ActivityItem {
  id: string
  type: "prospect" | "client"
  name: string
  action: string
  timestamp: string
  status?: string
}

export interface PriorityItem {
  id: string
  type: "prospect" | "client"
  name: string
  reason: string
  link: string
  urgency: "high" | "medium" | "low"
}

export interface PipelineData {
  stages: PipelineStage[]
  recentActivity: ActivityItem[]
  priorityItems: PriorityItem[]
  totals: {
    prospects: number
    clients: number
    futureCoaches: number
  }
}

export function usePipeline() {
  const { prospects, stats: prospectStats, loading: prospectsLoading } = useProspects()
  const { clients, stats: clientStats, loading: clientsLoading } = useClients()

  const loading = prospectsLoading || clientsLoading

  // Build pipeline stages
  // Prospect flow: NEW → INTERESTED → HA_SCHEDULED → CLIENT WON
  // Client flow: CLIENT → GOAL ACHIEVED → FUTURE COACH → COACH LAUNCHED
  const stages = useMemo((): PipelineStage[] => {
    const newProspects = prospects.filter(p => p.status === "new")
    const interested = prospects.filter(p => p.status === "interested")
    const haScheduled = prospects.filter(p => p.status === "ha_scheduled")
    const clientWon = prospects.filter(p => p.status === "converted")
    const activeClients = clients.filter(c => c.status === "active")
    const goalAchieved = clients.filter(c => c.status === "goal_achieved")
    const futureCoaches = clients.filter(c => c.status === "future_coach")
    const coachLaunched = clients.filter(c => c.status === "coach_launched")

    return [
      {
        id: "new",
        label: "New",
        color: "#2196f3",
        bgColor: "#e3f2fd",
        icon: "🆕",
        items: newProspects,
        count: newProspects.length,
      },
      {
        id: "interested",
        label: "Interested",
        color: "#ff9800",
        bgColor: "#fff3e0",
        icon: "🔥",
        items: interested,
        count: interested.length,
      },
      {
        id: "ha_scheduled",
        label: "HA Scheduled",
        color: "#9c27b0",
        bgColor: "#f3e5f5",
        icon: "📅",
        items: haScheduled,
        count: haScheduled.length,
      },
      {
        id: "client_won",
        label: "Client Won",
        color: "#4caf50",
        bgColor: "#e8f5e9",
        icon: "🎉",
        items: clientWon,
        count: clientWon.length,
      },
      {
        id: "client",
        label: "Client",
        color: "#4caf50",
        bgColor: "#e8f5e9",
        icon: "⭐",
        items: activeClients,
        count: activeClients.length,
      },
      {
        id: "goal_achieved",
        label: "Goal Achieved",
        color: "#ff9800",
        bgColor: "#fff3e0",
        icon: "🏆",
        items: goalAchieved,
        count: goalAchieved.length,
      },
      {
        id: "future_coach",
        label: "Future Coach",
        color: "#9c27b0",
        bgColor: "#f3e5f5",
        icon: "💎",
        items: futureCoaches,
        count: futureCoaches.length,
      },
      {
        id: "coach_launched",
        label: "Coach Launched",
        color: "#e91e63",
        bgColor: "#fce4ec",
        icon: "🚀",
        items: coachLaunched,
        count: coachLaunched.length,
      },
    ]
  }, [prospects, clients])

  // Build recent activity (based on updated_at timestamps)
  const recentActivity = useMemo((): ActivityItem[] => {
    const activities: ActivityItem[] = []

    // Add prospect activities
    prospects.forEach(p => {
      if (p.updated_at) {
        activities.push({
          id: `prospect-${p.id}`,
          type: "prospect",
          name: p.label,
          action: getProspectAction(p.status),
          timestamp: p.updated_at,
          status: p.status,
        })
      }
    })

    // Add client activities
    clients.forEach(c => {
      if (c.updated_at) {
        activities.push({
          id: `client-${c.id}`,
          type: "client",
          name: c.label,
          action: getClientAction(c.status),
          timestamp: c.updated_at,
          status: c.status,
        })
      }
    })

    // Sort by timestamp (most recent first) and take top 10
    return activities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10)
  }, [prospects, clients])

  // Totals
  const totals = useMemo(() => ({
    prospects: prospectStats.total,
    clients: clientStats.active,
    futureCoaches: clientStats.futureCoach + clientStats.coachLaunched,
  }), [prospectStats, clientStats])

  // Priority items that need attention
  const priorityItems = useMemo((): PriorityItem[] => {
    const items: PriorityItem[] = []
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Check prospects for overdue follow-ups and upcoming HAs
    // Skip converted/coach prospects — they're now tracked as clients
    prospects.filter(p => !["converted", "coach"].includes(p.status)).forEach(p => {
      // Overdue follow-up - use next_action date
      if (p.next_action) {
        const followUpDate = new Date(p.next_action)
        followUpDate.setHours(0, 0, 0, 0)
        
        if (followUpDate < today) {
          items.push({
            id: `prospect-followup-${p.id}`,
            type: "prospect",
            name: p.label,
            reason: "Follow-up overdue",
            link: "/prospect-tracker",
            urgency: "high",
          })
        }
      }

      // HA scheduled today or soon
      if (p.status === "ha_scheduled" && p.ha_scheduled_at) {
        const haDate = new Date(p.ha_scheduled_at)
        haDate.setHours(0, 0, 0, 0)
        const diffDays = Math.floor((haDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
        
        if (diffDays === 0) {
          items.push({
            id: `prospect-ha-${p.id}`,
            type: "prospect",
            name: p.label,
            reason: "HA today!",
            link: "/prospect-tracker",
            urgency: "high",
          })
        } else if (diffDays > 0 && diffDays <= 3) {
          items.push({
            id: `prospect-ha-${p.id}`,
            type: "prospect",
            name: p.label,
            reason: `HA in ${diffDays} day${diffDays > 1 ? "s" : ""}`,
            link: "/prospect-tracker",
            urgency: "medium",
          })
        }
      }
    })

    // Check clients needing touchpoints
    clients.forEach(c => {
      if (c.status === "active" && c.last_touchpoint_date) {
        const lastContact = new Date(c.last_touchpoint_date)
        const daysSinceContact = Math.floor((today.getTime() - lastContact.getTime()) / (1000 * 60 * 60 * 24))
        
        if (daysSinceContact >= 7) {
          items.push({
            id: `client-touchpoint-${c.id}`,
            type: "client",
            name: c.label,
            reason: daysSinceContact >= 14 ? "Needs check-in!" : "Due for touchpoint",
            link: "/client-tracker",
            urgency: daysSinceContact >= 14 ? "high" : "medium",
          })
        }
      }
    })

    // Sort by urgency and return top 6
    return items
      .sort((a, b) => {
        const urgencyOrder = { high: 0, medium: 1, low: 2 }
        return urgencyOrder[a.urgency] - urgencyOrder[b.urgency]
      })
      .slice(0, 6)
  }, [prospects, clients])

  return {
    stages,
    recentActivity,
    priorityItems,
    totals,
    loading,
    prospects,
    clients,
  }
}

// Helper functions
function getProspectAction(status: string): string {
  switch (status) {
    case "new": return "Added to pipeline"
    case "interested": return "Showing interest"
    case "ha_scheduled": return "HA Scheduled"
    case "converted": return "Client won!"
    case "coach": return "Future coach"
    case "not_interested": return "Not interested (recycled)"
    case "not_closed": return "HA not closed (recycled)"
    default: return "Updated"
  }
}

function getClientAction(status: string): string {
  switch (status) {
    case "active": return "Active client"
    case "goal_achieved": return "Goal achieved!"
    case "future_coach": return "Future coach"
    case "coach_launched": return "Coach launched!"
    case "paused": return "Paused program"
    case "completed": return "Completed program"
    default: return "Updated"
  }
}
