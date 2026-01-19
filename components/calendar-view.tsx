"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  ChevronLeft, ChevronRight, Calendar as CalendarIcon, 
  Video, Clock, Users, UserCircle, ExternalLink, Copy, Check,
  Grid3X3, List, Share2
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"
import { useIsMobile } from "@/hooks/use-mobile"
import { AddToCalendar } from "@/components/add-to-calendar"
import { expandRecurringEvents, type ExpandedZoomCall } from "@/lib/expand-recurring-events"
import type { ZoomCall } from "@/lib/types"

type ViewMode = "month" | "week"

export function CalendarView() {
  const { user } = useAuth()
  const { toast } = useToast()
  const isMobile = useIsMobile()
  const [expandedCalls, setExpandedCalls] = useState<ExpandedZoomCall[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<ViewMode>("week") // Default to week for better mobile UX
  const [currentDate, setCurrentDate] = useState(new Date())
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [sharedId, setSharedId] = useState<string | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<ExpandedZoomCall | null>(null)
  const supabase = createClient()

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }
    loadZoomCalls()
  }, [user, viewMode, currentDate])

  const loadZoomCalls = async () => {
    // Fetch only the window we need + recurring templates (huge perf win vs loading the whole table)
    const start = new Date(currentDate)
    const end = new Date(currentDate)

    if (viewMode === "week") {
      // 1 week back, 3 weeks forward
      start.setDate(start.getDate() - 7)
      end.setDate(end.getDate() + 21)
    } else {
      // Month view: from week before month to week after month
      start.setDate(1)
      start.setMonth(start.getMonth(), 1)
      start.setHours(0, 0, 0, 0)
      start.setDate(start.getDate() - 7)

      end.setMonth(end.getMonth() + 1, 0) // last day of current month
      end.setHours(23, 59, 59, 999)
      end.setDate(end.getDate() + 7)
    }

    const startIso = start.toISOString()
    const endIso = end.toISOString()

    const { data, error } = await supabase
      .from("zoom_calls")
      .select("id,title,description,call_type,scheduled_at,duration_minutes,timezone,is_recurring,recurrence_pattern,recurrence_day,recurrence_end_date,zoom_link,zoom_meeting_id,zoom_passcode,recording_url,recording_platform,recording_available_at,status,created_at,updated_at")
      .in("status", ["upcoming", "live", "completed"])
      // Include recurring templates regardless of scheduled_at, and non-recurring calls inside the window.
      .or(`is_recurring.eq.true,and(scheduled_at.gte.${startIso},scheduled_at.lte.${endIso})`)
      .order("scheduled_at", { ascending: true })

    if (!error && data) {
      // Expand recurring events into individual occurrences
      const expanded = expandRecurringEvents(data, { rangeStart: start, rangeEnd: end })
      setExpandedCalls(expanded)
    }
    setLoading(false)
  }

  const handleCopyLink = async (link: string, id: string) => {
    await navigator.clipboard.writeText(link)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
    toast({
      title: "Copied!",
      description: "Zoom link copied to clipboard",
    })
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

  // Format time with timezone awareness
  const formatEventTime = (dateString: string, eventTimezone?: string) => {
    const date = new Date(dateString)
    const localTime = date.toLocaleTimeString(undefined, {
      hour: 'numeric',
      minute: '2-digit'
    })
    
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

  const handleShareWithClients = async (event: ExpandedZoomCall) => {
    const eventDate = new Date(event.occurrence_date)
    const dateStr = eventDate.toLocaleDateString(undefined, {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    })
    
    // Get time in the event's timezone if specified
    let timeStr = eventDate.toLocaleTimeString(undefined, {
      hour: 'numeric',
      minute: '2-digit'
    })
    
    if (event.timezone) {
      const eventTimeStr = eventDate.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        timeZone: event.timezone
      })
      const tzAbbrev = getTimezoneAbbrev(event.timezone)
      timeStr = `${eventTimeStr} ${tzAbbrev}`
    }

    let shareText = `📅 ${event.title}\n\n`
    shareText += `🗓 ${dateStr}\n`
    shareText += `⏰ ${timeStr}`
    if (event.duration_minutes) {
      shareText += ` (${event.duration_minutes} min)`
    }
    shareText += `\n`
    
    if (event.description) {
      shareText += `\n${event.description}\n`
    }
    
    if (event.zoom_link) {
      shareText += `\n🔗 Join here: ${event.zoom_link}\n`
    }
    
    if (event.zoom_meeting_id) {
      shareText += `\nMeeting ID: ${event.zoom_meeting_id}`
    }
    if (event.zoom_passcode) {
      shareText += `\nPasscode: ${event.zoom_passcode}`
    }
    
    shareText += `\n\nLooking forward to seeing you there! 💚`

    await navigator.clipboard.writeText(shareText)
    setSharedId(event.id)
    setTimeout(() => setSharedId(null), 2000)
    toast({
      title: "Meeting Details Copied!",
      description: "Share this with your clients via text, email, or social media",
    })
  }

  // Calendar navigation
  const navigatePrevious = () => {
    const newDate = new Date(currentDate)
    if (viewMode === "month") {
      newDate.setMonth(newDate.getMonth() - 1)
    } else {
      newDate.setDate(newDate.getDate() - 7)
    }
    setCurrentDate(newDate)
  }

  const navigateNext = () => {
    const newDate = new Date(currentDate)
    if (viewMode === "month") {
      newDate.setMonth(newDate.getMonth() + 1)
    } else {
      newDate.setDate(newDate.getDate() + 7)
    }
    setCurrentDate(newDate)
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  // Get days for current month view
  const getMonthDays = useMemo(() => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    
    const startPadding = firstDay.getDay()
    const days: { date: Date; isCurrentMonth: boolean }[] = []
    
    // Previous month days
    for (let i = startPadding - 1; i >= 0; i--) {
      const date = new Date(year, month, -i)
      days.push({ date, isCurrentMonth: false })
    }
    
    // Current month days
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const date = new Date(year, month, i)
      days.push({ date, isCurrentMonth: true })
    }
    
    // Next month days to fill grid
    const remaining = 42 - days.length
    for (let i = 1; i <= remaining; i++) {
      const date = new Date(year, month + 1, i)
      days.push({ date, isCurrentMonth: false })
    }
    
    return days
  }, [currentDate])

  // Get days for current week view
  const getWeekDays = useMemo(() => {
    const days: Date[] = []
    const startOfWeek = new Date(currentDate)
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay())
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek)
      date.setDate(startOfWeek.getDate() + i)
      days.push(date)
    }
    
    return days
  }, [currentDate])

  // Get events for a specific date (using occurrence_date for recurring events)
  const getEventsForDate = (date: Date) => {
    return expandedCalls.filter(call => {
      const callDate = new Date(call.occurrence_date)
      return (
        callDate.getFullYear() === date.getFullYear() &&
        callDate.getMonth() === date.getMonth() &&
        callDate.getDate() === date.getDate()
      )
    })
  }

  // Simple time format for compact displays
  const formatTime = (dateString: string, eventTimezone?: string) => {
    const date = new Date(dateString)
    const localTime = date.toLocaleTimeString(undefined, {
      hour: 'numeric',
      minute: '2-digit'
    })
    
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

  const isToday = (date: Date) => {
    const today = new Date()
    return (
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
    )
  }

  const getCallTypeColor = (callType: string) => {
    return callType === "coach_only" 
      ? "bg-purple-500 hover:bg-purple-600"
      : "bg-teal-500 hover:bg-teal-600"
  }

  const getStatusIndicator = (status: string) => {
    switch (status) {
      case "live":
        return <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full animate-pulse" />
      case "completed":
        return <span className="absolute top-0 right-0 h-2 w-2 bg-green-500 rounded-full" />
      default:
        return null
    }
  }

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[hsl(var(--optavia-green))]"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header Controls */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1 sm:gap-2">
            <Button variant="outline" size="icon" onClick={navigatePrevious} className="h-8 w-8 sm:h-9 sm:w-9">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={navigateNext} className="h-8 w-8 sm:h-9 sm:w-9">
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={goToToday} className="text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3">
              Today
            </Button>
          </div>
          
          <div className="flex rounded-lg border border-gray-300 overflow-hidden">
            <Button
              variant={viewMode === "month" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("month")}
              className={`rounded-none text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3 ${viewMode === "month" ? "bg-[hsl(var(--optavia-green))] hover:bg-[hsl(var(--optavia-green-dark))]" : ""}`}
            >
              <Grid3X3 className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" />
              <span className="hidden sm:inline">Month</span>
            </Button>
            <Button
              variant={viewMode === "week" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("week")}
              className={`rounded-none text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3 ${viewMode === "week" ? "bg-[hsl(var(--optavia-green))] hover:bg-[hsl(var(--optavia-green-dark))]" : ""}`}
            >
              <List className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" />
              <span className="hidden sm:inline">Week</span>
            </Button>
          </div>
        </div>
        
        <h2 className="font-heading font-bold text-base sm:text-xl text-optavia-dark text-center sm:text-left">
          {viewMode === "month" 
            ? currentDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
            : `Week of ${getWeekDays[0].toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`
          }
        </h2>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-purple-500"></div>
          <span className="text-optavia-gray">Coach Only</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-teal-500"></div>
          <span className="text-optavia-gray">With Clients</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
          <span className="text-optavia-gray">Live Now</span>
        </div>
      </div>

      {/* Month View */}
      {viewMode === "month" && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden overflow-x-auto">
          {/* Day Headers */}
          <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50 min-w-[350px]">
            {dayNames.map((day, idx) => (
              <div key={day} className="py-1 sm:py-2 text-center text-xs sm:text-sm font-semibold text-optavia-gray">
                <span className="hidden sm:inline">{day}</span>
                <span className="sm:hidden">{day.charAt(0)}</span>
              </div>
            ))}
          </div>
          
          {/* Calendar Grid */}
          <div className="grid grid-cols-7 min-w-[350px]">
            {getMonthDays.map((dayInfo, index) => {
              const events = getEventsForDate(dayInfo.date)
              const dayIsToday = isToday(dayInfo.date)
              const maxEventsToShow = isMobile ? 2 : 3
              
              return (
                <div
                  key={index}
                  onClick={() => {
                    // On mobile, if there are events, show the first one
                    if (isMobile && events.length > 0) {
                      setSelectedEvent(events[0])
                    }
                  }}
                  className={`min-h-[70px] sm:min-h-[120px] border-b border-r border-gray-100 p-0.5 sm:p-2 ${
                    !dayInfo.isCurrentMonth ? "bg-gray-50" : "bg-white"
                  } ${dayIsToday ? "ring-2 ring-inset ring-[hsl(var(--optavia-green))]" : ""} ${
                    isMobile && events.length > 0 ? "cursor-pointer" : ""
                  }`}
                >
                  <div className={`text-xs sm:text-sm font-medium mb-0.5 sm:mb-1 ${
                    dayIsToday 
                      ? "text-white bg-[hsl(var(--optavia-green))] w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-[10px] sm:text-sm"
                      : dayInfo.isCurrentMonth 
                        ? "text-optavia-dark" 
                        : "text-gray-400"
                  }`}>
                    {dayInfo.date.getDate()}
                  </div>
                  <div className="space-y-0.5 sm:space-y-1">
                    {events.slice(0, maxEventsToShow).map((event, eventIdx) => (
                      <button
                        key={`${event.id}-${eventIdx}`}
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedEvent(event)
                        }}
                        className={`w-full text-left text-[10px] sm:text-xs text-white rounded px-0.5 sm:px-1 py-0 sm:py-0.5 truncate relative ${getCallTypeColor(event.call_type)}`}
                      >
                        {getStatusIndicator(event.status)}
                        <span className="hidden sm:inline">{formatTime(event.occurrence_date, event.timezone)} </span>
                        <span className="hidden sm:inline">{event.title}</span>
                        <span className="sm:hidden">{event.title.substring(0, 8)}{event.title.length > 8 ? "…" : ""}</span>
                      </button>
                    ))}
                    {events.length > maxEventsToShow && (
                      <div className="text-[10px] sm:text-xs text-optavia-gray">
                        +{events.length - maxEventsToShow}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Week View - Vertical Calendar with Day Columns */}
      {viewMode === "week" && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden overflow-x-auto">
          {/* Day Headers */}
          <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50 min-w-[700px]">
            {getWeekDays.map((date, index) => {
              const dayIsToday = isToday(date)
              return (
                <div
                  key={index}
                  className={`py-3 text-center border-r last:border-r-0 ${
                    dayIsToday ? "bg-[hsl(var(--optavia-green))] text-white" : ""
                  }`}
                >
                  <div className="text-xs font-medium uppercase tracking-wide">
                    {dayNames[date.getDay()]}
                  </div>
                  <div className={`text-xl font-bold mt-1 ${
                    dayIsToday ? "" : "text-gray-700"
                  }`}>
                    {date.getDate()}
                  </div>
                  {dayIsToday && (
                    <Badge className="bg-white/20 text-white text-[10px] mt-1">Today</Badge>
                  )}
                </div>
              )
            })}
          </div>

          {/* Time Slots / Events Grid */}
          <div className="grid grid-cols-7 min-w-[700px]" style={{ minHeight: "400px" }}>
            {getWeekDays.map((date, index) => {
              const events = getEventsForDate(date)
              const dayIsToday = isToday(date)

              return (
                <div
                  key={index}
                  className={`border-r last:border-r-0 p-2 ${
                    dayIsToday ? "bg-green-50" : "bg-white"
                  }`}
                >
                  {events.length === 0 ? (
                    <div className="text-xs text-gray-400 text-center py-4">
                      No events
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {events.map((event, eventIdx) => (
                        <button
                          key={`${event.id}-${eventIdx}`}
                          onClick={() => setSelectedEvent(event)}
                          className={`w-full text-left p-2 rounded-lg border transition-shadow hover:shadow-md cursor-pointer ${
                            event.status === "live" 
                              ? "border-red-300 bg-red-50 ring-2 ring-red-200" 
                              : event.call_type === "coach_only"
                              ? "border-purple-200 bg-purple-50 hover:bg-purple-100"
                              : "border-teal-200 bg-teal-50 hover:bg-teal-100"
                          }`}
                        >
                          {/* Time */}
                          <div className="flex items-center gap-1 text-xs font-medium text-gray-600 mb-1">
                            <Clock className="h-3 w-3" />
                            {formatTime(event.occurrence_date, event.timezone)}
                          </div>
                          
                          {/* Title */}
                          <div className="text-sm font-semibold text-gray-900 truncate mb-1">
                            {event.title}
                          </div>
                          
                          {/* Badges */}
                          <div className="flex flex-wrap gap-1">
                            {event.status === "live" && (
                              <Badge className="bg-red-500 text-[10px] px-1.5 py-0 animate-pulse">
                                LIVE
                              </Badge>
                            )}
                            <Badge 
                              variant="secondary" 
                              className={`text-[10px] px-1.5 py-0 ${
                                event.call_type === "coach_only" 
                                  ? "bg-purple-100 text-purple-700" 
                                  : "bg-teal-100 text-teal-700"
                              }`}
                            >
                              {event.call_type === "coach_only" ? (
                                <><UserCircle className="h-2.5 w-2.5 mr-0.5" />Coach</>
                              ) : (
                                <><Users className="h-2.5 w-2.5 mr-0.5" />Clients</>
                              )}
                            </Badge>
                          </div>
                          
                          {/* Duration */}
                          <div className="text-[10px] text-gray-500 mt-1">
                            {event.duration_minutes} min
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Event Detail Modal */}
      {selectedEvent && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4 z-50"
          onClick={() => setSelectedEvent(null)}
        >
          <Card 
            className="w-full sm:max-w-lg bg-white rounded-t-xl sm:rounded-xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-start justify-between mb-3 sm:mb-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg sm:text-xl font-bold text-optavia-dark break-words">{selectedEvent.title}</h3>
                  <div className="flex flex-wrap items-center gap-1 sm:gap-2 mt-2">
                    {selectedEvent.status === "live" && (
                      <Badge className="bg-red-500 animate-pulse text-xs">Live Now</Badge>
                    )}
                    {selectedEvent.status === "upcoming" && (
                      <Badge className="bg-blue-500 text-xs">Upcoming</Badge>
                    )}
                    {selectedEvent.status === "completed" && (
                      <Badge className="bg-green-500 text-xs">Completed</Badge>
                    )}
                    <Badge 
                      variant="secondary" 
                      className={`text-xs ${selectedEvent.call_type === "coach_only" 
                        ? "bg-purple-100 text-purple-700" 
                        : "bg-teal-100 text-teal-700"
                      }`}
                    >
                      {selectedEvent.call_type === "coach_only" ? "Coach Only" : "With Clients"}
                    </Badge>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setSelectedEvent(null)} className="h-8 w-8 p-0 flex-shrink-0">
                  ✕
                </Button>
              </div>

                <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center gap-2 sm:gap-3 text-optavia-gray text-sm sm:text-base">
                  <CalendarIcon className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                  <span>
                    {new Date(selectedEvent.occurrence_date).toLocaleDateString(undefined, {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </span>
                </div>
                
                <div className="flex items-center gap-2 sm:gap-3 text-optavia-gray text-sm sm:text-base">
                  <Clock className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                  <span>
                    {formatTime(selectedEvent.occurrence_date, selectedEvent.timezone)} {selectedEvent.duration_minutes && `(${selectedEvent.duration_minutes} min)`}
                  </span>
                </div>

                {selectedEvent.is_occurrence && (
                  <div className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded">
                    This is part of a recurring {selectedEvent.recurrence_pattern} meeting on {selectedEvent.recurrence_day}s
                  </div>
                )}

                {selectedEvent.description && (
                  <p className="text-optavia-gray text-sm sm:text-base">{selectedEvent.description}</p>
                )}

                {selectedEvent.zoom_link && (
                  <div className="space-y-2">
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button
                        className={`flex-1 text-white text-sm ${
                          selectedEvent.status === "live" 
                            ? "bg-red-500 hover:bg-red-600" 
                            : "bg-blue-600 hover:bg-blue-700"
                        }`}
                        onClick={() => window.open(selectedEvent.zoom_link!, '_blank')}
                      >
                        <Video className="h-4 w-4 mr-2 text-white" />
                        {selectedEvent.status === "live" ? "Join Now" : "Join Meeting"}
                      </Button>
                      <Button
                        variant="outline"
                        className="sm:w-auto"
                        onClick={() => handleCopyLink(selectedEvent.zoom_link!, selectedEvent.id)}
                      >
                        {copiedId === selectedEvent.id ? (
                          <><Check className="h-4 w-4 sm:mr-0 mr-2" /><span className="sm:hidden">Copied</span></>
                        ) : (
                          <><Copy className="h-4 w-4 sm:mr-0 mr-2" /><span className="sm:hidden">Copy Link</span></>
                        )}
                      </Button>
                    </div>
                    
                    {(selectedEvent.zoom_meeting_id || selectedEvent.zoom_passcode) && (
                      <div className="bg-gray-50 rounded p-2 sm:p-3 text-xs sm:text-sm space-y-1">
                        {selectedEvent.zoom_meeting_id && (
                          <div className="break-all">Meeting ID: <strong>{selectedEvent.zoom_meeting_id}</strong></div>
                        )}
                        {selectedEvent.zoom_passcode && (
                          <div>Passcode: <strong>{selectedEvent.zoom_passcode}</strong></div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {selectedEvent.recording_url && selectedEvent.status === "completed" && (
                  <Button
                    variant="outline"
                    className="w-full border-green-500 text-green-600 hover:bg-green-50 text-sm"
                    onClick={() => window.open(selectedEvent.recording_url!, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Watch Recording
                    {selectedEvent.recording_platform && (
                      <span className="ml-1 text-xs opacity-75">({selectedEvent.recording_platform})</span>
                    )}
                  </Button>
                )}

                {/* Add to Calendar */}
                {selectedEvent.status !== "completed" && (
                  <div className="pt-2 border-t border-gray-100">
                    <AddToCalendar event={selectedEvent} className="w-full" />
                  </div>
                )}

                {/* Share with Clients - only for "with_clients" meetings */}
                {selectedEvent.call_type === "with_clients" && selectedEvent.status !== "completed" && (
                  <div className="pt-2 border-t border-gray-100">
                    <Button
                      variant="outline"
                      className={`w-full ${sharedId === selectedEvent.id 
                        ? "bg-teal-50 border-teal-300 text-teal-700" 
                        : "border-teal-200 text-teal-600 hover:bg-teal-50"
                      }`}
                      onClick={() => handleShareWithClients(selectedEvent)}
                    >
                      {sharedId === selectedEvent.id ? (
                        <>
                          <Check className="h-4 w-4 mr-2" />
                          Copied! Share with your clients
                        </>
                      ) : (
                        <>
                          <Share2 className="h-4 w-4 mr-2" />
                          Share with Clients
                        </>
                      )}
                    </Button>
                    <p className="text-xs text-gray-500 text-center mt-1">
                      Copy meeting details to share via text, email, or social media
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
