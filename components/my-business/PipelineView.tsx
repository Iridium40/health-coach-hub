"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, Heart, TrendingUp, ChevronRight, Plus, AlertCircle, Calendar, Phone } from "lucide-react"
import { usePipeline } from "@/hooks/use-pipeline"
import { PipelineStage } from "./PipelineStage"
import { ActivityFeed } from "./ActivityFeed"

export function PipelineView() {
  const { stages, recentActivity, priorityItems, totals, loading } = usePipeline()

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Loading skeleton for stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="bg-gray-50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4 animate-pulse">
                  <div className="p-3 rounded-xl bg-gray-200 w-12 h-12"></div>
                  <div className="flex-1">
                    <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Loading skeleton for pipeline */}
        <Card>
          <CardHeader className="pb-3">
            <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex gap-4 overflow-hidden">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="min-w-[140px] p-4 rounded-lg bg-gray-100 animate-pulse">
                  <div className="text-center">
                    <div className="h-8 w-8 mx-auto bg-gray-200 rounded mb-2"></div>
                    <div className="h-8 bg-gray-200 rounded w-12 mx-auto mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-20 mx-auto"></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-blue-100">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <div className="text-3xl font-bold text-blue-700">{totals.prospects}</div>
                <div className="text-sm text-blue-600">100's List</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-green-100">
                <Heart className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <div className="text-3xl font-bold text-green-700">{totals.clients}</div>
                <div className="text-sm text-green-600">Active Clients</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-purple-100">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-700">{totals.futureCoaches}</div>
                <div className="text-sm text-purple-600">Future Coaches</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pipeline Stages */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Pipeline Stages</CardTitle>
            <Link href="/prospect-tracker">
              <Button size="sm" className="bg-[hsl(var(--optavia-green))] hover:bg-[hsl(var(--optavia-green-dark))] text-white">
                <Plus className="h-4 w-4 mr-1" />
                Add Prospect
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="overflow-x-auto pb-4">
            <div className="flex items-start min-w-max">
              {stages.map((stage, index) => (
                <PipelineStage
                  key={stage.id}
                  stage={stage}
                  isFirst={index === 0}
                  isLast={index === stages.length - 1}
                />
              ))}
            </div>
          </div>

          {/* Empty state */}
          {stages.every(s => s.count === 0) && (
            <div className="text-center py-8 text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">Your pipeline is empty</p>
              <p className="text-sm text-gray-400 mt-1 mb-4">
                Add your first prospect to start building your pipeline
              </p>
              <Link href="/prospect-tracker">
                <Button className="bg-[hsl(var(--optavia-green))] hover:bg-[hsl(var(--optavia-green-dark))] text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Prospect
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Needs Attention Section */}
      {priorityItems.length > 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2 text-amber-800">
              <AlertCircle className="h-5 w-5" />
              Needs Attention
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {priorityItems.map((item) => (
                <Link key={item.id} href={item.link}>
                  <div className={`p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                    item.urgency === "high" 
                      ? "bg-red-50 border-red-200 hover:bg-red-100" 
                      : "bg-white border-gray-200 hover:bg-gray-50"
                  }`}>
                    <div className="flex items-start gap-2">
                      <div className={`p-1.5 rounded-full ${
                        item.urgency === "high" ? "bg-red-100" : "bg-amber-100"
                      }`}>
                        {item.type === "prospect" ? (
                          item.reason.includes("HA") ? (
                            <Calendar className={`h-3.5 w-3.5 ${
                              item.urgency === "high" ? "text-red-600" : "text-amber-600"
                            }`} />
                          ) : (
                            <Phone className={`h-3.5 w-3.5 ${
                              item.urgency === "high" ? "text-red-600" : "text-amber-600"
                            }`} />
                          )
                        ) : (
                          <Heart className={`h-3.5 w-3.5 ${
                            item.urgency === "high" ? "text-red-600" : "text-amber-600"
                          }`} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm text-gray-900 truncate">
                          {item.name}
                        </div>
                        <div className={`text-xs ${
                          item.urgency === "high" ? "text-red-600 font-medium" : "text-amber-700"
                        }`}>
                          {item.reason}
                        </div>
                      </div>
                      {item.urgency === "high" && (
                        <Badge className="bg-red-500 text-[10px] px-1.5 py-0 flex-shrink-0">
                          !
                        </Badge>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Activity Feed */}
      <ActivityFeed activities={recentActivity} />

      {/* Quick Links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link href="/prospect-tracker">
          <Card className="hover:shadow-md transition-shadow cursor-pointer border-blue-200 bg-blue-50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-blue-600" />
                  <span className="font-medium text-blue-700">Prospect Tracker</span>
                </div>
                <ChevronRight className="h-5 w-5 text-blue-400" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/client-tracker">
          <Card className="hover:shadow-md transition-shadow cursor-pointer border-green-200 bg-green-50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Heart className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-green-700">Client Tracker</span>
                </div>
                <ChevronRight className="h-5 w-5 text-green-400" />
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}
