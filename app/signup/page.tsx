"use client"

import { useRouter } from "next/navigation"
import { SignupForm } from "@/components/auth/signup-form"
import Link from "next/link"

export default function SignupPage() {
  const router = useRouter()

  const handleSuccess = () => {
    // Redirect to home page after successful signup
    router.push("/")
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4 py-12">
      {/* Logo */}
      <div className="mb-8 sm:mb-12">
        <img 
          src="/ca_logo.jpg" 
          alt="Coaching Amplifier" 
          className="h-16 sm:h-20 md:h-24 w-auto mx-auto"
        />
      </div>

      <div className="w-full max-w-md space-y-4">
        <SignupForm onSuccess={handleSuccess} />
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

