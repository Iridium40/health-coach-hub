"use client"

import { getRankGuidance, getNextRankTitle } from "@/lib/coach-rank-guidance"
import { getRankTitle } from "@/hooks/use-coaches"
import { ArrowRight } from "lucide-react"

interface CoachRankGuideProps {
  rank: number
  compact?: boolean
}

export function CoachRankGuide({ rank, compact = false }: CoachRankGuideProps) {
  const guidance = getRankGuidance(rank)
  const nextRank = getNextRankTitle(rank)

  return (
    <div className="space-y-3">
      {/* Current Rank & Tier */}
      <div
        className="rounded-lg p-3 border-l-4"
        style={{
          backgroundColor: guidance.tierBg,
          borderLeftColor: guidance.tierColor,
        }}
      >
        <div className="flex items-center gap-2">
          <span>{guidance.tierEmoji}</span>
          <span className="text-sm font-semibold" style={{ color: guidance.tierColor }}>
            {guidance.title}
          </span>
          <span className="text-xs text-gray-500">• {guidance.tier}</span>
        </div>
      </div>

      {/* Coach Focus */}
      <div className="bg-white border rounded-lg p-3">
        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
          Coach Focus
        </div>
        <ul className={`space-y-1.5 ${compact ? "text-xs" : "text-sm"} text-gray-700`}>
          {guidance.coachFocus.map((item, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5 flex-shrink-0">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Sponsoring Coach Actions */}
      <div className="bg-white border rounded-lg p-3">
        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
          Your Actions as Sponsor
        </div>
        <ul className={`space-y-1.5 ${compact ? "text-xs" : "text-sm"} text-gray-700`}>
          {guidance.sponsorActions.map((item, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="text-purple-500 mt-0.5 flex-shrink-0">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Next Rank Goal */}
      {guidance.nextRankGoal && nextRank && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1.5">
            <ArrowRight className="h-3.5 w-3.5 text-amber-600" />
            <span className="text-xs font-bold text-amber-700">
              Next: {nextRank}
            </span>
          </div>
          <p className={`${compact ? "text-xs" : "text-sm"} text-amber-700`}>
            {guidance.nextRankGoal}
          </p>
        </div>
      )}
    </div>
  )
}
