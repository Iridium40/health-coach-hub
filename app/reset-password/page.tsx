"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { createClient, resetClient } from "@/lib/supabase/client"
import { Footer } from "@/components/footer"
import { Eye, EyeOff, CheckCircle2, XCircle, Mail, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function ResetPasswordPage() {
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [ready, setReady] = useState(false)
  const [sessionError, setSessionError] = useState(false)
  const [debugInfo, setDebugInfo] = useState("")
  const [resendEmail, setResendEmail] = useState("")
  const [resendLoading, setResendLoading] = useState(false)
  const [resendSent, setResendSent] = useState(false)

  const passwordsMatch = password.length > 0 && confirmPassword.length > 0 && password === confirmPassword
  const passwordLongEnough = password.length >= 6

  useEffect(() => {
    let resolved = false

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "PASSWORD_RECOVERY" || (event === "SIGNED_IN" && session)) {
          resolved = true
          setReady(true)
        }
      }
    )

    const initSession = async () => {
      const url = new URL(window.location.href)
      const code = url.searchParams.get("code")
      const hasHash = window.location.hash.includes("access_token") || window.location.hash.includes("type=recovery")
      const details: string[] = []

      // 1. Try client-side PKCE code exchange (forwarded from auth callback)
      if (code) {
        details.push("code param found")
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (!error) {
          resolved = true
          setReady(true)
          url.searchParams.delete("code")
          window.history.replaceState({}, "", url.toString())
          return
        }
        details.push(`code exchange: ${error.message}`)
      }

      // 2. Check URL hash for implicit flow tokens
      if (hasHash) {
        details.push("hash tokens found, waiting for auth listener")
        await new Promise(r => setTimeout(r, 2000))
        if (resolved) return
      }

      // 3. Check for existing session
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        resolved = true
        setReady(true)
        return
      }
      if (!code && !hasHash) details.push("no code or hash in URL")
      details.push("no session found")

      // 4. Wait briefly for auth state listener, then show error
      setTimeout(() => {
        if (!resolved) {
          setDebugInfo(details.join(" → "))
          setSessionError(true)
        }
      }, 3000)
    }
    initSession()

    return () => subscription.unsubscribe()
  }, [supabase])

  const handleResendReset = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!resendEmail.trim()) return
    setResendLoading(true)
    const { error } = await supabase.auth.resetPasswordForEmail(resendEmail.trim(), {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
    })
    setResendLoading(false)
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    } else {
      setResendSent(true)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!passwordLongEnough) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters.",
        variant: "destructive",
      })
      return
    }

    if (!passwordsMatch) {
      toast({
        title: "Error",
        description: "Passwords do not match.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
      setLoading(false)
      return
    }

    // Sign out so user logs in fresh with new password
    await supabase.auth.signOut()
    resetClient()
    setSuccess(true)
    setLoading(false)
  }

  // Success state
  if (success) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
          <div className="mb-8 sm:mb-12">
            <img
              src="/branding/ca_logo.png"
              alt="Coaching Amplifier"
              className="h-16 sm:h-20 md:h-24 w-auto mx-auto"
            />
          </div>
          <Card className="w-full max-w-md mx-auto bg-white border border-gray-200 shadow-lg">
            <CardContent className="pt-8 pb-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-xl font-heading font-bold text-optavia-dark">
                Password Updated
              </h2>
              <p className="text-optavia-gray text-sm">
                Your password has been successfully reset. Please sign in with your new password.
              </p>
              <div className="pt-4">
                <Button
                  onClick={() => { window.location.href = "/login" }}
                  className="w-full bg-[hsl(var(--optavia-green))] hover:bg-[hsl(var(--optavia-green-dark))] text-white"
                >
                  Sign In
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    )
  }

  // Invalid/expired link state — show inline re-send form
  if (sessionError && !ready) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
          <div className="mb-8 sm:mb-12">
            <img
              src="/branding/ca_logo.png"
              alt="Coaching Amplifier"
              className="h-16 sm:h-20 md:h-24 w-auto mx-auto"
            />
          </div>
          <Card className="w-full max-w-md mx-auto bg-white border border-gray-200 shadow-lg">
            <CardContent className="pt-8 pb-8 space-y-4">
              {resendSent ? (
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="h-8 w-8 text-green-600" />
                  </div>
                  <h2 className="text-xl font-heading font-bold text-optavia-dark">
                    Check Your Email
                  </h2>
                  <p className="text-optavia-gray text-sm">
                    We&apos;ve sent a new password reset link to <strong>{resendEmail}</strong>.
                    Please click the link in the email to continue.
                  </p>
                  <p className="text-optavia-gray text-xs">
                    Make sure to click the link in the <strong>same browser</strong> you are using now.
                  </p>
                </div>
              ) : (
                <>
                  <div className="text-center space-y-2">
                    <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto">
                      <XCircle className="h-8 w-8 text-red-500" />
                    </div>
                    <h2 className="text-xl font-heading font-bold text-optavia-dark">
                      Link Expired
                    </h2>
                    <p className="text-optavia-gray text-sm">
                      This reset link couldn&apos;t be verified. Enter your email below to get a new one instantly.
                    </p>
                  </div>
                  <form onSubmit={handleResendReset} className="space-y-3">
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        type="email"
                        placeholder="you@example.com"
                        value={resendEmail}
                        onChange={(e) => setResendEmail(e.target.value)}
                        required
                        disabled={resendLoading}
                        className="bg-white border-gray-300 text-optavia-dark pl-10"
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-[hsl(var(--optavia-green))] hover:bg-[hsl(var(--optavia-green-dark))] text-white"
                      disabled={resendLoading || !resendEmail.trim()}
                    >
                      {resendLoading ? "Sending..." : "Send New Reset Link"}
                    </Button>
                  </form>
                  <div className="text-center pt-1">
                    <Link
                      href="/login"
                      className="text-sm text-[hsl(var(--optavia-green))] hover:underline inline-flex items-center gap-1"
                    >
                      <ArrowLeft className="h-3 w-3" />
                      Back to Sign In
                    </Link>
                  </div>
                </>
              )}
              {debugInfo && (
                <p className="text-[10px] text-gray-300 text-center mt-4 break-all">{debugInfo}</p>
              )}
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    )
  }

  // Loading state while waiting for session
  if (!ready) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
          <div className="mb-8 sm:mb-12">
            <img
              src="/branding/ca_logo.png"
              alt="Coaching Amplifier"
              className="h-16 sm:h-20 md:h-24 w-auto mx-auto"
            />
          </div>
          <Card className="w-full max-w-md mx-auto bg-white border border-gray-200 shadow-lg">
            <CardContent className="pt-8 pb-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[hsl(var(--optavia-green))] mx-auto mb-4" />
              <p className="text-optavia-gray">Verifying reset link...</p>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    )
  }

  // Password form
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="mb-8 sm:mb-12">
          <img
            src="/branding/ca_logo.png"
            alt="Coaching Amplifier"
            className="h-16 sm:h-20 md:h-24 w-auto mx-auto"
          />
        </div>

        <div className="w-full max-w-md">
          <Card className="w-full mx-auto bg-white border border-gray-200 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl font-heading text-optavia-dark">
                Reset Password
              </CardTitle>
              <CardDescription className="text-optavia-gray">
                Enter your new password below.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* New Password */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-optavia-dark">
                    New Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter new password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      disabled={loading}
                      autoComplete="new-password"
                      className="bg-white border-gray-300 text-optavia-dark pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-optavia-gray">
                    Must be at least 6 characters
                  </p>
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-optavia-dark">
                    Confirm New Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      minLength={6}
                      disabled={loading}
                      autoComplete="new-password"
                      className="bg-white border-gray-300 text-optavia-dark pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {/* Match indicator */}
                  {confirmPassword.length > 0 && (
                    <div
                      className={`flex items-center gap-1 text-xs ${
                        passwordsMatch ? "text-green-600" : "text-red-500"
                      }`}
                    >
                      {passwordsMatch ? (
                        <>
                          <CheckCircle2 className="h-3 w-3" />
                          <span>Passwords match</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-3 w-3" />
                          <span>Passwords do not match</span>
                        </>
                      )}
                    </div>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full bg-[hsl(var(--optavia-green))] hover:bg-[hsl(var(--optavia-green-dark))] text-white"
                  disabled={loading || !passwordsMatch || !passwordLongEnough}
                >
                  {loading ? "Updating..." : "Reset Password"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  )
}
