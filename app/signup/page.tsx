"use client"

import { Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { SignupForm } from "@/components/auth/signup-form"
import Link from "next/link"

function SignupPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const inviteKey = searchParams.get("invite")

  const handleSuccess = () => {
    // Redirect to home page after successful signup
    router.push("/")
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4 py-12">
      {/* Logo */}
      <div className="mb-8 sm:mb-12">
        <img 
          src="/branding/ca_logo.png" 
          alt="Coaching Amplifier" 
          className="h-16 sm:h-20 md:h-24 w-auto mx-auto"
        />
      </div>

      <div className="w-full max-w-md space-y-4">
        <SignupForm onSuccess={handleSuccess} inviteKey={inviteKey} />
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
  )
}

export default function SignupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[hsl(var(--optavia-green))] mx-auto mb-4"></div>
          <p className="text-optavia-gray">Loading...</p>
        </div>
      </div>
    }>
      <SignupPageContent />
    </Suspense>
  )
}

