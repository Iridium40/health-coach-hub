"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/hooks/use-auth"
import { useSupabaseData } from "@/hooks/use-supabase-data"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { X, Plus, Edit, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface Announcement {
  id: string
  title: string
  content: string
  priority: "low" | "normal" | "high" | "urgent"
  is_active: boolean
  send_push: boolean
  push_scheduled_at: string | null
  start_date: string | null
  end_date: string | null
  created_at: string
  updated_at: string
}

export function AdminAnnouncements({ onClose }: { onClose?: () => void }) {
  const { user } = useAuth()
  const { profile } = useSupabaseData(user)
  const { toast } = useToast()
  const supabase = createClient()
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)

  // Form state
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [priority, setPriority] = useState<"low" | "normal" | "high" | "urgent">("normal")
  const [isActive, setIsActive] = useState(true)
  const [sendPushNow, setSendPushNow] = useState(false) // true = send now, false = schedule
  const [pushScheduledAt, setPushScheduledAt] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  // Check if user is admin (case-insensitive)
  const isAdmin = profile?.user_role?.toLowerCase() === "admin"

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
    setStartDate("")
    setEndDate("")
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
    // If push_scheduled_at exists, it's scheduled; otherwise it's "send now"
    setSendPushNow(!announcement.push_scheduled_at && announcement.send_push)
    setPushScheduledAt(announcement.push_scheduled_at ? new Date(announcement.push_scheduled_at).toISOString().slice(0, 16) : "")
    setStartDate(announcement.start_date ? new Date(announcement.start_date).toISOString().slice(0, 16) : "")
    setEndDate(announcement.end_date ? new Date(announcement.end_date).toISOString().slice(0, 16) : "")
    setEditingId(announcement.id)
    setShowForm(true)
  }

  const handleDelete = async (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation()
    e?.preventDefault()
    
    if (!confirm("Are you sure you want to delete this announcement?")) return

    const { error } = await supabase.from("announcements").delete().eq("id", id)

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
      loadAnnouncements()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) return

    const announcementData = {
      title,
      content,
      priority,
      is_active: isActive,
      send_push: true, // Always true if we're setting notification time
      // If sendPushNow is true, push_scheduled_at is null (send immediately)
      // If sendPushNow is false, use the scheduled date/time
      push_scheduled_at: !sendPushNow && pushScheduledAt 
        ? new Date(pushScheduledAt).toISOString() 
        : null,
      start_date: startDate ? new Date(startDate).toISOString() : null,
      end_date: endDate ? new Date(endDate).toISOString() : null,
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
      toast({
        title: "Error",
        description: error.message || "Failed to save announcement",
        variant: "destructive",
      })
    } else {
      toast({
        title: "Success",
        description: editingId ? "Announcement updated" : "Announcement created",
      })
      resetForm()
      loadAnnouncements()

      // Send notifications if enabled and sending now
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
        <div className="flex gap-2">
          {!showForm && (
            <Button
              onClick={() => setShowForm(true)}
              className="bg-[hsl(var(--optavia-green))] hover:bg-[hsl(var(--optavia-green-dark))]"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Announcement
            </Button>
          )}
          {onClose && (
            <Button variant="ghost" onClick={onClose} className="text-optavia-gray hover:bg-gray-100">
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {showForm && (
        <Card 
          className="mb-6 bg-white border border-gray-200 shadow-sm"
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

              <div className="space-y-2">
                <Label htmlFor="content" className="text-optavia-dark">Message</Label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  onFocus={(e) => e.stopPropagation()}
                  required
                  rows={6}
                  className="border-gray-300 focus:border-[hsl(var(--optavia-green))] focus:ring-[hsl(var(--optavia-green-light))]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate" className="text-optavia-dark">Start Date</Label>
                  <Input
                    id="startDate"
                    type="datetime-local"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    onFocus={(e) => e.stopPropagation()}
                    className="border-gray-300 focus:border-[hsl(var(--optavia-green))] focus:ring-[hsl(var(--optavia-green-light))]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endDate" className="text-optavia-dark">End Date</Label>
                  <Input
                    id="endDate"
                    type="datetime-local"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    onFocus={(e) => e.stopPropagation()}
                    className="border-gray-300 focus:border-[hsl(var(--optavia-green))] focus:ring-[hsl(var(--optavia-green-light))]"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="pushScheduledAt" className="text-optavia-dark">
                    Notification Time
                  </Label>
                  <Input
                    id="pushScheduledAt"
                    type="datetime-local"
                    value={pushScheduledAt}
                    onChange={(e) => setPushScheduledAt(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    onFocus={(e) => e.stopPropagation()}
                    disabled={sendPushNow}
                    className="border-gray-300 focus:border-[hsl(var(--optavia-green))] focus:ring-[hsl(var(--optavia-green-light))] disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="sendPushNow"
                    checked={sendPushNow}
                    onCheckedChange={setSendPushNow}
                  />
                  <Label htmlFor="sendPushNow" className="cursor-pointer text-optavia-dark">
                    Send Push Notification Now
                  </Label>
                </div>
                {sendPushNow && (
                  <p className="text-xs text-optavia-gray">
                    Notification will be sent immediately when announcement is created/updated
                  </p>
                )}
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

      <div className="space-y-4">
        <h2 className="font-heading font-bold text-xl text-optavia-dark">Existing Announcements</h2>
        {announcements.length === 0 ? (
          <Card className="bg-white border border-gray-200">
            <CardContent className="pt-6">
              <p className="text-center text-optavia-gray">No announcements yet. Create one to get started.</p>
            </CardContent>
          </Card>
        ) : (
          announcements.map((announcement) => (
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
                    </div>
                    <CardDescription className="text-optavia-gray">
                      Created: {new Date(announcement.created_at).toLocaleString()}
                      {announcement.start_date && (
                        <> • Starts: {new Date(announcement.start_date).toLocaleString()}</>
                      )}
                      {announcement.end_date && (
                        <> • Ends: {new Date(announcement.end_date).toLocaleString()}</>
                      )}
                      {announcement.send_push && (
                        <>
                          {announcement.push_scheduled_at ? (
                            <> • Push Scheduled: {new Date(announcement.push_scheduled_at).toLocaleString()}</>
                          ) : (
                            <> • Push: Send Now</>
                          )}
                        </>
                      )}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation()
                        e.preventDefault()
                        handleEdit(announcement, e)
                      }}
                      className="text-optavia-gray hover:bg-gray-100"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation()
                        e.preventDefault()
                        handleDelete(announcement.id, e)
                      }}
                      className="text-red-500 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-optavia-gray whitespace-pre-wrap">{announcement.content}</p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}

