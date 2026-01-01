"use client"

import { ArrowLeft, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function OnboardingBusinessPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-green-100/50" style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" }}>
      {/* Navigation Bar */}
      <div className="bg-white border-b border-green-100 sticky top-0 z-40">
        <div className="container max-w-3xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link href="/onboarding/welcome">
              <Button variant="ghost" size="sm" className="text-gray-600 hover:text-[#00A651]">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Previous: Welcome
              </Button>
            </Link>
            <Link href="/onboarding/acronyms">
              <Button size="sm" className="bg-[#00A651] hover:bg-[#00c760] text-white">
                Next: Acronyms Guide
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="container max-w-3xl mx-auto px-4 py-12 pb-16 space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-[#00A651] mb-2">📚 Business Resources</h1>
          <p className="text-gray-600 text-lg">Everything you need to grow your OPTAVIA coaching business</p>
        </div>

        {/* Saturday Huddle Card */}
        <div className="bg-white rounded-2xl p-6 md:p-8 shadow-lg border border-green-100">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 bg-gradient-to-br from-[#00A651] to-[#00c760] rounded-2xl flex items-center justify-center text-2xl">🗓️</div>
            <h2 className="text-2xl font-bold text-gray-900">Saturday New Coach Huddle</h2>
          </div>
          
          <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-6 mb-4 border-l-4 border-[#00A651]">
            <div className="text-xs uppercase tracking-wider text-[#00A651] font-bold mb-1">Zoom Meeting ID</div>
            <div className="text-3xl font-bold text-gray-900 font-mono tracking-wider mb-2">404 357 2439</div>
            <div className="text-base text-gray-700">Passcode: <strong>OPTAVIA</strong></div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
            {[
              { time: "7:00 AM", zone: "Pacific" },
              { time: "8:00 AM", zone: "Mountain" },
              { time: "9:00 AM", zone: "Central" },
              { time: "10:00 AM", zone: "Eastern" }
            ].map((slot, i) => (
              <div key={i} className="bg-gray-100 p-3 rounded-lg text-center">
                <div className="font-semibold text-[#00A651] text-lg">{slot.time}</div>
                <div className="text-xs text-gray-600">{slot.zone}</div>
              </div>
            ))}
          </div>

          <p className="text-gray-600 bg-gray-50 p-4 rounded-lg mt-4">
            💚 Join your leadership to learn the ropes, meet your coaching family, and feel the love from your team!
          </p>
        </div>

        {/* Power Hour Card */}
        <div className="bg-white rounded-2xl p-6 md:p-8 shadow-lg border border-green-100">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 bg-gradient-to-br from-[#00A651] to-[#00c760] rounded-2xl flex items-center justify-center text-2xl">⚡</div>
            <h2 className="text-2xl font-bold text-gray-900">Power Hour Calls</h2>
          </div>
          <p className="text-gray-600">Join the team for weekly motivation and business-building strategies. Check your team calendar for current schedule.</p>
        </div>

        {/* MAP Card */}
        <div className="bg-white rounded-2xl p-6 md:p-8 shadow-lg border border-green-100">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 bg-gradient-to-br from-[#00A651] to-[#00c760] rounded-2xl flex items-center justify-center text-2xl">🗺️</div>
            <h2 className="text-2xl font-bold text-gray-900">Monthly Action Plan (MAP)</h2>
          </div>
          <p className="text-gray-600 italic mb-4">For Senior Coaches and Above</p>
          
          <ul className="space-y-4 mb-4">
            <li className="border-b border-gray-200 pb-4">
              <a href="https://bit.ly/MAPTemplatePDF" target="_blank" rel="noopener noreferrer" className="text-[#00A651] font-semibold hover:underline flex items-center gap-2">
                📄 MAP Template (PDF) →
              </a>
              <div className="text-sm text-gray-600 mt-1">Download and fill out your monthly action plan</div>
            </li>
            <li>
              <a href="https://youtu.be/WIqfXQEuq3g" target="_blank" rel="noopener noreferrer" className="text-[#00A651] font-semibold hover:underline flex items-center gap-2">
                🎬 MAP Instruction Video →
              </a>
              <div className="text-sm text-gray-600 mt-1">Learn how to complete your MAP effectively</div>
            </li>
          </ul>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
            <span className="text-yellow-700">📌</span>
            <span className="ml-2 text-yellow-800"><strong>Remember:</strong> Share your M.A.P. with your mentor at the first of the month!</span>
          </div>
        </div>

        {/* Financial Success Card */}
        <div className="bg-white rounded-2xl p-6 md:p-8 shadow-lg border border-green-100">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 bg-gradient-to-br from-[#00A651] to-[#00c760] rounded-2xl flex items-center justify-center text-2xl">💰</div>
            <h2 className="text-2xl font-bold text-gray-900">Setting Up for Financial Success</h2>
          </div>

          <ul className="space-y-3 mb-6">
            {[
              "Create a separate bank account for your business",
              "Run all business funds and expenses through it",
              "Pay all expenses before taking your paycheck",
              "Consult a CPA for business structure advice (C Corp, S Corp, LLC, or Sole Proprietor)"
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3 pl-8 relative">
                <span className="absolute left-0 text-[#00A651] font-bold text-xl">✓</span>
                <span className="text-gray-700">{item}</span>
              </li>
            ))}
          </ul>

          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommended Fund Allocation</h3>
          
          <div className="grid md:grid-cols-3 gap-3 mb-4">
            {[
              { percent: "30%", label: "Taxes" },
              { percent: "10%", label: "Events" },
              { percent: "10%", label: "Scholarships & Tools" }
            ].map((item, i) => (
              <div key={i} className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl text-center">
                <div className="text-3xl font-bold text-[#00A651]">{item.percent}</div>
                <div className="text-sm text-gray-600 mt-1">{item.label}</div>
              </div>
            ))}
          </div>

          <p className="text-gray-600 mb-4">The remaining balance is your paycheck!</p>

          <div className="mb-4">
            <p className="font-semibold text-gray-900 mb-2">📺 Helpful Videos:</p>
            <div className="flex flex-wrap gap-2">
              <a href="https://youtu.be/zS5aNT-UjdA" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors">
                ▶️ 5 and 1 Your Finances
              </a>
              <a href="https://youtu.be/wdeuzMaFc6A" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors">
                ▶️ Understanding How We Get Paid
              </a>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <span className="text-yellow-700">⚠️</span>
            <span className="ml-2 text-yellow-800 italic">We are not financial advisors. We strongly encourage you to hire a CPA and bookkeeper.</span>
          </div>
        </div>

        {/* Branding Card */}
        <div className="bg-white rounded-2xl p-6 md:p-8 shadow-lg border border-green-100">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 bg-gradient-to-br from-[#00A651] to-[#00c760] rounded-2xl flex items-center justify-center text-2xl">🎨</div>
            <h2 className="text-2xl font-bold text-gray-900">Branding</h2>
          </div>

          <ul className="space-y-4 mb-6">
            <li className="border-b border-gray-200 pb-4">
              <a href="https://youtu.be/xG2c7UIS1tM" target="_blank" rel="noopener noreferrer" className="text-[#00A651] font-semibold hover:underline flex items-center gap-2">
                🎬 Branding Basics Video →
              </a>
              <div className="text-sm text-gray-600 mt-1">Learn the fundamentals of personal branding</div>
            </li>
            <li>
              <a href="http://optaviamedia.com/pdf/learn/OPTAVIA-LEARN_Growing-Facebook.pdf" target="_blank" rel="noopener noreferrer" className="text-[#00A651] font-semibold hover:underline flex items-center gap-2">
                📄 Growing Facebook Friends List (PDF) →
              </a>
              <div className="text-sm text-gray-600 mt-1">Strategies to expand your social network</div>
            </li>
          </ul>

          <div className="bg-gray-100 rounded-xl p-5 border-l-4 border-orange-500">
            <div className="text-sm uppercase tracking-wider text-orange-700 font-bold mb-2">⚖️ Legal Disclaimer Required</div>
            <p className="text-gray-700 mb-3">Use this on all transformation photos:</p>
            <div className="bg-white p-4 rounded-lg italic text-gray-700 mb-3">
              &quot;Average weight loss on the Optimal Weight 5 & 1 Plan® is 12 pounds. Clients are in weight loss, on average, for 12 weeks.&quot;
            </div>
            <p className="text-orange-700 font-semibold">⚠️ Do not make medical claims or mention specific time frames on your before and afters.</p>
          </div>
        </div>

        {/* Navigation Footer */}
        <div className="flex justify-between items-center gap-4 pt-8 border-t border-green-200 mt-8">
          <Link href="/onboarding/welcome">
            <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous: Welcome
            </Button>
          </Link>
          <Link href="/onboarding/acronyms">
            <Button className="bg-[#00A651] hover:bg-[#00c760] text-white">
              Next: Acronyms Guide
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
