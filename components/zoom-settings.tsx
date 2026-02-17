"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useUserData } from "@/contexts/user-data-context"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"
import { Video, ArrowLeft, Save, ExternalLink, Copy, Check } from "lucide-react"
import Link from "next/link"

interface ZoomSettingsProps {
  onClose?: () => void
  embedded?: boolean
}

export function ZoomSettings({ onClose, embedded = false }: ZoomSettingsProps) {
  const { user, profile, refreshData } = useUserData()
  const { toast } = useToast()
  const supabase = createClient()

  const [zoomLink, setZoomLink] = useState("")
  const [zoomMeetingId, setZoomMeetingId] = useState("")
  const [zoomPasscode, setZoomPasscode] = useState("")
  const [saving, setSaving] = useState(false)
  const [copied, setCopied] = useState(false)

  // Load existing values from profile
  useEffect(() => {
    if (profile) {
      setZoomLink(profile.zoom_link || "")
      setZoomMeetingId(profile.zoom_meeting_id || "")
      setZoomPasscode(profile.zoom_passcode || "")
    }
  }, [profile])

  const handleSave = async () => {
    if (!user) return

    setSaving(true)
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          zoom_link: zoomLink || null,
          zoom_meeting_id: zoomMeetingId || null,
          zoom_passcode: zoomPasscode || null,
        })
        .eq("id", user.id)

      if (error) throw error

      await refreshData()
      
      toast({
        title: "Zoom details saved!",
        description: "Your Zoom room information has been updated.",
      })
    } catch (error) {
      console.error("Error saving zoom details:", error)
      toast({
        title: "Error",
        description: "Failed to save Zoom details. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleCopyLink = async () => {
    if (!zoomLink) return
    try {
      await navigator.clipboard.writeText(zoomLink)
      setCopied(true)
      toast({
        title: "Copied!",
        description: "Zoom link copied to clipboard.",
      })
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Please try again",
        variant: "destructive",
      })
    }
  }

  // Format meeting ID with spaces for display
  const formatMeetingId = (id: string) => {
    const cleaned = id.replace(/\D/g, "")
    if (cleaned.length <= 3) return cleaned
    if (cleaned.length <= 6) return `${cleaned.slice(0, 3)} ${cleaned.slice(3)}`
    if (cleaned.length <= 10) return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 7)} ${cleaned.slice(7, 11)}`
  }

  const handleMeetingIdChange = (value: string) => {
    // Remove spaces and non-digits for storage, keep only numbers
    const cleaned = value.replace(/\D/g, "").slice(0, 11)
    setZoomMeetingId(cleaned)
  }

  return (
    <div className={embedded ? "" : "container mx-auto px-4 py-8 max-w-2xl"}>
      {!embedded && (
        <>
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon" className="text-optavia-gray hover:text-optavia-dark">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="font-heading font-bold text-2xl sm:text-3xl text-optavia-dark">
                Zoom Room Settings
              </h1>
              <p className="text-optavia-gray text-sm">
                Save your personal Zoom room details for easy sharing
              </p>
            </div>
          </div>
        </>
      )}

      {/* Main Form Card */}
      <Card className="bg-white border border-gray-200 shadow-sm mb-6">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Video className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-optavia-dark">Zoom Details</CardTitle>
          </div>
          <CardDescription>
            Enter your personal Zoom room information. This will be used when sharing meetings with clients.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Zoom Link */}
          <div className="space-y-2">
            <Label htmlFor="zoomLink" className="text-optavia-dark font-medium">
              Zoom Link
            </Label>
            <div className="flex gap-2">
              <Input
                id="zoomLink"
                type="url"
                value={zoomLink}
                onChange={(e) => setZoomLink(e.target.value)}
                placeholder="https://zoom.us/j/1234567890"
                className="flex-1 border-gray-300"
              />
              {zoomLink && (
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleCopyLink}
                  className="shrink-0"
                >
                  {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                </Button>
              )}
            </div>
            <p className="text-xs text-optavia-gray">
              Your personal Zoom meeting room link
            </p>
          </div>

          {/* Meeting ID and Passcode */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="zoomMeetingId" className="text-optavia-dark font-medium">
                Meeting ID
              </Label>
              <Input
                id="zoomMeetingId"
                type="text"
                value={formatMeetingId(zoomMeetingId)}
                onChange={(e) => handleMeetingIdChange(e.target.value)}
                placeholder="123 456 7890"
                className="border-gray-300"
              />
              <p className="text-xs text-optavia-gray">
                Your Zoom meeting ID number
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="zoomPasscode" className="text-optavia-dark font-medium">
                Passcode
              </Label>
              <Input
                id="zoomPasscode"
                type="text"
                value={zoomPasscode}
                onChange={(e) => setZoomPasscode(e.target.value)}
                placeholder="OPTAVIA"
                className="border-gray-300"
              />
              <p className="text-xs text-optavia-gray">
                Meeting passcode (if required)
              </p>
            </div>
          </div>

          {/* Save Button */}
          <div className="pt-4 border-t border-gray-200">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="w-full sm:w-auto bg-[hsl(var(--optavia-green))] hover:bg-[hsl(var(--optavia-green-dark))] text-white"
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? "Saving..." : "Save Zoom Details"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Preview Card */}
      {(zoomLink || zoomMeetingId || zoomPasscode) && (
        <Card className="bg-blue-50 border border-blue-200">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Video className="h-4 w-4 text-blue-600" />
              <CardTitle className="text-sm text-blue-900">Preview</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {zoomLink && (
              <div className="flex items-center justify-between gap-2 p-2 bg-white rounded border border-blue-100">
                <a 
                  href={zoomLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline truncate flex-1"
                >
                  {zoomLink}
                </a>
                <ExternalLink className="h-4 w-4 text-blue-500 shrink-0" />
              </div>
            )}
            <div className="flex flex-wrap gap-4 text-sm">
              {zoomMeetingId && (
                <div>
                  <span className="text-blue-700">Meeting ID: </span>
                  <strong className="text-blue-900">{formatMeetingId(zoomMeetingId)}</strong>
                </div>
              )}
              {zoomPasscode && (
                <div>
                  <span className="text-blue-700">Passcode: </span>
                  <strong className="text-blue-900">{zoomPasscode}</strong>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Help Text */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <h3 className="font-medium text-optavia-dark mb-2">Where to find your Zoom details?</h3>
        <ol className="text-sm text-optavia-gray space-y-1 list-decimal list-inside">
          <li>Open Zoom and go to your Personal Meeting Room settings</li>
          <li>Copy your Personal Meeting ID and Passcode</li>
          <li>Your Zoom link is usually: zoom.us/j/[your-meeting-id]</li>
        </ol>
      </div>
    </div>
  )
}
