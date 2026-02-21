"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  CheckCircle,
  Calendar,
  Clock,
  Users,
  Trophy,
  Video,
  Target,
  Bell,
  AlertTriangle,
  UserPlus,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { useReminders } from "@/hooks/use-reminders"
import { getDayPhase } from "@/hooks/use-clients"
import type { User } from "@supabase/supabase-js"
import type { Prospect } from "@/hooks/use-prospects"
import type { ZoomCall } from "@/lib/types"
import type { ExpandedZoomCall } from "@/lib/expand-recurring-events"

interface TodaysFocusProps {
  user: User | null
  userRank: string | null
  isNewCoach?: boolean
  clients: any[]
  prospects: Prospect[]
  upcomingMeetings: ExpandedZoomCall[]
  loadingMeetings: boolean
  needsAttention: (client: any) => boolean
  toggleTouchpoint: (clientId: string, field: "am_done" | "pm_done") => Promise<boolean> | void
  completeClientCheckIn?: (client: any) => Promise<void> | void
  logProspectFollowUp?: (prospect: any, daysUntilNext?: number) => Promise<void> | void
  completeHA?: (prospect: any) => Promise<void> | void
  dismissMilestone?: (clientId: string, programDay: number) => void
  isMilestoneDismissed?: (clientId: string, programDay: number) => boolean
  onCelebrateClick?: (client: any) => void
}

