"use client"

import Link from "next/link"
import { Card } from "@/components/ui/card"
import { ChevronRight, Info } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import type { PipelineStage as PipelineStageType } from "@/hooks/use-pipeline"

// Stage descriptions for the info popups
const STAGE_DESCRIPTIONS: Record<string, { title: string; description: string }> = {
  new: {
    title: "New",
    description: "First contact made — social media, referral, warm market, or someone who expressed curiosity. Time for initial outreach!",
  },
  interested: {
    title: "Interested",
    description: "Prospect has engaged back positively. They've asked questions or expressed openness. Build rapport and introduce the Health Assessment.",
  },
  ha_scheduled: {
    title: "HA Scheduled",
    description: "Health Assessment is booked. This is the critical conversion point — send reminders and have program materials ready!",
  },
  client_won: {
    title: "Client Won!",
    description: "They said yes and are starting the program! Time for onboarding, first order, and setting expectations.",
  },
  client: {
    title: "Client",
    description: "Active on the program, receiving regular coaching support. Weekly check-ins, meal plan support, and habit building.",
  },
  goal_achieved: {
    title: "Goal Achieved",
    description: "Client has hit their primary health goal! Celebrate the milestone and transition to Optimal Health and the 'pay it forward' concept.",
  },
  future_coach: {
    title: "Future Coach",
    description: "Client has expressed interest in becoming a coach. Share business opportunity details and begin mentorship conversations.",
  },
  coach_launched: {
    title: "Coach Launched!",
    description: "They've officially signed up as an OPTAVIA coach! Onboard into your team with a 30-day game plan and upline resources.",
  },
}

interface PipelineStageProps {
  stage: PipelineStageType
  isFirst?: boolean
  isLast?: boolean
}

export function PipelineStage({ stage, isFirst, isLast }: PipelineStageProps) {
  // Determine link based on stage
  const getLink = () => {
    const clientStages = ["client", "goal_achieved", "future_coach", "coach_launched"]
    if (clientStages.includes(stage.id)) {
      return "/client-tracker"
    }
    return `/prospect-tracker?status=${stage.id}`
  }

  const stageInfo = STAGE_DESCRIPTIONS[stage.id]

  return (
    <div className="flex items-center">
      <Link href={getLink()} className="block group">
        <Card
          className="p-4 min-w-[120px] hover:shadow-lg transition-all cursor-pointer border-2 group-hover:scale-105 relative"
          style={{ borderColor: stage.color }}
        >
          {/* Info icon in top-left corner */}
          {stageInfo && (
            <div 
              className="absolute top-1 left-1" 
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
              }}
            >
              <TooltipProvider delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button 
                      type="button"
                      className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                      }}
                    >
                      <Info className="h-3.5 w-3.5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent 
                    side="bottom" 
                    align="start"
                    className="max-w-[220px] p-3 bg-white/95 backdrop-blur-sm shadow-lg border border-gray-200 z-50"
                  >
                    <p className="font-semibold text-gray-700 mb-1">{stageInfo.title}</p>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      {stageInfo.description}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          )}

          <div className="text-center">
            <div className="text-2xl mb-1">{stage.icon}</div>
            <div
              className="text-3xl font-bold mb-1"
              style={{ color: stage.color }}
            >
              {stage.count}
            </div>
            <div className="text-xs font-medium text-gray-600 uppercase tracking-wide">
              {stage.label}
            </div>
          </div>

          {/* Click hint on hover */}
          <div className="mt-2 text-[10px] text-gray-400 text-center opacity-0 group-hover:opacity-100 transition-opacity">
            Click to view
          </div>
        </Card>
      </Link>

      {/* Arrow between stages */}
      {!isLast && (
        <div className="px-2 text-gray-300">
          <ChevronRight className="h-6 w-6" />
        </div>
      )}
    </div>
  )
}
