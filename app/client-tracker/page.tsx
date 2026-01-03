"use client"

import { useState } from "react"
import Link from "next/link"
import { useClients, getDayPhase, getProgramDay, type ClientStatus } from "@/hooks/use-clients"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Users,
  Plus,
  CheckCircle,
  Circle,
  Calendar,
  Star,
  AlertCircle,
  Clock,
  ChevronRight,
  MessageSquare,
  Trophy,
  Flame,
  Sparkles,
  X,
} from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ClientTextTemplates } from "@/components/client-text-templates"

export default function ClientTrackerPage() {
  const {
    clients,
    loading,
    stats,
    addClient,
    toggleTouchpoint,
    toggleCoachProspect,
    updateStatus,
    needsAttention,
    getFilteredClients,
  } = useClients()

  const [showAddModal, setShowAddModal] = useState(false)
  const [showTextModal, setShowTextModal] = useState(false)
  const [selectedClient, setSelectedClient] = useState<any>(null)
  const [filterStatus, setFilterStatus] = useState<ClientStatus | "all">("active")

  const today = new Date().toISOString().split("T")[0]

  const [newClient, setNewClient] = useState({
    label: "",
    startDate: today,
  })

  const handleAddClient = async () => {
    if (!newClient.label.trim() || !newClient.startDate) return
    await addClient({
      label: newClient.label,
      start_date: newClient.startDate,
    })
    setNewClient({ label: "", startDate: today })
    setShowAddModal(false)
  }

  const openTextTemplates = (client: any) => {
    setSelectedClient(client)
    setShowTextModal(true)
  }

  const filteredClients = getFilteredClients(filterStatus)

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[hsl(var(--optavia-green))]"></div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      {/* Page Header */}
      <div className="bg-gradient-to-r from-[hsl(var(--optavia-green))] to-[hsl(var(--optavia-green-dark))] text-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-sm opacity-90 mb-1">
                <span>My Business</span>
                <ChevronRight className="h-4 w-4" />
                <span className="font-semibold">Client Tracker</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-3">
                <Users className="h-8 w-8" />
                My Clients
              </h1>
              <p className="text-sm opacity-90 mt-1">
                Track daily touchpoints and milestones
              </p>
            </div>
            <div className="flex gap-3">
              <Link href="/prospect-tracker">
                <Button variant="outline" className="bg-white/10 border-white/30 text-white hover:bg-white/20">
                  <Users className="h-4 w-4 mr-2" />
                  Prospects
                </Button>
              </Link>
              <Button
                onClick={() => setShowAddModal(true)}
                className="bg-white text-[hsl(var(--optavia-green))] hover:bg-white/90"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Client
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Privacy Notice */}
      <div className="bg-blue-50 border-b border-blue-200">
        <div className="container mx-auto px-4 py-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-sm text-blue-700">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>
                <strong>Privacy:</strong> Use nicknames only. Contact info stays in OPTAVIA's portal.
              </span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Clock className="h-4 w-4 flex-shrink-0" />
              <span>
                <strong>AM/PM:</strong> Track your morning & evening check-ins with each client.
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-[hsl(var(--optavia-green))]">{stats.active}</div>
              <div className="text-sm text-gray-500">Active</div>
            </CardContent>
          </Card>
          <Card className={stats.needsAttention > 0 ? "border-orange-300 bg-orange-50" : ""}>
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-orange-500">{stats.needsAttention}</div>
              <div className="text-sm text-gray-500">Need Attention</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-purple-500">{stats.coachProspects}</div>
              <div className="text-sm text-gray-500">Coach Prospects</div>
            </CardContent>
          </Card>
          <Card className={stats.milestonesToday > 0 ? "border-yellow-300 bg-yellow-50" : ""}>
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-yellow-600">{stats.milestonesToday}</div>
              <div className="text-sm text-gray-500">Milestones Today</div>
            </CardContent>
          </Card>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6">
          {(["active", "paused", "all"] as const).map((status) => (
            <Button
              key={status}
              variant={filterStatus === status ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterStatus(status)}
              className={filterStatus === status ? "bg-[hsl(var(--optavia-green))]" : ""}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Button>
          ))}
        </div>

        {/* Client List */}
        <div className="space-y-3">
          {filteredClients.map((client) => {
            const programDay = getProgramDay(client.start_date)
            const phase = getDayPhase(programDay)
            const attention = needsAttention(client)

            return (
              <Card
                key={client.id}
                className={`transition-shadow hover:shadow-md ${
                  attention
                    ? "border-orange-300 bg-orange-50"
                    : phase.milestone
                    ? "border-green-300 bg-green-50"
                    : ""
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    {/* Day Badge */}
                    <div
                      className="w-14 h-14 rounded-xl flex flex-col items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: phase.bg }}
                    >
                      <div className="text-xs font-semibold" style={{ color: phase.color }}>
                        DAY
                      </div>
                      <div className="text-xl font-bold" style={{ color: phase.color }}>
                        {programDay}
                      </div>
                    </div>

                    {/* Client Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-gray-900">{client.label}</span>
                        {client.is_coach_prospect && (
                          <Badge className="bg-orange-100 text-orange-700 flex items-center gap-1">
                            <Star className="h-3 w-3" />
                            Coach Prospect
                          </Badge>
                        )}
                        {client.status === "paused" && (
                          <Badge variant="secondary">Paused</Badge>
                        )}
                        {phase.milestone && (
                          <Badge
                            style={{ backgroundColor: phase.bg, color: phase.color }}
                          >
                            {phase.label}
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        {phase.label} • Started{" "}
                        {new Date(client.start_date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </div>
                    </div>

                    {/* Touchpoint Buttons */}
                    {client.status === "active" && (
                      <div className="flex items-center gap-2">
                        <Button
                          variant={client.am_done ? "default" : "outline"}
                          size="sm"
                          onClick={() => toggleTouchpoint(client.id, "am_done")}
                          className={client.am_done ? "bg-green-500 hover:bg-green-600" : ""}
                        >
                          {client.am_done ? (
                            <CheckCircle className="h-4 w-4 mr-1" />
                          ) : (
                            <Circle className="h-4 w-4 mr-1" />
                          )}
                          AM
                        </Button>
                        <Button
                          variant={client.pm_done ? "default" : "outline"}
                          size="sm"
                          onClick={() => toggleTouchpoint(client.id, "pm_done")}
                          className={client.pm_done ? "bg-green-500 hover:bg-green-600" : ""}
                        >
                          {client.pm_done ? (
                            <CheckCircle className="h-4 w-4 mr-1" />
                          ) : (
                            <Circle className="h-4 w-4 mr-1" />
                          )}
                          PM
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openTextTemplates(client)}
                          className="text-blue-600 border-blue-200 hover:bg-blue-50"
                        >
                          <MessageSquare className="h-4 w-4 mr-1" />
                          Get Text
                        </Button>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleCoachProspect(client.id)}
                        className={client.is_coach_prospect ? "bg-orange-50 text-orange-700" : ""}
                      >
                        {client.is_coach_prospect ? "★ Coach" : "☆ Coach?"}
                      </Button>
                      {client.status === "active" ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateStatus(client.id, "paused")}
                        >
                          Pause
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateStatus(client.id, "active")}
                          className="text-green-600"
                        >
                          Resume
                        </Button>
                      )}
                    </div>
                  </div>

                  {client.notes && (
                    <div className="mt-3 pt-3 border-t text-sm text-gray-600">
                      📝 {client.notes}
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}

          {filteredClients.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500 mb-4">No clients found</p>
                <Button onClick={() => setShowAddModal(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Client
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Add Client Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Client</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Label / Nickname *</Label>
              <Input
                value={newClient.label}
                onChange={(e) => setNewClient({ ...newClient, label: e.target.value })}
                placeholder="e.g., Jennifer, Mike"
                maxLength={50}
              />
              <p className="text-xs text-gray-500 mt-1">
                A name you'll recognize (no contact info needed)
              </p>
            </div>
            <div>
              <Label>Start Date *</Label>
              <Input
                type="date"
                value={newClient.startDate}
                onChange={(e) => setNewClient({ ...newClient, startDate: e.target.value })}
              />
            </div>
            <div className="bg-green-50 rounded-lg p-3 text-sm text-green-700 flex items-start gap-2">
              <Sparkles className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <span>
                We'll calculate their program day and show milestone reminders automatically!
              </span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAddClient}
              disabled={!newClient.label.trim() || !newClient.startDate}
              className="bg-[hsl(var(--optavia-green))]"
            >
              Add Client
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
