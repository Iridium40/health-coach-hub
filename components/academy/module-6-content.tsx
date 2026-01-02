"use client"

import { LessonCard } from "./LessonCard"
import { Checklist } from "./Checklist"
import { QuoteBox } from "./QuoteBox"
import { ImportantBanner } from "./ImportantBanner"
import { JourneyTimeline } from "./JourneyTimeline"

export function Module6Content() {
  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-amber-500/20 via-amber-500/10 to-[hsl(var(--optavia-green))]/10 border-2 border-amber-500/30 rounded-3xl p-8 md:p-12 text-center mb-8">
        <div className="text-6xl md:text-7xl mb-4">✨</div>
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          <div className="text-amber-300/90">Integrated Presidential</div>
          <div className="text-[hsl(var(--optavia-green))]/90">Director</div>
        </h1>
        <p className="text-xl md:text-2xl text-optavia-dark max-w-3xl mx-auto">
          The highest rank in OPTAVIA. You&apos;ve built a legacy that transforms thousands of lives.
        </p>
      </div>

      {/* IPD Requirements */}
      <LessonCard
        number={1}
        title="IPD Requirements"
        subtitle="The highest achievement in OPTAVIA"
      >
        <p className="mb-6 text-lg">
          To achieve Integrated Presidential Director, you must reach the pinnacle of both health coaching and business building:
        </p>

        <div className="grid md:grid-cols-2 gap-4 my-6">
          <div className="bg-gradient-to-br from-[hsl(var(--optavia-green))]/20 to-[hsl(var(--optavia-green))]/10 border-2 border-[hsl(var(--optavia-green))] rounded-2xl p-6">
            <div className="text-2xl font-bold text-[hsl(var(--optavia-green))] mb-3">10 Executive Directors</div>
            <p className="text-optavia-dark">Build 10 active Executive Director teams in your organization</p>
          </div>
          <div className="bg-gradient-to-br from-amber-500/20 to-amber-500/10 border-2 border-amber-500/50 rounded-2xl p-6">
            <div className="text-2xl font-bold text-amber-300 mb-3">5 FIBC Teams</div>
            <p className="text-optavia-dark">At least 5 of those EDs must maintain FIBC status</p>
          </div>
        </div>

        <QuoteBox color="yellow">
          <strong>Full Integration:</strong> You&apos;ve mastered both sides of the business — health coaching excellence AND business building mastery.
        </QuoteBox>
      </LessonCard>

      {/* The Trilogy */}
      <LessonCard
        number={2}
        title="The Trilogy: Health, Wealth, and Legacy"
        subtitle="What you&apos;ve really built"
      >
        <div className="grid md:grid-cols-3 gap-4 my-6">
          {[
            {
              icon: "💚",
              title: "Health",
              desc: "You&apos;ve helped thousands transform their health and lives",
            },
            {
              icon: "💰",
              title: "Wealth",
              desc: "You&apos;ve built a sustainable, profitable business",
            },
            {
              icon: "🌟",
              title: "Legacy",
              desc: "You&apos;ve created systems and culture that will outlast you",
            },
          ].map((item, i) => (
            <div
              key={i}
              className="bg-white border border-[hsl(var(--optavia-border))] rounded-2xl p-6 text-center"
            >
              <div className="text-5xl mb-3">{item.icon}</div>
              <div className="text-xl font-bold text-optavia-dark mb-2">{item.title}</div>
              <div className="text-sm text-optavia-gray">{item.desc}</div>
            </div>
          ))}
        </div>

        <QuoteBox color="yellow">
          At IPD, you haven&apos;t just built a business — you&apos;ve built a movement that changes lives for generations to come.
        </QuoteBox>
      </LessonCard>

      {/* The Complete Journey */}
      <LessonCard
        number={3}
        title="The Complete Journey"
        subtitle="From New Coach to Integrated Presidential Director"
      >
        <JourneyTimeline
          items={[
            {
              rank: "New Coach",
              milestone: "Complete first 30 days, earn CAB, achieve Senior Coach",
            },
            {
              rank: "Senior Coach → Executive Director",
              milestone: "Build client base, accumulate 5 Qualifying Points",
            },
            {
              rank: "Executive Director → Regional Director",
              milestone: "Achieve FIBC, develop your first ED",
            },
            {
              rank: "Regional → National → Global Director",
              milestone: "Build multiple ED teams, unlock Elite Leadership Bonuses",
            },
            {
              rank: "Global → Presidential Director",
              milestone: "Build 6 ED generations, unlock all Elite Bonuses",
            },
            {
              rank: "Integrated Presidential Director",
              milestone: "Build 10 ED teams (5 FIBC), achieve full integration",
            },
          ]}
        />
      </LessonCard>

      {/* Impact Grid */}
      <LessonCard
        number={4}
        title="Your Impact"
        subtitle="The ripple effect of your leadership"
      >
        <div className="grid md:grid-cols-2 gap-6 my-6">
          {[
            {
              number: "10+",
              label: "Executive Directors",
              desc: "Leaders you&apos;ve developed who are developing others",
            },
            {
              number: "100+",
              label: "Active Coaches",
              desc: "Coaches in your organization changing lives daily",
            },
            {
              number: "1,000+",
              label: "Clients Served",
              desc: "Lives transformed through the systems you&apos;ve built",
            },
            {
              number: "∞",
              label: "Generations",
              desc: "Your legacy continues through leaders you&apos;ve developed",
            },
          ].map((item, i) => (
            <div
              key={i}
              className="bg-gradient-to-br from-white to-gray-50 border border-[hsl(var(--optavia-border))] rounded-2xl p-6 text-center"
            >
              <div className="text-5xl font-bold text-[hsl(var(--optavia-green))] mb-2">{item.number}</div>
              <div className="text-lg font-bold text-optavia-dark mb-1">{item.label}</div>
              <div className="text-sm text-optavia-gray">{item.desc}</div>
            </div>
          ))}
        </div>
      </LessonCard>

      {/* Final Milestones */}
      <LessonCard
        number={5}
        title="Final Milestones"
        subtitle="Your checklist to Integrated Presidential Director"
      >
        <Checklist
          items={[
            { text: "Maintain Presidential Director status" },
            { text: "Maintain FIBC status consistently (full integration)" },
            { text: "Build organization to 10 Executive Directors" },
            { text: "Ensure 5 of those EDs maintain FIBC status" },
            { text: "Build 6 generations of ED depth" },
            { text: "Unlock all Elite Leadership Bonuses (1.5%)" },
            { text: "Create systems that work at scale" },
            { text: "Build culture that transforms lives" },
            { text: "Develop leaders who develop leaders" },
            { text: "✨ Achieve Integrated Presidential Director!" },
          ]}
        />

        <ImportantBanner
          bigText="🎉 CONGRATULATIONS!"
          subText="You've reached the pinnacle of OPTAVIA coaching. Your legacy of transformed lives will continue for generations."
        />
      </LessonCard>

      {/* Final Quote */}
      <div className="bg-gradient-to-r from-[hsl(var(--optavia-green))] via-[hsl(var(--optavia-green))] to-[hsl(var(--optavia-green))] rounded-2xl p-8 md:p-12 text-center my-8">
        <QuoteBox color="green">
          <div className="text-xl md:text-2xl font-semibold text-optavia-dark leading-relaxed">
            &quot;You didn&apos;t just build a business. You built a movement that transforms thousands of lives. Your legacy isn&apos;t measured in dollars — it&apos;s measured in lives changed, families transformed, and leaders you&apos;ve developed who will continue changing the world long after you. This is what it means to be an Integrated Presidential Director.&quot;
          </div>
        </QuoteBox>
      </div>
    </div>
  )
}
