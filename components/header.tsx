"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { UserMenu } from "@/components/user-menu"
import { useAuth } from "@/hooks/use-auth"
import { useSupabaseData } from "@/hooks/use-supabase-data"
import { Menu, X, UserPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

interface HeaderProps {
  onSettingsClick?: () => void
  onHomeClick?: () => void
  onAnnouncementsClick?: () => void
  onReportsClick?: () => void
  onInviteClick?: () => void
  activeTab?: "dashboard" | "training" | "resources" | "recipes" | "calendar"
  onTabChange?: (tab: "dashboard" | "training" | "resources" | "recipes" | "calendar") => void
}

export function Header({ onSettingsClick, onHomeClick, onAnnouncementsClick, onReportsClick, onInviteClick, activeTab, onTabChange }: HeaderProps) {
  const { user, loading } = useAuth()
  const { profile } = useSupabaseData(user)
  const pathname = usePathname()
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const isAdmin = profile?.user_role?.toLowerCase() === "admin"

  const handleInviteClick = () => {
    if (onInviteClick) {
      onInviteClick()
    } else {
      router.push("/admin/invite")
    }
  }

  // Determine active tab from pathname if not provided
  const getActiveTab = (): "dashboard" | "training" | "resources" | "recipes" | "calendar" => {
    if (activeTab) return activeTab
    if (pathname?.startsWith("/dashboard") || pathname === "/") return "dashboard"
    if (pathname?.startsWith("/training")) return "training"
    if (pathname?.startsWith("/resources")) return "resources"
    if (pathname?.startsWith("/recipes")) return "recipes"
    if (pathname?.startsWith("/calendar")) return "calendar"
    return "dashboard" // default
  }

  const currentActiveTab = getActiveTab()

  const navItems = [
    { id: "dashboard" as const, label: "Dashboard", href: "/dashboard" },
    { id: "training" as const, label: "Training", href: "/training" },
    { id: "calendar" as const, label: "Calendar", href: "/calendar" },
    { id: "resources" as const, label: "Resources", href: "/resources" },
    { id: "recipes" as const, label: "Recipes", href: "/recipes" },
  ]

  return (
    <header className="border-b border-optavia-border bg-white sticky top-0 z-50">
      <div className="container mx-auto px-4">
        {/* Top row: Logo, Hamburger Menu, and User Menu */}
        <div className="flex items-center justify-between gap-2 py-3 sm:py-4">
          <div className="flex items-center gap-2 min-w-0 flex-shrink">
            <Link 
              href="/dashboard" 
              className="hover:opacity-80 transition-opacity"
              onClick={(e) => {
                // If we're on the home page, prevent default and call handler
                if (pathname === "/" && onHomeClick) {
                  e.preventDefault()
                  onHomeClick()
                }
              }}
            >
                <picture>
                  <source srcSet="/branding/ca_logo_large.svg" type="image/svg+xml" />
                  <img
                    src="/branding/ca_logo_large.png"
                    alt="Coaching Amplifier"
                    className="h-10 sm:h-12 md:h-14 w-auto"
                  />
                </picture>
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
            {/* Invite Coach Button (Admin Only) */}
            {!loading && user && isAdmin && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleInviteClick}
                className="hidden sm:flex items-center gap-2 border-[hsl(var(--optavia-green))] text-[hsl(var(--optavia-green))] hover:bg-[hsl(var(--optavia-green))] hover:text-white transition-colors"
              >
                <UserPlus className="h-4 w-4" />
                <span className="hidden md:inline">Invite Coach</span>
              </Button>
            )}
            {/* Mobile Invite Button (Admin Only) */}
            {!loading && user && isAdmin && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleInviteClick}
                className="sm:hidden text-[hsl(var(--optavia-green))] hover:bg-green-50"
                aria-label="Invite Coach"
              >
                <UserPlus className="h-5 w-5" />
              </Button>
            )}
            {!loading && user && <UserMenu onSettingsClick={onSettingsClick} onAnnouncementsClick={onAnnouncementsClick} onReportsClick={onReportsClick} />}
          </div>
        </div>

        {/* Desktop Navigation Menu */}
        {user && (
          <nav className="hidden md:flex items-center justify-center gap-6 lg:gap-8 xl:gap-10 border-t border-optavia-border py-2">
            {navItems.map((item) => {
              const isActive = currentActiveTab === item.id
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() => {
                    setMobileMenuOpen(false)
                    onTabChange?.(item.id)
                  }}
                  className={`pb-3 lg:pb-4 px-4 lg:px-6 font-heading font-semibold text-sm lg:text-base transition-colors relative whitespace-nowrap flex-shrink-0 ${
                    isActive
                      ? "text-[hsl(var(--optavia-green))]"
                      : "text-optavia-dark hover:text-[hsl(var(--optavia-green))]"
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[hsl(var(--optavia-green))]" />
                  )}
                </Link>
              )
            })}
          </nav>
        )}

        {/* Mobile Navigation Menu (Dropdown) */}
        {user && mobileMenuOpen && (
          <nav className="md:hidden border-t border-optavia-border bg-white">
            <div className="flex flex-col">
              {navItems.map((item) => {
                const isActive = currentActiveTab === item.id
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    onClick={() => {
                      setMobileMenuOpen(false)
                      onTabChange?.(item.id)
                    }}
                    className={`px-4 py-3 text-left font-heading font-semibold text-base transition-colors border-b border-gray-100 ${
                      isActive
                        ? "text-[hsl(var(--optavia-green))] bg-green-50"
                        : "text-optavia-dark hover:text-[hsl(var(--optavia-green))] hover:bg-gray-50"
                    }`}
                  >
                    {item.mobileLabel || item.label}
                  </Link>
                )
              })}
            </div>
          </nav>
        )}
      </div>
    </header>
  )
}
