"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"
import { Eye, EyeOff } from "lucide-react"

interface LoginFormProps {
  onSuccess?: () => void
  onSwitchToSignup?: () => void
}

export function LoginForm({ onSuccess, onSwitchToSignup }: LoginFormProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loginError, setLoginError] = useState("")
  const { signIn } = useAuth()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setLoginError("")

    const { error } = await signIn(email, password)

    if (error) {
      // Show a user-friendly message near the form
      setLoginError("Invalid email or password. Please try again.")
    } else {
      onSuccess?.()
    }

    setLoading(false)
  }

  return (
    <Card className="w-full max-w-md mx-auto bg-white border border-gray-200 shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-heading text-optavia-dark">Welcome Back</CardTitle>
        <CardDescription className="text-optavia-gray">Sign in to your Coaching Amplifier account</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-optavia-dark">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setLoginError("") }}
              required
              disabled={loading}
              className="bg-white border-gray-300 text-optavia-dark"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-optavia-dark">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setLoginError("") }}
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
            {loginError && (
              <p className="text-sm text-red-600 font-medium">{loginError}</p>
            )}
          </div>
          <div className="flex justify-end">
            <Link
              href="/forgot-password"
              className="text-sm text-[hsl(var(--optavia-green))] hover:underline"
            >
              Forgot Password?
            </Link>
          </div>
          <Button type="submit" className="w-full bg-[hsl(var(--optavia-green))] hover:bg-[hsl(var(--optavia-green-dark))] text-white" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </Button>
          {onSwitchToSignup && (
            <div className="text-center text-sm text-optavia-gray">
              Don't have an account?{" "}
              <button
                type="button"
                onClick={onSwitchToSignup}
                className="text-[hsl(var(--optavia-green))] hover:underline"
              >
                Sign up
              </button>
            </div>
          )}
          <div className="text-center text-xs text-optavia-gray pt-2 border-t">
            <Link href="/terms" target="_blank" className="hover:underline mr-2">
              Terms
            </Link>
            <span className="mx-1">•</span>
            <Link href="/privacy" target="_blank" className="hover:underline mr-2">
              Privacy
            </Link>
            <span className="mx-1">•</span>
            <Link href="/cookies" target="_blank" className="hover:underline">
              Cookies
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

