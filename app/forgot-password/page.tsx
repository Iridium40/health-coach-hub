"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"
import { Footer } from "@/components/footer"
import { ArrowLeft, Mail, CheckCircle2 } from "lucide-react"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const { resetPassword } = useAuth()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return

    setLoading(true)

    const { error } = await resetPassword(email.trim())

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } else {
      setSent(true)
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        {/* Logo */}
        <div className="mb-8 sm:mb-12">
          <img
            src="/branding/ca_logo.png"
            alt="Coaching Amplifier"
            className="h-16 sm:h-20 md:h-24 w-auto mx-auto"
          />
        </div>

        <div className="w-full max-w-md space-y-4">
          {sent ? (
            <Card className="w-full max-w-md mx-auto bg-white border border-gray-200 shadow-lg">
              <CardContent className="pt-8 pb-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="h-8 w-8 text-green-600" />
                </div>
                <h2 className="text-xl font-heading font-bold text-optavia-dark">
                  Check Your Email
                </h2>
                <p className="text-optavia-gray text-sm">
                  If an account exists for <strong>{email}</strong>, we've sent a
                  password reset link. Please check your inbox and spam folder.
                </p>
                <div className="pt-4">
                  <Link href="/login">
                    <Button
                      variant="outline"
                      className="w-full"
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back to Sign In
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="w-full max-w-md mx-auto bg-white border border-gray-200 shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl font-heading text-optavia-dark">
                  Forgot Password
                </CardTitle>
                <CardDescription className="text-optavia-gray">
                  Enter your email and we'll send you a link to reset your password.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-optavia-dark">
                      Email
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={loading}
                        className="bg-white border-gray-300 text-optavia-dark pl-10"
                      />
                    </div>
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-[hsl(var(--optavia-green))] hover:bg-[hsl(var(--optavia-green-dark))] text-white"
                    disabled={loading || !email.trim()}
                  >
                    {loading ? "Sending..." : "Send Reset Link"}
                  </Button>
                  <div className="text-center">
                    <Link
                      href="/login"
                      className="text-sm text-[hsl(var(--optavia-green))] hover:underline inline-flex items-center gap-1"
                    >
                      <ArrowLeft className="h-3 w-3" />
                      Back to Sign In
                    </Link>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      <Footer />
    </div>
  )
}
