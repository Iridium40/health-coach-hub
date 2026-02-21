"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import {
  ArrowRight,
  ChevronDown,
  Check,
  ClipboardList,
  Users,
  UserCog,
  Library,
  Wrench,
  UtensilsCrossed,
  MessageSquareText,
  FileText,
  BarChart3,
  Target,
  Lightbulb,
  Phone,
  Rocket,
  Calendar,
  Shield,
} from "lucide-react"
import { useState } from "react"

const PILLAR_CARDS = [
  {
    title: "100's List",
    icon: <ClipboardList className="h-6 w-6" />,
    iconBg: "bg-amber-50",
    iconColor: "text-amber-600",
    description: "Your prospect pipeline from first contact to \"Client Won.\" Never lose a follow-up again.",
    features: ["Stage-based pipeline tracking", "Share Health Assessments", "Schedule & set reminders", "Built-in coaching guide"],
  },
  {
    title: "Client List",
    icon: <Users className="h-6 w-6" />,
    iconBg: "bg-teal-50",
    iconColor: "text-teal-600",
    description: "Daily touchpoints, milestone celebrations, and the exact script for every program day.",
    features: ["Auto-calculated program day", "Copy-paste text templates", "Client Journey with progress", "Needs Attention alerts"],
  },
  {
    title: "Coach List",
    icon: <UserCog className="h-6 w-6" />,
    iconBg: "bg-purple-50",
    iconColor: "text-purple-600",
    description: "Track the coaches you've sponsored — their rank, stage, and what they need from you.",
    features: ["Rank progression tracking", "Rank Guide & Focus actions", "Schedule mentoring sessions", "Client & prospect counts"],
  },
  {
    title: "Coaching Resource Library",
    icon: <Library className="h-6 w-6" />,
    iconBg: "bg-rose-50",
    iconColor: "text-rose-600",
    description: "Structured resources to train and teach coaches — from new coach basics to leadership mastery.",
    features: ["Rank-based training modules", "Video + document training", "Quizzes & progress tracking", "Achievement badges"],
  },
  {
    title: "Coach Tools",
    icon: <Wrench className="h-6 w-6" />,
    iconBg: "bg-sky-50",
    iconColor: "text-sky-600",
    description: "Quick-access tools for common coaching scenarios — objections, guidelines, and more.",
    features: ["Objection Navigator (15 flows)", "AI Social Media Post Generator", "Water & Exercise Calculators", "Quick reference cards"],
  },
  {
    title: "Meal Planner & Recipes",
    icon: <UtensilsCrossed className="h-6 w-6" />,
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
    description: "100+ Lean & Green recipes tagged with nutritional counts — build weekly meal plans and share with clients.",
    features: ["Weekly meal planner", "Instacart shopping lists", "Searchable & filterable", "Send plans to clients"],
  },
]

const STATS = [
  { value: "3", label: "Business Lists" },
  { value: "30+", label: "Day-by-Day Scripts" },
  { value: "100+", label: "Lean & Green Recipes" },
  { value: "15", label: "Objection Flows" },
]

const RECIPE_CATEGORIES = [
  { emoji: "🥩", label: "Lean Proteins" },
  { emoji: "🥗", label: "Salads & Bowls" },
  { emoji: "🍲", label: "Soups & Stews" },
  { emoji: "🍳", label: "Breakfast" },
  { emoji: "🥘", label: "Quick Meals" },
]

