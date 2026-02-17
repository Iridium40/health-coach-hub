"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useUserData } from "@/contexts/user-data-context"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"
import { generateInviteKey, createInviteLink } from "@/lib/invites"
import { sendInviteEmail } from "@/lib/email"
import { X, Copy, UserPlus, AlertTriangle } from "lucide-react"
import Link from "next/link"

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
  const { user, profile } = useUserData()
  const { toast } = useToast()
  const supabase = createClient()

  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const defaultCoachRank = "IPD"
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

    setLoading(true)

    try {
      const inviteKey = generateInviteKey()
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + 14)

      const { data, error } = await supabase
        .from("invites")
        .insert({
          invite_key: inviteKey,
          invited_by: user.id,
          invited_email: email,
          invited_full_name: fullName,
          coach_rank: defaultCoachRank,
          optavia_id: null,
          expires_at: expiresAt.toISOString(),
          is_active: true,
        })
        .select()
        .single()

      if (error) throw error

      const link = createInviteLink(inviteKey)

      const newInvite: GeneratedInvite = {
        id: data.id,
        fullName: fullName || "",
        email: email,
        coachRank: defaultCoachRank,
        inviteLink: link,
        createdAt: new Date().toISOString(),
      }

      setGeneratedInvites((prev) => [newInvite, ...prev])

      const emailResult = await sendInviteEmail({
        to: email,
        fullName: fullName,
        coachRank: defaultCoachRank,
        inviteLink: link,
        invitedBy: profile?.full_name || user.email || "an admin",
      })

      if (emailResult.success) {
        toast({
          title: "Success",
          description: "Invite link generated and email sent successfully",
        })
      } else {
        toast({
          title: "Invite Created",
          description: "Invite generated but email failed. Copy the link manually.",
          variant: "default",
        })
      }

      setFullName("")
      setEmail("")
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
        {/* Important Disclaimer */}
        <Card className="bg-amber-50 border border-amber-200 shadow-lg">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-3">
                <p className="text-sm font-semibold text-amber-800">Important Notice</p>
                <p className="text-sm text-amber-700">
                  Only active <strong>OPTAVIA Health Coaches</strong> should be invited to become users of Coaching Amplifier. 
                  By sending an invite, you certify that the person you are inviting is an active OPTAVIA Coach in good standing.
                </p>
                <div className="p-3 bg-amber-100 rounded-lg border border-amber-300">
                  <p className="text-sm font-semibold text-amber-900 mb-1">⚠️ Front-Line Coaches Only</p>
                  <p className="text-sm text-amber-800">
                    You should only invite coaches who are on your <strong>front line</strong> or coaches that you are the <strong>direct sponsor</strong> of. 
                    This ensures proper team structure and allows you to track their progress.
                  </p>
                </div>
                <p className="text-sm text-amber-700">
                  Please review our{" "}
                  <Link href="/terms" className="text-amber-800 underline hover:text-amber-900 font-medium">
                    Terms and Conditions
                  </Link>{" "}
                  for more information.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Create Invite Form */}
        <Card className="bg-white border border-gray-200 shadow-lg">
          <CardHeader>
            <CardTitle className="text-optavia-dark flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Create New Invite
            </CardTitle>
            <CardDescription className="text-optavia-gray">
              Generate an invite link for a new coach with their information.
              <span className="block mt-1 text-amber-600 font-medium">Note: Invites expire in 14 days.</span>
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

            <div className="pt-4 border-t border-gray-100">
              <p className="text-sm text-optavia-gray leading-relaxed mb-4">
                By clicking &quot;Generate Invite Link&quot;, you certify that the person you are inviting is an <strong>active OPTAVIA Health Coach</strong> and 
                you have reviewed the{" "}
                <Link href="/terms" className="text-[hsl(var(--optavia-green))] underline hover:text-[hsl(var(--optavia-green-dark))]">
                  Terms and Conditions
                </Link>.
              </p>
            </div>

            <Button
              onClick={handleGenerateInvite}
              disabled={loading || !fullName || !email}
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