export function TodaysFocus({
  user,
  userRank,
  isNewCoach,
  clients,
  prospects,
  upcomingMeetings,
  loadingMeetings,
  needsAttention,
  toggleTouchpoint,
  completeClientCheckIn,
  logProspectFollowUp,
  completeHA,
  dismissMilestone,
  isMilestoneDismissed,
  onCelebrateClick,
}: TodaysFocusProps) {
  const { reminders = [], completeReminder, isOverdue, isDueToday } = useReminders()

  // Day offset: 0 = today, -1 = yesterday, +1 = tomorrow, etc.
  const [dayOffset, setDayOffset] = useState(0)
  const isToday = dayOffset === 0

  const now = new Date()
  const actualToday = new Date().toISOString().split("T")[0]

  // Compute the selected date based on offset
  const selectedDate = useMemo(() => {
    const d = new Date()
    d.setDate(d.getDate() + dayOffset)
    return d
  }, [dayOffset])

  const viewDateStr = useMemo(() => {
    const d = new Date(selectedDate)
    return d.toISOString().split("T")[0]
  }, [selectedDate])

  const viewStart = useMemo(() => {
    const d = new Date(selectedDate)
    d.setHours(0, 0, 0, 0)
    return d
  }, [selectedDate])

  const viewEnd = useMemo(() => {
    const d = new Date(selectedDate)
    d.setHours(23, 59, 59, 999)
    return d
  }, [selectedDate])

  // For today only: hide events that ended 30+ min ago
  const pastCutoff = useMemo(() => {
    if (!isToday) return viewStart
    return new Date(now.getTime() - 30 * 60 * 1000)
  }, [isToday, viewStart, now])

  // Helper: get program day for a client on the viewed date
  const getProgramDayForDate = (startDate: string) => {
    const start = new Date(startDate + "T00:00:00")
    const target = new Date(viewStart)
    const diffTime = target.getTime() - start.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
    return Math.max(1, diffDays)
  }

  const formatDateLabel = () => {
    if (dayOffset === 0) return "Today"
    if (dayOffset === -1) return "Yesterday"
    if (dayOffset === 1) return "Tomorrow"
    return selectedDate.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })
  }

  // Reminders for the viewed date
  const viewReminders = useMemo(() => {
    if (isToday) {
      return reminders.filter(r =>
        !r.is_completed && (isDueToday?.(r) || isOverdue?.(r))
      ).slice(0, 3)
    }
    return reminders.filter(r => {
      if (r.is_completed) return false
      if (!r.due_date) return false
      return r.due_date <= viewDateStr
    }).slice(0, 3)
  }, [reminders, isToday, isDueToday, isOverdue, viewDateStr])


  // Critical phase clients (Days 1-3) — need daily contact
  const criticalPhaseClients = useMemo(() =>
    clients.filter(c => {
      if (c.status !== "active") return false
      const programDay = getProgramDayForDate(c.start_date)
      if (programDay < 1 || programDay > 3) return false
      if (isToday) {
        const alreadyCheckedIn = c.last_touchpoint_date === viewDateStr && c.am_done
        return !alreadyCheckedIn
      }
      return true
    }).slice(0, 3),
    [clients, viewDateStr, isToday, viewStart]
  )

  // IDs of critical-phase clients so we can exclude them from the general check-in list
  const criticalIds = useMemo(() => new Set(criticalPhaseClients.map(c => c.id)), [criticalPhaseClients])

  // Clients needing touchpoints (exclude critical-phase ones shown separately)
  const clientsNeedingAction = useMemo(() => {
    if (!isToday) return []
    return clients
      .filter(c => c.status === "active" && needsAttention(c) && !criticalIds.has(c.id))
      .slice(0, 3)
  }, [clients, needsAttention, criticalIds, isToday])

  // Clients with 5-9 day check-in gap
  const clientsGapWarning = useMemo(() => {
    if (!isToday) return []
    return clients.filter(c => {
      if (c.status !== "active") return false
      if (criticalIds.has(c.id)) return false
      if (c.last_touchpoint_date === viewDateStr && c.am_done) return false
      if (!c.last_touchpoint_date) return false
      const lastCheckIn = new Date(c.last_touchpoint_date)
      const daysSince = Math.floor((now.getTime() - lastCheckIn.getTime()) / (1000 * 60 * 60 * 24))
      return daysSince >= 5 && daysSince < 10
    }).slice(0, 3)
  }, [clients, viewDateStr, now, criticalIds, isToday])

  // HAs scheduled for the viewed day
  const haScheduledToday = useMemo(() =>
    prospects.filter(p => {
      if (!p.ha_scheduled_at) return false
      const haTime = new Date(p.ha_scheduled_at)
      const haEndTime = new Date(haTime.getTime() + 45 * 60 * 1000)
      return haTime >= viewStart && haTime <= viewEnd && (isToday ? haEndTime > pastCutoff : true)
    }).slice(0, 3),
    [prospects, viewStart, viewEnd, pastCutoff, isToday]
  )

  // Overdue HAs (scheduled before the viewed day)
  const overdueHAs = useMemo(() =>
    prospects.filter(p => {
      if (!p.ha_scheduled_at) return false
      if (["converted", "coach", "not_interested", "not_closed"].includes(p.status)) return false
      const haTime = new Date(p.ha_scheduled_at)
      return haTime < viewStart
    }).slice(0, 2),
    [prospects, viewStart]
  )

  // Meetings on the viewed day
  const meetingsToday = useMemo(() =>
    upcomingMeetings.filter(m => {
      const meetingDate = new Date(m.occurrence_date)
      const duration = m.duration_minutes || 60
      const meetingEndTime = new Date(meetingDate.getTime() + duration * 60 * 1000)
      return meetingDate >= viewStart && meetingDate <= viewEnd && (isToday ? meetingEndTime > pastCutoff : true)
    }).slice(0, 3),
    [upcomingMeetings, viewStart, viewEnd, pastCutoff, isToday]
  )

  // Milestone clients for the viewed day
  const milestoneClients = useMemo(() =>
    clients.filter(c => {
      if (c.status !== "active") return false
      const day = getProgramDayForDate(c.start_date)
      if (![7, 14, 21, 30].includes(day)) return false
      if (isToday && isMilestoneDismissed?.(c.id, day)) return false
      return true
    }).slice(0, 2),
    [clients, isMilestoneDismissed, viewStart, isToday]
  )

  // Follow-ups due on or before the viewed date
  const overdueProspects = useMemo(() =>
    prospects
      .filter(p => {
        if (!p.next_action || ["converted", "coach", "not_interested", "not_closed"].includes(p.status)) return false
        return new Date(p.next_action) <= new Date(viewDateStr)
      })
      .slice(0, 2),
    [prospects, viewDateStr]
  )

  // Stale prospects (only on today view — these are cumulative alerts, not date-specific)
  const staleProspects = useMemo(() => {
    if (!isToday) return []
    return prospects.filter(p => {
      if (["converted", "coach", "not_interested", "not_closed"].includes(p.status)) return false
      if (p.last_action) {
        const lastAction = new Date(p.last_action)
        const daysSince = Math.floor((now.getTime() - lastAction.getTime()) / (1000 * 60 * 60 * 24))
        return daysSince >= 7
      }
      const created = new Date(p.created_at)
      const daysSince = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24))
      return daysSince >= 3
    })
    .filter(p => !overdueProspects.some(op => op.id === p.id))
    .slice(0, 2)
  }, [prospects, now, overdueProspects, isToday])

  const hasActionItems =
    criticalPhaseClients.length > 0 ||
    clientsNeedingAction.length > 0 ||
    clientsGapWarning.length > 0 ||
    haScheduledToday.length > 0 ||
    overdueHAs.length > 0 ||
    meetingsToday.length > 0 ||
    milestoneClients.length > 0 ||
    overdueProspects.length > 0 ||
    staleProspects.length > 0 ||
    viewReminders.length > 0

  // Confirmation dialogs (prevents accidental clears)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [confirmKind, setConfirmKind] = useState<"client_checkin" | "prospect_followup" | "ha_complete" | null>(null)
  const [confirmClient, setConfirmClient] = useState<any | null>(null)
  const [confirmProspect, setConfirmProspect] = useState<any | null>(null)

  const openConfirmClient = (client: any) => {
    setConfirmKind("client_checkin")
    setConfirmClient(client)
    setConfirmProspect(null)
    setConfirmOpen(true)
  }

  const openConfirmProspect = (prospect: any) => {
    setConfirmKind("prospect_followup")
    setConfirmProspect(prospect)
    setConfirmClient(null)
    setConfirmOpen(true)
  }

  const openConfirmHA = (prospect: any) => {
    setConfirmKind("ha_complete")
    setConfirmProspect(prospect)
    setConfirmClient(null)
    setConfirmOpen(true)
  }

  const runConfirmAction = async () => {
    if (confirmKind === "client_checkin" && confirmClient) {
      if (completeClientCheckIn) {
        await completeClientCheckIn(confirmClient)
      } else {
        await toggleTouchpoint(confirmClient.id, "am_done")
      }
    }
    if (confirmKind === "prospect_followup" && confirmProspect) {
      await logProspectFollowUp?.(confirmProspect, 3)
    }
    if (confirmKind === "ha_complete" && confirmProspect) {
      await completeHA?.(confirmProspect)
    }
    setConfirmOpen(false)
    setConfirmKind(null)
    setConfirmClient(null)
    setConfirmProspect(null)
  }

  // Get timezone abbreviation
  const getTimezoneAbbrev = (timezone: string): string => {
    const abbrevMap: Record<string, string> = {
      'America/New_York': 'ET',
      'America/Chicago': 'CT',
      'America/Denver': 'MT',
      'America/Los_Angeles': 'PT',
    }
    return abbrevMap[timezone] || timezone
  }

  const formatTime = (dateString: string, eventTimezone?: string) => {
    const date = new Date(dateString)
    const localTime = date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
    
    // For events with a specific timezone, show both local and original time
    if (eventTimezone) {
      const originalTime = date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        timeZone: eventTimezone
      })
      const tzAbbrev = getTimezoneAbbrev(eventTimezone)
      
      const userTz = Intl.DateTimeFormat().resolvedOptions().timeZone
      if (userTz !== eventTimezone) {
        return `${localTime} (${originalTime} ${tzAbbrev})`
      }
    }
    
    return localTime
  }

  return (
    <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-[hsl(var(--optavia-green))] shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl flex items-center gap-2 text-optavia-dark">
            <Target className="h-5 w-5 text-[hsl(var(--optavia-green))]" />
            {isToday ? "Today's Focus" : "Focus"}
          </CardTitle>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setDayOffset(o => o - 1)}
              className="p-1.5 rounded-lg hover:bg-white/60 text-gray-500 hover:text-gray-800 transition-colors"
              title="Previous day"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => setDayOffset(0)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                isToday
                  ? "bg-[hsl(var(--optavia-green))]/10 text-[hsl(var(--optavia-green))]"
                  : "bg-white/60 text-gray-700 hover:bg-white/80"
              }`}
            >
              {formatDateLabel()}
            </button>
            <button
              onClick={() => setDayOffset(o => o + 1)}
              className="p-1.5 rounded-lg hover:bg-white/60 text-gray-500 hover:text-gray-800 transition-colors"
              title="Next day"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-4">
        {/* Today's Tasks Section */}
        {hasActionItems ? (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              {isToday ? "Today's Tasks" : `${formatDateLabel()}'s Tasks`}
            </p>

            {/* Critical Phase Clients (Days 1-3) — Most Urgent */}
            {criticalPhaseClients.map(client => {
              const programDay = getProgramDayForDate(client.start_date)
              return (
                <div
                  key={`critical-${client.id}`}
                  className="flex items-center justify-between p-2.5 bg-white rounded-lg border-2 border-red-300"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                    </div>
                    <div>
                      <div className="font-medium text-sm text-gray-900">{client.label}</div>
                      <div className="text-xs text-red-600 font-medium">
                        Day {programDay} — Daily support needed
                      </div>
                    </div>
                  </div>
                  {isToday && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openConfirmClient(client)}
                      className="h-7 text-xs px-3 text-green-600 border-green-200"
                    >
                      Mark Done
                    </Button>
                  )}
                </div>
              )
            })}

            {/* HAs Scheduled */}
            {haScheduledToday.map(prospect => (
              <div
                key={`ha-${prospect.id}`}
                className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-purple-200"
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                    <Calendar className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <div className="font-medium text-sm text-gray-900">{prospect.label}</div>
                    <div className="text-xs text-purple-600">
                      HA at {formatTime(prospect.ha_scheduled_at!)}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  {isToday && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openConfirmHA(prospect)}
                      className="h-7 text-xs px-3 text-green-600 border-green-200 hover:bg-green-50"
                    >
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Done
                    </Button>
                  )}
                  <Link href="/prospect-tracker">
                    <Button size="sm" variant="outline" className="h-7 text-xs px-3 text-purple-600 border-purple-200 hover:bg-purple-50">
                      View
                    </Button>
                  </Link>
                </div>
              </div>
            ))}

            {/* Overdue Health Assessments */}
            {overdueHAs.map(prospect => (
              <div
                key={`ha-overdue-${prospect.id}`}
                className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-red-200"
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
                    <Calendar className="h-4 w-4 text-red-600" />
                  </div>
                  <div>
                    <div className="font-medium text-sm text-gray-900">{prospect.label}</div>
                    <div className="text-xs text-red-600">Overdue HA — Follow up on results</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  {isToday && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openConfirmHA(prospect)}
                      className="h-7 text-xs px-3 text-green-600 border-green-200 hover:bg-green-50"
                    >
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Done
                    </Button>
                  )}
                  <Link href="/prospect-tracker">
                    <Button size="sm" variant="outline" className="h-7 text-xs px-3 text-red-600 border-red-200 hover:bg-red-50">
                      View
                    </Button>
                  </Link>
                </div>
              </div>
            ))}

            {/* Meetings Today */}
            {meetingsToday.map((meeting, idx) => (
              <div
                key={`${meeting.id}-${idx}`}
                className={`flex items-center justify-between p-2.5 bg-white rounded-lg border ${
                  meeting.status === "live" ? "border-red-300" : "border-blue-200"
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    meeting.status === "live" ? "bg-red-100" : "bg-blue-100"
                  }`}>
                    <Video className={`h-4 w-4 ${meeting.status === "live" ? "text-red-500" : "text-blue-500"}`} />
                  </div>
                  <div>
                    <div className="font-medium text-sm text-gray-900 line-clamp-1">
                      {meeting.title}
                      {meeting.is_occurrence && <span className="text-xs text-gray-400 ml-1">(recurring)</span>}
                    </div>
                    <div className="text-xs text-gray-500">{formatTime(meeting.occurrence_date, meeting.timezone)}</div>
                  </div>
                </div>
                {meeting.zoom_link && (
                  <Button
                    asChild
                    size="sm"
                    className={`text-xs h-7 ${meeting.status === "live" ? "bg-red-500 hover:bg-red-600" : "bg-blue-600 hover:bg-blue-700"} text-white`}
                  >
                    <a href={meeting.zoom_link} target="_blank" rel="noopener noreferrer">
                      {meeting.status === "live" ? "Join Now" : "Join"}
                    </a>
                  </Button>
                )}
              </div>
            ))}

            {/* Client Check-ins */}
            {clientsNeedingAction.map(client => {
              const programDay = getProgramDayForDate(client.start_date)
              const phase = getDayPhase(programDay)
              return (
                <div
                  key={client.id}
                  className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-orange-200"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-8 h-8 rounded-lg flex flex-col items-center justify-center text-xs font-bold"
                      style={{ backgroundColor: phase.bg, color: phase.color }}
                    >
                      <span className="text-[7px]">D</span>
                      <span className="text-xs -mt-0.5">{programDay}</span>
                    </div>
                    <div>
                      <div className="font-medium text-sm text-gray-900">{client.label}</div>
                      <div className="text-xs text-orange-600">Check-in needed</div>
                    </div>
                  </div>
                  {isToday && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openConfirmClient(client)}
                      className={`h-7 text-xs px-3 ${client.am_done ? "bg-green-100 text-green-700 border-green-300" : "text-green-600 border-green-200"}`}
                    >
                      {client.am_done ? (
                        <>
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Done
                        </>
                      ) : (
                        "Mark Done"
                      )}
                    </Button>
                  )}
                </div>
              )
            })}

            {/* Clients with 5-9 Day Gap */}
            {clientsGapWarning.map(client => {
              const programDay = getProgramDayForDate(client.start_date)
              const phase = getDayPhase(programDay)
              const daysSince = client.last_touchpoint_date
                ? Math.floor((now.getTime() - new Date(client.last_touchpoint_date).getTime()) / (1000 * 60 * 60 * 24))
                : 0
              return (
                <div
                  key={`gap-${client.id}`}
                  className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-amber-200"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-8 h-8 rounded-lg flex flex-col items-center justify-center text-xs font-bold"
                      style={{ backgroundColor: phase.bg, color: phase.color }}
                    >
                      <span className="text-[7px]">D</span>
                      <span className="text-xs -mt-0.5">{programDay}</span>
                    </div>
                    <div>
                      <div className="font-medium text-sm text-gray-900">{client.label}</div>
                      <div className="text-xs text-amber-600">{daysSince} days since last check-in</div>
                    </div>
                  </div>
                  {isToday && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openConfirmClient(client)}
                      className="h-7 text-xs px-3 text-green-600 border-green-200"
                    >
                      Mark Done
                    </Button>
                  )}
                </div>
              )
            })}

            {/* Overdue Prospect Follow-ups */}
            {overdueProspects.map(prospect => (
              <div
                key={`overdue-${prospect.id}`}
                className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-red-200"
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
                    <Clock className="h-4 w-4 text-red-600" />
                  </div>
                  <div>
                    <div className="font-medium text-sm text-gray-900">{prospect.label}</div>
                    <div className="text-xs text-red-600">
                      {prospect.next_action === viewDateStr ? "Follow-up due" : "Overdue follow-up"}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  {isToday && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openConfirmProspect(prospect)}
                      className="h-7 text-xs px-3 text-green-700 border-green-200 hover:bg-green-50"
                    >
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Done
                    </Button>
                  )}
                  <Link href="/prospect-tracker">
                    <Button size="sm" variant="outline" className="h-7 text-xs px-3 text-red-600 border-red-200 hover:bg-red-50">
                      View
                    </Button>
                  </Link>
                </div>
              </div>
            ))}

            {/* Stale Prospects */}
            {staleProspects.map(prospect => {
              const lastAction = prospect.last_action ? new Date(prospect.last_action) : null
              const daysSince = lastAction
                ? Math.floor((now.getTime() - lastAction.getTime()) / (1000 * 60 * 60 * 24))
                : Math.floor((now.getTime() - new Date(prospect.created_at).getTime()) / (1000 * 60 * 60 * 24))
              return (
                <div
                  key={`stale-${prospect.id}`}
                  className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-amber-200"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                      <UserPlus className="h-4 w-4 text-amber-600" />
                    </div>
                    <div>
                      <div className="font-medium text-sm text-gray-900">{prospect.label}</div>
                      <div className="text-xs text-amber-600">
                        {lastAction ? `${daysSince} days without action` : "No outreach yet"}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {isToday && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openConfirmProspect(prospect)}
                        className="h-7 text-xs px-3 text-green-600 border-green-200 hover:bg-green-50"
                      >
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Done
                      </Button>
                    )}
                    <Link href="/prospect-tracker">
                      <Button size="sm" variant="outline" className="h-7 text-xs px-3 text-amber-600 border-amber-200 hover:bg-amber-50">
                        View
                      </Button>
                    </Link>
                  </div>
                </div>
              )
            })}

            {/* Milestone Celebrations */}
            {milestoneClients.map(client => {
              const programDay = getProgramDayForDate(client.start_date)
              const phase = getDayPhase(programDay)
              return (
                <div
                  key={`milestone-${client.id}`}
                  className={`flex items-center justify-between p-2.5 bg-white rounded-lg border border-yellow-200 ${isToday ? "animate-pulse" : ""}`}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-yellow-100 flex items-center justify-center">
                      <Trophy className="h-4 w-4 text-yellow-600" />
                    </div>
                    <div>
                      <div className="font-medium text-sm text-gray-900">{client.label}</div>
                      <div className="text-xs text-yellow-600">{phase.label}</div>
                    </div>
                  </div>
                  {isToday ? (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs h-7 px-3"
                        onClick={() => {
                          dismissMilestone?.(client.id, programDay)
                        }}
                      >
                        Dismiss
                      </Button>
                      <Button 
                        size="sm" 
                        className="bg-yellow-500 hover:bg-yellow-600 text-white text-xs h-7"
                        onClick={() => {
                          dismissMilestone?.(client.id, programDay)
                          onCelebrateClick?.(client)
                        }}
                      >
                        🎉 Celebrate!
                      </Button>
                    </div>
                  ) : (
                    <span className="text-xs text-yellow-600 font-medium px-2">🎉 Milestone</span>
                  )}
                </div>
              )
            })}

            {/* Reminders */}
            {viewReminders.map(reminder => {
              const reminderIsOverdue = isOverdue?.(reminder)
              return (
                <div
                  key={`reminder-${reminder.id}`}
                  className={`flex items-center justify-between p-2.5 bg-white rounded-lg border ${
                    reminderIsOverdue ? "border-red-200" : "border-amber-200"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      reminderIsOverdue ? "bg-red-100" : "bg-amber-100"
                    }`}>
                      <Bell className={`h-4 w-4 ${reminderIsOverdue ? "text-red-600" : "text-amber-600"}`} />
                    </div>
                    <div>
                      <div className="font-medium text-sm text-gray-900">{reminder.title}</div>
                      <div className={`text-xs ${reminderIsOverdue ? "text-red-600" : "text-amber-600"}`}>
                        {reminderIsOverdue ? "Overdue" : "Due today"}
                        {reminder.entity_name && ` • ${reminder.entity_name}`}
                      </div>
                    </div>
                  </div>
                  {isToday && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => completeReminder?.(reminder.id)}
                      className="h-7 text-xs px-3 text-green-600 border-green-200 hover:bg-green-50"
                    >
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Done
                    </Button>
                  )}
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-4">
            <CheckCircle className="h-10 w-10 mx-auto mb-2 text-green-500" />
            <p className="font-medium text-green-700 text-sm">
              {isToday ? "All caught up for today!" : `Nothing scheduled for ${formatDateLabel().toLowerCase()}.`}
            </p>
            {isToday && (
              <p className="text-xs text-gray-500 mt-0.5">Great job staying on top of your business.</p>
            )}
          </div>
        )}

        {/* Confirm dialogs */}
        <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {confirmKind === "client_checkin"
                  ? "Confirm touchpoint"
                  : confirmKind === "ha_complete"
                    ? "Confirm Health Assessment"
                    : "Confirm follow-up"}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {confirmKind === "client_checkin" && confirmClient
                  ? `Mark today's check-in as done for "${confirmClient.label}"? This will clear it from your dashboard tasks.`
                  : confirmKind === "ha_complete" && confirmProspect
                    ? `Mark the Health Assessment as completed for "${confirmProspect.label}"? This will clear the HA notification.`
                    : confirmKind === "prospect_followup" && confirmProspect
                      ? `Confirm you've followed up with "${confirmProspect.label}"? We'll move their next follow-up out a few days.`
                      : "Confirm this action?"}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => { void runConfirmAction() }}>
                Confirm
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  )
}
