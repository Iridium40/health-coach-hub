"use client"

import { Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { SetPasswordForm } from "@/components/auth/set-password-form"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"

function SetPasswordPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const inviteKey = searchParams.get("invite")

  const handleSuccess = () => {
    // Redirect to login page after successful password set
    router.push("/login")
  }

  if (!inviteKey) {
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
            <CardContent className="pt-6">
              <div className="text-center">
                <h2 className="text-2xl font-heading text-optavia-dark mb-4">Invalid Invite Link</h2>
                <p className="text-optavia-gray mb-6">
                  This invite link is missing the required invite key. Please use the link provided in your invitation email.
                </p>
                <Link href="/login" className="text-[hsl(var(--optavia-green))] hover:underline">
                  Go to Sign In
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    )
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
          <SetPasswordForm onSuccess={handleSuccess} inviteKey={inviteKey} />
          <div className="text-center text-sm text-optavia-gray">
            <p>
              Already have an account?{" "}
              <Link href="/login" className="text-[hsl(var(--optavia-green))] hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default function SetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[hsl(var(--optavia-green))] mx-auto mb-4"></div>
          <p className="text-optavia-gray">Loading...</p>
        </div>
      </div>
    }>
      <SetPasswordPageContent />
    </Suspense>
  )
}

