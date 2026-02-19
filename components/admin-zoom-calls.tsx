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
import { useAdminChanges } from "@/hooks/use-admin-changes"
import { AdminSaveButton } from "@/components/admin-save-button"
import { sendBatchMeetingEmail } from "@/lib/email"
import { 
  X, Plus, Edit, Trash2, Search, Video, Calendar, Clock, Users, 
  Link as LinkIcon, PlayCircle, Copy, Check, ExternalLink, Mail, Loader2,
  MapPin, Globe
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
  const [typeFilter, setTypeFilter] = useState<"all" | "meeting" | "event">("all")
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
  const [recurrenceEndDate, setRecurrenceEndDate] = useState<string>("")
  const [zoomLink, setZoomLink] = useState("")
  const [zoomMeetingId, setZoomMeetingId] = useState("")
  const [zoomPasscode, setZoomPasscode] = useState("")
  const [recordingUrl, setRecordingUrl] = useState("")
  const [recordingPlatform, setRecordingPlatform] = useState<"zoom" | "vimeo" | "youtube" | "">("vimeo")
  const [status, setStatus] = useState<"upcoming" | "live" | "completed" | "cancelled">("upcoming")
  const [sendEmailNotification, setSendEmailNotification] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  // Event-specific fields
  const [eventType, setEventType] = useState<"meeting" | "event">("meeting")
  const [endDate, setEndDate] = useState("")
  // Time picker state (Safari-friendly approach using dropdowns)
  const [startHour, setStartHour] = useState("")
  const [startMinute, setStartMinute] = useState("00")
  const [startAmPm, setStartAmPm] = useState<"AM" | "PM">("AM")
  const [endHour, setEndHour] = useState("")
  const [endMinute, setEndMinute] = useState("00")
  const [endAmPm, setEndAmPm] = useState<"AM" | "PM">("PM")
  
  // Helper to convert 12h to 24h format for database storage
  const to24Hour = (hour: string, ampm: "AM" | "PM"): string => {
    if (!hour) return ""
    const h = parseInt(hour)
    if (ampm === "AM") {
      return h === 12 ? "00" : h.toString().padStart(2, "0")
    } else {
      return h === 12 ? "12" : (h + 12).toString()
    }
  }
  
  // Helper to convert 24h to 12h format for display
  const from24Hour = (time24: string): { hour: string; minute: string; ampm: "AM" | "PM" } => {
    if (!time24) return { hour: "", minute: "00", ampm: "AM" }
    const [h, m] = time24.split(":")
    const hour24 = parseInt(h)
    const ampm: "AM" | "PM" = hour24 >= 12 ? "PM" : "AM"
    let hour12 = hour24 % 12
    if (hour12 === 0) hour12 = 12
    return { hour: hour12.toString(), minute: m || "00", ampm }
  }
  
  // Computed values for database
  const startTime = startHour ? `${to24Hour(startHour, startAmPm)}:${startMinute}` : ""
  const endTime = endHour ? `${to24Hour(endHour, endAmPm)}:${endMinute}` : ""
  const [location, setLocation] = useState("")
  const [isVirtual, setIsVirtual] = useState(true)
  const [timezone, setTimezone] = useState("America/New_York") // Default to Eastern

  // US Timezone options
  const US_TIMEZONES = [
    { value: "America/New_York", label: "Eastern Time (ET)" },
    { value: "America/Chicago", label: "Central Time (CT)" },
    { value: "America/Denver", label: "Mountain Time (MT)" },
    { value: "America/Los_Angeles", label: "Pacific Time (PT)" },
  ]

  // Check if user is admin (case-insensitive)
  const role = profile?.user_role?.toLowerCase()
  const isAdmin = role === "admin" || role === "system_admin"

  // Track unsaved changes for admin
  const { 
    hasUnsavedChanges, 
    isSaving, 
    changeCount, 
    trackChange, 
    saveChanges,
    showLeaveDialog,
    confirmLeave,
    saveAndLeave,
    cancelLeave,
  } = useAdminChanges()

  useEffect(() => {
    if (!user || !isAdmin) {
      setLoading(false)
      return
    }
    loadZoomCalls()
  }, [user, isAdmin])

  // When switching to virtual format (and not editing), prefill zoom details from profile
  useEffect(() => {
    if (isVirtual && !editingId && showForm) {
      // Only prefill if fields are empty
      if (!zoomLink && profile?.zoom_link) {
        setZoomLink(profile.zoom_link)
      }
      if (!zoomMeetingId && profile?.zoom_meeting_id) {
        setZoomMeetingId(profile.zoom_meeting_id)
      }
      if (!zoomPasscode && profile?.zoom_passcode) {
        setZoomPasscode(profile.zoom_passcode)
      }
    }
  }, [isVirtual, editingId, showForm, profile])

  const loadZoomCalls = async () => {
    const { data, error } = await supabase
      .from("zoom_calls")
      .select("*")
      .order("scheduled_at", { ascending: false })

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load meetings",
        variant: "destructive",
      })
    } else {
      const calls = data || []
      
      // Auto-update status for past events that are still marked as "upcoming"
      const now = new Date()
      const pastUpcoming = calls.filter(call => {
        if (call.status !== "upcoming") return false
        // For events with end_date, use that; otherwise use scheduled_at
        const eventEndDate = call.end_date 
          ? new Date(call.end_date + "T23:59:59") 
          : new Date(call.scheduled_at)
        // Add duration for meetings without end_date
        if (!call.end_date && call.duration_minutes) {
          eventEndDate.setMinutes(eventEndDate.getMinutes() + call.duration_minutes)
        }
        return eventEndDate < now
      })
      
      // Update past events to "completed" status
      if (pastUpcoming.length > 0) {
        const ids = pastUpcoming.map(c => c.id)
        await supabase
          .from("zoom_calls")
          .update({ status: "completed" })
          .in("id", ids)
        
        // Update local state with the corrected status
        calls.forEach(call => {
          if (ids.includes(call.id)) {
            call.status = "completed"
          }
        })
      }
      
      setZoomCalls(calls)
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
    setRecurrenceEndDate("")
    setZoomLink("")
    setZoomMeetingId("")
    setZoomPasscode("")
    setRecordingUrl("")
    setRecordingPlatform("vimeo")
    setStatus("upcoming")
    setSendEmailNotification(true)
    setEventType("meeting")
    setEndDate("")
    // Reset time picker state
    setStartHour("")
    setStartMinute("00")
    setStartAmPm("AM")
    setEndHour("")
    setEndMinute("00")
    setEndAmPm("PM")
    setLocation("")
    setIsVirtual(true)
    setTimezone("America/New_York")
    setEditingId(null)
    setShowForm(false)
  }

  // Prefill zoom fields from user's profile settings
  const prefillZoomFromProfile = () => {
    if (profile?.zoom_link && !zoomLink) {
      setZoomLink(profile.zoom_link)
    }
    if (profile?.zoom_meeting_id && !zoomMeetingId) {
      setZoomMeetingId(profile.zoom_meeting_id)
    }
    if (profile?.zoom_passcode && !zoomPasscode) {
      setZoomPasscode(profile.zoom_passcode)
    }
  }

  // Handle creating a new meeting - prefill zoom fields if available
  const handleNewMeeting = () => {
    // Reset form first
    setTitle("")
    setDescription("")
    setCallType("coach_only")
    setScheduledAt("")
    setDurationMinutes(60)
    setIsRecurring(false)
    setRecurrencePattern("")
    setRecurrenceDay("")
    setRecurrenceEndDate("")
    setRecordingUrl("")
    setRecordingPlatform("vimeo")
    setStatus("upcoming")
    setSendEmailNotification(true)
    setEventType("meeting")
    setEndDate("")
    // Reset time picker state
    setStartHour("")
    setStartMinute("00")
    setStartAmPm("AM")
    setEndHour("")
    setEndMinute("00")
    setEndAmPm("PM")
    setLocation("")
    setIsVirtual(true)
    setTimezone("America/New_York")
    setEditingId(null)
    
    // Prefill zoom details from profile if available
    setZoomLink(profile?.zoom_link || "")
    setZoomMeetingId(profile?.zoom_meeting_id || "")
    setZoomPasscode(profile?.zoom_passcode || "")
    
    setShowForm(true)
  }

  const handleEdit = (call: ZoomCall, e?: React.MouseEvent) => {
    e?.stopPropagation()
    e?.preventDefault()
    
    // Format the scheduled date for datetime-local input
    // Handle both ISO string and other date formats
    let formattedScheduledAt = ""
    try {
      const date = new Date(call.scheduled_at)
      if (!isNaN(date.getTime())) {
        formattedScheduledAt = date.toISOString().slice(0, 16)
      }
    } catch (err) {
      console.error("Error parsing scheduled_at:", err)
    }
    
    // Set event type first so the correct form fields render
    setEventType(call.event_type || "meeting")
    
    // Then set all other fields
    setTitle(call.title)
    setDescription(call.description || "")
    setCallType(call.call_type)
    setScheduledAt(formattedScheduledAt)
    setDurationMinutes(call.duration_minutes || 60)
    setIsRecurring(call.is_recurring || false)
    setRecurrencePattern(call.recurrence_pattern || "")
    setRecurrenceDay(call.recurrence_day || "")
    setRecurrenceEndDate(call.recurrence_end_date || "")
    setZoomLink(call.zoom_link || "")
    setZoomMeetingId(call.zoom_meeting_id || "")
    setZoomPasscode(call.zoom_passcode || "")
    setRecordingUrl(call.recording_url || "")
    setRecordingPlatform(call.recording_platform || "")
    setStatus(call.status)
    setEndDate(call.end_date || "")
    // Parse start time
    const startParsed = from24Hour(call.start_time || "")
    setStartHour(startParsed.hour)
    setStartMinute(startParsed.minute)
    setStartAmPm(startParsed.ampm)
    // Parse end time
    const endParsed = from24Hour(call.end_time || "")
    setEndHour(endParsed.hour)
    setEndMinute(endParsed.minute)
    setEndAmPm(endParsed.ampm)
    setLocation(call.location || "")
    setIsVirtual(call.is_virtual !== false)
    setTimezone(call.timezone || "America/New_York")
    setEditingId(call.id)
    setShowForm(true)
    
    // Scroll to top so user can see the form
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }, 100)
  }

  const handleDelete = async (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation()
    e?.preventDefault()
    
    if (!confirm("Are you sure you want to delete this meeting/event?")) return

    const { error } = await supabase.from("zoom_calls").delete().eq("id", id)

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete meeting",
        variant: "destructive",
      })
    } else {
      toast({
        title: "Success",
        description: "Meeting deleted",
      })
      trackChange()
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

    // Validate required fields
    if (!scheduledAt) {
      toast({
        title: "Missing Date",
        description: "Please select a date and time for the meeting/event",
        variant: "destructive",
      })
      return
    }

    const scheduledDate = new Date(scheduledAt)
    if (isNaN(scheduledDate.getTime())) {
      toast({
        title: "Invalid Date",
        description: "The selected date is invalid. Please select a valid date.",
        variant: "destructive",
      })
      return
    }

    // Validate recurring fields
    if (isRecurring && eventType === "meeting") {
      if (!recurrencePattern || !recurrenceDay || !recurrenceEndDate) {
        toast({
          title: "Missing Information",
          description: "Please select pattern, day, and end date for recurring meetings",
          variant: "destructive",
        })
        return
      }
    }

    setSubmitting(true)
    const callData = {
      title,
      description: description || null,
      call_type: callType,
      scheduled_at: scheduledDate.toISOString(),
      timezone,
      duration_minutes: eventType === "event" ? null : durationMinutes,
      is_recurring: isRecurring,
      recurrence_pattern: isRecurring ? recurrencePattern : null,
      recurrence_day: isRecurring ? recurrenceDay : null,
      recurrence_end_date: isRecurring ? recurrenceEndDate : null,
      zoom_link: isVirtual ? (zoomLink || null) : null,
      zoom_meeting_id: isVirtual ? (zoomMeetingId || null) : null,
      zoom_passcode: isVirtual ? (zoomPasscode || null) : null,
      recording_url: recordingUrl || null,
      recording_platform: recordingPlatform || null,
      recording_available_at: recordingUrl ? new Date().toISOString() : null,
      status,
      created_by: user.id,
      event_type: eventType,
      end_date: eventType === "event" && endDate ? endDate : null,
      start_time: eventType === "event" && startTime ? startTime : null,
      end_time: eventType === "event" && endTime ? endTime : null,
      location: location || null,
      is_virtual: isVirtual,
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
        description: error.message || "Failed to save meeting",
        variant: "destructive",
      })
      setSubmitting(false)
      return
    }
    
    toast({
      title: "Success",
      description: editingId ? "Meeting updated" : "Meeting created",
    })
    trackChange()

    // Send email notifications if enabled and this is a new meeting (not editing)
    if (sendEmailNotification && !editingId && status === "upcoming") {
      try {
        // Get all users with email notifications enabled
        const { data: usersData, error: usersError } = await supabase
          .from("profiles")
          .select("id, email, full_name, notification_email")
          .not("email", "is", null)

        if (!usersError && usersData) {
          // Get users with email notifications enabled
          const { data: notificationSettings } = await supabase
            .from("notification_settings")
            .select("user_id")
            .eq("email_notifications", true)
            .eq("announcements_enabled", true)

          const userIdsWithEmailEnabled = new Set(
            notificationSettings?.map((ns) => ns.user_id) || []
          )

          // Filter users with email notifications enabled
          const usersToEmail = usersData.filter(
            (u) => userIdsWithEmailEnabled.has(u.id) && u.email
          )

          // Format date and time for email
          const meetingDate = scheduledDate.toLocaleDateString(undefined, {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric'
          })
          const meetingTime = scheduledDate.toLocaleTimeString(undefined, {
            hour: 'numeric',
            minute: '2-digit'
          })

          // Send batch emails using Resend batch API (up to 100 at once)
          if (usersToEmail.length > 0) {
            const recipients = usersToEmail.map(u => ({
              to: u.notification_email || u.email!,
              fullName: u.full_name || "Coach"
            }))

            const { success, sent, error } = await sendBatchMeetingEmail({
              recipients,
              meetingTitle: title,
              meetingDescription: description || undefined,
              meetingDate,
              meetingTime,
              durationMinutes,
              callType,
              zoomLink: zoomLink || undefined,
              zoomMeetingId: zoomMeetingId || undefined,
              zoomPasscode: zoomPasscode || undefined,
              isRecurring,
              recurrencePattern: isRecurring ? recurrencePattern : undefined,
            })

            if (success && sent && sent > 0) {
              toast({
                title: "Emails Sent",
                description: `Sent ${sent} email notification(s)`,
              })
            } else if (error) {
              console.error("Batch email error:", error)
            }
          }
        }
      } catch (emailError) {
        console.error("Error sending meeting emails:", emailError)
        // Don't fail the meeting creation if emails fail
      }
    }

    resetForm()
    loadZoomCalls()
    setSubmitting(false)
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
        <h1 className="font-heading font-bold text-2xl sm:text-3xl text-optavia-dark">Manage Meetings & Events</h1>
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
            onClick={handleNewMeeting}
            className="bg-[hsl(var(--optavia-green))] hover:bg-[hsl(var(--optavia-green-dark))]"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Meeting / Event
          </Button>
        ) : (
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-optavia-dark">
                {editingId ? "Edit Meeting / Event" : "Schedule New Meeting / Event"}
              </CardTitle>
              <CardDescription className="text-optavia-gray">
                Schedule a meeting or event for coaches or coaches with clients
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Event Type Toggle */}
                <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <Label className="text-optavia-dark font-medium">Type:</Label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={eventType === "meeting" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setEventType("meeting")}
                      className={eventType === "meeting" 
                        ? "bg-[hsl(var(--optavia-green))] hover:bg-[hsl(var(--optavia-green-dark))]" 
                        : "border-gray-300 text-optavia-dark hover:bg-gray-100"
                      }
                    >
                      <Video className="h-4 w-4 mr-1" />
                      Meeting
                    </Button>
                    <Button
                      type="button"
                      variant={eventType === "event" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setEventType("event")}
                      className={eventType === "event" 
                        ? "bg-[hsl(var(--optavia-green))] hover:bg-[hsl(var(--optavia-green-dark))]" 
                        : "border-gray-300 text-optavia-dark hover:bg-gray-100"
                      }
                    >
                      <Calendar className="h-4 w-4 mr-1" />
                      Event
                    </Button>
                  </div>
                  <span className="text-sm text-optavia-gray ml-2">
                    {eventType === "meeting" 
                      ? "Single time-slot meeting (e.g., Zoom call)" 
                      : "Multi-day event (e.g., incentive trip, conference)"
                    }
                  </span>
                </div>

                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-optavia-dark">Title *</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder={eventType === "event" ? "e.g., 2026 Optavia Mexico Trip" : "e.g., Weekly Coach Training"}
                      required
                      className="border-gray-300"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="callType" className="text-optavia-dark">Audience *</Label>
                    <Select value={callType} onValueChange={(v) => setCallType(v as typeof callType)}>
                      <SelectTrigger className="border-gray-300">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white border border-gray-200 shadow-lg">
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
                    {eventType === "event" ? "Event Dates" : "Scheduling"}
                  </h4>
                  
                  {eventType === "event" ? (
                    /* Event date range */
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="scheduledAt" className="text-optavia-dark">Start Date *</Label>
                          <Input
                            id="scheduledAt"
                            type="date"
                            value={scheduledAt ? scheduledAt.split("T")[0] : ""}
                            onChange={(e) => setScheduledAt(e.target.value + "T00:00")}
                            required
                            className="border-gray-300"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="endDate" className="text-optavia-dark">End Date *</Label>
                          <Input
                            id="endDate"
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            required
                            className="border-gray-300"
                            min={scheduledAt ? scheduledAt.split("T")[0] : undefined}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="status" className="text-optavia-dark">Status</Label>
                          <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
                            <SelectTrigger className="border-gray-300">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-white border border-gray-200 shadow-lg">
                              <SelectItem value="upcoming">Upcoming</SelectItem>
                              <SelectItem value="live">In Progress</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
                              <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Optional Time Fields - Safari-compatible dropdowns */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-optavia-dark flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            Start Time <span className="text-gray-400 font-normal text-xs">(optional)</span>
                          </Label>
                          <div className="flex items-center gap-2">
                            <select
                              value={startHour}
                              onChange={(e) => setStartHour(e.target.value)}
                              className="w-20 h-10 text-center border rounded-md bg-white focus:ring-2 focus:ring-[hsl(var(--optavia-green))] focus:border-[hsl(var(--optavia-green))]"
                            >
                              <option value="">--</option>
                              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((h) => (
                                <option key={h} value={h}>{h}</option>
                              ))}
                            </select>
                            <span className="text-lg font-bold text-gray-400">:</span>
                            <select
                              value={startMinute}
                              onChange={(e) => setStartMinute(e.target.value)}
                              className="w-20 h-10 text-center border rounded-md bg-white focus:ring-2 focus:ring-[hsl(var(--optavia-green))] focus:border-[hsl(var(--optavia-green))]"
                            >
                              {["00", "15", "30", "45"].map((m) => (
                                <option key={m} value={m}>{m}</option>
                              ))}
                            </select>
                            <div className="flex rounded-md border overflow-hidden">
                              <button
                                type="button"
                                onClick={() => setStartAmPm("AM")}
                                className={`px-3 h-10 font-medium transition-colors ${
                                  startAmPm === "AM"
                                    ? "bg-[hsl(var(--optavia-green))] text-white"
                                    : "bg-white text-gray-700 hover:bg-gray-100"
                                }`}
                              >
                                AM
                              </button>
                              <button
                                type="button"
                                onClick={() => setStartAmPm("PM")}
                                className={`px-3 h-10 font-medium transition-colors ${
                                  startAmPm === "PM"
                                    ? "bg-[hsl(var(--optavia-green))] text-white"
                                    : "bg-white text-gray-700 hover:bg-gray-100"
                                }`}
                              >
                                PM
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-optavia-dark flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            End Time <span className="text-gray-400 font-normal text-xs">(optional)</span>
                          </Label>
                          <div className="flex items-center gap-2">
                            <select
                              value={endHour}
                              onChange={(e) => setEndHour(e.target.value)}
                              className="w-20 h-10 text-center border rounded-md bg-white focus:ring-2 focus:ring-[hsl(var(--optavia-green))] focus:border-[hsl(var(--optavia-green))]"
                            >
                              <option value="">--</option>
                              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((h) => (
                                <option key={h} value={h}>{h}</option>
                              ))}
                            </select>
                            <span className="text-lg font-bold text-gray-400">:</span>
                            <select
                              value={endMinute}
                              onChange={(e) => setEndMinute(e.target.value)}
                              className="w-20 h-10 text-center border rounded-md bg-white focus:ring-2 focus:ring-[hsl(var(--optavia-green))] focus:border-[hsl(var(--optavia-green))]"
                            >
                              {["00", "15", "30", "45"].map((m) => (
                                <option key={m} value={m}>{m}</option>
                              ))}
                            </select>
                            <div className="flex rounded-md border overflow-hidden">
                              <button
                                type="button"
                                onClick={() => setEndAmPm("AM")}
                                className={`px-3 h-10 font-medium transition-colors ${
                                  endAmPm === "AM"
                                    ? "bg-[hsl(var(--optavia-green))] text-white"
                                    : "bg-white text-gray-700 hover:bg-gray-100"
                                }`}
                              >
                                AM
                              </button>
                              <button
                                type="button"
                                onClick={() => setEndAmPm("PM")}
                                className={`px-3 h-10 font-medium transition-colors ${
                                  endAmPm === "PM"
                                    ? "bg-[hsl(var(--optavia-green))] text-white"
                                    : "bg-white text-gray-700 hover:bg-gray-100"
                                }`}
                              >
                                PM
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-optavia-gray">
                        Leave times empty for all-day events. Times are optional for multi-day events.
                      </p>
                    </div>
                  ) : (
                    /* Meeting date/time */
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
                          <SelectContent className="bg-white border border-gray-200 shadow-lg">
                            <SelectItem value="upcoming">Upcoming</SelectItem>
                            <SelectItem value="live">Live</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}

                  {/* Timezone Selector */}
                  <div className="space-y-2">
                    <Label htmlFor="timezone" className="text-optavia-dark flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      Time Zone
                    </Label>
                    <Select value={timezone} onValueChange={setTimezone}>
                      <SelectTrigger className="border-gray-300">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white border border-gray-200 shadow-lg">
                        {US_TIMEZONES.map(tz => (
                          <SelectItem key={tz.value} value={tz.value}>{tz.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-optavia-gray">
                      Select the timezone for this meeting. Times will be displayed in each user's local timezone.
                    </p>
                  </div>

                  {/* Recurring Toggle - only for meetings */}
                  {eventType === "meeting" && (
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
                  )}

                  {isRecurring && eventType === "meeting" && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label className="text-optavia-dark">Pattern *</Label>
                        <Select value={recurrencePattern} onValueChange={setRecurrencePattern} required>
                          <SelectTrigger className={`border-gray-300 ${!recurrencePattern ? 'border-red-300' : ''}`}>
                            <SelectValue placeholder="Select pattern" />
                          </SelectTrigger>
                          <SelectContent className="bg-white border border-gray-200 shadow-lg">
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="biweekly">Bi-weekly</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                          </SelectContent>
                        </Select>
                        {!recurrencePattern && (
                          <p className="text-xs text-red-500">Please select a pattern</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label className="text-optavia-dark">Day *</Label>
                        <Select value={recurrenceDay} onValueChange={setRecurrenceDay} required>
                          <SelectTrigger className={`border-gray-300 ${!recurrenceDay ? 'border-red-300' : ''}`}>
                            <SelectValue placeholder="Select day" />
                          </SelectTrigger>
                          <SelectContent className="bg-white border border-gray-200 shadow-lg">
                            <SelectItem value="Monday">Monday</SelectItem>
                            <SelectItem value="Tuesday">Tuesday</SelectItem>
                            <SelectItem value="Wednesday">Wednesday</SelectItem>
                            <SelectItem value="Thursday">Thursday</SelectItem>
                            <SelectItem value="Friday">Friday</SelectItem>
                            <SelectItem value="Saturday">Saturday</SelectItem>
                            <SelectItem value="Sunday">Sunday</SelectItem>
                          </SelectContent>
                        </Select>
                        {!recurrenceDay && (
                          <p className="text-xs text-red-500">Please select a day</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label className="text-optavia-dark">End Date *</Label>
                        <Input
                          type="date"
                          value={recurrenceEndDate}
                          onChange={(e) => setRecurrenceEndDate(e.target.value)}
                          min={scheduledAt ? scheduledAt.split("T")[0] : undefined}
                          required
                          className={`border-gray-300 ${!recurrenceEndDate ? 'border-red-300' : ''}`}
                        />
                        {!recurrenceEndDate && (
                          <p className="text-xs text-red-500">Please select an end date</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Location & Format */}
                <div className="bg-amber-50 rounded-lg p-4 space-y-4">
                  <h4 className="font-medium text-optavia-dark text-sm flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-amber-600" />
                    Location & Format
                  </h4>

                  {/* Virtual/In-Person Toggle */}
                  <div className="flex items-center gap-4">
                    <Label className="text-optavia-dark font-medium">Format:</Label>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant={isVirtual ? "default" : "outline"}
                        size="sm"
                        onClick={() => setIsVirtual(true)}
                        className={isVirtual 
                          ? "bg-blue-600 hover:bg-blue-700" 
                          : "border-gray-300 text-optavia-dark hover:bg-gray-100"
                        }
                      >
                        <Globe className="h-4 w-4 mr-1" />
                        Virtual
                      </Button>
                      <Button
                        type="button"
                        variant={!isVirtual ? "default" : "outline"}
                        size="sm"
                        onClick={() => setIsVirtual(false)}
                        className={!isVirtual 
                          ? "bg-amber-600 hover:bg-amber-700" 
                          : "border-gray-300 text-optavia-dark hover:bg-gray-100"
                        }
                      >
                        <MapPin className="h-4 w-4 mr-1" />
                        In-Person
                      </Button>
                    </div>
                  </div>

                  {/* Location field - show for in-person or events */}
                  {(!isVirtual || eventType === "event") && (
                    <div className="space-y-2">
                      <Label htmlFor="location" className="text-optavia-dark">
                        Location {!isVirtual && "*"}
                      </Label>
                      <Input
                        id="location"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder={eventType === "event" 
                          ? "e.g., Cancun, Mexico" 
                          : "e.g., Conference Room A, 123 Main St"
                        }
                        required={!isVirtual}
                        className="border-gray-300"
                      />
                      <p className="text-xs text-optavia-gray">
                        {eventType === "event" 
                          ? "Where is this event taking place?" 
                          : "Enter the address or venue for this in-person meeting"
                        }
                      </p>
                    </div>
                  )}
                </div>

                {/* Zoom Details - only show for virtual */}
                {isVirtual && (
                <div className="bg-blue-50 rounded-lg p-4 space-y-4">
                  <h4 className="font-medium text-optavia-dark text-sm flex items-center gap-2">
                    <Video className="h-4 w-4 text-blue-600" />
                    {eventType === "event" ? "Virtual Meeting Details (Optional)" : "Zoom Details"}
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
                )}

                {/* Recording (for completed calls) - only for virtual meetings */}
                {isVirtual && (
                <div className="bg-green-50 rounded-lg p-4 space-y-4">
                  <h4 className="font-medium text-optavia-dark text-sm flex items-center gap-2">
                    <PlayCircle className="h-4 w-4 text-green-600" />
                    Vimeo Recording (add after call ends)
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="recordingUrl" className="text-optavia-dark">Vimeo URL</Label>
                      <Input
                        id="recordingUrl"
                        value={recordingUrl}
                        onChange={(e) => setRecordingUrl(e.target.value)}
                        placeholder="https://vimeo.com/..."
                        className="border-gray-300"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="recordingPlatform" className="text-optavia-dark">Platform</Label>
                      <Select value={recordingPlatform} onValueChange={(v) => setRecordingPlatform(v as typeof recordingPlatform)}>
                        <SelectTrigger className="border-gray-300">
                          <SelectValue placeholder="Vimeo" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border border-gray-200 shadow-lg">
                          <SelectItem value="vimeo">Vimeo</SelectItem>
                          <SelectItem value="zoom">Zoom</SelectItem>
                          <SelectItem value="youtube">YouTube</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                )}

                {/* Email Notification Toggle */}
                {!editingId && (
                  <div className="bg-purple-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Mail className="h-5 w-5 text-purple-600" />
                        <div>
                          <Label htmlFor="sendEmail" className="text-optavia-dark font-medium cursor-pointer">
                            Send Email Notification
                          </Label>
                          <p className="text-xs text-optavia-gray mt-0.5">
                            Notify all coaches about this new {eventType === "event" ? "event" : "meeting"}
                          </p>
                        </div>
                      </div>
                      <Switch
                        id="sendEmail"
                        checked={sendEmailNotification}
                        onCheckedChange={setSendEmailNotification}
                      />
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="bg-[hsl(var(--optavia-green))] hover:bg-[hsl(var(--optavia-green-dark))]"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        {sendEmailNotification && !editingId ? "Saving & Sending..." : "Saving..."}
                      </>
                    ) : (
                      <>{editingId ? "Update" : "Create"} Meeting / Event</>
                    )}
                  </Button>
                  <Button type="button" variant="outline" onClick={resetForm} disabled={submitting}>
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
          <h2 className="font-heading font-bold text-xl text-optavia-dark">All Meetings & Events</h2>
          {zoomCalls.length > 0 && (
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              {/* Type Filter */}
              <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
                <Button
                  variant={typeFilter === "all" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setTypeFilter("all")}
                  className={typeFilter === "all" 
                    ? "bg-white shadow-sm text-optavia-dark hover:bg-white" 
                    : "text-optavia-gray hover:bg-gray-200"
                  }
                >
                  All
                </Button>
                <Button
                  variant={typeFilter === "meeting" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setTypeFilter("meeting")}
                  className={typeFilter === "meeting" 
                    ? "bg-white shadow-sm text-optavia-dark hover:bg-white" 
                    : "text-optavia-gray hover:bg-gray-200"
                  }
                >
                  <Video className="h-3 w-3 mr-1" />
                  Meetings
                </Button>
                <Button
                  variant={typeFilter === "event" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setTypeFilter("event")}
                  className={typeFilter === "event" 
                    ? "bg-white shadow-sm text-optavia-dark hover:bg-white" 
                    : "text-optavia-gray hover:bg-gray-200"
                  }
                >
                  <Calendar className="h-3 w-3 mr-1" />
                  Events
                </Button>
              </div>

              {/* Search */}
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search..."
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
            </div>
          )}
        </div>

        {zoomCalls.length === 0 ? (
          <Card className="bg-white border border-gray-200">
            <CardContent className="pt-6">
              <p className="text-center text-optavia-gray">No meetings or events scheduled yet. Create one to get started.</p>
            </CardContent>
          </Card>
        ) : (() => {
          const filteredCalls = zoomCalls.filter((call) => {
            // Apply type filter
            if (typeFilter !== "all") {
              const callEventType = call.event_type || "meeting"
              if (callEventType !== typeFilter) return false
            }
            
            // Apply search filter
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
                    No meetings found matching "{searchQuery}"
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
                        {call.end_date && call.end_date !== call.scheduled_at.split('T')[0] && (
                          <> - {new Date(call.end_date + 'T00:00:00').toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric'
                          })}</>
                        )}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {call.start_time ? (
                          // Show start_time and end_time for events
                          <>
                            {(() => {
                              const [h, m] = call.start_time.split(':')
                              const hour24 = parseInt(h)
                              const ampm = hour24 >= 12 ? 'PM' : 'AM'
                              const hour12 = hour24 % 12 || 12
                              return `${hour12}:${m} ${ampm}`
                            })()}
                            {call.end_time && (
                              <>
                                {' - '}
                                {(() => {
                                  const [h, m] = call.end_time.split(':')
                                  const hour24 = parseInt(h)
                                  const ampm = hour24 >= 12 ? 'PM' : 'AM'
                                  const hour12 = hour24 % 12 || 12
                                  return `${hour12}:${m} ${ampm}`
                                })()}
                              </>
                            )}
                          </>
                        ) : (
                          // Show scheduled_at time and duration for meetings
                          <>
                            {new Date(call.scheduled_at).toLocaleTimeString(undefined, {
                              hour: 'numeric',
                              minute: '2-digit'
                            })}
                            {' '}({call.duration_minutes} min)
                          </>
                        )}
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

      {/* Floating Save Button & Leave Dialog */}
      <AdminSaveButton
        hasUnsavedChanges={hasUnsavedChanges}
        isSaving={isSaving}
        changeCount={changeCount}
        onSave={saveChanges}
        showLeaveDialog={showLeaveDialog}
        onConfirmLeave={confirmLeave}
        onSaveAndLeave={saveAndLeave}
        onCancelLeave={cancelLeave}
      />
    </div>
  )
}
