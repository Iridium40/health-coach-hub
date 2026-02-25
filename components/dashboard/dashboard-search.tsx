"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { SearchWithHistory } from "@/components/search-with-history"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import type { Module } from "@/lib/types"
import type { TrainingResource } from "@/hooks/use-training-resources"
import type { ClientResourceSearchItem } from "@/lib/client-resources-data"
import {
  mapMetadataItemsToSearchItems,
  mapTrainingToSearchItems,
  scoreDashboardSearchItem,
  type DashboardSearchItem,
  type DashboardSearchMetadataItem,
} from "@/lib/search/dashboard-search"
import { ArrowUpRight, Search } from "lucide-react"

interface DashboardButton {
  id: string
  label: string
  url: string
  color: string
}

interface DashboardSearchProps {
  modules: Module[]
  trainingResources: TrainingResource[]
  externalResources: DashboardSearchMetadataItem[]
  coachTools: DashboardSearchMetadataItem[]
  clientResources: ClientResourceSearchItem[]
  onOpenTool: (toolId: string) => void
}

const SOURCE_LABELS: Record<DashboardSearchItem["sourceType"], string> = {
  training: "Training",
  resource: "Resources",
  dashboard_button: "Dashboard Buttons",
  client_resource: "Client Resources",
}

const DIRECT_OPEN_HOSTS = [
  "vimeo.com",
  "www.vimeo.com",
  "youtube.com",
  "www.youtube.com",
  "youtu.be",
]

const toViewerHref = (url: string, title: string, options?: { preferDirect?: boolean }) => {
  if (!url.startsWith("http")) return url
  if (options?.preferDirect) return url

  try {
    const host = new URL(url).hostname.toLowerCase()
    if (DIRECT_OPEN_HOSTS.includes(host)) {
      return url
    }
  } catch {
    return url
  }

  return `/viewer?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`
}

export function DashboardSearch({
  modules,
  trainingResources,
  externalResources,
  coachTools,
  clientResources,
  onOpenTool,
}: DashboardSearchProps) {
  const [query, setQuery] = useState("")
  const [dashboardButtons, setDashboardButtons] = useState<DashboardButton[]>([])

  useEffect(() => {
    const supabase = createClient()
    const loadButtons = async () => {
      const { data } = await supabase
        .from("dashboard_buttons")
        .select("id, label, url, color")
        .order("sort_order", { ascending: true })

      if (data) setDashboardButtons(data)
    }
    loadButtons()
  }, [])

  const searchIndex = useMemo(() => {
    const trainingItems = mapTrainingToSearchItems(modules, trainingResources).map((item) => ({
      ...item,
      // Training content often includes providers that block iframe embeds.
      href: item.href ? toViewerHref(item.href, item.title, { preferDirect: true }) : item.href,
    }))

    const externalResourceItems = mapMetadataItemsToSearchItems(
      "resource",
      externalResources,
      { actionType: "link", extraTags: ["dashboard"] }
    ).map((item) => {
      return {
        ...item,
        href: item.href ? toViewerHref(item.href, item.title) : item.href,
      }
    })

    const coachToolItems = mapMetadataItemsToSearchItems(
      "resource",
      coachTools.map((tool) => ({ ...tool, href: undefined })),
      { actionType: "modal", extraTags: ["dashboard", "coach tool"] }
    )

    const buttonItems = mapMetadataItemsToSearchItems(
      "dashboard_button",
      dashboardButtons.map((button) => ({
        id: button.id,
        title: button.label,
        description: `Dashboard action button (${button.color})`,
        category: "Dashboard",
        tags: ["button", "quick action", button.color],
        href: toViewerHref(button.url, button.label),
      })),
      { actionType: "link", extraTags: ["dashboard"] }
    )

    const clientResourceItems = mapMetadataItemsToSearchItems(
      "client_resource",
      clientResources.map((item) => ({
        id: item.id,
        title: item.title,
        description: item.description,
        category: item.category,
        tags: item.tags,
        href: item.href,
      })),
      { actionType: "link", extraTags: ["client resources"] }
    )

    return [...trainingItems, ...externalResourceItems, ...coachToolItems, ...buttonItems, ...clientResourceItems]
  }, [modules, trainingResources, externalResources, coachTools, dashboardButtons, clientResources])

  const suggestions = useMemo(() => {
    const suggestionSet = new Set<string>()
    searchIndex.forEach((item) => {
      suggestionSet.add(item.title)
      item.tags.slice(0, 3).forEach((tag) => suggestionSet.add(tag))
    })
    return Array.from(suggestionSet).slice(0, 200)
  }, [searchIndex])

  const filteredResults = useMemo(() => {
    if (!query.trim()) return []
    return searchIndex
      .map((item) => ({ item, score: scoreDashboardSearchItem(item, query) }))
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((entry) => entry.item)
      .slice(0, 40)
  }, [searchIndex, query])

  const groupedResults = useMemo(() => {
    return {
      training: filteredResults.filter((item) => item.sourceType === "training"),
      resource: filteredResults.filter((item) => item.sourceType === "resource"),
      dashboard_button: filteredResults.filter((item) => item.sourceType === "dashboard_button"),
      client_resource: filteredResults.filter((item) => item.sourceType === "client_resource"),
    }
  }, [filteredResults])

  return (
    <Card className="bg-white border border-gray-200 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2 text-optavia-dark">
          <Search className="h-5 w-5 text-[hsl(var(--optavia-green))]" />
          Find Anything
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        <SearchWithHistory
          value={query}
          onChange={setQuery}
          placeholder="Search accross the entier site..."
          suggestions={suggestions}
          storageKey="dashboard-unified-search"
        />

        {query.trim() && (
          <div className="space-y-3">
            {filteredResults.length === 0 ? (
              <div className="rounded-md border border-dashed border-gray-300 p-4 text-sm text-gray-500">
                No results for "{query}".
              </div>
            ) : (
              (Object.keys(groupedResults) as Array<keyof typeof groupedResults>).map((key) => {
                const items = groupedResults[key]
                if (items.length === 0) return null
                return (
                  <div key={key} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-sm text-gray-800">{SOURCE_LABELS[key]}</h4>
                      <Badge variant="outline">{items.length}</Badge>
                    </div>
                    <div className="space-y-2">
                      {items.map((item) => (
                        <div key={item.id} className="rounded-md border p-3 flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="font-medium text-sm text-gray-900">{item.title}</p>
                            <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">{item.description}</p>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {item.tags.slice(0, 3).map((tag) => (
                                <Badge key={`${item.id}-${tag}`} variant="secondary" className="text-[10px]">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          {item.actionType === "modal" && item.actionId ? (
                            <Button size="sm" variant="outline" onClick={() => onOpenTool(item.actionId!)}>
                              Open
                            </Button>
                          ) : item.href ? (
                            <Link href={item.href}>
                              <Button size="sm" variant="outline" className="shrink-0">
                                Open <ArrowUpRight className="h-3.5 w-3.5 ml-1" />
                              </Button>
                            </Link>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

