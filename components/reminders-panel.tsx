"use client"

import { useState } from "react"
import { useReminders, type Reminder, type ReminderPriority, type EntityType } from "@/hooks/use-reminders"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Bell,
  Plus,
  Calendar,
  Clock,
  CheckCircle,
  Edit2,
  Trash2,
  X,
  AlertCircle,
  User,
  Target,
} from "lucide-react"

interface RemindersPanelProps {
  isOpen: boolean
  onClose: () => void
}

interface CreateReminderModalProps {
  isOpen: boolean
  onClose: () => void
  editingReminder?: Reminder | null
  prefillEntity?: {
    entityType: EntityType
    entityId: string
    entityName: string
  } | null
}

// Standalone button for cards
export function ReminderButton({ 
  entityType, 
  entityId, 
  entityName,
  variant = "ghost"
}: { 
  entityType: EntityType
  entityId: string
  entityName: string
  variant?: "ghost" | "outline"
}) {
  const [showModal, setShowModal] = useState(false)

  return (
    <>
      <Button
        variant={variant}
        size="sm"
        onClick={() => setShowModal(true)}
        className="text-gray-500 hover:text-amber-600"
        title="Set reminder"
      >
        <Clock className="h-4 w-4 mr-1" />
        <span className="text-xs sm:text-sm">Remind</span>
      </Button>
      <CreateReminderModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        prefillEntity={{ entityType, entityId, entityName }}
      />
    </>
  )
}

