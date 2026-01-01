"use client"

import { ArrowLeft, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function OnboardingWelcomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-green-100/50" style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" }}>
      {/* Navigation Bar */}
      <div className="bg-white border-b border-green-100 sticky top-0 z-40">
        <div className="container max-w-3xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link href="/training">
              <Button variant="ghost" size="sm" className="text-gray-600 hover:text-[#00A651]">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Training
              </Button>
            </Link>
            <Link href="/onboarding/business">
              <Button size="sm" className="bg-[#00A651] hover:bg-[#00c760] text-white">
                Next: Business Resources
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-[#00A651] via-[#00c760] to-[#00A651] rounded-b-3xl px-6 py-12 md:py-16 text-center text-white relative overflow-hidden mb-8">
        <div className="absolute inset-0 bg-gradient-radial from-white/10 to-transparent animate-pulse"></div>
        <div className="relative z-10">
          <div className="text-5xl md:text-6xl mb-4">🎉</div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Welcome, New Coach!</h1>
          <p className="text-lg md:text-xl opacity-95">Your journey to helping others transform their lives starts here</p>
        </div>
      </div>

      <div className="container max-w-3xl mx-auto px-4 pb-16 space-y-6">
        {/* The Secret */}
        <div className="bg-white rounded-2xl p-6 md:p-8 shadow-lg border border-green-100">
          <div className="bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl p-6 mb-6 border-l-4 border-yellow-500">
            <div className="text-xs uppercase tracking-wider text-amber-700 font-bold mb-2">🔑 The Secret to New Coach Growth</div>
            <div className="text-lg md:text-xl font-bold text-gray-800">SIMPLE, CONSISTENT ACTION</div>
          </div>
          <p className="text-gray-600 leading-relaxed">
            This playbook gives you all the tools you need, but the playbook is NOT the secret to growth. Just like you leaned into your Health Coach to create health wins, you&apos;ll lean into your coach as a <strong>Business Coach</strong>, and they will mentor you to success.
          </p>
        </div>

        {/* Apprenticeship Model */}
        <div className="bg-white rounded-2xl p-6 md:p-8 shadow-lg border border-green-100">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 bg-gradient-to-br from-[#00A651] to-[#00c760] rounded-2xl flex items-center justify-center text-2xl">🎓</div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">The Apprenticeship Model</h2>
              <p className="text-gray-600">Learn by doing, not just reading</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-center gap-3 mb-6">
            <div className="bg-green-50 px-6 py-4 rounded-xl text-center font-semibold text-green-800">Your Coach SHOWS</div>
            <div className="text-2xl text-[#00A651]">→</div>
            <div className="bg-green-50 px-6 py-4 rounded-xl text-center font-semibold text-green-800">You WATCH</div>
            <div className="text-2xl text-[#00A651]">→</div>
            <div className="bg-green-50 px-6 py-4 rounded-xl text-center font-semibold text-green-800">You LEARN</div>
          </div>

          <div className="bg-gray-50 rounded-xl p-6 italic text-gray-700 border-l-4 border-[#00A651] mb-4">
            Think of it like being a student teacher who shadows an experienced teacher to learn how to do the job. You will <strong>NEVER</strong> be alone on your coaching journey!
          </div>

          <ul className="space-y-3">
            {[
              "You'll have help from your own coach AND their upline mentors",
              "You'll be added to a message thread with your Upline coaches",
              "Keep ALL communication in that thread for best support"
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="text-[#00A651] font-bold text-xl mt-0.5">✓</span>
                <span className="text-gray-700">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* The Parallel */}
        <div className="bg-white rounded-2xl p-6 md:p-8 shadow-lg border border-green-100">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 bg-gradient-to-br from-[#00A651] to-[#00c760] rounded-2xl flex items-center justify-center text-2xl">🔄</div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Client → Coach Parallel</h2>
              <p className="text-gray-600">Same support, different focus</p>
            </div>
          </div>

          <p className="text-gray-600 mb-6">Launching as a coach is a lot like starting as a client:</p>

          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div className="bg-green-50 p-5 rounded-xl">
              <div className="font-semibold text-green-800 mb-2">As a New Client</div>
              <p className="text-sm text-gray-700">Daily, step-by-step guidance from your <strong>Health Coach</strong></p>
            </div>
            <div className="bg-blue-50 p-5 rounded-xl">
              <div className="font-semibold text-blue-800 mb-2">As a New Coach</div>
              <p className="text-sm text-gray-700">Daily, step-by-step guidance from your <strong>Business Coach</strong> mentorship team</p>
            </div>
          </div>

          <div className="bg-pink-50 rounded-xl p-6 text-center border border-pink-200">
            <div className="text-3xl mb-2">💚</div>
            <p className="text-pink-900 font-medium">Lean in, ask questions, and stay in close contact with your mentors as you learn the ropes!</p>
          </div>
        </div>

        {/* Your First 30 Days */}
        <div className="bg-white rounded-2xl p-6 md:p-8 shadow-lg border border-green-100">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 bg-gradient-to-br from-[#00A651] to-[#00c760] rounded-2xl flex items-center justify-center text-2xl">📅</div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Your First 30 Days</h2>
              <p className="text-gray-600">Focus on these 4 core activities</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-6">
            {[
              { icon: "📱", word: "SHARE", desc: "Your story on social media" },
              { icon: "🤝", word: "CONNECT", desc: "Your mentorship in 3-way messages" },
              { icon: "👂", word: "LISTEN", desc: "To Health Assessment calls" },
              { icon: "💪", word: "SUPPORT", desc: "New clients by co-coaching with mentors" }
            ].map((action, i) => (
              <div key={i} className="bg-gradient-to-br from-green-50 to-green-100/50 p-6 rounded-xl text-center border-2 border-transparent hover:border-[#00A651] transition-colors">
                <div className="text-4xl mb-3">{action.icon}</div>
                <div className="text-xl font-bold text-[#00A651] mb-2">{action.word}</div>
                <div className="text-sm text-gray-700">{action.desc}</div>
              </div>
            ))}
          </div>

          <div className="bg-yellow-50 rounded-xl p-5 italic text-gray-700 border-l-4 border-yellow-500">
            <strong>That&apos;s it!</strong> You will learn by doing it WITH your coach, not by memorizing this manual.
          </div>
        </div>

        {/* Important Banner */}
        <div className="bg-gradient-to-r from-[#00A651] to-[#00c760] rounded-2xl p-8 text-center text-white shadow-lg">
          <div className="text-xl md:text-2xl font-bold mb-2">🚀 COACHES WHO ATTEND WEEKLY THEIR FIRST MONTH GROW FASTER!</div>
          <div className="text-lg opacity-95">Consistency is the key to your success</div>
        </div>

        {/* Saturday Huddle */}
        <div className="bg-white rounded-2xl p-6 md:p-8 shadow-lg border border-green-100">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 bg-gradient-to-br from-[#00A651] to-[#00c760] rounded-2xl flex items-center justify-center text-2xl">📹</div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Saturday New Coach Huddle</h2>
              <p className="text-gray-600">Your weekly connection with the team</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-8 text-center border-2 border-blue-300">
            <div className="text-lg font-semibold text-blue-800 uppercase tracking-wider mb-2">Every Saturday</div>
            <div className="text-sm text-blue-600 mb-2">Zoom Meeting ID</div>
            <div className="text-4xl font-bold text-blue-900 font-mono tracking-wider mb-4">404 357 2439</div>
            <div className="inline-block bg-blue-700 text-white px-5 py-2 rounded-lg font-semibold mb-6">Passcode: OPTAVIA</div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-6">
              {[
                { time: "7:00 AM", zone: "Pacific" },
                { time: "8:00 AM", zone: "Mountain" },
                { time: "9:00 AM", zone: "Central" },
                { time: "10:00 AM", zone: "Eastern" }
              ].map((slot, i) => (
                <div key={i} className="bg-white p-3 rounded-lg">
                  <div className="font-bold text-blue-700">{slot.time}</div>
                  <div className="text-xs text-gray-600">{slot.zone}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Navigation Footer */}
        <div className="flex justify-between items-center gap-4 pt-8 border-t border-green-200 mt-8">
          <Link href="/training">
            <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Training
            </Button>
          </Link>
          <Link href="/onboarding/business">
            <Button className="bg-[#00A651] hover:bg-[#00c760] text-white">
              Next: Business Resources
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
