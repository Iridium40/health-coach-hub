"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { UserMenu } from "@/components/user-menu"
import { useAuth } from "@/hooks/use-auth"
import { useSupabaseData } from "@/hooks/use-supabase-data"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface HeaderProps {
  onSettingsClick?: () => void
  onHomeClick?: () => void
  onAnnouncementsClick?: () => void
  onReportsClick?: () => void
  onInviteClick?: () => void
  activeTab?: "training" | "resources" | "recipes"
  onTabChange?: (tab: "training" | "resources" | "recipes") => void
}

export function Header({ onSettingsClick, onHomeClick, onAnnouncementsClick, onReportsClick, onInviteClick, activeTab = "training", onTabChange }: HeaderProps) {
  const { user, loading } = useAuth()
  const { profile } = useSupabaseData(user)
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleTabChange = (tab: "training" | "resources" | "recipes") => {
    onTabChange?.(tab)
    setMobileMenuOpen(false) // Close mobile menu when tab is selected
  }

  const navItems = [
    { id: "training" as const, label: "Training" },
    { id: "resources" as const, label: "Resources" },
    { id: "recipes" as const, label: "Recipes" },
  ]

  return (
    <header className="border-b border-optavia-border bg-white sticky top-0 z-50">
      <div className="container mx-auto px-4">
        {/* Top row: Logo, Hamburger Menu, and User Menu */}
        <div className="flex items-center justify-between gap-2 py-3 sm:py-4">
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
                <img
                    src="/branding/ca_icon_large.svg"
                    alt="Coaching Amplifier"
                    className="h-8 sm:h-10 md:h-12 w-auto"
                />
            </Link>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            {/* Hamburger Menu Button (Mobile Only) */}
            {!loading && user && (
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden text-optavia-dark hover:bg-gray-100"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </Button>
            )}
            {!loading && user && <UserMenu onSettingsClick={onSettingsClick} onAnnouncementsClick={onAnnouncementsClick} onReportsClick={onReportsClick} onInviteClick={onInviteClick} />}
          </div>
        </div>

        {/* Desktop Navigation Menu */}
        {user && (
          <nav className="hidden md:flex items-center justify-center gap-6 lg:gap-8 xl:gap-10 border-t border-optavia-border py-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleTabChange(item.id)}
                className={`pb-3 lg:pb-4 px-4 lg:px-6 font-heading font-semibold text-sm lg:text-base transition-colors relative whitespace-nowrap flex-shrink-0 ${
                  activeTab === item.id
                    ? "text-[hsl(var(--optavia-green))]"
                    : "text-optavia-dark hover:text-[hsl(var(--optavia-green))]"
                }`}
              >
                {item.label}
                {activeTab === item.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[hsl(var(--optavia-green))]" />
                )}
              </button>
            ))}
          </nav>
        )}

        {/* Mobile Navigation Menu (Dropdown) */}
        {user && mobileMenuOpen && (
          <nav className="md:hidden border-t border-optavia-border bg-white">
            <div className="flex flex-col">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleTabChange(item.id)}
                  className={`px-4 py-3 text-left font-heading font-semibold text-base transition-colors border-b border-gray-100 ${
                    activeTab === item.id
                      ? "text-[hsl(var(--optavia-green))] bg-green-50"
                      : "text-optavia-dark hover:text-[hsl(var(--optavia-green))] hover:bg-gray-50"
                  }`}
                >
                  {item.mobileLabel || item.label}
                </button>
              ))}
            </div>
          </nav>
        )}
      </div>
    </header>
  )
}
