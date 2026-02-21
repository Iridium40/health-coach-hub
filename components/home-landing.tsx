"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ArrowRight, BookOpen, Library, UtensilsCrossed, Users, CalendarDays, BarChart3 } from "lucide-react"

export function HomeLanding() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative bg-[#faf5eb] py-20 sm:py-28 md:py-36">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <div className="mb-6 sm:mb-8">
              <Image
                src="/branding/ca_logo.svg"
                alt="Coaching Amplifier"
                width={480}
                height={130}
                className="h-16 sm:h-20 md:h-28 w-auto mx-auto"
                priority
              />
            </div>
            <p className="text-sm sm:text-base font-semibold tracking-widest uppercase text-[hsl(var(--optavia-green))] mb-3 sm:mb-4">
              Built for OPTAVIA Coaches
            </p>
            <h1 className="font-heading font-bold text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-optavia-dark mb-4 sm:mb-6 leading-tight">
              Your All-in-One Coaching Hub
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-optavia-gray mb-8 sm:mb-12 max-w-2xl mx-auto leading-relaxed">
              Resources, training, client tools, and recipes — everything you need to grow your coaching business in one place.
            </p>
            <Button
              size="lg"
              className="bg-[hsl(var(--optavia-green))] hover:bg-[hsl(var(--optavia-green-dark))] text-white text-base sm:text-lg px-8 sm:px-12 py-6 sm:py-7 shadow-lg hover:shadow-xl transition-shadow"
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
              A comprehensive platform designed to help you grow your coaching business and support your clients
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10 max-w-6xl mx-auto">
            {/* Coaching Resource Library */}
            <div className="text-center p-6 sm:p-8 rounded-xl border border-gray-200 hover:shadow-lg transition-all hover:border-[hsl(var(--optavia-green))]/30">
              <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[hsl(var(--optavia-green-light))] mb-4 sm:mb-6">
                <Library className="h-8 w-8 sm:h-10 sm:w-10 text-[hsl(var(--optavia-green))]" />
              </div>
              <h3 className="font-heading font-bold text-xl sm:text-2xl text-optavia-dark mb-3 sm:mb-4">
                Coaching Resource Library
              </h3>
              <p className="text-optavia-gray leading-relaxed">
                A curated library of resources to train and teach coaches — organized by topic so you can learn at your own pace and level up your skills.
              </p>
            </div>

            {/* Client Support Tools */}
            <div className="text-center p-6 sm:p-8 rounded-xl border border-gray-200 hover:shadow-lg transition-all hover:border-[hsl(var(--optavia-green))]/30">
              <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[hsl(var(--optavia-green-light))] mb-4 sm:mb-6">
                <Users className="h-8 w-8 sm:h-10 sm:w-10 text-[hsl(var(--optavia-green))]" />
              </div>
              <h3 className="font-heading font-bold text-xl sm:text-2xl text-optavia-dark mb-3 sm:mb-4">
                Client Support Tools
              </h3>
              <p className="text-optavia-gray leading-relaxed">
                Day-by-day client journey calendars, copyable scripts, health assessments, and tracking tools to support your clients every step of the way.
              </p>
            </div>

            {/* Recipes */}
            <div className="text-center p-6 sm:p-8 rounded-xl border border-gray-200 hover:shadow-lg transition-all hover:border-[hsl(var(--optavia-green))]/30">
              <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[hsl(var(--optavia-green-light))] mb-4 sm:mb-6">
                <UtensilsCrossed className="h-8 w-8 sm:h-10 sm:w-10 text-[hsl(var(--optavia-green))]" />
              </div>
              <h3 className="font-heading font-bold text-xl sm:text-2xl text-optavia-dark mb-3 sm:mb-4">
                Lean & Green Recipes
              </h3>
              <p className="text-optavia-gray leading-relaxed">
                A growing collection of delicious Lean & Green recipes to share with your clients and support their health journey.
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
              Sign in to access your personalized dashboard and start growing your coaching business today.
            </p>
            <Button
              size="lg"
              className="bg-[hsl(var(--optavia-green))] hover:bg-[hsl(var(--optavia-green-dark))] text-white text-base sm:text-lg px-8 sm:px-12 py-6 sm:py-7 shadow-lg hover:shadow-xl transition-shadow"
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

