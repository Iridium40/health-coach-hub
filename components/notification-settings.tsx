"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useUserData } from "@/contexts/user-data-context"
import { useToast } from "@/hooks/use-toast"
import { Bell, Mail, Check, Phone } from "lucide-react"
import { isValidUSPhoneNumber } from "@/lib/sms"

export function NotificationSettings() {
  const { profile, notificationSettings, updateNotificationSettings, updateProfile, user } = useUserData()
  const { toast } = useToast()
  const [notificationEmail, setNotificationEmail] = useState("")
  const [notificationPhone, setNotificationPhone] = useState("")
  const [emailSaving, setEmailSaving] = useState(false)
  const [emailSaved, setEmailSaved] = useState(false)
  const [phoneSaving, setPhoneSaving] = useState(false)
  const [phoneSaved, setPhoneSaved] = useState(false)

  // Load notification email and phone from profile
  useEffect(() => {
    if (profile) {
      setNotificationEmail(profile.notification_email || "")
      setNotificationPhone(profile.notification_phone || "")
    }
  }, [profile])

  // Format phone for display
  const formatPhoneDisplay = (value: string) => {
    const cleaned = value.replace(/\D/g, '')
    if (cleaned.length <= 3) return cleaned
    if (cleaned.length <= 6) return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`
  }

  const handlePhoneChange = (value: string) => {
    // Only allow digits, up to 10
    const cleaned = value.replace(/\D/g, '').slice(0, 10)
    setNotificationPhone(cleaned)
  }

  const handleNotificationSettingChange = async (
    key: "push_enabled" | "announcements_enabled" | "progress_updates_enabled" | "email_notifications",
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

  const handleSaveNotificationPhone = async () => {
    if (!user) return
    
    // Validate phone if provided
    if (notificationPhone && !isValidUSPhoneNumber(notificationPhone)) {
      toast({
        title: "Invalid phone number",
        description: "Please enter a valid 10-digit US phone number",
        variant: "destructive",
      })
      return
    }
    
    setPhoneSaving(true)
    try {
      const { error } = await updateProfile({
        notification_phone: notificationPhone || null,
      })
      
      if (error) {
        toast({
          title: "Error",
          description: "Failed to save notification phone",
          variant: "destructive",
        })
      } else {
        setPhoneSaved(true)
        setTimeout(() => setPhoneSaved(false), 2000)
        toast({
          title: "Saved",
          description: "Notification phone updated",
        })
      }
    } finally {
      setPhoneSaving(false)
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
            Email address for receiving announcements and calendar invites
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

      {/* Notification Phone Card */}
      <Card className="bg-white border border-gray-200 shadow-lg mb-6">
        <CardHeader>
          <CardTitle className="text-optavia-dark flex items-center gap-2">
            <Phone className="h-5 w-5 text-teal-600" />
            Notification Phone (SMS)
          </CardTitle>
          <CardDescription className="text-optavia-gray">
            Phone number for sending SMS calendar invites to clients/prospects
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <div className="flex">
                <span className="inline-flex items-center px-3 text-sm text-gray-500 bg-gray-100 border border-r-0 border-gray-300 rounded-l-md">
                  +1
                </span>
                <Input
                  type="tel"
                  value={formatPhoneDisplay(notificationPhone)}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  placeholder="(555) 555-5555"
                  className="bg-white border-gray-300 text-optavia-dark rounded-l-none"
                  maxLength={14}
                />
              </div>
              <p className="text-xs text-optavia-gray mt-2">
                {notificationPhone.length === 10 ? (
                  <span className="text-green-600">✓ Valid 10-digit US phone number</span>
                ) : (
                  "Enter your 10-digit US phone number (US only)"
                )}
              </p>
            </div>
            <Button
              onClick={handleSaveNotificationPhone}
              disabled={phoneSaving || (notificationPhone.length > 0 && notificationPhone.length !== 10)}
              className="bg-teal-600 hover:bg-teal-700 text-white sm:w-auto"
            >
              {phoneSaved ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Saved
                </>
              ) : phoneSaving ? (
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
            <CardTitle className="text-optavia-dark">Manage Notifications</CardTitle>
            <CardDescription className="text-optavia-gray">
              Choose how you want to receive updates and alerts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between py-2">
              <div className="space-y-0.5">
                <Label className="text-optavia-dark font-medium">Push Notifications</Label>
                <p className="text-sm text-optavia-gray">Receive push notifications on your device</p>
              </div>
              <Switch
                checked={notificationSettings.push_enabled}
                onCheckedChange={(checked) =>
                  handleNotificationSettingChange("push_enabled", checked)
                }
              />
            </div>

            <div className="border-t border-gray-100" />

            <div className="flex items-center justify-between py-2">
              <div className="space-y-0.5">
                <Label className="text-optavia-dark font-medium">Announcements</Label>
                <p className="text-sm text-optavia-gray">Get notified about new announcements from your team</p>
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
                <Label className="text-optavia-dark font-medium">Progress Updates</Label>
                <p className="text-sm text-optavia-gray">Get notified when you earn badges or reach milestones</p>
              </div>
              <Switch
                checked={notificationSettings.progress_updates_enabled}
                onCheckedChange={(checked) =>
                  handleNotificationSettingChange("progress_updates_enabled", checked)
                }
              />
            </div>

            <div className="border-t border-gray-100" />

            <div className="flex items-center justify-between py-2">
              <div className="space-y-0.5">
                <Label className="text-optavia-dark font-medium">Email Notifications</Label>
                <p className="text-sm text-optavia-gray">Receive important updates via email</p>
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

