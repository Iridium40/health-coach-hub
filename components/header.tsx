"use client"

import { Button } from "@/components/ui/button"
import { ExternalLink, RotateCcw } from "lucide-react"

interface HeaderProps {
  onReset: () => void
  showReset: boolean
}

export function Header({ onReset, showReset }: HeaderProps) {
  return (
    <header className="border-b border-optavia-border bg-white sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="text-2xl font-heading">
            <span className="font-extrabold text-optavia-green">Coaching</span>
            <span className="font-semibold text-optavia-green"> Amplifier</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {showReset && (
            <Button variant="outline" size="sm" onClick={onReset} className="gap-2 bg-transparent">
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
          )}
          <Button
            size="sm"
            className="gap-2 bg-[hsl(var(--optavia-green))] hover:bg-[hsl(var(--optavia-green-dark))]"
            asChild
          >
            <a href="https://optaviaconnect.com/login" target="_blank" rel="noopener noreferrer">
              OPTAVIA Connect
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        </div>
      </div>
    </header>
  )
}
