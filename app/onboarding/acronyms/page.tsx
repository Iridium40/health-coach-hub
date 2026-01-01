"use client"

import { useState, useMemo } from "react"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface Acronym {
  id: string
  acronym: string
  title: string
  description: string
  category: "volume" | "rank" | "coaching" | "bonus"
  tag: string
  highlight?: "money" | "highlight"
}

const acronyms: Acronym[] = [
  {
    id: "fqv",
    acronym: "FQV",
    title: "Front Qualifying Volume",
    description: "The total of your Frontline Client Orders. This is the combined order volume from clients you've personally enrolled.",
    category: "volume",
    tag: "💰 Volume Metric",
    highlight: "money"
  },
  {
    id: "pv",
    acronym: "PV",
    title: "Personal Volume",
    description: "The amount of your personal order or a client's personal order. Each individual's contribution to total volume.",
    category: "volume",
    tag: "💰 Volume Metric",
    highlight: "money"
  },
  {
    id: "gqv",
    acronym: "GQV",
    title: "Group Qualifying Volume",
    description: "The total volume from your entire organization, including your frontline and their teams below them.",
    category: "volume",
    tag: "💰 Volume Metric",
    highlight: "money"
  },
  {
    id: "cab",
    acronym: "CAB",
    title: "Client Acquisition Bonus",
    description: "$100 bonus available to any coach in their first 30 days by bringing on 5 new clients. A great way to jumpstart your income!",
    category: "bonus",
    tag: "🎁 New Coach Bonus",
    highlight: "highlight"
  },
  {
    id: "sc",
    acronym: "SC",
    title: "Senior Coach",
    description: "The first rank in OPTAVIA. Requirements: Must have 5 Ordering Entities and greater than $1,000 FQV.",
    category: "rank",
    tag: "🏆 Rank"
  },
  {
    id: "ed",
    acronym: "ED",
    title: "Executive Director",
    description: "A Qualified Senior Coach with 5 Points. This is a significant leadership milestone in your OPTAVIA journey.",
    category: "rank",
    tag: "🏆 Rank"
  },
  {
    id: "points",
    acronym: "Points",
    title: "Qualification Points",
    description: "One point can come from one of two things: $1,200 in FQV or one Senior Coach team. Points determine advancement.",
    category: "volume",
    tag: "📊 Qualification"
  },
  {
    id: "hoh",
    acronym: "HOH",
    title: "Habits of Health",
    description: "The foundational system and book by Dr. Wayne Andersen that guides the OPTAVIA lifestyle transformation approach.",
    category: "coaching",
    tag: "📚 System"
  },
  {
    id: "ccc",
    acronym: "CCC",
    title: "Client Celebration Call",
    description: "A phone call or Zoom with the client, coach, and mentor after the first week on program is complete. Celebrate those early wins!",
    category: "coaching",
    tag: "🎉 Coaching Activity"
  },
  {
    id: "ha",
    acronym: "HA",
    title: "Health Assessment",
    description: "The initial conversation with a potential client to understand their health goals, challenges, and determine if OPTAVIA is right for them.",
    category: "coaching",
    tag: "🩺 Coaching Activity"
  }
]

export default function OnboardingAcronymsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<"all" | "volume" | "rank" | "coaching" | "bonus">("all")

  const filteredAcronyms = useMemo(() => {
    return acronyms.filter(acronym => {
      const matchesSearch = searchQuery === "" || 
        acronym.acronym.toLowerCase().includes(searchQuery.toLowerCase()) ||
        acronym.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        acronym.description.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = selectedCategory === "all" || acronym.category === selectedCategory
      return matchesSearch && matchesCategory
    })
  }, [searchQuery, selectedCategory])

  const categories = [
    { id: "all" as const, label: "All" },
    { id: "volume" as const, label: "Volume & Sales" },
    { id: "rank" as const, label: "Ranks" },
    { id: "coaching" as const, label: "Coaching" },
    { id: "bonus" as const, label: "Bonuses" }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-green-100/50" style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" }}>
      {/* Navigation Bar */}
      <div className="bg-white border-b border-green-100 sticky top-0 z-40">
        <div className="container max-w-3xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link href="/onboarding/business">
              <Button variant="ghost" size="sm" className="text-gray-600 hover:text-[#00A651]">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Previous: Business Resources
              </Button>
            </Link>
            <Link href="/training">
              <Button size="sm" className="bg-[#00A651] hover:bg-[#00c760] text-white">
                Back to Training
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="container max-w-3xl mx-auto px-4 py-12 pb-16">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-[#00A651] mb-2">📖 Acronyms Guide</h1>
          <p className="text-gray-600 text-lg">Master the language of OPTAVIA coaching</p>
        </div>

        {/* Search Box */}
        <div className="bg-white rounded-2xl p-4 md:p-6 shadow-lg border border-green-100 mb-6 flex items-center gap-3">
          <span className="text-2xl">🔍</span>
          <input
            type="text"
            placeholder="Search acronyms..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 border-none outline-none text-gray-900 text-lg"
          />
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-2 mb-6 justify-center">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === cat.id
                  ? "bg-[#00A651] text-white border-2 border-[#00A651]"
                  : "bg-white text-gray-600 border-2 border-gray-300 hover:border-[#00A651] hover:text-[#00A651]"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Acronym Cards */}
        <div className="space-y-4 mb-8">
          {filteredAcronyms.map(acronym => (
            <div
              key={acronym.id}
              className={`bg-white rounded-2xl p-6 shadow-lg border transition-all hover:border-[#00A651] ${
                acronym.highlight === "money" ? "bg-gradient-to-br from-green-50 to-green-100/50" :
                acronym.highlight === "highlight" ? "bg-gradient-to-br from-yellow-50 to-amber-50" :
                "border-green-100"
              }`}
            >
              <div className="flex gap-5 items-start">
                <div className={`px-4 py-3 rounded-xl font-bold text-lg min-w-[80px] text-center flex-shrink-0 ${
                  acronym.highlight === "money" 
                    ? "bg-gradient-to-br from-green-600 to-green-700 text-white" :
                    acronym.highlight === "highlight"
                    ? "bg-gradient-to-br from-orange-500 to-yellow-500 text-white" :
                    "bg-gradient-to-br from-[#00A651] to-[#00c760] text-white"
                }`}>
                  {acronym.acronym}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{acronym.title}</h3>
                  <p className="text-gray-700 mb-3 leading-relaxed">{acronym.description}</p>
                  <span className="inline-block bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wide">
                    {acronym.tag}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Trilogy Section */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-3xl p-8 md:p-10 text-center border-2 border-blue-300">
          <div className="text-2xl font-bold text-blue-700 mb-6">🔹 The Trilogy</div>
          <p className="text-blue-800 mb-8">The three pillars we work on at OPTAVIA</p>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { icon: "💪", name: "Healthy Body" },
              { icon: "🧠", name: "Healthy Mind" },
              { icon: "💰", name: "Healthy Finances" }
            ].map((item, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl">
                <div className="text-4xl mb-3">{item.icon}</div>
                <div className="font-semibold text-blue-700">{item.name}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Footer */}
        <div className="flex justify-between items-center gap-4 pt-8 border-t border-green-200 mt-8">
          <Link href="/onboarding/business">
            <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous: Business Resources
            </Button>
          </Link>
          <Link href="/training">
            <Button className="bg-[#00A651] hover:bg-[#00c760] text-white">
              Back to Training
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
