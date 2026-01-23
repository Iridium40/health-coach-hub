"use client"

import { useMemo } from "react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, Trophy } from "lucide-react"
import type { Prospect } from "@/hooks/use-prospects"

interface ClientStats {
  active: number
  needsAttention: number
  milestonesToday: number
  coachProspects: number
}

interface ProspectStats {
  total: number
}

interface PipelineSnapshotProps {
  clients: any[]
  clientStats: ClientStats
  prospects: Prospect[]
  prospectStats: ProspectStats
}

export function PipelineSnapshot({ clients, clientStats, prospects, prospectStats }: PipelineSnapshotProps) {
  const now = useMemo(() => new Date(), [])
  const todayStart = useMemo(() => {
    const date = new Date()
    date.setHours(0, 0, 0, 0)
    return date
  }, [])

  // Count all prospects with HA scheduled (based on ha_scheduled_at field, not status)
  // Exclude converted/coach prospects - memoized for performance
  const haScheduled = useMemo(() => 
    prospects.filter(p => 
      p.ha_scheduled_at && !["converted", "coach"].includes(p.status)
    ),
    [prospects]
  )

  // Determine upcoming vs overdue based on ha_scheduled_at - memoized
  const upcomingHA = useMemo(() => 
    haScheduled.filter(p => new Date(p.ha_scheduled_at!) >= now),
    [haScheduled, now]
  )
  
  const overdueHA = useMemo(() => 
    haScheduled.filter(p => new Date(p.ha_scheduled_at!) < now),
    [haScheduled, now]
  )

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Active Prospects */}
      <Link href="/prospect-tracker" className="block">
        <div className="p-4 rounded-lg bg-white border border-blue-200 hover:shadow-md transition-shadow cursor-pointer h-full">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">100's List</span>
            <Badge variant="secondary" className="bg-blue-100 text-blue-700">
              Pipeline
            </Badge>
          </div>
          <div className="text-2xl font-bold text-blue-600">
            {prospectStats.total}
          </div>
          <div className="text-xs text-gray-500">in your pipeline</div>
        </div>
      </Link>

      {/* HA Scheduled */}
      <Link href="/prospect-tracker?status=ha_scheduled" className="block">
        <div className="p-4 rounded-lg bg-white border border-purple-200 hover:shadow-md transition-shadow cursor-pointer h-full">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">HA Scheduled</span>
            <Badge variant="secondary" className={overdueHA.length > 0 ? "bg-orange-100 text-orange-700" : haScheduled.length > 0 ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-600"}>
              {overdueHA.length > 0 ? `${overdueHA.length} overdue` : haScheduled.length > 0 ? "On track" : "None"}
            </Badge>
          </div>
          <div className="text-2xl font-bold text-purple-600">
            {upcomingHA.length}/{haScheduled.length}
          </div>
          <div className="text-xs text-gray-500">upcoming health assessments</div>
          {overdueHA.length > 0 && (
            <div className="mt-1 flex items-center gap-1 text-xs text-red-600">
              <AlertCircle className="h-3 w-3" />
              {overdueHA.length} need rescheduling
            </div>
          )}
        </div>
      </Link>

      {/* Active Clients */}
      <Link href="/client-tracker" className="block">
        <div className="p-4 rounded-lg bg-white border border-green-200 hover:shadow-md transition-shadow cursor-pointer h-full">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Active Clients</span>
            <Badge variant="secondary" className={clientStats.needsAttention > 0 ? "bg-orange-100 text-orange-700" : "bg-green-100 text-green-700"}>
              {clientStats.needsAttention > 0 ? `${clientStats.needsAttention} need check-in` : "All good!"}
            </Badge>
          </div>
          <div className="text-2xl font-bold text-[hsl(var(--optavia-green))]">
            {clientStats.active}
          </div>
          <div className="text-xs text-gray-500">clients on program</div>
          {clientStats.milestonesToday > 0 && (
            <div className="mt-1 flex items-center gap-1 text-xs text-yellow-600">
              <Trophy className="h-3 w-3" />
              {clientStats.milestonesToday} milestone{clientStats.milestonesToday > 1 ? 's' : ''} to celebrate!
            </div>
          )}
        </div>
      </Link>

      {/* Future Coaches */}
      <Link href="/client-tracker?filter=coach_prospect" className="block">
        <div className="p-4 rounded-lg bg-white border border-amber-200 hover:shadow-md transition-shadow cursor-pointer h-full">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Future Coaches</span>
            <Badge variant="secondary" className="bg-amber-100 text-amber-700">
              Growing
            </Badge>
          </div>
          <div className="text-2xl font-bold text-amber-600">
            {clientStats.coachProspects}
          </div>
          <div className="text-xs text-gray-500">potential team members</div>
        </div>
      </Link>
    </div>
  )
}
