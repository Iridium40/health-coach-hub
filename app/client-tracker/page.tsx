"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { useClients, getDayPhase, getProgramDay, parseLocalDate, type ClientStatus, type RecurringFrequency, type Client } from "@/hooks/use-clients"
import { useCoaches } from "@/hooks/use-coaches"
import { useDebounce } from "@/hooks/use-debounce"
import { useToast } from "@/hooks/use-toast"
import { getLocalDateString } from "@/lib/dateHelpers"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Users,
  Plus,
  Calendar,
  Star,
  AlertCircle,
  Clock,
  ChevronRight,
  MessageSquare,
  Sparkles,
  X,
  CalendarPlus,
  ExternalLink,
  Phone,
  Send,
  Repeat,
  CheckCircle,
  Circle,
  Search,
  Info,
  Video,
  Pencil,
  Loader2,
  Copy,
  Check,
  Mail,
  Lock,
} from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { MilestoneActionModal } from "@/components/milestone-action-modal"
import { ClientJourneyGuide } from "@/components/client-journey-guide"
import { ReminderButton } from "@/components/reminders-panel"
import { GraduationCap, Trophy, Heart, Download, Wrench, MessageCircleQuestion } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { sendCalendarInviteEmail } from "@/lib/email"
import { isMilestoneDay } from "@/hooks/use-touchpoint-templates"
import { useUserData } from "@/contexts/user-data-context"
import { ErrorBoundary } from "@/components/ui/error-boundary"
import { StatsCardsSkeleton, ClientListSkeleton } from "@/components/ui/skeleton-loaders"
import { ClientCard } from "@/components/client-tracker/client-card"
import { ClientTroubleshootingDialog } from "@/components/coach-tools/client-troubleshooting-dialog"
import { RecruitmentNavigator } from "@/components/recruitment-navigator"
import type { CalendarEvent } from "@/lib/calendar-utils"

// Days of the week
const DAYS_OF_WEEK = [
  { short: "Sun", full: "Sunday", value: 0 },
  { short: "Mon", full: "Monday", value: 1 },
  { short: "Tue", full: "Tuesday", value: 2 },
  { short: "Wed", full: "Wednesday", value: 3 },
  { short: "Thu", full: "Thursday", value: 4 },
  { short: "Fri", full: "Friday", value: 5 },
  { short: "Sat", full: "Saturday", value: 6 },
]

// Time options for picker
const HOUR_OPTIONS = Array.from({ length: 12 }, (_, i) => i + 1)
const MINUTE_OPTIONS = ["00", "15", "30", "45"]

