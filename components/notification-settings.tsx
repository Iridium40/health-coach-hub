"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useUserData } from "@/contexts/user-data-context"
import { useToast } from "@/hooks/use-toast"
import { Bell, Mail, Check } from "lucide-react"

export function NotificationSettings() {
  const { profile, notificationSettings, updateNotificationSettings, updateProfile, user } = useUserData()
  const { toast } = useToast()
  const [notificationEmail, setNotificationEmail] = useState("")
  const [emailSaving, setEmailSaving] = useState(false)
  const [emailSaved, setEmailSaved] = useState(false)

  // Load notification email from profile
  useEffect(() => {
    if (profile) {
      setNotificationEmail(profile.notification_email || "")
    }
  }, [profile])

  const handleNotificationSettingChange = async (
    key: "announcements_enabled" | "email_notifications",
    value: boolean
  ) => {
    if (!notificationSettings) return
    await updateNotificationSettings({ [key]: value })
  }

  const handleSaveNotificationEmail = async () => {
    if (!user) return
    
    setEmailSaving(true)
    try {
      const { error } = await updateProfile({
        notification_email: notificationEmail || null,
      })
      
      if (error) {
        toast({
          title: "Error",
          description: "Failed to save notification email",
          variant: "destructive",
        })
      } else {
        setEmailSaved(true)
        setTimeout(() => setEmailSaved(false), 2000)
        toast({
          title: "Saved",
          description: "Notification email updated",
        })
      }
    } finally {
      setEmailSaving(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center gap-3 mb-6">
        <Bell className="h-7 w-7 text-[hsl(var(--optavia-green))]" />
        <h1 className="font-heading font-bold text-2xl sm:text-3xl text-optavia-dark">Notification Settings</h1>
      </div>

      {/* Notification Email Card */}
      <Card className="bg-white border border-gray-200 shadow-lg mb-6">
        <CardHeader>
          <CardTitle className="text-optavia-dark flex items-center gap-2">
            <Mail className="h-5 w-5 text-[hsl(var(--optavia-green))]" />
            Notification Email
          </CardTitle>
          <CardDescription className="text-optavia-gray">
            All notifications (announcements, badges, calendar invites) are sent to this email
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <Input
                type="email"
                value={notificationEmail}
                onChange={(e) => setNotificationEmail(e.target.value)}
                placeholder={user?.email || "your-email@example.com"}
                className="bg-white border-gray-300 text-optavia-dark"
              />
              <p className="text-xs text-optavia-gray mt-2">
                If left blank, your login email ({user?.email}) will be used.
              </p>
            </div>
            <Button
              onClick={handleSaveNotificationEmail}
              disabled={emailSaving}
              className="bg-[hsl(var(--optavia-green))] hover:bg-[hsl(var(--optavia-green-dark))] text-white sm:w-auto"
            >
              {emailSaved ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Saved
                </>
              ) : emailSaving ? (
                "Saving..."
              ) : (
                "Save"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {notificationSettings ? (
        <Card className="bg-white border border-gray-200 shadow-lg">
          <CardHeader>
            <CardTitle className="text-optavia-dark">Email Notification Preferences</CardTitle>
            <CardDescription className="text-optavia-gray">
              All notifications below are sent via email to your notification email address above
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between py-2">
              <div className="space-y-0.5">
                <Label className="text-optavia-dark font-medium">Announcements</Label>
                <p className="text-sm text-optavia-gray">Receive team announcements via email</p>
              </div>
              <Switch
                checked={notificationSettings.announcements_enabled}
                onCheckedChange={(checked) =>
                  handleNotificationSettingChange("announcements_enabled", checked)
                }
              />
            </div>

            <div className="border-t border-gray-100" />

            <div className="flex items-center justify-between py-2">
              <div className="space-y-0.5">
                <Label className="text-optavia-dark font-medium">General Email Updates</Label>
                <p className="text-sm text-optavia-gray">Receive other important updates via email</p>
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
      ) : (
        <Card className="bg-white border border-gray-200 shadow-lg">
          <CardContent className="py-8">
            <p className="text-center text-optavia-gray">Loading notification settings...</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

