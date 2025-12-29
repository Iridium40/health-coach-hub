"use client"

import { useRouter } from "next/navigation"
import { LoginForm } from "@/components/auth/login-form"
import Link from "next/link"

export default function LoginPage() {
  const router = useRouter()

  const handleSuccess = () => {
    // Redirect to home page after successful login
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
        <LoginForm onSuccess={handleSuccess} />
        <div className="text-center text-sm text-optavia-gray">
          <p>
            Don't have an account?{" "}
            <Link href="/signup" className="text-[hsl(var(--optavia-green))] hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
