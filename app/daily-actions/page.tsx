"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useProspects, statusConfig } from "@/hooks/use-prospects"
import { useClients, getProgramDay, getDayPhase } from "@/hooks/use-clients"
import { useUserData } from "@/contexts/user-data-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ClientTextTemplates } from "@/components/client-text-templates"
import { RankCalculator } from "@/components/rank-calculator"
import {
  CheckCircle,
  Circle,
  MessageSquare,
  Calendar,
  Users,
  Target,
  ChevronRight,
  Heart,
  Trophy,
  Plus,
  Sparkles,
  TrendingUp,
  ChevronDown,
} from "lucide-react"

export default function WeeklyActionsDashboard() {
  const { profile } = useUserData()
  const { prospects, stats: prospectStats } = useProspects()
  const { clients, stats: clientStats, toggleTouchpoint, needsAttention } = useClients()

  const [currentTime, setCurrentTime] = useState(new Date())
  const [showTextModal, setShowTextModal] = useState(false)
  const [selectedClient, setSelectedClient] = useState<any>(null)
  const [showRankCalculator, setShowRankCalculator] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])

  const today = new Date().toISOString().split("T")[0]
  const dateStr = currentTime.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })

  // Get current week range
  const getWeekRange = () => {
    const now = new Date()
    const dayOfWeek = now.getDay()
    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - dayOfWeek)
    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 6)
    return `${startOfWeek.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${endOfWeek.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
  }

  const getGreeting = () => {
    const hour = currentTime.getHours()
    if (hour < 12) return "Good Morning"
    if (hour < 17) return "Good Afternoon"
    return "Good Evening"
  }

  const firstName = profile?.full_name?.split(" ")[0] || "Coach"

  // Get clients needing attention (no touchpoints done today)
  const clientsNeedingAction = clients
    .filter(c => c.status === "active" && needsAttention(c))
    .slice(0, 4)

  // Get milestone clients (Day 7, 14, 21, 30)
  const milestoneClients = clients.filter(c => {
    if (c.status !== "active") return false
    const day = getProgramDay(c.start_date)
    return [7, 14, 21, 30].includes(day)
  })

  // Get prospects needing follow-up this week (not aggressive - just gentle reminders)
  const weeklyProspectReminders = prospects
    .filter(p => {
      if (!p.next_action || ["converted", "coach", "not_interested"].includes(p.status)) return false
      const actionDate = new Date(p.next_action)
      const weekFromNow = new Date()
      weekFromNow.setDate(weekFromNow.getDate() + 7)
      return actionDate <= weekFromNow
    })
    .slice(0, 5)

  const openTextTemplates = (client: any) => {
    setSelectedClient(client)
    setShowTextModal(true)
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      {/* Page Header */}
      <div className="bg-gradient-to-r from-[hsl(var(--optavia-green))] to-[hsl(var(--optavia-green-dark))] text-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <div className="text-sm opacity-90 mb-1 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Week of {getWeekRange()}
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold">
                {getGreeting()}, {firstName}! 👋
              </h1>
              <p className="text-sm opacity-90 mt-1">
                Here's your weekly overview. Focus on your clients first! 💚
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm opacity-80 mb-2">{dateStr}</div>
              {milestoneClients.length > 0 && (
                <div className="flex items-center gap-2 bg-white/15 px-4 py-2 rounded-full">
                  <Trophy className="h-4 w-4 text-yellow-300" />
                  <span className="font-semibold">{milestoneClients.length} Milestone{milestoneClients.length > 1 ? "s" : ""} This Week!</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Stats Row - Client focused */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-[hsl(var(--optavia-green))]">{clientStats.active}</div>
              <div className="text-sm text-gray-600">Active Clients</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-orange-500">{clientStats.needsAttention}</div>
              <div className="text-sm text-gray-500">Need Touchpoint Today</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-purple-500">{clientStats.coachProspects}</div>
              <div className="text-sm text-gray-500">Future Coaches</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-blue-500">{prospectStats.total}</div>
              <div className="text-sm text-gray-500">Prospects</div>
            </CardContent>
          </Card>
        </div>

        {/* Rank Calculator Section */}
        <Card className="mb-6">
          <button
            onClick={() => setShowRankCalculator(!showRankCalculator)}
            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-gray-900">Rank Calculator</h3>
                <p className="text-sm text-gray-500">Track your progress to the next level</p>
              </div>
            </div>
            <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform ${showRankCalculator ? "rotate-180" : ""}`} />
          </button>
          
          {showRankCalculator && (
            <div className="border-t p-4">
              <RankCalculator />
            </div>
          )}
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - 2 columns */}
          <div className="lg:col-span-2 space-y-6">
            {/* Client Check-ins */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Heart className="h-5 w-5 text-green-500" />
                      Client Check-ins
                    </CardTitle>
                    <p className="text-xs text-gray-500 mt-1">AM/PM = Morning & evening touchpoints</p>
                  </div>
                  <Link href="/client-tracker">
                    <Button variant="ghost" size="sm" className="text-[hsl(var(--optavia-green))]">
                      View All <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                {clientsNeedingAction.length === 0 && milestoneClients.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <CheckCircle className="h-12 w-12 mx-auto mb-3 text-green-500" />
                    <p>All client touchpoints completed today!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Milestone Celebrations First */}
                    {milestoneClients.map(client => {
                      const programDay = getProgramDay(client.start_date)
                      const phase = getDayPhase(programDay)
                      return (
                        <div
                          key={`milestone-${client.id}`}
                          className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border-2 border-green-200"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                              <Trophy className="h-6 w-6 text-green-600" />
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900">{client.label}</div>
                              <div className="text-sm text-green-600 font-medium">{phase.label}</div>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => openTextTemplates(client)}
                            className="bg-green-500 hover:bg-green-600"
                          >
                            <MessageSquare className="h-4 w-4 mr-1" />
                            Celebrate!
                          </Button>
                        </div>
                      )
                    })}

                    {/* Clients Needing Touchpoints */}
                    {clientsNeedingAction.map(client => {
                      const programDay = getProgramDay(client.start_date)
                      const phase = getDayPhase(programDay)
                      return (
                        <div
                          key={client.id}
                          className="flex items-center justify-between p-4 bg-white rounded-lg border hover:shadow-sm transition-shadow"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className="w-12 h-12 rounded-xl flex flex-col items-center justify-center"
                              style={{ backgroundColor: phase.bg }}
                            >
                              <div className="text-[10px] font-semibold" style={{ color: phase.color }}>DAY</div>
                              <div className="text-lg font-bold" style={{ color: phase.color }}>{programDay}</div>
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900">{client.label}</div>
                              <div className="text-sm text-gray-500">{phase.label}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant={client.am_done ? "default" : "outline"}
                              onClick={() => toggleTouchpoint(client.id, "am_done")}
                              className={client.am_done ? "bg-green-500" : ""}
                            >
                              {client.am_done ? <CheckCircle className="h-3 w-3 mr-1" /> : <Circle className="h-3 w-3 mr-1" />}
                              AM
                            </Button>
                            <Button
                              size="sm"
                              variant={client.pm_done ? "default" : "outline"}
                              onClick={() => toggleTouchpoint(client.id, "pm_done")}
                              className={client.pm_done ? "bg-green-500" : ""}
                            >
                              {client.pm_done ? <CheckCircle className="h-3 w-3 mr-1" /> : <Circle className="h-3 w-3 mr-1" />}
                              PM
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openTextTemplates(client)}
                              className="text-blue-600"
                            >
                              <MessageSquare className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Prospect Reminders - Gentle, not aggressive */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Users className="h-5 w-5 text-blue-500" />
                    Prospect Reminders
                    <span className="text-sm font-normal text-gray-500">When you have time</span>
                  </CardTitle>
                  <Link href="/prospect-tracker">
                    <Button variant="ghost" size="sm" className="text-[hsl(var(--optavia-green))]">
                      View All <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                {weeklyProspectReminders.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Sparkles className="h-12 w-12 mx-auto mb-3 text-blue-400" />
                    <p>No prospects scheduled this week.</p>
                    <p className="text-sm mt-1">Focus on your current clients! 💚</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm text-gray-500 mb-4">
                      These prospects have follow-ups scheduled this week. Reach out when it feels natural! 
                    </p>
                    {weeklyProspectReminders.map(prospect => {
                      const config = statusConfig[prospect.status]
                      const actionDate = prospect.next_action ? new Date(prospect.next_action) : null
                      const isPast = actionDate && actionDate < new Date(today)
                      return (
                        <div
                          key={prospect.id}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                              style={{ backgroundColor: config.bg }}
                            >
                              {config.icon}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-gray-900">{prospect.label}</span>
                                <Badge
                                  variant="secondary"
                                  style={{ backgroundColor: config.bg, color: config.color }}
                                  className="text-xs"
                                >
                                  {config.label}
                                </Badge>
                              </div>
                              <div className="text-sm text-gray-500">
                                {isPast ? "Whenever you're ready" : actionDate?.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                              </div>
                            </div>
                          </div>
                          <Link href="/prospect-tracker">
                            <Button size="sm" variant="outline">
                              View
                            </Button>
                          </Link>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Coach Tip */}
            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-green-600" />
                  Weekly Focus
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-gray-700 leading-relaxed">
                  Your current clients are your best ambassadors! When they succeed, 
                  referrals come naturally. Focus on their journey first. 💚
                </p>
              </CardContent>
            </Card>

            {/* Quick Actions - Client focused first */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-2">
                <Link href="/client-tracker" className="block">
                  <Button variant="outline" className="w-full justify-start text-green-700 border-green-200 bg-green-50 hover:bg-green-100">
                    <Heart className="h-4 w-4 mr-2" />
                    Client Tracker
                  </Button>
                </Link>
                <Link href="/resources?category=Coach%20Tools" className="block">
                  <Button variant="outline" className="w-full justify-start text-blue-700 border-blue-200 bg-blue-50 hover:bg-blue-100">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Client Scripts
                  </Button>
                </Link>
                <Link href="/coach/assessments" className="block">
                  <Button variant="outline" className="w-full justify-start text-purple-700 border-purple-200 bg-purple-50 hover:bg-purple-100">
                    <Target className="h-4 w-4 mr-2" />
                    Health Assessments
                  </Button>
                </Link>
                <Link href="/prospect-tracker" className="block">
                  <Button variant="outline" className="w-full justify-start text-gray-600 border-gray-200 hover:bg-gray-50">
                    <Users className="h-4 w-4 mr-2" />
                    Prospect Tracker
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Client Summary - Primary focus */}
            <Card className="border-green-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Heart className="h-5 w-5 text-green-500" />
                  Your Clients
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Active</span>
                    <span className="font-semibold text-green-600">{clientStats.active}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Paused</span>
                    <span className="font-semibold text-gray-500">{clientStats.paused}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Future Coaches</span>
                    <span className="font-semibold text-purple-500">{clientStats.coachProspects}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t">
                    <span className="text-sm font-medium text-gray-700">Completed Program</span>
                    <span className="font-bold text-green-600">{clientStats.completed}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Prospect Summary - Secondary */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2 text-gray-600">
                  <Users className="h-5 w-5 text-gray-400" />
                  Prospects
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Total in Pipeline</span>
                    <span className="font-semibold">{prospectStats.total}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Warm Leads</span>
                    <span className="font-semibold text-orange-500">{prospectStats.warm}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t">
                    <span className="text-sm font-medium text-gray-600">Became Clients</span>
                    <span className="font-bold text-green-500">{prospectStats.converted}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Text Templates Modal */}
      {selectedClient && (
        <ClientTextTemplates
          open={showTextModal}
          onOpenChange={setShowTextModal}
          clientLabel={selectedClient.label}
          programDay={getProgramDay(selectedClient.start_date)}
        />
      )}

      <Footer />
    </div>
  )
}
