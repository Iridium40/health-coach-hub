"use client"

import React from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Users, Calendar, BookOpen, UtensilsCrossed, UserPlus, Heart,
  Clock, Target, Sparkles, ChevronRight
} from "lucide-react"

interface QuickActionsProps {
  overdueProspects: number
  clientsNeedingCheckIn: number
  haScheduledToday: number
  trainingPercentage: number
}

export function QuickActions({
  overdueProspects,
  clientsNeedingCheckIn,
  haScheduledToday,
  trainingPercentage,
}: QuickActionsProps) {
  // Determine which actions to show based on current state
  const actions: Array<{
    id: string
    label: string
    description: string
    href: string
    icon: React.ReactNode
    priority: "high" | "medium" | "normal"
    bgClass: string
    iconClass: string
  }> = []

  // High priority: Overdue 100's list follow-ups
  if (overdueProspects > 0) {
    actions.push({
      id: "overdue-prospects",
      label: "Follow Up on 100's List",
      description: `${overdueProspects} overdue`,
      href: "/prospect-tracker",
      icon: <Clock className="h-5 w-5" />,
      priority: "high",
      bgClass: "bg-gradient-to-br from-red-50 to-orange-50 border-red-200 hover:from-red-100 hover:to-orange-100",
      iconClass: "text-red-500",
    })
  }

  // High priority: Clients needing check-ins
  if (clientsNeedingCheckIn > 0) {
    actions.push({
      id: "client-checkins",
      label: "Client Check-ins Needed",
      description: `${clientsNeedingCheckIn} client${clientsNeedingCheckIn > 1 ? 's' : ''}`,
      href: "/client-tracker",
      icon: <Heart className="h-5 w-5" />,
      priority: "high",
      bgClass: "bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200 hover:from-orange-100 hover:to-amber-100",
      iconClass: "text-orange-500",
    })
  }

  // Medium priority: HA scheduled today
  if (haScheduledToday > 0) {
    actions.push({
      id: "ha-today",
      label: "Prepare for Health Assessment",
      description: `${haScheduledToday} scheduled today`,
      href: "/prospect-tracker?status=ha_scheduled",
      icon: <Target className="h-5 w-5" />,
      priority: "medium",
      bgClass: "bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200 hover:from-purple-100 hover:to-violet-100",
      iconClass: "text-purple-500",
    })
  }

  // Medium priority: Training not complete
  if (trainingPercentage < 50) {
    actions.push({
      id: "continue-training",
      label: "Continue Training",
      description: `${trainingPercentage}% complete`,
      href: "/training",
      icon: <BookOpen className="h-5 w-5" />,
      priority: "medium",
      bgClass: "bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 hover:from-blue-100 hover:to-indigo-100",
      iconClass: "text-blue-500",
    })
  }

  // Default actions if no urgent items
  if (actions.length < 4) {
    const defaultActions = [
      {
        id: "add-prospect",
        label: "Add to 100's List",
        description: "Grow your pipeline",
        href: "/prospect-tracker",
        icon: <UserPlus className="h-5 w-5" />,
        priority: "normal" as const,
        bgClass: "bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 hover:from-blue-100 hover:to-indigo-100",
        iconClass: "text-blue-500",
      },
      {
        id: "add-client",
        label: "Add Client",
        description: "New client onboarding",
        href: "/client-tracker",
        icon: <Users className="h-5 w-5" />,
        priority: "normal" as const,
        bgClass: "bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 hover:from-green-100 hover:to-emerald-100",
        iconClass: "text-green-500",
      },
      {
        id: "view-calendar",
        label: "View Calendar",
        description: "Check your schedule",
        href: "/calendar",
        icon: <Calendar className="h-5 w-5" />,
        priority: "normal" as const,
        bgClass: "bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200 hover:from-purple-100 hover:to-violet-100",
        iconClass: "text-purple-500",
      },
      {
        id: "meal-plan",
        label: "Create Meal Plan",
        description: "Help clients succeed",
        href: "/meal-planner",
        icon: <UtensilsCrossed className="h-5 w-5" />,
        priority: "normal" as const,
        bgClass: "bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200 hover:from-orange-100 hover:to-amber-100",
        iconClass: "text-orange-500",
      },
    ]

    // Add default actions until we have 4
    for (const action of defaultActions) {
      if (actions.length >= 4) break
      if (!actions.find(a => a.id === action.id)) {
        actions.push(action)
      }
    }
  }

  // Only show first 4 actions
  const displayActions = actions.slice(0, 4)

  return (
    <Card className="bg-white border border-gray-200 shadow-sm h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2 text-optavia-dark">
          <Sparkles className="h-5 w-5 text-amber-500" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 flex-1">
        <div className="grid grid-cols-2 gap-3 h-full">
          {displayActions.map((action) => (
            <Link key={action.id} href={action.href} className="flex h-full">
              <div
                className={`w-full min-h-[120px] p-4 rounded-lg border transition-all cursor-pointer flex flex-col justify-center items-center text-center ${action.bgClass}`}
              >
                <div className={`${action.iconClass} mb-2`}>
                  {React.cloneElement(action.icon as React.ReactElement<{ className?: string }>, { className: "h-8 w-8" })}
                </div>
                <p className="text-sm font-medium text-optavia-dark leading-tight">{action.label}</p>
                <p className="text-xs text-gray-500 mt-1">{action.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
