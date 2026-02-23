"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import {
  useCoaches,
  stageConfig,
  OPTAVIA_RANKS,
  getRankTitle,
  type CoachStage,
  type Coach,
} from "@/hooks/use-coaches"
import { useDebounce } from "@/hooks/use-debounce"
import { useToast } from "@/hooks/use-toast"
import { useUserData } from "@/contexts/user-data-context"
import { Card, CardContent } from "@/components/ui/card"
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
  Plus,
  Search,
  ChevronRight,
  Download,
  Mail,
  CalendarPlus,
  Phone,
  Video,
  Users,
  AlertCircle,
  GraduationCap,
  Repeat,
  Send,
  Info,
  MessageSquare,
  Loader2,
  Copy,
  Check,
  Lock,
} from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ErrorBoundary } from "@/components/ui/error-boundary"
import { StatsCardsSkeleton } from "@/components/ui/skeleton-loaders"
import { CoachCard } from "@/components/coach-tracker/coach-card"
import { CoachLearningGuide } from "@/components/coach-learning-guide"
import { sendCalendarInviteEmail } from "@/lib/email"

// Time options for scheduling
const HOUR_OPTIONS = Array.from({ length: 12 }, (_, i) => i + 1)
const MINUTE_OPTIONS = ["00", "15", "30", "45"]
const DAYS_OF_WEEK = [
  { short: "Sun", full: "Sunday", value: 0 },
  { short: "Mon", full: "Monday", value: 1 },
  { short: "Tue", full: "Tuesday", value: 2 },
  { short: "Wed", full: "Wednesday", value: 3 },
  { short: "Thu", full: "Thursday", value: 4 },
  { short: "Fri", full: "Friday", value: 5 },
  { short: "Sat", full: "Saturday", value: 6 },
]

