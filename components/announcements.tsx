"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { X, Bell, AlertCircle, Info, AlertTriangle } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/hooks/use-auth"
import { useSupabaseData } from "@/hooks/use-supabase-data"

interface Announcement {
  id: string
  title: string
  content: string
  priority: "low" | "normal" | "high" | "urgent"
  is_active: boolean
  send_push: boolean
  start_date: string | null
  end_date: string | null
  first_login_only: boolean
  created_at: string
}

export function Announcements() {
  const { user } = useAuth()
  const { profile, notificationSettings } = useSupabaseData(user)
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [readAnnouncements, setReadAnnouncements] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }

    loadAnnouncements()
    loadReadAnnouncements()
  }, [user])

  const loadAnnouncements = async () => {
    const now = new Date().toISOString()
    const { data, error } = await supabase
      .from("announcements")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(5)

    if (!error && data) {
      // Filter by start_date and end_date if they exist
      const filtered = data.filter((announcement => {
        if (announcement.start_date && announcement.start_date > now) {
          return false // Not started yet
        }
        if (announcement.end_date && announcement.end_date < now) {
          return false // Already expired
        }
        return true
      }))
      setAnnouncements(filtered)
    }
    setLoading(false)
  }

  const loadReadAnnouncements = async () => {
    if (!user) return

    const { data } = await supabase
      .from("announcement_reads")
      .select("announcement_id")
      .eq("user_id", user.id)

    if (data) {
      setReadAnnouncements(new Set(data.map((r) => r.announcement_id)))
    }
  }

  const markAsRead = async (announcementId: string) => {
    if (!user) return

    const { error } = await supabase.from("announcement_reads").insert({
      user_id: user.id,
      announcement_id: announcementId,
    })

    if (!error) {
      setReadAnnouncements((prev) => new Set([...prev, announcementId]))
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "urgent":
        return <AlertCircle className="h-4 w-4 text-red-500" />
      case "high":
        return <AlertTriangle className="h-4 w-4 text-orange-500" />
      case "normal":
        return <Info className="h-4 w-4 text-blue-500" />
      default:
        return <Bell className="h-4 w-4 text-gray-500" />
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "urgent":
        return <Badge variant="destructive">Urgent</Badge>
      case "high":
        return <Badge className="bg-orange-500">High</Badge>
      case "normal":
        return <Badge variant="secondary">Normal</Badge>
      default:
        return <Badge variant="outline">Low</Badge>
    }
  }

  if (loading) {
    return null
  }

  if (announcements.length === 0) {
    return null
  }

  const isNewCoach = profile?.is_new_coach ?? false

  const unreadAnnouncements = announcements.filter((announcement) => {
    if (readAnnouncements.has(announcement.id)) return false
    if (!(notificationSettings?.announcements_enabled ?? true)) return false
    if (announcement.first_login_only && !isNewCoach) return false
    return true
  })

  if (unreadAnnouncements.length === 0) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-4 space-y-4">
      {unreadAnnouncements.map((announcement) => (
        <Card
          key={announcement.id}
          className={`border-l-4 ${
            announcement.priority === "urgent"
              ? "border-red-500"
              : announcement.priority === "high"
                ? "border-orange-500"
                : "border-blue-500"
          }`}
        >
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2 flex-1">
                {getPriorityIcon(announcement.priority)}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <CardTitle className="text-base sm:text-lg">{announcement.title}</CardTitle>
                    {getPriorityBadge(announcement.priority)}
                  </div>
                  <CardDescription className="text-xs sm:text-sm">
                    {new Date(announcement.created_at).toLocaleDateString()}
                  </CardDescription>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => markAsRead(announcement.id)}
              >
                <X className="h-4 w-4" />
              </Button>
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
            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={() => markAsRead(announcement.id)}
            >
              Mark as Read
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

