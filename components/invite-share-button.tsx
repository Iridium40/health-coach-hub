"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"
import { generateInviteKey, createInviteLink } from "@/lib/invites"
import { Share2, Copy, Check } from "lucide-react"

interface InviteShareButtonProps {
  invitedEmail?: string
  expiresInDays?: number
}

export function InviteShareButton({ invitedEmail, expiresInDays = 14 }: InviteShareButtonProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const supabase = createClient()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [inviteLink, setInviteLink] = useState("")
  const [copied, setCopied] = useState(false)
  const [email, setEmail] = useState(invitedEmail || "")

  const handleGenerateInvite = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to create invites",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const inviteKey = generateInviteKey()
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + expiresInDays)

      const { data, error } = await supabase
        .from("invites")
        .insert({
          invite_key: inviteKey,
          invited_by: user.id,
          invited_email: email || null,
          expires_at: expiresAt.toISOString(),
          is_active: true,
        })
        .select()
        .single()

      if (error) throw error

      const link = createInviteLink(inviteKey)
      setInviteLink(link)
      
      toast({
        title: "Success",
        description: "Invite link generated successfully",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to generate invite link",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCopyLink = async () => {
    if (!inviteLink) return

    try {
      await navigator.clipboard.writeText(inviteLink)
      setCopied(true)
      toast({
        title: "Copied",
        description: "Invite link copied to clipboard",
      })
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy link",
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="gap-2 border-gray-300 text-optavia-dark hover:bg-gray-100"
        >
          <Share2 className="h-4 w-4" />
          Share Invite Link
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-white">
        <DialogHeader>
          <DialogTitle className="text-optavia-dark">Create Invite Link</DialogTitle>
          <DialogDescription className="text-optavia-gray">
            Generate a link to invite new users to sign up
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="inviteEmail" className="text-optavia-dark">
              Email (Optional)
            </Label>
            <Input
              id="inviteEmail"
              type="email"
              placeholder="user@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border-gray-300 focus:border-[hsl(var(--optavia-green))] focus:ring-[hsl(var(--optavia-green-light))]"
            />
            <p className="text-xs text-optavia-gray">
              Leave empty for an open invite, or specify an email to restrict to that user
            </p>
          </div>

          {!inviteLink ? (
            <Button
              onClick={handleGenerateInvite}
              disabled={loading}
              className="w-full bg-[hsl(var(--optavia-green))] hover:bg-[hsl(var(--optavia-green-dark))]"
            >
              {loading ? "Generating..." : "Generate Invite Link"}
            </Button>
          ) : (
            <div className="space-y-2">
              <Label className="text-optavia-dark">Invite Link</Label>
              <div className="flex gap-2">
                <Input
                  value={inviteLink}
                  readOnly
                  className="border-gray-300 bg-gray-50 text-optavia-dark"
                />
                <Button
                  onClick={handleCopyLink}
                  variant="outline"
                  size="icon"
                  className="border-gray-300 hover:bg-gray-100"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-optavia-gray">
                Share this link with users you want to invite. The link expires in {expiresInDays} days.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

