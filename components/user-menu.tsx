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
import { Settings, LogOut, Bell, BarChart3, BellRing, UtensilsCrossed, Star, Video } from "lucide-react"
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
        {isAdmin && (
          <>
            <DropdownMenuItem 
              onClick={handleAnnouncementsClick}
              className="text-optavia-dark hover:bg-gray-100 cursor-pointer"
            >
              <Bell className="mr-2 h-4 w-4" />
              <span>Announcements</span>
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={handleReportsClick}
              className="text-optavia-dark hover:bg-gray-100 cursor-pointer"
            >
              <BarChart3 className="mr-2 h-4 w-4" />
              <span>Reports</span>
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => router.push("/admin/recipes")}
              className="text-optavia-dark hover:bg-gray-100 cursor-pointer"
            >
              <UtensilsCrossed className="mr-2 h-4 w-4" />
              <span>Manage Recipes</span>
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => router.push("/admin/zoom-calls")}
              className="text-optavia-dark hover:bg-gray-100 cursor-pointer"
            >
              <Video className="mr-2 h-4 w-4" />
              <span>Manage Zoom Calls</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-gray-200" />
          </>
        )}
        <DropdownMenuItem 
          onClick={() => router.push("/favorites")}
          className="text-optavia-dark hover:bg-gray-100 cursor-pointer"
        >
          <Star className="mr-2 h-4 w-4" />
          <span>My Favorites</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={handleSettingsClick}
          className="text-optavia-dark hover:bg-gray-100 cursor-pointer"
        >
          <Settings className="mr-2 h-4 w-4" />
          <span>Profile</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={handleNotificationsClick}
          className="text-optavia-dark hover:bg-gray-100 cursor-pointer"
        >
          <BellRing className="mr-2 h-4 w-4" />
          <span>Notifications</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-gray-200" />
        <DropdownMenuItem 
          onClick={handleSignOut} 
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

