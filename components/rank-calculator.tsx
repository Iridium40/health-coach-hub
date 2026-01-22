"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useUserData } from "@/contexts/user-data-context"
import { useProspects } from "@/hooks/use-prospects"
import { useClients } from "@/hooks/use-clients"
import {
  useRankCalculator,
  RANK_ORDER,
  RANK_REQUIREMENTS,
  RANK_COLORS,
  type RankType,
  type ProspectPipeline,
  type ClientStats,
} from "@/hooks/use-rank-calculator"
import {
  Target,
  Users,
  Trophy,
  Sparkles,
  ExternalLink,
  AlertCircle,
  CheckCircle,
  Star,
  UserCheck,
} from "lucide-react"

export function RankCalculator() {
  const { user } = useUserData()
  const { prospects } = useProspects()
  const { stats: clientStats } = useClients()
  
  const {
    rankData,
    frontlineCoaches,
    qualifyingLegsCount,
    loading,
    updateRankData,
    calculateProjections,
    calculateGaps,
    calculateProgress,
    generateActionItems,
    getNextRank,
  } = useRankCalculator(user)

  const [showRankSelector, setShowRankSelector] = useState(false)

  // Build prospect pipeline from actual data
  // New = new status prospects
  // Interested = interested status prospects (without HA scheduled)
  // HA Scheduled = prospects with ha_scheduled_at set (regardless of status, excluding converted)
  const prospectPipeline: ProspectPipeline = useMemo(() => ({
    new: prospects.filter(p => p.status === "new" && !p.ha_scheduled_at).length,
    interested: prospects.filter(p => p.status === "interested" && !p.ha_scheduled_at).length,
    ha_scheduled: prospects.filter(p => p.ha_scheduled_at && !["converted", "coach"].includes(p.status)).length,
    ha_done: prospects.filter(p => p.status === "converted").length,
  }), [prospects])

  // Build client stats from actual data
  const clientPipeline: ClientStats = useMemo(() => ({
    active: clientStats.active,
    paused: clientStats.paused,
    completed: clientStats.completed,
    coachProspects: clientStats.coachProspects,
  }), [clientStats])

  // Current data
  const currentRank = (rankData?.current_rank || "Coach") as RankType
  const activeClients = clientPipeline.active
  
  const currentRankInfo = RANK_REQUIREMENTS[currentRank]
  const currentRankColors = RANK_COLORS[currentRank]
  const nextRank = getNextRank(currentRank)
  const nextRankReqs = nextRank ? RANK_REQUIREMENTS[nextRank] : null

  // Calculations
  const progress = calculateProgress(currentRank, activeClients)
  const projections = calculateProjections(prospectPipeline, clientPipeline)
  const gaps = calculateGaps(currentRank, activeClients)
  const actionItems = generateActionItems(gaps, projections, prospectPipeline, clientPipeline, nextRank)

  const handleRankChange = async (newRank: RankType) => {
    await updateRankData({
      current_rank: newRank,
      rank_achieved_date: new Date().toISOString().split("T")[0]
    })
    setShowRankSelector(false)
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[hsl(var(--optavia-green))]"></div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Current Rank Card */}
      <Card className={`${currentRankColors.bg} border-0 shadow-md`}>
        <CardContent className="p-5">
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => setShowRankSelector(true)}
              className={`w-12 h-12 ${currentRankColors.accent} rounded-full flex items-center justify-center hover:opacity-90 transition-opacity text-white`}
              title="Change rank"
            >
              <span className="text-xl">{currentRankInfo.icon}</span>
            </button>
            <div className="flex-1">
              <p className="text-xs text-gray-500">Current Rank</p>
              <h2 className={`text-lg font-bold ${currentRankColors.text}`}>{currentRank}</h2>
            </div>
          </div>

          {nextRank && (
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-sm text-gray-600">
                  Progress to <span className="font-semibold">{nextRank}</span>
                </span>
                <span className={`text-sm font-bold ${currentRankColors.text}`}>{progress}%</span>
              </div>
              <Progress value={progress} className="h-2.5" />
            </div>
          )}

          {!nextRank && (
            <div className="mt-2 p-2 bg-white bg-opacity-50 rounded-lg text-center">
              <p className="text-sm font-semibold text-gray-700">🎉 Top rank achieved!</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-2">
        <Card>
          <CardContent className="p-3 text-center">
            <div className="text-xl font-bold text-green-600">{activeClients}</div>
            <div className="text-[10px] text-gray-500">Active Clients</div>
            {nextRank && gaps && gaps.clients > 0 && (
              <Badge variant="outline" className="mt-1 text-[9px] text-orange-500 border-orange-300 px-1">
                Need {gaps.clients}
              </Badge>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 text-center">
            <div className="text-xl font-bold text-purple-600">{frontlineCoaches.length}</div>
            <div className="text-[10px] text-gray-500">Frontline Coaches</div>
            {nextRank && gaps && gaps.coaches > 0 && (
              <Badge variant="outline" className="mt-1 text-[9px] text-orange-500 border-orange-300 px-1">
                Need {gaps.coaches}
              </Badge>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 text-center">
            <div className="text-xl font-bold text-blue-600">{qualifyingLegsCount}</div>
            <div className="text-[10px] text-gray-500">Qualifying Legs</div>
            {nextRank && gaps && nextRankReqs && nextRankReqs.qualifyingLegs > 0 && gaps.qualifyingLegs > 0 && (
              <Badge variant="outline" className="mt-1 text-[9px] text-orange-500 border-orange-300 px-1">
                Need {gaps.qualifyingLegs}
              </Badge>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Frontline Coaches List */}
      {frontlineCoaches.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Users className="h-4 w-4 text-purple-500" />
              Your Frontline Coaches
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {frontlineCoaches.map((coach) => {
                const coachColors = RANK_COLORS[coach.coach_rank as RankType] || RANK_COLORS['Coach']
                const coachInfo = RANK_REQUIREMENTS[coach.coach_rank as RankType] || RANK_REQUIREMENTS['Coach']
                
                return (
                  <div
                    key={coach.id}
                    className={`flex items-center justify-between p-2 rounded-lg ${coach.is_qualifying ? 'bg-green-50 border border-green-200' : 'bg-gray-50'}`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 ${coachColors.accent} rounded-full flex items-center justify-center text-white text-sm`}>
                        {coachInfo.icon}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {coach.full_name || coach.email || "Coach"}
                        </p>
                        <p className="text-xs text-gray-500">{coach.coach_rank}</p>
                      </div>
                    </div>
                    {coach.is_qualifying ? (
                      <Badge className="bg-green-100 text-green-700 text-[10px]">
                        <Star className="h-3 w-3 mr-0.5" />
                        Qualifying
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-[10px] text-gray-500">
                        Not yet qualifying
                      </Badge>
                    )}
                  </div>
                )
              })}
            </div>
            <p className="text-[10px] text-gray-400 mt-2 text-center">
              Qualifying leg = Senior Coach rank or higher
            </p>
          </CardContent>
        </Card>
      )}

      {/* No Frontline Coaches */}
      {frontlineCoaches.length === 0 && (
        <Card className="bg-gray-50">
          <CardContent className="p-4 text-center">
            <UserCheck className="h-8 w-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">No frontline coaches yet</p>
            <p className="text-xs text-gray-400 mt-1">
              Coaches you sponsor will appear here
            </p>
          </CardContent>
        </Card>
      )}

      {/* Next Rank Requirements */}
      {nextRank && nextRankReqs && (
        <Card className="bg-gradient-to-r from-gray-50 to-blue-50">
          <CardContent className="p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <Target className="h-4 w-4 text-blue-500" />
              {nextRank} Requirements
            </h3>
            <div className="grid grid-cols-3 gap-2 text-sm mb-3">
              <div className="text-center p-2 bg-white rounded">
                <div className="font-bold text-gray-900">{nextRankReqs.minClients}+</div>
                <div className="text-[10px] text-gray-500">Clients</div>
              </div>
              <div className="text-center p-2 bg-white rounded">
                <div className="font-bold text-gray-900">{nextRankReqs.frontlineCoaches}</div>
                <div className="text-[10px] text-gray-500">Coaches</div>
              </div>
              <div className="text-center p-2 bg-white rounded">
                <div className="font-bold text-gray-900">{nextRankReqs.qualifyingLegs}</div>
                <div className="text-[10px] text-gray-500">Qual. Legs</div>
              </div>
            </div>
            {nextRankReqs.note && (
              <div className="flex items-start gap-2 p-2 bg-amber-50 rounded-lg border border-amber-200">
                <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-amber-700">{nextRankReqs.note}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Pipeline Summary */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-green-500" />
            Pipeline Projections
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-3 gap-1.5 mb-3">
            <PipelineCard count={prospectPipeline.new} label="New" color="blue" />
            <PipelineCard count={prospectPipeline.interested} label="Interested" color="orange" />
            <PipelineCard count={prospectPipeline.ha_scheduled} label="HA Sched" color="purple" />
          </div>
          
          {/* Projections */}
          <div className="flex items-center justify-between p-2 bg-green-50 rounded-lg">
            <span className="text-xs text-gray-600">Projected:</span>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-green-100 text-green-700 text-[10px]">
                +{projections.newClients} clients
              </Badge>
              <Badge variant="secondary" className="bg-purple-100 text-purple-700 text-[10px]">
                +{projections.newCoaches} coaches
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Items */}
      {actionItems.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <h3 className="text-sm font-semibold text-yellow-800 mb-2 flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              To reach {nextRank}:
            </h3>
            <ul className="space-y-1.5">
              {actionItems.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-yellow-700">
                  <span className="text-yellow-500 mt-0.5">•</span>
                  <span>{item.text}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* OPTAVIA Connect Link */}
      <a
        href="https://connect.optavia.com"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 p-3 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-gray-700 text-sm"
      >
        <img src="/media/optavia_logo.svg" alt="" className="h-4 w-4" />
        Verify volume in OPTAVIA Connect
        <ExternalLink className="h-3 w-3" />
      </a>

      {/* Rank Journey */}
      <div className="flex items-center justify-between overflow-x-auto pb-2 gap-1 px-1">
        {RANK_ORDER.map((rank, idx) => {
          const isCurrentOrPast = idx <= RANK_ORDER.indexOf(currentRank)
          const isCurrent = rank === currentRank
          const colors = RANK_COLORS[rank]

          return (
            <div key={rank} className="flex items-center">
              <div className={`flex flex-col items-center ${isCurrent ? "scale-110" : ""}`}>
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs
                    ${isCurrentOrPast ? colors.accent + " text-white" : "bg-gray-200 text-gray-400"}`}
                >
                  {RANK_REQUIREMENTS[rank].icon}
                </div>
                <span className={`text-[9px] mt-0.5 ${isCurrent ? "font-bold" : "text-gray-400"}`}>
                  {rank.split(" ")[0]}
                </span>
              </div>
              {idx < RANK_ORDER.length - 1 && (
                <div className={`w-3 h-0.5 mx-0.5 ${idx < RANK_ORDER.indexOf(currentRank) ? "bg-green-400" : "bg-gray-200"}`} />
              )}
            </div>
          )
        })}
      </div>

      {/* Rank Selector Modal */}
      <Dialog open={showRankSelector} onOpenChange={setShowRankSelector}>
        <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Select Your Current Rank</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-500 mb-4">
            Choose your current rank as shown in OPTAVIA Connect.
          </p>
          <div className="space-y-2">
            {RANK_ORDER.map((rank) => {
              const info = RANK_REQUIREMENTS[rank]
              const colors = RANK_COLORS[rank]
              const isSelected = rank === currentRank

              return (
                <button
                  key={rank}
                  onClick={() => handleRankChange(rank)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-all text-left ${
                    isSelected
                      ? `${colors.bg} border-current ${colors.text}`
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <span className="text-xl">{info.icon}</span>
                  <div className="flex-1">
                    <p className="font-medium">{rank}</p>
                    <p className="text-xs text-gray-500">{info.description}</p>
                  </div>
                  {isSelected && <span className="text-green-500">✓</span>}
                </button>
              )
            })}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Sub-component
function PipelineCard({ 
  count, 
  label, 
  color 
}: { 
  count: number; 
  label: string; 
  color: "gray" | "orange" | "blue" | "purple" | "green" 
}) {
  const colorClasses = {
    gray: "bg-gray-100 text-gray-600",
    orange: "bg-orange-100 text-orange-600",
    blue: "bg-blue-100 text-blue-600",
    purple: "bg-purple-100 text-purple-600",
    green: "bg-green-100 text-green-600",
  }

  return (
    <div className={`rounded-lg p-2 text-center ${colorClasses[color]}`}>
      <p className="text-lg font-bold">{count}</p>
      <p className="text-[9px] truncate">{label}</p>
    </div>
  )
}
