"use client"

import { Button } from "@/components/ui/button"
import { ExternalLink } from "lucide-react"
import { UserMenu } from "@/components/user-menu"
import { useAuth } from "@/hooks/use-auth"

interface HeaderProps {
  onSettingsClick?: () => void
}

export function Header({ onSettingsClick }: HeaderProps) {
  const { user, loading } = useAuth()

  return (
    <header className="border-b border-optavia-border bg-white sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 sm:py-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0 flex-shrink">
          <div className="text-xl sm:text-2xl font-heading tracking-wider">
            <span className="font-light text-[hsl(var(--coaching-text))] uppercase">Coaching</span>
            <span className="font-bold text-[hsl(var(--amplifier-text))] uppercase hidden sm:inline"> Amplifier</span>
            <span className="font-bold text-[hsl(var(--amplifier-text))] uppercase sm:hidden"> Amp</span>
          </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          <Button
            size="sm"
            className="gap-1 sm:gap-2 bg-[hsl(var(--optavia-green))] hover:bg-[hsl(var(--optavia-green-dark))] px-2 sm:px-3 text-xs sm:text-sm"
            asChild
          >
            <a href="https://optaviaconnect.com/login" target="_blank" rel="noopener noreferrer">
              <span className="hidden sm:inline">OPTAVIA Connect</span>
              <span className="sm:hidden">Connect</span>
              <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4" />
            </a>
          </Button>
          {!loading && user && <UserMenu onSettingsClick={onSettingsClick} />}
        </div>
      </div>
    </header>
  )
}
