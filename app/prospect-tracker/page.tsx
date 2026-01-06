"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { useProspects, statusConfig, sourceOptions, actionTypeLabels, type ProspectStatus, type ProspectSource, type Prospect } from "@/hooks/use-prospects"
import { useDebounce } from "@/hooks/use-debounce"
import { useClients } from "@/hooks/use-clients"
import { useUserData } from "@/contexts/user-data-context"
import { useToast } from "@/hooks/use-toast"
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Users,
  Plus,
  Search,
  Calendar,
  Clock,
  AlertCircle,
  Trash2,
  Edit2,
  ArrowRight,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  PartyPopper,
  Heart,
  CalendarPlus,
  ExternalLink,
  X,
  Send,
  List,
  CalendarDays,
  Info,
  GraduationCap,
  Download,
  CheckCircle,
  Phone,
  Video,
} from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ScheduleCalendarOptions } from "@/components/schedule-calendar-options"
import { ShareHealthAssessment } from "@/components/share-health-assessment"
import { PipelineProgressionGuide } from "@/components/pipeline-progression-guide"
import { ReminderButton } from "@/components/reminders-panel"
import { ErrorBoundary } from "@/components/ui/error-boundary"
import { StatsCardsSkeleton, ProspectListSkeleton, WeekViewSkeleton } from "@/components/ui/skeleton-loaders"
import { ProspectCard } from "@/components/prospect-tracker/prospect-card"
import { HelpCircle } from "lucide-react"
import type { CalendarEvent } from "@/lib/calendar-utils"

// Time options for HA scheduling
const HOUR_OPTIONS = Array.from({ length: 12 }, (_, i) => i + 1)
const MINUTE_OPTIONS = ["00", "15", "30", "45"]

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

