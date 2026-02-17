"use client"

import { ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface OptaviaProfileTabProps {
  optaviaId: string
}

export function OptaviaProfileTab({ optaviaId }: OptaviaProfileTabProps) {
  // optavia_id now stores the full URL directly; fall back to appending for legacy values
  const profileUrl = optaviaId.startsWith("http")
    ? optaviaId
    : `https://www.optavia.com/us/en/coach/${optaviaId}`

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="text-center py-4 sm:py-8">
        <h2 className="font-heading font-bold text-2xl sm:text-3xl text-optavia-dark mb-3 sm:mb-4">
          OPTAVIA Profile
        </h2>
        <p className="text-optavia-gray text-base sm:text-lg max-w-2xl mx-auto mb-6 sm:mb-8 px-4">
          View your OPTAVIA coach profile page to showcase your coaching business and connect with potential clients.
        </p>
        <Button
          size="lg"
          className="gap-2 bg-[hsl(var(--optavia-green))] hover:bg-[hsl(var(--optavia-green-dark))] text-sm sm:text-base"
          asChild
        >
          <a href={profileUrl} target="_blank" rel="noopener noreferrer">
            View My OPTAVIA Profile
            <ExternalLink className="h-4 w-4 sm:h-5 sm:w-5" />
          </a>
        </Button>
      </div>

      <Card className="p-4 sm:p-8">
        <div className="prose max-w-none">
          <h3 className="font-heading font-bold text-xl text-optavia-dark mb-4">
            Your Profile Features
          </h3>
          <ul className="space-y-3 text-optavia-gray">
            <li className="flex items-start gap-2">
              <span className="text-[hsl(var(--optavia-green))] mt-1">•</span>
              <span>Public coach profile page</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[hsl(var(--optavia-green))] mt-1">•</span>
              <span>Share your coaching journey and story</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[hsl(var(--optavia-green))] mt-1">•</span>
              <span>Connect with potential clients</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[hsl(var(--optavia-green))] mt-1">•</span>
              <span>Build your coaching network</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[hsl(var(--optavia-green))] mt-1">•</span>
              <span>Showcase your achievements and success</span>
            </li>
          </ul>
        </div>
      </Card>

      <div className="text-center text-sm text-optavia-gray">
        <p>
          Your OPTAVIA profile is your public-facing page where clients can learn more about you and your coaching services.
        </p>
      </div>
    </div>
  )
}

