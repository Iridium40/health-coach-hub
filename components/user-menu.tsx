"use client"

import { useState, useEffect } from "react"
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
import { Settings, LogOut, User, Bell, BarChart3, UserPlus } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { useSupabaseData } from "@/hooks/use-supabase-data"

interface UserMenuProps {
  onSettingsClick?: () => void
  onAnnouncementsClick?: () => void
  onReportsClick?: () => void
  onInviteClick?: () => void
}

export function UserMenu({ onSettingsClick, onAnnouncementsClick, onReportsClick, onInviteClick }: UserMenuProps) {
  const { user, signOut } = useAuth()
  const { profile, refreshData } = useSupabaseData(user)
  const [loading, setLoading] = useState(false)

  // Debug: Log profile to check user_role
  useEffect(() => {
    if (profile) {
      console.log("User profile:", { 
        user_role: profile.user_role, 
        email: profile.email,
        full_profile: profile 
      })
    }
  }, [profile])

  const handleSignOut = async () => {
    setLoading(true)
    await signOut()
    // Reload page to reset state
    window.location.href = "/"
    setLoading(false)
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
        {profile?.user_role?.toLowerCase() === "admin" && (
          <>
            {onAnnouncementsClick && (
              <DropdownMenuItem 
                onClick={onAnnouncementsClick}
                className="text-optavia-dark hover:bg-gray-100 cursor-pointer"
              >
                <Bell className="mr-2 h-4 w-4" />
                <span>Announcements</span>
              </DropdownMenuItem>
            )}
            {onReportsClick && (
              <DropdownMenuItem 
                onClick={onReportsClick}
                className="text-optavia-dark hover:bg-gray-100 cursor-pointer"
              >
                <BarChart3 className="mr-2 h-4 w-4" />
                <span>Reports</span>
              </DropdownMenuItem>
            )}
            {onInviteClick && (
              <DropdownMenuItem 
                onClick={onInviteClick}
                className="text-optavia-dark hover:bg-gray-100 cursor-pointer"
              >
                <UserPlus className="mr-2 h-4 w-4" />
                <span>Invite Coach</span>
              </DropdownMenuItem>
            )}
            {(onAnnouncementsClick || onReportsClick || onInviteClick) && (
              <DropdownMenuSeparator className="bg-gray-200" />
            )}
          </>
        )}
        <DropdownMenuItem 
          onClick={onSettingsClick}
          className="text-optavia-dark hover:bg-gray-100 cursor-pointer"
        >
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
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

