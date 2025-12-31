"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { useUserData } from "@/contexts/user-data-context"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { 
  X, Plus, Edit, Trash2, Search, Video, Calendar, Clock, Users, 
  Link as LinkIcon, PlayCircle, Copy, Check, ExternalLink
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { ZoomCall } from "@/lib/types"

export function AdminZoomCalls({ onClose }: { onClose?: () => void }) {
  const { user, profile } = useUserData()
  const { toast } = useToast()
  const supabase = createClient()
  const [zoomCalls, setZoomCalls] = useState<ZoomCall[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [copiedId, setCopiedId] = useState<string | null>(null)

  // Form state
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [callType, setCallType] = useState<"coach_only" | "with_clients">("coach_only")
  const [scheduledAt, setScheduledAt] = useState("")
  const [durationMinutes, setDurationMinutes] = useState(60)
  const [isRecurring, setIsRecurring] = useState(false)
  const [recurrencePattern, setRecurrencePattern] = useState<string>("")
  const [recurrenceDay, setRecurrenceDay] = useState<string>("")
  const [zoomLink, setZoomLink] = useState("")
  const [zoomMeetingId, setZoomMeetingId] = useState("")
  const [zoomPasscode, setZoomPasscode] = useState("")
  const [recordingUrl, setRecordingUrl] = useState("")
  const [recordingPlatform, setRecordingPlatform] = useState<"zoom" | "vimeo" | "youtube" | "">("")
  const [status, setStatus] = useState<"upcoming" | "live" | "completed" | "cancelled">("upcoming")

  // Check if user is admin (case-insensitive)
  const isAdmin = profile?.user_role?.toLowerCase() === "admin"

  useEffect(() => {
    if (!user || !isAdmin) {
      setLoading(false)
      return
    }
    loadZoomCalls()
  }, [user, isAdmin])

  const loadZoomCalls = async () => {
    const { data, error } = await supabase
      .from("zoom_calls")
      .select("*")
      .order("scheduled_at", { ascending: false })

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load zoom calls",
        variant: "destructive",
      })
    } else {
      setZoomCalls(data || [])
    }
    setLoading(false)
  }

  const resetForm = () => {
    setTitle("")
    setDescription("")
    setCallType("coach_only")
    setScheduledAt("")
    setDurationMinutes(60)
    setIsRecurring(false)
    setRecurrencePattern("")
    setRecurrenceDay("")
    setZoomLink("")
    setZoomMeetingId("")
    setZoomPasscode("")
    setRecordingUrl("")
    setRecordingPlatform("")
    setStatus("upcoming")
    setEditingId(null)
    setShowForm(false)
  }

  const handleEdit = (call: ZoomCall, e?: React.MouseEvent) => {
    e?.stopPropagation()
    e?.preventDefault()
    
    setTitle(call.title)
    setDescription(call.description || "")
    setCallType(call.call_type)
    setScheduledAt(new Date(call.scheduled_at).toISOString().slice(0, 16))
    setDurationMinutes(call.duration_minutes)
    setIsRecurring(call.is_recurring)
    setRecurrencePattern(call.recurrence_pattern || "")
    setRecurrenceDay(call.recurrence_day || "")
    setZoomLink(call.zoom_link || "")
    setZoomMeetingId(call.zoom_meeting_id || "")
    setZoomPasscode(call.zoom_passcode || "")
    setRecordingUrl(call.recording_url || "")
    setRecordingPlatform(call.recording_platform || "")
    setStatus(call.status)
    setEditingId(call.id)
    setShowForm(true)
  }

  const handleDelete = async (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation()
    e?.preventDefault()
    
    if (!confirm("Are you sure you want to delete this zoom call?")) return

    const { error } = await supabase.from("zoom_calls").delete().eq("id", id)

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete zoom call",
        variant: "destructive",
      })
    } else {
      toast({
        title: "Success",
        description: "Zoom call deleted",
      })
      loadZoomCalls()
    }
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) return

    const callData = {
      title,
      description: description || null,
      call_type: callType,
      scheduled_at: new Date(scheduledAt).toISOString(),
      duration_minutes: durationMinutes,
      is_recurring: isRecurring,
      recurrence_pattern: isRecurring ? recurrencePattern : null,
      recurrence_day: isRecurring ? recurrenceDay : null,
      zoom_link: zoomLink || null,
      zoom_meeting_id: zoomMeetingId || null,
      zoom_passcode: zoomPasscode || null,
      recording_url: recordingUrl || null,
      recording_platform: recordingPlatform || null,
      recording_available_at: recordingUrl ? new Date().toISOString() : null,
      status,
      created_by: user.id,
    }

    let error
    if (editingId) {
      const { error: updateError } = await supabase
        .from("zoom_calls")
        .update(callData)
        .eq("id", editingId)
      error = updateError
    } else {
      const { error: insertError } = await supabase.from("zoom_calls").insert(callData)
      error = insertError
    }

    if (error) {
      console.error("Zoom call save error:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to save zoom call",
        variant: "destructive",
      })
    } else {
      toast({
        title: "Success",
        description: editingId ? "Zoom call updated" : "Zoom call created",
      })
      resetForm()
      loadZoomCalls()
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "live":
        return <Badge className="bg-red-500 animate-pulse">Live Now</Badge>
      case "upcoming":
        return <Badge className="bg-blue-500">Upcoming</Badge>
      case "completed":
        return <Badge className="bg-green-500">Completed</Badge>
      case "cancelled":
        return <Badge variant="outline" className="text-gray-500">Cancelled</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getCallTypeBadge = (callType: string) => {
    return callType === "coach_only" 
      ? <Badge variant="secondary" className="bg-purple-100 text-purple-700">Coach Only</Badge>
      : <Badge variant="secondary" className="bg-teal-100 text-teal-700">With Clients</Badge>
  }

  if (!isAdmin) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="bg-white border border-gray-200">
          <CardContent className="pt-6">
            <p className="text-center text-optavia-gray">You don't have permission to access this page.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-optavia-gray">Loading...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading font-bold text-2xl sm:text-3xl text-optavia-dark">Manage Zoom Calls</h1>
        {onClose && (
          <Button variant="ghost" onClick={onClose} className="text-optavia-gray hover:bg-gray-100">
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Create New Zoom Call Section */}
      <div className="mb-8">
        {!showForm ? (
          <Button
            onClick={() => setShowForm(true)}
            className="bg-[hsl(var(--optavia-green))] hover:bg-[hsl(var(--optavia-green-dark))]"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Zoom Call
          </Button>
        ) : (
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-optavia-dark">
                {editingId ? "Edit Zoom Call" : "Schedule New Zoom Call"}
              </CardTitle>
              <CardDescription className="text-optavia-gray">
                Schedule a weekly coaching call for coaches or coaches with clients
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-optavia-dark">Title *</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g., Weekly Coach Training"
                      required
                      className="border-gray-300"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="callType" className="text-optavia-dark">Call Type *</Label>
                    <Select value={callType} onValueChange={(v) => setCallType(v as typeof callType)}>
                      <SelectTrigger className="border-gray-300">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="coach_only">Coach Only</SelectItem>
                        <SelectItem value="with_clients">With Clients</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-optavia-dark">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="What will be covered in this call?"
                    rows={3}
                    className="border-gray-300"
                  />
                </div>

                {/* Scheduling */}
                <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                  <h4 className="font-medium text-optavia-dark text-sm flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Scheduling
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="scheduledAt" className="text-optavia-dark">Date & Time *</Label>
                      <Input
                        id="scheduledAt"
                        type="datetime-local"
                        value={scheduledAt}
                        onChange={(e) => setScheduledAt(e.target.value)}
                        required
                        className="border-gray-300"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="duration" className="text-optavia-dark">Duration (min)</Label>
                      <Input
                        id="duration"
                        type="number"
                        value={durationMinutes}
                        onChange={(e) => setDurationMinutes(parseInt(e.target.value) || 60)}
                        min={15}
                        max={240}
                        className="border-gray-300"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="status" className="text-optavia-dark">Status</Label>
                      <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
                        <SelectTrigger className="border-gray-300">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="upcoming">Upcoming</SelectItem>
                          <SelectItem value="live">Live</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Recurring Toggle */}
                  <div className="flex items-center gap-3 p-3 bg-white rounded-md border border-gray-200">
                    <Switch
                      id="isRecurring"
                      checked={isRecurring}
                      onCheckedChange={setIsRecurring}
                    />
                    <Label htmlFor="isRecurring" className="cursor-pointer text-optavia-dark text-sm">
                      This is a recurring call
                    </Label>
                  </div>

                  {isRecurring && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-optavia-dark">Pattern</Label>
                        <Select value={recurrencePattern} onValueChange={setRecurrencePattern}>
                          <SelectTrigger className="border-gray-300">
                            <SelectValue placeholder="Select pattern" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="biweekly">Bi-weekly</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-optavia-dark">Day</Label>
                        <Select value={recurrenceDay} onValueChange={setRecurrenceDay}>
                          <SelectTrigger className="border-gray-300">
                            <SelectValue placeholder="Select day" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Monday">Monday</SelectItem>
                            <SelectItem value="Tuesday">Tuesday</SelectItem>
                            <SelectItem value="Wednesday">Wednesday</SelectItem>
                            <SelectItem value="Thursday">Thursday</SelectItem>
                            <SelectItem value="Friday">Friday</SelectItem>
                            <SelectItem value="Saturday">Saturday</SelectItem>
                            <SelectItem value="Sunday">Sunday</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}
                </div>

                {/* Zoom Details */}
                <div className="bg-blue-50 rounded-lg p-4 space-y-4">
                  <h4 className="font-medium text-optavia-dark text-sm flex items-center gap-2">
                    <Video className="h-4 w-4 text-blue-600" />
                    Zoom Details
                  </h4>
                  
                  <div className="space-y-2">
                    <Label htmlFor="zoomLink" className="text-optavia-dark">Zoom Link</Label>
                    <Input
                      id="zoomLink"
                      value={zoomLink}
                      onChange={(e) => setZoomLink(e.target.value)}
                      placeholder="https://zoom.us/j/..."
                      className="border-gray-300"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="zoomMeetingId" className="text-optavia-dark">Meeting ID</Label>
                      <Input
                        id="zoomMeetingId"
                        value={zoomMeetingId}
                        onChange={(e) => setZoomMeetingId(e.target.value)}
                        placeholder="123 456 7890"
                        className="border-gray-300"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="zoomPasscode" className="text-optavia-dark">Passcode</Label>
                      <Input
                        id="zoomPasscode"
                        value={zoomPasscode}
                        onChange={(e) => setZoomPasscode(e.target.value)}
                        placeholder="Optional passcode"
                        className="border-gray-300"
                      />
                    </div>
                  </div>
                </div>

                {/* Recording (for completed calls) */}
                <div className="bg-green-50 rounded-lg p-4 space-y-4">
                  <h4 className="font-medium text-optavia-dark text-sm flex items-center gap-2">
                    <PlayCircle className="h-4 w-4 text-green-600" />
                    Recording (add after call ends)
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="recordingUrl" className="text-optavia-dark">Recording URL</Label>
                      <Input
                        id="recordingUrl"
                        value={recordingUrl}
                        onChange={(e) => setRecordingUrl(e.target.value)}
                        placeholder="https://..."
                        className="border-gray-300"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="recordingPlatform" className="text-optavia-dark">Platform</Label>
                      <Select value={recordingPlatform} onValueChange={(v) => setRecordingPlatform(v as typeof recordingPlatform)}>
                        <SelectTrigger className="border-gray-300">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="zoom">Zoom</SelectItem>
                          <SelectItem value="vimeo">Vimeo</SelectItem>
                          <SelectItem value="youtube">YouTube</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    type="submit"
                    className="bg-[hsl(var(--optavia-green))] hover:bg-[hsl(var(--optavia-green-dark))]"
                  >
                    {editingId ? "Update" : "Create"} Zoom Call
                  </Button>
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </div>

      {/* List of Zoom Calls */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="font-heading font-bold text-xl text-optavia-dark">All Zoom Calls</h2>
          {zoomCalls.length > 0 && (
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search calls..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 border-gray-300"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
                  onClick={() => setSearchQuery("")}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          )}
        </div>

        {zoomCalls.length === 0 ? (
          <Card className="bg-white border border-gray-200">
            <CardContent className="pt-6">
              <p className="text-center text-optavia-gray">No zoom calls scheduled yet. Create one to get started.</p>
            </CardContent>
          </Card>
        ) : (() => {
          const filteredCalls = zoomCalls.filter((call) => {
            if (!searchQuery.trim()) return true
            const query = searchQuery.toLowerCase()
            return (
              call.title.toLowerCase().includes(query) ||
              (call.description?.toLowerCase().includes(query) ?? false)
            )
          })
          
          if (filteredCalls.length === 0) {
            return (
              <Card className="bg-white border border-gray-200">
                <CardContent className="pt-6">
                  <p className="text-center text-optavia-gray">
                    No zoom calls found matching "{searchQuery}"
                  </p>
                </CardContent>
              </Card>
            )
          }
          
          return filteredCalls.map((call) => (
            <Card key={call.id} className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <Video className="h-5 w-5 text-blue-600" />
                      <CardTitle className="text-optavia-dark">{call.title}</CardTitle>
                      {getStatusBadge(call.status)}
                      {getCallTypeBadge(call.call_type)}
                      {call.is_recurring && (
                        <Badge variant="outline" className="text-gray-500">
                          {call.recurrence_pattern} - {call.recurrence_day}
                        </Badge>
                      )}
                    </div>
                    <CardDescription className="text-optavia-gray flex flex-wrap items-center gap-x-4 gap-y-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(call.scheduled_at).toLocaleDateString(undefined, {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(call.scheduled_at).toLocaleTimeString(undefined, {
                          hour: 'numeric',
                          minute: '2-digit'
                        })}
                        {' '}({call.duration_minutes} min)
                      </span>
                    </CardDescription>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => handleEdit(call, e)}
                      className="text-blue-500 hover:bg-blue-50"
                      title="Edit"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => handleDelete(call.id, e)}
                      className="text-red-500 hover:bg-red-50"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {call.description && (
                  <p className="text-sm text-optavia-gray">{call.description}</p>
                )}
                
                {/* Zoom Details */}
                {call.zoom_link && (
                  <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                    <LinkIcon className="h-4 w-4 text-blue-600 flex-shrink-0" />
                    <a 
                      href={call.zoom_link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline truncate flex-1"
                    >
                      {call.zoom_link}
                    </a>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopyLink(call.zoom_link!, call.id)}
                      className="text-blue-600 hover:bg-blue-100 h-7 px-2"
                    >
                      {copiedId === call.id ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                )}

                {(call.zoom_meeting_id || call.zoom_passcode) && (
                  <div className="flex flex-wrap gap-4 text-sm text-optavia-gray">
                    {call.zoom_meeting_id && (
                      <span>Meeting ID: <strong>{call.zoom_meeting_id}</strong></span>
                    )}
                    {call.zoom_passcode && (
                      <span>Passcode: <strong>{call.zoom_passcode}</strong></span>
                    )}
                  </div>
                )}

                {/* Recording */}
                {call.recording_url && (
                  <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                    <PlayCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                    <span className="text-sm text-green-700 font-medium">Recording Available</span>
                    {call.recording_platform && (
                      <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs">
                        {call.recording_platform}
                      </Badge>
                    )}
                    <a 
                      href={call.recording_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="ml-auto text-green-600 hover:text-green-800"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        })()}
      </div>
    </div>
  )
}
