"use client"

import { useState, useEffect } from "react"
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
import { Badge } from "@/components/ui/badge"
import { X, Copy, Check, UserPlus, History, Clock, UserCheck, UserX } from "lucide-react"

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

interface InviteHistory {
  id: string
  invite_key: string
  invited_by: string
  invited_by_name: string | null
  invited_email: string | null
  invited_full_name: string | null
  coach_rank: string | null
  used_by: string | null
  used_by_name: string | null
  used_at: string | null
  expires_at: string | null
  is_active: boolean
  created_at: string
  last_sign_in_at: string | null // Last login date of the invited user
}

export function InviteManagement({ onClose }: InviteManagementProps) {
  const { user } = useAuth()
  const { profile } = useSupabaseData(user)
  const { toast } = useToast()
  const supabase = createClient()

  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [coachRank, setCoachRank] = useState("")
  const [optaviaId, setOptaviaId] = useState("")
  const [sendEmail, setSendEmail] = useState(true) // Default to sending email
  const [loading, setLoading] = useState(false)
  const [generatedInvites, setGeneratedInvites] = useState<GeneratedInvite[]>([])
  const [inviteHistory, setInviteHistory] = useState<InviteHistory[]>([])
  const [loadingHistory, setLoadingHistory] = useState(true)
  const [showHistory, setShowHistory] = useState(false)

  const isAdmin = profile?.user_role?.toLowerCase() === "admin"

  // Load invite history
  useEffect(() => {
    if (!user) {
      setLoadingHistory(false)
      return
    }
    loadInviteHistory()
  }, [user])

  const loadInviteHistory = async () => {
    setLoadingHistory(true)
    try {
      if (!user) {
        setLoadingHistory(false)
        return
      }

      // Fetch only invites sent by the current user
      const { data: invitesData, error: invitesError } = await supabase
        .from("invites")
        .select("*")
        .eq("invited_by", user.id)
        .order("created_at", { ascending: false })

      if (invitesError) throw invitesError

      // Get unique user IDs to fetch profiles
      const userIds = new Set<string>()
      ;(invitesData || []).forEach((invite: any) => {
        if (invite.invited_by) userIds.add(invite.invited_by)
        if (invite.used_by) userIds.add(invite.used_by)
      })

      // Fetch profiles for all users (including last_sign_in_at)
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("id, full_name, last_sign_in_at")
        .in("id", Array.from(userIds))

      // Create maps of user ID to full name and last sign in
      const profilesMap = new Map<string, string>()
      const lastSignInMap = new Map<string, string | null>()
      ;(profilesData || []).forEach((profile: any) => {
        profilesMap.set(profile.id, profile.full_name)
        lastSignInMap.set(profile.id, profile.last_sign_in_at)
      })

      // Transform the data to include names and last sign in
      const history: InviteHistory[] = (invitesData || []).map((invite: any) => ({
        id: invite.id,
        invite_key: invite.invite_key,
        invited_by: invite.invited_by,
        invited_by_name: profilesMap.get(invite.invited_by) || null,
        invited_email: invite.invited_email,
        invited_full_name: invite.invited_full_name,
        coach_rank: invite.coach_rank,
        used_by: invite.used_by,
        used_by_name: invite.used_by ? profilesMap.get(invite.used_by) || null : null,
        used_at: invite.used_at,
        expires_at: invite.expires_at,
        is_active: invite.is_active,
        created_at: invite.created_at,
        last_sign_in_at: invite.used_by ? lastSignInMap.get(invite.used_by) || null : null,
      }))

      setInviteHistory(history)
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load invite history",
        variant: "destructive",
      })
    } finally {
      setLoadingHistory(false)
    }
  }

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

    if (!optaviaId) {
      toast({
        title: "Error",
        description: "Optavia ID is required",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const inviteKey = generateInviteKey()
      const expiresAt = new Date()
      expiresAt.setHours(expiresAt.getHours() + 48) // 48 hours expiration

      const { data, error } = await supabase
        .from("invites")
        .insert({
          invite_key: inviteKey,
          invited_by: user.id,
          invited_email: email,
          invited_full_name: fullName,
          coach_rank: coachRank,
          optavia_id: optaviaId,
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
      setOptaviaId("")

      // Reload history to show the new invite
      await loadInviteHistory()
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

  const getInviteStatus = (invite: InviteHistory) => {
    if (invite.used_by) {
      return { label: "Used", variant: "default" as const, icon: UserCheck }
    }
    if (invite.expires_at && new Date(invite.expires_at) < new Date()) {
      return { label: "Expired", variant: "secondary" as const, icon: Clock }
    }
    if (!invite.is_active) {
      return { label: "Inactive", variant: "secondary" as const, icon: X }
    }
    return { label: "Pending", variant: "outline" as const, icon: UserX }
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

            <div className="space-y-2">
              <Label htmlFor="optaviaId" className="text-optavia-dark">Optavia ID *</Label>
              <Input
                id="optaviaId"
                type="text"
                placeholder="Enter Optavia ID"
                value={optaviaId}
                onChange={(e) => setOptaviaId(e.target.value)}
                required
                className="bg-white border-gray-300 text-optavia-dark focus:border-[hsl(var(--optavia-green))] focus:ring-[hsl(var(--optavia-green-light))]"
              />
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

        {/* Invite History */}
        <Card className="bg-white border border-gray-200 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-optavia-dark flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Invite History
                </CardTitle>
                <CardDescription className="text-optavia-gray">
                  View all invites created in the system
                </CardDescription>
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  setShowHistory(!showHistory)
                  if (!showHistory) {
                    loadInviteHistory()
                  }
                }}
                className="border-gray-300 hover:bg-gray-100"
              >
                {showHistory ? "Hide" : "Show"} History
              </Button>
            </div>
          </CardHeader>
          {showHistory && (
            <CardContent>
              {loadingHistory ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[hsl(var(--optavia-green))] mx-auto mb-4"></div>
                  <p className="text-optavia-gray">Loading invite history...</p>
                </div>
              ) : inviteHistory.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-optavia-gray">No invites found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {inviteHistory.map((invite) => {
                    const status = getInviteStatus(invite)
                    const StatusIcon = status.icon
                    const inviteLink = createInviteLink(invite.invite_key)

                    return (
                      <div
                        key={invite.id}
                        className="p-4 border border-gray-200 rounded-lg space-y-3 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge variant={status.variant} className="flex items-center gap-1">
                                <StatusIcon className="h-3 w-3" />
                                {status.label}
                              </Badge>
                              {invite.coach_rank && (
                                <Badge variant="outline" className="text-xs">
                                  {invite.coach_rank}
                                </Badge>
                              )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                              {invite.invited_full_name && (
                                <div>
                                  <span className="text-optavia-gray">Invited:</span>{" "}
                                  <span className="font-medium text-optavia-dark">
                                    {invite.invited_full_name}
                                  </span>
                                </div>
                              )}
                              {invite.invited_email && (
                                <div>
                                  <span className="text-optavia-gray">Email:</span>{" "}
                                  <span className="font-medium text-optavia-dark">
                                    {invite.invited_email}
                                  </span>
                                </div>
                              )}
                              <div>
                                <span className="text-optavia-gray">Created by:</span>{" "}
                                <span className="font-medium text-optavia-dark">
                                  {invite.invited_by_name || "Unknown"}
                                </span>
                              </div>
                              {invite.used_by && (
                                <div>
                                  <span className="text-optavia-gray">Used by:</span>{" "}
                                  <span className="font-medium text-optavia-dark">
                                    {invite.used_by_name || "Unknown"}
                                  </span>
                                </div>
                              )}
                            </div>

                            <div className="flex flex-wrap gap-4 text-xs text-optavia-gray">
                              <div>
                                <span className="font-medium">Invite Date:</span>{" "}
                                {new Date(invite.created_at).toLocaleString()}
                              </div>
                              {invite.used_at && (
                                <div>
                                  <span className="font-medium">Signed Up:</span>{" "}
                                  {new Date(invite.used_at).toLocaleString()}
                                </div>
                              )}
                              {invite.last_sign_in_at && (
                                <div>
                                  <span className="font-medium">Last Login:</span>{" "}
                                  {new Date(invite.last_sign_in_at).toLocaleString()}
                                </div>
                              )}
                              {invite.expires_at && (
                                <div>
                                  <span className="font-medium">Expires:</span>{" "}
                                  {new Date(invite.expires_at).toLocaleString()}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex flex-col gap-2">
                            <Button
                              onClick={() => handleCopyLink(inviteLink)}
                              variant="outline"
                              size="sm"
                              className="border-gray-300 hover:bg-gray-100"
                            >
                              <Copy className="h-3 w-3 mr-1" />
                              Copy Link
                            </Button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  )
}

