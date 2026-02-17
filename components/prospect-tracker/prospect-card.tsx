"use client"

import { useState, memo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Calendar,
  Clock,
  Trash2,
  Edit2,
  ArrowRight,
  CalendarPlus,
  X,
  Send,
  CheckCircle,
  Lightbulb,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import { ReminderButton } from "@/components/reminders-panel"
import { ProspectContextualResources } from "@/components/resources"
import {
  statusConfig,
  sourceOptions,
  actionTypeLabels,
  type ProspectStatus,
  type Prospect,
} from "@/hooks/use-prospects"

interface ProspectCardProps {
  prospect: Prospect
  daysUntil: number | null
  onUpdateStatus: (id: string, status: ProspectStatus) => void
  onUpdateProspect: (id: string, updates: Partial<Prospect>) => Promise<boolean>
  onDelete: (id: string) => void
  onEdit: (prospect: Prospect) => void
  onCheckIn: (prospect: Prospect) => void
  onScheduleHA: (prospect: Prospect) => void
  onSendHASMS: (prospect: Prospect) => void
  onClearHA: (prospectId: string) => void
  onToast: (options: { title: string; description: string; variant?: "destructive" }) => void
}

export const ProspectCard = memo(function ProspectCard({
  prospect,
  daysUntil,
  onUpdateStatus,
  onUpdateProspect,
  onDelete,
  onEdit,
  onCheckIn,
  onScheduleHA,
  onSendHASMS,
  onClearHA,
  onToast,
}: ProspectCardProps) {
  const [showResources, setShowResources] = useState(false)
  const config = statusConfig[prospect.status]
  const isOverdue = daysUntil !== null && daysUntil < 0

  // Calculate days since last contact
  const daysSinceLastAction = prospect.last_action
    ? Math.floor(
        (new Date().setHours(0, 0, 0, 0) -
          new Date(prospect.last_action + "T00:00:00").getTime()) /
          (1000 * 60 * 60 * 24)
      )
    : null
  const needsCheckIn = daysSinceLastAction !== null && daysSinceLastAction >= 7

  const handleCompleteHA = async () => {
    await onUpdateProspect(prospect.id, {
      ha_scheduled_at: null,
      next_action: null,
    })
    onToast({
      title: "✅ HA Completed!",
      description: "Scheduled HA has been cleared.",
    })
  }

  return (
    <Card
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
              <span>
                {sourceOptions.find((s) => s.value === prospect.source)?.label}
              </span>
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
                      : "bg-purple-100 text-purple-700 border border-purple-200"
                  }`}
                >
                  <Calendar className="h-3.5 w-3.5" />
                  <span>HA:</span>
                  {new Date(prospect.ha_scheduled_at).toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  })}{" "}
                  {new Date(prospect.ha_scheduled_at).toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </Badge>
                {prospect.phone && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onSendHASMS(prospect)}
                    className="h-7 w-7 p-0 text-purple-500 hover:text-purple-700 hover:bg-purple-50"
                    title="Send SMS reminder"
                  >
                    <Send className="h-3 w-3" />
                  </Button>
                )}
                {/* Complete HA Button - only show if HA date is today or past */}
                {new Date(prospect.ha_scheduled_at).setHours(0, 0, 0, 0) <=
                  new Date().setHours(0, 0, 0, 0) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCompleteHA}
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
                  onClick={() => onClearHA(prospect.id)}
                  className="h-7 w-7 p-0 bg-red-100 hover:bg-red-200 rounded-full"
                  title="Cancel scheduled HA"
                >
                  <X className="h-4 w-4 text-red-600" />
                </Button>
              </>
            ) : (
              prospect.next_action && (
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
              )
            )}
          </div>
        )}

        {/* Primary Action Buttons */}
        {prospect.status !== "converted" && prospect.status !== "coach" && (
          <div className="mt-4 flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onCheckIn(prospect)}
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
              onClick={() => onScheduleHA(prospect)}
              className="flex-1 text-purple-600 border-purple-200 hover:bg-purple-50"
              title="Schedule HA"
            >
              <CalendarPlus className="h-4 w-4 mr-1" />
              <span className="text-xs sm:text-sm">Schedule HA</span>
            </Button>
          </div>
        )}

        {/* Secondary Actions: Status Dropdown + Edit + Remind + Delete */}
        <div className="mt-3 pt-3 border-t flex flex-wrap items-center gap-2">
          <Select
            value={prospect.status}
            onValueChange={(value) =>
              onUpdateStatus(prospect.id, value as ProspectStatus)
            }
          >
            <SelectTrigger className="w-full sm:w-auto sm:flex-1 sm:min-w-0 h-9 text-xs sm:text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(statusConfig)
                .filter(
                  ([key]) =>
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
              onClick={() => onEdit(prospect)}
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
              onClick={() => onDelete(prospect.id)}
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
          onClick={() => onEdit(prospect)}
          className="mt-3 pt-3 border-t w-full text-left text-sm hover:bg-gray-50 rounded-b-lg transition-colors cursor-pointer"
        >
          {prospect.notes ? (
            <span className="text-gray-600">📝 {prospect.notes}</span>
          ) : (
            <span className="text-gray-400 italic">📝 Add notes...</span>
          )}
        </button>

        {/* Contextual Resources Section */}
        <Collapsible open={showResources} onOpenChange={setShowResources}>
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="w-full mt-3 pt-3 border-t flex items-center justify-center gap-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            >
              <Lightbulb className="h-4 w-4 text-amber-500" />
              <span className="text-xs">Helpful Resources for This Stage</span>
              {showResources ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-3">
            <ProspectContextualResources
              stage={prospect.status}
              prospectName={prospect.label}
              compact
            />
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  )
})
