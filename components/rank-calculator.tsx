"use client"

import { useState, useMemo, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useUserData } from "@/contexts/user-data-context"
import { useClients } from "@/hooks/use-clients"
import {
  useRankCalculator,
  RANK_ORDER,
  RANK_REQUIREMENTS,
  RANK_COLORS,
  isEDOrHigher,
  isFIBCOrHigher,
  isQualifyingLeg,
  type RankType,
} from "@/hooks/use-rank-calculator"
import {
  User,
  Star,
  TrendingUp,
  Plus,
  Minus,
  X,
  RotateCcw,
  Sparkles,
  ExternalLink,
  Zap,
} from "lucide-react"

interface SimulatedCoach {
  id: string
  rank: RankType
}

// Coach rank options for the dropdown
const COACH_RANK_OPTIONS: { value: RankType; label: string; color: string }[] = [
  { value: "Coach", label: "Coach", color: "bg-gray-500" },
  { value: "Senior Coach", label: "Senior Coach (SC)", color: "bg-blue-500" },
  { value: "Manager", label: "Manager", color: "bg-teal-500" },
  { value: "Associate Director", label: "Associate Director (AD)", color: "bg-indigo-500" },
  { value: "Director", label: "Director", color: "bg-violet-500" },
  { value: "Executive Director", label: "Executive Director (ED)", color: "bg-purple-500" },
  { value: "FIBC", label: "FIBC", color: "bg-fuchsia-500" },
  { value: "Regional Director", label: "Regional Director (RD)", color: "bg-cyan-500" },
  { value: "Integrated RD", label: "Integrated RD (IRD)", color: "bg-sky-500" },
  { value: "National Director", label: "National Director (ND)", color: "bg-emerald-500" },
  { value: "Integrated ND", label: "Integrated ND (IND)", color: "bg-green-500" },
  { value: "Global Director", label: "Global Director (GD)", color: "bg-yellow-500" },
  { value: "FIBL", label: "FIBL", color: "bg-amber-500" },
  { value: "Presidential Director", label: "Presidential Director (PD)", color: "bg-orange-500" },
  { value: "IPD", label: "IPD", color: "bg-red-500" },
]

