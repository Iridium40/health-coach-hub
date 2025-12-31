"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  ChevronLeft, ChevronRight, Calendar as CalendarIcon, 
  Video, Clock, Users, UserCircle, ExternalLink, Copy, Check,
  Grid3X3, List
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"
import { AddToCalendar } from "@/components/add-to-calendar"
import type { ZoomCall } from "@/lib/types"

type ViewMode = "month" | "week"

export function CalendarView() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [zoomCalls, setZoomCalls] = useState<ZoomCall[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<ViewMode>("month")
  const [currentDate, setCurrentDate] = useState(new Date())
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<ZoomCall | null>(null)
  const supabase = createClient()

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }
    loadZoomCalls()
  }, [user])

  const loadZoomCalls = async () => {
    const { data, error } = await supabase
      .from("zoom_calls")
      .select("*")
      .in("status", ["upcoming", "live", "completed"])
      .order("scheduled_at", { ascending: true })

    if (!error && data) {
      setZoomCalls(data)
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

  // Get events for a specific date
  const getEventsForDate = (date: Date) => {
    return zoomCalls.filter(call => {
      const callDate = new Date(call.scheduled_at)
      return (
        callDate.getFullYear() === date.getFullYear() &&
        callDate.getMonth() === date.getMonth() &&
        callDate.getDate() === date.getDate()
      )
    })
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString(undefined, {
      hour: 'numeric',
      minute: '2-digit'
    })
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={navigatePrevious}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={navigateNext}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={goToToday}>
            Today
          </Button>
          <h2 className="font-heading font-bold text-lg sm:text-xl text-optavia-dark ml-2">
            {viewMode === "month" 
              ? currentDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
              : `Week of ${getWeekDays[0].toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`
            }
          </h2>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-gray-300 overflow-hidden">
            <Button
              variant={viewMode === "month" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("month")}
              className={`rounded-none ${viewMode === "month" ? "bg-[hsl(var(--optavia-green))] hover:bg-[hsl(var(--optavia-green-dark))]" : ""}`}
            >
              <Grid3X3 className="h-4 w-4 mr-1" />
              Month
            </Button>
            <Button
              variant={viewMode === "week" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("week")}
              className={`rounded-none ${viewMode === "week" ? "bg-[hsl(var(--optavia-green))] hover:bg-[hsl(var(--optavia-green-dark))]" : ""}`}
            >
              <List className="h-4 w-4 mr-1" />
              Week
            </Button>
          </div>
        </div>
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
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {/* Day Headers */}
          <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
            {dayNames.map(day => (
              <div key={day} className="py-2 text-center text-sm font-semibold text-optavia-gray">
                {day}
              </div>
            ))}
          </div>
          
          {/* Calendar Grid */}
          <div className="grid grid-cols-7">
            {getMonthDays.map((dayInfo, index) => {
              const events = getEventsForDate(dayInfo.date)
              const dayIsToday = isToday(dayInfo.date)
              
              return (
                <div
                  key={index}
                  className={`min-h-[100px] sm:min-h-[120px] border-b border-r border-gray-100 p-1 sm:p-2 ${
                    !dayInfo.isCurrentMonth ? "bg-gray-50" : "bg-white"
                  } ${dayIsToday ? "ring-2 ring-inset ring-[hsl(var(--optavia-green))]" : ""}`}
                >
                  <div className={`text-sm font-medium mb-1 ${
                    dayIsToday 
                      ? "text-white bg-[hsl(var(--optavia-green))] w-6 h-6 rounded-full flex items-center justify-center"
                      : dayInfo.isCurrentMonth 
                        ? "text-optavia-dark" 
                        : "text-gray-400"
                  }`}>
                    {dayInfo.date.getDate()}
                  </div>
                  <div className="space-y-1">
                    {events.slice(0, 3).map(event => (
                      <button
                        key={event.id}
                        onClick={() => setSelectedEvent(event)}
                        className={`w-full text-left text-xs text-white rounded px-1 py-0.5 truncate relative ${getCallTypeColor(event.call_type)}`}
                      >
                        {getStatusIndicator(event.status)}
                        <span className="hidden sm:inline">{formatTime(event.scheduled_at)} </span>
                        {event.title}
                      </button>
                    ))}
                    {events.length > 3 && (
                      <div className="text-xs text-optavia-gray">
                        +{events.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Week View */}
      {viewMode === "week" && (
        <div className="space-y-2">
          {getWeekDays.map((date, index) => {
            const events = getEventsForDate(date)
            const dayIsToday = isToday(date)
            
            return (
              <div
                key={index}
                className={`bg-white rounded-lg border p-4 ${
                  dayIsToday ? "border-[hsl(var(--optavia-green))] border-2" : "border-gray-200"
                }`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={`text-center ${dayIsToday ? "text-[hsl(var(--optavia-green))]" : "text-optavia-dark"}`}>
                    <div className="text-sm font-medium">{dayNames[date.getDay()]}</div>
                    <div className={`text-2xl font-bold ${
                      dayIsToday 
                        ? "bg-[hsl(var(--optavia-green))] text-white w-10 h-10 rounded-full flex items-center justify-center"
                        : ""
                    }`}>
                      {date.getDate()}
                    </div>
                  </div>
                  <div className="text-sm text-optavia-gray">
                    {date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                  </div>
                  {dayIsToday && (
                    <Badge className="bg-[hsl(var(--optavia-green))]">Today</Badge>
                  )}
                </div>
                
                {events.length === 0 ? (
                  <div className="text-sm text-gray-400 italic pl-12">No calls scheduled</div>
                ) : (
                  <div className="space-y-2 pl-12">
                    {events.map(event => (
                      <Card 
                        key={event.id}
                        className={`cursor-pointer transition-shadow hover:shadow-md ${
                          event.status === "live" ? "ring-2 ring-red-300" : ""
                        }`}
                        onClick={() => setSelectedEvent(event)}
                      >
                        <CardContent className="p-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <div className="flex flex-wrap items-center gap-2 mb-1">
                                <span className="font-medium text-optavia-dark">{event.title}</span>
                                {event.status === "live" && (
                                  <Badge className="bg-red-500 animate-pulse">Live</Badge>
                                )}
                                <Badge 
                                  variant="secondary" 
                                  className={event.call_type === "coach_only" 
                                    ? "bg-purple-100 text-purple-700" 
                                    : "bg-teal-100 text-teal-700"
                                  }
                                >
                                  {event.call_type === "coach_only" ? (
                                    <><UserCircle className="h-3 w-3 mr-1" />Coach Only</>
                                  ) : (
                                    <><Users className="h-3 w-3 mr-1" />With Clients</>
                                  )}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-optavia-gray">
                                <Clock className="h-3 w-3" />
                                {formatTime(event.scheduled_at)} ({event.duration_minutes} min)
                              </div>
                            </div>
                            {event.zoom_link && (
                              <Button
                                size="sm"
                                className={event.status === "live" 
                                  ? "bg-red-500 hover:bg-red-600" 
                                  : "bg-blue-600 hover:bg-blue-700"
                                }
                                onClick={(e) => {
                                  e.stopPropagation()
                                  window.open(event.zoom_link!, '_blank')
                                }}
                              >
                                <Video className="h-4 w-4 mr-1" />
                                Join
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Event Detail Modal */}
      {selectedEvent && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedEvent(null)}
        >
          <Card 
            className="w-full max-w-lg bg-white"
            onClick={(e) => e.stopPropagation()}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-optavia-dark">{selectedEvent.title}</h3>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    {selectedEvent.status === "live" && (
                      <Badge className="bg-red-500 animate-pulse">Live Now</Badge>
                    )}
                    {selectedEvent.status === "upcoming" && (
                      <Badge className="bg-blue-500">Upcoming</Badge>
                    )}
                    {selectedEvent.status === "completed" && (
                      <Badge className="bg-green-500">Completed</Badge>
                    )}
                    <Badge 
                      variant="secondary" 
                      className={selectedEvent.call_type === "coach_only" 
                        ? "bg-purple-100 text-purple-700" 
                        : "bg-teal-100 text-teal-700"
                      }
                    >
                      {selectedEvent.call_type === "coach_only" ? "Coach Only" : "With Clients"}
                    </Badge>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setSelectedEvent(null)}>
                  ✕
                </Button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 text-optavia-gray">
                  <CalendarIcon className="h-5 w-5" />
                  <span>
                    {new Date(selectedEvent.scheduled_at).toLocaleDateString(undefined, {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </span>
                </div>
                
                <div className="flex items-center gap-3 text-optavia-gray">
                  <Clock className="h-5 w-5" />
                  <span>
                    {formatTime(selectedEvent.scheduled_at)} ({selectedEvent.duration_minutes} minutes)
                  </span>
                </div>

                {selectedEvent.description && (
                  <p className="text-optavia-gray">{selectedEvent.description}</p>
                )}

                {selectedEvent.zoom_link && (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Button
                        className={`flex-1 ${
                          selectedEvent.status === "live" 
                            ? "bg-red-500 hover:bg-red-600" 
                            : "bg-blue-600 hover:bg-blue-700"
                        }`}
                        onClick={() => window.open(selectedEvent.zoom_link!, '_blank')}
                      >
                        <Video className="h-4 w-4 mr-2" />
                        {selectedEvent.status === "live" ? "Join Now" : "Join Meeting"}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleCopyLink(selectedEvent.zoom_link!, selectedEvent.id)}
                      >
                        {copiedId === selectedEvent.id ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    
                    {(selectedEvent.zoom_meeting_id || selectedEvent.zoom_passcode) && (
                      <div className="bg-gray-50 rounded p-3 text-sm space-y-1">
                        {selectedEvent.zoom_meeting_id && (
                          <div>Meeting ID: <strong>{selectedEvent.zoom_meeting_id}</strong></div>
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
                    className="w-full border-green-500 text-green-600 hover:bg-green-50"
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
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
