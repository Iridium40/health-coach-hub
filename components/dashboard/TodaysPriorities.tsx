"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Calendar,
  Clock,
  Users,
  ChevronRight,
  CheckCircle,
  Circle,
  MessageSquare,
  Trophy,
  AlertCircle,
  Video,
  UserCircle,
} from "lucide-react"
import { getProgramDay, getDayPhase } from "@/hooks/use-clients"
import type { Prospect } from "@/hooks/use-prospects"
import type { ZoomCall } from "@/lib/types"

interface TodaysPrioritiesProps {
  clients: any[]
  prospects: Prospect[]
  upcomingMeetings: ZoomCall[]
  loadingMeetings: boolean
  needsAttention: (client: any) => boolean
  toggleTouchpoint: (clientId: string, field: "am_done" | "pm_done") => void
}

export function TodaysPriorities({
  clients,
  prospects,
  upcomingMeetings,
  loadingMeetings,
  needsAttention,
  toggleTouchpoint,
}: TodaysPrioritiesProps) {
  const today = new Date().toISOString().split("T")[0]

  // Get clients needing touchpoints (limited to 3)
  const clientsNeedingAction = clients
    .filter(c => c.status === "active" && needsAttention(c))
    .slice(0, 3)

  // Get overdue prospect follow-ups (limited to 2)
  const overdueProspects = prospects
    .filter(p => {
      if (!p.next_action || ["converted", "coach", "not_interested"].includes(p.status)) return false
      return new Date(p.next_action) < new Date(today)
    })
    .slice(0, 2)

  // Get milestone clients
  const milestoneClients = clients.filter(c => {
    if (c.status !== "active") return false
    const day = getProgramDay(c.start_date)
    return [7, 14, 21, 30].includes(day)
  }).slice(0, 2)

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

  // Format time helper
  const formatDateTime = (dateString: string, eventTimezone?: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)

    let dayStr = date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })
    if (date.toDateString() === now.toDateString()) dayStr = "Today"
    else if (date.toDateString() === tomorrow.toDateString()) dayStr = "Tomorrow"

    let timeStr = date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
    
    // Add timezone info for events with a specific timezone
    if (eventTimezone) {
      const originalTime = date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        timeZone: eventTimezone
      })
      const tzAbbrev = getTimezoneAbbrev(eventTimezone)
      
      const userTz = Intl.DateTimeFormat().resolvedOptions().timeZone
      if (userTz !== eventTimezone) {
        timeStr = `${timeStr} (${originalTime} ${tzAbbrev})`
      }
    }
    return { dayStr, timeStr }
  }

  const hasItems = clientsNeedingAction.length > 0 || overdueProspects.length > 0 || milestoneClients.length > 0 || upcomingMeetings.length > 0

  if (!hasItems && !loadingMeetings) {
    return (
      <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
        <CardContent className="py-8 text-center">
          <CheckCircle className="h-12 w-12 mx-auto mb-3 text-green-500" />
          <p className="font-medium text-green-700">All caught up for today!</p>
          <p className="text-sm text-gray-500 mt-1">Great job staying on top of your business.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2 text-optavia-dark">
          <AlertCircle className="h-5 w-5 text-orange-500" />
          Today's Priorities
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* Milestone Celebrations */}
          {milestoneClients.map(client => {
            const programDay = getProgramDay(client.start_date)
            const phase = getDayPhase(programDay)
            return (
              <div
                key={`milestone-${client.id}`}
                className="flex items-center justify-between p-3 bg-white rounded-lg border border-green-200"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                    <Trophy className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <div className="font-medium text-sm text-gray-900">{client.label}</div>
                    <div className="text-xs text-green-600 font-medium">{phase.label}</div>
                  </div>
                </div>
                <Link href="/client-tracker">
                  <Button size="sm" className="bg-green-500 hover:bg-green-600 text-white">
                    <MessageSquare className="h-3 w-3 mr-1" />
                    Celebrate
                  </Button>
                </Link>
              </div>
            )
          })}

          {/* Clients Needing Touchpoints */}
          {clientsNeedingAction.map(client => {
            const programDay = getProgramDay(client.start_date)
            const phase = getDayPhase(programDay)
            return (
              <div
                key={client.id}
                className="flex items-center justify-between p-3 bg-white rounded-lg border border-orange-200"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-lg flex flex-col items-center justify-center text-xs font-bold"
                    style={{ backgroundColor: phase.bg, color: phase.color }}
                  >
                    <span className="text-[8px]">DAY</span>
                    <span>{programDay}</span>
                  </div>
                  <div>
                    <div className="font-medium text-sm text-gray-900">{client.label}</div>
                    <div className="text-xs text-gray-500">Needs check-in</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toggleTouchpoint(client.id, "am_done")}
                    className={client.am_done ? "bg-green-100 text-green-700" : ""}
                  >
                    {client.am_done ? <CheckCircle className="h-3 w-3 mr-1" /> : <Circle className="h-3 w-3 mr-1" />}
                    AM
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toggleTouchpoint(client.id, "pm_done")}
                    className={client.pm_done ? "bg-green-100 text-green-700" : ""}
                  >
                    {client.pm_done ? <CheckCircle className="h-3 w-3 mr-1" /> : <Circle className="h-3 w-3 mr-1" />}
                    PM
                  </Button>
                </div>
              </div>
            )
          })}

          {/* Overdue Prospect Follow-ups */}
          {overdueProspects.map(prospect => (
            <div
              key={`prospect-${prospect.id}`}
              className="flex items-center justify-between p-3 bg-white rounded-lg border border-red-200"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-red-500" />
                </div>
                <div>
                  <div className="font-medium text-sm text-gray-900">{prospect.label}</div>
                  <div className="text-xs text-red-500">Overdue follow-up</div>
                </div>
              </div>
              <Link href="/prospect-tracker">
                <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
                  Follow Up
                </Button>
              </Link>
            </div>
          ))}

          {/* Today's Meetings */}
          {upcomingMeetings.slice(0, 2).map(meeting => {
            const { dayStr, timeStr } = formatDateTime(meeting.scheduled_at, meeting.timezone)
            return (
              <div
                key={meeting.id}
                className={`flex items-center justify-between p-3 bg-white rounded-lg border ${
                  meeting.status === "live" ? "border-red-300" : "border-blue-200"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    meeting.status === "live" ? "bg-red-100" : "bg-blue-100"
                  }`}>
                    <Video className={`h-5 w-5 ${meeting.status === "live" ? "text-red-500" : "text-blue-500"}`} />
                  </div>
                  <div>
                    <div className="font-medium text-sm text-gray-900 line-clamp-1">{meeting.title}</div>
                    <div className="text-xs text-gray-500">{timeStr}</div>
                  </div>
                </div>
                {meeting.zoom_link && (
                  <Button
                    asChild
                    size="sm"
                    className={meeting.status === "live" ? "bg-red-500 hover:bg-red-600 text-white" : "bg-blue-600 hover:bg-blue-700 text-white"}
                  >
                    <a href={meeting.zoom_link} target="_blank" rel="noopener noreferrer">
                      {meeting.status === "live" ? "Join Now" : "Join"}
                    </a>
                  </Button>
                )}
              </div>
            )
          })}

          {/* View All Links */}
          <div className="flex gap-2 pt-2">
            {clientsNeedingAction.length > 0 && (
              <Link href="/client-tracker" className="flex-1">
                <Button variant="outline" size="sm" className="w-full text-xs">
                  All Clients <ChevronRight className="h-3 w-3 ml-1" />
                </Button>
              </Link>
            )}
            {overdueProspects.length > 0 && (
              <Link href="/prospect-tracker" className="flex-1">
                <Button variant="outline" size="sm" className="w-full text-xs">
                  All Prospects <ChevronRight className="h-3 w-3 ml-1" />
                </Button>
              </Link>
            )}
            {upcomingMeetings.length > 0 && (
              <Link href="/calendar" className="flex-1">
                <Button variant="outline" size="sm" className="w-full text-xs">
                  Calendar <ChevronRight className="h-3 w-3 ml-1" />
                </Button>
              </Link>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
