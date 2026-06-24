"use client"

import { useState, useEffect, useRef } from "react"
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
  MapPin, Globe, ImageIcon, Upload
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
import { generateRecurringInstances, generateFutureInstances } from "@/lib/generate-recurring-instances"

type EditScope = "this" | "future" | "all"

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
  
  // Edit scope dialog state (for recurring events)
  const [showEditScopeDialog, setShowEditScopeDialog] = useState(false)
  const [pendingEditCall, setPendingEditCall] = useState<ZoomCall | null>(null)
  const [editScope, setEditScope] = useState<EditScope>("this")
  
  // Delete scope dialog state (for recurring events)
  const [showDeleteScopeDialog, setShowDeleteScopeDialog] = useState(false)
  const [pendingDeleteCall, setPendingDeleteCall] = useState<ZoomCall | null>(null)
  const [deleteScope, setDeleteScope] = useState<EditScope>("this")

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
  const [imageUrl, setImageUrl] = useState("")
  const [uploadingImage, setUploadingImage] = useState(false)
  const imageInputRef = useRef<HTMLInputElement>(null)

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
      .order("scheduled_at", { ascending: true })

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load meetings",
        variant: "destructive",
      })
    } else {
      const now = new Date()
      const todayStart = new Date(now)
      todayStart.setHours(0, 0, 0, 0)
      
      // Filter for admin view:
      // 1. Only show parent/template events (not instances with parent_id)
      // 2. Only show present and future events (scheduled today or later, or recurring with future end date)
      const calls = (data || []).filter(call => {
        // Exclude instances - only show parents/templates and standalone events
        if (call.parent_id) return false
        
        // For recurring events, check if recurrence_end_date is in the future
        if (call.is_recurring && call.recurrence_end_date) {
          const endDate = new Date(call.recurrence_end_date)
          return endDate >= todayStart
        }
        
        // For non-recurring events, check scheduled_at or end_date
        const eventDate = call.end_date 
          ? new Date(call.end_date) 
          : new Date(call.scheduled_at)
        return eventDate >= todayStart
      })
      
      // Auto-update status for past events that are still marked as "upcoming"
      // For recurring events, check recurrence_end_date, not scheduled_at
      const pastUpcoming = (data || []).filter(call => {
        if (call.status !== "upcoming") return false
        
        // For recurring events, check recurrence_end_date
        if (call.is_recurring && call.recurrence_end_date) {
          const recurrenceEnd = new Date(call.recurrence_end_date + "T23:59:59")
          return recurrenceEnd < now
        }
        
        // For non-recurring events with end_date, use that; otherwise use scheduled_at
        const eventEndDate = call.end_date 
          ? new Date(call.end_date + "T23:59:59") 
          : new Date(call.scheduled_at)
        // Add duration for meetings without end_date
        if (!call.end_date && call.duration_minutes) {
          eventEndDate.setMinutes(eventEndDate.getMinutes() + call.duration_minutes)
        }
        return eventEndDate < now
      })
      
      // Also fix any recurring events incorrectly marked as completed but still have future occurrences
      const incorrectlyCompleted = (data || []).filter(call => {
        if (call.status !== "completed") return false
        if (!call.is_recurring || !call.recurrence_end_date) return false
        const recurrenceEnd = new Date(call.recurrence_end_date + "T23:59:59")
        return recurrenceEnd >= now
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
      
      // Fix incorrectly completed recurring events back to upcoming
      if (incorrectlyCompleted.length > 0) {
        const ids = incorrectlyCompleted.map(c => c.id)
        await supabase
          .from("zoom_calls")
          .update({ status: "upcoming" })
          .in("id", ids)
        
        // Update local state
        calls.forEach(call => {
          if (ids.includes(call.id)) {
            call.status = "upcoming"
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
    setImageUrl("")
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

  // Handle image upload for events (uses service role via API)
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file (JPG, PNG, GIF, WebP)",
        variant: "destructive",
      })
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 5MB",
        variant: "destructive",
      })
      return
    }

    setUploadingImage(true)

    try {
      // Upload via API route (uses service role)
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/upload-event-image", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to upload image")
      }

      setImageUrl(data.url)

      toast({
        title: "Success",
        description: "Image uploaded successfully",
      })
    } catch (error: any) {
      console.error("Error uploading image:", error)
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload image",
        variant: "destructive",
      })
    } finally {
      setUploadingImage(false)
      if (imageInputRef.current) {
        imageInputRef.current.value = ""
      }
    }
  }

  // Remove uploaded image (uses service role via API)
  const handleRemoveImage = async () => {
    if (!imageUrl) return

    try {
      // Delete via API route (uses service role)
      const response = await fetch(`/api/upload-event-image?url=${encodeURIComponent(imageUrl)}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const data = await response.json()
        console.error("Error removing image:", data.error)
      }

      setImageUrl("")
      toast({
        title: "Success",
        description: "Image removed",
      })
    } catch (error: any) {
      console.error("Error removing image:", error)
      // Still clear the URL even if delete fails
      setImageUrl("")
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
    setImageUrl("")
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
    
    // If this is a recurring event (legacy or instance-based), show the edit scope dialog
    if (call.is_recurring || call.parent_id) {
      setPendingEditCall(call)
      setEditScope("this")
      setShowEditScopeDialog(true)
      return
    }
    
    // For non-recurring events, directly open the form
    loadEditForm(call)
  }
  
  // Actually load the edit form with the call data
  const loadEditForm = (call: ZoomCall) => {
    // Format the scheduled date for datetime-local input
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
    setImageUrl(call.image_url || "")
    setEditingId(call.id)
    setShowForm(true)
    
    // Close the scope dialog if it was open
    setShowEditScopeDialog(false)
    setPendingEditCall(null)
    
    // Scroll to top so user can see the form
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }, 100)
  }
  
  // Handle edit scope selection for recurring events
  const handleEditScopeConfirm = () => {
    if (!pendingEditCall) return
    
    // Store the edit scope for use during submission
    // The editScope state is already set via radio buttons
    loadEditForm(pendingEditCall)
  }

  const handleDelete = async (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation()
    e?.preventDefault()
    
    // Find the call to check if it's recurring
    const call = zoomCalls.find(c => c.id === id)
    
    if (call && (call.is_recurring || call.parent_id)) {
      // Show delete scope dialog for recurring events
      setPendingDeleteCall(call)
      setDeleteScope("this")
      setShowDeleteScopeDialog(true)
      return
    }
    
    // For non-recurring events, just confirm and delete
    if (!confirm("Are you sure you want to delete this meeting/event?")) return
    await performDelete(id)
  }
  
  // Actually perform the delete based on scope
  const performDelete = async (id: string, scope?: EditScope) => {
    const call = zoomCalls.find(c => c.id === id)
    const isLegacyRecurring = call?.is_recurring && !call?.parent_id && !call?.is_template
    
    let error
    
    if (scope && call && (call.is_recurring || call.parent_id)) {
      if (isLegacyRecurring) {
        // For legacy recurring events, any delete removes the whole series
        const { error: deleteError } = await supabase.from("zoom_calls").delete().eq("id", id)
        error = deleteError
        
        if (!error && scope !== "all") {
          toast({
            title: "Note",
            description: "For this recurring series, all occurrences were deleted.",
          })
        }
      } else if (scope === "this") {
        // Delete just this instance
        const { error: deleteError } = await supabase.from("zoom_calls").delete().eq("id", id)
        error = deleteError
      } else if (scope === "future") {
        // Delete this instance and all future instances
        const currentDate = new Date(call.scheduled_at)
        const parentId = call.parent_id || id
        
        // Delete this instance
        const { error: deleteThisError } = await supabase.from("zoom_calls").delete().eq("id", id)
        
        if (!deleteThisError) {
          // Delete all future instances
          const { error: deleteFutureError } = await supabase
            .from("zoom_calls")
            .delete()
            .eq("parent_id", parentId)
            .gt("scheduled_at", currentDate.toISOString())
          error = deleteFutureError
        } else {
          error = deleteThisError
        }
      } else if (scope === "all") {
        // Delete the template (which cascades to delete all instances)
        const parentId = call.parent_id || id
        const { error: deleteError } = await supabase.from("zoom_calls").delete().eq("id", parentId)
        error = deleteError
      }
    } else {
      // Simple delete for non-recurring events
      const { error: deleteError } = await supabase.from("zoom_calls").delete().eq("id", id)
      error = deleteError
    }

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
    
    // Close the dialog
    setShowDeleteScopeDialog(false)
    setPendingDeleteCall(null)
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
      image_url: imageUrl || null,
    }

    let error
    
    // Get the current event being edited (if editing)
    const currentEvent = editingId ? zoomCalls.find(c => c.id === editingId) : null
    const isEditingRecurring = currentEvent?.is_recurring || currentEvent?.parent_id
    const isLegacyRecurring = currentEvent?.is_recurring && !currentEvent?.parent_id && !currentEvent?.is_template

    if (editingId && isEditingRecurring) {
      // Handle editing a recurring event based on edit scope
      
      if (isLegacyRecurring) {
        // For legacy recurring events (no instances), update the template directly
        // All options effectively do the same thing since occurrences are computed dynamically
        const { error: updateError } = await supabase
          .from("zoom_calls")
          .update(callData)
          .eq("id", editingId)
        error = updateError
        
        if (!error && editScope !== "all") {
          toast({
            title: "Note",
            description: "For this recurring series, all occurrences will be updated. To edit individual occurrences, create a new recurring event.",
          })
        }
      } else if (editScope === "this") {
        // Just update this single instance
        const { error: updateError } = await supabase
          .from("zoom_calls")
          .update(callData)
          .eq("id", editingId)
        error = updateError
      } else if (editScope === "future") {
        // Update this instance and all future instances
        const currentDate = new Date(currentEvent!.scheduled_at)
        const parentId = currentEvent!.parent_id || editingId
        
        // Update this instance
        const { error: updateError } = await supabase
          .from("zoom_calls")
          .update(callData)
          .eq("id", editingId)
        
        if (!updateError) {
          // Update all future instances (scheduled after this one)
          const { error: futureError } = await supabase
            .from("zoom_calls")
            .update({
              title,
              description: description || null,
              call_type: callType,
              zoom_link: isVirtual ? (zoomLink || null) : null,
              zoom_meeting_id: isVirtual ? (zoomMeetingId || null) : null,
              zoom_passcode: isVirtual ? (zoomPasscode || null) : null,
              location: location || null,
              is_virtual: isVirtual,
              image_url: imageUrl || null,
            })
            .eq("parent_id", parentId)
            .gt("scheduled_at", currentDate.toISOString())
          error = futureError
        } else {
          error = updateError
        }
      } else if (editScope === "all") {
        // Update the template and ALL instances
        const parentId = currentEvent!.parent_id || editingId
        
        // First, update the template
        const templateUpdate = {
          title,
          description: description || null,
          call_type: callType,
          zoom_link: isVirtual ? (zoomLink || null) : null,
          zoom_meeting_id: isVirtual ? (zoomMeetingId || null) : null,
          zoom_passcode: isVirtual ? (zoomPasscode || null) : null,
          location: location || null,
          is_virtual: isVirtual,
          image_url: imageUrl || null,
          recurrence_pattern: isRecurring ? recurrencePattern : null,
          recurrence_day: isRecurring ? recurrenceDay : null,
          recurrence_end_date: isRecurring ? recurrenceEndDate : null,
        }
        
        const { error: templateError } = await supabase
          .from("zoom_calls")
          .update(templateUpdate)
          .eq("id", parentId)
        
        if (!templateError) {
          // Update all instances with the shared fields
          const { error: instancesError } = await supabase
            .from("zoom_calls")
            .update({
              title,
              description: description || null,
              call_type: callType,
              zoom_link: isVirtual ? (zoomLink || null) : null,
              zoom_meeting_id: isVirtual ? (zoomMeetingId || null) : null,
              zoom_passcode: isVirtual ? (zoomPasscode || null) : null,
              location: location || null,
              is_virtual: isVirtual,
              image_url: imageUrl || null,
            })
            .eq("parent_id", parentId)
          error = instancesError
        } else {
          error = templateError
        }
      }
    } else if (editingId) {
      // Regular non-recurring event edit
      const { error: updateError } = await supabase
        .from("zoom_calls")
        .update(callData)
        .eq("id", editingId)
      error = updateError
    } else {
      // Creating a new event
      if (isRecurring && eventType === "meeting") {
        // Create as a template first
        const templateData = {
          ...callData,
          is_template: true,
        }
        
        const { data: templateResult, error: templateError } = await supabase
          .from("zoom_calls")
          .insert(templateData)
          .select()
          .single()
        
        if (templateError) {
          error = templateError
        } else if (templateResult) {
          // Generate and insert all instances
          const instances = generateRecurringInstances(
            { ...callData, created_by: user.id } as ZoomCall,
            templateResult.id
          )
          
          if (instances.length > 0) {
            const { error: instancesError } = await supabase
              .from("zoom_calls")
              .insert(instances)
            error = instancesError
          }
        }
      } else {
        // Non-recurring event - just insert normally
        const { error: insertError } = await supabase.from("zoom_calls").insert(callData)
        error = insertError
      }
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
    
    // Reset edit scope
    setEditScope("this")

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

                {/* Event Image Upload */}
                <div className="bg-indigo-50 rounded-lg p-4 space-y-4">
                  <h4 className="font-medium text-optavia-dark text-sm flex items-center gap-2">
                    <ImageIcon className="h-4 w-4 text-indigo-600" />
                    Event Image <span className="text-gray-400 font-normal text-xs">(optional)</span>
                  </h4>
                  
                  <div className="flex flex-col sm:flex-row gap-4">
                    {/* Image Preview */}
                    <div className="w-full sm:w-48 h-32 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200">
                      {imageUrl ? (
                        <img 
                          src={imageUrl} 
                          alt="Event preview" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <ImageIcon className="h-12 w-12" />
                        </div>
                      )}
                    </div>
                    
                    {/* Upload Controls */}
                    <div className="flex-1 space-y-3">
                      <input
                        ref={imageInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => imageInputRef.current?.click()}
                          disabled={uploadingImage}
                          className="border-indigo-300 text-indigo-700 hover:bg-indigo-100"
                        >
                          {uploadingImage ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Uploading...
                            </>
                          ) : (
                            <>
                              <Upload className="h-4 w-4 mr-2" />
                              {imageUrl ? "Change Image" : "Upload Image"}
                            </>
                          )}
                        </Button>
                        {imageUrl && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleRemoveImage}
                            disabled={uploadingImage}
                            className="border-red-300 text-red-600 hover:bg-red-50"
                          >
                            <X className="h-4 w-4 mr-1" />
                            Remove
                          </Button>
                        )}
                      </div>
                      <p className="text-xs text-optavia-gray">
                        Add an image or graphic for this {eventType}. JPG, PNG, GIF or WebP. Max 5MB.
                      </p>
                    </div>
                  </div>
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
                        <Badge variant="outline" className="text-purple-600 border-purple-300 bg-purple-50">
                          🔄 {call.recurrence_pattern} on {call.recurrence_day}s
                          {call.recurrence_end_date && (
                            <span className="ml-1 text-xs opacity-75">
                              (until {new Date(call.recurrence_end_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })})
                            </span>
                          )}
                        </Badge>
                      )}
                      {call.is_template && (
                        <Badge variant="outline" className="text-blue-600 border-blue-300 bg-blue-50">
                          Template
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
                {/* Event Image */}
                {call.image_url && (
                  <div className="w-full max-w-xs">
                    <img 
                      src={call.image_url} 
                      alt={call.title} 
                      className="w-full h-24 object-cover rounded-lg border border-gray-200"
                    />
                  </div>
                )}

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

                {/* Recordings Link - show for completed events */}
                {call.status === "completed" && (
                  <a 
                    href="https://www.coachingamplifier.com/viewer?url=https%3A%2F%2Fdocs.google.com%2Fdocument%2Fd%2F1ad-MdPRzyrKflK2Y_mHmTBjU0lCVJydJJRsufFIDVko%2Fedit%3Ftab%3Dt.0&title=Trainings%20%26%20Resources"
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                  >
                    <PlayCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                    <span className="text-sm text-green-700 font-medium">View Recordings</span>
                    <ExternalLink className="h-4 w-4 ml-auto text-green-600" />
                  </a>
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

      {/* Edit Scope Dialog for Recurring Events */}
      {showEditScopeDialog && pendingEditCall && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => {
            setShowEditScopeDialog(false)
            setPendingEditCall(null)
          }}
        >
          <Card 
            className="w-full max-w-md bg-white"
            onClick={(e) => e.stopPropagation()}
          >
            <CardHeader>
              <CardTitle className="text-optavia-dark">Edit Recurring Event</CardTitle>
              <CardDescription>
                This is part of a recurring series. Which events would you like to edit?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <label className="flex items-start gap-3 p-3 rounded-lg border cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="radio"
                    name="editScope"
                    value="this"
                    checked={editScope === "this"}
                    onChange={() => setEditScope("this")}
                    className="mt-0.5"
                  />
                  <div>
                    <div className="font-medium text-optavia-dark">This event only</div>
                    <div className="text-sm text-optavia-gray">
                      Only edit this specific occurrence
                    </div>
                  </div>
                </label>
                
                <label className="flex items-start gap-3 p-3 rounded-lg border cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="radio"
                    name="editScope"
                    value="future"
                    checked={editScope === "future"}
                    onChange={() => setEditScope("future")}
                    className="mt-0.5"
                  />
                  <div>
                    <div className="font-medium text-optavia-dark">This and future events</div>
                    <div className="text-sm text-optavia-gray">
                      Edit this occurrence and all events after it
                    </div>
                  </div>
                </label>
                
                <label className="flex items-start gap-3 p-3 rounded-lg border cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="radio"
                    name="editScope"
                    value="all"
                    checked={editScope === "all"}
                    onChange={() => setEditScope("all")}
                    className="mt-0.5"
                  />
                  <div>
                    <div className="font-medium text-optavia-dark">All events in the series</div>
                    <div className="text-sm text-optavia-gray">
                      Edit every occurrence in this recurring series
                    </div>
                  </div>
                </label>
              </div>
              
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setShowEditScopeDialog(false)
                    setPendingEditCall(null)
                  }}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-[hsl(var(--optavia-green))] hover:bg-[hsl(var(--optavia-green))]/90"
                  onClick={handleEditScopeConfirm}
                >
                  Continue
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Delete Scope Dialog for Recurring Events */}
      {showDeleteScopeDialog && pendingDeleteCall && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => {
            setShowDeleteScopeDialog(false)
            setPendingDeleteCall(null)
          }}
        >
          <Card 
            className="w-full max-w-md bg-white"
            onClick={(e) => e.stopPropagation()}
          >
            <CardHeader>
              <CardTitle className="text-red-600">Delete Recurring Event</CardTitle>
              <CardDescription>
                This is part of a recurring series. Which events would you like to delete?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <label className="flex items-start gap-3 p-3 rounded-lg border cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="radio"
                    name="deleteScope"
                    value="this"
                    checked={deleteScope === "this"}
                    onChange={() => setDeleteScope("this")}
                    className="mt-0.5"
                  />
                  <div>
                    <div className="font-medium text-optavia-dark">This event only</div>
                    <div className="text-sm text-optavia-gray">
                      Only delete this specific occurrence
                    </div>
                  </div>
                </label>
                
                <label className="flex items-start gap-3 p-3 rounded-lg border cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="radio"
                    name="deleteScope"
                    value="future"
                    checked={deleteScope === "future"}
                    onChange={() => setDeleteScope("future")}
                    className="mt-0.5"
                  />
                  <div>
                    <div className="font-medium text-optavia-dark">This and future events</div>
                    <div className="text-sm text-optavia-gray">
                      Delete this occurrence and all events after it
                    </div>
                  </div>
                </label>
                
                <label className="flex items-start gap-3 p-3 rounded-lg border cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="radio"
                    name="deleteScope"
                    value="all"
                    checked={deleteScope === "all"}
                    onChange={() => setDeleteScope("all")}
                    className="mt-0.5"
                  />
                  <div>
                    <div className="font-medium text-optavia-dark">All events in the series</div>
                    <div className="text-sm text-optavia-gray">
                      Delete every occurrence in this recurring series
                    </div>
                  </div>
                </label>
              </div>
              
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setShowDeleteScopeDialog(false)
                    setPendingDeleteCall(null)
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={() => performDelete(pendingDeleteCall.id, deleteScope)}
                >
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