export default function CoachTrackerPage() {
  const {
    coaches,
    loading,
    stats,
    addCoach,
    updateCoach,
    deleteCoach,
    checkInCoach,
    getFilteredCoaches,
    refreshData,
  } = useCoaches()
  const { toast } = useToast()
  const { user, profile } = useUserData()

  // Modals
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showRankModal, setShowRankModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [showGuideModal, setShowGuideModal] = useState(false)

  // Selected coach for actions
  const [selectedCoach, setSelectedCoach] = useState<Coach | null>(null)

  // Filter & search
  const [filterStage, setFilterStage] = useState<CoachStage | "all">("all")
  const [searchTerm, setSearchTerm] = useState("")
  const debouncedSearchTerm = useDebounce(searchTerm, 300)

  // Add form
  const today = new Date().toISOString().split("T")[0]
  const [addForm, setAddForm] = useState({
    label: "",
    stage: "new_coach" as CoachStage,
    rank: 1,
    launchDate: today,
    clientsCount: 0,
    prospectsCount: 0,
    notes: "",
  })

  // Edit form
  const [editForm, setEditForm] = useState({
    label: "",
    stage: "new_coach" as CoachStage,
    rank: 1,
    launchDate: today,
    clientsCount: 0,
    prospectsCount: 0,
    notes: "",
  })

  // Schedule state
  const [scheduleDay, setScheduleDay] = useState<number>(new Date().getDay())
  const [scheduleHour, setScheduleHour] = useState<number>(9)
  const [scheduleMinute, setScheduleMinute] = useState<string>("00")
  const [scheduleAmPm, setScheduleAmPm] = useState<"AM" | "PM">("AM")
  const [meetingType, setMeetingType] = useState<"phone" | "zoom">("phone")
  const [scheduleDate, setScheduleDate] = useState<string>("")
  const [recurringFrequency, setRecurringFrequency] = useState<"none" | "weekly" | "biweekly" | "monthly">("none")
  const [calendarOnly, setCalendarOnly] = useState(false)
  const [inviteMethod, setInviteMethod] = useState<"email" | "text">("email")
  const [scheduleSaving, setScheduleSaving] = useState(false)
  const [scheduleTextCopied, setScheduleTextCopied] = useState(false)
  const [coachEmail, setCoachEmail] = useState<string>("")

  const RECURRING_OPTIONS: { value: "none" | "weekly" | "biweekly" | "monthly"; label: string }[] = [
    { value: "none", label: "One-time" },
    { value: "weekly", label: "Weekly" },
    { value: "biweekly", label: "Every 2 weeks" },
    { value: "monthly", label: "Monthly" },
  ]

  // Filtered coaches
  const filteredCoaches = useMemo(() => {
    return getFilteredCoaches(filterStage, debouncedSearchTerm)
  }, [getFilteredCoaches, filterStage, debouncedSearchTerm])

  // === Handlers ===

  const resetAddForm = () => {
    setAddForm({
      label: "",
      stage: "new_coach",
      rank: 1,
      launchDate: today,
      clientsCount: 0,
      prospectsCount: 0,
      notes: "",
    })
  }

  const handleAddCoach = async () => {
    if (!addForm.label.trim()) return

    const result = await addCoach({
      label: addForm.label.trim(),
      stage: addForm.stage,
      rank: addForm.rank,
      launch_date: addForm.launchDate,
      clients_count: addForm.clientsCount,
      prospects_count: addForm.prospectsCount,
      notes: addForm.notes || undefined,
    })

    if (result) {
      toast({
        title: "Coach Added",
        description: `${addForm.label.trim()} has been added to your team.`,
      })
      setShowAddModal(false)
      resetAddForm()
    } else {
      toast({
        title: "Error",
        description: "Failed to add coach. Please try again.",
        variant: "destructive",
      })
    }
  }

  const openEditModal = (coach: Coach) => {
    setSelectedCoach(coach)
    setEditForm({
      label: coach.label,
      stage: coach.stage,
      rank: coach.rank,
      launchDate: coach.launch_date,
      clientsCount: coach.clients_count,
      prospectsCount: coach.prospects_count,
      notes: coach.notes || "",
    })
    setShowEditModal(true)
  }

  const handleSaveEdit = async () => {
    if (!selectedCoach || !editForm.label.trim()) return

    const success = await updateCoach(selectedCoach.id, {
      label: editForm.label.trim(),
      stage: editForm.stage,
      rank: editForm.rank,
      launch_date: editForm.launchDate,
      clients_count: editForm.clientsCount,
      prospects_count: editForm.prospectsCount,
      notes: editForm.notes || null,
    })

    if (success) {
      toast({
        title: "Coach Updated",
        description: `${editForm.label.trim()} has been updated.`,
      })
      setShowEditModal(false)
      setSelectedCoach(null)
    } else {
      toast({
        title: "Error",
        description: "Failed to update coach. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async () => {
    if (!selectedCoach) return

    const success = await deleteCoach(selectedCoach.id)
    if (success) {
      toast({
        title: "Coach Removed",
        description: `${selectedCoach.label} has been removed.`,
      })
      setShowDeleteConfirm(false)
      setSelectedCoach(null)
    } else {
      toast({
        title: "Error",
        description: "Failed to remove coach. Please try again.",
        variant: "destructive",
      })
    }
  }


  const handleMove = async (coachId: string, newStage: CoachStage) => {
    const success = await updateCoach(coachId, { stage: newStage })
    if (success) {
      toast({
        title: "Stage Updated",
        description: `Moved to ${stageConfig[newStage].label}.`,
      })
    }
  }


  const openScheduleModal = (coach: Coach) => {
    setSelectedCoach(coach)
    setScheduleDay(new Date().getDay())
    setScheduleHour(9)
    setScheduleMinute("00")
    setScheduleAmPm("AM")
    setMeetingType("phone")
    setScheduleDate("")
    setRecurringFrequency("none")
    setCalendarOnly(false)
    setInviteMethod("email")
    setScheduleSaving(false)
    setScheduleTextCopied(false)
    setCoachEmail("")
    setShowScheduleModal(true)
  }

  const handleCompleteSchedule = async (coach: Coach) => {
    const success = await updateCoach(coach.id, { next_scheduled_at: null })
    if (success) {
      await checkInCoach(coach.id)
      toast({
        title: "Call Completed",
        description: `Great job connecting with ${coach.label}! Check-in recorded.`,
      })
    }
  }

  const handleClearSchedule = async (coach: Coach) => {
    const success = await updateCoach(coach.id, { next_scheduled_at: null })
    if (success) {
      toast({
        title: "Schedule Cleared",
        description: `Scheduled call with ${coach.label} has been cancelled.`,
      })
    }
  }

  const getNextDayDate = (dayOfWeek: number): Date => {
    const now = new Date()
    const currentDay = now.getDay()
    let daysUntil = dayOfWeek - currentDay
    if (daysUntil <= 0) daysUntil += 7
    const targetDate = new Date(now)
    targetDate.setDate(now.getDate() + daysUntil)
    return targetDate
  }

  const get24Hour = (hour: number, ampm: "AM" | "PM"): number => {
    if (ampm === "AM") return hour === 12 ? 0 : hour
    return hour === 12 ? 12 : hour + 12
  }

  const generate1on1TextInvite = (): string => {
    if (!selectedCoach) return ""
    const firstName = selectedCoach.label.split(" ")[0]
    const dateStr = (() => {
      if (recurringFrequency === "none" && scheduleDate) {
        const d = new Date(scheduleDate + "T00:00:00")
        return d.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })
      }
      return getNextDayDate(scheduleDay).toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })
    })()
    const timeStr = `${scheduleHour}:${scheduleMinute} ${scheduleAmPm}`
    if (meetingType === "zoom" && profile?.zoom_link) {
      return `Hi ${firstName}! Looking forward to our 1:1 coaching call on ${dateStr} at ${timeStr}. Here's the Zoom link: ${profile.zoom_link} See you there!`
    }
    return `Hi ${firstName}! Just confirming our 1:1 coaching call on ${dateStr} at ${timeStr}. We'll connect via phone call. Talk soon!`
  }

  const handleSaveSchedule = async () => {
    if (!selectedCoach) return
    setScheduleSaving(true)

    const targetDate = recurringFrequency === "none" && scheduleDate
      ? new Date(scheduleDate + "T00:00:00")
      : getNextDayDate(scheduleDay)
    const hour24 = get24Hour(scheduleHour, scheduleAmPm)
    targetDate.setHours(hour24, parseInt(scheduleMinute), 0, 0)

    const sendInvite = !calendarOnly
    if (sendInvite && inviteMethod === "text") {
      try {
        await navigator.clipboard.writeText(generate1on1TextInvite())
        setScheduleTextCopied(true)
      } catch {}
    }

    const success = await updateCoach(selectedCoach.id, {
      next_scheduled_at: targetDate.toISOString(),
    })

    if (!success) {
      setScheduleSaving(false)
      toast({
        title: "Error",
        description: "Failed to save schedule. Please try again.",
        variant: "destructive",
      })
      return
    }

    const fromEmail = profile?.notification_email || user?.email
    if (fromEmail) {
      const endDate = new Date(targetDate)
      endDate.setMinutes(endDate.getMinutes() + 30)

      let description = `Coaching call with ${selectedCoach.label}\nRank: ${getRankTitle(selectedCoach.rank)}\nStage: ${stageConfig[selectedCoach.stage].label}`
      if (meetingType === "zoom" && profile?.zoom_link) {
        description += `\n\nZoom Meeting:\n${profile.zoom_link}`
        if (profile.zoom_meeting_id) description += `\nMeeting ID: ${profile.zoom_meeting_id}`
        if (profile.zoom_passcode) description += `\nPasscode: ${profile.zoom_passcode}`
      } else if (meetingType === "phone") {
        description += `\n\nMeeting Type: Phone Call`
      }

      sendCalendarInviteEmail({
        to: fromEmail,
        toName: profile?.full_name || "Coach",
        fromEmail,
        fromName: profile?.full_name || "Coaching Amplifier",
        eventTitle: `Coach 1:1: ${selectedCoach.label}`,
        eventDescription: description,
        startDate: targetDate.toISOString(),
        endDate: endDate.toISOString(),
        eventType: "check-in",
      }).catch(() => {})

      if (sendInvite && inviteMethod === "email" && coachEmail) {
        sendCalendarInviteEmail({
          to: coachEmail,
          toName: selectedCoach.label,
          fromEmail,
          fromName: profile?.full_name || "Your Coach",
          eventTitle: `Coach 1:1: ${selectedCoach.label}`,
          eventDescription: description,
          startDate: targetDate.toISOString(),
          endDate: endDate.toISOString(),
          eventType: "check-in",
        }).then((result) => {
          if (result.success) {
            toast({
              title: "📧 Invite sent",
              description: `Calendar invite sent to ${selectedCoach.label}`,
            })
          }
        }).catch(() => {})
      }
    }

    setScheduleSaving(false)
    setShowScheduleModal(false)
    setSelectedCoach(null)
    setCalendarOnly(false)
    setInviteMethod("email")

    if (sendInvite && inviteMethod === "text") {
      toast({
        title: "📋 Saved & text copied",
        description: "1:1 saved. Paste the invite into your texting app.",
      })
    } else {
      toast({
        title: recurringFrequency !== "none" ? "🔄 Recurring 1:1 Set" : "📅 1:1 Scheduled",
        description: `${selectedCoach.label} — ${scheduleHour}:${scheduleMinute} ${scheduleAmPm} on ${DAYS_OF_WEEK[scheduleDay].full}`,
      })
    }
  }

  const handleUpdateRank = async (coachId: string, newRank: number) => {
    const success = await updateCoach(coachId, { rank: newRank })
    if (success) {
      // Update the selected coach in the rank modal so UI reflects immediately
      setSelectedCoach(prev => prev ? { ...prev, rank: newRank } : null)
      toast({
        title: "Rank Updated",
        description: `Updated to ${getRankTitle(newRank)}.`,
      })
    }
  }

  const handleExport = () => {
    const headers = ["Name", "Stage", "Rank", "Launch Date", "Clients", "Prospects", "Notes", "Last Check-In"]
    const rows = filteredCoaches.map(c => [
      c.label,
      stageConfig[c.stage].label,
      getRankTitle(c.rank),
      c.launch_date,
      c.clients_count,
      c.prospects_count,
      (c.notes || "").replace(/,/g, ";"),
      c.last_check_in || "Never",
    ])
    const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "coach-tracker.csv"
    a.click()
    URL.revokeObjectURL(url)
    toast({ title: "Exported", description: "Coach data downloaded as CSV." })
  }

  // Stage select buttons for the add/edit modal
  const StageSelector = ({ value, onChange }: { value: CoachStage; onChange: (v: CoachStage) => void }) => (
    <div className="grid grid-cols-4 gap-1.5">
      {(["new_coach", "building", "certified", "leader"] as CoachStage[]).map((stageId) => {
        const cfg = stageConfig[stageId]
        const isActive = value === stageId
        return (
          <button
            key={stageId}
            type="button"
            onClick={() => onChange(stageId)}
            className={`flex flex-col items-center p-2 rounded-lg border-2 transition-all ${
              isActive ? "scale-[1.02]" : "hover:scale-[1.01]"
            }`}
            style={{
              borderColor: isActive ? cfg.color : "#E5E7EB",
              background: isActive ? cfg.bg : "white",
            }}
          >
            <span className="text-base">{cfg.icon}</span>
            <span
              className="text-[9px] font-bold mt-0.5"
              style={{ color: isActive ? cfg.color : "#6B7280" }}
            >
              {cfg.label.toUpperCase()}
            </span>
          </button>
        )
      })}
    </div>
  )

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
                <span className="font-semibold">Coach List</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-3">
                <Users className="h-8 w-8" />
                My Coaches
              </h1>
              <p className="text-sm opacity-90 mt-1">
                Track team development, rank progression, and milestones
              </p>
            </div>
            <div className="flex flex-wrap gap-2 sm:gap-3">
              <Button
                onClick={() => { resetAddForm(); setShowAddModal(true) }}
                className="bg-white text-[hsl(var(--optavia-green))] hover:bg-white/90 order-first sm:order-last"
              >
                <Plus className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Add Coach</span>
                <span className="sm:hidden">Add</span>
              </Button>
              <Button
                className="bg-[#f88221] border-[#f88221] text-white hover:bg-[#e07520] hidden sm:flex"
                onClick={() => setShowGuideModal(true)}
              >
                <GraduationCap className="h-4 w-4 mr-2" />
                Learn the Coach List
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
                <strong>Schedule:</strong> Add coaching 1:1s to your calendar.
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <ErrorBoundary>

          {/* Pipeline Stages */}
          {loading ? (
            <StatsCardsSkeleton count={4} />
          ) : (
            <div className="mb-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                {([
                  { id: "new_coach" as CoachStage, icon: "🌟", count: stats.newCoach },
                  { id: "building" as CoachStage, icon: "🔨", count: stats.building },
                  { id: "certified" as CoachStage, icon: "✅", count: stats.certified },
                  { id: "leader" as CoachStage, icon: "👑", count: stats.leader },
                ] as const).map((stage, index, arr) => {
                  const cfg = stageConfig[stage.id]
                  const isActive = filterStage === stage.id
                  return (
                    <button
                      key={stage.id}
                      onClick={() => setFilterStage(filterStage === stage.id ? "all" : stage.id)}
                      className="relative flex flex-col items-center p-3 sm:p-4 rounded-xl border-2 bg-white hover:shadow-lg transition-all hover:scale-[1.03] cursor-pointer group"
                      style={{
                        borderColor: isActive ? cfg.color : cfg.borderColor,
                        boxShadow: isActive ? `0 0 0 2px ${cfg.color}33` : undefined,
                      }}
                    >
                      <span className="text-xl sm:text-2xl mb-1">{stage.icon}</span>
                      <span
                        className="text-2xl sm:text-3xl font-bold"
                        style={{ color: cfg.color }}
                      >
                        {stage.count}
                      </span>
                      <span className="text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wide mt-0.5">
                        {cfg.label}
                      </span>
                      {index < arr.length - 1 && (
                        <ChevronRight
                          className="hidden sm:block absolute -right-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-300 z-10"
                        />
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Search, Filter & Actions */}
          <div className="flex items-center gap-2 mb-6 flex-wrap">
            <div className="relative flex-1 min-w-[140px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-9"
              />
            </div>

            <Select
              value={filterStage}
              onValueChange={(value) => setFilterStage(value as CoachStage | "all")}
            >
              <SelectTrigger className="w-[140px] sm:w-[160px] h-9 text-sm flex-shrink-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Coaches</SelectItem>
                <SelectItem value="new_coach">New Coach</SelectItem>
                <SelectItem value="building">Building</SelectItem>
                <SelectItem value="certified">Certified</SelectItem>
                <SelectItem value="leader">Leader</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              className="text-gray-600 flex-shrink-0 h-9"
              title="Export to CSV"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline ml-1">Export</span>
            </Button>
          </div>

          {/* Coach Count */}
          <div className="text-sm text-gray-500 mb-3">
            {filteredCoaches.length} coach{filteredCoaches.length !== 1 ? "es" : ""}
            {filterStage !== "all" && ` in ${stageConfig[filterStage].label}`}
          </div>

          {/* Coach List */}
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-32 bg-white rounded-xl border border-gray-200 animate-pulse" />
              ))}
            </div>
          ) : filteredCoaches.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <span className="text-4xl mb-3">🚀</span>
                <h3 className="font-bold text-lg text-gray-700 mb-1">
                  {searchTerm ? "No coaches match your search" : filterStage !== "all" ? "No coaches in this stage" : "No coaches yet"}
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  {searchTerm
                    ? "Try a different search term"
                    : "Add your first downline coach to start tracking their progress"}
                </p>
                {!searchTerm && filterStage === "all" && (
                  <Button
                    onClick={() => { resetAddForm(); setShowAddModal(true) }}
                    className="bg-[hsl(var(--optavia-green))] hover:bg-[hsl(var(--optavia-green))]/90"
                  >
                    <Plus className="h-4 w-4 mr-1" /> Add Your First Coach
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredCoaches.map((coach) => (
                <CoachCard
                  key={coach.id}
                  coach={coach}
                  onEdit={openEditModal}
                  onDelete={(c) => { setSelectedCoach(c); setShowDeleteConfirm(true) }}
                  onRank={(c) => { setSelectedCoach(c); setShowRankModal(true) }}
                  onStageChange={handleMove}
                  onSchedule={openScheduleModal}
                  onCompleteSchedule={handleCompleteSchedule}
                  onClearSchedule={handleClearSchedule}
                />
              ))}
            </div>
          )}
        </ErrorBoundary>
      </div>

      {/* ==================== MODALS ==================== */}

      {/* Add Coach Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Coach</DialogTitle>
            <DialogDescription>Add a new coach to your downline team.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Name / Nickname</Label>
              <Input
                value={addForm.label}
                onChange={(e) => setAddForm(p => ({ ...p, label: e.target.value }))}
                placeholder="Coach's name or nickname"
              />
            </div>
            <div>
              <Label>Stage</Label>
              <StageSelector value={addForm.stage} onChange={(v) => setAddForm(p => ({ ...p, stage: v }))} />
            </div>
            <div>
              <Label>OPTAVIA Rank</Label>
              <Select
                value={String(addForm.rank)}
                onValueChange={(v) => setAddForm(p => ({ ...p, rank: Number(v) }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {OPTAVIA_RANKS.map((r) => (
                    <SelectItem key={r.rank} value={String(r.rank)}>
                      {r.rank}. {r.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Launch Date</Label>
              <Input
                type="date"
                value={addForm.launchDate}
                onChange={(e) => setAddForm(p => ({ ...p, launchDate: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Clients</Label>
                <Input
                  type="number"
                  min={0}
                  value={addForm.clientsCount}
                  onChange={(e) => setAddForm(p => ({ ...p, clientsCount: Math.max(0, Number(e.target.value)) }))}
                />
              </div>
              <div>
                <Label>Prospects</Label>
                <Input
                  type="number"
                  min={0}
                  value={addForm.prospectsCount}
                  onChange={(e) => setAddForm(p => ({ ...p, prospectsCount: Math.max(0, Number(e.target.value)) }))}
                />
              </div>
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea
                value={addForm.notes}
                onChange={(e) => setAddForm(p => ({ ...p, notes: e.target.value }))}
                placeholder="Add coaching notes..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAddCoach}
              disabled={!addForm.label.trim()}
              className="bg-[hsl(var(--optavia-green))] hover:bg-[hsl(var(--optavia-green))]/90"
            >
              Add Coach
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Coach Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Coach</DialogTitle>
            <DialogDescription>Update coach details.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Name / Nickname</Label>
              <Input
                value={editForm.label}
                onChange={(e) => setEditForm(p => ({ ...p, label: e.target.value }))}
                placeholder="Coach's name or nickname"
              />
            </div>
            <div>
              <Label>Stage</Label>
              <StageSelector value={editForm.stage} onChange={(v) => setEditForm(p => ({ ...p, stage: v }))} />
            </div>
            <div>
              <Label>OPTAVIA Rank</Label>
              <Select
                value={String(editForm.rank)}
                onValueChange={(v) => setEditForm(p => ({ ...p, rank: Number(v) }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {OPTAVIA_RANKS.map((r) => (
                    <SelectItem key={r.rank} value={String(r.rank)}>
                      {r.rank}. {r.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Launch Date</Label>
              <Input
                type="date"
                value={editForm.launchDate}
                onChange={(e) => setEditForm(p => ({ ...p, launchDate: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Clients</Label>
                <Input
                  type="number"
                  min={0}
                  value={editForm.clientsCount}
                  onChange={(e) => setEditForm(p => ({ ...p, clientsCount: Math.max(0, Number(e.target.value)) }))}
                />
              </div>
              <div>
                <Label>Prospects</Label>
                <Input
                  type="number"
                  min={0}
                  value={editForm.prospectsCount}
                  onChange={(e) => setEditForm(p => ({ ...p, prospectsCount: Math.max(0, Number(e.target.value)) }))}
                />
              </div>
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea
                value={editForm.notes}
                onChange={(e) => setEditForm(p => ({ ...p, notes: e.target.value }))}
                placeholder="Add coaching notes..."
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
              disabled={!editForm.label.trim()}
              className="bg-[hsl(var(--optavia-green))] hover:bg-[hsl(var(--optavia-green))]/90"
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rank Progression Modal */}
      <Dialog open={showRankModal} onOpenChange={setShowRankModal}>
        <DialogContent className="sm:max-w-md max-h-[85vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Rank Progression</DialogTitle>
            {selectedCoach && (
              <DialogDescription>{selectedCoach.label}</DialogDescription>
            )}
          </DialogHeader>
          {selectedCoach && (
            <div className="space-y-4">
              {/* Current Rank Display */}
              <div className="bg-green-50 rounded-xl p-4">
                <div className="font-extrabold text-base text-green-700">
                  {getRankTitle(selectedCoach.rank)}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Rank {selectedCoach.rank} of 15
                </div>
                <div className="h-2 bg-white rounded-full overflow-hidden mt-2.5">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-green-500 to-green-700 transition-all duration-400"
                    style={{ width: `${(selectedCoach.rank / 15) * 100}%` }}
                  />
                </div>
              </div>

              {/* All Ranks */}
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Update Rank
                </p>
                <div className="space-y-0.5">
                  {OPTAVIA_RANKS.map((r) => {
                    const isCurrent = r.rank === selectedCoach.rank
                    const isPast = r.rank < selectedCoach.rank
                    return (
                      <button
                        key={r.rank}
                        onClick={() => handleUpdateRank(selectedCoach.id, r.rank)}
                        className={`flex items-center gap-3 w-full px-3 py-2.5 text-left transition-colors ${
                          isCurrent
                            ? "bg-green-50 rounded-lg"
                            : "hover:bg-gray-50"
                        }`}
                      >
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-extrabold flex-shrink-0 ${
                            isCurrent
                              ? "bg-green-600 text-white"
                              : isPast
                              ? "bg-green-100 text-green-600"
                              : "bg-gray-100 text-gray-400"
                          }`}
                        >
                          {isPast ? "✓" : r.rank}
                        </div>
                        <span
                          className={`text-sm flex-1 ${
                            isCurrent
                              ? "font-bold text-green-700"
                              : "font-medium text-gray-700"
                          }`}
                        >
                          {r.title}
                        </span>
                        {isCurrent && (
                          <Badge variant="outline" className="text-[9px] border-green-300 text-green-600 bg-green-50">
                            CURRENT
                          </Badge>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRankModal(false)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Schedule 1:1 Modal */}
      <Dialog open={showScheduleModal} onOpenChange={(open) => {
        setShowScheduleModal(open)
        if (!open) {
          setSelectedCoach(null)
          setMeetingType("phone")
          setCalendarOnly(false)
          setInviteMethod("email")
        }
      }}>
        <DialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden">
          {selectedCoach && (
            <>
              {/* Header */}
              <div className="px-6 pt-6 pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                      <CalendarPlus className="h-5 w-5 text-[hsl(var(--optavia-green))]" />
                    </div>
                    <div>
                      <DialogTitle className="text-lg font-bold text-gray-900">Schedule 1:1</DialogTitle>
                      <DialogDescription className="text-sm text-gray-500">30 minute coaching call</DialogDescription>
                    </div>
                  </div>
                </div>

                {/* Coach Card */}
                <div className="mt-4 bg-gray-50 border border-gray-200 rounded-xl p-4 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[hsl(var(--optavia-green))] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {selectedCoach.label.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{selectedCoach.label}</div>
                    <div className="text-xs text-[hsl(var(--optavia-green))]">
                      {stageConfig[selectedCoach.stage].icon} {stageConfig[selectedCoach.stage].label} • {getRankTitle(selectedCoach.rank)}
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
                        Send Invite to {selectedCoach.label.split(" ")[0]}
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
                            placeholder={`${selectedCoach.label.split(" ")[0].toLowerCase()}@email.com`}
                            value={coachEmail}
                            onChange={(e) => setCoachEmail(e.target.value)}
                            className="h-10 text-sm"
                          />
                          <p className="text-xs text-gray-500">
                            Sends a calendar invite with meeting details to {selectedCoach.label.split(" ")[0]}
                          </p>
                        </div>
                      )}

                      {inviteMethod === "text" && (
                        <div className="space-y-1.5">
                          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                            <p className="text-sm text-gray-600 leading-relaxed">
                              {generate1on1TextInvite()}
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={async () => {
                              try {
                                await navigator.clipboard.writeText(generate1on1TextInvite())
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
                          Don't send an invite to {selectedCoach.label.split(" ")[0]}
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
                        ? coachEmail ? `Email invite → ${coachEmail}` : "Email invite → no email entered"
                        : "Text invite (copy)"
                      }
                    </p>
                  </div>
                )}

                {/* Primary Action Button */}
                <Button
                  onClick={handleSaveSchedule}
                  disabled={scheduleSaving || (recurringFrequency === "none" && !scheduleDate) || (!calendarOnly && inviteMethod === "email" && !coachEmail.trim())}
                  className="w-full bg-[hsl(var(--optavia-green))] hover:bg-[hsl(var(--optavia-green-dark))] text-white py-5 text-base rounded-xl"
                  size="lg"
                >
                  {scheduleSaving ? (
                    <><Loader2 className="h-5 w-5 mr-2 animate-spin" /> Saving...</>
                  ) : (
                    <><CalendarPlus className="h-5 w-5 mr-2" /> Save to My Calendar</>
                  )}
                </Button>

                {/* Contextual Explainer */}
                <p className="text-xs text-gray-400 text-center leading-relaxed flex items-start gap-1.5 justify-center">
                  <Info className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
                  {calendarOnly
                    ? `This will add the 1:1 to your calendar only. No invite will be sent to ${selectedCoach.label.split(" ")[0]}.`
                    : inviteMethod === "email" && coachEmail
                    ? `Enter ${selectedCoach.label.split(" ")[0]}'s email above to send them an invite, or toggle "Only add to my calendar" to skip.`
                    : inviteMethod === "text"
                    ? `This will add the 1:1 to your calendar. Don't forget to paste the copied invite text to ${selectedCoach.label.split(" ")[0]}.`
                    : `Enter ${selectedCoach.label.split(" ")[0]}'s email above to send them an invite, or toggle "Only add to my calendar" to skip.`
                  }
                </p>

                {/* Cancel */}
                <button
                  type="button"
                  onClick={() => {
                    setShowScheduleModal(false)
                    setSelectedCoach(null)
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

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Coach?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove {selectedCoach?.label} from your tracker. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Coach Learning Guide Modal */}
      {showGuideModal && (
        <CoachLearningGuide onClose={() => setShowGuideModal(false)} />
      )}

      <Footer />
    </div>
  )
}