// Create/Edit Modal
function CreateReminderModal({ isOpen, onClose, editingReminder, prefillEntity }: CreateReminderModalProps) {
  const { addReminder, updateReminder } = useReminders()
  const { toast } = useToast()
  
  const today = new Date().toISOString().split('T')[0]
  
  const [title, setTitle] = useState(editingReminder?.title || "")
  const [notes, setNotes] = useState(editingReminder?.notes || "")
  const [dueDate, setDueDate] = useState(editingReminder?.due_date || today)
  const [dueTime, setDueTime] = useState(editingReminder?.due_time || "")
  const [priority, setPriority] = useState<ReminderPriority>(editingReminder?.priority || "normal")

  const handleSave = async () => {
    if (!title.trim()) return

    if (editingReminder) {
      const success = await updateReminder(editingReminder.id, {
        title: title.trim(),
        notes: notes.trim() || null,
        due_date: dueDate,
        due_time: dueTime || null,
        priority,
      })
      if (success) {
        toast({ title: "Reminder updated" })
        handleClose()
      }
    } else {
      const reminder = await addReminder({
        title: title.trim(),
        notes: notes.trim() || undefined,
        due_date: dueDate,
        due_time: dueTime || undefined,
        priority,
        entity_type: prefillEntity?.entityType,
        entity_id: prefillEntity?.entityId,
        entity_name: prefillEntity?.entityName,
      })
      if (reminder) {
        toast({ title: "Reminder created" })
        handleClose()
      }
    }
  }

  const handleClose = () => {
    setTitle("")
    setNotes("")
    setDueDate(today)
    setDueTime("")
    setPriority("normal")
    onClose()
  }

  // Quick date options
  const getQuickDate = (daysFromNow: number) => {
    const date = new Date()
    date.setDate(date.getDate() + daysFromNow)
    return date.toISOString().split('T')[0]
  }

  const quickDates = [
    { label: "Today", value: today },
    { label: "Tomorrow", value: getQuickDate(1) },
    { label: "In 3 days", value: getQuickDate(3) },
    { label: "Next week", value: getQuickDate(7) },
  ]

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {editingReminder ? "Edit Reminder" : "New Reminder"}
          </DialogTitle>
        </DialogHeader>

        {/* Linked Entity Display */}
        {(prefillEntity || editingReminder?.entity_type) && (
          <div className="p-3 bg-gray-50 rounded-lg flex items-center gap-2">
            {(prefillEntity?.entityType || editingReminder?.entity_type) === "client" ? (
              <User className="h-5 w-5 text-green-600" />
            ) : (
              <Target className="h-5 w-5 text-blue-600" />
            )}
            <div>
              <p className="text-xs text-gray-500">
                {(prefillEntity?.entityType || editingReminder?.entity_type) === "client" ? "Client" : "Prospect"}
              </p>
              <p className="font-medium text-gray-800">
                {prefillEntity?.entityName || editingReminder?.entity_name}
              </p>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {/* Title */}
          <div>
            <Label>Reminder *</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Follow up about HA results"
              autoFocus
            />
          </div>

          {/* Notes */}
          <div>
            <Label>Notes (optional)</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional details..."
              rows={2}
            />
          </div>

          {/* Due Date */}
          <div>
            <Label>Due Date</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {quickDates.map((qd) => (
                <button
                  key={qd.value}
                  type="button"
                  onClick={() => setDueDate(qd.value)}
                  className={`text-xs px-3 py-1 rounded-full transition-colors ${
                    dueDate === qd.value
                      ? "bg-[hsl(var(--optavia-green))] text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {qd.label}
                </button>
              ))}
            </div>
            <Input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>

          {/* Due Time */}
          <div>
            <Label>Time (optional)</Label>
            <Input
              type="time"
              value={dueTime}
              onChange={(e) => setDueTime(e.target.value)}
            />
          </div>

          {/* Priority */}
          <div>
            <Label>Priority</Label>
            <div className="flex gap-2">
              {([
                { value: "normal", label: "Normal" },
                { value: "high", label: "High" },
                { value: "urgent", label: "Urgent" },
              ] as const).map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setPriority(p.value)}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                    priority === p.value
                      ? p.value === "normal"
                        ? "bg-gray-600 text-white"
                        : p.value === "high"
                          ? "bg-orange-500 text-white"
                          : "bg-red-500 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!title.trim()}
            className="bg-[hsl(var(--optavia-green))]"
          >
            {editingReminder ? "Save Changes" : "Create Reminder"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Reminder Card Component
function ReminderCard({ 
  reminder, 
  onEdit, 
  onComplete,
  onUncomplete,
  onDelete,
  isOverdue: isOverdueFn,
  isDueToday: isDueTodayFn,
  compact = false 
}: { 
  reminder: Reminder
  onEdit: () => void
  onComplete: (id: string) => Promise<boolean>
  onUncomplete: (id: string) => Promise<boolean>
  onDelete: (id: string) => Promise<boolean>
  isOverdue: (reminder: Reminder) => boolean
  isDueToday: (reminder: Reminder) => boolean
  compact?: boolean 
}) {
  const { toast } = useToast()

  const overdue = isOverdueFn(reminder)
  const dueToday = isDueTodayFn(reminder)

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + "T00:00:00")
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    if (date.getTime() === today.getTime()) return "Today"
    if (date.getTime() === tomorrow.getTime()) return "Tomorrow"
    if (date < today) return `Overdue`
    return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })
  }

  const formatTime = (timeStr: string | null) => {
    if (!timeStr) return ""
    const [hours, minutes] = timeStr.split(":")
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? "PM" : "AM"
    const hour12 = hour % 12 || 12
    return `${hour12}:${minutes} ${ampm}`
  }

  const handleComplete = async () => {
    const success = await onComplete(reminder.id)
    if (success) {
      toast({ title: "✓ Reminder completed!" })
    }
  }

  const handleUncomplete = async () => {
    await onUncomplete(reminder.id)
  }

  const handleDelete = async () => {
    const success = await onDelete(reminder.id)
    if (success) {
      toast({ title: "Reminder deleted" })
    }
  }

  return (
    <div className={`rounded-lg border p-3 transition-all ${
      reminder.is_completed
        ? "bg-gray-50 border-gray-200 opacity-75"
        : overdue
          ? "bg-red-50 border-red-200"
          : dueToday
            ? "bg-amber-50 border-amber-200"
            : "bg-white border-gray-200 hover:border-gray-300"
    }`}>
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <button
          onClick={reminder.is_completed ? handleUncomplete : handleComplete}
          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
            reminder.is_completed
              ? "bg-green-500 border-green-500 text-white"
              : "border-gray-300 hover:border-green-500"
          }`}
        >
          {reminder.is_completed && <CheckCircle className="h-3 w-3" />}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h4 className={`font-medium ${reminder.is_completed ? "text-gray-400 line-through" : "text-gray-800"}`}>
              {reminder.title}
            </h4>
            {reminder.priority !== "normal" && !reminder.is_completed && (
              <Badge className={
                reminder.priority === "urgent" 
                  ? "bg-red-100 text-red-700" 
                  : "bg-orange-100 text-orange-700"
              }>
                {reminder.priority}
              </Badge>
            )}
          </div>

          {reminder.notes && !compact && (
            <p className={`text-sm mb-2 ${reminder.is_completed ? "text-gray-400" : "text-gray-600"}`}>
              {reminder.notes}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Due date */}
            <span className={`flex items-center gap-1 ${
              overdue ? "text-red-600 font-medium" : dueToday ? "text-amber-600 font-medium" : "text-gray-500"
            }`}>
              <Calendar className="h-3.5 w-3.5" />
              {formatDate(reminder.due_date)}
              {reminder.due_time && ` at ${formatTime(reminder.due_time)}`}
            </span>

            {/* Linked entity */}
            {reminder.entity_type && (
              <Badge className={
                reminder.entity_type === "client" 
                  ? "bg-green-100 text-green-700" 
                  : "bg-blue-100 text-blue-700"
              }>
                {reminder.entity_type === "client" ? "👤" : "🎯"} {reminder.entity_name}
              </Badge>
            )}
          </div>
        </div>

        {/* Actions */}
        {!compact && (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={onEdit}
              className="h-7 w-7 p-0 text-gray-400 hover:text-gray-600"
              title="Edit"
            >
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              className="h-7 w-7 p-0 text-gray-400 hover:text-red-600"
              title="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

// Main Reminders Panel
export function RemindersPanel({ isOpen, onClose }: RemindersPanelProps) {
  const { reminders, loading, stats, getUpcoming, getCompleted } = useReminders()
  const [filterView, setFilterView] = useState<"upcoming" | "completed" | "all">("upcoming")
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null)

  const getFilteredReminders = () => {
    switch (filterView) {
      case "upcoming":
        return getUpcoming()
      case "completed":
        return getCompleted()
      case "all":
      default:
        return reminders.sort((a, b) => 
          new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
        )
    }
  }

  if (!isOpen) return null

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                My Reminders
              </DialogTitle>
              <div className="flex items-center gap-2">
                {stats.overdue > 0 && (
                  <Badge className="bg-red-100 text-red-700">
                    {stats.overdue} overdue
                  </Badge>
                )}
                {stats.dueToday > 0 && (
                  <Badge className="bg-amber-100 text-amber-700">
                    {stats.dueToday} today
                  </Badge>
                )}
              </div>
            </div>
          </DialogHeader>

          {/* Filter Tabs */}
          <div className="flex-shrink-0 border-b">
            <div className="flex gap-1">
              {([
                { id: "upcoming", label: "Upcoming", count: stats.active },
                { id: "completed", label: "Completed", count: stats.completed },
                { id: "all", label: "All", count: stats.total },
              ] as const).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFilterView(tab.id)}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                    filterView === tab.id
                      ? "border-[hsl(var(--optavia-green))] text-[hsl(var(--optavia-green))]"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </div>
          </div>

          {/* Reminders List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[hsl(var(--optavia-green))] mx-auto" />
              </div>
            ) : getFilteredReminders().length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">✨</div>
                <p className="text-gray-500">
                  {filterView === "completed" 
                    ? "No completed reminders yet" 
                    : "No reminders — you're all caught up!"}
                </p>
              </div>
            ) : (
              getFilteredReminders().map((reminder) => (
                <ReminderCard
                  key={reminder.id}
                  reminder={reminder}
                  onEdit={() => {
                    setEditingReminder(reminder)
                    setShowCreateModal(true)
                  }}
                />
              ))
            )}
          </div>

          {/* Add Button */}
          <div className="flex-shrink-0 p-4 border-t">
            <Button
              onClick={() => setShowCreateModal(true)}
              className="w-full bg-[hsl(var(--optavia-green))]"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Reminder
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create/Edit Modal */}
      <CreateReminderModal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false)
          setEditingReminder(null)
        }}
        editingReminder={editingReminder}
      />
    </>
  )
}

// Bell icon for header with badge
export function RemindersBell() {
  const [isOpen, setIsOpen] = useState(false)
  const { stats } = useReminders()

  const badgeCount = stats.active
  const hasOverdue = stats.overdue > 0

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="relative p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
        title="Reminders"
      >
        <Bell className="h-5 w-5" />
        {badgeCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center text-xs font-bold text-white rounded-full bg-red-500">
            {badgeCount > 9 ? "9+" : badgeCount}
          </span>
        )}
      </button>
      <RemindersPanel isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  )
}
