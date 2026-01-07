"use client"

import { useMemo } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  GraduationCap,
  ChevronRight,
  CheckCircle,
  BookOpen,
  Calendar,
  Clock,
  Users,
  Trophy,
  AlertCircle,
  Video,
  MessageSquare,
  Circle,
  Target,
  Bell,
} from "lucide-react"
import { useReminders } from "@/hooks/use-reminders"
import { useTrainingResources, meetsRankRequirement, type TrainingResource, type TrainingCategory } from "@/hooks/use-training-resources"
import { getProgramDay, getDayPhase } from "@/hooks/use-clients"
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
  toggleTouchpoint: (clientId: string, field: "am_done" | "pm_done") => void
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
  onCelebrateClick,
}: TodaysFocusProps) {
  const {
    resources,
    categories,
    isCompleted,
    progress,
    getCategoryProgress,
  } = useTrainingResources(user, userRank)

  const { reminders = [], completeReminder, isOverdue, isDueToday } = useReminders()

  // Get today's reminders (due today or overdue, not completed)
  const todaysReminders = reminders.filter(r => 
    !r.is_completed && (isDueToday?.(r) || isOverdue?.(r))
  ).slice(0, 3)

  const today = new Date().toISOString().split("T")[0]
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)
  const todayEnd = new Date()
  todayEnd.setHours(23, 59, 59, 999)

  // Get training recommendation
  const trainingRecommendation = useMemo(() => {
    if (!categories.length || !resources.length) return null

    const accessibleCategories = categories
      .filter(cat => cat.is_active && meetsRankRequirement(userRank, cat.required_rank))
      .sort((a, b) => a.sort_order - b.sort_order)

    for (const category of accessibleCategories) {
      const categoryResources = resources
        .filter(r => r.category === category.name)
        .sort((a, b) => a.sort_order - b.sort_order)

      const nextResource = categoryResources.find(r => !isCompleted(r.id))

      if (nextResource) {
        return {
          category,
          nextResource,
          categoryProgress: getCategoryProgress(category.name),
          overallProgress: progress,
        }
      }
    }
    return null
  }, [categories, resources, userRank, isCompleted, getCategoryProgress, progress])

  const isTrainingComplete = !trainingRecommendation && progress.total > 0 && progress.completed >= progress.total

  // Get clients needing touchpoints (limited)
  const clientsNeedingAction = clients
    .filter(c => c.status === "active" && needsAttention(c))
    .slice(0, 3)

  // Get HAs scheduled for today
  const haScheduledToday = prospects.filter(p => 
    p.ha_scheduled_at && 
    new Date(p.ha_scheduled_at) >= todayStart && 
    new Date(p.ha_scheduled_at) <= todayEnd
  ).slice(0, 3)

  // Get meetings today (already filtered by date in parent, use occurrence_date)
  const meetingsToday = upcomingMeetings.filter(m => {
    const meetingDate = new Date(m.occurrence_date)
    return meetingDate >= todayStart && meetingDate <= todayEnd
  }).slice(0, 3)

  // Get milestone clients
  const milestoneClients = clients.filter(c => {
    if (c.status !== "active") return false
    const day = getProgramDay(c.start_date)
    return [7, 14, 21, 30].includes(day)
  }).slice(0, 2)

  const hasActionItems = clientsNeedingAction.length > 0 || haScheduledToday.length > 0 || meetingsToday.length > 0 || milestoneClients.length > 0 || todaysReminders.length > 0

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
            Today's Focus
          </CardTitle>
          {!isTrainingComplete && progress.total > 0 && (
            <Badge variant="secondary" className="bg-white">
              Training: {progress.completed}/{progress.total}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-4">
        {/* Training Section */}
        {isTrainingComplete ? (
          <div className="flex items-center gap-3 p-3 bg-green-100 rounded-lg border border-green-200">
            <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-semibold text-green-800 text-sm">All Training Complete! 🎉</p>
              <p className="text-xs text-green-700">
                {progress.total} modules completed
              </p>
            </div>
            <Link href="/training">
              <Button variant="outline" size="sm" className="text-xs">
                Review
              </Button>
            </Link>
          </div>
        ) : trainingRecommendation ? (
          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-[hsl(var(--optavia-green))]" />
                <span className="text-sm font-medium text-gray-700">Continue Training</span>
              </div>
              <span className="text-xs text-[hsl(var(--optavia-green))] font-bold">
                {progress.percentage}%
              </span>
            </div>
            <Progress value={progress.percentage} className="h-1.5 mb-2" />
            <div className="flex items-center gap-2 p-2 bg-green-50 rounded border border-green-100">
              <span className="text-lg">{trainingRecommendation.category.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500">Up Next</p>
                <p className="text-sm font-medium text-gray-900 truncate">
                  {trainingRecommendation.nextResource.title}
                </p>
              </div>
              <Link href="/training">
                <Button size="sm" className="bg-[hsl(var(--optavia-green))] hover:bg-[hsl(var(--optavia-green-dark))] text-white text-xs">
                  Start
                  <ChevronRight className="h-3 w-3 ml-1" />
                </Button>
              </Link>
            </div>
          </div>
        ) : null}

        {/* Divider if we have both sections */}
        {(isTrainingComplete || trainingRecommendation) && (hasActionItems || !hasActionItems) && (
          <div className="border-t border-green-200" />
        )}

        {/* Today's Tasks Section */}
        {hasActionItems ? (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Today's Tasks</p>
            
            {/* HAs Scheduled Today */}
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
                <Link href="/prospect-tracker">
                  <Button size="sm" className="bg-purple-500 hover:bg-purple-600 text-white text-xs h-7">
                    View
                  </Button>
                </Link>
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
              const programDay = getProgramDay(client.start_date)
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
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toggleTouchpoint(client.id, "am_done")}
                    className={`h-7 text-xs px-3 ${client.am_done ? "bg-green-100 text-green-700 border-green-300" : "text-green-600 border-green-200"}`}
                  >
                    {client.am_done ? (
                      <>
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Done
                      </>
                    ) : (
                      "Check In"
                    )}
                  </Button>
                </div>
              )
            })}

            {/* Milestone Celebrations */}
            {milestoneClients.map(client => {
              const programDay = getProgramDay(client.start_date)
              const phase = getDayPhase(programDay)
              return (
                <div
                  key={`milestone-${client.id}`}
                  className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-yellow-200 animate-pulse"
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
                  <Button 
                    size="sm" 
                    className="bg-yellow-500 hover:bg-yellow-600 text-white text-xs h-7"
                    onClick={() => onCelebrateClick?.(client)}
                  >
                    🎉 Celebrate!
                  </Button>
                </div>
              )
            })}

            {/* Today's Reminders */}
            {todaysReminders.map(reminder => {
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
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => completeReminder?.(reminder.id)}
                    className="h-7 text-xs px-3 text-green-600 border-green-200 hover:bg-green-50"
                  >
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Done
                  </Button>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-4">
            <CheckCircle className="h-10 w-10 mx-auto mb-2 text-green-500" />
            <p className="font-medium text-green-700 text-sm">All caught up for today!</p>
            <p className="text-xs text-gray-500 mt-0.5">Great job staying on top of your business.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
