"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Sparkles, GraduationCap } from "lucide-react"

interface OnboardingProps {
  onComplete: (isNewCoach: boolean) => void
}

export function Onboarding({ onComplete }: OnboardingProps) {
  return (
    <div className="relative">
      {/* Hero Section */}
      <div className="relative h-[300px] sm:h-[350px] md:h-[400px] overflow-hidden">
        {/* Background Image */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "url('/media/two-women-walking-exercising-with-water-bottles.jpg')",
            backgroundSize: "90%",
            backgroundPosition: "center top",
            backgroundRepeat: "no-repeat",
          }}
        />
        {/* Green Gradient Overlay (85-90% opacity) */}
        <div 
          className="absolute inset-0 bg-[hsl(var(--optavia-green))]"
          style={{ opacity: 0.87 }}
        />
        <div className="relative container mx-auto px-4 h-full flex flex-col items-center justify-center text-center text-white z-10">
          <h1 className="font-heading font-bold text-2xl sm:text-3xl md:text-4xl lg:text-5xl mb-3 sm:mb-4 px-4">Welcome to Coaching Amplifier</h1>
          <p className="text-base sm:text-lg md:text-xl max-w-2xl px-4">
            Your comprehensive resource center for coaching success, training modules, and delicious Lean & Green
            recipes
          </p>
        </div>
      </div>

      {/* Selection Cards */}
      <div className="container mx-auto px-4 -mt-16 sm:-mt-24 relative z-10 pb-8 sm:pb-12">
        <div className="grid md:grid-cols-2 gap-4 sm:gap-6 max-w-4xl mx-auto">
          <Card
            className="p-6 sm:p-8 bg-white hover:shadow-xl transition-shadow cursor-pointer"
            onClick={() => onComplete(true)}
          >
            <div className="flex flex-col items-center text-center gap-3 sm:gap-4">
              <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-[hsl(var(--optavia-green-light))] flex items-center justify-center">
                <Sparkles className="h-6 w-6 sm:h-8 sm:w-8 text-[hsl(var(--optavia-green))]" />
              </div>
              <h2 className="font-heading font-bold text-xl sm:text-2xl text-optavia-dark">I'm a New Coach</h2>
              <p className="text-optavia-gray">
                Get started with a guided journey through essential resources and training modules designed specifically
                for new coaches.
              </p>
              <Button
                className="w-full bg-[hsl(var(--optavia-green))] hover:bg-[hsl(var(--optavia-green-dark))]"
                onClick={() => onComplete(true)}
              >
                Start New Coach Journey
              </Button>
            </div>
          </Card>

          <Card
            className="p-6 sm:p-8 bg-white hover:shadow-xl transition-shadow cursor-pointer"
            onClick={() => onComplete(false)}
          >
            <div className="flex flex-col items-center text-center gap-3 sm:gap-4">
              <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-[hsl(var(--optavia-green-light))] flex items-center justify-center">
                <GraduationCap className="h-6 w-6 sm:h-8 sm:w-8 text-[hsl(var(--optavia-green))]" />
              </div>
              <h2 className="font-heading font-bold text-xl sm:text-2xl text-optavia-dark">I'm an Existing Coach</h2>
              <p className="text-optavia-gray">
                Access all resources, training modules, and recipes. Continue building your coaching business with full
                access.
              </p>
              <Button
                className="w-full bg-[hsl(var(--optavia-green))] hover:bg-[hsl(var(--optavia-green-dark))]"
                onClick={() => onComplete(false)}
              >
                Access All Resources
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
