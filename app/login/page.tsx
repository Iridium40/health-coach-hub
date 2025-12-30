"use client"

import { useRouter } from "next/navigation"
import { LoginForm } from "@/components/auth/login-form"
import { Footer } from "@/components/footer"
import Link from "next/link"

export default function LoginPage() {
  const router = useRouter()

  const handleSuccess = () => {
    // Redirect to home page after successful login
    router.push("/")
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
          <LoginForm onSuccess={handleSuccess} />
          <div className="text-center text-sm text-optavia-gray">
            <p>
              Need an account? Contact your administrator for an invitation.
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
