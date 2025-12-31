"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useUserData } from "@/contexts/user-data-context"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"
import { Upload, X, Trophy } from "lucide-react"
import { ProgressBar } from "@/components/progress-bar"
import { BadgeDisplay } from "@/components/badge-display"

interface UserSettingsProps {
  onClose?: () => void
}

export function UserSettings({ onClose }: UserSettingsProps) {
  const {
    user,
    profile,
    notificationSettings,
    completedResources,
    bookmarks,
    favoriteRecipes,
    badges,
    updateProfile,
    updateNotificationSettings,
    refreshData,
  } = useUserData()
  const { toast } = useToast()
  const supabase = createClient()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [fullName, setFullName] = useState(profile?.full_name || "")
  const [coachRank, setCoachRank] = useState<string>(profile?.coach_rank || "")
  const [optaviaId, setOptaviaId] = useState(profile?.optavia_id || "")

  // Update local state when profile changes
  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || "")
      setCoachRank(profile.coach_rank || "")
      setOptaviaId(profile.optavia_id || "")
    } else {
      // Reset to defaults if profile is null
      setFullName("")
      setCoachRank("")
      setOptaviaId("")
    }
  }, [profile])

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file",
        variant: "destructive",
      })
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 5MB",
        variant: "destructive",
      })
      return
    }

    setUploading(true)

    try {
      const fileExt = file.name.split(".").pop()
      const fileName = `${user.id}-${Math.random()}.${fileExt}`
      const filePath = `${fileName}`

      // Delete old avatar if exists
      if (profile?.avatar_url) {
        // Extract filename from URL
        const urlParts = profile.avatar_url.split("/")
        const oldFileName = urlParts[urlParts.length - 1]
        if (oldFileName) {
          await supabase.storage.from("user_avatars").remove([oldFileName])
        }
      }

      // Upload new avatar
      const { error: uploadError } = await supabase.storage.from("user_avatars").upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      })

      if (uploadError) throw uploadError

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("user_avatars").getPublicUrl(filePath)

      // Update profile
      const { error: updateError } = await updateProfile({ avatar_url: publicUrl })

      if (updateError) throw updateError

      toast({
        title: "Success",
        description: "Avatar updated successfully",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to upload avatar",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleRemoveAvatar = async () => {
    if (!profile?.avatar_url || !user) return

    try {
      // Extract filename from URL
      const urlParts = profile.avatar_url.split("/")
      const oldFileName = urlParts[urlParts.length - 1]
      if (oldFileName) {
        await supabase.storage.from("user_avatars").remove([oldFileName])
      }

      const { error } = await updateProfile({ avatar_url: null })

      if (error) throw error

      toast({
        title: "Success",
        description: "Avatar removed successfully",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to remove avatar",
        variant: "destructive",
      })
    }
  }

  const handleSaveProfile = async () => {
    if (!user) return

    // Automatically set is_new_coach based on coach rank
    const isNewCoach = coachRank === "Coach" || coachRank === ""

    const { error } = await updateProfile({
      full_name: fullName,
      is_new_coach: isNewCoach,
      coach_rank: coachRank || null,
      optavia_id: optaviaId || null,
    })

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } else {
      // Refresh data to ensure state is updated
      await refreshData()
      toast({
        title: "Success",
        description: "Profile updated successfully",
      })
      // Don't close, let user see the updated values
    }
  }

  const handleNotificationSettingChange = async (
    key: "push_enabled" | "announcements_enabled" | "progress_updates_enabled" | "email_notifications",
    value: boolean
  ) => {
    if (!notificationSettings) return

    await updateNotificationSettings({ [key]: value })
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

  const totalResources = completedResources.length + bookmarks.length + favoriteRecipes.length

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading font-bold text-2xl sm:text-3xl text-optavia-dark">Settings</h1>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="space-y-6">
        {/* Profile Section */}
        <Card className="bg-white border border-gray-200 shadow-lg">
          <CardHeader>
            <CardTitle className="text-optavia-dark">Profile</CardTitle>
            <CardDescription className="text-optavia-gray">Update your profile information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-start gap-6">
              <div className="flex flex-col items-center gap-3">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={profile?.avatar_url || undefined} alt={profile?.full_name || "User"} />
                  <AvatarFallback className="bg-[hsl(var(--optavia-green))] text-white text-2xl">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
                {/* Badge Status */}
                <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-200">
                  <Trophy className="h-4 w-4 text-[hsl(var(--optavia-green))]" />
                  <span className="text-sm font-semibold text-optavia-dark">
                    {badges.length} {badges.length === 1 ? "Badge" : "Badges"}
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-2 flex-1">
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="border-gray-300 text-optavia-dark hover:bg-gray-50"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {uploading ? "Uploading..." : "Upload Avatar"}
                  </Button>
                  {profile?.avatar_url && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleRemoveAvatar}
                      disabled={uploading}
                      className="border-gray-300 text-optavia-dark hover:bg-gray-50"
                    >
                      Remove
                    </Button>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
                <p className="text-xs text-optavia-gray">JPG, PNG or GIF. Max size 5MB</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-optavia-dark">Full Name</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your full name"
                className="bg-white border-gray-300 text-optavia-dark"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="coachRank" className="text-optavia-dark">Coach Rank</Label>
              <Select value={coachRank || "none"} onValueChange={(value) => setCoachRank(value === "none" ? "" : value)}>
                <SelectTrigger 
                  id="coachRank" 
                  className="w-full bg-white border-2 border-gray-300 text-optavia-dark hover:border-[hsl(var(--optavia-green))] focus:border-[hsl(var(--optavia-green))]"
                >
                  <SelectValue placeholder="Select coach rank" />
                </SelectTrigger>
                <SelectContent className="bg-white border-2 border-gray-300">
                  <SelectItem value="none" className="text-optavia-dark hover:bg-gray-100">None</SelectItem>
                  <SelectItem value="Coach" className="text-optavia-dark hover:bg-gray-100">Coach</SelectItem>
                  <SelectItem value="SC" className="text-optavia-dark hover:bg-gray-100">Senior Coach (SC)</SelectItem>
                  <SelectItem value="MG" className="text-optavia-dark hover:bg-gray-100">Manager (MG)</SelectItem>
                  <SelectItem value="AD" className="text-optavia-dark hover:bg-gray-100">Associate Director (AD)</SelectItem>
                  <SelectItem value="DR" className="text-optavia-dark hover:bg-gray-100">Director (DR)</SelectItem>
                  <SelectItem value="ED" className="text-optavia-dark hover:bg-gray-100">Executive Director (ED)</SelectItem>
                  <SelectItem value="IED" className="text-optavia-dark hover:bg-gray-100">Integrated Executive Director (IED)</SelectItem>
                  <SelectItem value="FIBC" className="text-optavia-dark hover:bg-gray-100">Fully Integrated Business Coach (FIBC)</SelectItem>
                  <SelectItem value="IGD" className="text-optavia-dark hover:bg-gray-100">Integrated Global Director (IGD)</SelectItem>
                  <SelectItem value="FIBL" className="text-optavia-dark hover:bg-gray-100">Fully Integrated Business Leader (FIBL)</SelectItem>
                  <SelectItem value="IND" className="text-optavia-dark hover:bg-gray-100">Integrated National Director (IND)</SelectItem>
                  <SelectItem value="IPD" className="text-optavia-dark hover:bg-gray-100">Integrated Presidential Director (IPD)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="optaviaId" className="text-optavia-dark">Optavia ID</Label>
              <Input
                id="optaviaId"
                value={optaviaId}
                onChange={(e) => setOptaviaId(e.target.value)}
                placeholder="Enter your Optavia ID"
                className="bg-white border-gray-300 text-optavia-dark"
              />
            </div>

            <Button 
              onClick={handleSaveProfile}
              className="bg-[hsl(var(--optavia-green))] hover:bg-[hsl(var(--optavia-green-dark))] text-white"
            >
              Save Changes
            </Button>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        {notificationSettings && (
          <Card className="bg-white border border-gray-200 shadow-lg">
            <CardHeader>
              <CardTitle className="text-optavia-dark">Notification Settings</CardTitle>
              <CardDescription className="text-optavia-gray">Manage your notification preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-optavia-dark">Push Notifications</Label>
                  <p className="text-sm text-optavia-gray">Receive push notifications on your device</p>
                </div>
                <Switch
                  checked={notificationSettings.push_enabled}
                  onCheckedChange={(checked) =>
                    handleNotificationSettingChange("push_enabled", checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-optavia-dark">Announcements</Label>
                  <p className="text-sm text-optavia-gray">Get notified about new announcements</p>
                </div>
                <Switch
                  checked={notificationSettings.announcements_enabled}
                  onCheckedChange={(checked) =>
                    handleNotificationSettingChange("announcements_enabled", checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-optavia-dark">Email Notifications</Label>
                  <p className="text-sm text-optavia-gray">Receive notifications via email</p>
                </div>
                <Switch
                  checked={notificationSettings.email_notifications}
                  onCheckedChange={(checked) =>
                    handleNotificationSettingChange("email_notifications", checked)
                  }
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Progress Summary */}
        <Card className="bg-white border border-gray-200 shadow-lg">
          <CardHeader>
            <CardTitle className="text-optavia-dark">Your Progress</CardTitle>
            <CardDescription className="text-optavia-gray">Overview of your activity</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-optavia-dark">Completed Training</span>
                <span className="text-sm text-optavia-gray font-semibold">{completedResources.length}</span>
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-optavia-dark">Bookmarks</span>
                <span className="text-sm text-optavia-gray font-semibold">{bookmarks.length}</span>
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-optavia-dark">Favorite Recipes</span>
                <span className="text-sm text-optavia-gray font-semibold">{favoriteRecipes.length}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Achievements */}
        <BadgeDisplay 
          badges={badges.map(badge => ({
            id: badge.id,
            category: badge.category || "",
            badgeType: badge.badge_type,
            earnedAt: badge.earned_at,
          }))} 
        />
      </div>
    </div>
  )
}