export function RankCalculator() {
  const { user } = useUserData()
  const { stats: clientStats } = useClients()
  
  const {
    rankData,
    frontlineCoaches,
    loading,
    updateRankData,
  } = useRankCalculator(user)

  const [showRankSelector, setShowRankSelector] = useState(false)
  const [addCoachOpen, setAddCoachOpen] = useState(false)
  
  // Current data
  const currentRank = (rankData?.current_rank || "Coach") as RankType
  const activeClients = clientStats.active
  
  // Simulation state - Points from clients (5 clients = 1 point)
  const [simPoints, setSimPoints] = useState(Math.floor(activeClients / 5))
  const [simCoaches, setSimCoaches] = useState<SimulatedCoach[]>(
    frontlineCoaches.map(c => ({
      id: c.id,
      rank: c.coach_rank as RankType
    }))
  )

  // Update simulation when actual data changes
  useEffect(() => {
    setSimPoints(Math.floor(activeClients / 5))
    setSimCoaches(frontlineCoaches.map(c => ({
      id: c.id,
      rank: c.coach_rank as RankType
    })))
  }, [activeClients, frontlineCoaches])

  // Calculate team counts from simulated coaches
  const simSCCount = simCoaches.filter(c => isQualifyingLeg(c.rank)).length
  const simEDCount = simCoaches.filter(c => isEDOrHigher(c.rank)).length
  const simFIBCCount = simCoaches.filter(c => isFIBCOrHigher(c.rank)).length

  // Determine rank based on simulated stats
  const calculateRank = (): RankType => {
    for (let i = RANK_ORDER.length - 1; i >= 0; i--) {
      const rank = RANK_ORDER[i]
      const reqs = RANK_REQUIREMENTS[rank]
      
      if (
        simPoints >= reqs.points &&
        simSCCount >= reqs.scTeams &&
        simEDCount >= reqs.edTeams &&
        simFIBCCount >= reqs.fibcTeams
      ) {
        return rank
      }
    }
    return 'Coach'
  }

  const projectedRank = calculateRank()
  const projectedRankIndex = RANK_ORDER.indexOf(projectedRank)
  const projectedRankInfo = RANK_REQUIREMENTS[projectedRank]
  const projectedRankColors = RANK_COLORS[projectedRank]

  // Get next rank
  const nextRank = projectedRankIndex < RANK_ORDER.length - 1
    ? RANK_ORDER[projectedRankIndex + 1]
    : null
  const nextRankReqs = nextRank ? RANK_REQUIREMENTS[nextRank] : null

  // Calculate gaps to next rank
  const gaps = nextRankReqs ? {
    points: Math.max(0, nextRankReqs.points - simPoints),
    scTeams: Math.max(0, nextRankReqs.scTeams - simSCCount),
    edTeams: Math.max(0, nextRankReqs.edTeams - simEDCount),
    fibcTeams: Math.max(0, nextRankReqs.fibcTeams - simFIBCCount),
  } : null

  // Add a coach
  const addCoach = (rank: RankType) => {
    setSimCoaches([...simCoaches, { id: Date.now().toString(), rank }])
    setAddCoachOpen(false)
  }

  // Remove a specific coach by id
  const removeCoach = (coachId: string) => {
    setSimCoaches(simCoaches.filter(c => c.id !== coachId))
  }

  // Reset to current
  const resetSimulation = () => {
    setSimPoints(Math.floor(activeClients / 5))
    setSimCoaches(frontlineCoaches.map(c => ({
      id: c.id,
      rank: c.coach_rank as RankType
    })))
  }

  const handleRankChange = async (newRank: RankType) => {
    await updateRankData({
      current_rank: newRank,
      rank_achieved_date: new Date().toISOString().split("T")[0]
    })
    setShowRankSelector(false)
  }

  // Generate point icons for visual display
  const pointIcons = useMemo(() => {
    const icons = []
    const displayCount = Math.min(simPoints, 10)
    for (let i = 0; i < displayCount; i++) {
      icons.push(i)
    }
    return icons
  }, [simPoints])

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[hsl(var(--optavia-green))]"></div>
        </CardContent>
      </Card>
    )
  }

  // Get abbreviated rank name for display
  const getShortRank = (rank: string) => {
    const map: Record<string, string> = {
      'Senior Coach': 'SC',
      'Manager': 'Mgr',
      'Associate Director': 'AD',
      'Director': 'Dir',
      'Executive Director': 'ED',
      'Regional Director': 'RD',
      'Integrated RD': 'IRD',
      'National Director': 'ND',
      'Integrated ND': 'IND',
      'Global Director': 'GD',
      'Presidential Director': 'PD',
    }
    return map[rank] || rank
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Rank Calculator</h2>
          <p className="text-sm text-gray-500">Simulate different scenarios</p>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={resetSimulation}
          className="flex items-center gap-1.5"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset
        </Button>
      </div>

      {/* Current Rank Display */}
      <Card className={`${projectedRankColors.bg} border-2 ${projectedRankColors.accent.replace('bg-', 'border-')}`}>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowRankSelector(true)}
              className={`w-12 h-12 ${projectedRankColors.accent} rounded-full flex items-center justify-center hover:opacity-90 transition-opacity text-white`}
              title="Set your current rank"
            >
              <span className="text-2xl">{projectedRankInfo.icon}</span>
            </button>
            <div className="flex-1">
              <p className="text-xs text-gray-500">
                {projectedRank === currentRank ? 'Current Rank' : 'Projected Rank'}
              </p>
              <h3 className={`text-xl font-bold ${projectedRankColors.text}`}>
                {projectedRank}
              </h3>
              <p className="text-xs text-gray-600 mt-0.5">
                {simPoints} pts • {simSCCount} SC • {simEDCount} ED • {simFIBCCount} FIBC
              </p>
            </div>
            {projectedRank !== currentRank && (
              <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                Simulated
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Simulation Controls */}
      <div className="grid grid-cols-1 gap-4">
        {/* Points (from client volume) */}
        <Card>
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-amber-500" />
                  Qualifying Points
                </Label>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSimPoints(Math.max(0, simPoints - 1))}
                    className="h-8 w-8 p-0"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="text-xl font-bold text-amber-600 w-10 text-center">
                    {simPoints}
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSimPoints(simPoints + 1)}
                    className="h-8 w-8 p-0"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Point Icons */}
              <div className="flex flex-wrap gap-1.5 min-h-[32px]">
                {pointIcons.map((i) => (
                  <div
                    key={i}
                    className="w-7 h-7 rounded-full bg-amber-100 border-2 border-amber-400 flex items-center justify-center"
                  >
                    <Zap className="h-4 w-4 text-amber-600" />
                  </div>
                ))}
                {simPoints > 10 && (
                  <div className="w-7 h-7 rounded-full bg-amber-200 border-2 border-amber-400 flex items-center justify-center">
                    <span className="text-[10px] font-bold text-amber-700">+{simPoints - 10}</span>
                  </div>
                )}
                {simPoints === 0 && (
                  <p className="text-xs text-gray-400 italic">No points yet</p>
                )}
              </div>
              
              <p className="text-xs text-gray-500">
                ~5 clients = 1 point (from volume)
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Frontline Coaches */}
        <Card>
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-purple-500" />
                  Frontline Coaches
                </Label>
                <Badge variant="secondary" className="text-sm bg-purple-100 text-purple-700">
                  {simCoaches.length} total
                </Badge>
              </div>

              {/* Add Coach Button */}
              <Popover open={addCoachOpen} onOpenChange={setAddCoachOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-2 border-dashed"
                  >
                    <Plus className="h-4 w-4 text-green-500" />
                    <span className="text-gray-600">Add a coach...</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-72 p-2" align="start">
                  <div className="space-y-1 max-h-64 overflow-y-auto">
                    <p className="text-xs font-medium text-gray-500 px-2 pb-1">Select coach rank:</p>
                    {COACH_RANK_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => addCoach(option.value)}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors text-left"
                      >
                        <div className={`w-3 h-3 rounded-full ${option.color}`} />
                        <span className="text-sm">{option.label}</span>
                      </button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>

              {/* Coach List */}
              {simCoaches.length > 0 && (
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {simCoaches.map((coach, idx) => {
                    const isSC = isQualifyingLeg(coach.rank)
                    const isED = isEDOrHigher(coach.rank)
                    const isFIBC = isFIBCOrHigher(coach.rank)
                    const rankOption = COACH_RANK_OPTIONS.find(o => o.value === coach.rank)
                    
                    return (
                      <div
                        key={coach.id}
                        className={`flex items-center justify-between p-2 rounded-lg text-sm ${
                          isFIBC 
                            ? 'bg-fuchsia-50 border border-fuchsia-300' 
                            : isED 
                              ? 'bg-purple-50 border border-purple-200' 
                              : isSC
                                ? 'bg-blue-50 border border-blue-200'
                                : 'bg-gray-50 border border-gray-200'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${rankOption?.color || 'bg-gray-400'}`} />
                          <span className="text-gray-700">Coach {idx + 1}</span>
                          <div className="flex gap-1">
                            {isSC && <span className="text-[9px] text-blue-500 bg-blue-100 px-1 rounded">SC</span>}
                            {isED && <span className="text-[9px] text-purple-500 bg-purple-100 px-1 rounded">ED</span>}
                            {isFIBC && <span className="text-[9px] text-fuchsia-500 bg-fuchsia-100 px-1 rounded">FIBC</span>}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">
                            {getShortRank(coach.rank)}
                          </Badge>
                          <button
                            onClick={() => removeCoach(coach.id)}
                            className="p-1 rounded-full hover:bg-red-100 text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {simCoaches.length === 0 && (
                <p className="text-xs text-gray-400 italic text-center py-2">No coaches added yet</p>
              )}

              {/* Team Summary */}
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="p-2 bg-blue-50 rounded text-center border border-blue-200">
                  <span className="font-bold text-blue-600">{simSCCount}</span>
                  <span className="text-blue-500 block text-[10px]">SC+ teams</span>
                </div>
                <div className="p-2 bg-purple-50 rounded text-center border border-purple-200">
                  <span className="font-bold text-purple-600">{simEDCount}</span>
                  <span className="text-purple-500 block text-[10px]">ED+ teams</span>
                </div>
                <div className="p-2 bg-fuchsia-50 rounded text-center border border-fuchsia-200">
                  <span className="font-bold text-fuchsia-600">{simFIBCCount}</span>
                  <span className="text-fuchsia-500 block text-[10px]">FIBC+ teams</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Next Rank Requirements */}
      {nextRank && nextRankReqs && gaps && (
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="h-4 w-4 text-blue-500" />
              <h4 className="font-semibold text-gray-700">
                To reach {nextRank}:
              </h4>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
              <div className="text-center p-2 bg-white rounded">
                <div className={`text-lg font-bold ${gaps.points > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                  {gaps.points > 0 ? `+${gaps.points}` : '✓'}
                </div>
                <div className="text-[10px] text-gray-500">Points</div>
              </div>
              <div className="text-center p-2 bg-white rounded">
                <div className={`text-lg font-bold ${gaps.scTeams > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                  {gaps.scTeams > 0 ? `+${gaps.scTeams}` : '✓'}
                </div>
                <div className="text-[10px] text-gray-500">SC teams</div>
              </div>
              <div className="text-center p-2 bg-white rounded">
                <div className={`text-lg font-bold ${gaps.edTeams > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                  {gaps.edTeams > 0 ? `+${gaps.edTeams}` : '✓'}
                </div>
                <div className="text-[10px] text-gray-500">ED teams</div>
              </div>
              <div className="text-center p-2 bg-white rounded">
                <div className={`text-lg font-bold ${gaps.fibcTeams > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                  {gaps.fibcTeams > 0 ? `+${gaps.fibcTeams}` : '✓'}
                </div>
                <div className="text-[10px] text-gray-500">FIBC teams</div>
              </div>
            </div>

            {gaps.points === 0 && gaps.scTeams === 0 && gaps.edTeams === 0 && gaps.fibcTeams === 0 && (
              <div className="flex items-center gap-2 p-2 bg-green-100 rounded-lg border border-green-300">
                <Sparkles className="h-4 w-4 text-green-600" />
                <p className="text-sm text-green-700 font-medium">
                  You meet all requirements for {nextRank}!
                </p>
              </div>
            )}

            <p className="text-xs text-gray-600 mt-2">
              {nextRankReqs.note}
            </p>
          </CardContent>
        </Card>
      )}

      {/* No Next Rank */}
      {!nextRank && (
        <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
          <CardContent className="p-4 text-center">
            <div className="text-3xl mb-2">🎉</div>
            <p className="font-semibold text-gray-700">Top Rank Achieved!</p>
            <p className="text-sm text-gray-600 mt-1">
              You've reached the highest rank in OPTAVIA
            </p>
          </CardContent>
        </Card>
      )}

      {/* Rank Progression Info */}
      <Card className="bg-gray-50">
        <CardContent className="p-4">
          <p className="text-xs font-semibold text-gray-600 mb-2">Rank Requirements:</p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[10px] text-gray-500">
            <div className="space-y-0.5">
              <p className="font-semibold text-gray-400 uppercase">Points Track</p>
              <p>SC: 1 pt • Mgr: 2 pts • AD: 3 pts</p>
              <p>Dir: 4 pts • ED: 5 pts</p>
              <p className="font-semibold text-gray-400 uppercase mt-1">ED Teams Track</p>
              <p>RD: 1 ED • ND: 3 EDs • GD: 5 EDs</p>
              <p>PD: 10 EDs</p>
            </div>
            <div className="space-y-0.5">
              <p className="font-semibold text-gray-400 uppercase">Integrated Track</p>
              <p>FIBC: 5 pts + 5 SC teams</p>
              <p>IRD: 5 pts + 5 SC + 1 ED</p>
              <p>IND: 5 pts + 5 SC + 3 EDs</p>
              <p>FIBL: 5 pts + 5 SC + 5 FIBC</p>
              <p>IPD: 5 pts + 5 SC + 10 ED + 5 FIBC</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* OPTAVIA Connect Link */}
      <a
        href="https://connect.optavia.com"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 p-3 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-gray-700 text-sm"
      >
        <img src="/media/optavia_logo.svg" alt="" className="h-4 w-4" />
        Verify in OPTAVIA Connect
        <ExternalLink className="h-3 w-3" />
      </a>

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