export default function ProspectTrackerPage() {
  const {
    prospects,
    loading,
    stats,
    addProspect,
    updateProspect,
    deleteProspect,
    getFilteredProspects,
    getDaysUntil,
  } = useProspects()

  const { addClient } = useClients()
  const { user, profile } = useUserData()
  const { toast } = useToast()

  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showConvertModal, setShowConvertModal] = useState(false)
  const [showHAScheduleModal, setShowHAScheduleModal] = useState(false)
  const [showHASendModal, setShowHASendModal] = useState(false)
  const [showGuideModal, setShowGuideModal] = useState(false)
  const [editingProspect, setEditingProspect] = useState<Prospect | null>(null)
  const [convertingProspect, setConvertingProspect] = useState<Prospect | null>(null)
  const [schedulingProspect, setSchedulingProspect] = useState<Prospect | null>(null)
  const [filterStatus, setFilterStatus] = useState<ProspectStatus | "all">("all")
  const [searchTerm, setSearchTerm] = useState("")
  
  // Debounce search term for better performance
  const debouncedSearchTerm = useDebounce(searchTerm, 300)
  const [viewMode, setViewMode] = useState<"list" | "week">("list")
  const [weekOffset, setWeekOffset] = useState(0) // 0 = current week, 1 = next week, etc.
  const [clientStartDate, setClientStartDate] = useState("")

  // HA Scheduling state
  const [haDate, setHaDate] = useState("")
  const [haHour, setHaHour] = useState(10)
  const [haMinute, setHaMinute] = useState("00")
  const [haAmPm, setHaAmPm] = useState<"AM" | "PM">("AM")
  const [prospectEmail, setProspectEmail] = useState("")
  const [prospectPhone, setProspectPhone] = useState("")
  
  // Meeting type state (Phone vs Zoom)
  const [haMeetingType, setHaMeetingType] = useState<"phone" | "zoom">("phone")
  const [haZoomLink, setHaZoomLink] = useState("")
  const [haZoomMeetingId, setHaZoomMeetingId] = useState("")
  const [haZoomPasscode, setHaZoomPasscode] = useState("")
  
  // Prefill zoom details from profile when meeting type changes to Zoom
  const prefillZoomDetails = () => {
    if (profile?.zoom_link && !haZoomLink) setHaZoomLink(profile.zoom_link)
    if (profile?.zoom_meeting_id && !haZoomMeetingId) setHaZoomMeetingId(profile.zoom_meeting_id)
    if (profile?.zoom_passcode && !haZoomPasscode) setHaZoomPasscode(profile.zoom_passcode)
  }

  // Delete confirmation state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [prospectToDelete, setProspectToDelete] = useState<string | null>(null)
  
  // Clear HA confirmation state
  const [showClearHAConfirm, setShowClearHAConfirm] = useState(false)
  const [prospectToClearHA, setProspectToClearHA] = useState<string | null>(null)

  const [newProspect, setNewProspect] = useState({
    label: "",
    source: "social" as ProspectSource,
    notes: "",
  })

  const today = new Date().toISOString().split("T")[0]

  // Generate SMS text for HA invite
  const generateHASMSText = (prospect: Prospect, scheduledAt: Date): string => {
    const dateStr = scheduledAt.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })
    const timeStr = scheduledAt.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
    return `Hi! 🌟 Just confirming our Health Assessment call for ${dateStr} at ${timeStr}. I'm excited to learn about your health goals and see how I can help! Talk soon! 💪`
  }

  // Send SMS with HA scheduled info
  const sendHASMS = (prospect: Prospect) => {
    if (!prospect.phone || !prospect.ha_scheduled_at) return
    const scheduledAt = new Date(prospect.ha_scheduled_at)
    const message = generateHASMSText(prospect, scheduledAt)
    const smsUrl = `sms:${prospect.phone}?body=${encodeURIComponent(message)}`
    window.open(smsUrl)
    toast({
      title: "📱 Opening Messages",
      description: `Sending HA reminder to ${prospect.label}`,
    })
  }

  // Convert 12-hour to 24-hour format
  const get24Hour = (hour: number, ampm: "AM" | "PM"): number => {
    if (ampm === "AM") {
      return hour === 12 ? 0 : hour
    } else {
      return hour === 12 ? 12 : hour + 12
    }
  }

  // Generate Google Calendar URL for HA
  const generateHACalendarUrl = (prospect: Prospect, date: string, hour: number, minute: string, ampm: "AM" | "PM"): string => {
    const targetDate = new Date(date + "T00:00:00")
    const hour24 = get24Hour(hour, ampm)
    targetDate.setHours(hour24, parseInt(minute), 0, 0)
    
    const endDate = new Date(targetDate)
    endDate.setMinutes(endDate.getMinutes() + 45) // 45 min duration for HA
    
    const title = `Health Assessment: ${prospect.label}`
    const details = `Health Assessment Call with ${prospect.label}

Source: ${sourceOptions.find(s => s.value === prospect.source)?.label || prospect.source}
${prospect.notes ? `Notes: ${prospect.notes}` : ""}

Talking Points:
- Current health goals
- Past weight loss attempts
- Why now?
- Lifestyle & schedule
- Ready to commit?`

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

  // Generate calendar event from HA schedule settings
  const generateHACalendarEvent = (): CalendarEvent | null => {
    if (!schedulingProspect || !haDate) return null
    
    const targetDate = new Date(haDate + "T00:00:00")
    const hour24 = get24Hour(haHour, haAmPm)
    targetDate.setHours(hour24, parseInt(haMinute), 0, 0)
    
    const endDate = new Date(targetDate)
    endDate.setMinutes(endDate.getMinutes() + 45) // 45 min duration for HA
    
    // Build meeting details based on meeting type
    let meetingDetails = ""
    let location = ""
    
    if (haMeetingType === "zoom" && haZoomLink) {
      meetingDetails = `\n\n📹 Zoom Meeting:\n${haZoomLink}`
      if (haZoomMeetingId) meetingDetails += `\nMeeting ID: ${haZoomMeetingId}`
      if (haZoomPasscode) meetingDetails += `\nPasscode: ${haZoomPasscode}`
      location = haZoomLink
    } else if (haMeetingType === "phone") {
      meetingDetails = "\n\n📱 Phone Call"
      if (prospectPhone) meetingDetails += `\nCall: ${prospectPhone}`
    }
    
    return {
      title: `Health Assessment: ${schedulingProspect.label}`,
      description: `Health Assessment Call with ${schedulingProspect.label}
${meetingDetails}

Source: ${sourceOptions.find(s => s.value === schedulingProspect.source)?.label || schedulingProspect.source}
${schedulingProspect.notes ? `Notes: ${schedulingProspect.notes}` : ""}

Talking Points:
- Current health goals
- Past weight loss attempts
- Why now?
- Lifestyle & schedule
- Ready to commit?`,
      startDate: targetDate,
      endDate: endDate,
      location: location || undefined,
      uid: `prospect-ha-${schedulingProspect.id}-${Date.now()}@coachingamplifier.com`,
    }
  }

  // Handle saving HA schedule (called before calendar actions)
  const handleSaveHASchedule = async () => {
    if (!schedulingProspect || !haDate) return
    
    // Calculate the full scheduled datetime
    const targetDate = new Date(haDate + "T00:00:00")
    const hour24 = get24Hour(haHour, haAmPm)
    targetDate.setHours(hour24, parseInt(haMinute), 0, 0)
    
    // Update prospect with HA scheduled datetime
    // Note: email is not stored on prospect, only used for sending invites
    const success = await updateProspect(schedulingProspect.id, {
      next_action: haDate,
      ha_scheduled_at: targetDate.toISOString(),
      phone: prospectPhone || null,
    })
    
    if (success) {
      toast({
        title: "📅 HA Scheduled!",
        description: `${haHour}:${haMinute} ${haAmPm} on ${targetDate.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}`,
      })
      
      setShowHAScheduleModal(false)
      setSchedulingProspect(null)
      // Reset zoom fields
      setHaMeetingType("phone")
      setHaZoomLink("")
      setHaZoomMeetingId("")
      setHaZoomPasscode("")
    } else {
      toast({
        title: "Failed to schedule HA",
        description: "Please try again",
        variant: "destructive",
      })
    }
  }

  const handleAddProspect = async () => {
    if (!newProspect.label.trim()) return
    await addProspect({
      label: newProspect.label,
      source: newProspect.source,
      notes: newProspect.notes || undefined,
    })
    setNewProspect({ label: "", source: "social", notes: "" })
    setShowAddModal(false)
  }

  const handleUpdateStatus = async (id: string, newStatus: ProspectStatus) => {
    // If converting to client, show the convert modal
    if (newStatus === "converted") {
      const prospect = prospects.find(p => p.id === id)
      if (prospect) {
        setConvertingProspect(prospect)
        setClientStartDate(today)
        setShowConvertModal(true)
      }
      return
    }
    
    // If scheduling HA, show the schedule modal
    if (newStatus === "ha_scheduled") {
      const prospect = prospects.find(p => p.id === id)
      if (prospect) {
        setSchedulingProspect(prospect)
        setHaDate(today)
        setHaHour(10)
        setHaMinute("00")
        setHaAmPm("AM")
        setProspectEmail((prospect as any).email || "")
        setProspectPhone((prospect as any).phone || "")
        setShowHAScheduleModal(true)
      }
      return
    }
    
    await updateProspect(id, { status: newStatus })
  }

  const handleConvertToClient = async () => {
    if (!convertingProspect || !clientStartDate) return

    // Create the client record
    const newClient = await addClient({
      label: convertingProspect.label,
      start_date: clientStartDate,
    })

    if (newClient) {
      // Update the prospect status to converted
      await updateProspect(convertingProspect.id, { status: "converted" })

      toast({
        title: "🎉 Client Created!",
        description: `${convertingProspect.label} has been added to your client list.`,
      })

      // Send celebration email to the coach
      const coachEmail = profile?.notification_email || user?.email
      const coachName = profile?.full_name || user?.email?.split("@")[0] || "Coach"
      
      if (coachEmail) {
        try {
          await fetch("/api/send-new-client-email", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              to: coachEmail,
              coachName: coachName,
              clientName: convertingProspect.label,
              startDate: clientStartDate,
            }),
          })
        } catch (error) {
          console.error("Failed to send celebration email:", error)
          // Don't show error to user - email is a bonus, not critical
        }
      }
    }

    setShowConvertModal(false)
    setConvertingProspect(null)
    setClientStartDate("")
  }

  const handleDelete = (id: string) => {
    setProspectToDelete(id)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!prospectToDelete) return
    await deleteProspect(prospectToDelete)
    setDeleteDialogOpen(false)
    setProspectToDelete(null)
    toast({
      title: "Prospect removed",
      description: "The prospect has been deleted",
    })
  }

  const exportToCSV = () => {
    const headers = ["Label", "Status", "Source", "Action Type", "Next Action", "HA Scheduled", "Notes", "Created"]
    
    const rows = prospects.map(p => [
      p.label,
      statusConfig[p.status]?.label || p.status,
      sourceOptions.find(s => s.value === p.source)?.label || p.source,
      p.action_type ? actionTypeLabels[p.action_type] : "",
      p.next_action || "",
      p.ha_scheduled_at ? new Date(p.ha_scheduled_at).toLocaleString() : "",
      p.notes?.replace(/"/g, '""') || "",
      new Date(p.created_at).toLocaleDateString(),
    ])

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `100s-list-${new Date().toISOString().split("T")[0]}.csv`
    link.click()
    URL.revokeObjectURL(url)

    toast({
      title: "Export complete",
      description: `Exported ${prospects.length} prospects to CSV`,
    })
  }

  // Memoize filtered prospects for better performance
  const filteredProspects = useMemo(() => 
    getFilteredProspects(filterStatus, debouncedSearchTerm),
    [filterStatus, debouncedSearchTerm, getFilteredProspects]
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
          <ProspectListSkeleton count={5} />
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
                <span className="font-semibold">100's List Tracker</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-3">
                <Users className="h-8 w-8" />
                100's List Tracker
              </h1>
              <p className="text-sm opacity-90 mt-1">
                Track your 100's list with privacy-first labels
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                className="bg-[#f88221] border-[#f88221] text-white hover:bg-[#e07520]"
                onClick={() => setShowGuideModal(true)}
              >
                <GraduationCap className="h-4 w-4 mr-2" />
                Learn the 100's List Journey
              </Button>
              <Link href="/client-tracker">
                <Button variant="outline" className="bg-white/10 border-white/30 text-white hover:bg-white/20">
                  <Users className="h-4 w-4 mr-2" />
                  My Clients
                </Button>
              </Link>
              <Button
                onClick={() => setShowAddModal(true)}
                className="bg-white text-[hsl(var(--optavia-green))] hover:bg-white/90"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add to List
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Privacy Notice */}
      <div className="bg-blue-50 border-b border-blue-200">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-blue-700">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>
              <strong>Privacy:</strong> Use nicknames only. Contact info should be managed in OPTAVIA's official coach portal.
            </span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <ErrorBoundary>
        {/* Stats */}
        <TooltipProvider>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4 text-center relative">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600">
                      <Info className="h-4 w-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-xs p-3 bg-white/95 backdrop-blur-sm shadow-lg border border-gray-200">
                    <p className="font-semibold text-green-700 mb-1">Active Prospects</p>
                    <p className="text-sm text-gray-600">Total prospects in your 100's List who haven't been converted to clients yet.</p>
                  </TooltipContent>
                </Tooltip>
                <div className="text-3xl font-bold text-[hsl(var(--optavia-green))]">{stats.total}</div>
                <div className="text-sm text-gray-500">Active Prospects</div>
              </CardContent>
            </Card>
            <Card className={stats.overdue > 0 ? "border-orange-300 bg-orange-50" : ""}>
              <CardContent className="p-4 text-center relative">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600">
                      <Info className="h-4 w-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-xs p-3 bg-white/95 backdrop-blur-sm shadow-lg border border-gray-200">
                    <p className="font-semibold text-orange-700 mb-2">⏰ Overdue Follow-ups</p>
                    <p className="text-sm text-gray-600">Prospects with a follow-up date that has passed. Time to reach out!</p>
                  </TooltipContent>
                </Tooltip>
                <div className="text-3xl font-bold text-orange-500">{stats.overdue}</div>
                <div className="text-sm text-gray-500">Overdue</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center relative">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600">
                      <Info className="h-4 w-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-xs p-3 bg-white/95 backdrop-blur-sm shadow-lg border border-gray-200">
                    <p className="font-semibold text-purple-700 mb-1">📅 HA Scheduled</p>
                    <p className="text-sm text-gray-600">Prospects who have a Health Assessment scheduled. These are your hot leads!</p>
                  </TooltipContent>
                </Tooltip>
                <div className="text-3xl font-bold text-purple-500">
                  {prospects.filter(p => p.ha_scheduled_at && !["converted", "coach"].includes(p.status)).length}
                </div>
                <div className="text-sm text-gray-500">HA Scheduled</div>
              </CardContent>
            </Card>
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4 text-center relative">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600">
                      <Info className="h-4 w-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-xs p-3 bg-white/95 backdrop-blur-sm shadow-lg border border-gray-200">
                    <p className="font-semibold text-green-700 mb-1">🎉 Converted</p>
                    <p className="text-sm text-gray-600">Prospects who have become clients! These are your wins from the 100's List.</p>
                  </TooltipContent>
                </Tooltip>
                <div className="text-3xl font-bold text-green-600">{stats.converted}</div>
                <div className="text-sm text-gray-500">Converted</div>
              </CardContent>
            </Card>
          </div>
        </TooltipProvider>

        {/* Search, Filter and View Toggle */}
        <div className="flex flex-col gap-4 mb-6">
          {/* Search Bar */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by label..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex items-center justify-between gap-2">
            {/* Filter Tabs */}
            <div className="flex gap-1 sm:gap-2 flex-wrap">
              <TooltipProvider>
                {(["all", "new", "interested", "converted", "not_interested", "not_closed"] as const).map((status) => {
                  const statusTooltips: Record<string, string> = {
                    new: "Reach Out",
                    interested: "Send HA",
                    converted: "Client Won!",
                    not_interested: "Remove from 100's List",
                    not_closed: "Set Reminder to Reach Out Again",
                  }
                  
                  const button = (
                    <Button
                      key={status}
                      variant={filterStatus === status ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFilterStatus(status)}
                      className={`text-xs sm:text-sm px-2 sm:px-3 ${filterStatus === status ? "bg-[hsl(var(--optavia-green))]" : ""}`}
                    >
                      {status === "all" ? "All" : statusConfig[status as ProspectStatus]?.label || status}
                    </Button>
                  )
                  
                  // "All" doesn't need a tooltip
                  if (status === "all") return button
                  
                  return (
                    <Tooltip key={status}>
                      <TooltipTrigger asChild>
                        {button}
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{statusTooltips[status]}</p>
                      </TooltipContent>
                    </Tooltip>
                  )
                })}
              </TooltipProvider>
            </div>

            {/* View Toggle & Export */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={exportToCSV}
                className="text-gray-600"
                title="Export to CSV"
              >
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline ml-1">Export</span>
              </Button>
              <div className="flex rounded-lg border overflow-hidden">
                <button
                  onClick={() => setViewMode("list")}
                  className={`px-3 sm:px-4 py-2 flex items-center justify-center gap-1.5 sm:gap-2 text-sm font-medium transition-colors ${
                    viewMode === "list"
                      ? "bg-[hsl(var(--optavia-green))] text-white"
                      : "bg-white text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <List className="h-4 w-4" />
                  <span className="hidden sm:inline">List</span>
                </button>
                <button
                  onClick={() => setViewMode("week")}
                  className={`px-3 sm:px-4 py-2 flex items-center justify-center gap-1.5 sm:gap-2 text-sm font-medium transition-colors ${
                    viewMode === "week"
                      ? "bg-[hsl(var(--optavia-green))] text-white"
                      : "bg-white text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <CalendarDays className="h-4 w-4" />
                  <span className="hidden sm:inline">Week</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Week Calendar View */}
        {viewMode === "week" && (
          <div className="mb-6">
            {/* Week Navigation */}
            <div className="flex items-center justify-between mb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setWeekOffset(weekOffset - 1)}
                disabled={weekOffset <= 0}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              <div className="text-center">
                <span className="font-semibold text-gray-900">
                  {(() => {
                    const now = new Date()
                    const startOfWeek = new Date(now)
                    startOfWeek.setDate(now.getDate() - now.getDay() + weekOffset * 7)
                    const endOfWeek = new Date(startOfWeek)
                    endOfWeek.setDate(startOfWeek.getDate() + 6)
                    return `${startOfWeek.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${endOfWeek.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
                  })()}
                </span>
                {weekOffset === 0 && (
                  <Badge className="ml-2 bg-green-100 text-green-700">This Week</Badge>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setWeekOffset(weekOffset + 1)}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>

            {/* Week Grid */}
            <div className="grid grid-cols-7 gap-2">
              {DAYS_OF_WEEK.map((day) => {
                const now = new Date()
                const startOfWeek = new Date(now)
                startOfWeek.setDate(now.getDate() - now.getDay() + weekOffset * 7)
                const dayDate = new Date(startOfWeek)
                dayDate.setDate(startOfWeek.getDate() + day.value)
                const isToday = dayDate.toDateString() === now.toDateString()
                const isPast = dayDate < new Date(now.toDateString())

                // Get prospects scheduled for this day (by ha_scheduled_at)
                const dayProspects = filteredProspects.filter((prospect) => {
                  if (!prospect.ha_scheduled_at) return false
                  const scheduledDate = new Date(prospect.ha_scheduled_at)
                  return scheduledDate.toDateString() === dayDate.toDateString()
                }).sort((a, b) => {
                  const aTime = new Date(a.ha_scheduled_at!).getTime()
                  const bTime = new Date(b.ha_scheduled_at!).getTime()
                  return aTime - bTime
                })

                return (
                  <div
                    key={day.value}
                    className={`min-h-[200px] rounded-lg border ${
                      isToday
                        ? "border-[hsl(var(--optavia-green))] bg-green-50"
                        : isPast
                        ? "bg-gray-50 border-gray-200"
                        : "bg-white border-gray-200"
                    }`}
                  >
                    {/* Day Header */}
                    <div
                      className={`px-2 py-2 border-b text-center ${
                        isToday ? "bg-[hsl(var(--optavia-green))] text-white" : "bg-gray-100"
                      }`}
                    >
                      <div className="text-xs font-medium">{day.short}</div>
                      <div className={`text-lg font-bold ${isToday ? "" : "text-gray-700"}`}>
                        {dayDate.getDate()}
                      </div>
                    </div>

                    {/* Day Content */}
                    <div className="p-2 space-y-2">
                      {dayProspects.length === 0 ? (
                        <div className="text-xs text-gray-400 text-center py-4">
                          No HAs
                        </div>
                      ) : (
                        dayProspects.map((prospect) => {
                          const config = statusConfig[prospect.status]
                          const scheduledTime = new Date(prospect.ha_scheduled_at!).toLocaleTimeString("en-US", {
                            hour: "numeric",
                            minute: "2-digit",
                          })
                          return (
                            <div
                              key={prospect.id}
                              onClick={() => {
                                setSchedulingProspect(prospect)
                                setShowHAScheduleModal(true)
                              }}
                              className="p-2 rounded-lg border border-gray-200 bg-white hover:shadow-sm cursor-pointer transition-shadow"
                              style={{ borderLeftColor: config.color, borderLeftWidth: "3px" }}
                            >
                              <div className="text-xs font-medium text-gray-900 truncate">
                                {prospect.label}
                              </div>
                              <div className="flex items-center justify-between mt-1">
                                <span className="text-xs text-gray-500">{scheduledTime}</span>
                                <Badge
                                  className="text-[10px] px-1.5 py-0"
                                  style={{ backgroundColor: config.bg, color: config.color }}
                                >
                                  HA
                                </Badge>
                              </div>
                            </div>
                          )
                        })
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Unscheduled Prospects */}
            {(() => {
              const unscheduledProspects = filteredProspects.filter(p => !p.ha_scheduled_at && !["converted", "coach", "not_interested"].includes(p.status))
              if (unscheduledProspects.length === 0) return null
              return (
                <div className="mt-6">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertCircle className="h-4 w-4 text-orange-500" />
                    <span className="font-medium text-gray-700">No HA Scheduled ({unscheduledProspects.length})</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {unscheduledProspects.map((prospect) => {
                      const config = statusConfig[prospect.status]
                      return (
                        <Button
                          key={prospect.id}
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSchedulingProspect(prospect)
                            setShowHAScheduleModal(true)
                          }}
                          className="border-orange-200 text-orange-700 hover:bg-orange-50"
                        >
                          <div
                            className="w-5 h-5 rounded mr-2 flex items-center justify-center text-sm"
                            style={{ backgroundColor: config.bg }}
                          >
                            {config.icon}
                          </div>
                          {prospect.label}
                          <CalendarPlus className="h-3 w-3 ml-2" />
                        </Button>
                      )
                    })}
                  </div>
                </div>
              )
            })()}
          </div>
        )}

        {/* Prospect List */}
        {viewMode === "list" && (
        <div className="space-y-3">
          {filteredProspects.map((prospect) => {
            const config = statusConfig[prospect.status]
            const daysUntil = getDaysUntil(prospect.next_action)
            const isOverdue = daysUntil !== null && daysUntil < 0

            return (
              <Card
                key={prospect.id}
                className={`transition-shadow hover:shadow-md ${
                  isOverdue ? "border-orange-300 bg-orange-50" : ""
                }`}
              >
                <CardContent className="p-4">
                  {/* Header Row: Status Icon & Prospect Info */}
                  <div className="flex items-start gap-3">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                      style={{ backgroundColor: config.bg }}
                    >
                      {config.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-gray-900">{prospect.label}</span>
                        <Badge
                          variant="secondary"
                          style={{ backgroundColor: config.bg, color: config.color }}
                        >
                          {config.label}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                        <span>{sourceOptions.find(s => s.value === prospect.source)?.label}</span>
                        {prospect.action_type && (
                          <span className="flex items-center gap-1">
                            <ArrowRight className="h-3 w-3" />
                            {actionTypeLabels[prospect.action_type]}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Scheduled Date/Time Row */}
                  {(prospect.ha_scheduled_at || prospect.next_action) && (
                    <div className="mt-3 flex items-center gap-2 flex-wrap">
                      {prospect.ha_scheduled_at ? (
                        <>
                          <Badge 
                            className={`flex items-center gap-1.5 px-2.5 py-1 text-sm font-medium ${
                              new Date(prospect.ha_scheduled_at) < new Date() 
                                ? "bg-red-100 text-red-700 border border-red-200" 
                                : "bg-purple-100 text-purple-700 border border-purple-200"
                            }`}
                          >
                            <Calendar className="h-3.5 w-3.5" />
                            <span>HA:</span>
                            {new Date(prospect.ha_scheduled_at).toLocaleDateString("en-US", {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                            })}
                            {" "}
                            {new Date(prospect.ha_scheduled_at).toLocaleTimeString("en-US", {
                              hour: "numeric",
                              minute: "2-digit",
                            })}
                          </Badge>
                          {prospect.phone && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => sendHASMS(prospect)}
                              className="h-7 w-7 p-0 text-purple-500 hover:text-purple-700 hover:bg-purple-50"
                              title="Send SMS reminder"
                            >
                              <Send className="h-3 w-3" />
                            </Button>
                          )}
                          {/* Complete HA Button - only show if HA date is today or past */}
                          {new Date(prospect.ha_scheduled_at).setHours(0,0,0,0) <= new Date().setHours(0,0,0,0) && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                updateProspect(prospect.id, { 
                                  ha_scheduled_at: null, 
                                  next_action: null,
                                  status: "converted" 
                                })
                                toast({
                                  title: "🎉 HA Completed!",
                                  description: "Great job! Prospect marked as converted.",
                                })
                              }}
                              className="h-7 w-7 p-0 bg-green-100 hover:bg-green-200 rounded-full"
                              title="Mark HA as completed"
                            >
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            </Button>
                          )}
                          {/* Cancel HA Button */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setProspectToClearHA(prospect.id)
                              setShowClearHAConfirm(true)
                            }}
                            className="h-7 w-7 p-0 bg-red-100 hover:bg-red-200 rounded-full"
                            title="Cancel scheduled HA"
                          >
                            <X className="h-4 w-4 text-red-600" />
                          </Button>
                        </>
                      ) : prospect.next_action && (
                        <>
                          {isOverdue ? (
                            <Badge variant="destructive" className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {Math.abs(daysUntil!)} days overdue
                            </Badge>
                          ) : daysUntil === 0 ? (
                            <Badge className="bg-blue-500 flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Today
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              In {daysUntil} days
                            </Badge>
                          )}
                        </>
                      )}
                    </div>
                  )}

                  {/* Action Buttons - All on same row */}
                  <div className="mt-4 flex gap-2">
                    {/* Status Select */}
                    <Select
                      value={prospect.status}
                      onValueChange={(value) => handleUpdateStatus(prospect.id, value as ProspectStatus)}
                    >
                      <SelectTrigger className="flex-1 min-w-0">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(statusConfig)
                          .filter(([key]) => 
                            // Show current status + all except ha_scheduled and coach
                            key === prospect.status || !["ha_scheduled", "coach"].includes(key)
                          )
                          .map(([key, value]) => (
                            <SelectItem key={key} value={key}>
                              {value.icon} {value.label}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>

                    {/* Health Assessment Controls */}
                    {prospect.status !== "converted" && prospect.status !== "coach" && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSchedulingProspect(prospect)
                            setProspectEmail((prospect as any).email || "")
                            setProspectPhone((prospect as any).phone || "")
                            setShowHASendModal(true)
                          }}
                          className="flex-1 text-blue-600 border-blue-200 hover:bg-blue-50"
                          title="Send HA Invite"
                        >
                          <Send className="h-4 w-4 mr-1" />
                          <span className="text-xs sm:text-sm">Send HA</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSchedulingProspect(prospect)
                            setHaDate(prospect.status === "ha_scheduled" && prospect.next_action ? prospect.next_action : today)
                            setHaHour(10)
                            setHaMinute("00")
                            setHaAmPm("AM")
                            setProspectEmail((prospect as any).email || "")
                            setProspectPhone((prospect as any).phone || "")
                            setShowHAScheduleModal(true)
                          }}
                          className="flex-1 text-green-600 border-green-200 hover:bg-green-50"
                          title="Schedule HA"
                        >
                          <CalendarPlus className="h-4 w-4 mr-1" />
                          <span className="text-xs sm:text-sm">Schedule</span>
                        </Button>
                      </>
                    )}
                  </div>

                  {/* Secondary Actions: Edit, Remind & Delete */}
                  <div className="mt-3 pt-3 border-t flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingProspect(prospect)
                        setShowEditModal(true)
                      }}
                      title="Edit"
                    >
                      <Edit2 className="h-4 w-4 mr-1" />
                      <span className="text-xs sm:text-sm">Edit</span>
                    </Button>

                    <ReminderButton
                      entityType="prospect"
                      entityId={prospect.id}
                      entityName={prospect.label}
                      variant="outline"
                    />

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(prospect.id)}
                      title="Delete"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      <span className="text-xs sm:text-sm">Delete</span>
                    </Button>
                  </div>

                  {prospect.notes && (
                    <div className="mt-3 pt-3 border-t text-sm text-gray-600">
                      📝 {prospect.notes}
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}

          {filteredProspects.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500 mb-4">No prospects found</p>
                <Button onClick={() => setShowAddModal(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Prospect
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
        )}
        </ErrorBoundary>
      </div>

      {/* Add Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add to 100's List</DialogTitle>
            <DialogDescription>Add a new prospect to your pipeline.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Label / Nickname *</Label>
              <Input
                value={newProspect.label}
                onChange={(e) => setNewProspect({ ...newProspect, label: e.target.value })}
                placeholder="e.g., Gym Sarah, Coffee shop mom"
                maxLength={50}
              />
              <p className="text-xs text-gray-500 mt-1">
                A name you'll recognize
              </p>
            </div>
            <div>
              <Label>How did you meet?</Label>
              <Select
                value={newProspect.source}
                onValueChange={(value) => setNewProspect({ ...newProspect, source: value as ProspectSource })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sourceOptions.map((source) => (
                    <SelectItem key={source.value} value={source.value}>
                      {source.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Notes (optional)</Label>
              <Textarea
                value={newProspect.notes}
                onChange={(e) => setNewProspect({ ...newProspect, notes: e.target.value })}
                placeholder="Any helpful context..."
              />
            </div>
            <div className="bg-green-50 rounded-lg p-3 text-sm text-green-700 flex items-start gap-2">
              <Sparkles className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <span>Your contact info stays in OPTAVIA's portal. This is just for your tracking!</span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAddProspect}
              disabled={!newProspect.label.trim()}
              className="bg-[hsl(var(--optavia-green))]"
            >
              Add to List
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit 100's List Entry</DialogTitle>
            <DialogDescription>Update prospect information.</DialogDescription>
          </DialogHeader>
          {editingProspect && (
            <div className="space-y-4">
              <div>
                <Label>Label / Nickname</Label>
                <Input
                  value={editingProspect.label}
                  onChange={(e) => setEditingProspect({ ...editingProspect, label: e.target.value })}
                  maxLength={50}
                />
              </div>
              <div>
                <Label>Source</Label>
                <Select
                  value={editingProspect.source}
                  onValueChange={(value) => setEditingProspect({ ...editingProspect, source: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {sourceOptions.map((source) => (
                      <SelectItem key={source.value} value={source.value}>
                        {source.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Notes</Label>
                <Textarea
                  value={editingProspect.notes || ""}
                  onChange={(e) => setEditingProspect({ ...editingProspect, notes: e.target.value })}
                />
              </div>
              <div>
                <Label>Next Action Date</Label>
                <Input
                  type="date"
                  value={editingProspect.next_action || ""}
                  onChange={(e) => setEditingProspect({ ...editingProspect, next_action: e.target.value })}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button
              onClick={async () => {
                await updateProspect(editingProspect.id, {
                  label: editingProspect.label,
                  source: editingProspect.source,
                  notes: editingProspect.notes,
                  next_action: editingProspect.next_action,
                })
                setShowEditModal(false)
                setEditingProspect(null)
              }}
              className="bg-[hsl(var(--optavia-green))]"
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Convert to Client Modal */}
      <Dialog open={showConvertModal} onOpenChange={setShowConvertModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <PartyPopper className="h-5 w-5 text-green-500" />
              Convert to Client
            </DialogTitle>
            <DialogDescription>This person is ready to become a client!</DialogDescription>
          </DialogHeader>
          {convertingProspect && (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                <Heart className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <p className="font-semibold text-green-800">
                  {convertingProspect.label} is becoming a client!
                </p>
                <p className="text-sm text-green-600 mt-1">
                  They'll be added to your Client Tracker automatically.
                </p>
              </div>

              <div>
                <Label>Program Start Date *</Label>
                <Input
                  type="date"
                  value={clientStartDate}
                  onChange={(e) => setClientStartDate(e.target.value)}
                />
                <p className="text-xs text-gray-500 mt-1">
                  When did/will they start the program?
                </p>
              </div>

              <div className="bg-blue-50 rounded-lg p-3 text-sm text-blue-700 flex items-start gap-2">
                <Sparkles className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <span>
                  We'll calculate their program day and show daily touchpoint reminders!
                </span>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowConvertModal(false)
                setConvertingProspect(null)
                setClientStartDate("")
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConvertToClient}
              disabled={!clientStartDate}
              className="bg-[hsl(var(--optavia-green))] text-white hover:bg-[hsl(var(--optavia-green-dark))]"
            >
              <Heart className="h-4 w-4 mr-2" />
              Create Client
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Schedule HA Modal */}
      <Dialog open={showHAScheduleModal} onOpenChange={setShowHAScheduleModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarPlus className="h-5 w-5 text-blue-600" />
              Schedule Health Assessment
            </DialogTitle>
            <DialogDescription>Set a date and time for the health assessment.</DialogDescription>
          </DialogHeader>
          {schedulingProspect && (
            <div className="space-y-6">
              {/* Prospect Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="font-semibold text-blue-900">{schedulingProspect.label}</div>
                <div className="text-sm text-blue-700 mt-1">
                  {sourceOptions.find(s => s.value === schedulingProspect.source)?.label}
                </div>
              </div>

              {/* Date Picker */}
              <div>
                <Label className="text-sm font-medium mb-2 block">Select Date *</Label>
                <Input
                  type="date"
                  value={haDate}
                  onChange={(e) => setHaDate(e.target.value)}
                  min={today}
                  className="w-full"
                />
              </div>

              {/* Time Picker */}
              <div>
                <Label className="text-sm font-medium mb-3 block">Select Time</Label>
                <div className="flex items-center gap-2 justify-center">
                  {/* Hour */}
                  <select
                    value={haHour}
                    onChange={(e) => setHaHour(parseInt(e.target.value))}
                    className="w-16 h-12 text-center text-lg font-medium border rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {HOUR_OPTIONS.map((h) => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                  <span className="text-2xl font-bold text-gray-400">:</span>
                  {/* Minute */}
                  <select
                    value={haMinute}
                    onChange={(e) => setHaMinute(e.target.value)}
                    className="w-16 h-12 text-center text-lg font-medium border rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {MINUTE_OPTIONS.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                  {/* AM/PM */}
                  <div className="flex rounded-lg border overflow-hidden">
                    <button
                      onClick={() => setHaAmPm("AM")}
                      className={`px-4 h-12 font-medium transition-colors ${
                        haAmPm === "AM"
                          ? "bg-blue-600 text-white"
                          : "bg-white text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      AM
                    </button>
                    <button
                      onClick={() => setHaAmPm("PM")}
                      className={`px-4 h-12 font-medium transition-colors ${
                        haAmPm === "PM"
                          ? "bg-blue-600 text-white"
                          : "bg-white text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      PM
                    </button>
                  </div>
                </div>
                <p className="text-xs text-gray-500 text-center mt-2">45 minute health assessment</p>
              </div>

              {/* Meeting Type Selector */}
              <div>
                <Label className="text-sm font-medium mb-3 block">Meeting Type</Label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setHaMeetingType("phone")}
                    className={`flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all ${
                      haMeetingType === "phone"
                        ? "border-blue-600 bg-blue-50 text-blue-700"
                        : "border-gray-200 hover:border-gray-300 text-gray-700"
                    }`}
                  >
                    <Phone className="h-5 w-5" />
                    <span className="font-medium">Phone</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setHaMeetingType("zoom")
                      prefillZoomDetails()
                    }}
                    className={`flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all ${
                      haMeetingType === "zoom"
                        ? "border-blue-600 bg-blue-50 text-blue-700"
                        : "border-gray-200 hover:border-gray-300 text-gray-700"
                    }`}
                  >
                    <Video className="h-5 w-5" />
                    <span className="font-medium">Zoom</span>
                  </button>
                </div>
              </div>

              {/* Zoom Details (shown when Zoom is selected) */}
              {haMeetingType === "zoom" && (
                <div className="space-y-3 bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-blue-700 text-sm font-medium">
                    <Video className="h-4 w-4" />
                    Zoom Meeting Details
                  </div>
                  <div className="space-y-2">
                    <Input
                      placeholder="Zoom Link (e.g., https://zoom.us/j/...)"
                      value={haZoomLink}
                      onChange={(e) => setHaZoomLink(e.target.value)}
                      className="bg-white"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        placeholder="Meeting ID"
                        value={haZoomMeetingId}
                        onChange={(e) => setHaZoomMeetingId(e.target.value)}
                        className="bg-white"
                      />
                      <Input
                        placeholder="Passcode"
                        value={haZoomPasscode}
                        onChange={(e) => setHaZoomPasscode(e.target.value)}
                        className="bg-white"
                      />
                    </div>
                  </div>
                  {!profile?.zoom_link && (
                    <p className="text-xs text-blue-600">
                      💡 Tip: Save your default Zoom details in Settings → Zoom Room to auto-fill
                    </p>
                  )}
                </div>
              )}

              {/* Calendar Options with Email/SMS */}
              {haDate && generateHACalendarEvent() && (
                <ScheduleCalendarOptions
                  event={generateHACalendarEvent()!}
                  recipientName={schedulingProspect.label}
                  recipientEmail={prospectEmail}
                  recipientPhone={prospectPhone}
                  onEmailChange={setProspectEmail}
                  onPhoneChange={setProspectPhone}
                  onScheduleComplete={handleSaveHASchedule}
                  eventType="ha"
                />
              )}
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowHAScheduleModal(false)
                setSchedulingProspect(null)
                // Reset zoom fields
                setHaMeetingType("phone")
                setHaZoomLink("")
                setHaZoomMeetingId("")
                setHaZoomPasscode("")
              }}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Share Health Assessment Modal */}
      <ShareHealthAssessment
        open={showHASendModal}
        onOpenChange={(open) => {
          setShowHASendModal(open)
          if (!open) setSchedulingProspect(null)
        }}
        recipientName={schedulingProspect?.label}
        initialEmail={(schedulingProspect as any)?.email || ""}
        initialPhone={(schedulingProspect as any)?.phone || ""}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove from 100's List</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this prospect? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setProspectToDelete(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Clear HA Confirmation Dialog */}
      <AlertDialog open={showClearHAConfirm} onOpenChange={setShowClearHAConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear Scheduled Health Assessment?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the scheduled HA time. You can always schedule a new one.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setProspectToClearHA(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (prospectToClearHA) {
                  updateProspect(prospectToClearHA, { 
                    ha_scheduled_at: null,
                    next_action: null 
                  })
                  toast({
                    title: "HA cancelled",
                    description: "The scheduled Health Assessment has been cancelled.",
                  })
                  setProspectToClearHA(null)
                }
              }}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Clear Schedule
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 100's List Guide Modal */}
      <Dialog open={showGuideModal} onOpenChange={setShowGuideModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-center">
              Learn the 100's List Journey
            </DialogTitle>
          </DialogHeader>
          <PipelineProgressionGuide />
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  )
}
