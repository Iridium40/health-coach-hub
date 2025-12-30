"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, BookOpen, Users, UtensilsCrossed, GraduationCap } from "lucide-react"

export function HomeLanding() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative bg-[#faf5eb] py-16 sm:py-24 md:py-32">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <div className="mb-8">
              <img 
                src="/branding/ca_logo.png" 
                alt="Coaching Amplifier" 
                className="h-20 sm:h-24 md:h-32 w-auto mx-auto"
              />
            </div>
            <h1 className="font-heading font-bold text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-optavia-dark mb-4 sm:mb-6">
              Welcome to Coaching Amplifier
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-optavia-gray mb-8 sm:mb-12 max-w-2xl mx-auto">
              Your comprehensive resource center for coaching success, training modules, and delicious Lean & Green recipes
            </p>
            <Button
              size="lg"
              className="bg-[hsl(var(--optavia-green))] hover:bg-[hsl(var(--optavia-green-dark))] text-white text-base sm:text-lg px-8 sm:px-12 py-6 sm:py-7"
              asChild
            >
              <Link href="/login">
                Sign In
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 sm:py-20 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="font-heading font-bold text-2xl sm:text-3xl md:text-4xl text-optavia-dark mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-lg text-optavia-gray max-w-2xl mx-auto">
              Access comprehensive resources designed to help you grow your coaching business and support your clients
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10 max-w-6xl mx-auto">
            {/* Training */}
            <div className="text-center p-6 sm:p-8 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[hsl(var(--optavia-green-light))] mb-4 sm:mb-6">
                <GraduationCap className="h-8 w-8 sm:h-10 sm:w-10 text-[hsl(var(--optavia-green))]" />
              </div>
              <h3 className="font-heading font-bold text-xl sm:text-2xl text-optavia-dark mb-3 sm:mb-4">
                Training Modules
              </h3>
              <p className="text-optavia-gray">
                Access comprehensive training modules organized by category to enhance your coaching skills and grow your business
              </p>
            </div>

            {/* Resources */}
            <div className="text-center p-6 sm:p-8 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[hsl(var(--optavia-green-light))] mb-4 sm:mb-6">
                <BookOpen className="h-8 w-8 sm:h-10 sm:w-10 text-[hsl(var(--optavia-green))]" />
              </div>
              <h3 className="font-heading font-bold text-xl sm:text-2xl text-optavia-dark mb-3 sm:mb-4">
                External Resources
              </h3>
              <p className="text-optavia-gray">
                Connect with OPTAVIA resources, social media, and community groups to stay engaged and informed
              </p>
            </div>

            {/* Recipes */}
            <div className="text-center p-6 sm:p-8 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[hsl(var(--optavia-green-light))] mb-4 sm:mb-6">
                <UtensilsCrossed className="h-8 w-8 sm:h-10 sm:w-10 text-[hsl(var(--optavia-green))]" />
              </div>
              <h3 className="font-heading font-bold text-xl sm:text-2xl text-optavia-dark mb-3 sm:mb-4">
                Lean & Green Recipes
              </h3>
              <p className="text-optavia-gray">
                Discover a collection of delicious Lean & Green recipes to share with your clients and support their health journey
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 sm:py-20 md:py-24 bg-[#faf5eb]">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="font-heading font-bold text-2xl sm:text-3xl md:text-4xl text-optavia-dark mb-4 sm:mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-lg text-optavia-gray mb-8 sm:mb-10">
              Sign in to access your personalized dashboard and start your coaching journey
            </p>
            <Button
              size="lg"
              className="bg-[hsl(var(--optavia-green))] hover:bg-[hsl(var(--optavia-green-dark))] text-white text-base sm:text-lg px-8 sm:px-12 py-6 sm:py-7"
              asChild
            >
              <Link href="/login">
                Sign In to Your Account
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <p className="mt-6 text-sm text-optavia-gray">
              Need an account? Contact your administrator for an invitation.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

