"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User, LogOut, Bell, BarChart3, BellRing, UtensilsCrossed, Star, CalendarDays, BookOpen, Link2, MessageSquare, Video, UserPlus, Users } from "lucide-react"
import { useUserData } from "@/contexts/user-data-context"

interface UserMenuProps {
  onSettingsClick?: () => void
  onAnnouncementsClick?: () => void
  onReportsClick?: () => void
}

export function UserMenu({ onSettingsClick, onAnnouncementsClick, onReportsClick }: UserMenuProps) {
  const router = useRouter()
  const { user, profile, signOut } = useUserData()
  const [loading, setLoading] = useState(false)

  const isAdmin = profile?.user_role?.toLowerCase() === "admin"
  const orgId = profile?.org_id ?? 1 // Default to full access
  const isTrainingOnly = orgId === 2

  const handleSignOut = async () => {
    setLoading(true)
    await signOut()
    // Reload page to reset state
    window.location.href = "/"
    setLoading(false)
  }

  const handleAnnouncementsClick = () => {
    if (onAnnouncementsClick) {
      onAnnouncementsClick()
    } else {
      router.push("/admin/announcements")
    }
  }

  const handleReportsClick = () => {
    if (onReportsClick) {
      onReportsClick()
    } else {
      router.push("/admin/reports")
    }
  }

  const handleSettingsClick = () => {
    if (onSettingsClick) {
      onSettingsClick()
    } else {
      router.push("/settings")
    }
  }

  const handleNotificationsClick = () => {
    router.push("/notifications")
  }

  const getInitials = () => {
    if (profile?.full_name) {
      return profile.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    }
    if (user?.email) {
      return user.email[0].toUpperCase()
    }
    return "U"
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded">
          <Avatar className="h-10 w-10">
            <AvatarImage src={profile?.avatar_url || undefined} alt={profile?.full_name || "User"} />
            <AvatarFallback className="bg-[hsl(var(--optavia-green))] text-white">
              {getInitials()}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 bg-white border border-gray-200 shadow-lg" align="end" forceMount>
        <DropdownMenuLabel className="font-normal px-3 py-2">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none text-optavia-dark">
              {profile?.full_name || "User"}
            </p>
            <p className="text-xs leading-none text-optavia-gray">
              {user?.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-gray-200" />
        
        {/* Manage Section (Admin Only) */}
        {isAdmin && (
          <>
            <DropdownMenuLabel className="px-3 py-1.5 text-xs font-semibold text-optavia-gray uppercase tracking-wide">
              Manage
            </DropdownMenuLabel>
            {/* Training-only orgs only see Training management */}
            {isTrainingOnly ? (
              <DropdownMenuItem 
                onSelect={() => router.push("/admin/training")}
                className="text-optavia-dark hover:bg-gray-100 cursor-pointer"
              >
                <BookOpen className="mr-2 h-4 w-4" />
                <span>Training</span>
              </DropdownMenuItem>
            ) : (
              <>
                <DropdownMenuItem 
                  onSelect={handleAnnouncementsClick}
                  className="text-optavia-dark hover:bg-gray-100 cursor-pointer"
                >
                  <Bell className="mr-2 h-4 w-4" />
                  <span>Announcements</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onSelect={handleReportsClick}
                  className="text-optavia-dark hover:bg-gray-100 cursor-pointer"
                >
                  <BarChart3 className="mr-2 h-4 w-4" />
                  <span>Reports</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onSelect={() => router.push("/admin/recipes")}
                  className="text-optavia-dark hover:bg-gray-100 cursor-pointer"
                >
                  <UtensilsCrossed className="mr-2 h-4 w-4" />
                  <span>Recipes</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onSelect={() => router.push("/admin/zoom-calls")}
                  className="text-optavia-dark hover:bg-gray-100 cursor-pointer"
                >
                  <CalendarDays className="mr-2 h-4 w-4" />
                  <span>Events</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onSelect={() => router.push("/admin/training")}
                  className="text-optavia-dark hover:bg-gray-100 cursor-pointer"
                >
                  <BookOpen className="mr-2 h-4 w-4" />
                  <span>Training</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onSelect={() => router.push("/admin/resources")}
                  className="text-optavia-dark hover:bg-gray-100 cursor-pointer"
                >
                  <Link2 className="mr-2 h-4 w-4" />
                  <span>Resources</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onSelect={() => router.push("/admin/touchpoints")}
                  className="text-optavia-dark hover:bg-gray-100 cursor-pointer"
                >
                  <MessageSquare className="mr-2 h-4 w-4" />
                  <span>Touchpoints</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onSelect={() => router.push("/admin/invite")}
                  className="text-optavia-dark hover:bg-gray-100 cursor-pointer"
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  <span>Invite Coach</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onSelect={() => router.push("/admin/bulk-invite")}
                  className="text-optavia-dark hover:bg-gray-100 cursor-pointer"
                >
                  <Users className="mr-2 h-4 w-4" />
                  <span>Bulk Invite</span>
                </DropdownMenuItem>
              </>
            )}
            <DropdownMenuSeparator className="bg-gray-200" />
          </>
        )}
        
        
        {/* Settings Section */}
        <DropdownMenuLabel className="px-3 py-1.5 text-xs font-semibold text-optavia-gray uppercase tracking-wide">
          Settings
        </DropdownMenuLabel>
        <DropdownMenuItem 
          onSelect={handleSettingsClick}
          className="text-optavia-dark hover:bg-gray-100 cursor-pointer"
        >
          <User className="mr-2 h-4 w-4" />
          <span>Profile</span>
        </DropdownMenuItem>
        {/* Favorites - Hidden for training-only orgs */}
        {!isTrainingOnly && (
          <DropdownMenuItem 
            onSelect={() => router.push("/favorites")}
            className="text-optavia-dark hover:bg-gray-100 cursor-pointer"
          >
            <Star className="mr-2 h-4 w-4" />
            <span>Favorites</span>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem 
          onSelect={handleNotificationsClick}
          className="text-optavia-dark hover:bg-gray-100 cursor-pointer"
        >
          <BellRing className="mr-2 h-4 w-4" />
          <span>Notifications</span>
        </DropdownMenuItem>
        {/* Zoom Room - Hidden for training-only orgs */}
        {!isTrainingOnly && (
          <DropdownMenuItem 
            onSelect={() => router.push("/zoom-settings")}
            className="text-optavia-dark hover:bg-gray-100 cursor-pointer"
          >
            <Video className="mr-2 h-4 w-4" />
            <span>Zoom Room</span>
          </DropdownMenuItem>
        )}
        
        <DropdownMenuSeparator className="bg-gray-200" />
        <DropdownMenuItem 
          onSelect={handleSignOut} 
          disabled={loading}
          className="text-optavia-dark hover:bg-gray-100 cursor-pointer"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>{loading ? "Signing out..." : "Sign Out"}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

