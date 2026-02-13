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
import { Eye, EyeOff, CheckCircle2, XCircle } from "lucide-react"
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

  const passwordsMatch = password.length > 0 && confirmPassword.length > 0 && password === confirmPassword
  const passwordLongEnough = password.length >= 6

  // Listen for the PASSWORD_RECOVERY event from Supabase
  // This fires when the user arrives via the reset link (both PKCE and implicit flows)
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "PASSWORD_RECOVERY") {
          // User arrived from the reset password email link - show the form
          setReady(true)
        } else if (event === "SIGNED_IN" && session) {
          // Also handle case where session is established (PKCE flow)
          // Check if we came from a recovery flow by checking URL hash
          if (window.location.hash.includes("type=recovery")) {
            setReady(true)
          }
        }
      }
    )

    // Also check if user already has a session (e.g., from auth callback route)
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        setReady(true)
      } else {
        // Give the auth state change listener a moment to fire
        setTimeout(() => {
          setReady((current) => {
            if (!current) setSessionError(true)
            return current
          })
        }, 3000)
      }
    }
    checkSession()

    return () => subscription.unsubscribe()
  }, [supabase])

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

  // Invalid/expired link state
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
            <CardContent className="pt-8 pb-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto">
                <XCircle className="h-8 w-8 text-red-500" />
              </div>
              <h2 className="text-xl font-heading font-bold text-optavia-dark">
                Invalid or Expired Link
              </h2>
              <p className="text-optavia-gray text-sm">
                This password reset link is invalid or has expired. Please request a new one.
              </p>
              <div className="pt-4 space-y-2">
                <Link href="/forgot-password">
                  <Button className="w-full bg-[hsl(var(--optavia-green))] hover:bg-[hsl(var(--optavia-green-dark))] text-white">
                    Request New Link
                  </Button>
                </Link>
                <Link href="/login">
                  <Button variant="outline" className="w-full">
                    Back to Sign In
                  </Button>
                </Link>
              </div>
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
