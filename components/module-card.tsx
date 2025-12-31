"use client"

import { memo, useMemo } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ProgressBar } from "@/components/progress-bar"
import type { Module, UserData } from "@/lib/types"

interface ModuleCardProps {
  module: Module
  userData: UserData
  onClick: () => void
}

export const ModuleCard = memo(function ModuleCard({ module, userData, onClick }: ModuleCardProps) {
  const completedCount = useMemo(() => 
    module.resources.filter((resource) => userData.completedResources.includes(resource.id)).length,
    [module.resources, userData.completedResources]
  )

  const progress = useMemo(() => 
    module.resources.length > 0 ? Math.round((completedCount / module.resources.length) * 100) : 0,
    [module.resources.length, completedCount]
  )

  return (
    <Card
      className="p-4 sm:p-6 hover:shadow-lg transition-shadow cursor-pointer border border-optavia-border"
      onClick={onClick}
    >
      <div className="flex items-start gap-2 sm:gap-3 mb-3">
        <span className="text-2xl sm:text-3xl flex-shrink-0">{module.icon}</span>
        <div className="flex-1 min-w-0">
          <h3 className="font-heading font-bold text-base sm:text-lg text-optavia-dark mb-1 break-words">{module.title}</h3>
          <Badge variant="secondary" className="bg-[hsl(var(--optavia-green-light))] text-[hsl(var(--optavia-green))]">
            {module.category}
          </Badge>
        </div>
      </div>

      <p className="text-sm text-optavia-gray mb-4">{module.description}</p>

      <div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-optavia-gray">Progress</span>
          <span className="text-sm font-bold text-[hsl(var(--optavia-green))]">{progress}%</span>
        </div>
        <ProgressBar progress={progress} />
        <p className="text-xs text-optavia-light-gray mt-1">
          {completedCount} of {module.resources.length} completed
        </p>
      </div>
    </Card>
  )
})
