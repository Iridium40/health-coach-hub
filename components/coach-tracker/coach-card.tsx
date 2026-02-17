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
  CheckCircle,
  MessageSquare,
  CalendarPlus,
  Edit2,
  Award,
  ArrowUpRight,
  ArrowDownRight,
  ChevronDown,
  ChevronUp,
  Trash2,
} from "lucide-react"
import { ReminderButton } from "@/components/reminders-panel"
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
  onEdit: (coach: Coach) => void
  onDelete: (coach: Coach) => void
  onRank: (coach: Coach) => void
  onCheckIn: (coach: Coach) => void
  onMove: (coachId: string, newStage: CoachStage) => void
  onText: (coach: Coach) => void
  onSchedule: (coach: Coach) => void
}

const STAGES_ORDER: CoachStage[] = ['new_coach', 'building', 'certified', 'leader']

export const CoachCard = memo(function CoachCard({
  coach,
  onEdit,
  onDelete,
  onRank,
  onCheckIn,
  onMove,
  onText,
  onSchedule,
}: CoachCardProps) {
  const [expanded, setExpanded] = useState(false)
  const stage = stageConfig[coach.stage]
  const days = daysSinceLaunch(coach.launch_date)
  const weeks = weekNumber(coach.launch_date)
  const rankTitle = getRankTitle(coach.rank)
  const stageIdx = STAGES_ORDER.indexOf(coach.stage)

  const launchDateFormatted = new Date(coach.launch_date + 'T00:00:00').toLocaleDateString("en-US", { month: "short", day: "numeric" })

  const lastCheckInText = coach.last_check_in
    ? new Date(coach.last_check_in + 'T00:00:00').toLocaleDateString("en-US", { month: "short", day: "numeric" })
    : "Never"

  const needsCheckIn = !coach.last_check_in || (() => {
    const last = new Date(coach.last_check_in + 'T00:00:00')
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    return (today.getTime() - last.getTime()) / (1000 * 60 * 60 * 24) >= 7
  })()

  return (
    <Card
      className={`transition-shadow hover:shadow-md ${
        needsCheckIn ? "border-amber-300 bg-amber-50/30" : "border-gray-200"
      }`}
    >
      <Collapsible open={expanded} onOpenChange={setExpanded}>
        <CardContent className="p-4">
          {/* Top Row */}
          <div className="flex items-start gap-3">
            {/* Day Badge */}
            <div className="flex-shrink-0 text-center">
              <div
                className="w-12 h-12 rounded-full flex flex-col items-center justify-center"
                style={{
                  border: `2.5px solid ${stage.color}`,
                  background: `${stage.color}08`,
                }}
              >
                <span
                  className="text-[8px] font-bold leading-none tracking-wider"
                  style={{ color: stage.color }}
                >
                  DAY
                </span>
                <span
                  className="text-lg font-extrabold leading-tight"
                  style={{ color: stage.color }}
                >
                  {days}
                </span>
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-base text-gray-900 truncate">
                  {coach.label}
                </span>
                <Badge
                  variant="outline"
                  className="text-[10px] px-1.5 py-0"
                  style={{
                    borderColor: stage.borderColor,
                    color: stage.color,
                    background: stage.bg,
                  }}
                >
                  {stage.icon} {stage.label}
                </Badge>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Week {weeks} · Launched {launchDateFormatted}
              </p>
              {/* Rank Badge - clickable */}
              <button
                onClick={() => onRank(coach)}
                className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-md bg-purple-50 hover:bg-purple-100 transition-colors cursor-pointer"
              >
                <span className="text-[10px]">🏅</span>
                <span className="text-[11px] font-bold text-purple-600">
                  {rankTitle}
                </span>
                <ChevronDown className="h-2.5 w-2.5 text-gray-400" />
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

          {/* Notes Preview */}
          {coach.notes && !expanded && (
            <p className="text-xs text-gray-500 mt-2 pl-[60px] line-clamp-1">
              {coach.notes}
            </p>
          )}

          {/* Primary Actions */}
          <div className="flex gap-2 mt-3 pl-[60px]">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 text-xs border-green-200 text-green-700 hover:bg-green-50"
              onClick={() => onCheckIn(coach)}
            >
              <CheckCircle className="h-3.5 w-3.5 mr-1" />
              Check In
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 text-xs"
              onClick={() => onText(coach)}
            >
              <MessageSquare className="h-3.5 w-3.5 mr-1" />
              Text
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 text-xs"
              onClick={() => onSchedule(coach)}
            >
              <CalendarPlus className="h-3.5 w-3.5 mr-1" />
              Schedule
            </Button>
          </div>

          {/* Expand/Collapse Toggle */}
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="w-full mt-2 text-xs text-gray-400 hover:text-gray-600"
            >
              {expanded ? (
                <>
                  <ChevronUp className="h-3 w-3 mr-1" /> Less
                </>
              ) : (
                <>
                  <ChevronDown className="h-3 w-3 mr-1" /> More
                </>
              )}
            </Button>
          </CollapsibleTrigger>

          {/* Expanded Content */}
          <CollapsibleContent>
            <div className="mt-2 pt-2 border-t border-gray-100 pl-[60px] space-y-3">
              {/* Notes full */}
              {coach.notes && (
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Notes</p>
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">{coach.notes}</p>
                </div>
              )}

              {/* Last Check-in */}
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span>
                  Last check-in: <strong className={needsCheckIn ? "text-amber-600" : "text-green-600"}>
                    {lastCheckInText}
                  </strong>
                </span>
                {coach.next_scheduled_at && (
                  <span>
                    Next: <strong className="text-blue-600">
                      {new Date(coach.next_scheduled_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </strong>
                  </span>
                )}
              </div>

              {/* Secondary Actions */}
              <div className="flex gap-1.5 flex-wrap">
                <Button variant="outline" size="sm" className="text-xs h-7" onClick={() => onEdit(coach)}>
                  <Edit2 className="h-3 w-3 mr-1" /> Edit
                </Button>
                <Button variant="outline" size="sm" className="text-xs h-7" onClick={() => onRank(coach)}>
                  <Award className="h-3 w-3 mr-1" /> Rank
                </Button>
                <ReminderButton
                  entityType="coach"
                  entityId={coach.id}
                  entityLabel={coach.label}
                />
                {/* Stage movement buttons */}
                {stageIdx < STAGES_ORDER.length - 1 && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs h-7"
                    style={{
                      borderColor: stageConfig[STAGES_ORDER[stageIdx + 1]].borderColor,
                      color: stageConfig[STAGES_ORDER[stageIdx + 1]].color,
                    }}
                    onClick={() => onMove(coach.id, STAGES_ORDER[stageIdx + 1])}
                  >
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                    {stageConfig[STAGES_ORDER[stageIdx + 1]].label}
                  </Button>
                )}
                {stageIdx > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs h-7"
                    onClick={() => onMove(coach.id, STAGES_ORDER[stageIdx - 1])}
                  >
                    <ArrowDownRight className="h-3 w-3 mr-1" />
                    {stageConfig[STAGES_ORDER[stageIdx - 1]].label}
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs h-7 text-red-500 border-red-200 hover:bg-red-50"
                  onClick={() => onDelete(coach)}
                >
                  <Trash2 className="h-3 w-3 mr-1" /> Remove
                </Button>
              </div>
            </div>
          </CollapsibleContent>
        </CardContent>
      </Collapsible>
    </Card>
  )
})
