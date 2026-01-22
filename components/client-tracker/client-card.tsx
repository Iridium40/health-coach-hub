"use client"

import { useState, memo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Calendar,
  Star,
  MessageSquare,
  CalendarPlus,
  Send,
  Repeat,
  CheckCircle,
  Circle,
  X,
  Lightbulb,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import { ReminderButton } from "@/components/reminders-panel"
import { ClientContextualResources } from "@/components/resources"
import { getDayPhase, getProgramDay, type Client, type ClientStatus } from "@/hooks/use-clients"
import { isMilestoneDay } from "@/hooks/use-touchpoint-templates"

interface ClientCardProps {
  client: Client
  onToggleTouchpoint: (id: string, type: "am_done" | "pm_done") => Promise<boolean>
  onToggleCoachProspect: (id: string) => Promise<boolean>
  onUpdateStatus: (id: string, status: ClientStatus) => Promise<boolean>
  onUpdateClient: (id: string, updates: Partial<Client>) => Promise<boolean>
  onOpenTextTemplates: (client: Client) => void
  onOpenScheduleModal: (client: Client) => void
  onSendSMS: (client: Client) => void
  onClearSchedule: (clientId: string) => void
  needsAttention: (client: Client) => boolean
}

export const ClientCard = memo(function ClientCard({
  client,
  onToggleTouchpoint,
  onToggleCoachProspect,
  onUpdateStatus,
  onUpdateClient,
  onOpenTextTemplates,
  onOpenScheduleModal,
  onSendSMS,
  onClearSchedule,
  needsAttention,
}: ClientCardProps) {
  const [showResources, setShowResources] = useState(false)
  const programDay = getProgramDay(client.start_date)
  const phase = getDayPhase(programDay)
  const attention = needsAttention(client)

  const handleCompleteCheckIn = async () => {
    await onUpdateClient(client.id, {
      next_scheduled_at: null,
      recurring_frequency: null,
      recurring_day: null,
      recurring_time: null,
    })
    await onToggleTouchpoint(client.id, "am_done")
  }

  return (
    <Card
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
                <Badge style={{ backgroundColor: phase.bg, color: phase.color }}>
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
                  })}{" "}
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
                    onClick={() => onSendSMS(client)}
                    className="h-7 w-7 p-0 text-green-500 hover:text-green-700 hover:bg-green-50"
                    title="Send SMS reminder"
                  >
                    <Send className="h-3 w-3" />
                  </Button>
                )}
                {/* Complete Check-in Button - only show if date is today or past */}
                {new Date(client.next_scheduled_at!).setHours(0, 0, 0, 0) <=
                  new Date().setHours(0, 0, 0, 0) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCompleteCheckIn}
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
                  onClick={() => onClearSchedule(client.id)}
                  className="h-7 w-7 p-0 bg-red-100 hover:bg-red-200 rounded-full"
                  title="Cancel scheduled check-in"
                >
                  <X className="h-4 w-4 text-red-600" />
                </Button>
              </div>
            )}

            {/* Action Buttons - All 3 on same row */}
            <div className="flex gap-2">
              {/* Check-in Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => onToggleTouchpoint(client.id, "am_done")}
                className={`flex-1 ${
                  client.am_done
                    ? "bg-green-100 text-green-700 border-green-300 hover:bg-green-200"
                    : "text-green-600 border-green-200 hover:bg-green-50"
                }`}
              >
                {client.am_done ? (
                  <CheckCircle className="h-4 w-4 mr-1" />
                ) : (
                  <Circle className="h-4 w-4 mr-1" />
                )}
                <span className="text-xs sm:text-sm">
                  {client.am_done ? "Checked In" : "Check In"}
                </span>
              </Button>
              {/* Text Button - highlighted for milestones */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => onOpenTextTemplates(client)}
                className={`flex-1 ${
                  isMilestoneDay(programDay)
                    ? "bg-amber-100 text-amber-700 border-amber-300 hover:bg-amber-200 animate-pulse"
                    : "text-blue-600 border-blue-200 hover:bg-blue-50"
                }`}
              >
                <MessageSquare className="h-4 w-4 mr-1" />
                <span className="text-xs sm:text-sm">
                  {isMilestoneDay(programDay) ? "Celebrate!" : "Text"}
                </span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onOpenScheduleModal(client)}
                className="flex-1 text-purple-600 border-purple-200 hover:bg-purple-50"
              >
                <CalendarPlus className="h-4 w-4 mr-1" />
                <span className="text-xs sm:text-sm">Schedule</span>
              </Button>
            </div>
          </div>
        )}

        {/* Secondary Actions: Coach, Remind & Pause/Resume */}
        <div className="mt-3 pt-3 border-t flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onToggleCoachProspect(client.id)}
            className={client.is_coach_prospect ? "bg-orange-50 text-orange-700" : ""}
          >
            <Star className="h-4 w-4 sm:mr-1" />
            <span className="hidden sm:inline">
              {client.is_coach_prospect ? "Coach" : "Coach?"}
            </span>
          </Button>
          <ReminderButton
            entityType="client"
            entityId={client.id}
            entityName={client.label}
            variant="outline"
          />
          {client.status === "active" ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onUpdateStatus(client.id, "paused")}
            >
              Pause
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onUpdateStatus(client.id, "active")}
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

        {/* Contextual Resources Section */}
        <Collapsible open={showResources} onOpenChange={setShowResources}>
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="w-full mt-3 pt-3 border-t flex items-center justify-center gap-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            >
              <Lightbulb className="h-4 w-4 text-amber-500" />
              <span className="text-xs">Day {programDay} Resources</span>
              {showResources ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-3">
            <ClientContextualResources
              programDay={programDay}
              clientName={client.label}
              compact
            />
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  )
})
