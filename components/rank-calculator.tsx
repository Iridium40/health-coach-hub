"use client"

import { useState, useMemo } from "react"
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
import { useClients } from "@/hooks/use-clients"
import { useCoaches, mapRankNumberToRankType } from "@/hooks/use-coaches"
import {
  Users,
  Star,
  TrendingUp,
  Plus,
  Minus,
  X,
  RotateCcw,
  Sparkles,
  ExternalLink,
  Zap,
  Database,
  SlidersHorizontal,
  ArrowRight,
  Info,
} from "lucide-react"

interface SimulatedCoach {
  id: string
  rank: RankType
  label?: string
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

type CalculatorMode = "live" | "simulator"

export function RankCalculator() {
  const { user } = useUserData()

  const {
    rankData,
    loading: rankLoading,
    updateRankData,
  } = useRankCalculator(user)

  const { stats: clientStats, loading: clientsLoading } = useClients()
  const { coaches: downlineCoaches, loading: coachesLoading } = useCoaches()

  const [mode, setMode] = useState<CalculatorMode>("live")
  const [showRankSelector, setShowRankSelector] = useState(false)
  const [addCoachOpen, setAddCoachOpen] = useState(false)

  // Current data
  const currentRank = (rankData?.current_rank || "Coach") as RankType

  // Simulation state (only used in simulator mode)
  const [simClients, setSimClients] = useState(0)
  const [simCoaches, setSimCoaches] = useState<SimulatedCoach[]>([])

  // Live data: map downline coaches to SimulatedCoach format using rank mapping
  const liveCoaches: SimulatedCoach[] = useMemo(() => {
    return downlineCoaches.map(c => ({
      id: c.id,
      rank: mapRankNumberToRankType(c.rank) as RankType,
      label: c.label,
    }))
  }, [downlineCoaches])

  const liveClients = clientStats.active

  // Pick active values based on mode
  const activeClients = mode === "live" ? liveClients : simClients
  const activeCoaches = mode === "live" ? liveCoaches : simCoaches

  // Calculate team counts from active coaches
  const scCount = activeCoaches.filter(c => isQualifyingLeg(c.rank)).length
  const edCount = activeCoaches.filter(c => isEDOrHigher(c.rank)).length
  const fibcCount = activeCoaches.filter(c => isFIBCOrHigher(c.rank)).length

  // Calculate points
  const clientPoints = Math.floor(activeClients / 5)
  const coachPoints = scCount
  const totalPoints = clientPoints + coachPoints

  // Minimum 5 clients required to qualify for any rank above Coach
  const hasMinimumClients = activeClients >= 5

  // Determine rank based on stats
  const calculateRank = (): RankType => {
    if (!hasMinimumClients) return 'Coach'

    for (let i = RANK_ORDER.length - 1; i >= 0; i--) {
      const rank = RANK_ORDER[i]
      const reqs = RANK_REQUIREMENTS[rank]

      if (
        activeClients >= reqs.minClients &&
        totalPoints >= reqs.points &&
        scCount >= reqs.scTeams &&
        edCount >= reqs.edTeams &&
        fibcCount >= reqs.fibcTeams
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
    points: Math.max(0, nextRankReqs.points - totalPoints),
    minClients: Math.max(0, nextRankReqs.minClients - activeClients),
    scTeams: Math.max(0, nextRankReqs.scTeams - scCount),
    edTeams: Math.max(0, nextRankReqs.edTeams - edCount),
    fibcTeams: Math.max(0, nextRankReqs.fibcTeams - fibcCount),
  } : null

  // Simulator actions
  const addCoach = (rank: RankType) => {
    setSimCoaches([...simCoaches, { id: Date.now().toString(), rank }])
    setAddCoachOpen(false)
  }

  const removeCoach = (coachId: string) => {
    setSimCoaches(simCoaches.filter(c => c.id !== coachId))
  }

  const resetSimulation = () => {
    setSimClients(0)
    setSimCoaches([])
  }

  // Load live data into the simulator
  const loadLiveIntoSimulator = () => {
    setSimClients(liveClients)
    setSimCoaches(liveCoaches.map(c => ({ ...c, id: `live-${c.id}` })))
  }

  const handleRankChange = async (newRank: RankType) => {
    await updateRankData({
      current_rank: newRank,
      rank_achieved_date: new Date().toISOString().split("T")[0]
    })
    setShowRankSelector(false)
  }

  const loading = rankLoading || (mode === "live" && (clientsLoading || coachesLoading))

  if (rankLoading) {
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
          <p className="text-sm text-gray-500">
            {mode === "live" ? "Using your tracker data" : "Simulate different scenarios"}
          </p>
        </div>
        {mode === "simulator" && (
          <Button
            size="sm"
            variant="outline"
            onClick={resetSimulation}
            className="flex items-center gap-1.5"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </Button>
        )}
      </div>

      {/* Mode Toggle */}
      <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-lg">
        <button
          onClick={() => setMode("live")}
          className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-semibold transition-all ${
            mode === "live"
              ? "bg-white shadow-sm text-green-700"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <Database className="h-4 w-4" />
          Live Data
        </button>
        <button
          onClick={() => setMode("simulator")}
          className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-semibold transition-all ${
            mode === "simulator"
              ? "bg-white shadow-sm text-purple-700"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <SlidersHorizontal className="h-4 w-4" />
          Simulator
        </button>
      </div>

      {/* Live data info banner */}
      {mode === "live" && (
        <div className="flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
          <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium">Reading from your trackers</p>
            <p className="text-xs text-green-600 mt-0.5">
              Active clients from Client List &bull; Coach ranks from Coach List. Switch to Simulator to explore what-if scenarios.
            </p>
          </div>
        </div>
      )}

      {/* Simulator load-from-live button */}
      {mode === "simulator" && liveClients > 0 && (
        <Button
          variant="outline"
          size="sm"
          className="w-full border-purple-200 text-purple-700 hover:bg-purple-50"
          onClick={loadLiveIntoSimulator}
        >
          <Database className="h-3.5 w-3.5 mr-1.5" />
          Load from Live Data ({liveClients} clients, {downlineCoaches.length} coaches)
        </Button>
      )}

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
                {totalPoints} pts ({clientPoints} from clients + {coachPoints} from SC+) • {edCount} ED • {fibcCount} FIBC
              </p>
            </div>
            <Badge variant="secondary" className={
              mode === "live"
                ? "bg-green-100 text-green-700"
                : projectedRank !== currentRank
                  ? "bg-blue-100 text-blue-700"
                  : "bg-gray-100 text-gray-600"
            }>
              {mode === "live" ? "Live" : projectedRank !== currentRank ? "Simulated" : "Current"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Minimum Clients Warning */}
      {!hasMinimumClients && activeClients > 0 && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-sm text-amber-700">
            <strong>Note:</strong> You need at least 5 clients to qualify for any rank above Coach.
          </p>
        </div>
      )}

      {/* Simulation Controls */}
      <div className="grid grid-cols-1 gap-4">
        {/* Active Clients Section */}
        <Card>
          <CardContent className="p-4">
            <div className="space-y-4">
              {/* Header with +/- controls (or read-only for live) */}
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2 text-base font-semibold text-green-700">
                  <Users className="h-5 w-5 text-green-500" />
                  Active Clients
                </Label>
                {mode === "live" ? (
                  <div className="flex items-center gap-2">
                    {clientsLoading ? (
                      <div className="h-10 w-16 bg-gray-100 animate-pulse rounded" />
                    ) : (
                      <div className="h-10 px-4 flex items-center justify-center border-2 border-green-500 bg-green-50 rounded-lg min-w-[60px]">
                        <span className="text-xl font-bold text-green-600">
                          {activeClients}
                        </span>
                      </div>
                    )}
                    <Badge variant="secondary" className="text-[10px] bg-green-100 text-green-600">
                      from Client List
                    </Badge>
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSimClients(Math.max(0, simClients - 1))}
                      className="h-10 w-10 rounded-r-none border-r-0"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <div className="h-10 px-4 flex items-center justify-center border-2 border-green-500 bg-white min-w-[60px]">
                      <span className="text-xl font-bold text-green-600">
                        {simClients}
                      </span>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSimClients(simClients + 1)}
                      className="h-10 w-10 rounded-l-none border-l-0"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>

              {/* Points explanation */}
              <div className="p-3 border border-green-200 rounded-lg bg-white">
                <p className="text-sm text-gray-600 mb-3">
                  5 clients = 1 point  |  <span className="text-amber-600 font-semibold">{clientPoints} point{clientPoints !== 1 ? 's' : ''} from {activeClients} clients</span> {hasMinimumClients && <span className="text-green-500">✓</span>}
                </p>

                {/* Visual rows of 5 clients = 1 PT */}
                {clientPoints > 0 && (
                  <div className="space-y-2">
                    {Array.from({ length: Math.min(clientPoints, 5) }).map((_, rowIdx) => (
                      <div key={rowIdx} className="flex items-center gap-2">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <div
                            key={i}
                            className="w-7 h-7 rounded-full bg-green-100 border-2 border-green-400 flex items-center justify-center"
                          >
                            <Users className="h-4 w-4 text-green-600" />
                          </div>
                        ))}
                        <Badge className="bg-amber-500 text-white text-xs px-2 py-1">
                          = 1 PT ★
                        </Badge>
                      </div>
                    ))}
                    {clientPoints > 5 && (
                      <p className="text-xs text-gray-500 pl-1">+ {clientPoints - 5} more point{clientPoints - 5 > 1 ? 's' : ''}</p>
                    )}
                  </div>
                )}

                {/* Remaining clients (not yet a full point) */}
                {activeClients % 5 > 0 && (
                  <div className="flex items-center gap-2 mt-2 opacity-60">
                    {Array.from({ length: activeClients % 5 }).map((_, i) => (
                      <div
                        key={i}
                        className="w-7 h-7 rounded-full bg-green-50 border border-green-300 flex items-center justify-center"
                      >
                        <Users className="h-4 w-4 text-green-400" />
                      </div>
                    ))}
                    <span className="text-xs text-gray-400">({5 - (activeClients % 5)} more for next point)</span>
                  </div>
                )}

                {activeClients === 0 && (
                  <p className="text-sm text-gray-400 italic">
                    {mode === "live" ? "No active clients in your Client List" : "Add clients to see points"}
                  </p>
                )}
              </div>

              {/* Quick add buttons (simulator only) */}
              {mode === "simulator" && (
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-gray-500">Quick add:</span>
                  {[
                    { clients: 5, pts: 1 },
                    { clients: 10, pts: 2 },
                    { clients: 15, pts: 3 },
                    { clients: 20, pts: 4 },
                    { clients: 25, pts: 5 },
                  ].map(({ clients, pts }) => (
                    <Button
                      key={clients}
                      size="sm"
                      variant={simClients === clients ? "default" : "outline"}
                      onClick={() => setSimClients(clients)}
                      className={`text-xs h-7 px-2 ${simClients === clients ? 'bg-green-600 hover:bg-green-700' : ''}`}
                    >
                      {clients} ({pts} pt{pts > 1 ? 's' : ''})
                    </Button>
                  ))}
                </div>
              )}
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
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-sm bg-purple-100 text-purple-700">
                    {activeCoaches.length} total
                  </Badge>
                  {mode === "live" && (
                    <Badge variant="secondary" className="text-[10px] bg-purple-50 text-purple-500">
                      from Coach List
                    </Badge>
                  )}
                </div>
              </div>

              {/* Add Coach Button (simulator only) */}
              {mode === "simulator" && (
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
              )}

              {/* Coach List */}
              {activeCoaches.length > 0 && (
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {activeCoaches.map((coach, idx) => {
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
                          <span className="text-gray-700">
                            {coach.label || `Coach ${idx + 1}`}
                          </span>
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
                          {mode === "simulator" && (
                            <button
                              onClick={() => removeCoach(coach.id)}
                              className="p-1 rounded-full hover:bg-red-100 text-gray-400 hover:text-red-500 transition-colors"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {activeCoaches.length === 0 && (
                <p className="text-xs text-gray-400 italic text-center py-2">
                  {mode === "live" ? "No coaches in your Coach List" : "No coaches added yet"}
                </p>
              )}

              {/* Points from SC+ coaches */}
              {scCount > 0 && (
                <div className="flex items-center justify-between p-2 bg-amber-50 rounded-lg border border-amber-200">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-amber-500" />
                    <span className="text-sm text-amber-700">Points from SC+ coaches:</span>
                  </div>
                  <span className="text-lg font-bold text-amber-600">{coachPoints}</span>
                </div>
              )}

              {/* Team Summary */}
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="p-2 bg-blue-50 rounded text-center border border-blue-200">
                  <span className="font-bold text-blue-600">{scCount}</span>
                  <span className="text-blue-500 block text-[10px]">SC+ teams</span>
                  <span className="text-amber-500 text-[9px]">= {scCount} pts</span>
                </div>
                <div className="p-2 bg-purple-50 rounded text-center border border-purple-200">
                  <span className="font-bold text-purple-600">{edCount}</span>
                  <span className="text-purple-500 block text-[10px]">ED+ teams</span>
                </div>
                <div className="p-2 bg-fuchsia-50 rounded text-center border border-fuchsia-200">
                  <span className="font-bold text-fuchsia-600">{fibcCount}</span>
                  <span className="text-fuchsia-500 block text-[10px]">FIBC+ teams</span>
                </div>
              </div>

              <p className="text-xs text-gray-500">
                Each SC+ frontline coach = 1 point
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Total Points Summary */}
      <Card className="bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-amber-500" />
              <span className="font-semibold text-amber-800">Total Qualifying Points</span>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-amber-600">{totalPoints}</span>
              <p className="text-xs text-amber-600">
                {clientPoints} (clients) + {coachPoints} (SC+)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

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

            {/* Minimum Clients Requirement */}
            {gaps.minClients > 0 && (
              <div className="flex items-center gap-2 p-2 mb-3 bg-orange-100 rounded-lg border border-orange-300">
                <Users className="h-4 w-4 text-orange-600" />
                <p className="text-sm text-orange-700">
                  Need <strong>{gaps.minClients}</strong> more client{gaps.minClients > 1 ? 's' : ''} ({nextRankReqs.minClients} required for {nextRank})
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-3">
              <div className="text-center p-2 bg-white rounded">
                <div className={`text-lg font-bold ${gaps.minClients > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                  {gaps.minClients > 0 ? `+${gaps.minClients}` : '✓'}
                </div>
                <div className="text-[10px] text-gray-500">Clients</div>
              </div>
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

            {gaps.minClients === 0 && gaps.points === 0 && gaps.scTeams === 0 && gaps.edTeams === 0 && gaps.fibcTeams === 0 && (
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

            {/* Prompt to switch to simulator */}
            {mode === "live" && (gaps.points > 0 || gaps.scTeams > 0 || gaps.edTeams > 0 || gaps.fibcTeams > 0 || gaps.minClients > 0) && (
              <button
                onClick={() => { loadLiveIntoSimulator(); setMode("simulator") }}
                className="flex items-center gap-1.5 mt-3 text-xs text-purple-600 hover:text-purple-800 font-medium transition-colors"
              >
                <SlidersHorizontal className="h-3 w-3" />
                Try the Simulator to explore what it takes
                <ArrowRight className="h-3 w-3" />
              </button>
            )}
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
          <p className="text-xs font-semibold text-gray-600 mb-2">How Points Work:</p>
          <div className="space-y-2 text-xs text-gray-600 mb-3">
            <p>• <strong>5 clients = 1 point</strong> (from volume)</p>
            <p>• <strong>1 SC+ frontline coach = 1 point</strong></p>
            <p>• <strong>Minimum 5 clients</strong> required to qualify for basic ranks</p>
            <p>• <strong>Minimum 25 clients</strong> required for FIBC & Integrated ranks</p>
          </div>
          <div className="p-2 bg-green-50 border border-green-200 rounded-lg mb-3">
            <p className="text-xs text-green-700">
              <strong>Example:</strong> 5 clients (1 pt) + 4 SC coaches (4 pts) = 5 pts = ED rank ✓
            </p>
          </div>
          <p className="text-xs font-semibold text-gray-600 mb-2">Rank Requirements:</p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[10px] text-gray-500">
            <div className="space-y-0.5">
              <p className="font-semibold text-gray-400 uppercase">Points Track (5+ clients)</p>
              <p>SC: 1 pt • Mgr: 2 pts • AD: 3 pts</p>
              <p>Dir: 4 pts • ED: 5 pts</p>
              <p className="font-semibold text-gray-400 uppercase mt-1">ED Teams Track (5+ clients)</p>
              <p>RD: 5 pts + 1 ED</p>
              <p>ND: 5 pts + 3 EDs • GD: 5 pts + 5 EDs</p>
              <p>PD: 5 pts + 10 EDs</p>
            </div>
            <div className="space-y-0.5">
              <p className="font-semibold text-gray-400 uppercase">Integrated Track (25 clients)</p>
              <p>FIBC: 5 pts + 5 SC + 25 clients</p>
              <p>IRD: 5 pts + 5 SC + 1 ED + 25 clients</p>
              <p>IND: 5 pts + 5 SC + 3 EDs + 25 clients</p>
              <p>FIBL: 5 pts + 5 SC + 5 FIBC + 25 clients</p>
              <p>IPD: 5 pts + 5 SC + 10 ED + 5 FIBC + 25 clients</p>
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
