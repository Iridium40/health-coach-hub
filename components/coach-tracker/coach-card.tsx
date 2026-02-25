"use client"

import { memo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  CheckCircle,
  CalendarPlus,
  Edit2,
  Award,
  Trash2,
  Plus,
  Clock,
  Calendar,
  X,
} from "lucide-react"
import { ReminderButton } from "@/components/reminders-panel"
import { type CoachClient } from "@/hooks/use-coach-clients"
import {
  type Coach,
  type CoachStage,
  stageConfig,
  getRankTitle,
  daysSinceLaunch,
  weekNumber,
} from "@/hooks/use-coaches"

interface CoachCardProps {
  coach: Coach
  coachClients: CoachClient[]
  onEdit: (coach: Coach) => void
  onDelete: (coach: Coach) => void
  onRank: (coach: Coach) => void
  onStageChange: (coachId: string, newStage: CoachStage) => void
  onSchedule: (coach: Coach) => void
  onCompleteSchedule: (coach: Coach) => void
  onClearSchedule: (coach: Coach) => void
  onAddCoachClient: (
    coachId: string,
    payload: { label: string; notes?: string; is_potential_coach?: boolean }
  ) => Promise<boolean>
  onUpdateCoachClient: (
    coachClientId: string,
    updates: { label?: string; notes?: string | null; is_potential_coach?: boolean }
  ) => Promise<boolean>
  onDeleteCoachClient: (coachClientId: string) => Promise<boolean>
}

const STAGE_OPTIONS: { value: CoachStage; label: string; icon: string }[] = [
  { value: "new_coach", label: "New Coach", icon: "🌟" },
  { value: "building", label: "Building", icon: "🔨" },
  { value: "certified", label: "Certified", icon: "✅" },
  { value: "leader", label: "Leader", icon: "👑" },
]

