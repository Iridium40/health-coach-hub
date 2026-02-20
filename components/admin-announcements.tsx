"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useUserData } from "@/contexts/user-data-context"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { useAdminChanges } from "@/hooks/use-admin-changes"
import { AdminSaveButton } from "@/components/admin-save-button"
import { sendAnnouncementEmail } from "@/lib/email"
import { X, Plus, Edit, Trash2, Search, Send, RefreshCw, Eye, Code, Clock, Users } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface Announcement {
  id: string
  title: string
  content: string
  priority: "low" | "normal" | "high" | "urgent"
  is_active: boolean
  send_push: boolean
  send_email: boolean
  push_scheduled_at: string | null
  start_date: string | null
  end_date: string | null
  first_login_only: boolean
  created_at: string
  updated_at: string
}

export function AdminAnnouncements({ onClose }: { onClose?: () => void }) {
  const { user, profile } = useUserData()
  const { toast } = useToast()
  const supabase = createClient()
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [resendingId, setResendingId] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [announcementToDelete, setAnnouncementToDelete] = useState<string | null>(null)

  // Form state
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [priority, setPriority] = useState<"low" | "normal" | "high" | "urgent">("normal")
  const [isActive, setIsActive] = useState(true)
  const [sendPushNow, setSendPushNow] = useState(false)
  const [pushScheduledAt, setPushScheduledAt] = useState("")
  const [sendEmail, setSendEmail] = useState(false)
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [firstLoginOnly, setFirstLoginOnly] = useState(false)
  const [isHtml, setIsHtml] = useState(false)

  // Check if user is admin (case-insensitive)
  const role = profile?.user_role?.toLowerCase()
  const isAdmin = role === "admin" || role === "system_admin"

  // Track unsaved changes for admin
  const { 
    hasUnsavedChanges, 
    isSaving, 
    changeCount, 
    trackChange, 
    saveChanges,
    showLeaveDialog,
    confirmLeave,
    saveAndLeave,
    cancelLeave,
  } = useAdminChanges()

  useEffect(() => {
    if (!user || !isAdmin) {
      setLoading(false)
      return
    }
    loadAnnouncements()
  }, [user, isAdmin])

  const loadAnnouncements = async () => {
    const { data, error } = await supabase
      .from("announcements")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load announcements",
        variant: "destructive",
      })
    } else {
      setAnnouncements(data || [])
    }
    setLoading(false)
  }

  const resetForm = () => {
    setTitle("")
    setContent("")
    setPriority("normal")
    setIsActive(true)
    setSendPushNow(false)
    setPushScheduledAt("")
    setSendEmail(false)
    setStartDate("")
    setEndDate("")
    setFirstLoginOnly(false)
    setIsHtml(false)
    setEditingId(null)
    setShowForm(false)
  }

  const handleEdit = (announcement: Announcement, e?: React.MouseEvent) => {
    e?.stopPropagation()
    e?.preventDefault()
    
    setTitle(announcement.title)
    setContent(announcement.content)
    setPriority(announcement.priority)
    setIsActive(announcement.is_active)
    setSendPushNow(!announcement.push_scheduled_at && announcement.send_push)
    setPushScheduledAt(announcement.push_scheduled_at ? new Date(announcement.push_scheduled_at).toISOString().slice(0, 16) : "")
    setSendEmail(announcement.send_email || false)
    setStartDate(announcement.start_date ? new Date(announcement.start_date).toISOString().slice(0, 16) : "")
    setEndDate(announcement.end_date ? new Date(announcement.end_date).toISOString().slice(0, 16) : "")
    setFirstLoginOnly(announcement.first_login_only || false)
    setIsHtml(announcement.content.includes("<") && announcement.content.includes(">"))
    setEditingId(announcement.id)
    setShowForm(true)
  }

  const handleDelete = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation()
    e?.preventDefault()
    
    setAnnouncementToDelete(id)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!announcementToDelete) return

    const { error } = await supabase.from("announcements").delete().eq("id", announcementToDelete)

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete announcement",
        variant: "destructive",
      })
    } else {
      toast({
        title: "Success",
        description: "Announcement deleted",
      })
      trackChange()
      loadAnnouncements()
    }
    
    setDeleteDialogOpen(false)
    setAnnouncementToDelete(null)
  }

  const handleResend = async (announcement: Announcement, e?: React.MouseEvent) => {
    e?.stopPropagation()
    e?.preventDefault()
    
    if (!user || !profile) return

    setResendingId(announcement.id)

    try {
      // Update the announcement's updated_at timestamp
      const { error: updateError } = await supabase
        .from("announcements")
        .update({ 
          updated_at: new Date().toISOString(),
          is_active: true // Ensure it's active when resending
        })
        .eq("id", announcement.id)

      if (updateError) throw updateError

      // Send email notifications
      const { data: usersData, error: usersError } = await supabase
        .from("profiles")
        .select("id, email, full_name, notification_email")
        .not("email", "is", null)

      if (!usersError && usersData) {
        // Get users with email notifications enabled
        const { data: notificationSettings } = await supabase
          .from("notification_settings")
          .select("user_id")
          .eq("email_notifications", true)
          .eq("announcements_enabled", true)

        const userIdsWithEmailEnabled = new Set(
          notificationSettings?.map((ns) => ns.user_id) || []
        )

        // Filter users with email notifications enabled
        const usersToEmail = usersData.filter(
          (u) => userIdsWithEmailEnabled.has(u.id) && u.email
        )

        // Send emails with throttling
        const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
        let emailsSent = 0
        
        for (const u of usersToEmail) {
          try {
            const recipientEmail = u.notification_email || u.email!
            await sendAnnouncementEmail({
              to: recipientEmail,
              fullName: u.full_name || "Coach",
              announcementTitle: announcement.title,
              announcementContent: announcement.content,
              priority: announcement.priority,
            })
            emailsSent++
            await delay(600) // Throttle to stay under rate limit
          } catch (emailErr) {
            console.error(`Failed to send email to ${u.notification_email || u.email}:`, emailErr)
          }
        }

        toast({
          title: "Announcement Resent",
          description: `Sent ${emailsSent} email notification(s)`,
        })
        trackChange()
      } else {
        toast({
          title: "Announcement Resent",
          description: "Announcement has been resent",
        })
        trackChange()
      }

      loadAnnouncements()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to resend announcement",
        variant: "destructive",
      })
    } finally {
      setResendingId(null)
    }
  }

  const handleEditAndResend = (announcement: Announcement, e?: React.MouseEvent) => {
    e?.stopPropagation()
    e?.preventDefault()
    
    setTitle(announcement.title)
    setContent(announcement.content)
    setPriority(announcement.priority)
    setIsActive(true)
    setSendPushNow(true)
    setPushScheduledAt("")
    setSendEmail(true)
    setStartDate(announcement.start_date ? new Date(announcement.start_date).toISOString().slice(0, 16) : "")
    setEndDate(announcement.end_date ? new Date(announcement.end_date).toISOString().slice(0, 16) : "")
    setFirstLoginOnly(announcement.first_login_only || false)
    setIsHtml(announcement.content.includes("<") && announcement.content.includes(">"))
    setEditingId(announcement.id)
    setShowForm(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) return

    const announcementData = {
      title,
      content,
      priority,
      is_active: isActive,
      send_push: true,
      send_email: sendEmail,
      push_scheduled_at: !sendPushNow && pushScheduledAt 
        ? new Date(pushScheduledAt).toISOString() 
        : null,
      start_date: startDate ? new Date(startDate).toISOString() : null,
      end_date: endDate ? new Date(endDate).toISOString() : null,
      first_login_only: firstLoginOnly,
      created_by: user.id,
    }

    let error
    if (editingId) {
      const { error: updateError } = await supabase
        .from("announcements")
        .update(announcementData)
        .eq("id", editingId)
      error = updateError
    } else {
      const { error: insertError } = await supabase.from("announcements").insert(announcementData)
      error = insertError
    }

    if (error) {
      console.error("Announcement save error:", error)
      toast({
        title: "Error",
        description: error.message || error.details || "Failed to save announcement",
        variant: "destructive",
      })
    } else {
      toast({
        title: "Success",
        description: editingId ? "Announcement updated" : "Announcement created",
      })
      trackChange()
      resetForm()
      loadAnnouncements()

      // Send email notifications if enabled
      if (sendEmail && isActive) {
        try {
          // Get all users with email notifications enabled
          const { data: usersData, error: usersError } = await supabase
            .from("profiles")
            .select("id, email, full_name, notification_email")
            .not("email", "is", null)

          if (!usersError && usersData) {
            // Get users with email notifications enabled
            const { data: notificationSettings } = await supabase
              .from("notification_settings")
              .select("user_id")
              .eq("email_notifications", true)
              .eq("announcements_enabled", true)

            const userIdsWithEmailEnabled = new Set(
              notificationSettings?.map((ns) => ns.user_id) || []
            )

            // Filter users with email notifications enabled
            const usersToEmail = usersData.filter(
              (user) => userIdsWithEmailEnabled.has(user.id) && user.email
            )

            // Send emails with throttling (1 per second to stay under rate limit)
            const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
            
            for (const user of usersToEmail) {
              try {
                const recipientEmail = user.notification_email || user.email!
                await sendAnnouncementEmail({
                  to: recipientEmail,
                  fullName: user.full_name || "Coach",
                  announcementTitle: title,
                  announcementContent: content,
                  priority: priority,
                })
                // Wait 600ms between emails (allows ~1.6 emails/sec, under the 2/sec limit)
                await delay(600)
              } catch (emailErr) {
                console.error(`Failed to send email to ${user.notification_email || user.email}:`, emailErr)
              }
            }

            toast({
              title: "Emails Sent",
              description: `Sent ${usersToEmail.length} email notification(s)`,
            })
          }
        } catch (emailError) {
          console.error("Error sending announcement emails:", emailError)
          // Don't fail the announcement creation if emails fail
        }
      }

      // Send push notifications if enabled and sending now
      if (sendPushNow && isActive) {
        // TODO: Implement push notification sending
        // This would query users with announcements_enabled and send notifications
      }
    }
  }

  if (!isAdmin) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="bg-white border border-gray-200">
          <CardContent className="pt-6">
            <p className="text-center text-optavia-gray">You don't have permission to access this page.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-optavia-gray">Loading...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading font-bold text-2xl sm:text-3xl text-optavia-dark">Manage Announcements</h1>
        {onClose && (
          <Button variant="ghost" onClick={onClose} className="text-optavia-gray hover:bg-gray-100">
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Create New Announcement Section */}
      <div className="mb-8">
        {!showForm ? (
          <Button
            onClick={() => setShowForm(true)}
            className="bg-[hsl(var(--optavia-green))] hover:bg-[hsl(var(--optavia-green-dark))]"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Announcement
          </Button>
        ) : (
          <Card 
            className="bg-white border border-gray-200 shadow-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <CardHeader>
              <CardTitle className="text-optavia-dark">
                {editingId ? "Edit Announcement" : "Create New Announcement"}
              </CardTitle>
              <CardDescription className="text-optavia-gray">
                Create announcements that will be shown to users based on their notification settings
              </CardDescription>
            </CardHeader>
            <CardContent>
            <form 
              onSubmit={handleSubmit} 
              className="space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="space-y-2">
                <Label htmlFor="title" className="text-optavia-dark">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  onFocus={(e) => e.stopPropagation()}
                  required
                  className="border-gray-300 focus:border-[hsl(var(--optavia-green))] focus:ring-[hsl(var(--optavia-green-light))]"
                />
              </div>

              {/* Priority */}
              <div className="space-y-2">
                <Label className="text-optavia-dark">Priority</Label>
                <div className="flex gap-2">
                  {(["low", "normal", "high", "urgent"] as const).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPriority(p)}
                      className={`px-3 py-1.5 rounded-md text-sm font-medium capitalize border transition-colors ${
                        priority === p
                          ? p === "urgent"
                            ? "bg-red-500 text-white border-red-500"
                            : p === "high"
                              ? "bg-orange-500 text-white border-orange-500"
                              : p === "normal"
                                ? "bg-blue-500 text-white border-blue-500"
                                : "bg-gray-500 text-white border-gray-500"
                          : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Content with HTML toggle */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="content" className="text-optavia-dark">Message</Label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsHtml(false)}
                      className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
                        !isHtml ? "bg-[hsl(var(--optavia-green))] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      Plain Text
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsHtml(true)}
                      className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
                        isHtml ? "bg-[hsl(var(--optavia-green))] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      <Code className="h-3 w-3" />
                      HTML
                    </button>
                  </div>
                </div>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  onFocus={(e) => e.stopPropagation()}
                  required
                  rows={10}
                  placeholder={isHtml ? "Paste or type HTML content here..." : "Type your announcement message..."}
                  className={`border-gray-300 focus:border-[hsl(var(--optavia-green))] focus:ring-[hsl(var(--optavia-green-light))] min-h-[150px] ${
                    isHtml ? "font-mono text-sm" : ""
                  }`}
                />
                {isHtml && content && (
                  <div className="border border-gray-200 rounded-lg p-4 bg-white">
                    <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
                      <Eye className="h-3 w-3" />
                      Preview
                    </div>
                    <div 
                      className="prose prose-sm max-w-none text-optavia-gray"
                      dangerouslySetInnerHTML={{ __html: content }}
                    />
                  </div>
                )}
                {isHtml && (
                  <p className="text-xs text-optavia-gray">
                    You can paste HTML content directly. The preview shows how it will appear to users.
                  </p>
                )}
              </div>

              {/* Visibility Schedule */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-optavia-dark" />
                  <h4 className="font-medium text-optavia-dark text-sm">Visibility Schedule</h4>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5 p-3 bg-white rounded-md border border-gray-200">
                    <Label htmlFor="startDate" className="text-optavia-dark text-sm">
                      Start Date & Time
                    </Label>
                    <Input
                      id="startDate"
                      type="datetime-local"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      onFocus={(e) => e.stopPropagation()}
                      className="border-gray-300 focus:border-[hsl(var(--optavia-green))] focus:ring-[hsl(var(--optavia-green-light))]"
                    />
                    <p className="text-xs text-gray-400">Leave empty to show immediately</p>
                  </div>
                  <div className="flex flex-col gap-1.5 p-3 bg-white rounded-md border border-gray-200">
                    <Label htmlFor="endDate" className="text-optavia-dark text-sm">
                      End Date & Time
                    </Label>
                    <Input
                      id="endDate"
                      type="datetime-local"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      onFocus={(e) => e.stopPropagation()}
                      className="border-gray-300 focus:border-[hsl(var(--optavia-green))] focus:ring-[hsl(var(--optavia-green-light))]"
                    />
                    <p className="text-xs text-gray-400">Leave empty to show indefinitely</p>
                  </div>
                </div>

                <p className="text-xs text-optavia-gray">
                  {startDate && endDate
                    ? `Visible from ${new Date(startDate).toLocaleString()} to ${new Date(endDate).toLocaleString()}`
                    : startDate
                      ? `Visible starting ${new Date(startDate).toLocaleString()}`
                      : endDate
                        ? `Visible until ${new Date(endDate).toLocaleString()}`
                        : "Visible immediately with no expiration"}
                </p>
              </div>

              {/* Audience Targeting */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-optavia-dark" />
                  <h4 className="font-medium text-optavia-dark text-sm">Audience</h4>
                </div>

                <div className="flex items-center justify-between p-3 bg-white rounded-md border border-gray-200">
                  <div>
                    <Label htmlFor="firstLoginOnly" className="cursor-pointer text-optavia-dark text-sm">
                      First Login Only
                    </Label>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Only show to users who haven&apos;t completed their profile setup yet
                    </p>
                  </div>
                  <Switch
                    id="firstLoginOnly"
                    checked={firstLoginOnly}
                    onCheckedChange={setFirstLoginOnly}
                  />
                </div>
              </div>

              {/* Notification Settings */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                <h4 className="font-medium text-optavia-dark text-sm">Notification Settings</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between sm:justify-start sm:gap-3 p-3 bg-white rounded-md border border-gray-200">
                    <Label htmlFor="sendPushNow" className="cursor-pointer text-optavia-dark text-sm">
                      Send Push Now
                    </Label>
                    <Switch
                      id="sendPushNow"
                      checked={sendPushNow}
                      onCheckedChange={setSendPushNow}
                    />
                  </div>
                  <div className="flex items-center justify-between sm:justify-start sm:gap-3 p-3 bg-white rounded-md border border-gray-200">
                    <Label htmlFor="sendEmail" className="cursor-pointer text-optavia-dark text-sm">
                      Send Email
                    </Label>
                    <Switch
                      id="sendEmail"
                      checked={sendEmail}
                      onCheckedChange={setSendEmail}
                    />
                  </div>
                </div>

                {!sendPushNow && (
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 p-3 bg-white rounded-md border border-gray-200">
                    <Label htmlFor="pushScheduledAt" className="text-optavia-dark text-sm whitespace-nowrap">
                      Schedule notification for:
                    </Label>
                    <Input
                      id="pushScheduledAt"
                      type="datetime-local"
                      value={pushScheduledAt}
                      onChange={(e) => setPushScheduledAt(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      onFocus={(e) => e.stopPropagation()}
                      className="border-gray-300 focus:border-[hsl(var(--optavia-green))] focus:ring-[hsl(var(--optavia-green-light))] flex-1"
                    />
                  </div>
                )}

                <p className="text-xs text-optavia-gray">
                  {sendPushNow 
                    ? "Notifications will be sent immediately when announcement is saved." 
                    : "Select a date and time to schedule the notification."}
                  {sendEmail && " Email will be sent to users with notifications enabled."}
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  type="submit"
                  className="bg-[hsl(var(--optavia-green))] hover:bg-[hsl(var(--optavia-green-dark))]"
                >
                  {editingId ? "Update" : "Create"} Announcement
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
              </form>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="font-heading font-bold text-xl text-optavia-dark">Existing Announcements</h2>
          {announcements.length > 0 && (
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search announcements..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 border-gray-300 focus:border-[hsl(var(--optavia-green))] focus:ring-[hsl(var(--optavia-green-light))]"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
                  onClick={() => setSearchQuery("")}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          )}
        </div>
        {announcements.length === 0 ? (
          <Card className="bg-white border border-gray-200">
            <CardContent className="pt-6">
              <p className="text-center text-optavia-gray">No announcements yet. Create one to get started.</p>
            </CardContent>
          </Card>
        ) : (() => {
          const filteredAnnouncements = announcements.filter((announcement) => {
            if (!searchQuery.trim()) return true
            const query = searchQuery.toLowerCase()
            return (
              announcement.title.toLowerCase().includes(query) ||
              announcement.content.toLowerCase().includes(query)
            )
          })
          
          if (filteredAnnouncements.length === 0) {
            return (
              <Card className="bg-white border border-gray-200">
                <CardContent className="pt-6">
                  <p className="text-center text-optavia-gray">
                    No announcements found matching "{searchQuery}"
                  </p>
                </CardContent>
              </Card>
            )
          }
          
          return filteredAnnouncements.map((announcement) => (
            <Card 
              key={announcement.id} 
              className="bg-white border border-gray-200 shadow-sm"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="text-optavia-dark">{announcement.title}</CardTitle>
                      <Badge
                        variant={
                          announcement.priority === "urgent"
                            ? "destructive"
                            : announcement.priority === "high"
                              ? "default"
                              : "secondary"
                        }
                      >
                        {announcement.priority}
                      </Badge>
                      {announcement.is_active ? (
                        <Badge className="bg-green-500">Active</Badge>
                      ) : (
                        <Badge variant="outline">Inactive</Badge>
                      )}
                      {announcement.first_login_only && (
                        <Badge className="bg-purple-500">First Login Only</Badge>
                      )}
                      {announcement.content.includes("<") && announcement.content.includes(">") && (
                        <Badge variant="outline" className="text-xs"><Code className="h-3 w-3 mr-1" />HTML</Badge>
                      )}
                    </div>
                    <CardDescription className="text-optavia-gray">
                      Created: {new Date(announcement.created_at).toLocaleString()}
                      {announcement.updated_at && announcement.updated_at !== announcement.created_at && (
                        <> • <span className="text-[hsl(var(--optavia-green))] font-medium">Last Sent: {new Date(announcement.updated_at).toLocaleString()}</span></>
                      )}
                    </CardDescription>
                    {(announcement.start_date || announcement.end_date) && (
                      <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                        <Clock className="h-3 w-3" />
                        {announcement.start_date && announcement.end_date
                          ? `${new Date(announcement.start_date).toLocaleString()} → ${new Date(announcement.end_date).toLocaleString()}`
                          : announcement.start_date
                            ? `Starts: ${new Date(announcement.start_date).toLocaleString()}`
                            : `Ends: ${new Date(announcement.end_date!).toLocaleString()}`}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => handleResend(announcement, e)}
                      disabled={resendingId === announcement.id}
                      className="text-[hsl(var(--optavia-green))] hover:bg-green-50"
                      title="Resend Now"
                    >
                      {resendingId === announcement.id ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => handleEditAndResend(announcement, e)}
                      className="text-blue-500 hover:bg-blue-50"
                      title="Edit & Resend"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => handleDelete(announcement.id, e)}
                      className="text-red-500 hover:bg-red-50"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {announcement.content.includes("<") && announcement.content.includes(">") ? (
                  <div 
                    className="prose prose-sm max-w-none text-optavia-gray"
                    dangerouslySetInnerHTML={{ __html: announcement.content }}
                  />
                ) : (
                  <p className="text-sm text-optavia-gray whitespace-pre-wrap">{announcement.content}</p>
                )}
              </CardContent>
            </Card>
          ))
        })()}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Announcement</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this announcement? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setAnnouncementToDelete(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Floating Save Button */}
      <AdminSaveButton
        hasUnsavedChanges={hasUnsavedChanges}
        isSaving={isSaving}
        changeCount={changeCount}
        onSave={saveChanges}
        showLeaveDialog={showLeaveDialog}
        onConfirmLeave={confirmLeave}
        onSaveAndLeave={saveAndLeave}
        onCancelLeave={cancelLeave}
      />
    </div>
  )
}
