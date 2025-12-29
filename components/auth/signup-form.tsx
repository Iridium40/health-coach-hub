"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"

interface SignupFormProps {
  onSuccess?: () => void
  onSwitchToLogin?: () => void
}

export function SignupForm({ onSuccess, onSwitchToLogin }: SignupFormProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [isNewCoach, setIsNewCoach] = useState(true)
  const [acceptedDataDeletion, setAcceptedDataDeletion] = useState(false)
  const [loading, setLoading] = useState(false)
  const { signUp } = useAuth()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!acceptedDataDeletion) {
      toast({
        title: "Required",
        description: "Please acknowledge the data deletion policy to continue.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    const { error } = await signUp(email, password, fullName)

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } else {
      toast({
        title: "Success",
        description: "Account created! Please check your email to verify your account.",
      })
      // Note: We'll update the profile with isNewCoach after email verification
      onSuccess?.()
    }

    setLoading(false)
  }

  return (
    <Card className="w-full max-w-md mx-auto bg-white border border-gray-200 shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-heading text-optavia-dark">Create Account</CardTitle>
        <CardDescription className="text-optavia-gray">Sign up for Coaching Amplifier</CardDescription>
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
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isNewCoach"
              checked={isNewCoach}
              onCheckedChange={(checked) => setIsNewCoach(checked === true)}
              disabled={loading}
            />
            <Label htmlFor="isNewCoach" className="text-sm font-normal cursor-pointer">
              I'm a new coach
            </Label>
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
              .
            </p>

            <div className="flex items-start space-x-2">
              <Checkbox
                id="dataDeletion"
                checked={acceptedDataDeletion}
                onCheckedChange={(checked) => setAcceptedDataDeletion(checked === true)}
                disabled={loading}
                required
              />
              <Label htmlFor="dataDeletion" className="text-sm font-normal cursor-pointer leading-tight">
                I understand that my information will be stored and that I can request deletion of my account and data
                at any time. I acknowledge that data deletion will result in permanent loss of access to the Service and
                I will no longer be able to use the app.
              </Label>
            </div>
          </div>

          <Button type="submit" className="w-full bg-[hsl(var(--optavia-green))] hover:bg-[hsl(var(--optavia-green-dark))] text-white" disabled={loading || !acceptedDataDeletion}>
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

