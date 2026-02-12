"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkles } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface DashboardButton {
  id: string
  sort_order: number
  label: string
  url: string
  color: string
}

const COLOR_MAP: Record<string, string> = {
  green: "bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 hover:from-green-100 hover:to-emerald-100",
  blue: "bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 hover:from-blue-100 hover:to-indigo-100",
  purple: "bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200 hover:from-purple-100 hover:to-violet-100",
  orange: "bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200 hover:from-orange-100 hover:to-amber-100",
  brand: "bg-[hsl(var(--optavia-green-light))] border-[hsl(var(--optavia-green))] hover:bg-green-100",
}

const DEFAULT_COLOR = COLOR_MAP.green

export function QuickActions() {
  const [buttons, setButtons] = useState<DashboardButton[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    async function fetchButtons() {
      const { data, error } = await supabase
        .from("dashboard_buttons")
        .select("id, sort_order, label, url, color")
        .order("sort_order", { ascending: true })
        .limit(4)

      if (!error && data) {
        setButtons(data)
      }
      setLoading(false)
    }

    fetchButtons()
  }, [])

  return (
    <Card className="bg-white border border-gray-200 shadow-sm h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center justify-center gap-2 text-optavia-dark">
          <Sparkles className="h-5 w-5 text-amber-500" />
          Dashboard
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 flex-1">
        {loading ? (
          <div className="grid grid-cols-2 gap-3 h-full">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="w-full min-h-[120px] p-4 rounded-lg border border-gray-200 bg-gray-50 animate-pulse flex flex-col justify-center items-center"
              >
                <div className="h-4 w-24 bg-gray-200 rounded" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 h-full">
            {buttons.map((button) => {
              const bgClass = COLOR_MAP[button.color] || DEFAULT_COLOR
              const isExternal = button.url.startsWith("http")

              if (isExternal) {
                return (
                  <a
                    key={button.id}
                    href={button.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-full"
                  >
                    <div
                      className={`w-full min-h-[120px] p-4 rounded-lg border transition-all cursor-pointer flex flex-col justify-center items-center text-center ${bgClass}`}
                    >
                      <p className="text-sm font-medium text-optavia-dark leading-tight">{button.label}</p>
                    </div>
                  </a>
                )
              }

              return (
                <Link key={button.id} href={button.url} className="flex h-full">
                  <div
                    className={`w-full min-h-[120px] p-4 rounded-lg border transition-all cursor-pointer flex flex-col justify-center items-center text-center ${bgClass}`}
                  >
                    <p className="text-sm font-medium text-optavia-dark leading-tight">{button.label}</p>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
