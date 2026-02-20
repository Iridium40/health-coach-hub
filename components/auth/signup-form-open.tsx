"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"
import { Eye, EyeOff, CheckCircle2 } from "lucide-react"

interface SignupFormOpenProps {
  onSuccess?: () => void
}

export function SignupFormOpen({ onSuccess }: SignupFormOpenProps) {
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [coachName, setCoachName] = useState("")
  const [accessCode, setAccessCode] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [formError, setFormError] = useState("")
  const { signUp } = useAuth()
  const { toast } = useToast()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError("")

    if (password.length < 6) {
      setFormError("Password must be at least 6 characters.")
      return
    }

    if (password !== confirmPassword) {
      setFormError("Passwords do not match.")
      return
    }

    setLoading(true)

    try {
      const { data: codeData, error: codeError } = await supabase
        .from("signup_access_codes")
        .select("id, code, is_active, usage_count, max_uses, expires_at")
        .eq("code", accessCode.trim())
        .eq("is_active", true)
        .single()

      if (codeError || !codeData) {
        setFormError("Invalid access code. Please check with your administrator.")
        setLoading(false)
        return
      }

      if (codeData.expires_at && new Date(codeData.expires_at) < new Date()) {
        setFormError("This access code has expired. Please contact your administrator.")
        setLoading(false)
        return
      }

      if (codeData.max_uses && (codeData.usage_count ?? 0) >= codeData.max_uses) {
        setFormError("This access code has reached its usage limit. Please contact your administrator.")
        setLoading(false)
        return
      }

      const { data, error } = await signUp(email, password, fullName.trim(), coachName.trim(), codeData.code)

      if (error) {
        if (error.message?.includes("already registered")) {
          setFormError("An account with this email already exists. Please sign in instead.")
        } else {
          setFormError(error.message || "Failed to create account. Please try again.")
        }
        setLoading(false)
        return
      }

      await supabase
        .from("signup_access_codes")
        .update({ usage_count: (codeData.usage_count || 0) + 1 })
        .eq("id", codeData.id)

      setSuccess(true)
    } catch (err: any) {
      setFormError(err.message || "An unexpected error occurred.")
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <Card className="w-full max-w-md mx-auto bg-white border border-gray-200 shadow-lg">
        <CardContent className="pt-8 pb-8">
          <div className="text-center space-y-4">
            <CheckCircle2 className="h-16 w-16 text-[hsl(var(--optavia-green))] mx-auto" />
            <h2 className="text-2xl font-heading font-bold text-optavia-dark">Check Your Email</h2>
            <p className="text-optavia-gray">
              We sent a confirmation link to <strong className="text-optavia-dark">{email}</strong>. Please click the link in your email to verify your account, then you can sign in.
            </p>
            <p className="text-xs text-optavia-light-gray">
              Don't see it? Check your spam folder.
            </p>
            <Link
              href="/login"
              className="inline-block mt-4 text-[hsl(var(--optavia-green))] hover:underline font-medium"
            >
              Go to Sign In
            </Link>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto bg-white border border-gray-200 shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-heading text-optavia-dark">Create Account</CardTitle>
        <CardDescription className="text-optavia-gray">Sign up for your Coaching Amplifier account</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-optavia-dark">Full Name</Label>
            <Input
              id="fullName"
              type="text"
              placeholder="Your full name"
              value={fullName}
              onChange={(e) => { setFullName(e.target.value); setFormError("") }}
              required
              disabled={loading}
              className="bg-white border-gray-300 text-optavia-dark"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="signup-email" className="text-optavia-dark">Email</Label>
            <Input
              id="signup-email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setFormError("") }}
              required
              disabled={loading}
              className="bg-white border-gray-300 text-optavia-dark"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="signup-password" className="text-optavia-dark">Password</Label>
            <div className="relative">
              <Input
                id="signup-password"
                type={showPassword ? "text" : "password"}
                placeholder="Minimum 6 characters"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setFormError("") }}
                required
                disabled={loading}
                className="bg-white border-gray-300 text-optavia-dark pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-password" className="text-optavia-dark">Confirm Password</Label>
            <div className="relative">
              <Input
                id="confirm-password"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); setFormError("") }}
                required
                disabled={loading}
                className="bg-white border-gray-300 text-optavia-dark pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                tabIndex={-1}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="coachName" className="text-optavia-dark">Who is your coach?</Label>
            <Input
              id="coachName"
              type="text"
              placeholder="Your coach's name"
              value={coachName}
              onChange={(e) => { setCoachName(e.target.value); setFormError("") }}
              required
              disabled={loading}
              className="bg-white border-gray-300 text-optavia-dark"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="accessCode" className="text-optavia-dark">Access Code</Label>
            <Input
              id="accessCode"
              type="text"
              placeholder="Enter your access code"
              value={accessCode}
              onChange={(e) => { setAccessCode(e.target.value); setFormError("") }}
              required
              disabled={loading}
              className="bg-white border-gray-300 text-optavia-dark"
            />
            <p className="text-xs text-optavia-light-gray">Ask your coach or administrator for the access code.</p>
          </div>

          {formError && (
            <p className="text-sm text-red-600 font-medium">{formError}</p>
          )}

          <Button
            type="submit"
            className="w-full bg-[hsl(var(--optavia-green))] hover:bg-[hsl(var(--optavia-green-dark))] text-white"
            disabled={loading}
          >
            {loading ? "Creating Account..." : "Create Account"}
          </Button>

          <div className="text-center text-sm text-optavia-gray">
            Already have an account?{" "}
            <Link href="/login" className="text-[hsl(var(--optavia-green))] hover:underline">
              Sign in
            </Link>
          </div>

          <div className="text-center text-xs text-optavia-gray pt-2 border-t">
            <Link href="/terms" target="_blank" className="hover:underline mr-2">Terms</Link>
            <span className="mx-1">•</span>
            <Link href="/privacy" target="_blank" className="hover:underline mr-2">Privacy</Link>
            <span className="mx-1">•</span>
            <Link href="/cookies" target="_blank" className="hover:underline">Cookies</Link>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
