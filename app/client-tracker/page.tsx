"use client"

import { useState } from "react"
import Link from "next/link"
import { useClients, getDayPhase, getProgramDay, type ClientStatus, type RecurringFrequency } from "@/hooks/use-clients"
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
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
  List,
  CalendarDays,
  ChevronLeft,
  CheckCircle,
  Circle,
  Search,
  Info,
} from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { MilestoneActionModal } from "@/components/milestone-action-modal"
import { ClientJourneyGuide } from "@/components/client-journey-guide"
import { GraduationCap, Trophy, Heart } from "lucide-react"
import { ScheduleCalendarOptions } from "@/components/schedule-calendar-options"
import { isMilestoneDay } from "@/hooks/use-touchpoint-templates"
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

  const [showAddModal, setShowAddModal] = useState(false)
  const [showTextModal, setShowTextModal] = useState(false)
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [showGuideModal, setShowGuideModal] = useState(false)
  const [showMilestoneModal, setShowMilestoneModal] = useState(false)
  const [milestoneCount, setMilestoneCount] = useState(0)
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [clientToClear, setClientToClear] = useState<string | null>(null)
  const [selectedClient, setSelectedClient] = useState<any>(null)
  const [filterStatus, setFilterStatus] = useState<ClientStatus | "all">("active")
  const [searchTerm, setSearchTerm] = useState("")
  const [viewMode, setViewMode] = useState<"list" | "week">("list")
  const [weekOffset, setWeekOffset] = useState(0) // 0 = current week, 1 = next week, etc.
  
  // Schedule state
  const [scheduleDay, setScheduleDay] = useState<number>(new Date().getDay())
  const [scheduleHour, setScheduleHour] = useState<number>(9)
  const [scheduleMinute, setScheduleMinute] = useState<string>("00")
  const [scheduleAmPm, setScheduleAmPm] = useState<"AM" | "PM">("AM")
  const [recurringFrequency, setRecurringFrequency] = useState<RecurringFrequency>("none")
  const [clientEmail, setClientEmail] = useState<string>("")
  const [clientPhone, setClientPhone] = useState<string>("")

  // Recurring frequency options
  const RECURRING_OPTIONS: { value: RecurringFrequency; label: string }[] = [
    { value: "none", label: "One-time" },
    { value: "weekly", label: "Weekly" },
    { value: "biweekly", label: "Every 2 weeks" },
    { value: "monthly", label: "Monthly" },
  ]

  const today = new Date().toISOString().split("T")[0]

  const [newClient, setNewClient] = useState({
    label: "",
    phone: "",
    startDate: today,
  })

  // Generate SMS text for calendar invite
  const generateSMSText = (client: any, scheduledAt: Date): string => {
    const programDay = getProgramDay(client.start_date)
    const dateStr = scheduledAt.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })
    const timeStr = scheduledAt.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
    return `Hi! 🌟 Just a reminder about our check-in scheduled for ${dateStr} at ${timeStr}. Looking forward to connecting! Day ${programDay} - you're doing great! 💪`
  }

  // Send SMS with scheduled meeting info
  const sendSMS = (client: any) => {
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
  const generateCalendarUrl = (client: any, day: number, hour: number, minute: string, ampm: "AM" | "PM"): string => {
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
  const openScheduleModal = (client: any) => {
    setSelectedClient(client)
    // Load existing recurring settings if available
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
    setClientEmail(client.email || "")
    setClientPhone(client.phone || "")
    setShowScheduleModal(true)
  }

  // Generate calendar event from schedule settings
  const generateCalendarEvent = (): CalendarEvent | null => {
    if (!selectedClient) return null
    
    const targetDate = getNextDayDate(scheduleDay)
    const hour24 = get24Hour(scheduleHour, scheduleAmPm)
    targetDate.setHours(hour24, parseInt(scheduleMinute), 0, 0)
    
    const endDate = new Date(targetDate)
    endDate.setMinutes(endDate.getMinutes() + 30) // 30 min duration
    
    const programDay = getProgramDay(selectedClient.start_date)
    const phase = getDayPhase(programDay)
    
    return {
      title: `Check-in: ${selectedClient.label} (Day ${programDay})`,
      description: `Client: ${selectedClient.label}
Program Day: ${programDay}
Phase: ${phase.label}

Suggested talking points:
- How are you feeling today?
- Any challenges with meals?
- Celebrate wins!
${phase.milestone ? `\n🎉 MILESTONE: ${phase.label} - Celebrate this achievement!` : ""}`,
      startDate: targetDate,
      endDate: endDate,
      uid: `client-${selectedClient.id}-${Date.now()}@coachingamplifier.com`,
    }
  }

  // Handle saving schedule settings (called before calendar actions)
  const handleSaveSchedule = async () => {
    if (!selectedClient) return
    
    // Calculate the scheduled datetime
    const targetDate = getNextDayDate(scheduleDay)
    const hour24 = get24Hour(scheduleHour, scheduleAmPm)
    targetDate.setHours(hour24, parseInt(scheduleMinute), 0, 0)
    
    // Format time for storage (HH:MM in 24-hour format)
    const timeStr = `${hour24.toString().padStart(2, "0")}:${scheduleMinute}`
    
    // Save the scheduled time and recurring settings to the client record
    // Note: email is not stored on client, only used for sending invites
    const success = await updateClient(selectedClient.id, {
      next_scheduled_at: targetDate.toISOString(),
      recurring_frequency: recurringFrequency,
      recurring_day: recurringFrequency !== "none" ? scheduleDay : null,
      recurring_time: recurringFrequency !== "none" ? timeStr : null,
      phone: clientPhone || null,
    })
    
    if (!success) {
      toast({
        title: "Failed to save schedule",
        description: "Please try again",
        variant: "destructive",
      })
      return
    }
    
    setShowScheduleModal(false)
    
    const recurringLabel = recurringFrequency !== "none" 
      ? ` (${RECURRING_OPTIONS.find(r => r.value === recurringFrequency)?.label})`
      : ""
    toast({
      title: recurringFrequency !== "none" ? "🔄 Recurring Check-in Set" : "📅 Check-in Scheduled",
      description: `${scheduleHour}:${scheduleMinute} ${scheduleAmPm} on ${DAYS_OF_WEEK[scheduleDay].full}${recurringLabel}`,
    })
  }

  const handleAddClient = async () => {
    if (!newClient.label.trim() || !newClient.startDate) return
    
    // Get current total client count before adding
    const currentCount = clients.length
    
    await addClient({
      label: newClient.label,
      phone: newClient.phone || undefined,
      start_date: newClient.startDate,
    })
    setNewClient({ label: "", phone: "", startDate: today })
    setShowAddModal(false)
    
    // Check if new count is a milestone (5, 10, 15, 20, 25, etc.)
    const newCount = currentCount + 1
    if (newCount >= 5 && newCount % 5 === 0) {
      setMilestoneCount(newCount)
      setShowMilestoneModal(true)
    }
  }

  const openTextTemplates = (client: any) => {
    setSelectedClient(client)
    setShowTextModal(true)
  }

  const filteredClients = getFilteredClients(filterStatus).filter(client =>
    !searchTerm || client.label.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[hsl(var(--optavia-green))]"></div>
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
                <span className="font-semibold">Client Tracker</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-3">
                <Users className="h-8 w-8" />
                My Clients
              </h1>
              <p className="text-sm opacity-90 mt-1">
                Track daily touchpoints and milestones
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                className="bg-[#f88221] border-[#f88221] text-white hover:bg-[#e07520]"
                onClick={() => setShowGuideModal(true)}
              >
                <GraduationCap className="h-4 w-4 mr-2" />
                Learn the Client Journey
              </Button>
              <Link href="/prospect-tracker">
                <Button variant="outline" className="bg-white/10 border-white/30 text-white hover:bg-white/20">
                  <Users className="h-4 w-4 mr-2" />
                  100's List
                </Button>
              </Link>
              <Button
                onClick={() => setShowAddModal(true)}
                className="bg-white text-[hsl(var(--optavia-green))] hover:bg-white/90"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Client
              </Button>
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
                    <p className="font-semibold text-green-700 mb-1">Active Clients</p>
                    <p className="text-sm text-gray-600">Clients currently on program with "Active" status.</p>
                  </TooltipContent>
                </Tooltip>
                <div className="text-3xl font-bold text-[hsl(var(--optavia-green))]">{stats.active}</div>
                <div className="text-sm text-gray-500">Active</div>
              </CardContent>
            </Card>
            <Card className={stats.needsAttention > 0 ? "border-orange-300 bg-orange-50" : ""}>
              <CardContent className="p-4 text-center relative">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600">
                      <Info className="h-4 w-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-xs p-3 bg-white/95 backdrop-blur-sm shadow-lg border border-gray-200">
                    <p className="font-semibold text-orange-700 mb-2">🚨 "Needs Attention" Triggers</p>
                    <ol className="text-sm text-gray-600 space-y-1.5 list-decimal list-inside">
                      <li><strong>Scheduled check-in is due</strong> — Meeting date is today or past</li>
                      <li><strong>10+ days since last check-in</strong> — Time to reach out!</li>
                      <li><strong>Never checked in</strong> — New client needs first touchpoint</li>
                    </ol>
                  </TooltipContent>
                </Tooltip>
                <div className="text-3xl font-bold text-orange-500">{stats.needsAttention}</div>
                <div className="text-sm text-gray-500">Need Attention</div>
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
                    <p className="font-semibold text-purple-700 mb-1">Coach Prospects</p>
                    <p className="text-sm text-gray-600">Active clients you've marked as potential future coaches. Keep nurturing these relationships!</p>
                  </TooltipContent>
                </Tooltip>
                <div className="text-3xl font-bold text-purple-500">{stats.coachProspects}</div>
                <div className="text-sm text-gray-500">Coach Prospects</div>
              </CardContent>
            </Card>
            <Card className={stats.milestonesToday > 0 ? "border-yellow-300 bg-yellow-50" : ""}>
              <CardContent className="p-4 text-center relative">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600">
                      <Info className="h-4 w-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-xs p-3 bg-white/95 backdrop-blur-sm shadow-lg border border-gray-200">
                    <p className="font-semibold text-yellow-700 mb-1">🎉 Milestones Today</p>
                    <p className="text-sm text-gray-600">Clients hitting key milestones today:</p>
                    <ul className="text-sm text-gray-600 mt-1 space-y-0.5">
                      <li>• <strong>Day 7</strong> — Week 1 Complete!</li>
                      <li>• <strong>Day 14</strong> — 2 Weeks!</li>
                      <li>• <strong>Day 21</strong> — Habit Formed!</li>
                      <li>• <strong>Day 30</strong> — ONE MONTH!</li>
                    </ul>
                  </TooltipContent>
                </Tooltip>
                <div className="text-3xl font-bold text-yellow-600">{stats.milestonesToday}</div>
                <div className="text-sm text-gray-500">Milestones Today</div>
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
            <div className="flex gap-2">
              {(["active", "paused", "all"] as const).map((status) => (
                <Button
                  key={status}
                  variant={filterStatus === status ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterStatus(status)}
                  className={filterStatus === status ? "bg-[hsl(var(--optavia-green))]" : ""}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </Button>
              ))}
            </div>

            {/* View Toggle */}
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

                // Get clients scheduled for this day
                const dayClients = filteredClients.filter((client) => {
                  if (!client.next_scheduled_at) return false
                  const scheduledDate = new Date(client.next_scheduled_at)
                  return scheduledDate.toDateString() === dayDate.toDateString()
                }).sort((a, b) => {
                  const aTime = new Date(a.next_scheduled_at!).getTime()
                  const bTime = new Date(b.next_scheduled_at!).getTime()
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
                      {dayClients.length === 0 ? (
                        <div className="text-xs text-gray-400 text-center py-4">
                          No check-ins
                        </div>
                      ) : (
                        dayClients.map((client) => {
                          const programDay = getProgramDay(client.start_date)
                          const phase = getDayPhase(programDay)
                          const scheduledTime = new Date(client.next_scheduled_at!).toLocaleTimeString("en-US", {
                            hour: "numeric",
                            minute: "2-digit",
                          })
                          return (
                            <div
                              key={client.id}
                              onClick={() => openScheduleModal(client)}
                              className="p-2 rounded-lg border border-gray-200 bg-white hover:shadow-sm cursor-pointer transition-shadow"
                              style={{ borderLeftColor: phase.color, borderLeftWidth: "3px" }}
                            >
                              <div className="text-xs font-medium text-gray-900 truncate">
                                {client.label}
                              </div>
                              <div className="flex items-center justify-between mt-1">
                                <span className="text-xs text-gray-500">{scheduledTime}</span>
                                <Badge
                                  className="text-[10px] px-1.5 py-0"
                                  style={{ backgroundColor: phase.bg, color: phase.color }}
                                >
                                  D{programDay}
                                </Badge>
                              </div>
                              {client.recurring_frequency && client.recurring_frequency !== "none" && (
                                <Repeat className="h-3 w-3 text-purple-400 mt-1" />
                              )}
                            </div>
                          )
                        })
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Unscheduled Clients */}
            {(() => {
              const unscheduledClients = filteredClients.filter(c => !c.next_scheduled_at)
              if (unscheduledClients.length === 0) return null
              return (
                <div className="mt-6">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertCircle className="h-4 w-4 text-orange-500" />
                    <span className="font-medium text-gray-700">Unscheduled ({unscheduledClients.length})</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {unscheduledClients.map((client) => {
                      const programDay = getProgramDay(client.start_date)
                      const phase = getDayPhase(programDay)
                      return (
                        <Button
                          key={client.id}
                          variant="outline"
                          size="sm"
                          onClick={() => openScheduleModal(client)}
                          className="border-orange-200 text-orange-700 hover:bg-orange-50"
                        >
                          <div
                            className="w-5 h-5 rounded mr-2 flex items-center justify-center text-[10px] font-bold"
                            style={{ backgroundColor: phase.bg, color: phase.color }}
                          >
                            {programDay}
                          </div>
                          {client.label}
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

        {/* Client List */}
        {viewMode === "list" && (
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
                  <div className="flex items-start gap-4">
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
                        {client.is_coach_prospect && (
                          <Badge className="bg-orange-100 text-orange-700 flex items-center gap-1">
                            <Star className="h-3 w-3" />
                            Coach Prospect
                          </Badge>
                        )}
                        {client.status === "paused" && (
                          <Badge variant="secondary">Paused</Badge>
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
                        {new Date(client.start_date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Scheduled Time & Action Buttons */}
                  {client.status === "active" && (
                    <div className="mt-4 space-y-3">
                      {/* Scheduled Time Display */}
                      {client.next_scheduled_at && (
                        <div className="flex items-center gap-1 flex-wrap">
                          <Badge 
                            className={`flex items-center gap-1 ${
                              new Date(client.next_scheduled_at) < new Date() 
                                ? "bg-red-100 text-red-700" 
                                : "bg-green-100 text-green-700"
                            }`}
                          >
                            <Calendar className="h-3 w-3" />
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
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setClientToClear(client.id)
                              setShowClearConfirm(true)
                            }}
                            className="h-7 w-7 p-0 text-gray-400 hover:text-red-500"
                            title="Clear scheduled time"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      )}

                      {/* Action Buttons - All 3 on same row */}
                      <div className="flex gap-2">
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
                          className="flex-1 text-purple-600 border-purple-200 hover:bg-purple-50"
                        >
                          <CalendarPlus className="h-4 w-4 mr-1" />
                          <span className="text-xs sm:text-sm">Schedule</span>
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Secondary Actions: Coach & Pause/Resume */}
                  <div className="mt-3 pt-3 border-t flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleCoachProspect(client.id)}
                      className={client.is_coach_prospect ? "bg-orange-50 text-orange-700" : ""}
                    >
                      <Star className="h-4 w-4 sm:mr-1" />
                      <span className="hidden sm:inline">{client.is_coach_prospect ? "Coach" : "Coach?"}</span>
                    </Button>
                    {client.status === "active" ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateStatus(client.id, "paused")}
                      >
                        Pause
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateStatus(client.id, "active")}
                        className="text-green-600"
                      >
                        Resume
                      </Button>
                    )}
                  </div>

                  {client.notes && (
                    <div className="mt-3 pt-3 border-t text-sm text-gray-600">
                      📝 {client.notes}
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}

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
        )}
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
              <Label>Phone Number (optional)</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  value={newClient.phone}
                  onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                  placeholder="e.g., 555-123-4567"
                  className="pl-10"
                  type="tel"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                For sending SMS reminders about scheduled check-ins
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
      <Dialog open={showScheduleModal} onOpenChange={setShowScheduleModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarPlus className="h-5 w-5 text-purple-600" />
              Schedule Check-in
            </DialogTitle>
            <DialogDescription>Set a day and time for the client check-in.</DialogDescription>
          </DialogHeader>
          {selectedClient && (
            <div className="space-y-6">
              {/* Client Info */}
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="font-medium text-gray-900">{selectedClient.label}</div>
                <div className="text-sm text-gray-500">
                  Day {getProgramDay(selectedClient.start_date)} • {getDayPhase(getProgramDay(selectedClient.start_date)).label}
                </div>
              </div>

              {/* Day Picker */}
              <div>
                <Label className="text-sm font-medium mb-3 block">Select Day</Label>
                <div className="grid grid-cols-7 gap-1">
                  {DAYS_OF_WEEK.map((day) => (
                    <button
                      key={day.value}
                      onClick={() => setScheduleDay(day.value)}
                      className={`p-2 rounded-lg text-center transition-colors ${
                        scheduleDay === day.value
                          ? "bg-purple-600 text-white"
                          : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                      }`}
                    >
                      <div className="text-xs font-medium">{day.short}</div>
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Next {DAYS_OF_WEEK[scheduleDay].full}: {getNextDayDate(scheduleDay).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </p>
              </div>

              {/* Time Picker */}
              <div>
                <Label className="text-sm font-medium mb-3 block">Select Time</Label>
                <div className="flex items-center gap-2 justify-center">
                  {/* Hour */}
                  <select
                    value={scheduleHour}
                    onChange={(e) => setScheduleHour(parseInt(e.target.value))}
                    className="w-16 h-12 text-center text-lg font-medium border rounded-lg bg-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  >
                    {HOUR_OPTIONS.map((h) => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                  <span className="text-2xl font-bold text-gray-400">:</span>
                  {/* Minute */}
                  <select
                    value={scheduleMinute}
                    onChange={(e) => setScheduleMinute(e.target.value)}
                    className="w-16 h-12 text-center text-lg font-medium border rounded-lg bg-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  >
                    {MINUTE_OPTIONS.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                  {/* AM/PM */}
                  <div className="flex rounded-lg border overflow-hidden">
                    <button
                      onClick={() => setScheduleAmPm("AM")}
                      className={`px-4 h-12 font-medium transition-colors ${
                        scheduleAmPm === "AM"
                          ? "bg-purple-600 text-white"
                          : "bg-white text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      AM
                    </button>
                    <button
                      onClick={() => setScheduleAmPm("PM")}
                      className={`px-4 h-12 font-medium transition-colors ${
                        scheduleAmPm === "PM"
                          ? "bg-purple-600 text-white"
                          : "bg-white text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      PM
                    </button>
                  </div>
                </div>
                <p className="text-xs text-gray-500 text-center mt-2">30 minute check-in</p>
              </div>

              {/* Recurring Frequency */}
              <div>
                <Label className="text-sm font-medium mb-3 block flex items-center gap-2">
                  <Repeat className="h-4 w-4 text-purple-500" />
                  Recurring
                </Label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {RECURRING_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setRecurringFrequency(option.value)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        recurringFrequency === option.value
                          ? "bg-purple-600 text-white"
                          : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
                {recurringFrequency !== "none" && (
                  <p className="text-xs text-purple-600 mt-2 flex items-center gap-1">
                    <Repeat className="h-3 w-3" />
                    Repeats every {recurringFrequency === "weekly" ? "week" : recurringFrequency === "biweekly" ? "2 weeks" : "month"} on {DAYS_OF_WEEK[scheduleDay].full}
                  </p>
                )}
              </div>

              {/* Calendar Options with Email/SMS */}
              {generateCalendarEvent() && (
                <ScheduleCalendarOptions
                  event={generateCalendarEvent()!}
                  recipientName={selectedClient.label}
                  recipientEmail={clientEmail}
                  recipientPhone={clientPhone}
                  onEmailChange={setClientEmail}
                  onPhoneChange={setClientPhone}
                  onScheduleComplete={handleSaveSchedule}
                  eventType="check-in"
                  recurringFrequency={recurringFrequency}
                />
              )}

              {/* Info - only show for recurring */}
              {recurringFrequency !== "none" && (
                <div className="bg-purple-50 rounded-lg p-3 text-sm text-purple-700 flex items-start gap-2">
                  <Sparkles className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <span>
                    We'll track your recurring schedule and auto-advance to the next check-in date.
                  </span>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowScheduleModal(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Client Journey Guide Modal */}
      <Dialog open={showGuideModal} onOpenChange={setShowGuideModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-center">
              Learn the Client Journey
            </DialogTitle>
          </DialogHeader>
          <ClientJourneyGuide />
        </DialogContent>
      </Dialog>

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
                    title: "Check-in cleared",
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
