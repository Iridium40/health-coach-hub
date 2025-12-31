"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Video, Calendar, Clock, Users, ExternalLink, Copy, Check, 
  PlayCircle, ChevronDown, ChevronUp, UserCircle
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"
import type { ZoomCall } from "@/lib/types"

export function ZoomCalls() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [zoomCalls, setZoomCalls] = useState<ZoomCall[]>([])
  const [loading, setLoading] = useState(true)
  const [showPast, setShowPast] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "live":
        return <Badge className="bg-red-500 animate-pulse">Live Now</Badge>
      case "upcoming":
        return <Badge className="bg-blue-500">Upcoming</Badge>
      case "completed":
        return <Badge className="bg-green-500">Completed</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getCallTypeBadge = (callType: string) => {
    return callType === "coach_only" 
      ? <Badge variant="secondary" className="bg-purple-100 text-purple-700 border-purple-200">
          <UserCircle className="h-3 w-3 mr-1" />
          Coach Only
        </Badge>
      : <Badge variant="secondary" className="bg-teal-100 text-teal-700 border-teal-200">
          <Users className="h-3 w-3 mr-1" />
          With Clients
        </Badge>
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    const isToday = date.toDateString() === now.toDateString()
    const isTomorrow = date.toDateString() === tomorrow.toDateString()
    
    if (isToday) return "Today"
    if (isTomorrow) return "Tomorrow"
    
    return date.toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString(undefined, {
      hour: 'numeric',
      minute: '2-digit'
    })
  }

  const isCallUpcoming = (call: ZoomCall) => {
    return call.status === "upcoming" || call.status === "live"
  }

  const isPastCall = (call: ZoomCall) => {
    return call.status === "completed"
  }

  if (loading) {
    return (
      <Card className="bg-white border border-gray-200">
        <CardContent className="py-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[hsl(var(--optavia-green))]"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const upcomingCalls = zoomCalls.filter(isCallUpcoming)
  const pastCalls = zoomCalls.filter(isPastCall).slice(0, 10) // Show last 10

  if (upcomingCalls.length === 0 && pastCalls.length === 0) {
    return null
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Video className="h-5 w-5 text-blue-600" />
        <h2 className="font-heading font-bold text-lg text-optavia-dark">Weekly Calls</h2>
      </div>

      {/* Upcoming & Live Calls */}
      {upcomingCalls.length > 0 && (
        <div className="space-y-3">
          {upcomingCalls.map((call) => (
            <Card 
              key={call.id} 
              className={`bg-white border shadow-sm transition-all ${
                call.status === "live" 
                  ? "border-red-300 ring-2 ring-red-100" 
                  : "border-blue-200 hover:border-blue-300"
              }`}
            >
              <CardHeader className="pb-2">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <CardTitle className="text-base text-optavia-dark">{call.title}</CardTitle>
                      {getStatusBadge(call.status)}
                      {getCallTypeBadge(call.call_type)}
                    </div>
                    <CardDescription className="text-optavia-gray flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                      <span className="flex items-center gap-1 font-medium text-optavia-dark">
                        <Calendar className="h-3 w-3" />
                        {formatDate(call.scheduled_at)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatTime(call.scheduled_at)} ({call.duration_minutes} min)
                      </span>
                      {call.is_recurring && call.recurrence_pattern && (
                        <span className="text-xs text-gray-500">
                          • {call.recurrence_pattern}
                        </span>
                      )}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-2 space-y-3">
                {call.description && (
                  <p className="text-sm text-optavia-gray">{call.description}</p>
                )}
                
                {/* Join Button & Details */}
                {call.zoom_link && (
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button
                      asChild
                      className={`flex-1 ${
                        call.status === "live" 
                          ? "bg-red-500 hover:bg-red-600" 
                          : "bg-blue-600 hover:bg-blue-700"
                      }`}
                    >
                      <a href={call.zoom_link} target="_blank" rel="noopener noreferrer">
                        <Video className="h-4 w-4 mr-2" />
                        {call.status === "live" ? "Join Now" : "Join Meeting"}
                      </a>
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleCopyLink(call.zoom_link!, call.id)}
                      className="border-gray-300"
                    >
                      {copiedId === call.id ? (
                        <>
                          <Check className="h-4 w-4 mr-2" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4 mr-2" />
                          Copy Link
                        </>
                      )}
                    </Button>
                  </div>
                )}

                {/* Meeting Details */}
                {(call.zoom_meeting_id || call.zoom_passcode) && (
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-optavia-gray bg-gray-50 p-2 rounded">
                    {call.zoom_meeting_id && (
                      <span>Meeting ID: <strong className="text-optavia-dark">{call.zoom_meeting_id}</strong></span>
                    )}
                    {call.zoom_passcode && (
                      <span>Passcode: <strong className="text-optavia-dark">{call.zoom_passcode}</strong></span>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Past Calls with Recordings */}
      {pastCalls.length > 0 && (
        <div className="space-y-2">
          <Button
            variant="ghost"
            onClick={() => setShowPast(!showPast)}
            className="w-full flex items-center justify-between text-optavia-gray hover:text-optavia-dark hover:bg-gray-50 h-auto py-2"
          >
            <span className="flex items-center gap-2">
              <PlayCircle className="h-4 w-4" />
              Past Recordings ({pastCalls.length})
            </span>
            {showPast ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>

          {showPast && (
            <div className="space-y-2 pl-2 border-l-2 border-gray-200">
              {pastCalls.map((call) => (
                <Card key={call.id} className="bg-gray-50 border border-gray-200">
                  <CardContent className="py-3 px-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="font-medium text-sm text-optavia-dark truncate">{call.title}</span>
                          {getCallTypeBadge(call.call_type)}
                        </div>
                        <span className="text-xs text-optavia-gray">
                          {new Date(call.scheduled_at).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                      {call.recording_url ? (
                        <Button
                          asChild
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <a href={call.recording_url} target="_blank" rel="noopener noreferrer">
                            <PlayCircle className="h-4 w-4 mr-1" />
                            Watch
                            {call.recording_platform && (
                              <span className="ml-1 text-xs opacity-75">({call.recording_platform})</span>
                            )}
                          </a>
                        </Button>
                      ) : (
                        <span className="text-xs text-gray-400 italic">No recording</span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
