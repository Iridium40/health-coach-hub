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
  PartyPopper,
  Heart,
  CalendarPlus,
  ExternalLink,
  X,
  Send,
  Info,
  GraduationCap,
  Download,
  CheckCircle,
  Phone,
  Video,
  Loader2,
  Mail,
  MessageSquare,
  Copy,
  Check,
  Lock,
} from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ShareHealthAssessment } from "@/components/share-health-assessment"
import { PipelineProgressionGuide } from "@/components/pipeline-progression-guide"
import { ObjectionNavigator } from "@/components/objection-navigator"
import { sendCalendarInviteEmail } from "@/lib/email"
import { ReminderButton } from "@/components/reminders-panel"
import { ErrorBoundary } from "@/components/ui/error-boundary"
import { StatsCardsSkeleton, ProspectListSkeleton } from "@/components/ui/skeleton-loaders"
import { ProspectCard } from "@/components/prospect-tracker/prospect-card"
import { MessageCircleQuestion } from "lucide-react"
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
    hasMore,
    loadMore,
    loadingMore,
    stats,
    addProspect,
    updateProspect,
    deleteProspect,
    logAction,
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
  const [showObjectionNav, setShowObjectionNav] = useState(false)
  const [editingProspect, setEditingProspect] = useState<Prospect | null>(null)
  const [convertingProspect, setConvertingProspect] = useState<Prospect | null>(null)
  const [schedulingProspect, setSchedulingProspect] = useState<Prospect | null>(null)
  const [filterStatus, setFilterStatus] = useState<ProspectStatus | "all">("all")
  const [searchTerm, setSearchTerm] = useState("")
  
  // Debounce search term for better performance
  const debouncedSearchTerm = useDebounce(searchTerm, 300)
  const [clientStartDate, setClientStartDate] = useState("")

  // HA Scheduling state
  const [haDate, setHaDate] = useState("")
  const [haHour, setHaHour] = useState(10)
  const [haMinute, setHaMinute] = useState("00")
  const [haAmPm, setHaAmPm] = useState<"AM" | "PM">("AM")
  const [prospectEmail, setProspectEmail] = useState("")
  const [prospectPhone, setProspectPhone] = useState("")
  const [haMeetingType, setHaMeetingType] = useState<"phone" | "zoom">("phone")
  const [calendarOnly, setCalendarOnly] = useState(false)
  const [inviteMethod, setInviteMethod] = useState<"email" | "text">("email")
  const [haSaving, setHaSaving] = useState(false)
  const [textCopied, setTextCopied] = useState(false)

  // Delete confirmation state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [prospectToDelete, setProspectToDelete] = useState<string | null>(null)
  
  // Clear HA confirmation state
  const [showClearHAConfirm, setShowClearHAConfirm] = useState(false)
  const [showConfirmFollowUp, setShowConfirmFollowUp] = useState(false)
  const [followUpProspectId, setFollowUpProspectId] = useState<string | null>(null)
  const [prospectToClearHA, setProspectToClearHA] = useState<string | null>(null)
  const confirmFollowUpDone = async () => {
    if (!followUpProspectId) return
    const todayDate = new Date()
    const todayStr = todayDate.toISOString().split("T")[0]
    const next = new Date(todayDate)
    next.setDate(next.getDate() + 3)
    const nextStr = next.toISOString().split("T")[0]

    await updateProspect(followUpProspectId, {
      last_action: todayStr,
      next_action: nextStr,
      action_type: "follow_up" as any,
    })

    toast({
      title: "✅ Follow-up logged",
      description: "Moved next follow-up out a few days.",
    })

    setShowConfirmFollowUp(false)
    setFollowUpProspectId(null)
  }

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
    
    if (haMeetingType === "zoom" && profile?.zoom_link) {
      meetingDetails = `\n\n📹 Zoom Meeting:\n${profile.zoom_link}`
      if (profile.zoom_meeting_id) meetingDetails += `\nMeeting ID: ${profile.zoom_meeting_id}`
      if (profile.zoom_passcode) meetingDetails += `\nPasscode: ${profile.zoom_passcode}`
      location = profile.zoom_link
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

  const generateHATextInvite = (): string => {
    if (!schedulingProspect || !haDate) return ""
    const targetDate = new Date(haDate + "T00:00:00")
    const hour24 = get24Hour(haHour, haAmPm)
    targetDate.setHours(hour24, parseInt(haMinute), 0, 0)
    const dateStr = targetDate.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })
    const timeStr = `${haHour}:${haMinute} ${haAmPm}`
    if (haMeetingType === "zoom" && profile?.zoom_link) {
      return `Hi ${schedulingProspect.label.split(" ")[0]}! Looking forward to our health assessment on ${dateStr} at ${timeStr}. Here's the Zoom link: ${profile.zoom_link} See you there!`
    }
    return `Hi ${schedulingProspect.label.split(" ")[0]}! Just confirming our health assessment on ${dateStr} at ${timeStr}. We'll connect via phone call. Talk soon!`
  }

  const handleSaveHASchedule = async () => {
    if (!schedulingProspect || !haDate) return

    const sendInvite = !calendarOnly
    if (sendInvite && inviteMethod === "text") {
      try {
        await navigator.clipboard.writeText(generateHATextInvite())
        setTextCopied(true)
        setTimeout(() => setTextCopied(false), 3000)
      } catch {}
    }

    setHaSaving(true)

    const targetDate = new Date(haDate + "T00:00:00")
    const hour24 = get24Hour(haHour, haAmPm)
    targetDate.setHours(hour24, parseInt(haMinute), 0, 0)

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

      const coachEmail = profile?.notification_email || user?.email
      if (coachEmail) {
        const calEvent = generateHACalendarEvent()
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
            eventType: "ha",
          }).catch(() => {})
        }
      }

      if (sendInvite && inviteMethod === "email" && prospectEmail) {
        const organizerEmail = profile?.notification_email
        if (organizerEmail) {
          const calEvent = generateHACalendarEvent()
          if (calEvent) {
            const emails = prospectEmail.split(",").map(e => e.trim()).filter(e => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e))
            await Promise.all(emails.map(toEmail =>
              sendCalendarInviteEmail({
                to: toEmail,
                toName: schedulingProspect.label,
                fromEmail: organizerEmail,
                fromName: profile?.full_name ?? undefined,
                eventTitle: calEvent.title,
                eventDescription: calEvent.description,
                startDate: calEvent.startDate.toISOString(),
                endDate: calEvent.endDate.toISOString(),
                eventType: "ha",
              })
            )).then(results => {
              const sent = results.filter(r => r.success).length
              if (sent > 0) {
                toast({
                  title: "📧 Invite sent!",
                  description: `Calendar invite sent to ${schedulingProspect.label}`,
                })
              }
            }).catch(() => {})
          }
        }
      }

      if (sendInvite && inviteMethod === "text") {
        toast({
          title: "📋 Text invite copied!",
          description: "Paste the message into your texting app",
        })
      }

      setShowHAScheduleModal(false)
      setSchedulingProspect(null)
      setHaMeetingType("phone")
      setCalendarOnly(false)
      setInviteMethod("email")
    } else {
      toast({
        title: "Failed to schedule HA",
        description: "Please try again",
        variant: "destructive",
      })
    }

    setHaSaving(false)
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

    // Create the client record, carrying over prospect notes
    const newClient = await addClient({
      label: convertingProspect.label,
      start_date: clientStartDate,
      notes: convertingProspect.notes || undefined,
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

  const handleCheckIn = async (prospect: Prospect) => {
    const success = await logAction(prospect.id, 3)
    if (success) {
      toast({
        title: "✅ Checked In!",
        description: `Contact logged for ${prospect.label}. Follow-up set for 3 days.`,
      })
    }
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
    <>
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
                <span className="font-semibold">100's List</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-3">
                <Users className="h-8 w-8" />
                100's List
              </h1>
              <p className="text-sm opacity-90 mt-1">
                Track your 100's list with privacy-first labels
              </p>
            </div>
            <div className="flex flex-wrap gap-2 sm:gap-3">
              <Button
                onClick={() => setShowAddModal(true)}
                className="bg-white text-[hsl(var(--optavia-green))] hover:bg-white/90 order-first sm:order-last"
              >
                <Plus className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Add to List</span>
                <span className="sm:hidden">Add</span>
              </Button>
              <Button
                className="bg-[#f88221] border-[#f88221] text-white hover:bg-[#e07520] hidden sm:flex"
                onClick={() => setShowGuideModal(true)}
              >
                <GraduationCap className="h-4 w-4 mr-2" />
                Learn the 100's List
              </Button>
              <Link href="/client-tracker">
                <Button variant="outline" className="bg-white/10 border-white/30 text-white hover:bg-white/20">
                  <Users className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">My Clients</span>
                </Button>
              </Link>
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
        {/* Pipeline Stages */}
        <div className="mb-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
            {[
              { id: "new", label: "New", icon: "🆕", color: "#2196f3", borderColor: "#bbdefb", count: stats.new },
              { id: "interested", label: "Interested", icon: "🔥", color: "#ff9800", borderColor: "#ffe0b2", count: stats.interested },
              { id: "ha_scheduled", label: "HA Scheduled", icon: "📅", color: "#9c27b0", borderColor: "#e1bee7", count: stats.haScheduled },
              { id: "converted", label: "Client Won", icon: "🎉", color: "#4caf50", borderColor: "#c8e6c9", count: stats.converted },
            ].map((stage, index, arr) => (
              <button
                key={stage.id}
                onClick={() => {
                  setFilterStatus(stage.id as any)
                }}
                className="relative flex flex-col items-center p-3 sm:p-4 rounded-xl border-2 bg-white hover:shadow-lg transition-all hover:scale-[1.03] cursor-pointer group"
                style={{ borderColor: stage.borderColor }}
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
              onValueChange={(value) => setFilterStatus(value as ProspectStatus | "all")}
            >
              <SelectTrigger className="w-[140px] sm:w-[160px] h-9 text-sm flex-shrink-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Prospects</SelectItem>
                <SelectItem value="new">{statusConfig.new.label}</SelectItem>
                <SelectItem value="interested">{statusConfig.interested.label}</SelectItem>
                <SelectItem value="converted">{statusConfig.converted.label}</SelectItem>
                <SelectItem value="not_interested">{statusConfig.not_interested.label}</SelectItem>
                <SelectItem value="not_closed">{statusConfig.not_closed.label}</SelectItem>
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

          <Button
            onClick={() => setShowObjectionNav(true)}
            className="w-full bg-[#f88221] hover:bg-[#e07520] text-white h-10"
            title="Objection Navigator"
          >
            <MessageCircleQuestion className="h-4 w-4 mr-2" />
            Objection Navigator
          </Button>
        </div>

        {/* Prospect List */}
        <div className="space-y-3">
          {filteredProspects.map((prospect) => {
            const config = statusConfig[prospect.status]
            const daysUntil = getDaysUntil(prospect.next_action)
            const isOverdue = daysUntil !== null && daysUntil < 0
            const daysSinceLastAction = prospect.last_action
              ? Math.floor(
                  (new Date().setHours(0, 0, 0, 0) -
                    new Date(prospect.last_action + "T00:00:00").getTime()) /
                    (1000 * 60 * 60 * 24)
                )
              : null
            const needsCheckIn = daysSinceLastAction !== null && daysSinceLastAction >= 7

            return (
              <Card
                key={prospect.id}
                className={`transition-shadow hover:shadow-md ${
                  isOverdue
                    ? "border-orange-300 bg-orange-50"
                    : needsCheckIn
                    ? "border-amber-300 bg-amber-50/30"
                    : ""
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
                      <div className="flex items-center gap-3 text-sm text-gray-500 mt-1 flex-wrap">
                        <span>{sourceOptions.find(s => s.value === prospect.source)?.label}</span>
                        {prospect.action_type && (
                          <span className="flex items-center gap-1">
                            <ArrowRight className="h-3 w-3" />
                            {actionTypeLabels[prospect.action_type]}
                          </span>
                        )}
                        {prospect.last_action && (
                          <span className={`flex items-center gap-1 ${needsCheckIn ? "text-amber-600 font-medium" : ""}`}>
                            •{" "}
                            {daysSinceLastAction === 0
                              ? "Contacted today"
                              : daysSinceLastAction === 1
                              ? "1 day ago"
                              : `${daysSinceLastAction} days ago`}
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
                                : "bg-green-100 text-[hsl(var(--optavia-green))] border border-green-200"
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
                              className="h-7 w-7 p-0 text-green-600 hover:text-[hsl(var(--optavia-green))] hover:bg-green-50"
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
                                  next_action: null
                                })
                                toast({
                                  title: "✅ HA Completed!",
                                  description: "Scheduled HA has been cleared.",
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

                          {/* Log Follow-up Done (clears "overdue" trigger) */}
                          {isOverdue && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setFollowUpProspectId(prospect.id)
                                setShowConfirmFollowUp(true)
                              }}
                              className="h-7 w-7 p-0 bg-green-100 hover:bg-green-200 rounded-full"
                              title="Mark follow-up as done"
                            >
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  )}

                  {/* Primary Action Buttons */}
                  {prospect.status !== "converted" && prospect.status !== "coach" && (
                    <div className="mt-4 flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCheckIn(prospect)}
                        className={`flex-1 ${
                          needsCheckIn
                            ? "text-amber-600 border-amber-300 hover:bg-amber-50"
                            : "text-green-600 border-green-200 hover:bg-green-50"
                        }`}
                        title={daysSinceLastAction !== null ? `Last contact: ${daysSinceLastAction} day(s) ago` : "Log a check-in"}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        <span className="text-xs sm:text-sm">Check In</span>
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
                        className="flex-1 text-[hsl(var(--optavia-green))] border-green-200 hover:bg-green-50"
                        title="Schedule HA"
                      >
                        <CalendarPlus className="h-4 w-4 mr-1" />
                        <span className="text-xs sm:text-sm">Schedule HA</span>
                      </Button>
                    </div>
                  )}

                  {/* Secondary Actions: Status + Edit + Remind + Delete */}
                  <div className="mt-3 pt-3 border-t flex flex-wrap items-center gap-2">
                    <Select
                      value={prospect.status}
                      onValueChange={(value) => handleUpdateStatus(prospect.id, value as ProspectStatus)}
                    >
                      <SelectTrigger className="w-full sm:w-auto sm:flex-1 sm:min-w-0 h-9 text-xs sm:text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(statusConfig)
                          .filter(([key]) => 
                            key === prospect.status || !["ha_scheduled", "coach"].includes(key)
                          )
                          .map(([key, value]) => (
                            <SelectItem key={key} value={key}>
                              {value.icon} {value.label}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingProspect(prospect)
                          setShowEditModal(true)
                        }}
                        title="Edit"
                      >
                        <Edit2 className="h-4 w-4 sm:mr-1" />
                        <span className="hidden sm:inline">Edit</span>
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
                        <Trash2 className="h-4 w-4 sm:mr-1" />
                        <span className="hidden sm:inline">Delete</span>
                      </Button>
                    </div>
                  </div>

                  {/* Notes - clickable to edit */}
                  <button
                    onClick={() => {
                      setEditingProspect(prospect)
                      setShowEditModal(true)
                    }}
                    className="mt-3 pt-3 border-t w-full text-left text-sm hover:bg-gray-50 rounded-b-lg transition-colors cursor-pointer"
                  >
                    {prospect.notes ? (
                      <span className="text-gray-600">📝 {prospect.notes}</span>
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
                {loadingMore ? "Loading..." : `Load more prospects (${prospects.length} loaded)`}
              </Button>
            </div>
          )}

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
                  onValueChange={(value) => setEditingProspect({ ...editingProspect, source: value as ProspectSource })}
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
                if (editingProspect) {
                  await updateProspect(editingProspect.id, {
                    label: editingProspect.label,
                    source: editingProspect.source,
                    notes: editingProspect.notes,
                    next_action: editingProspect.next_action,
                  })
                  setShowEditModal(false)
                  setEditingProspect(null)
                }
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
                  They'll be added to your Client List automatically.
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
      <Dialog open={showHAScheduleModal} onOpenChange={(open) => {
        setShowHAScheduleModal(open)
        if (!open) {
          setSchedulingProspect(null)
          setHaMeetingType("phone")
          setCalendarOnly(false)
          setInviteMethod("email")
        }
      }}>
        <DialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden">
          {schedulingProspect && (
            <>
              {/* Header */}
              <div className="px-6 pt-6 pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                      <CalendarPlus className="h-5 w-5 text-[hsl(var(--optavia-green))]" />
                    </div>
                    <div>
                      <DialogTitle className="text-lg font-bold text-gray-900">Schedule Health Assessment</DialogTitle>
                      <DialogDescription className="text-sm text-gray-500">45 minute assessment</DialogDescription>
                    </div>
                  </div>
                </div>

                {/* Prospect Card */}
                <div className="mt-4 bg-gray-50 border border-gray-200 rounded-xl p-4 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[hsl(var(--optavia-green))] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {schedulingProspect.label.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{schedulingProspect.label}</div>
                    <div className="text-xs text-gray-500">
                      {sourceOptions.find(s => s.value === schedulingProspect.source)?.label}
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-6 pb-6 space-y-5">
                {/* Date */}
                <div>
                  <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Date</Label>
                  <Input
                    type="date"
                    value={haDate}
                    onChange={(e) => setHaDate(e.target.value)}
                    min={today}
                    className="w-full h-11"
                  />
                </div>

                {/* Time */}
                <div>
                  <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Time</Label>
                  <div className="flex items-center gap-2">
                    <select
                      value={haHour}
                      onChange={(e) => setHaHour(parseInt(e.target.value))}
                      className="w-16 h-11 text-center text-base font-medium border rounded-lg bg-white focus:ring-2 focus:ring-[hsl(var(--optavia-green))] focus:border-[hsl(var(--optavia-green))]"
                    >
                      {HOUR_OPTIONS.map((h) => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                    <span className="text-xl font-bold text-gray-300">:</span>
                    <select
                      value={haMinute}
                      onChange={(e) => setHaMinute(e.target.value)}
                      className="w-16 h-11 text-center text-base font-medium border rounded-lg bg-white focus:ring-2 focus:ring-[hsl(var(--optavia-green))] focus:border-[hsl(var(--optavia-green))]"
                    >
                      {MINUTE_OPTIONS.map((m) => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                    <div className="flex rounded-lg border overflow-hidden ml-auto">
                      <button
                        type="button"
                        onClick={() => setHaAmPm("AM")}
                        className={`px-4 h-11 font-semibold text-sm transition-colors ${
                          haAmPm === "AM"
                            ? "bg-[hsl(var(--optavia-green))] text-white"
                            : "bg-white text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        AM
                      </button>
                      <button
                        type="button"
                        onClick={() => setHaAmPm("PM")}
                        className={`px-4 h-11 font-semibold text-sm transition-colors ${
                          haAmPm === "PM"
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
                      onClick={() => setHaMeetingType("phone")}
                      className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all font-medium ${
                        haMeetingType === "phone"
                          ? "border-[hsl(var(--optavia-green))] bg-green-50 text-[hsl(var(--optavia-green))]"
                          : "border-gray-200 hover:border-gray-300 text-gray-600"
                      }`}
                    >
                      <Phone className="h-4 w-4" />
                      Phone
                    </button>
                    <button
                      type="button"
                      onClick={() => setHaMeetingType("zoom")}
                      className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all font-medium ${
                        haMeetingType === "zoom"
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
                {haMeetingType === "zoom" && (
                  <div className="space-y-2 bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-blue-700 text-sm font-medium">
                      <Video className="h-4 w-4" />
                      Zoom Meeting Details
                    </div>
                    {profile?.zoom_link ? (
                      <div className="space-y-2">
                        <Input value={profile.zoom_link} readOnly className="bg-white/60 text-gray-700 cursor-default text-sm" />
                        <p className="text-xs text-blue-500">
                          Managed in <Link href="/settings" className="underline hover:text-blue-700 font-medium">My Settings → Zoom</Link>
                        </p>
                      </div>
                    ) : (
                      <p className="text-sm text-blue-700">
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
                        Send Invite to {schedulingProspect.label.split(" ")[0]}
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
                            placeholder={`${schedulingProspect.label.split(" ")[0].toLowerCase()}@email.com`}
                            value={prospectEmail}
                            onChange={(e) => setProspectEmail(e.target.value)}
                            className="h-10 text-sm"
                          />
                          <p className="text-xs text-gray-500">
                            Sends a calendar invite with meeting details to {schedulingProspect.label.split(" ")[0]}
                          </p>
                        </div>
                      )}

                      {inviteMethod === "text" && haDate && (
                        <div className="space-y-1.5">
                          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                            <p className="text-sm text-gray-600 leading-relaxed">
                              {generateHATextInvite()}
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={async () => {
                              try {
                                await navigator.clipboard.writeText(generateHATextInvite())
                                setTextCopied(true)
                                setTimeout(() => setTextCopied(false), 3000)
                              } catch {}
                            }}
                            className={`w-full text-sm ${textCopied ? "bg-teal-50 border-teal-300 text-teal-700" : ""}`}
                          >
                            {textCopied ? <><Check className="h-3.5 w-3.5 mr-1.5" /> Copied!</> : <><Copy className="h-3.5 w-3.5 mr-1.5" /> Copy to Clipboard</>}
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
                          Don't send an invite to {schedulingProspect.label.split(" ")[0]}
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
                {haDate && (
                  <div className="text-center">
                    <p className="text-sm text-[hsl(var(--optavia-green))] font-medium">
                      {(() => {
                        const d = new Date(haDate + "T00:00:00")
                        return d.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })
                      })()} · {haHour}:{haMinute} {haAmPm} · {haMeetingType === "phone" ? "Phone" : "Zoom"}
                    </p>
                    <p className="text-xs text-green-600 mt-0.5">
                      {calendarOnly
                        ? "Coach calendar only"
                        : inviteMethod === "email"
                        ? prospectEmail ? `Email invite → ${prospectEmail}` : "Email invite → no email entered"
                        : "Text invite (copy)"
                      }
                    </p>
                  </div>
                )}

                {/* Primary Action Button */}
                <Button
                  onClick={handleSaveHASchedule}
                  disabled={!haDate || haSaving}
                  className="w-full bg-[hsl(var(--optavia-green))] hover:bg-[hsl(var(--optavia-green-dark))] text-white py-5 text-base rounded-xl"
                  size="lg"
                >
                  {haSaving ? (
                    <><Loader2 className="h-5 w-5 mr-2 animate-spin" /> Saving...</>
                  ) : (
                    <><CalendarPlus className="h-5 w-5 mr-2" /> Save to My Calendar</>
                  )}
                </Button>

                {/* Contextual Explainer */}
                <p className="text-xs text-gray-400 text-center leading-relaxed flex items-start gap-1.5 justify-center">
                  <Info className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
                  {calendarOnly
                    ? `This will add the HA to your calendar only. No invite will be sent to ${schedulingProspect.label.split(" ")[0]}.`
                    : inviteMethod === "email" && prospectEmail
                    ? `Enter ${schedulingProspect.label.split(" ")[0]}'s email above to send them an invite, or toggle "Only add to my calendar" to skip.`
                    : inviteMethod === "text"
                    ? `This will add the HA to your calendar. Don't forget to paste the copied invite text to ${schedulingProspect.label.split(" ")[0]}.`
                    : `Enter ${schedulingProspect.label.split(" ")[0]}'s email above to send them an invite, or toggle "Only add to my calendar" to skip.`
                  }
                </p>

                {/* Cancel */}
                <button
                  type="button"
                  onClick={() => {
                    setShowHAScheduleModal(false)
                    setSchedulingProspect(null)
                    setHaMeetingType("phone")
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

      {/* Objection Navigator Modal */}
      <Dialog open={showObjectionNav} onOpenChange={setShowObjectionNav}>
        <DialogContent className="sm:max-w-lg max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageCircleQuestion className="h-5 w-5 text-[hsl(var(--optavia-green))]" />
              Objection Navigator
            </DialogTitle>
            <DialogDescription>
              Scripts and strategies for common prospect objections.
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto -mx-6 px-6 pb-2">
            <ObjectionNavigator />
          </div>
        </DialogContent>
      </Dialog>

      {/* 100's List Guide Modal */}
      {showGuideModal && (
        <PipelineProgressionGuide onClose={() => setShowGuideModal(false)} />
      )}

      <Footer />
    </div>

    {/* Confirm Follow-up Done */}
    <AlertDialog open={showConfirmFollowUp} onOpenChange={setShowConfirmFollowUp}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirm follow-up</AlertDialogTitle>
          <AlertDialogDescription>
            Mark this follow-up as done? This will clear the overdue alert and move the next follow-up out a few days.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            onClick={() => {
              setFollowUpProspectId(null)
            }}
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction onClick={() => { void confirmFollowUpDone() }}>
            Confirm
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  )
}
