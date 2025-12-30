"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"

interface SignupFormProps {
  onSuccess?: () => void
  onSwitchToLogin?: () => void
  inviteKey?: string | null
}

export function SignupForm({ onSuccess, onSwitchToLogin, inviteKey }: SignupFormProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [isNewCoach, setIsNewCoach] = useState(true)
  const [loading, setLoading] = useState(false)
  const [validatingInvite, setValidatingInvite] = useState(!!inviteKey)
  const [inviteValid, setInviteValid] = useState<boolean | null>(null)
  const { signUp } = useAuth()
  const { toast } = useToast()
  const supabase = createClient()

  // Validate invite key on mount
  useEffect(() => {
    if (!inviteKey) {
      setInviteValid(false) // No invite required - allow signup
      setValidatingInvite(false)
      return
    }

    const validateInvite = async () => {
      try {
        const { data, error } = await supabase
          .from("invites")
          .select("*")
          .eq("invite_key", inviteKey)
          .eq("is_active", true)
          .single()

        if (error || !data) {
          setInviteValid(false)
          toast({
            title: "Invalid Invite",
            description: "This invite link is invalid or has expired",
            variant: "destructive",
          })
          return
        }

        // Check if invite has expired
        if (data.expires_at && new Date(data.expires_at) < new Date()) {
          setInviteValid(false)
          toast({
            title: "Invite Expired",
            description: "This invite link has expired",
            variant: "destructive",
          })
          return
        }

        // Check if invite is already used
        if (data.used_by) {
          setInviteValid(false)
          toast({
            title: "Invite Already Used",
            description: "This invite link has already been used",
            variant: "destructive",
          })
          return
        }

        // Check if invite is for a specific email
        if (data.invited_email) {
          // We'll validate the email matches when they submit
          setInviteValid(true)
        } else {
          setInviteValid(true) // Open invite
        }
      } catch (error: any) {
        setInviteValid(false)
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

    // Validate invite if present
    if (inviteKey) {
      if (inviteValid === false) {
        toast({
          title: "Invalid Invite",
          description: "You must use a valid invite link to sign up",
          variant: "destructive",
        })
        return
      }

      // Check if invite is for a specific email
      const { data: inviteData } = await supabase
        .from("invites")
        .select("invited_email")
        .eq("invite_key", inviteKey)
        .single()

      if (inviteData?.invited_email && inviteData.invited_email !== email) {
        toast({
          title: "Email Mismatch",
          description: `This invite is for ${inviteData.invited_email}`,
          variant: "destructive",
        })
        return
      }
    } else {
      // Require invite for signup
      toast({
        title: "Invite Required",
        description: "You must have an invite link to sign up",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    const { data: signUpData, error } = await signUp(email, password, fullName)

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
      setLoading(false)
      return
    }

    // Mark invite as used
    if (inviteKey && signUpData?.user) {
      await supabase
        .from("invites")
        .update({
          used_by: signUpData.user.id,
          used_at: new Date().toISOString(),
        })
        .eq("invite_key", inviteKey)
    }

    toast({
      title: "Success",
      description: "Account created! Please check your email to verify your account.",
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

  if (inviteKey && inviteValid === false) {
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
            {onSwitchToLogin && (
              <Button
                onClick={onSwitchToLogin}
                variant="outline"
                className="w-full border-gray-300 text-optavia-dark hover:bg-gray-100"
              >
                Sign In Instead
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto bg-white border border-gray-200 shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-heading text-optavia-dark">Create Account</CardTitle>
        <CardDescription className="text-optavia-gray">
          {inviteKey ? "Sign up with your invite link" : "Sign up for Coaching Amplifier"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-optavia-dark">Full Name</Label>
            <Input
              id="fullName"
              type="text"
              placeholder="John Doe"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              disabled={loading}
              className="bg-white border-gray-300 text-optavia-dark"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-optavia-dark">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              className="bg-white border-gray-300 text-optavia-dark"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-optavia-dark">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              disabled={loading}
              className="bg-white border-gray-300 text-optavia-dark"
            />
          </div>
          <div className="space-y-3 pt-2 border-t">
            <p className="text-sm text-optavia-gray text-center">
              By clicking "Sign Up", you agree that you have read and agree to the{" "}
              <Link href="/terms" target="_blank" className="text-[hsl(var(--optavia-green))] hover:underline">
                Terms and Conditions
              </Link>
              {", "}
              <Link href="/privacy" target="_blank" className="text-[hsl(var(--optavia-green))] hover:underline">
                Privacy Policy
              </Link>
              {", and "}
              <Link href="/cookies" target="_blank" className="text-[hsl(var(--optavia-green))] hover:underline">
                Cookie Usage Policy
              </Link>
              . You also acknowledge that your information will be stored and that you can request deletion of your account and data
              at any time. Data deletion will result in permanent loss of access to the Service.
            </p>
          </div>

          <Button type="submit" className="w-full bg-[hsl(var(--optavia-green))] hover:bg-[hsl(var(--optavia-green-dark))] text-white" disabled={loading}>
            {loading ? "Creating account..." : "Sign Up"}
          </Button>
          {onSwitchToLogin && (
            <div className="text-center text-sm text-optavia-gray">
              Already have an account?{" "}
              <button
                type="button"
                onClick={onSwitchToLogin}
                className="text-[hsl(var(--optavia-green))] hover:underline"
              >
                Sign in
              </button>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  )
}