export default function ClientTrackerPage() {
  const {
    clients,
    loading,
    hasMore,
    loadMore,
    loadingMore,
    stats,
    addClient,
    updateClient,
    toggleCoachProspect,
    toggleTouchpoint,
    updateStatus,
    needsAttention,
    getFilteredClients,
  } = useClients()
  const { toast } = useToast()
  const { user, profile } = useUserData()
  const { addCoach: addDownlineCoach, coaches: downlineCoaches } = useCoaches()

  // Status configuration for the dropdown
  const CLIENT_STATUS_CONFIG: Record<ClientStatus, { label: string; icon: string; color: string; bg: string }> = {
    active: { label: "Client", icon: "⭐", color: "#4caf50", bg: "#e8f5e9" },
    goal_achieved: { label: "Goal Achieved", icon: "🏆", color: "#f59e0b", bg: "#fffbeb" },
    future_coach: { label: "Future Coach", icon: "💎", color: "#8b5cf6", bg: "#f5f3ff" },
    coach_launched: { label: "Coach Launched", icon: "🚀", color: "#ec4899", bg: "#fdf2f8" },
    paused: { label: "Paused", icon: "⏸️", color: "#6b7280", bg: "#f3f4f6" },
    completed: { label: "Completed", icon: "✅", color: "#10b981", bg: "#ecfdf5" },
  }

  // Handle client status change — auto-creates a coach tracker entry for coach stages
  const handleClientStatusChange = async (clientId: string, newStatus: ClientStatus) => {
    const client = clients.find(c => c.id === clientId)
    if (!client) return

    const success = await updateStatus(clientId, newStatus)
    if (!success) return

    // Auto-create a downline coach entry when a client transitions to a coach stage
    if (newStatus === "future_coach" || newStatus === "coach_launched") {
      const alreadyInCoachTracker = downlineCoaches.some(
        c => c.label.toLowerCase() === client.label.toLowerCase()
      )
      if (!alreadyInCoachTracker) {
        const coachResult = await addDownlineCoach({
          label: client.label,
          stage: newStatus === "coach_launched" ? "new_coach" : "new_coach",
          rank: 1,
          launch_date: getLocalDateString(),
        })
        if (coachResult) {
          toast({
            title: "Added to Coach List",
            description: `${client.label} has been added to your Coach List as a new coach.`,
          })
        }
      }
    }
  }

  const [showAddModal, setShowAddModal] = useState(false)
  const [showTextModal, setShowTextModal] = useState(false)
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [showGuideModal, setShowGuideModal] = useState(false)
  const [showTroubleshootModal, setShowTroubleshootModal] = useState(false)
  const [showRecruitmentNav, setShowRecruitmentNav] = useState(false)
  const [showMilestoneModal, setShowMilestoneModal] = useState(false)
  const [milestoneCount, setMilestoneCount] = useState(0)
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [clientToClear, setClientToClear] = useState<string | null>(null)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [filterStatus, setFilterStatus] = useState<ClientStatus | "all">("all")
  const [searchTerm, setSearchTerm] = useState("")
  
  // Schedule state
  const [scheduleDay, setScheduleDay] = useState<number>(new Date().getDay())
  const [scheduleHour, setScheduleHour] = useState<number>(9)
  const [scheduleMinute, setScheduleMinute] = useState<string>("00")
  const [scheduleAmPm, setScheduleAmPm] = useState<"AM" | "PM">("AM")
  const [recurringFrequency, setRecurringFrequency] = useState<RecurringFrequency>("none")
  const [clientEmail, setClientEmail] = useState<string>("")
  const [clientPhone, setClientPhone] = useState<string>("")
  const [scheduleDate, setScheduleDate] = useState<string>("")
  const [calendarOnly, setCalendarOnly] = useState(false)
  const [inviteMethod, setInviteMethod] = useState<"email" | "text">("email")
  const [scheduleSaving, setScheduleSaving] = useState(false)
  const [scheduleTextCopied, setScheduleTextCopied] = useState(false)
  
  // Edit client state
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [editForm, setEditForm] = useState({ label: "", startDate: "", notes: "" })

  const openEditModal = (client: Client) => {
    setEditingClient(client)
    setEditForm({
      label: client.label,
      startDate: client.start_date,
      notes: client.notes || "",
    })
    setShowEditModal(true)
  }

  const handleSaveEdit = async () => {
    if (!editingClient || !editForm.label.trim() || !editForm.startDate) return
    const success = await updateClient(editingClient.id, {
      label: editForm.label.trim(),
      start_date: editForm.startDate,
      notes: editForm.notes.trim() || null,
    })
    if (success) {
      toast({
        title: "Client Updated",
        description: `${editForm.label.trim()} has been updated.`,
      })
      setShowEditModal(false)
      setEditingClient(null)
    } else {
      toast({
        title: "Error",
        description: "Failed to update client. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Meeting type state (Phone vs Zoom)
  const [meetingType, setMeetingType] = useState<"phone" | "zoom">("phone")
  
  // Debounce search term for better performance
  const debouncedSearchTerm = useDebounce(searchTerm, 300)

  // Recurring frequency options
  const RECURRING_OPTIONS: { value: RecurringFrequency; label: string }[] = [
    { value: "none", label: "One-time" },
    { value: "weekly", label: "Weekly" },
    { value: "biweekly", label: "Every 2 weeks" },
    { value: "monthly", label: "Monthly" },
  ]

  const today = getLocalDateString()

  const [newClient, setNewClient] = useState({
    label: "",
    startDate: today,
  })

  // Generate SMS text for calendar invite
  const generateSMSText = (client: Client, scheduledAt: Date): string => {
    const programDay = getProgramDay(client.start_date)
    const dateStr = scheduledAt.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })
    const timeStr = scheduledAt.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
    return `Hi! 🌟 Just a reminder about our check-in scheduled for ${dateStr} at ${timeStr}. Looking forward to connecting! Day ${programDay} - you're doing great! 💪`
  }

  // Send SMS with scheduled meeting info
  const sendSMS = (client: Client) => {
    if (!client.phone || !client.next_scheduled_at) return
    const scheduledAt = new Date(client.next_scheduled_at)
    const message = generateSMSText(client, scheduledAt)
    const smsUrl = `sms:${client.phone}?body=${encodeURIComponent(message)}`
    window.open(smsUrl)
    toast({
      title: "📱 Opening Messages",
      description: `Sending reminder to ${client.label}`,
    })
  }

  // Get the next occurrence of a day of the week
  const getNextDayDate = (dayOfWeek: number): Date => {
    const now = new Date()
    const currentDay = now.getDay()
    let daysUntil = dayOfWeek - currentDay
    if (daysUntil <= 0) daysUntil += 7 // Next week if today or past
    const targetDate = new Date(now)
    targetDate.setDate(now.getDate() + daysUntil)
    return targetDate
  }

  // Convert 12-hour to 24-hour format
  const get24Hour = (hour: number, ampm: "AM" | "PM"): number => {
    if (ampm === "AM") {
      return hour === 12 ? 0 : hour
    } else {
      return hour === 12 ? 12 : hour + 12
    }
  }

  // Generate Google Calendar URL
  const generateCalendarUrl = (client: Client, day: number, hour: number, minute: string, ampm: "AM" | "PM"): string => {
    const targetDate = getNextDayDate(day)
    const hour24 = get24Hour(hour, ampm)
    targetDate.setHours(hour24, parseInt(minute), 0, 0)
    
    const endDate = new Date(targetDate)
    endDate.setMinutes(endDate.getMinutes() + 30) // 30 min duration
    
    const programDay = getProgramDay(client.start_date)
    const phase = getDayPhase(programDay)
    
    const title = `Check-in: ${client.label} (Day ${programDay})`
    const details = `Client: ${client.label}
Program Day: ${programDay}
Phase: ${phase.label}

Suggested talking points:
- How are you feeling today?
- Any challenges with meals?
- Celebrate wins!
${phase.milestone ? `\n🎉 MILESTONE: ${phase.label} - Celebrate this achievement!` : ""}`

    // Format dates for Google Calendar (YYYYMMDDTHHmmss)
    const formatDate = (d: Date) => {
      return d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z"
    }
    
    const params = new URLSearchParams({
      action: "TEMPLATE",
      text: title,
      dates: `${formatDate(targetDate)}/${formatDate(endDate)}`,
      details: details,
    })
    
    return `https://calendar.google.com/calendar/render?${params.toString()}`
  }

  // Open schedule modal
  const openScheduleModal = (client: Client) => {
    setSelectedClient(client)
    if (client.recurring_day !== null && client.recurring_day !== undefined) {
      setScheduleDay(client.recurring_day)
    } else {
      setScheduleDay(new Date().getDay())
    }
    if (client.recurring_time) {
      const [hour, minute] = client.recurring_time.split(":")
      const hourNum = parseInt(hour)
      setScheduleHour(hourNum > 12 ? hourNum - 12 : hourNum === 0 ? 12 : hourNum)
      setScheduleMinute(minute)
      setScheduleAmPm(hourNum >= 12 ? "PM" : "AM")
    } else {
      setScheduleHour(9)
      setScheduleMinute("00")
      setScheduleAmPm("AM")
    }
    setRecurringFrequency(client.recurring_frequency || "none")
    setClientEmail("")
    setClientPhone(client.phone || "")
    setScheduleDate("")
    setCalendarOnly(false)
    setInviteMethod("email")
    setScheduleSaving(false)
    setScheduleTextCopied(false)
    setShowScheduleModal(true)
  }

  // Generate calendar event from schedule settings
  const generateCalendarEvent = (): CalendarEvent | null => {
    if (!selectedClient) return null
    
    const targetDate = recurringFrequency === "none" && scheduleDate
      ? new Date(scheduleDate + "T00:00:00")
      : getNextDayDate(scheduleDay)
    const hour24 = get24Hour(scheduleHour, scheduleAmPm)
    targetDate.setHours(hour24, parseInt(scheduleMinute), 0, 0)
    
    const endDate = new Date(targetDate)
    endDate.setMinutes(endDate.getMinutes() + 30) // 30 min duration
    
    const programDay = getProgramDay(selectedClient.start_date)
    const phase = getDayPhase(programDay)
    
    // Build meeting details based on meeting type
    let meetingDetails = ""
    let location = ""
    
    if (meetingType === "zoom" && profile?.zoom_link) {
      meetingDetails = `\n\n📹 Zoom Meeting:\n${profile.zoom_link}`
      if (profile.zoom_meeting_id) meetingDetails += `\nMeeting ID: ${profile.zoom_meeting_id}`
      if (profile.zoom_passcode) meetingDetails += `\nPasscode: ${profile.zoom_passcode}`
      location = profile.zoom_link
    } else if (meetingType === "phone") {
      meetingDetails = "\n\n📱 Phone Call"
      if (clientPhone) meetingDetails += `\nCall: ${clientPhone}`
    }
    
    return {
      title: `Check-in: ${selectedClient.label} (Day ${programDay})`,
      description: `Client: ${selectedClient.label}
Program Day: ${programDay}
Phase: ${phase.label}
${meetingDetails}

Suggested talking points:
- How are you feeling today?
- Any challenges with meals?
- Celebrate wins!
${phase.milestone ? `\n🎉 MILESTONE: ${phase.label} - Celebrate this achievement!` : ""}`,
      startDate: targetDate,
      endDate: endDate,
      location: location || undefined,
      uid: `client-${selectedClient.id}-${Date.now()}@coachingamplifier.com`,
    }
  }

  const generateCheckinTextInvite = (): string => {
    if (!selectedClient) return ""
    const firstName = selectedClient.label.split(" ")[0]
    const dateStr = (() => {
      if (recurringFrequency === "none" && scheduleDate) {
        const d = new Date(scheduleDate + "T00:00:00")
        return d.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })
      }
      return getNextDayDate(scheduleDay).toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })
    })()
    const timeStr = `${scheduleHour}:${scheduleMinute} ${scheduleAmPm}`
    if (meetingType === "zoom" && profile?.zoom_link) {
      return `Hi ${firstName}! Looking forward to our check-in on ${dateStr} at ${timeStr}. Here's the Zoom link: ${profile.zoom_link} See you there!`
    }
    return `Hi ${firstName}! Just confirming our check-in on ${dateStr} at ${timeStr}. We'll connect via phone call. Talk soon!`
  }

  const handleSaveSchedule = async () => {
    if (!selectedClient) return
    setScheduleSaving(true)

    const targetDate = recurringFrequency === "none" && scheduleDate
      ? new Date(scheduleDate + "T00:00:00")
      : getNextDayDate(scheduleDay)
    const hour24 = get24Hour(scheduleHour, scheduleAmPm)
    targetDate.setHours(hour24, parseInt(scheduleMinute), 0, 0)

    const sendInvite = !calendarOnly
    if (sendInvite && inviteMethod === "text") {
      try {
        await navigator.clipboard.writeText(generateCheckinTextInvite())
        setScheduleTextCopied(true)
      } catch {}
    }

    const timeStr = `${hour24.toString().padStart(2, "0")}:${scheduleMinute}`

    const success = await updateClient(selectedClient.id, {
      next_scheduled_at: targetDate.toISOString(),
      recurring_frequency: recurringFrequency,
      recurring_day: recurringFrequency !== "none" ? scheduleDay : null,
      recurring_time: recurringFrequency !== "none" ? timeStr : null,
      phone: clientPhone || null,
    })

    if (!success) {
      setScheduleSaving(false)
      toast({
        title: "Failed to save schedule",
        description: "Please try again",
        variant: "destructive",
      })
      return
    }

    const coachEmail = profile?.notification_email || user?.email
    if (coachEmail) {
      const calEvent = generateCalendarEvent()
      if (calEvent) {
        sendCalendarInviteEmail({
          to: coachEmail,
          toName: profile?.full_name || "Coach",
          fromEmail: coachEmail,
          fromName: profile?.full_name || "Coaching Amplifier",
          eventTitle: calEvent.title,
          eventDescription: calEvent.description,
          startDate: calEvent.startDate.toISOString(),
          endDate: calEvent.endDate.toISOString(),
          eventType: "check-in",
        }).catch(() => {})
      }
    }

    if (sendInvite && inviteMethod === "email" && clientEmail) {
      const calEvent = generateCalendarEvent()
      if (calEvent && coachEmail) {
        let clientDescription = `Check-in with ${profile?.full_name || "Your Coach"}`
        if (meetingType === "zoom" && profile?.zoom_link) {
          clientDescription += `\n\n📹 Zoom Meeting:\n${profile.zoom_link}`
          if (profile.zoom_meeting_id) clientDescription += `\nMeeting ID: ${profile.zoom_meeting_id}`
          if (profile.zoom_passcode) clientDescription += `\nPasscode: ${profile.zoom_passcode}`
        } else if (meetingType === "phone") {
          clientDescription += "\n\n📱 Phone Call"
        }

        sendCalendarInviteEmail({
          to: clientEmail,
          toName: selectedClient.label,
          fromEmail: coachEmail,
          fromName: profile?.full_name || "Your Coach",
          eventTitle: calEvent.title,
          eventDescription: clientDescription,
          startDate: calEvent.startDate.toISOString(),
          endDate: calEvent.endDate.toISOString(),
          eventType: "check-in",
        }).then((result) => {
          if (result.success) {
            toast({
              title: "📧 Invite sent",
              description: `Calendar invite sent to ${selectedClient.label}`,
            })
          }
        }).catch(() => {})
      }
    }

    setScheduleSaving(false)
    setShowScheduleModal(false)
    setMeetingType("phone")
    setCalendarOnly(false)
    setInviteMethod("email")

    if (sendInvite && inviteMethod === "text") {
      toast({
        title: "📋 Saved & text copied",
        description: "Check-in saved. Paste the invite into your texting app.",
      })
    } else {
      const recurringLabel = recurringFrequency !== "none"
        ? ` (${RECURRING_OPTIONS.find(r => r.value === recurringFrequency)?.label})`
        : ""
      toast({
        title: recurringFrequency !== "none" ? "🔄 Recurring Check-in Set" : "📅 Check-in Scheduled",
        description: `${scheduleHour}:${scheduleMinute} ${scheduleAmPm} on ${DAYS_OF_WEEK[scheduleDay].full}${recurringLabel}`,
      })
    }
  }

  const handleAddClient = async () => {
    if (!newClient.label.trim() || !newClient.startDate) return
    
    // Get current total client count before adding
    const currentCount = clients.length
    
    await addClient({
      label: newClient.label,
      start_date: newClient.startDate,
    })
    setNewClient({ label: "", startDate: today })
    setShowAddModal(false)
    
    // Check if new count is a milestone (5, 10, 15, 20, 25, etc.)
    const newCount = currentCount + 1
    if (newCount >= 5 && newCount % 5 === 0) {
      setMilestoneCount(newCount)
      setShowMilestoneModal(true)
    }
  }

  const exportToCSV = () => {
    const headers = ["Label", "Status", "Start Date", "Program Day", "Phase", "Coach Prospect", "Next Check-in", "Last Touchpoint", "Notes", "Created"]
    
    const rows = clients.map(c => {
      const programDay = getProgramDay(c.start_date)
      const phase = getDayPhase(programDay)
      return [
        c.label,
        c.status.charAt(0).toUpperCase() + c.status.slice(1),
        parseLocalDate(c.start_date).toLocaleDateString(),
        programDay.toString(),
        phase.label,
        c.is_coach_prospect ? "Yes" : "No",
        c.next_scheduled_at ? new Date(c.next_scheduled_at).toLocaleString() : "",
        c.last_touchpoint_date || "",
        c.notes?.replace(/"/g, '""') || "",
        new Date(c.created_at).toLocaleDateString(),
      ]
    })

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `clients-${getLocalDateString()}.csv`
    link.click()
    URL.revokeObjectURL(url)

    toast({
      title: "Export complete",
      description: `Exported ${clients.length} clients to CSV`,
    })
  }

  const openTextTemplates = (client: Client) => {
    setSelectedClient(client)
    setShowTextModal(true)
  }

  // Memoize filtered clients for better performance
  const filteredClients = useMemo(() => 
    getFilteredClients(filterStatus).filter(client =>
      !debouncedSearchTerm || client.label.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
    ), [filterStatus, debouncedSearchTerm, getFilteredClients]
  )

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        {/* Page Header Skeleton */}
        <div className="bg-gradient-to-r from-[hsl(var(--optavia-green))] to-[hsl(var(--optavia-green-dark))] text-white">
          <div className="container mx-auto px-4 py-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="h-4 w-32 bg-white/20 rounded mb-2" />
                <div className="h-8 w-48 bg-white/20 rounded mb-2" />
                <div className="h-4 w-64 bg-white/20 rounded" />
              </div>
            </div>
          </div>
        </div>
        <div className="container mx-auto px-4 py-6">
          <StatsCardsSkeleton count={4} />
          <div className="space-y-4 mb-6">
            <div className="h-10 w-64 bg-gray-200 rounded animate-pulse" />
          </div>
          <ClientListSkeleton count={5} />
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      {/* Page Header */}
      <div className="bg-gradient-to-r from-[hsl(var(--optavia-green))] to-[hsl(var(--optavia-green-dark))] text-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-sm opacity-90 mb-1">
                <span>My Business</span>
                <ChevronRight className="h-4 w-4" />
                <span className="font-semibold">Client List</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-3">
                <Users className="h-8 w-8" />
                My Clients
              </h1>
              <p className="text-sm opacity-90 mt-1">
                Track daily touchpoints and milestones
              </p>
            </div>
            <div className="flex flex-wrap gap-2 sm:gap-3">
              <Button
                onClick={() => setShowAddModal(true)}
                className="bg-white text-[hsl(var(--optavia-green))] hover:bg-white/90 order-first sm:order-last"
              >
                <Plus className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Add Client</span>
                <span className="sm:hidden">Add</span>
              </Button>
              <Button
                className="bg-[#f88221] border-[#f88221] text-white hover:bg-[#e07520] hidden sm:flex"
                onClick={() => setShowGuideModal(true)}
              >
                <GraduationCap className="h-4 w-4 mr-2" />
                Learn the Client List
              </Button>
              <Link href="/prospect-tracker">
                <Button variant="outline" className="bg-white/10 border-white/30 text-white hover:bg-white/20">
                  <Users className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">100's List</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Privacy Notice */}
      <div className="bg-blue-50 border-b border-blue-200">
        <div className="container mx-auto px-4 py-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-sm text-blue-700">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>
                <strong>Privacy:</strong> Use nicknames only. Contact info stays in OPTAVIA's portal.
              </span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <CalendarPlus className="h-4 w-4 flex-shrink-0" />
              <span>
                <strong>Schedule:</strong> Add check-ins to your calendar and track upcoming meetings.
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <ErrorBoundary>
        {/* Pipeline Stages */}
        <div className="mb-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
            {[
              { id: "active", label: "Client", icon: "⭐", color: "#4caf50", borderColor: "#c8e6c9", count: stats.active },
              { id: "goal_achieved", label: "Goal Achieved", icon: "🏆", color: "#ff9800", borderColor: "#ffe0b2", count: stats.goalAchieved },
              { id: "future_coach", label: "Future Coach", icon: "💎", color: "#9c27b0", borderColor: "#e1bee7", count: stats.futureCoach },
              { id: "coach_launched", label: "Coach Launched", icon: "🚀", color: "#e91e63", borderColor: "#f8bbd0", count: stats.coachLaunched },
            ].map((stage, index, arr) => (
              <button
                key={stage.id}
                onClick={() => setFilterStatus(stage.id as any)}
                className={`relative flex flex-col items-center p-3 sm:p-4 rounded-xl border-2 bg-white hover:shadow-lg transition-all hover:scale-[1.03] cursor-pointer ${
                  filterStatus === stage.id ? "ring-2 ring-offset-1 shadow-md" : ""
                }`}
                style={{ 
                  borderColor: stage.borderColor,
                  ...(filterStatus === stage.id ? { ringColor: stage.color } : {}),
                }}
              >
                <span className="text-xl sm:text-2xl mb-1">{stage.icon}</span>
                <span
                  className="text-2xl sm:text-3xl font-bold"
                  style={{ color: stage.color }}
                >
                  {stage.count}
                </span>
                <span className="text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wide mt-0.5">
                  {stage.label}
                </span>
                {index < arr.length - 1 && (
                  <ChevronRight
                    className="hidden sm:block absolute -right-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-300 z-10"
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Search, Filter & Actions */}
        <div className="space-y-2 mb-6">
          <div className="flex items-center gap-2">
            <div className="relative flex-1 min-w-[140px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by label..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-9"
              />
            </div>

            <Select
              value={filterStatus}
              onValueChange={(value) => setFilterStatus(value as ClientStatus | "all")}
            >
              <SelectTrigger className="w-[140px] sm:w-[160px] h-9 text-sm flex-shrink-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Clients</SelectItem>
                <SelectItem value="active">Client</SelectItem>
                <SelectItem value="goal_achieved">Goal Achieved</SelectItem>
                <SelectItem value="future_coach">Future Coach</SelectItem>
                <SelectItem value="coach_launched">Coach Launched</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="sm"
              onClick={exportToCSV}
              className="text-gray-600 flex-shrink-0 h-9"
              title="Export to CSV"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline ml-1">Export</span>
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={() => setShowTroubleshootModal(true)}
              className="bg-[#f88221] hover:bg-[#e07520] text-white h-10"
              title="Troubleshooting Guide"
            >
              <Wrench className="h-4 w-4 mr-2" />
              Troubleshooting
            </Button>

            <Button
              onClick={() => setShowRecruitmentNav(true)}
              className="bg-[#f88221] hover:bg-[#e07520] text-white h-10"
              title="Recruitment Objections"
            >
              <MessageCircleQuestion className="h-4 w-4 mr-2" />
              Recruitment
            </Button>
          </div>
        </div>

        {/* Client List */}
        <div className="space-y-3">
          {filteredClients.map((client) => {
            const programDay = getProgramDay(client.start_date)
            const phase = getDayPhase(programDay)
            const attention = needsAttention(client)

            return (
              <Card
                key={client.id}
                className={`transition-shadow hover:shadow-md ${
                  attention
                    ? "border-orange-300 bg-orange-50"
                    : phase.milestone
                    ? "border-green-300 bg-green-50"
                    : ""
                }`}
              >
                <CardContent className="p-4">
                  {/* Header Row: Day Badge + Client Info */}
                  <div className="flex items-start gap-3">
                    {/* Day Badge */}
                    <div
                      className="w-14 h-14 rounded-xl flex flex-col items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: phase.bg }}
                    >
                      <div className="text-xs font-semibold" style={{ color: phase.color }}>
                        DAY
                      </div>
                      <div className="text-xl font-bold" style={{ color: phase.color }}>
                        {programDay}
                      </div>
                    </div>

                    {/* Client Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-gray-900">{client.label}</span>
                        {client.status !== "active" && CLIENT_STATUS_CONFIG[client.status] && (
                          <Badge
                            style={{
                              backgroundColor: CLIENT_STATUS_CONFIG[client.status].bg,
                              color: CLIENT_STATUS_CONFIG[client.status].color,
                            }}
                            className="flex items-center gap-1"
                          >
                            {CLIENT_STATUS_CONFIG[client.status].icon} {CLIENT_STATUS_CONFIG[client.status].label}
                          </Badge>
                        )}
                        {client.is_coach_prospect && client.status === "active" && (
                          <Badge className="bg-orange-100 text-orange-700 flex items-center gap-1">
                            <Star className="h-3 w-3" />
                            Coach Prospect
                          </Badge>
                        )}
                        {phase.milestone && (
                          <Badge
                            style={{ backgroundColor: phase.bg, color: phase.color }}
                          >
                            {phase.label}
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        {phase.label} • Started{" "}
                        {parseLocalDate(client.start_date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Scheduled Time Display */}
                  {client.next_scheduled_at && (
                    <div className="mt-3 flex items-center gap-2 flex-wrap">
                      <Badge 
                        className={`flex items-center gap-1.5 px-2.5 py-1 text-sm font-medium ${
                          new Date(client.next_scheduled_at) < new Date() 
                            ? "bg-red-100 text-red-700 border border-red-200" 
                            : "bg-green-100 text-green-700 border border-green-200"
                        }`}
                      >
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(client.next_scheduled_at).toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        })}
                        {" "}
                        {new Date(client.next_scheduled_at).toLocaleTimeString("en-US", {
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                        {client.recurring_frequency && client.recurring_frequency !== "none" && (
                          <Repeat className="h-3 w-3 ml-1" />
                        )}
                      </Badge>
                      {client.phone && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => sendSMS(client)}
                          className="h-7 w-7 p-0 text-green-500 hover:text-green-700 hover:bg-green-50"
                          title="Send SMS reminder"
                        >
                          <Send className="h-3 w-3" />
                        </Button>
                      )}
                      {/* Complete Check-in Button - only show if date is today or past */}
                      {new Date(client.next_scheduled_at!).setHours(0,0,0,0) <= new Date().setHours(0,0,0,0) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            updateClient(client.id, { 
                              next_scheduled_at: null,
                              recurring_frequency: null,
                              recurring_day: null,
                              recurring_time: null 
                            })
                            toggleTouchpoint(client.id, "am_done")
                            toast({
                              title: "✅ Check-in Completed!",
                              description: "Great job staying connected with your client!",
                            })
                          }}
                          className="h-7 w-7 p-0 bg-green-100 hover:bg-green-200 rounded-full"
                          title="Mark check-in as completed"
                        >
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        </Button>
                      )}
                      {/* Cancel Check-in Button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setClientToClear(client.id)
                          setShowClearConfirm(true)
                        }}
                        className="h-7 w-7 p-0 bg-red-100 hover:bg-red-200 rounded-full"
                        title="Cancel scheduled check-in"
                      >
                        <X className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  )}

                  {/* Primary Action Buttons */}
                  <div className="mt-4 flex gap-2">
                    {/* Check-in Button */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleTouchpoint(client.id, "am_done")}
                      className={`flex-1 ${client.am_done 
                        ? "bg-green-100 text-green-700 border-green-300 hover:bg-green-200" 
                        : "text-green-600 border-green-200 hover:bg-green-50"
                      }`}
                    >
                      {client.am_done ? (
                        <CheckCircle className="h-4 w-4 mr-1" />
                      ) : (
                        <Circle className="h-4 w-4 mr-1" />
                      )}
                      <span className="text-xs sm:text-sm">{client.am_done ? "Checked In" : "Check In"}</span>
                    </Button>
                    {/* Text Button - highlighted for milestones */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openTextTemplates(client)}
                      className={`flex-1 ${isMilestoneDay(programDay)
                        ? "bg-amber-100 text-amber-700 border-amber-300 hover:bg-amber-200 animate-pulse"
                        : "text-blue-600 border-blue-200 hover:bg-blue-50"
                      }`}
                    >
                      <MessageSquare className="h-4 w-4 mr-1" />
                      <span className="text-xs sm:text-sm">{isMilestoneDay(programDay) ? "Celebrate!" : "Text"}</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openScheduleModal(client)}
                      className="flex-1 text-[hsl(var(--optavia-green))] border-green-200 hover:bg-green-50"
                    >
                      <CalendarPlus className="h-4 w-4 mr-1" />
                      <span className="text-xs sm:text-sm">Schedule</span>
                    </Button>
                  </div>

                  {/* Secondary Actions: Status, Edit, Remind */}
                  <div className="mt-3 pt-3 border-t flex flex-wrap items-center gap-2">
                    {/* Status Dropdown */}
                    <Select
                      value={client.status}
                      onValueChange={(value) => handleClientStatusChange(client.id, value as ClientStatus)}
                    >
                      <SelectTrigger className="w-full sm:w-auto sm:flex-1 sm:min-w-0 h-9 text-xs sm:text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {(Object.entries(CLIENT_STATUS_CONFIG) as [ClientStatus, typeof CLIENT_STATUS_CONFIG[ClientStatus]][]).map(([key, cfg]) => (
                          <SelectItem key={key} value={key}>
                            {cfg.icon} {cfg.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditModal(client)}
                        title="Edit client"
                      >
                        <Pencil className="h-4 w-4 sm:mr-1" />
                        <span className="hidden sm:inline">Edit</span>
                      </Button>
                      <ReminderButton
                        entityType="client"
                        entityId={client.id}
                        entityName={client.label}
                        variant="outline"
                      />
                    </div>
                  </div>

                  {/* Notes - clickable to edit */}
                  <button
                    onClick={() => openEditModal(client)}
                    className="mt-3 pt-3 border-t w-full text-left text-sm hover:bg-gray-50 rounded-b-lg transition-colors cursor-pointer"
                  >
                    {client.notes ? (
                      <span className="text-gray-600">📝 {client.notes}</span>
                    ) : (
                      <span className="text-gray-400 italic">📝 Add notes...</span>
                    )}
                  </button>
                </CardContent>
              </Card>
            )
          })}

          {/* Pagination: load additional rows without fetching the full table up front */}
          {hasMore && (
            <div className="pt-2 flex justify-center">
              <Button
                variant="outline"
                onClick={() => loadMore()}
                disabled={loadingMore}
                className="w-full sm:w-auto"
              >
                {loadingMore ? "Loading..." : `Load more clients (${clients.length} loaded)`}
              </Button>
            </div>
          )}

          {filteredClients.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500 mb-4">No clients found</p>
                <Button onClick={() => setShowAddModal(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Client
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
        </ErrorBoundary>
      </div>

      {/* Add Client Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Client</DialogTitle>
            <DialogDescription>Add a new client to track their journey.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Label / Nickname *</Label>
              <Input
                value={newClient.label}
                onChange={(e) => setNewClient({ ...newClient, label: e.target.value })}
                placeholder="e.g., Jennifer, Mike"
                maxLength={50}
              />
              <p className="text-xs text-gray-500 mt-1">
                A name you'll recognize
              </p>
            </div>
            <div>
              <Label>Start Date *</Label>
              <Input
                type="date"
                value={newClient.startDate}
                onChange={(e) => setNewClient({ ...newClient, startDate: e.target.value })}
              />
            </div>
            <div className="bg-green-50 rounded-lg p-3 text-sm text-green-700 flex items-start gap-2">
              <Sparkles className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <span>
                We'll calculate their program day and show milestone reminders automatically!
              </span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAddClient}
              disabled={!newClient.label.trim() || !newClient.startDate}
              className="bg-[hsl(var(--optavia-green))]"
            >
              Add Client
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Client Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Client</DialogTitle>
            <DialogDescription>
              Update client details below.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Label / Nickname *</Label>
              <Input
                value={editForm.label}
                onChange={(e) => setEditForm({ ...editForm, label: e.target.value })}
                placeholder="e.g., Jennifer, Mike"
                maxLength={50}
              />
            </div>
            <div>
              <Label>Start Date *</Label>
              <Input
                type="date"
                value={editForm.startDate}
                onChange={(e) => setEditForm({ ...editForm, startDate: e.target.value })}
              />
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea
                value={editForm.notes}
                onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                placeholder="Add notes about this client..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveEdit}
              disabled={!editForm.label.trim() || !editForm.startDate}
              className="bg-[hsl(var(--optavia-green))]"
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Milestone Action Modal (Text Templates) */}
      {selectedClient && (
        <MilestoneActionModal
          open={showTextModal}
          onOpenChange={setShowTextModal}
          clientLabel={selectedClient.label}
          programDay={getProgramDay(selectedClient.start_date)}
          onScheduleClick={() => {
            setShowTextModal(false)
            setShowScheduleModal(true)
          }}
          onTextSent={() => {
            // Mark as checked in when text is sent
          }}
        />
      )}

      {/* Schedule Check-in Modal */}
      <Dialog open={showScheduleModal} onOpenChange={(open) => {
        setShowScheduleModal(open)
        if (!open) {
          setSelectedClient(null)
          setMeetingType("phone")
          setCalendarOnly(false)
          setInviteMethod("email")
        }
      }}>
        <DialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden">
          {selectedClient && (
            <>
              {/* Header */}
              <div className="px-6 pt-6 pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                      <CalendarPlus className="h-5 w-5 text-[hsl(var(--optavia-green))]" />
                    </div>
                    <div>
                      <DialogTitle className="text-lg font-bold text-gray-900">Schedule Check-in</DialogTitle>
                      <DialogDescription className="text-sm text-gray-500">30 minute check-in</DialogDescription>
                    </div>
                  </div>
                </div>

                {/* Client Card */}
                <div className="mt-4 bg-gray-50 border border-gray-200 rounded-xl p-4 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[hsl(var(--optavia-green))] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {selectedClient.label.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{selectedClient.label}</div>
                    <div className="text-xs text-[hsl(var(--optavia-green))]">
                      Day {getProgramDay(selectedClient.start_date)} • {getDayPhase(getProgramDay(selectedClient.start_date)).label}
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-6 pb-6 space-y-5">
                {/* Recurring */}
                <div>
                  <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <Repeat className="h-3.5 w-3.5 text-[hsl(var(--optavia-green))]" />
                    Recurring
                  </Label>
                  <div className="grid grid-cols-4 gap-2">
                    {RECURRING_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setRecurringFrequency(option.value)}
                        className={`px-2 py-2 rounded-lg text-sm font-medium transition-colors ${
                          recurringFrequency === option.value
                            ? "bg-[hsl(var(--optavia-green))] text-white"
                            : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Day of Week (recurring) or Date (one-time) */}
                {recurringFrequency !== "none" ? (
                  <div>
                    <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Day of Week</Label>
                    <div className="grid grid-cols-7 gap-1">
                      {DAYS_OF_WEEK.map((day) => (
                        <button
                          key={day.value}
                          onClick={() => setScheduleDay(day.value)}
                          className={`p-2 rounded-lg text-center transition-colors ${
                            scheduleDay === day.value
                              ? "bg-[hsl(var(--optavia-green))] text-white"
                              : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                          }`}
                        >
                          <div className="text-xs font-medium">{day.short}</div>
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-[hsl(var(--optavia-green))] mt-2">
                      Starting: {DAYS_OF_WEEK[scheduleDay].full}, {getNextDayDate(scheduleDay).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </p>
                  </div>
                ) : (
                  <div>
                    <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Date</Label>
                    <Input
                      type="date"
                      value={scheduleDate}
                      onChange={(e) => setScheduleDate(e.target.value)}
                      min={today}
                      className="w-full h-11"
                    />
                  </div>
                )}

                {/* Time */}
                <div>
                  <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Time</Label>
                  <div className="flex items-center gap-2">
                    <select
                      value={scheduleHour}
                      onChange={(e) => setScheduleHour(parseInt(e.target.value))}
                      className="w-16 h-11 text-center text-base font-medium border rounded-lg bg-white focus:ring-2 focus:ring-[hsl(var(--optavia-green))] focus:border-[hsl(var(--optavia-green))]"
                    >
                      {HOUR_OPTIONS.map((h) => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                    <span className="text-xl font-bold text-gray-300">:</span>
                    <select
                      value={scheduleMinute}
                      onChange={(e) => setScheduleMinute(e.target.value)}
                      className="w-16 h-11 text-center text-base font-medium border rounded-lg bg-white focus:ring-2 focus:ring-[hsl(var(--optavia-green))] focus:border-[hsl(var(--optavia-green))]"
                    >
                      {MINUTE_OPTIONS.map((m) => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                    <div className="flex rounded-lg border overflow-hidden ml-auto">
                      <button
                        type="button"
                        onClick={() => setScheduleAmPm("AM")}
                        className={`px-4 h-11 font-semibold text-sm transition-colors ${
                          scheduleAmPm === "AM"
                            ? "bg-[hsl(var(--optavia-green))] text-white"
                            : "bg-white text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        AM
                      </button>
                      <button
                        type="button"
                        onClick={() => setScheduleAmPm("PM")}
                        className={`px-4 h-11 font-semibold text-sm transition-colors ${
                          scheduleAmPm === "PM"
                            ? "bg-[hsl(var(--optavia-green))] text-white"
                            : "bg-white text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        PM
                      </button>
                    </div>
                  </div>
                </div>

                {/* Meeting Type */}
                <div>
                  <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Meeting Type</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setMeetingType("phone")}
                      className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all font-medium ${
                        meetingType === "phone"
                          ? "border-[hsl(var(--optavia-green))] bg-green-50 text-[hsl(var(--optavia-green))]"
                          : "border-gray-200 hover:border-gray-300 text-gray-600"
                      }`}
                    >
                      <Phone className="h-4 w-4" />
                      Phone
                    </button>
                    <button
                      type="button"
                      onClick={() => setMeetingType("zoom")}
                      className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all font-medium ${
                        meetingType === "zoom"
                          ? "border-[hsl(var(--optavia-green))] bg-green-50 text-[hsl(var(--optavia-green))]"
                          : "border-gray-200 hover:border-gray-300 text-gray-600"
                      }`}
                    >
                      <Video className="h-4 w-4" />
                      Zoom
                    </button>
                  </div>
                </div>

                {/* Zoom Details */}
                {meetingType === "zoom" && (
                  <div className="space-y-2 bg-green-50 border border-green-200 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-[hsl(var(--optavia-green))] text-sm font-medium">
                      <Video className="h-4 w-4" />
                      Zoom Meeting Details
                    </div>
                    {profile?.zoom_link ? (
                      <div className="space-y-2">
                        <Input value={profile.zoom_link} readOnly className="bg-white/60 text-gray-700 cursor-default text-sm" />
                        <p className="text-xs text-green-600">
                          Managed in <Link href="/settings" className="underline hover:text-green-700 font-medium">My Settings → Zoom</Link>
                        </p>
                      </div>
                    ) : (
                      <p className="text-sm text-[hsl(var(--optavia-green))]">
                        No Zoom details configured. <Link href="/settings" className="underline font-semibold">Set up in Settings</Link>
                      </p>
                    )}
                  </div>
                )}

                {/* Send Invite Section */}
                <div className="border-t border-gray-100 pt-4 space-y-3">
                  {!calendarOnly && (
                    <>
                      <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                        <Send className="h-3.5 w-3.5 text-[hsl(var(--optavia-green))]" />
                        Send Invite to {selectedClient.label.split(" ")[0]}
                      </Label>

                      <div className="flex rounded-lg border overflow-hidden">
                        <button
                          type="button"
                          onClick={() => setInviteMethod("email")}
                          className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 text-sm font-medium transition-colors ${
                            inviteMethod === "email"
                              ? "bg-[hsl(var(--optavia-green))] text-white"
                              : "bg-white text-gray-600 hover:bg-gray-50"
                          }`}
                        >
                          <Mail className="h-3.5 w-3.5" />
                          Email Invite
                        </button>
                        <button
                          type="button"
                          onClick={() => setInviteMethod("text")}
                          className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 text-sm font-medium transition-colors ${
                            inviteMethod === "text"
                              ? "bg-green-600 text-white"
                              : "bg-white text-gray-600 hover:bg-gray-50"
                          }`}
                        >
                          <MessageSquare className="h-3.5 w-3.5" />
                          Copy for Text
                        </button>
                      </div>

                      {inviteMethod === "email" && (
                        <div className="space-y-1.5">
                          <Input
                            type="text"
                            placeholder={`${selectedClient.label.split(" ")[0].toLowerCase()}@email.com`}
                            value={clientEmail}
                            onChange={(e) => setClientEmail(e.target.value)}
                            className="h-10 text-sm"
                          />
                          <p className="text-xs text-gray-500">
                            Sends a calendar invite with meeting details to {selectedClient.label.split(" ")[0]}
                          </p>
                        </div>
                      )}

                      {inviteMethod === "text" && (
                        <div className="space-y-1.5">
                          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                            <p className="text-sm text-gray-600 leading-relaxed">
                              {generateCheckinTextInvite()}
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={async () => {
                              try {
                                await navigator.clipboard.writeText(generateCheckinTextInvite())
                                setScheduleTextCopied(true)
                                setTimeout(() => setScheduleTextCopied(false), 3000)
                              } catch {}
                            }}
                            className={`w-full text-sm ${scheduleTextCopied ? "bg-teal-50 border-teal-300 text-teal-700" : ""}`}
                          >
                            {scheduleTextCopied ? <><Check className="h-3.5 w-3.5 mr-1.5" /> Copied!</> : <><Copy className="h-3.5 w-3.5 mr-1.5" /> Copy to Clipboard</>}
                          </Button>
                          <p className="text-xs text-gray-500">
                            Paste into your texting app to send manually
                          </p>
                        </div>
                      )}
                    </>
                  )}

                  {/* Calendar Only Toggle */}
                  <div className={`rounded-xl p-3 flex items-center justify-between transition-all ${
                    calendarOnly ? "border-2 border-[hsl(var(--optavia-green))] bg-green-50" : "border border-gray-200"
                  }`}>
                    <div className="flex items-center gap-3">
                      <Lock className={`h-4 w-4 ${calendarOnly ? "text-[hsl(var(--optavia-green))]" : "text-gray-400"}`} />
                      <div>
                        <p className={`text-sm font-semibold ${calendarOnly ? "text-[hsl(var(--optavia-green))]" : "text-gray-700"}`}>
                          Only add to my calendar
                        </p>
                        <p className="text-xs text-gray-500">
                          Don't send an invite to {selectedClient.label.split(" ")[0]}
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={calendarOnly}
                      onCheckedChange={setCalendarOnly}
                    />
                  </div>
                </div>

                {/* Summary line */}
                {(recurringFrequency !== "none" || scheduleDate) && (
                  <div className="text-center">
                    <p className="text-sm text-[hsl(var(--optavia-green))] font-medium">
                      {(() => {
                        const d = recurringFrequency === "none" && scheduleDate
                          ? new Date(scheduleDate + "T00:00:00")
                          : getNextDayDate(scheduleDay)
                        return d.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })
                      })()} · {scheduleHour}:{scheduleMinute} {scheduleAmPm} · {meetingType === "phone" ? "Phone" : "Zoom"}
                    </p>
                    <p className="text-xs text-green-600 mt-0.5">
                      {calendarOnly
                        ? "Coach calendar only"
                        : inviteMethod === "email"
                        ? clientEmail ? `Email invite → ${clientEmail}` : "Email invite → no email entered"
                        : "Text invite (copy)"
                      }
                    </p>
                  </div>
                )}

                {/* Primary Action Button */}
                <Button
                  onClick={handleSaveSchedule}
                  disabled={scheduleSaving || (recurringFrequency === "none" && !scheduleDate) || (!calendarOnly && inviteMethod === "email" && !clientEmail.trim())}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white py-5 text-base rounded-xl"
                  size="lg"
                >
                  {scheduleSaving ? (
                    <><Loader2 className="h-5 w-5 mr-2 animate-spin" /> Saving...</>
                  ) : (
                    <><CalendarPlus className="h-5 w-5 mr-2" /> Save &amp; Send</>
                  )}
                </Button>

                {/* Contextual Explainer */}
                <p className="text-xs text-gray-400 text-center leading-relaxed flex items-start gap-1.5 justify-center">
                  <Info className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
                  {calendarOnly
                    ? `This will add the check-in to your calendar only. No invite will be sent to ${selectedClient.label.split(" ")[0]}.`
                    : inviteMethod === "email" && clientEmail
                    ? `Enter ${selectedClient.label.split(" ")[0]}'s email above to send them an invite, or toggle "Only add to my calendar" to skip.`
                    : inviteMethod === "text"
                    ? `This will add the check-in to your calendar. Don't forget to paste the copied invite text to ${selectedClient.label.split(" ")[0]}.`
                    : `Enter ${selectedClient.label.split(" ")[0]}'s email above to send them an invite, or toggle "Only add to my calendar" to skip.`
                  }
                </p>

                {/* Cancel */}
                <button
                  type="button"
                  onClick={() => {
                    setShowScheduleModal(false)
                    setSelectedClient(null)
                    setMeetingType("phone")
                    setCalendarOnly(false)
                    setInviteMethod("email")
                  }}
                  className="w-full text-center text-sm text-gray-400 hover:text-gray-600 transition-colors py-1"
                >
                  Cancel
                </button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Client Troubleshooting Guide Modal */}
      <Dialog open={showTroubleshootModal} onOpenChange={setShowTroubleshootModal}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5 text-[hsl(var(--optavia-green))]" />
              Client Troubleshooting Guide
            </DialogTitle>
            <DialogDescription>
              Identify and resolve common client challenges.
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto -mx-6 px-6 pb-2">
            <ClientTroubleshootingDialog />
          </div>
        </DialogContent>
      </Dialog>

      {/* Coach Recruitment Objections Modal */}
      <Dialog open={showRecruitmentNav} onOpenChange={setShowRecruitmentNav}>
        <DialogContent className="sm:max-w-lg max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageCircleQuestion className="h-5 w-5 text-[hsl(var(--optavia-green))]" />
              Coach Recruitment Objections
            </DialogTitle>
            <DialogDescription>
              Scripts and strategies for recruitment and re-engagement conversations.
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto -mx-6 px-6 pb-2">
            <RecruitmentNavigator />
          </div>
        </DialogContent>
      </Dialog>

      {/* Client Journey Guide Modal */}
      {showGuideModal && (
        <ClientJourneyGuide onClose={() => setShowGuideModal(false)} />
      )}

      {/* Clear Schedule Confirmation */}
      <AlertDialog open={showClearConfirm} onOpenChange={setShowClearConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear Scheduled Check-in?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the scheduled check-in time. You can always schedule a new one.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (clientToClear) {
                  updateClient(clientToClear, { 
                    next_scheduled_at: null,
                    recurring_frequency: null,
                    recurring_day: null,
                    recurring_time: null 
                  })
                  toast({
                    title: "❌ Check-in Cancelled",
                    description: "The scheduled check-in has been removed.",
                  })
                  setClientToClear(null)
                }
              }}
              className="bg-red-500 hover:bg-red-600"
            >
              Clear Schedule
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Client Milestone Celebration Modal */}
      <Dialog open={showMilestoneModal} onOpenChange={setShowMilestoneModal}>
        <DialogContent className="max-w-md text-center">
          <DialogHeader className="sr-only">
            <DialogTitle>Client Milestone Celebration</DialogTitle>
          </DialogHeader>
          <div className="py-6">
            <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center shadow-lg animate-bounce">
              <Trophy className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              🎉 Amazing Achievement!
            </h2>
            <div className="text-5xl font-bold text-[hsl(var(--optavia-green))] mb-3">
              {milestoneCount} Clients!
            </div>
            <p className="text-gray-600 mb-4">
              You've now helped <strong>{milestoneCount} people</strong> on their health journey!
            </p>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-center gap-2 text-green-700 mb-2">
                <Heart className="h-5 w-5 fill-current" />
                <span className="font-semibold">Lives Changed</span>
                <Heart className="h-5 w-5 fill-current" />
              </div>
              <p className="text-sm text-green-600">
                {milestoneCount === 5 && "Your first 5! You're officially making an impact."}
                {milestoneCount === 10 && "Double digits! You're building real momentum."}
                {milestoneCount === 15 && "15 lives transformed. You're on fire! 🔥"}
                {milestoneCount === 20 && "20 clients! Think about the ripple effect you've created."}
                {milestoneCount === 25 && "A quarter century of transformations! Incredible."}
                {milestoneCount === 50 && "FIFTY clients! You're a true health champion! 🏆"}
                {milestoneCount === 75 && "75 people healthier because of YOU!"}
                {milestoneCount === 100 && "100 CLIENTS! You've changed 100 lives! 🌟"}
                {milestoneCount > 100 && `${milestoneCount} lives changed. You're a legend!`}
                {![5, 10, 15, 20, 25, 50, 75, 100].includes(milestoneCount) && milestoneCount <= 100 && milestoneCount > 25 && 
                  `${milestoneCount} clients helped on their journey!`
                }
              </p>
            </div>
            <p className="text-sm text-gray-500 italic">
              Rank is great, but impact is everything. Keep changing lives! 💚
            </p>
          </div>
          <Button 
            onClick={() => setShowMilestoneModal(false)}
            className="w-full bg-[hsl(var(--optavia-green))] hover:bg-[hsl(var(--optavia-green))]/90"
          >
            Keep Going! 💪
          </Button>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  )
}