export function HomeLanding() {
  const [showPillars, setShowPillars] = useState(false)

  const scrollToPillars = () => {
    setShowPillars(true)
    setTimeout(() => {
      document.getElementById("pillars")?.scrollIntoView({ behavior: "smooth" })
    }, 100)
  }

  return (
    <div className="min-h-screen bg-white">
      {/* ============ HERO ============ */}
      <div className="relative bg-[#faf5eb] py-16 sm:py-24 md:py-32 overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
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

            <div className="inline-flex items-center gap-2 bg-white border border-[hsl(var(--optavia-green))]/20 rounded-full px-4 py-1.5 mb-8 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-[hsl(var(--optavia-green))]" />
              <span className="text-sm font-medium text-gray-700">Built for OPTAVIA Coaches</span>
            </div>

            <h1 className="font-heading font-bold text-3xl sm:text-4xl md:text-5xl lg:text-[3.5rem] text-optavia-dark mb-6 leading-[1.15] tracking-tight">
              Run your coaching business{" "}
              <span className="italic text-[hsl(var(--optavia-green))]">like a pro</span>
            </h1>

            <p className="text-base sm:text-lg text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              The all-in-one platform that gives you the exact scripts, daily touchpoints, training, and tracking tools to grow your OPTAVIA business — so nothing falls through the cracks.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
              <Button
                size="lg"
                className="bg-[hsl(var(--optavia-green))] hover:bg-[hsl(var(--optavia-green-dark))] text-white text-base px-8 py-6 shadow-lg hover:shadow-xl transition-all"
                asChild
              >
                <Link href="/login">
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="text-base px-8 py-6 border-gray-300 text-gray-700 hover:bg-gray-50"
                onClick={scrollToPillars}
              >
                See What's Inside
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* ============ STATS BAR ============ */}
      <div className="bg-gradient-to-r from-[hsl(var(--optavia-green-dark))] to-[hsl(var(--optavia-green))] py-8 sm:py-10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 max-w-4xl mx-auto">
            {STATS.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  {stat.value}
                </div>
                <div className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.15em] text-white/70 mt-1">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ============ SIX PILLARS ============ */}
      <div id="pillars" className="py-16 sm:py-24 bg-[#faf5eb]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 sm:mb-16">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[hsl(var(--optavia-green))] mb-3">
              Everything You Need
            </p>
            <h2 className="font-heading font-bold text-2xl sm:text-3xl md:text-4xl text-optavia-dark mb-4">
              Six pillars to grow your coaching business
            </h2>
            <p className="text-gray-600 max-w-xl mx-auto">
              Every tool, script, and resource — organized so you spend less time searching and more time coaching.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
            {PILLAR_CARDS.map((card) => (
              <div
                key={card.title}
                className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-100 hover:shadow-lg transition-all hover:border-gray-200"
              >
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${card.iconBg} ${card.iconColor} mb-5`}>
                  {card.icon}
                </div>
                <h3 className="font-heading font-bold text-lg sm:text-xl text-optavia-dark mb-2">
                  {card.title}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed mb-5">
                  {card.description}
                </p>
                <ul className="space-y-2">
                  {card.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm text-gray-700">
                      <Check className="h-4 w-4 text-[hsl(var(--optavia-green))] flex-shrink-0 mt-0.5" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ============ CLIENT SUPPORT SECTION ============ */}
      <div className="py-16 sm:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 sm:gap-16 items-center max-w-6xl mx-auto">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <MessageSquareText className="h-5 w-5 text-[hsl(var(--optavia-green))]" />
                <span className="text-sm font-semibold uppercase tracking-[0.15em] text-[hsl(var(--optavia-green))]">
                  Client Support
                </span>
              </div>
              <h2 className="font-heading font-bold text-2xl sm:text-3xl md:text-4xl text-optavia-dark mb-5 leading-tight">
                The right message, every single day
              </h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                The first 30 days are make-or-break. Your Client List gives you the exact text script for every program day — personalized, research-backed, and ready to copy-paste.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Tap <strong>Text</strong> on any client card and the day's message is waiting. Resources tab shows coaching actions, videos, and links for their current phase.
              </p>
            </div>
            <div className="space-y-3">
              {[
                { emoji: "🏗", text: "Day 1 — Foundation Day script ready", bg: "bg-amber-50" },
                { emoji: "🎬", text: "Kickoff Video + Lean & Green Video", bg: "bg-blue-50" },
                { emoji: "📋", text: "5&1 Tracker link to share", bg: "bg-green-50" },
                { emoji: "🔥", text: "Critical Phase coaching actions", bg: "bg-red-50" },
              ].map((item) => (
                <div key={item.text} className={`flex items-center gap-4 ${item.bg} rounded-xl px-5 py-4 border border-gray-100`}>
                  <span className="text-xl">{item.emoji}</span>
                  <span className="font-medium text-gray-800 text-sm sm:text-base">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ============ BUSINESS VISIBILITY SECTION ============ */}
      <div className="py-16 sm:py-24 bg-[#faf5eb]">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 sm:gap-16 items-center max-w-6xl mx-auto">
            {/* Mock Dashboard Card */}
            <div className="bg-gradient-to-br from-[hsl(var(--optavia-green-dark))] to-[#1a3a2a] rounded-2xl p-6 sm:p-8 text-white order-2 md:order-1">
              <div className="space-y-4">
                {[
                  { icon: "📋", text: "12 Prospects · 3 HA Scheduled", color: "bg-amber-500/20 border-amber-500/30" },
                  { icon: "👥", text: "8 Clients · 2 Need Attention", color: "bg-teal-500/20 border-teal-500/30" },
                  { icon: "🚀", text: "4 Coaches · 1 New Launch", color: "bg-purple-500/20 border-purple-500/30" },
                ].map((row) => (
                  <div key={row.text} className={`flex items-center gap-3 ${row.color} border rounded-xl px-4 py-3`}>
                    <span className="text-lg">{row.icon}</span>
                    <span className="font-medium text-sm sm:text-base">{row.text}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="order-1 md:order-2">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="h-5 w-5 text-[hsl(var(--optavia-green))]" />
                <span className="text-sm font-semibold uppercase tracking-[0.15em] text-[hsl(var(--optavia-green))]">
                  Business Visibility
                </span>
              </div>
              <h2 className="font-heading font-bold text-2xl sm:text-3xl md:text-4xl text-optavia-dark mb-5 leading-tight">
                See your entire business at a glance
              </h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                Three lists give you a complete picture: prospects in your pipeline, clients on program, and coaches you're developing. Each has pipeline counts, stage filters, and attention alerts.
              </p>
              <p className="text-gray-600 leading-relaxed">
                The coaches who scale aren't working harder — they're <strong>working systematically</strong>. Every card, every stage, every touchpoint is designed so nothing slips.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ============ BUILT-IN GUIDANCE SECTION ============ */}
      <div className="py-16 sm:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 sm:gap-16 items-center max-w-6xl mx-auto">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Target className="h-5 w-5 text-[hsl(var(--optavia-green))]" />
                <span className="text-sm font-semibold uppercase tracking-[0.15em] text-[hsl(var(--optavia-green))]">
                  Built-In Guidance
                </span>
              </div>
              <h2 className="font-heading font-bold text-2xl sm:text-3xl md:text-4xl text-optavia-dark mb-5 leading-tight">
                Know what to do — at every stage
              </h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                Every prospect, client, and coach card has an expandable <strong>Coaching Guide</strong> built right in. It tells you the coaching actions for their current stage, so even brand-new coaches operate like seasoned pros.
              </p>
              <p className="text-gray-600 leading-relaxed">
                From "share your story" for new prospects to "coach through discovery — do NOT provide answers" for active clients — the playbook is always one tap away.
              </p>
            </div>
            <div className="space-y-3">
              {[
                { emoji: "💡", text: "Stage-specific coaching actions", bg: "bg-amber-50" },
                { emoji: "🎯", text: "Next Goal to keep momentum", bg: "bg-rose-50" },
                { emoji: "📞", text: "Your Actions as a mentor", bg: "bg-green-50" },
              ].map((item) => (
                <div key={item.text} className={`flex items-center gap-4 ${item.bg} rounded-xl px-5 py-4 border border-gray-100`}>
                  <span className="text-xl">{item.emoji}</span>
                  <span className="font-medium text-gray-800 text-sm sm:text-base">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ============ RECIPES SECTION ============ */}
      <div className="py-16 sm:py-20 bg-gradient-to-r from-[hsl(var(--optavia-green))] to-[hsl(var(--optavia-green-dark))]">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="font-heading font-bold text-2xl sm:text-3xl md:text-4xl text-white mb-4">
              100+ Lean & Green Recipes
            </h2>
            <p className="text-white/80 leading-relaxed">
              Compliant, delicious, and ready to share with your clients. Every recipe tagged with nutritional counts for program tracking.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {RECIPE_CATEGORIES.map((cat) => (
              <span
                key={cat.label}
                className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/20 text-white rounded-full px-5 py-2.5 text-sm font-medium"
              >
                <span>{cat.emoji}</span>
                {cat.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ============ FINAL CTA ============ */}
      <div className="py-16 sm:py-24 bg-gradient-to-b from-[#faf5eb] to-white">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="font-heading font-bold text-2xl sm:text-3xl md:text-4xl text-optavia-dark mb-4 sm:mb-6">
              Ready to amplify your coaching?
            </h2>
            <p className="text-lg text-gray-600 mb-8 sm:mb-10">
              Sign in to access your personalized dashboard, daily scripts, and everything you need to grow your OPTAVIA business.
            </p>
            <Button
              size="lg"
              className="bg-[hsl(var(--optavia-green))] hover:bg-[hsl(var(--optavia-green-dark))] text-white text-base sm:text-lg px-10 py-7 shadow-lg hover:shadow-xl transition-all"
              asChild
            >
              <Link href="/login">
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <p className="mt-6 text-sm text-gray-500">
              Need an account? Contact your administrator for an invitation.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
