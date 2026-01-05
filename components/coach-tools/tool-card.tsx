"use client"

import { useState, ReactNode } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ChevronDown, ChevronUp, Maximize2, Pin } from "lucide-react"
import type { LucideIcon } from "lucide-react"

interface ToolCardProps {
  id: string
  title: string
  description: string
  icon: LucideIcon
  children: ReactNode
  defaultExpanded?: boolean
  expandMode?: "inline" | "dialog"
  isPinned?: boolean
  onTogglePin?: () => void
}

export function ToolCard({
  id = "",
  title,
  description,
  icon: Icon,
  children,
  defaultExpanded = false,
  expandMode = "inline",
  isPinned = false,
  onTogglePin,
}: ToolCardProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleToggle = () => {
    if (expandMode === "dialog") {
      setIsDialogOpen(true)
    } else {
      setIsExpanded(!isExpanded)
    }
  }

  return (
    <>
      <Card className={`bg-white border-2 transition-all duration-300 hover:shadow-lg overflow-hidden ${
        isPinned 
          ? "border-[hsl(var(--optavia-green))] bg-[hsl(var(--optavia-green-light))]" 
          : "border-gray-200 hover:border-[hsl(var(--optavia-green))]"
      }`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-[hsl(var(--optavia-green-light))]">
                <Icon className="h-5 w-5 text-[hsl(var(--optavia-green))]" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-lg text-optavia-dark">{title}</CardTitle>
                <CardDescription className="text-sm text-optavia-gray mt-1">
                  {description}
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {onTogglePin && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation()
                    onTogglePin()
                  }}
                  className={`h-8 w-8 ${
                    isPinned
                      ? "text-[hsl(var(--optavia-green))] hover:text-red-500 hover:bg-red-50"
                      : "text-gray-400 hover:text-[hsl(var(--optavia-green))] hover:bg-[hsl(var(--optavia-green-light))]"
                  }`}
                  title={isPinned ? "Unpin from Quick Links" : "Pin to Quick Links"}
                >
                  <Pin className={`h-4 w-4 ${isPinned ? "fill-current" : ""}`} />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={handleToggle}
                className="h-8 w-8 text-optavia-gray hover:text-[hsl(var(--optavia-green))] hover:bg-[hsl(var(--optavia-green-light))]"
              >
                {expandMode === "dialog" ? (
                  <Maximize2 className="h-4 w-4" />
                ) : isExpanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </CardHeader>

        {/* Inline expansion */}
        {expandMode === "inline" && isExpanded && (
          <CardContent className="pt-0 border-t border-gray-100">
            {children}
          </CardContent>
        )}

        {/* Collapsed state - show open button */}
        {expandMode === "inline" && !isExpanded && (
          <CardContent className="pt-0">
            <Button
              variant="outline"
              size="sm"
              onClick={handleToggle}
              className="w-full border-gray-300 text-optavia-dark hover:bg-[hsl(var(--optavia-green-light))] hover:border-[hsl(var(--optavia-green))] hover:text-[hsl(var(--optavia-green))]"
            >
              Open Tool
            </Button>
          </CardContent>
        )}

        {/* Dialog mode - always show open button */}
        {expandMode === "dialog" && (
          <CardContent className="pt-0">
            <Button
              variant="outline"
              size="sm"
              onClick={handleToggle}
              className="w-full border-gray-300 text-optavia-dark hover:bg-[hsl(var(--optavia-green-light))] hover:border-[hsl(var(--optavia-green))] hover:text-[hsl(var(--optavia-green))]"
            >
              Open Tool
            </Button>
          </CardContent>
        )}
      </Card>

      {/* Dialog for dialog mode */}
      {expandMode === "dialog" && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className={`max-h-[90vh] overflow-y-auto ${
            id === "social-media-generator"
              ? "max-w-7xl w-[98vw]"
              : id === "health-assessment" || id === "client-onboarding" || id === "client-troubleshooting"
              ? "max-w-5xl" 
              : "max-w-2xl"
          }`}>
            <DialogHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[hsl(var(--optavia-green-light))]">
                  <Icon className="h-5 w-5 text-[hsl(var(--optavia-green))]" />
                </div>
                <DialogTitle className="text-xl text-optavia-dark">{title}</DialogTitle>
              </div>
            </DialogHeader>
            <div className="mt-4">
              {children}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}

