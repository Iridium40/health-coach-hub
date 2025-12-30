"use client"

import { ExternalLink } from "lucide-react"
import { Card } from "@/components/ui/card"

interface ResourceCardProps {
  title: string
  description: string
  url: string
  buttonText: string
  features?: string[]
}

export function ResourceCard({ title, description, url, buttonText, features }: ResourceCardProps) {
  // Show only top 3 features for compactness
  const displayFeatures = features?.slice(0, 3) || []

  return (
    <Card className="group relative overflow-hidden bg-white border-2 border-gray-200 hover:border-[hsl(var(--optavia-green))] transition-all duration-300 hover:shadow-lg">
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="block p-5 sm:p-6"
      >
        {/* Header with title and icon */}
        <div className="flex items-start justify-between gap-4 mb-3">
          <h3 className="font-heading font-bold text-lg sm:text-xl text-optavia-dark group-hover:text-[hsl(var(--optavia-green))] transition-colors flex-1">
            {title}
          </h3>
          <ExternalLink className="h-5 w-5 text-gray-400 group-hover:text-[hsl(var(--optavia-green))] transition-colors flex-shrink-0 mt-0.5" />
        </div>

        {/* Description */}
        <p className="text-sm text-optavia-gray mb-4 line-clamp-2">
          {description}
        </p>

        {/* Compact feature list */}
        {displayFeatures.length > 0 && (
          <div className="space-y-1.5">
            {displayFeatures.map((feature, index) => (
              <div key={index} className="flex items-center gap-2 text-xs text-optavia-gray">
                <div className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--optavia-green))] flex-shrink-0" />
                <span className="line-clamp-1">{feature}</span>
              </div>
            ))}
          </div>
        )}
      </a>
    </Card>
  )
}

