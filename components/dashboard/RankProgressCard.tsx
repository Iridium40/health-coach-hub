"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, ChevronRight, Trophy, Users, Star, Crown } from "lucide-react"
import { RANK_REQUIREMENTS, type RankType } from "@/hooks/use-rank-calculator"

interface RankProgressCardProps {
  currentRank: string
  nextRank: string | null
  activeClients: number
  frontlineCoaches: number
  edTeams: number
  gdTeams: number
  gaps: {
    clients: number
    coaches: number
    edTeams: number
    gdTeams: number
  } | null
}

export function RankProgressCard({
  currentRank,
  nextRank,
  activeClients,
  frontlineCoaches,
  edTeams,
  gdTeams,
  gaps,
}: RankProgressCardProps) {
  const currentReqs = RANK_REQUIREMENTS[currentRank as RankType]
  const nextReqs = nextRank ? RANK_REQUIREMENTS[nextRank as RankType] : null

  // Calculate progress percentage toward next rank
  let progressPercent = 100
  if (nextReqs && gaps) {
    const totalNeeded = (nextReqs.minClients || 0) + (nextReqs.frontlineCoaches || 0) + (nextReqs.edTeams || 0) + (nextReqs.gdTeams || 0)
    const totalHave = activeClients + frontlineCoaches + edTeams + gdTeams
    const totalGaps = gaps.clients + gaps.coaches + gaps.edTeams + gaps.gdTeams
    if (totalNeeded > 0) {
      progressPercent = Math.round(((totalNeeded - totalGaps) / totalNeeded) * 100)
    }
  }

  return (
    <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2 text-optavia-dark">
            <TrendingUp className="h-5 w-5 text-amber-600" />
            Business Growth
          </CardTitle>
          <Link href="/my-business">
            <Button variant="ghost" size="sm" className="text-amber-700 hover:bg-amber-100 -mr-2">
              View Details <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          {/* Current Rank */}
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center shadow-md">
              <span className="text-2xl">{currentReqs?.icon || '🏆'}</span>
            </div>
            <div>
              <div className="text-sm text-gray-600">Current Rank</div>
              <div className="text-xl font-bold text-amber-800">{currentRank}</div>
            </div>
          </div>

          {/* Progress to Next Rank */}
          {nextRank && nextReqs ? (
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Next:</span>
                  <Badge className="bg-amber-600 text-white">
                    {nextReqs.icon} {nextRank}
                  </Badge>
                </div>
                <span className="text-sm font-semibold text-amber-700">{progressPercent}%</span>
              </div>
              <Progress value={progressPercent} className="h-2 mb-3" />

              {/* Requirements */}
              <div className="space-y-1">
                {gaps && gaps.clients > 0 && (
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-green-500" />
                    <span className="text-gray-700">
                      Need <strong className="text-amber-700">{gaps.clients}</strong> more client{gaps.clients > 1 ? 's' : ''}
                    </span>
                    <span className="text-xs text-gray-400">({activeClients}/{nextReqs.minClients})</span>
                  </div>
                )}
                {gaps && gaps.coaches > 0 && (
                  <div className="flex items-center gap-2 text-sm">
                    <Star className="h-4 w-4 text-purple-500" />
                    <span className="text-gray-700">
                      Need <strong className="text-amber-700">{gaps.coaches}</strong> more coach{gaps.coaches > 1 ? 'es' : ''}
                    </span>
                    <span className="text-xs text-gray-400">({frontlineCoaches}/{nextReqs.frontlineCoaches})</span>
                  </div>
                )}
                {gaps && gaps.edTeams > 0 && (
                  <div className="flex items-center gap-2 text-sm">
                    <Trophy className="h-4 w-4 text-purple-500" />
                    <span className="text-gray-700">
                      Need <strong className="text-amber-700">{gaps.edTeams}</strong> ED team{gaps.edTeams > 1 ? 's' : ''}
                    </span>
                    <span className="text-xs text-gray-400">({edTeams}/{nextReqs.edTeams})</span>
                  </div>
                )}
                {gaps && gaps.gdTeams > 0 && (
                  <div className="flex items-center gap-2 text-sm">
                    <Crown className="h-4 w-4 text-yellow-500" />
                    <span className="text-gray-700">
                      Need <strong className="text-amber-700">{gaps.gdTeams}</strong> GD+ team{gaps.gdTeams > 1 ? 's' : ''}
                    </span>
                    <span className="text-xs text-gray-400">({gdTeams}/{nextReqs.gdTeams})</span>
                  </div>
                )}
                {gaps && gaps.clients === 0 && gaps.coaches === 0 && gaps.edTeams === 0 && gaps.gdTeams === 0 && (
                  <div className="flex items-center gap-2 text-sm text-green-600 font-medium">
                    <Trophy className="h-4 w-4" />
                    Ready for promotion!
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center py-4">
              <div className="text-center">
                <Trophy className="h-8 w-8 mx-auto mb-2 text-amber-500" />
                <p className="text-sm font-medium text-amber-700">You've reached the top rank!</p>
                <p className="text-xs text-gray-500">Congratulations on your achievement! 🎉</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
