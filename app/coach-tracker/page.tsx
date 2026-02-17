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
} from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ErrorBoundary } from "@/components/ui/error-boundary"
import { StatsCardsSkeleton } from "@/components/ui/skeleton-loaders"
import { CoachCard } from "@/components/coach-tracker/coach-card"
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
  const [scheduleEmails, setScheduleEmails] = useState<string>("")

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

  const handleCheckIn = async (coach: Coach) => {
    const success = await checkInCoach(coach.id)
    if (success) {
      toast({
        title: "Checked In",
        description: `Check-in recorded for ${coach.label}.`,
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
    setScheduleEmails(profile?.notification_email || user?.email || "")
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

  const parseEmails = (input: string): string[] => {
    return input
      .split(",")
      .map((e) => e.trim())
      .filter((e) => e.length > 0 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e))
  }

  const handleSaveSchedule = async () => {
    if (!selectedCoach) return

    const targetDate = getNextDayDate(scheduleDay)
    const hour24 = get24Hour(scheduleHour, scheduleAmPm)
    targetDate.setHours(hour24, parseInt(scheduleMinute), 0, 0)

    const success = await updateCoach(selectedCoach.id, {
      next_scheduled_at: targetDate.toISOString(),
    })

    if (success) {
      // Send calendar invite to all provided email addresses
      const emails = parseEmails(scheduleEmails)
      const fromEmail = profile?.notification_email || user?.email
      if (emails.length > 0 && fromEmail) {
        const endDate = new Date(targetDate)
        endDate.setMinutes(endDate.getMinutes() + 30)

        Promise.all(
          emails.map((toEmail) =>
            sendCalendarInviteEmail({
              to: toEmail,
              toName: profile?.full_name || "Coach",
              fromEmail,
              fromName: profile?.full_name || "Coaching Amplifier",
              eventTitle: `Coach 1:1: ${selectedCoach.label}`,
              eventDescription: `Coaching call with ${selectedCoach.label}\nRank: ${getRankTitle(selectedCoach.rank)}\nStage: ${stageConfig[selectedCoach.stage].label}`,
              startDate: targetDate.toISOString(),
              endDate: endDate.toISOString(),
              eventType: "check-in",
            })
          )
        ).then((results) => {
          const sentCount = results.filter((r) => r.success).length
          if (sentCount > 0) {
            toast({
              title: "Calendar invite sent",
              description: emails.length === 1
                ? `Check ${emails[0]} for the calendar invite`
                : `Invite sent to ${sentCount} recipient(s)`,
            })
          }
        }).catch(() => {
          // Calendar invite is optional
        })
      }

      toast({
        title: "Scheduled",
        description: `1:1 with ${selectedCoach.label} scheduled for ${targetDate.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })} at ${scheduleHour}:${scheduleMinute} ${scheduleAmPm}.`,
      })
      setShowScheduleModal(false)
      setSelectedCoach(null)
    } else {
      toast({
        title: "Error",
        description: "Failed to save schedule. Please try again.",
        variant: "destructive",
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
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          {/* Breadcrumb */}
          <div className="text-sm text-gray-500 mb-2">
            <Link href="/dashboard" className="hover:text-gray-700">Dashboard</Link>
            <span className="mx-2 text-gray-300">›</span>
            <span className="text-gray-900 font-semibold">Coach Tracker</span>
          </div>

          {/* Title Row */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🚀</span>
              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900">
                  My Coaches
                </h1>
                <p className="text-sm text-gray-500 mt-0.5">
                  Track team development, rank progression, and milestones
                </p>
              </div>
            </div>

            <div className="flex gap-2 flex-wrap">
              <Button
                onClick={() => { resetAddForm(); setShowAddModal(true) }}
                className="bg-[hsl(var(--optavia-green))] hover:bg-[hsl(var(--optavia-green))]/90"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Coach
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <ErrorBoundary>
          {/* Privacy / Info Banner */}
          <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-gray-500 mb-4">
            <span>
              <span className="font-bold text-amber-500">ℹ️ Privacy:</span> Use nicknames only. Contact info stays in OPTAVIA's portal.
            </span>
            <span>
              <span className="font-bold text-green-600">📅 Schedule:</span> Add coaching 1:1s to your calendar.
            </span>
          </div>

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

          {/* Search & Filter */}
          <div className="flex flex-col gap-4 mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex items-center justify-between gap-2 flex-wrap">
              {/* Filter Pills */}
              <div className="flex gap-1 sm:gap-2 flex-wrap">
                {[
                  { id: "all" as const, label: "All" },
                  { id: "new_coach" as const, label: "New Coach" },
                  { id: "building" as const, label: "Building" },
                  { id: "certified" as const, label: "Certified" },
                  { id: "leader" as const, label: "Leader" },
                ].map((f) => (
                  <Button
                    key={f.id}
                    variant={filterStage === f.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilterStage(f.id)}
                    className={`text-xs sm:text-sm px-2 sm:px-3 ${
                      filterStage === f.id ? "bg-[hsl(var(--optavia-green))]" : ""
                    }`}
                  >
                    {f.label}
                  </Button>
                ))}
              </div>

              {/* Export */}
              <Button variant="outline" size="sm" onClick={handleExport} className="text-xs">
                <Download className="h-3.5 w-3.5 mr-1" />
                Export
              </Button>
            </div>
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
                  onCheckIn={handleCheckIn}
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
      <Dialog open={showScheduleModal} onOpenChange={setShowScheduleModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Schedule 1:1</DialogTitle>
            {selectedCoach && (
              <DialogDescription>
                Set up a coaching call with {selectedCoach.label}
              </DialogDescription>
            )}
          </DialogHeader>
          <div className="space-y-4">
            {/* Day of Week */}
            <div>
              <Label>Day</Label>
              <div className="grid grid-cols-7 gap-1 mt-1">
                {DAYS_OF_WEEK.map((day) => (
                  <Button
                    key={day.value}
                    variant={scheduleDay === day.value ? "default" : "outline"}
                    size="sm"
                    className={`text-xs px-0 ${
                      scheduleDay === day.value ? "bg-[hsl(var(--optavia-green))]" : ""
                    }`}
                    onClick={() => setScheduleDay(day.value)}
                  >
                    {day.short}
                  </Button>
                ))}
              </div>
            </div>

            {/* Time */}
            <div>
              <Label>Time</Label>
              <div className="flex gap-2 mt-1">
                <Select value={String(scheduleHour)} onValueChange={(v) => setScheduleHour(Number(v))}>
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {HOUR_OPTIONS.map((h) => (
                      <SelectItem key={h} value={String(h)}>{h}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <span className="self-center text-gray-400 font-bold">:</span>
                <Select value={scheduleMinute} onValueChange={setScheduleMinute}>
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MINUTE_OPTIONS.map((m) => (
                      <SelectItem key={m} value={m}>{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={scheduleAmPm} onValueChange={(v) => setScheduleAmPm(v as "AM" | "PM")}>
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AM">AM</SelectItem>
                    <SelectItem value="PM">PM</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Email Recipients */}
            <div>
              <Label className="text-sm font-medium flex items-center gap-2">
                <Mail className="h-4 w-4 text-purple-500" />
                Send Calendar Invite
              </Label>
              <Input
                type="text"
                placeholder="email@example.com, another@example.com"
                value={scheduleEmails}
                onChange={(e) => setScheduleEmails(e.target.value)}
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">
                Separate multiple email addresses with commas
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowScheduleModal(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveSchedule}
              className="bg-[hsl(var(--optavia-green))] hover:bg-[hsl(var(--optavia-green))]/90"
            >
              Save & Schedule
            </Button>
          </DialogFooter>
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

      <Footer />
    </div>
  )
}
