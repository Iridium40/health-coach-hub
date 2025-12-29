"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ExternalLink } from "lucide-react"
import { UserMenu } from "@/components/user-menu"
import { useAuth } from "@/hooks/use-auth"

interface HeaderProps {
  onSettingsClick?: () => void
  onHomeClick?: () => void
}

export function Header({ onSettingsClick, onHomeClick }: HeaderProps) {
  const { user, loading } = useAuth()
  const pathname = usePathname()

  return (
    <header className="border-b border-optavia-border bg-white sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 sm:py-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0 flex-shrink">
          <Link 
            href="/" 
            className="hover:opacity-80 transition-opacity"
            onClick={(e) => {
              // If we're already on the home page, prevent default navigation and call handler
              if (pathname === "/" && onHomeClick) {
                e.preventDefault()
                onHomeClick()
              }
            }}
          >
            <Image
              src="/branding/ca_logo.jpg"
              alt="Coaching Amplifier"
              width={200}
              height={80}
              className="h-8 sm:h-10 md:h-12 w-auto"
              priority
            />
          </Link>
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
