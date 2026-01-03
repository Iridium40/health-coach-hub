"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
  TrendingUp,
  Target,
  Users,
  RefreshCw,
  ChevronRight,
  Trophy,
  Sparkles,
  ArrowRight,
} from "lucide-react"

export function RankCalculator() {
  const { user } = useUserData()
  const { prospects, stats: prospectStats } = useProspects()
  const { clients, stats: clientStats } = useClients()
  
  const {
    rankData,
    loading,
    updateRankData,
    calculateProjections,
    calculateGaps,
    calculateProgress,
    generateActionItems,
    getNextRank,
  } = useRankCalculator(user)

  const [showUpdateModal, setShowUpdateModal] = useState(false)
  const [showRankSelector, setShowRankSelector] = useState(false)
  const [formData, setFormData] = useState({
    fqv: 0,
    qp: 0,
    frontlineCoaches: 0
  })

  // Build prospect pipeline from actual data
  const prospectPipeline: ProspectPipeline = useMemo(() => ({
    cold: prospects.filter(p => p.status === "cold").length,
    warm: prospects.filter(p => p.status === "warm").length,
    ha_scheduled: prospects.filter(p => p.status === "ha_scheduled").length,
    ha_done: prospects.filter(p => p.status === "ha_done").length,
  }), [prospects])

  // Build client stats from actual data
  const clientPipeline: ClientStats = useMemo(() => ({
    active: clientStats.active,
    paused: clientStats.paused,
    completed: clientStats.completed,
    coachProspects: clientStats.coachProspects,
  }), [clientStats])

  // Current stats
  const stats = useMemo(() => ({
    fqv: rankData?.current_fqv || 0,
    qp: rankData?.qualifying_points || 0,
    frontlineCoaches: rankData?.frontline_coaches || 0,
  }), [rankData])

  // Current rank
  const currentRank = (rankData?.current_rank || "Coach") as RankType
  const currentRankInfo = RANK_REQUIREMENTS[currentRank]
  const currentRankColors = RANK_COLORS[currentRank]
  const nextRank = getNextRank(currentRank)
  const nextRankReqs = nextRank ? RANK_REQUIREMENTS[nextRank] : null

  // Calculations
  const progress = calculateProgress(currentRank, stats, clientPipeline.active)
  const projections = calculateProjections(prospectPipeline, clientPipeline, stats)
  const gaps = calculateGaps(currentRank, stats, clientPipeline.active)
  const actionItems = generateActionItems(gaps, projections, prospectPipeline, clientPipeline, nextRank)

  const openUpdateModal = () => {
    setFormData({
      fqv: rankData?.current_fqv || 0,
      qp: rankData?.qualifying_points || 0,
      frontlineCoaches: rankData?.frontline_coaches || 0
    })
    setShowUpdateModal(true)
  }

  const handleSaveStats = async () => {
    await updateRankData({
      current_fqv: formData.fqv,
      qualifying_points: formData.qp,
      frontline_coaches: formData.frontlineCoaches
    })
    setShowUpdateModal(false)
  }

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
    <div className="space-y-6">
      {/* Current Rank Card */}
      <Card className={`${currentRankColors.bg} border-0 shadow-lg`}>
        <CardContent className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => setShowRankSelector(true)}
              className={`w-14 h-14 ${currentRankColors.accent} rounded-full flex items-center justify-center hover:opacity-90 transition-opacity text-white`}
            >
              <span className="text-2xl">{currentRankInfo.icon}</span>
            </button>
            <div className="flex-1">
              <p className="text-sm text-gray-500">Current Rank</p>
              <h2 className={`text-xl font-bold ${currentRankColors.text}`}>{currentRank}</h2>
              <p className="text-xs text-gray-500 mt-0.5">{currentRankInfo.description}</p>
            </div>
            <Button variant="outline" size="sm" onClick={openUpdateModal} className="gap-1">
              <RefreshCw className="h-3 w-3" />
              Update
            </Button>
          </div>

          {nextRank && (
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-600">
                  Progress to <span className="font-semibold">{nextRank}</span>
                </span>
                <span className={`text-sm font-bold ${currentRankColors.text}`}>{progress}%</span>
              </div>
              <Progress value={progress} className="h-3" />
            </div>
          )}

          {!nextRank && (
            <div className="mt-2 p-3 bg-white bg-opacity-50 rounded-lg text-center">
              <p className="text-sm font-semibold text-gray-700">🎉 You've reached the top rank!</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats & Requirements Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Current Stats */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Current Stats
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              <StatRow label="FQV" value={stats.fqv.toLocaleString()} />
              <StatRow label="QP" value={stats.qp.toLocaleString()} />
              <StatRow label="Active Clients" value={clientPipeline.active} />
              <StatRow label="Frontline Coaches" value={stats.frontlineCoaches} />
            </div>
          </CardContent>
        </Card>

        {/* Next Rank Requirements */}
        {nextRank && gaps && nextRankReqs && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-2">
                <Target className="h-4 w-4" />
                Needed for {nextRank}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                <GapRow label="FQV" target={nextRankReqs.minFQV} gap={gaps.fqv} />
                <GapRow label="Clients" target={nextRankReqs.minClients} gap={gaps.clients} />
                <GapRow label="Coaches" target={nextRankReqs.frontlineCoaches} gap={gaps.coaches} />
                <GapRow label="QP" target={nextRankReqs.minQP} gap={gaps.qp} />
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Pipeline Overview */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-500" />
            Your Pipeline
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-4">
          {/* Prospects */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-500 uppercase">Prospects</span>
              <span className="text-xs text-gray-400">{projections.totalProspects} total</span>
            </div>
            <div className="grid grid-cols-5 gap-1.5">
              <PipelineCard count={prospectPipeline.cold} label="Cold" color="gray" />
              <PipelineCard count={prospectPipeline.warm} label="Warm" color="orange" />
              <PipelineCard count={prospectPipeline.ha_scheduled} label="HA Sched" color="blue" />
              <PipelineCard count={prospectPipeline.ha_done} label="HA Done" color="purple" />
              <PipelineCard count={`+${projections.newClients}`} label="Projected" color="green" />
            </div>
          </div>

          {/* Clients */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-500 uppercase">Clients</span>
              <span className="text-xs text-gray-400">{clientPipeline.active} active</span>
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              <PipelineCard count={clientPipeline.active} label="Active" color="green" />
              <PipelineCard count={clientPipeline.paused} label="Paused" color="gray" />
              <PipelineCard count={clientPipeline.coachProspects} label="Coach ⭐" color="yellow" />
              <PipelineCard count={`+${projections.newCoaches}`} label="Proj Coach" color="purple" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Projections */}
      {nextRank && (
        <Card className="bg-gradient-to-br from-green-50 to-blue-50 border-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-green-600" />
              Projection to {nextRank}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-4">
            {/* Projected Numbers */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white rounded-lg p-3 text-center shadow-sm">
                <p className="text-2xl font-bold text-green-600">+{projections.newClients}</p>
                <p className="text-xs text-gray-500">New Clients</p>
              </div>
              <div className="bg-white rounded-lg p-3 text-center shadow-sm">
                <p className="text-2xl font-bold text-blue-600">+{projections.newFQV.toLocaleString()}</p>
                <p className="text-xs text-gray-500">FQV</p>
              </div>
              <div className="bg-white rounded-lg p-3 text-center shadow-sm">
                <p className="text-2xl font-bold text-purple-600">+{projections.newCoaches}</p>
                <p className="text-xs text-gray-500">Coaches</p>
              </div>
            </div>

            {/* After Conversions */}
            <div className="bg-white rounded-lg p-3">
              <p className="text-sm font-medium text-gray-700 mb-2">🎯 After conversions:</p>
              <div className="space-y-1 text-sm">
                <ProjectionRow 
                  label="FQV" 
                  projected={projections.totalFQV} 
                  target={nextRankReqs?.minFQV || 0} 
                />
                <ProjectionRow 
                  label="Clients" 
                  projected={projections.totalClients} 
                  target={nextRankReqs?.minClients || 0} 
                />
                <ProjectionRow 
                  label="Coaches" 
                  projected={projections.totalCoaches} 
                  target={nextRankReqs?.frontlineCoaches || 0} 
                />
              </div>
            </div>

            {/* Action Items */}
            {actionItems.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm font-medium text-yellow-800 mb-2 flex items-center gap-1">
                  <Trophy className="h-4 w-4" />
                  To hit {nextRank} faster:
                </p>
                <ul className="space-y-1.5">
                  {actionItems.slice(0, 3).map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <Badge 
                        variant="outline" 
                        className={`text-[10px] px-1.5 py-0 mt-0.5 ${
                          item.priority === "high" 
                            ? "border-red-300 text-red-600 bg-red-50" 
                            : item.priority === "medium"
                            ? "border-yellow-300 text-yellow-700 bg-yellow-50"
                            : "border-gray-300 text-gray-500"
                        }`}
                      >
                        {item.priority}
                      </Badge>
                      <span className="text-gray-700">{item.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Rank Journey */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm text-gray-600">📍 Your Rank Journey</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center justify-between overflow-x-auto pb-2 gap-1">
            {RANK_ORDER.map((rank, idx) => {
              const isCurrentOrPast = idx <= RANK_ORDER.indexOf(currentRank)
              const isCurrent = rank === currentRank
              const colors = RANK_COLORS[rank]

              return (
                <div key={rank} className="flex items-center">
                  <div className={`flex flex-col items-center ${isCurrent ? "scale-110" : ""}`}>
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm
                        ${isCurrentOrPast ? colors.accent + " text-white" : "bg-gray-200 text-gray-400"}`}
                    >
                      {RANK_REQUIREMENTS[rank].icon}
                    </div>
                    <span className={`text-[10px] mt-0.5 ${isCurrent ? "font-bold" : "text-gray-400"}`}>
                      {rank.split(" ")[0]}
                    </span>
                  </div>
                  {idx < RANK_ORDER.length - 1 && (
                    <div className={`w-4 h-0.5 mx-0.5 ${idx < RANK_ORDER.indexOf(currentRank) ? "bg-green-400" : "bg-gray-200"}`} />
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Update Stats Modal */}
      <Dialog open={showUpdateModal} onOpenChange={setShowUpdateModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Update Your Stats</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-500 mb-4">
            Enter your current numbers from OPTAVIA Connect
          </p>
          <div className="space-y-4">
            <div>
              <Label>Current FQV</Label>
              <Input
                type="number"
                min="0"
                value={formData.fqv}
                onChange={(e) => setFormData({ ...formData, fqv: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div>
              <Label>Qualifying Points (QP)</Label>
              <Input
                type="number"
                min="0"
                value={formData.qp}
                onChange={(e) => setFormData({ ...formData, qp: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div>
              <Label>Frontline Coaches</Label>
              <Input
                type="number"
                min="0"
                value={formData.frontlineCoaches}
                onChange={(e) => setFormData({ ...formData, frontlineCoaches: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setShowUpdateModal(false)}>Cancel</Button>
            <Button onClick={handleSaveStats} className="bg-[hsl(var(--optavia-green))] hover:bg-[hsl(var(--optavia-green-dark))]">
              Save Stats
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rank Selector Modal */}
      <Dialog open={showRankSelector} onOpenChange={setShowRankSelector}>
        <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Select Your Rank</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 mt-4">
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
                  <span className="text-2xl">{info.icon}</span>
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

// Sub-components
function StatRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-sm text-gray-600">{label}</span>
      <span className="font-bold text-gray-900">{value}</span>
    </div>
  )
}

function GapRow({ label, target, gap }: { label: string; target: number; gap: number }) {
  const isMet = gap === 0
  return (
    <div className="flex justify-between items-center">
      <span className="text-sm text-gray-600">{label}</span>
      <div className="text-right">
        <span className="font-bold text-gray-900">{target.toLocaleString()}</span>
        <span className={`text-xs ml-2 ${isMet ? "text-green-500" : "text-orange-500"}`}>
          {isMet ? "✓" : `(-${gap.toLocaleString()})`}
        </span>
      </div>
    </div>
  )
}

function PipelineCard({ 
  count, 
  label, 
  color 
}: { 
  count: number | string; 
  label: string; 
  color: "gray" | "orange" | "blue" | "purple" | "green" | "yellow" 
}) {
  const colorClasses = {
    gray: "bg-gray-100 text-gray-600",
    orange: "bg-orange-100 text-orange-600",
    blue: "bg-blue-100 text-blue-600",
    purple: "bg-purple-100 text-purple-600",
    green: "bg-green-100 text-green-600",
    yellow: "bg-yellow-100 text-yellow-600",
  }

  return (
    <div className={`rounded-lg p-2 text-center ${colorClasses[color]}`}>
      <p className="text-lg font-bold">{count}</p>
      <p className="text-[10px] truncate">{label}</p>
    </div>
  )
}

function ProjectionRow({ label, projected, target }: { label: string; projected: number; target: number }) {
  const isMet = projected >= target
  return (
    <div className={`flex items-center ${isMet ? "text-green-600" : "text-orange-500"}`}>
      <span className="mr-2">{isMet ? "✓" : "○"}</span>
      <span>
        ~{projected.toLocaleString()} {label}
        {!isMet && <span className="text-gray-400 ml-1">(need {target.toLocaleString()})</span>}
      </span>
    </div>
  )
}
