"use client"

import { useState, useMemo, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
  isGDOrHigher,
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
} from "lucide-react"

interface SimulatedCoach {
  id: string
  rank: RankType
}

// Coach rank options for the dropdown
const COACH_RANK_OPTIONS: { value: RankType; label: string; color: string }[] = [
  { value: "Coach", label: "Coach", color: "bg-gray-500" },
  { value: "Senior Coach", label: "Senior Coach", color: "bg-blue-500" },
  { value: "Executive Director", label: "Executive Director (ED)", color: "bg-purple-500" },
  { value: "Global Director", label: "Global Director (GD)", color: "bg-yellow-500" },
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
  
  // Simulation state
  const [simClients, setSimClients] = useState(activeClients)
  const [simCoaches, setSimCoaches] = useState<SimulatedCoach[]>(
    frontlineCoaches.map(c => ({
      id: c.id,
      rank: c.coach_rank as RankType
    }))
  )

  // Update simulation when actual data changes
  useEffect(() => {
    setSimClients(activeClients)
    setSimCoaches(frontlineCoaches.map(c => ({
      id: c.id,
      rank: c.coach_rank as RankType
    })))
  }, [activeClients, frontlineCoaches])

  // Calculate ED and GD counts from simulated coaches
  const simEDCount = simCoaches.filter(c => isEDOrHigher(c.rank)).length
  const simGDCount = simCoaches.filter(c => isGDOrHigher(c.rank)).length

  // Determine rank based on simulated stats
  const calculateRank = (): RankType => {
    // Start from highest rank and work down
    for (let i = RANK_ORDER.length - 1; i >= 0; i--) {
      const rank = RANK_ORDER[i]
      const reqs = RANK_REQUIREMENTS[rank]
      
      if (
        simClients >= reqs.minClients &&
        simCoaches.length >= reqs.frontlineCoaches &&
        simEDCount >= reqs.edTeams &&
        simGDCount >= reqs.gdTeams
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
    clients: Math.max(0, nextRankReqs.minClients - simClients),
    coaches: Math.max(0, nextRankReqs.frontlineCoaches - simCoaches.length),
    edTeams: Math.max(0, nextRankReqs.edTeams - simEDCount),
    gdTeams: Math.max(0, nextRankReqs.gdTeams - simGDCount),
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
    setSimClients(activeClients)
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

  // Generate client icons array for visual display
  const clientIcons = useMemo(() => {
    const icons = []
    const displayCount = Math.min(simClients, 20) // Cap visual display at 20
    for (let i = 0; i < displayCount; i++) {
      icons.push(i)
    }
    return icons
  }, [simClients])

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
                {simEDCount} ED teams • {simGDCount} GD teams
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
        {/* Active Clients with People Icons */}
        <Card>
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  <User className="h-4 w-4 text-green-500" />
                  Active Clients
                </Label>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSimClients(Math.max(0, simClients - 1))}
                    className="h-8 w-8 p-0"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="text-xl font-bold text-green-600 w-10 text-center">
                    {simClients}
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSimClients(simClients + 1)}
                    className="h-8 w-8 p-0"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* People Icons Grid */}
              <div className="flex flex-wrap gap-1.5 min-h-[32px]">
                {clientIcons.map((i) => (
                  <div
                    key={i}
                    className="w-7 h-7 rounded-full bg-green-100 border-2 border-green-400 flex items-center justify-center"
                  >
                    <User className="h-4 w-4 text-green-600" />
                  </div>
                ))}
                {simClients > 20 && (
                  <div className="w-7 h-7 rounded-full bg-green-200 border-2 border-green-400 flex items-center justify-center">
                    <span className="text-[10px] font-bold text-green-700">+{simClients - 20}</span>
                  </div>
                )}
                {simClients === 0 && (
                  <p className="text-xs text-gray-400 italic">No clients added</p>
                )}
              </div>
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
                  {simCoaches.length} total ({simEDCount} ED+)
                </Badge>
              </div>

              {/* Add Coach Button with Popover */}
              <div className="flex gap-2">
                <Popover open={addCoachOpen} onOpenChange={setAddCoachOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="flex-1 justify-start gap-2 border-dashed"
                    >
                      <Plus className="h-4 w-4 text-green-500" />
                      <span className="text-gray-600">Add a coach...</span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-64 p-2" align="start">
                    <div className="space-y-1">
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
              </div>

              {/* Coach List with Individual Remove Buttons */}
              {simCoaches.length > 0 && (
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {simCoaches.map((coach, idx) => {
                    const isED = isEDOrHigher(coach.rank)
                    const isGD = isGDOrHigher(coach.rank)
                    const rankOption = COACH_RANK_OPTIONS.find(o => o.value === coach.rank)
                    
                    return (
                      <div
                        key={coach.id}
                        className={`flex items-center justify-between p-2 rounded-lg text-sm ${
                          isGD 
                            ? 'bg-yellow-50 border border-yellow-300' 
                            : isED 
                              ? 'bg-purple-50 border border-purple-200' 
                              : 'bg-gray-50 border border-gray-200'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${rankOption?.color || 'bg-gray-400'}`} />
                          <span className="text-gray-700">Coach {idx + 1}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant={isGD ? "default" : isED ? "default" : "secondary"} 
                            className={`text-xs ${
                              isGD 
                                ? 'bg-yellow-500' 
                                : isED 
                                  ? 'bg-purple-500' 
                                  : ''
                            }`}
                          >
                            {coach.rank}
                          </Badge>
                          <button
                            onClick={() => removeCoach(coach.id)}
                            className="p-1 rounded-full hover:bg-red-100 text-gray-400 hover:text-red-500 transition-colors"
                            title="Remove coach"
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

              {/* ED/GD Summary */}
              <div className="flex gap-2 text-xs">
                <div className="flex-1 p-2 bg-purple-50 rounded text-center">
                  <span className="font-bold text-purple-600">{simEDCount}</span>
                  <span className="text-purple-500 ml-1">ED+ teams</span>
                </div>
                <div className="flex-1 p-2 bg-yellow-50 rounded text-center">
                  <span className="font-bold text-yellow-600">{simGDCount}</span>
                  <span className="text-yellow-600 ml-1">GD+ teams</span>
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
                <div className={`text-lg font-bold ${gaps.clients > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                  {gaps.clients > 0 ? `+${gaps.clients}` : '✓'}
                </div>
                <div className="text-[10px] text-gray-500">Clients</div>
              </div>
              <div className="text-center p-2 bg-white rounded">
                <div className={`text-lg font-bold ${gaps.coaches > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                  {gaps.coaches > 0 ? `+${gaps.coaches}` : '✓'}
                </div>
                <div className="text-[10px] text-gray-500">Coaches</div>
              </div>
              <div className="text-center p-2 bg-white rounded">
                <div className={`text-lg font-bold ${gaps.edTeams > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                  {gaps.edTeams > 0 ? `+${gaps.edTeams}` : '✓'}
                </div>
                <div className="text-[10px] text-gray-500">ED Teams</div>
              </div>
              <div className="text-center p-2 bg-white rounded">
                <div className={`text-lg font-bold ${gaps.gdTeams > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                  {gaps.gdTeams > 0 ? `+${gaps.gdTeams}` : '✓'}
                </div>
                <div className="text-[10px] text-gray-500">GD Teams</div>
              </div>
            </div>

            {gaps.clients === 0 && gaps.coaches === 0 && gaps.edTeams === 0 && gaps.gdTeams === 0 && (
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
          <p className="text-xs font-semibold text-gray-600 mb-2">Rank Progression (ED-based):</p>
          <div className="space-y-1 text-xs text-gray-500">
            <p>• <strong>5 EDs</strong> → Global Director (GD)</p>
            <p>• <strong>10 EDs</strong> → Presidential Director (PD)</p>
            <p>• <strong>10 EDs + 5 GDs</strong> → IPD</p>
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
        Verify volume in OPTAVIA Connect
        <ExternalLink className="h-3 w-3" />
      </a>

      {/* Rank Journey */}
      <div className="flex items-center justify-between overflow-x-auto pb-2 gap-1 px-1">
        {RANK_ORDER.map((rank, idx) => {
          const isCurrentOrPast = idx <= projectedRankIndex
          const isCurrent = rank === projectedRank
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
                <span className={`text-[9px] mt-0.5 text-center ${isCurrent ? "font-bold" : "text-gray-400"}`}>
                  {rank === "Executive Director" ? "ED" : 
                   rank === "Senior Coach" ? "SC" :
                   rank === "Global Director" ? "GD" :
                   rank === "Presidential Director" ? "PD" :
                   rank}
                </span>
              </div>
              {idx < RANK_ORDER.length - 1 && (
                <div className={`w-4 h-0.5 mx-0.5 ${idx < projectedRankIndex ? "bg-green-400" : "bg-gray-200"}`} />
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
