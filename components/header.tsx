"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { UserMenu } from "@/components/user-menu"
import { RemindersBell } from "@/components/reminders-panel"
import { ShareProfile } from "@/components/share-profile"
import { useAuth } from "@/hooks/use-auth"
import { useSupabaseData } from "@/hooks/use-supabase-data"
import { Menu, X, UserPlus, Users, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation"

interface HeaderProps {
  onSettingsClick?: () => void
  onHomeClick?: () => void
  onAnnouncementsClick?: () => void
  onReportsClick?: () => void
  onInviteClick?: () => void
  activeTab?: "dashboard" | "training" | "metabolic-reset-events" | "resources" | "recipes" | "calendar" | "admin" | "my-business" | "favorites" | "notifications" | "team"
  onTabChange?: (tab: "dashboard" | "training" | "metabolic-reset-events" | "resources" | "recipes" | "calendar" | "admin" | "my-business" | "favorites" | "notifications" | "team") => void
}

export function Header({ onSettingsClick, onHomeClick, onAnnouncementsClick, onReportsClick, onInviteClick, activeTab, onTabChange }: HeaderProps) {
  const { user, loading } = useAuth()
  const { profile } = useSupabaseData(user)
  const pathname = usePathname()
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const isAdmin = profile?.user_role?.toLowerCase() === "admin"
  const orgId = profile?.org_id ?? 1 // Default to full access
  const isTrainingOnly = orgId === 2

  const handleInviteClick = () => {
    if (onInviteClick) {
      onInviteClick()
    } else {
      router.push("/admin/invite")
    }
  }

  // Determine active tab from pathname if not provided
  type TabType = "dashboard" | "training" | "metabolic-reset-events" | "resources" | "recipes" | "calendar" | "admin" | "my-business" | "favorites" | "notifications" | "team"
  const getActiveTab = (): TabType => {
    if (activeTab) return activeTab
    if (pathname?.startsWith("/dashboard") || pathname === "/") return "dashboard"
    if (pathname?.startsWith("/training")) return "training"
    if (pathname?.startsWith("/metabolic-reset-events")) return "metabolic-reset-events"
    if (pathname?.startsWith("/resources")) return "resources"
    if (pathname?.startsWith("/recipes")) return "recipes"
    if (pathname?.startsWith("/calendar")) return "calendar"
    return "dashboard" // default
  }

  const currentActiveTab = getActiveTab()

  // Full nav items - filtered based on org_id
  // Order: Calendar, Training, Metabolic Reset Events, Resources, Recipes, Dashboard (My Business is separate dropdown at end)
  const allNavItems = [
    { id: "calendar" as const, label: "Calendar", href: "/calendar", fullAccessOnly: true },
    { id: "training" as const, label: "Training", href: "/training", fullAccessOnly: false },
    { id: "metabolic-reset-events" as const, label: "Metabolic Reset Events", href: "/metabolic-reset-events", fullAccessOnly: false },
    { id: "resources" as const, label: "Resources", href: "/resources", fullAccessOnly: true },
    { id: "recipes" as const, label: "Recipes", href: "/recipes", fullAccessOnly: true },
    { id: "dashboard" as const, label: "Dashboard", href: "/dashboard", fullAccessOnly: true },
  ]
  
  // Filter nav items based on org access
  const navItems = isTrainingOnly 
    ? allNavItems.filter(item => !item.fullAccessOnly)
    : allNavItems

  // Updated My Business items per Phase 5 UX redesign
  const businessItems = [
    { label: "Pipeline", href: "/prospect-pipeline", description: "Overview of your journey" },
    { label: "100's List Tracker", href: "/prospect-tracker", description: "Track your pipeline" },
    { label: "Client Tracker", href: "/client-tracker", description: "Touchpoints & milestones" },
    // { label: "Downline Overview", href: "/coach/downline", description: "Track your team's progress" }, // Hidden for now
    { label: "Rank Calculator", href: "/my-business", description: "Track rank progress" },
  ]

  const isBusinessPage = pathname?.startsWith("/prospect-tracker") || 
                         pathname?.startsWith("/client-tracker") || 
                         pathname?.startsWith("/prospect-pipeline") ||
                         // pathname?.startsWith("/coach/downline") || // Hidden for now
                         pathname?.startsWith("/my-business")

  return (
    <header className="border-b border-optavia-border bg-white sticky top-0 z-50">
      <div className="container mx-auto px-4">
        {/* Top row: Logo, Hamburger Menu, and User Menu */}
        <div className="flex items-center justify-between gap-2 py-3 sm:py-4">
          <div className="flex items-center gap-3 min-w-0 flex-shrink">
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
            {/* Share Profile Button - positioned to the right of logo */}
            {!loading && user && profile?.optavia_id && <ShareProfile />}
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
                className="hidden sm:flex items-center gap-2 border-[hsl(var(--optavia-green))] text-[hsl(var(--optavia-green))] hover:bg-[hsl(var(--optavia-green-light))] hover:border-[hsl(var(--optavia-green))] hover:text-[hsl(var(--optavia-green))] transition-colors"
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
            {!loading && user && (
              <>
                <RemindersBell />
                <UserMenu onSettingsClick={onSettingsClick} onAnnouncementsClick={onAnnouncementsClick} onReportsClick={onReportsClick} />
              </>
            )}
          </div>
        </div>

        {/* Desktop Navigation Menu - Order: Calendar | Training | Resources | Recipes | Dashboard | My Business */}
        {user && (
          <nav className="hidden md:flex items-center justify-center gap-6 lg:gap-8 xl:gap-10 border-t border-optavia-border py-2">
            {/* Calendar, Training, Resources, Recipes, Dashboard - in order from navItems array */}
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
            
            {/* My Business Dropdown - Positioned last, hidden for training-only orgs */}
            {!isTrainingOnly && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className={`pb-3 lg:pb-4 px-4 lg:px-6 font-heading font-semibold text-sm lg:text-base transition-colors relative whitespace-nowrap flex-shrink-0 flex items-center gap-1 ${
                      isBusinessPage
                        ? "text-[hsl(var(--optavia-green))]"
                        : "text-optavia-dark hover:text-[hsl(var(--optavia-green))]"
                    }`}
                  >
                    <Users className="h-4 w-4" />
                    My Business
                    <ChevronDown className="h-3 w-3" />
                    {isBusinessPage && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[hsl(var(--optavia-green))]" />
                    )}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center" className="w-56 bg-white border shadow-lg">
                  {businessItems.map((item) => (
                    <DropdownMenuItem key={item.href} asChild>
                      <Link href={item.href} className="flex flex-col items-start py-2">
                        <span className="font-medium">{item.label}</span>
                        <span className="text-xs text-gray-500">{item.description}</span>
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </nav>
        )}

        {/* Mobile Navigation Menu (Dropdown) - Order: Calendar, Training, Resources, Recipes, Dashboard, My Business */}
        {user && mobileMenuOpen && (
          <nav className="md:hidden border-t border-optavia-border bg-white">
            <div className="flex flex-col">
              {/* Calendar, Training, Resources, Recipes, Dashboard - in order from navItems array */}
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
                    {item.label}
                  </Link>
                )
              })}
              
              {/* My Business Section last - Hidden for training-only orgs */}
              {!isTrainingOnly && (
                <>
                  <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wide bg-gray-50 border-b border-gray-100">
                    My Business
                  </div>
                  {businessItems.map((item) => {
                    const isActive = pathname === item.href
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`px-4 py-3 pl-6 text-left font-heading font-semibold text-base transition-colors border-b border-gray-100 flex items-center gap-2 ${
                          isActive
                            ? "text-[hsl(var(--optavia-green))] bg-green-50"
                            : "text-optavia-dark hover:text-[hsl(var(--optavia-green))] hover:bg-gray-50"
                        }`}
                      >
                        <Users className="h-4 w-4" />
                        {item.label}
                      </Link>
                    )
                  })}
                </>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  )
}