export const CoachCard = memo(function CoachCard({
  coach,
  coachClients,
  onEdit,
  onDelete,
  onRank,
  onStageChange,
  onSchedule,
  onCompleteSchedule,
  onClearSchedule,
  onAddCoachClient,
  onUpdateCoachClient,
  onDeleteCoachClient,
}: CoachCardProps) {
  const stage = stageConfig[coach.stage]
  const days = daysSinceLaunch(coach.launch_date)
  const weeks = weekNumber(coach.launch_date)
  const rankTitle = getRankTitle(coach.rank)
  const [showAddClientForm, setShowAddClientForm] = useState(false)
  const [newCoachClientLabel, setNewCoachClientLabel] = useState("")
  const [newCoachClientNotes, setNewCoachClientNotes] = useState("")
  const [newCoachClientPotential, setNewCoachClientPotential] = useState(false)
  const [savingNewCoachClient, setSavingNewCoachClient] = useState(false)
  const [noteDrafts, setNoteDrafts] = useState<Record<string, string>>({})

  const launchDateFormatted = new Date(coach.launch_date + 'T00:00:00').toLocaleDateString("en-US", { month: "short", day: "numeric" })
  const potentialCount = coachClients.filter((entry) => entry.is_potential_coach).length

  const getNoteDraft = (coachClient: CoachClient) => {
    return noteDrafts[coachClient.id] ?? coachClient.notes ?? ""
  }

  const handleAddCoachClient = async () => {
    if (!newCoachClientLabel.trim() || savingNewCoachClient) return
    setSavingNewCoachClient(true)
    const success = await onAddCoachClient(coach.id, {
      label: newCoachClientLabel.trim(),
      notes: newCoachClientNotes.trim() || undefined,
      is_potential_coach: newCoachClientPotential,
    })
    setSavingNewCoachClient(false)
    if (!success) return

    setNewCoachClientLabel("")
    setNewCoachClientNotes("")
    setNewCoachClientPotential(false)
    setShowAddClientForm(false)
  }

  const handleSaveNotes = async (coachClient: CoachClient) => {
    await onUpdateCoachClient(coachClient.id, { notes: getNoteDraft(coachClient).trim() || null })
  }

  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardContent className="p-4">
        {/* Header Row: Day Badge + Coach Info + Stats */}
        <div className="flex items-start gap-3">
          {/* Day Badge */}
          <div
            className="w-14 h-14 rounded-xl flex flex-col items-center justify-center flex-shrink-0"
            style={{ backgroundColor: `${stage.color}12` }}
          >
            <div className="text-xs font-semibold" style={{ color: stage.color }}>
              DAY
            </div>
            <div className="text-xl font-bold" style={{ color: stage.color }}>
              {days}
            </div>
          </div>

          {/* Coach Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-gray-900">{coach.label}</span>
              <Badge
                variant="outline"
                className="text-[10px] px-1.5 py-0"
                style={{
                  borderColor: stage.borderColor,
                  color: stage.color,
                  background: stage.bg,
                }}
              >
                {stageConfig[coach.stage].icon} {stage.label}
              </Badge>
            </div>
            <div className="text-sm text-gray-500 mt-1">
              Week {weeks} • Launched {launchDateFormatted}
            </div>
            {/* Rank Badge - clickable */}
            <button
              onClick={() => onRank(coach)}
              className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-md bg-purple-50 hover:bg-purple-100 transition-colors cursor-pointer"
            >
              <span className="text-[10px]">🏅</span>
              <span className="text-[11px] font-bold text-purple-600">{rankTitle}</span>
            </button>
          </div>

          {/* Stats */}
          <div className="flex gap-3 flex-shrink-0">
            <div className="text-center">
              <div className="text-lg font-extrabold text-green-600">{coach.clients_count}</div>
              <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Clients</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-extrabold text-blue-600">{coach.prospects_count}</div>
              <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Prospects</div>
            </div>
          </div>
        </div>

        {/* Scheduled Call/Zoom Info */}
        {coach.next_scheduled_at && (
          <div className="mt-3 flex items-center gap-2 flex-wrap">
            <Badge
              className={`flex items-center gap-1.5 px-2.5 py-1 text-sm font-medium ${
                new Date(coach.next_scheduled_at) < new Date()
                  ? "bg-red-100 text-red-700 border border-red-200"
                  : "bg-green-100 text-green-700 border border-green-200"
              }`}
            >
              <Calendar className="h-3.5 w-3.5" />
              <span>1:1:</span>
              {new Date(coach.next_scheduled_at).toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
              })}{" "}
              {new Date(coach.next_scheduled_at).toLocaleTimeString("en-US", {
                hour: "numeric",
                minute: "2-digit",
              })}
            </Badge>
            {new Date(coach.next_scheduled_at).setHours(0, 0, 0, 0) <=
              new Date().setHours(0, 0, 0, 0) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onCompleteSchedule(coach)}
                className="h-7 w-7 p-0 bg-green-100 hover:bg-green-200 rounded-full"
                title="Mark call as completed"
              >
                <CheckCircle className="h-4 w-4 text-green-600" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onClearSchedule(coach)}
              className="h-7 w-7 p-0 bg-red-100 hover:bg-red-200 rounded-full"
              title="Cancel scheduled call"
            >
              <X className="h-4 w-4 text-red-600" />
            </Button>
          </div>
        )}

        {/* Primary Action Buttons */}
        <div className="mt-4 flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 text-purple-600 border-purple-200 hover:bg-purple-50"
            onClick={() => onSchedule(coach)}
          >
            <CalendarPlus className="h-4 w-4 mr-1" />
            <span className="text-xs sm:text-sm">Schedule</span>
          </Button>
        </div>

        {/* Coach's Clients */}
        <div className="mt-3 pt-3 border-t space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-800">Coach's Clients</span>
              <Badge className="bg-blue-100 text-blue-700">{coachClients.length}</Badge>
              <Badge className="bg-purple-100 text-purple-700">{potentialCount} Potential</Badge>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAddClientForm((prev) => !prev)}
            >
              <Plus className="h-4 w-4 sm:mr-1" />
              <span className="hidden sm:inline">Add Client</span>
            </Button>
          </div>

          {showAddClientForm && (
            <div className="rounded-lg border bg-gray-50 p-3 space-y-2">
              <Input
                value={newCoachClientLabel}
                onChange={(e) => setNewCoachClientLabel(e.target.value)}
                placeholder="Client nickname/label"
                maxLength={50}
              />
              <Textarea
                value={newCoachClientNotes}
                onChange={(e) => setNewCoachClientNotes(e.target.value)}
                placeholder="Notes about this potential coach..."
                rows={2}
              />
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={newCoachClientPotential}
                  onChange={(e) => setNewCoachClientPotential(e.target.checked)}
                />
                Mark as potential future coach
              </label>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowAddClientForm(false)
                    setNewCoachClientLabel("")
                    setNewCoachClientNotes("")
                    setNewCoachClientPotential(false)
                  }}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleAddCoachClient}
                  disabled={!newCoachClientLabel.trim() || savingNewCoachClient}
                >
                  {savingNewCoachClient ? "Saving..." : "Save Client"}
                </Button>
              </div>
            </div>
          )}

          {coachClients.length === 0 ? (
            <p className="text-sm text-gray-500">No clients tracked under this coach yet.</p>
          ) : (
            <div className="space-y-2">
              {coachClients.map((coachClient) => (
                <div key={coachClient.id} className="rounded-lg border bg-white p-3 space-y-2">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-gray-900">{coachClient.label}</span>
                      {coachClient.is_potential_coach ? (
                        <Badge className="bg-purple-100 text-purple-700">Future Coach Candidate</Badge>
                      ) : (
                        <Badge className="bg-gray-100 text-gray-600">Client</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onUpdateCoachClient(coachClient.id, { is_potential_coach: !coachClient.is_potential_coach })}
                      >
                        {coachClient.is_potential_coach ? "Unmark Potential" : "Mark Potential"}
                      </Button>
                      <ReminderButton
                        entityType="coach_client"
                        entityId={coachClient.id}
                        entityName={coachClient.label}
                        variant="outline"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onDeleteCoachClient(coachClient.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        title="Remove client"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock className="h-3.5 w-3.5" />
                    Added {new Date(coachClient.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </div>
                  <Textarea
                    value={getNoteDraft(coachClient)}
                    onChange={(e) => setNoteDrafts((prev) => ({ ...prev, [coachClient.id]: e.target.value }))}
                    placeholder="Notes..."
                    rows={2}
                  />
                  <div className="flex justify-end">
                    <Button variant="outline" size="sm" onClick={() => handleSaveNotes(coachClient)}>
                      Save Notes
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Secondary Actions: Stage Dropdown + Edit + Rank + Remove */}
        <div className="mt-3 pt-3 border-t flex flex-wrap items-center gap-2">
          <Select
            value={coach.stage}
            onValueChange={(value) => onStageChange(coach.id, value as CoachStage)}
          >
            <SelectTrigger className="w-full sm:w-auto sm:flex-1 sm:min-w-0 h-9 text-xs sm:text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STAGE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.icon} {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(coach)}
              title="Edit coach"
            >
              <Edit2 className="h-4 w-4 sm:mr-1" />
              <span className="hidden sm:inline">Edit</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onRank(coach)}
              title="Update rank"
            >
              <Award className="h-4 w-4 sm:mr-1" />
              <span className="hidden sm:inline">Rank</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(coach)}
              title="Remove coach"
              className="text-red-500 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4 sm:mr-1" />
              <span className="hidden sm:inline">Remove</span>
            </Button>
          </div>
        </div>

        {/* Notes - clickable to edit */}
        <button
          onClick={() => onEdit(coach)}
          className="mt-3 pt-3 border-t w-full text-left text-sm hover:bg-gray-50 rounded-b-lg transition-colors cursor-pointer"
        >
          {coach.notes ? (
            <span className="text-gray-600">📝 {coach.notes}</span>
          ) : (
            <span className="text-gray-400 italic">📝 Add notes...</span>
          )}
        </button>
      </CardContent>
    </Card>
  )
})
