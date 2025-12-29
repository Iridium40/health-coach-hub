"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/hooks/use-auth"
import { useSupabaseData } from "@/hooks/use-supabase-data"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"
import { Upload, X } from "lucide-react"
import { ProgressBar } from "@/components/progress-bar"

interface UserSettingsProps {
  onClose?: () => void
}

export function UserSettings({ onClose }: UserSettingsProps) {
  const { user } = useAuth()
  const {
    profile,
    notificationSettings,
    completedResources,
    bookmarks,
    favoriteRecipes,
    updateProfile,
    updateNotificationSettings,
  } = useSupabaseData(user)
  const { toast } = useToast()
  const supabase = createClient()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [fullName, setFullName] = useState(profile?.full_name || "")
  const [isNewCoach, setIsNewCoach] = useState(profile?.is_new_coach ?? true)

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

    const { error } = await updateProfile({
      full_name: fullName,
      is_new_coach: isNewCoach,
    })

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } else {
      toast({
        title: "Success",
        description: "Profile updated successfully",
      })
      onClose?.()
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
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Update your profile information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={profile?.avatar_url || undefined} alt={profile?.full_name || "User"} />
                <AvatarFallback className="bg-[hsl(var(--optavia-green))] text-white text-2xl">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
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
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your full name"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="isNewCoach"
                checked={isNewCoach}
                onCheckedChange={setIsNewCoach}
              />
              <Label htmlFor="isNewCoach" className="cursor-pointer">
                I'm a new coach
              </Label>
            </div>

            <Button onClick={handleSaveProfile}>Save Changes</Button>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        {notificationSettings && (
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Manage your notification preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Push Notifications</Label>
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
                  <Label>Announcements</Label>
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
                  <Label>Progress Updates</Label>
                  <p className="text-sm text-optavia-gray">Notifications about your learning progress</p>
                </div>
                <Switch
                  checked={notificationSettings.progress_updates_enabled}
                  onCheckedChange={(checked) =>
                    handleNotificationSettingChange("progress_updates_enabled", checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Notifications</Label>
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
        <Card>
          <CardHeader>
            <CardTitle>Your Progress</CardTitle>
            <CardDescription>Overview of your activity</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Completed Resources</span>
                <span className="text-sm text-optavia-gray">{completedResources.length}</span>
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Bookmarks</span>
                <span className="text-sm text-optavia-gray">{bookmarks.length}</span>
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Favorite Recipes</span>
                <span className="text-sm text-optavia-gray">{favoriteRecipes.length}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

