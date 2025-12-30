"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useAuth } from "@/hooks/use-auth"
import { useSupabaseData } from "@/hooks/use-supabase-data"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"
import { generateInviteKey, createInviteLink } from "@/lib/invites"
import { sendInviteEmail } from "@/lib/email"
import { Switch } from "@/components/ui/switch"
import { X, Copy, Check, UserPlus } from "lucide-react"

interface InviteManagementProps {
  onClose?: () => void
}

interface GeneratedInvite {
  id: string
  fullName: string
  email: string
  coachRank: string
  inviteLink: string
  createdAt: string
}

export function InviteManagement({ onClose }: InviteManagementProps) {
  const { user } = useAuth()
  const { profile } = useSupabaseData(user)
  const { toast } = useToast()
  const supabase = createClient()

  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [coachRank, setCoachRank] = useState("")
  const [sendEmail, setSendEmail] = useState(true) // Default to sending email
  const [loading, setLoading] = useState(false)
  const [generatedInvites, setGeneratedInvites] = useState<GeneratedInvite[]>([])

  const isAdmin = profile?.user_role?.toLowerCase() === "admin"

  const handleGenerateInvite = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to create invites",
        variant: "destructive",
      })
      return
    }

    if (!fullName) {
      toast({
        title: "Error",
        description: "Full name is required",
        variant: "destructive",
      })
      return
    }

    if (!email) {
      toast({
        title: "Error",
        description: "Email address is required",
        variant: "destructive",
      })
      return
    }

    if (!coachRank) {
      toast({
        title: "Error",
        description: "Coach rank is required",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const inviteKey = generateInviteKey()
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + 30) // 30 days expiration

      const { data, error } = await supabase
        .from("invites")
        .insert({
          invite_key: inviteKey,
          invited_by: user.id,
          invited_email: email,
          expires_at: expiresAt.toISOString(),
          is_active: true,
        })
        .select()
        .single()

      if (error) throw error

      const link = createInviteLink(inviteKey)

      // Store invite metadata (we'll store this in a separate table or in the invite record)
      // For now, we'll just add it to local state
      const newInvite: GeneratedInvite = {
        id: data.id,
        fullName: fullName || "",
        email: email,
        coachRank: coachRank || "",
        inviteLink: link,
        createdAt: new Date().toISOString(),
      }

      setGeneratedInvites((prev) => [newInvite, ...prev])

      // Send email if enabled
      if (sendEmail) {
        const emailResult = await sendInviteEmail({
          to: email,
          fullName: fullName,
          coachRank: coachRank,
          inviteLink: link,
          invitedBy: profile?.full_name || user.email || "an admin",
        })

        if (!emailResult.success) {
          toast({
            title: "Invite Created",
            description: "Invite link generated, but email failed to send. You can copy the link manually.",
            variant: "default",
          })
        } else {
          toast({
            title: "Success",
            description: "Invite link generated and email sent successfully",
          })
        }
      } else {
        toast({
          title: "Success",
          description: "Invite link generated successfully",
        })
      }

      // Reset form
      setFullName("")
      setEmail("")
      setCoachRank("")
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

  const handleCopyLink = async (link: string) => {
    try {
      await navigator.clipboard.writeText(link)
      toast({
        title: "Copied",
        description: "Invite link copied to clipboard",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy link",
        variant: "destructive",
      })
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

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading font-bold text-2xl sm:text-3xl text-optavia-dark">Invite Coach</h1>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="space-y-6">
        {/* Create Invite Form */}
        <Card className="bg-white border border-gray-200 shadow-lg">
          <CardHeader>
            <CardTitle className="text-optavia-dark flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Create New Invite
            </CardTitle>
            <CardDescription className="text-optavia-gray">
              Generate an invite link for a new coach with their information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-optavia-dark">Full Name *</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="bg-white border-gray-300 text-optavia-dark focus:border-[hsl(var(--optavia-green))] focus:ring-[hsl(var(--optavia-green-light))]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-optavia-dark">Email Address *</Label>
              <Input
                id="email"
                type="email"
                placeholder="user@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-white border-gray-300 text-optavia-dark focus:border-[hsl(var(--optavia-green))] focus:ring-[hsl(var(--optavia-green-light))]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="coachRank" className="text-optavia-dark">Coach Rank *</Label>
              <Select value={coachRank} onValueChange={setCoachRank} required>
                <SelectTrigger id="coachRank" className="w-full border-2 border-gray-300 text-optavia-dark bg-white hover:border-[hsl(var(--optavia-green))] focus:border-[hsl(var(--optavia-green))] focus:ring-[hsl(var(--optavia-green-light))]">
                  <SelectValue placeholder="Select coach rank" />
                </SelectTrigger>
                <SelectContent className="bg-white text-optavia-dark">
                  <SelectItem value="Coach">Coach</SelectItem>
                  <SelectItem value="SC">Senior Coach (SC)</SelectItem>
                  <SelectItem value="MG">Manager (MG)</SelectItem>
                  <SelectItem value="AD">Associate Director (AD)</SelectItem>
                  <SelectItem value="DR">Director (DR)</SelectItem>
                  <SelectItem value="ED">Executive Director (ED)</SelectItem>
                  <SelectItem value="IED">Integrated Executive Director (IED)</SelectItem>
                  <SelectItem value="FIBC">Fully Integrated Business Coach (FIBC)</SelectItem>
                  <SelectItem value="IGD">Integrated Global Director (IGD)</SelectItem>
                  <SelectItem value="FIBL">Fully Integrated Business Leader (FIBL)</SelectItem>
                  <SelectItem value="IND">Integrated National Director (IND)</SelectItem>
                  <SelectItem value="IPD">Integrated Presidential Director (IPD)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <Switch
                id="sendEmail"
                checked={sendEmail}
                onCheckedChange={setSendEmail}
              />
              <Label htmlFor="sendEmail" className="cursor-pointer text-optavia-dark">
                Send email invitation
              </Label>
            </div>
            {sendEmail && (
              <p className="text-xs text-optavia-gray -mt-2">
                An email with the invite link will be sent to {email || "the coach"}
              </p>
            )}

            <Button
              onClick={handleGenerateInvite}
              disabled={loading || !fullName || !email || !coachRank}
              className="w-full bg-[hsl(var(--optavia-green))] hover:bg-[hsl(var(--optavia-green-dark))] text-white"
            >
              {loading ? "Generating..." : "Generate Invite Link"}
            </Button>
          </CardContent>
        </Card>

        {/* Generated Invites List */}
        {generatedInvites.length > 0 && (
          <Card className="bg-white border border-gray-200 shadow-lg">
            <CardHeader>
              <CardTitle className="text-optavia-dark">Generated Invites</CardTitle>
              <CardDescription className="text-optavia-gray">
                Copy and share these invite links with coaches
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {generatedInvites.map((invite) => (
                <div
                  key={invite.id}
                  className="p-4 border border-gray-200 rounded-lg space-y-3"
                >
                  <div className="space-y-1">
                    {invite.fullName && (
                      <p className="text-sm font-medium text-optavia-dark">
                        <span className="text-optavia-gray">Name:</span> {invite.fullName}
                      </p>
                    )}
                    <p className="text-sm font-medium text-optavia-dark">
                      <span className="text-optavia-gray">Email:</span> {invite.email}
                    </p>
                    {invite.coachRank && (
                      <p className="text-sm font-medium text-optavia-dark">
                        <span className="text-optavia-gray">Coach Rank:</span> {invite.coachRank}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={invite.inviteLink}
                      readOnly
                      className="flex-1 border-gray-300 bg-gray-50 text-optavia-dark text-sm"
                    />
                    <Button
                      onClick={() => handleCopyLink(invite.inviteLink)}
                      variant="outline"
                      size="icon"
                      className="border-gray-300 hover:bg-gray-100"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-optavia-gray">
                    Created: {new Date(invite.createdAt).toLocaleString()}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

