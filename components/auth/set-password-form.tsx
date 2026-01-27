"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"
import { sendWelcomeEmail } from "@/lib/email"

interface SetPasswordFormProps {
  onSuccess?: () => void
  inviteKey: string
}

export function SetPasswordForm({ onSuccess, inviteKey }: SetPasswordFormProps) {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [validatingInvite, setValidatingInvite] = useState(true)
  const [inviteData, setInviteData] = useState<{
    email: string
    fullName: string
    coachRank: string
    optaviaId: string | null
  } | null>(null)
  const { signUp } = useAuth()
  const { toast } = useToast()
  const supabase = createClient()

  // Validate invite key on mount
  useEffect(() => {
    if (!inviteKey) {
      setValidatingInvite(false)
      return
    }

    const validateInvite = async () => {
      try {
        // First, try to find the invite without filtering by is_active
        const { data, error } = await supabase
          .from("invites")
          .select("*")
          .eq("invite_key", inviteKey)
          .single()

        if (error || !data) {
          console.error("Invite validation error:", error)
          toast({
            title: "Invalid Invite",
            description: error?.message || "This invite link was not found",
            variant: "destructive",
          })
          setValidatingInvite(false)
          return
        }

        // Check if invite is active
        if (!data.is_active) {
          toast({
            title: "Invite Inactive",
            description: "This invite link has been deactivated",
            variant: "destructive",
          })
          setValidatingInvite(false)
          return
        }

        // Check if invite is already used
        if (data.used_by) {
          toast({
            title: "Invite Already Used",
            description: "This invite link has already been used",
            variant: "destructive",
          })
          setValidatingInvite(false)
          return
        }

        // Check if invite has expired
        if (data.expires_at) {
          const expiresAt = new Date(data.expires_at)
          const now = new Date()
          console.log("Invite expiration check:", {
            expiresAt: expiresAt.toISOString(),
            now: now.toISOString(),
            expiresAtLocal: expiresAt.toLocaleString(),
            nowLocal: now.toLocaleString(),
            isExpired: expiresAt < now,
            hoursUntilExpiry: Math.round((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60))
          })
          if (expiresAt < now) {
            const hoursAgo = Math.round((now.getTime() - expiresAt.getTime()) / (1000 * 60 * 60))
            toast({
              title: "Invite Expired",
              description: `This invite link expired ${hoursAgo} hour${hoursAgo !== 1 ? 's' : ''} ago`,
              variant: "destructive",
            })
            setValidatingInvite(false)
            return
          }
        } else {
          console.log("Invite has no expiration date set")
        }

        // Check if invite has required email
        if (!data.invited_email) {
          toast({
            title: "Invalid Invite",
            description: "This invite link is missing required information",
            variant: "destructive",
          })
          setValidatingInvite(false)
          return
        }

        // Get coach rank, full name, and optavia ID from invite
        // Default all coaches to IPD rank
        const coachRank = data.coach_rank || "IPD"
        const fullName = data.invited_full_name
        const optaviaId = data.optavia_id || null

        if (!fullName) {
          toast({
            title: "Invalid Invite",
            description: "This invite is missing required information",
            variant: "destructive",
          })
          setValidatingInvite(false)
          return
        }

        setInviteData({
          email: data.invited_email,
          fullName: fullName,
          coachRank: coachRank,
          optaviaId: optaviaId,
        })
      } catch (error: any) {
        toast({
          title: "Error",
          description: "Failed to validate invite",
          variant: "destructive",
        })
      } finally {
        setValidatingInvite(false)
      }
    }

    validateInvite()
  }, [inviteKey, supabase, toast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!inviteData) {
      toast({
        title: "Error",
        description: "Invite data not loaded",
        variant: "destructive",
      })
      return
    }

    if (password.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters",
        variant: "destructive",
      })
      return
    }

    if (password !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    const { data: signUpData, error } = await signUp(
      inviteData.email,
      password,
      inviteData.fullName
    )

    if (error) {
      // Check if user already exists
      if (error.message?.includes("already registered") || error.message?.includes("already exists")) {
        toast({
          title: "Account Exists",
          description: "An account with this email already exists. Please sign in instead.",
          variant: "destructive",
        })
        // Mark invite as used anyway (in case it was used before)
        await supabase
          .from("invites")
          .update({
            used_at: new Date().toISOString(),
          })
          .eq("invite_key", inviteKey)
        setLoading(false)
        // Redirect to login after a short delay
        setTimeout(() => {
          window.location.href = "/login"
        }, 2000)
        return
      }
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
      setLoading(false)
      return
    }

    // Mark invite as used
    if (signUpData?.user) {
      // Get the invite to find who sent it (the sponsor) and check if it's a bulk invite
      const { data: inviteData_full } = await supabase
        .from("invites")
        .select("invited_by, is_bulk_invite")
        .eq("invite_key", inviteKey)
        .single()

      // Only set sponsor_id for non-bulk invites (bulk invites don't set sponsor)
      const isBulkInvite = inviteData_full?.is_bulk_invite === true
      const sponsorId: string | null = isBulkInvite ? null : (inviteData_full?.invited_by || null)

      await supabase
        .from("invites")
        .update({
          used_by: signUpData.user.id,
          used_at: new Date().toISOString(),
        })
        .eq("invite_key", inviteKey)

      // Update profile with coach rank, optavia ID, and sponsor_id (null for bulk invites)
      await supabase
        .from("profiles")
        .update({
          coach_rank: inviteData.coachRank,
          is_new_coach: false, // All coaches default to IPD, no special "new coach" handling
          optavia_id: inviteData.optaviaId,
          sponsor_id: sponsorId,
        })
        .eq("id", signUpData.user.id)

      // Send welcome email
      if (signUpData.user.email && inviteData.fullName) {
        const { success, error: emailError } = await sendWelcomeEmail({
          to: signUpData.user.email,
          fullName: inviteData.fullName,
        })

        if (emailError) {
          console.error("Failed to send welcome email:", emailError)
        }
      }
    }

    toast({
      title: "Success",
      description: "Password set successfully! You can now sign in.",
    })
    onSuccess?.()
    setLoading(false)
  }

  if (validatingInvite) {
    return (
      <Card className="w-full max-w-md mx-auto bg-white border border-gray-200 shadow-lg">
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[hsl(var(--optavia-green))] mx-auto mb-4"></div>
            <p className="text-optavia-gray">Validating invite...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!inviteData) {
    return (
      <Card className="w-full max-w-md mx-auto bg-white border border-gray-200 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-heading text-optavia-dark">Invalid Invite</CardTitle>
          <CardDescription className="text-optavia-gray">
            This invite link is invalid, expired, or has already been used
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4">
            <p className="text-optavia-gray">
              Please contact the person who sent you this link for a new invite.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto bg-white border border-gray-200 shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-heading text-optavia-dark">Set Your Password</CardTitle>
        <CardDescription className="text-optavia-gray">
          Create a password for {inviteData.email}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-optavia-dark">Email</Label>
            <Input
              id="email"
              type="email"
              value={inviteData.email}
              disabled
              className="bg-gray-50 border-gray-300 text-optavia-dark"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-optavia-dark">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              disabled={loading}
              className="bg-white border-gray-300 text-optavia-dark"
            />
            <p className="text-xs text-optavia-gray">Must be at least 6 characters</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-optavia-dark">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              disabled={loading}
              className="bg-white border-gray-300 text-optavia-dark"
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-[hsl(var(--optavia-green))] hover:bg-[hsl(var(--optavia-green-dark))] text-white"
            disabled={loading}
          >
            {loading ? "Setting password..." : "Set Password & Create Account"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

