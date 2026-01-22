"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useUserData } from "@/contexts/user-data-context"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"
import { Upload, X, UserCheck } from "lucide-react"

interface SponsorInfo {
  id: string
  full_name: string | null
  email: string | null
  avatar_url: string | null
}

interface UserSettingsProps {
  onClose?: () => void
}

export function UserSettings({ onClose }: UserSettingsProps) {
  const {
    user,
    profile,
    completedResources,
    bookmarks,
    favoriteRecipes,
    updateProfile,
    refreshData,
  } = useUserData()
  const { toast } = useToast()
  const supabase = createClient()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [fullName, setFullName] = useState(profile?.full_name || "")
  const [optaviaId, setOptaviaId] = useState(profile?.optavia_id || "")
  const [phoneNumber, setPhoneNumber] = useState(profile?.phone_number || "")
  const [sponsorInfo, setSponsorInfo] = useState<SponsorInfo | null>(null)
  const [loadingSponsor, setLoadingSponsor] = useState(false)

  // Update local state when profile changes
  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || "")
      setOptaviaId(profile.optavia_id || "")
      setPhoneNumber(profile.phone_number || "")
    } else {
      // Reset to defaults if profile is null
      setFullName("")
      setOptaviaId("")
      setPhoneNumber("")
    }
  }, [profile])

  // Load sponsor information
  useEffect(() => {
    const loadSponsorInfo = async () => {
      if (!profile?.sponsor_id) {
        setSponsorInfo(null)
        return
      }

      setLoadingSponsor(true)
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("id, full_name, email, avatar_url")
          .eq("id", profile.sponsor_id)
          .single()

        if (error) {
          console.error("Error loading sponsor info:", error)
          setSponsorInfo(null)
        } else {
          setSponsorInfo(data)
        }
      } catch (error) {
        console.error("Error loading sponsor info:", error)
        setSponsorInfo(null)
      } finally {
        setLoadingSponsor(false)
      }
    }

    loadSponsorInfo()
  }, [profile?.sponsor_id, supabase])

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

    // Check if user is a coach (not admin)
    const userIsCoach = profile?.user_role?.toLowerCase() !== "admin"

    // Coaches can update their name and phone; admins can update all fields
    if (userIsCoach) {
      const { error } = await updateProfile({
        full_name: fullName,
        phone_number: phoneNumber || null,
      })

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        })
      } else {
        await refreshData()
        toast({
          title: "Success",
          description: "Profile updated successfully",
        })
      }
    } else {
      // Admins can update all fields
      const { error } = await updateProfile({
        full_name: fullName,
        phone_number: phoneNumber || null,
        optavia_id: optaviaId || null,
      })

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        })
      } else {
        await refreshData()
        toast({
          title: "Success",
          description: "Profile updated successfully",
        })
      }
    }
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

  // Check if user is a coach (not admin) - coaches have read-only profile fields except Full Name
  const isCoach = profile?.user_role?.toLowerCase() !== "admin"

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
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
              <div className="flex flex-col items-center gap-3">
                <Avatar className="h-20 w-20 sm:h-24 sm:w-24">
                  <AvatarImage src={profile?.avatar_url || undefined} alt={profile?.full_name || "User"} />
                  <AvatarFallback className="bg-[hsl(var(--optavia-green))] text-white text-xl sm:text-2xl">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="flex flex-col gap-2 flex-1 w-full sm:w-auto items-center sm:items-start">
                <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
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
                <p className="text-xs text-optavia-gray text-center sm:text-left">JPG, PNG or GIF. Max size 5MB</p>
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
              <Label htmlFor="email" className="text-optavia-dark">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={user?.email || profile?.email || ""}
                readOnly
                disabled
                className="bg-gray-100 border-gray-200 text-optavia-dark cursor-not-allowed opacity-70"
              />
              <p className="text-xs text-optavia-gray">Email cannot be changed</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber" className="text-optavia-dark">Phone Number</Label>
              <Input
                id="phoneNumber"
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="(555) 555-5555"
                className="bg-white border-gray-300 text-optavia-dark"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="optaviaId" className="text-optavia-dark">Optavia ID</Label>
              <Input
                id="optaviaId"
                value={optaviaId}
                onChange={(e) => setOptaviaId(e.target.value)}
                placeholder="Enter your Optavia ID"
                disabled={isCoach}
                readOnly={isCoach}
                className={`${
                  isCoach 
                    ? "bg-gray-100 border-gray-200 cursor-not-allowed opacity-70" 
                    : "bg-white border-gray-300"
                } text-optavia-dark`}
              />
              {isCoach && (
                <p className="text-xs text-optavia-gray">Contact an admin to update your Optavia ID</p>
              )}
            </div>

            {/* Sponsoring Coach Section */}
            <div className="space-y-2">
              <Label className="text-optavia-dark flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-[hsl(var(--optavia-green))]" />
                Sponsoring Coach
              </Label>
              {loadingSponsor ? (
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="animate-pulse flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                    <div className="space-y-2">
                      <div className="h-4 w-24 bg-gray-200 rounded"></div>
                      <div className="h-3 w-32 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                </div>
              ) : sponsorInfo ? (
                <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border-2 border-[hsl(var(--optavia-green))]">
                      <AvatarImage src={sponsorInfo.avatar_url || undefined} alt={sponsorInfo.full_name || "Sponsor"} />
                      <AvatarFallback className="bg-[hsl(var(--optavia-green))] text-white text-sm">
                        {sponsorInfo.full_name?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "SC"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="font-semibold text-optavia-dark">{sponsorInfo.full_name || "Unknown"}</div>
                      <div className="text-sm text-optavia-gray">{sponsorInfo.email}</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-sm text-optavia-gray">
                    No sponsoring coach linked to your account.
                  </p>
                </div>
              )}
            </div>

            <Button 
              onClick={handleSaveProfile}
              className="bg-[hsl(var(--optavia-green))] hover:bg-[hsl(var(--optavia-green-dark))] text-white"
            >
              Save Changes
            </Button>
          </CardContent>
        </Card>

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

      </div>
    </div>
  )
}

