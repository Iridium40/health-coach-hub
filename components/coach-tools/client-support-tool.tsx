"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Wrench, Droplets, Dumbbell, BookOpen, Activity } from "lucide-react"
import { ClientTroubleshootingDialog } from "@/components/coach-tools/client-troubleshooting-dialog"
import { WaterCalculator } from "@/components/coach-tools/water-calculator"
import { ExerciseGuide } from "@/components/coach-tools/exercise-guide"
import { OPTAVIAReferenceGuide } from "@/components/coach-tools/optavia-reference-guide"
import { MetabolicHealthInfo } from "@/components/coach-tools/metabolic-health-info"

const TAB_META = {
  troubleshooting: {
    title: "Troubleshoot",
    subtitle: "Resolve common client challenges with scripts and action steps.",
    icon: Wrench,
  },
  water: {
    title: "Hydration",
    subtitle: "Set personalized water targets and track daily progress.",
    icon: Droplets,
  },
  exercise: {
    title: "Motion",
    subtitle: "Guide clients with movement plans and exercise support.",
    icon: Dumbbell,
  },
  condiments: {
    title: "Condiments",
    subtitle: "Reference approved fats, dressings, and condiment options.",
    icon: BookOpen,
  },
  metabolic: {
    title: "Metabolic",
    subtitle: "Use metabolic health education and coaching talking points.",
    icon: Activity,
  },
} as const

const QUICK_TAB_ITEMS: Array<{ key: keyof typeof TAB_META; short: string }> = [
  { key: "troubleshooting", short: "Fix" },
  { key: "water", short: "Water" },
  { key: "exercise", short: "Motion" },
  { key: "condiments", short: "Food" },
  { key: "metabolic", short: "Health" },
]

function SupportSection({
  tabKey,
  children,
}: {
  tabKey: keyof typeof TAB_META
  children: React.ReactNode
}) {
  const meta = TAB_META[tabKey]
  const Icon = meta.icon

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-5 shadow-sm space-y-4">
      <div className="rounded-lg bg-[hsl(var(--optavia-green-light))] border border-green-100 p-3 sm:p-4">
        <div className="flex items-center gap-2 mb-1">
          <Icon className="h-4 w-4 text-[hsl(var(--optavia-green))]" />
          <h3 className="font-semibold text-optavia-dark">{meta.title}</h3>
        </div>
        <p className="text-sm text-optavia-gray">{meta.subtitle}</p>
      </div>
      <div className="[&_h4]:text-optavia-dark [&_.text-optavia-gray]:text-gray-600 [&_.border-gray-200]:border-gray-200">
        {children}
      </div>
    </div>
  )
}

export function ClientSupportTool() {
  const [activeTab, setActiveTab] = useState<keyof typeof TAB_META>("troubleshooting")

  return (
    <div className="space-y-4 pb-16 md:pb-0">
      <Card className="border border-gray-200 shadow-sm bg-white">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-optavia-dark flex items-center gap-2">
            <Wrench className="h-5 w-5 text-[hsl(var(--optavia-green))]" />
            Client Support Tool
          </CardTitle>
          <p className="text-sm text-optavia-gray">
            One unified support workspace for coaching conversations, hydration, motion, condiments, and metabolic education.
          </p>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-xs text-optavia-gray bg-gray-50 border border-gray-200 rounded-md px-3 py-2">
            Choose a tab based on what your client needs help with right now.
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as keyof typeof TAB_META)} className="w-full">
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 pb-2">
          <TabsList
            className="w-full md:grid md:grid-cols-5 h-auto bg-gray-100 p-1 border border-gray-200 rounded-lg
            flex overflow-x-auto gap-1 no-scrollbar"
          >
          <TabsTrigger value="troubleshooting" className="text-xs sm:text-sm min-h-10 px-3 whitespace-nowrap flex-shrink-0">
            <Wrench className="h-3.5 w-3.5 mr-1" />
            Troubleshoot
          </TabsTrigger>
          <TabsTrigger value="water" className="text-xs sm:text-sm min-h-10 px-3 whitespace-nowrap flex-shrink-0">
            <Droplets className="h-3.5 w-3.5 mr-1" />
            Hydration
          </TabsTrigger>
          <TabsTrigger value="exercise" className="text-xs sm:text-sm min-h-10 px-3 whitespace-nowrap flex-shrink-0">
            <Dumbbell className="h-3.5 w-3.5 mr-1" />
            Motion
          </TabsTrigger>
          <TabsTrigger value="condiments" className="text-xs sm:text-sm min-h-10 px-3 whitespace-nowrap flex-shrink-0">
            <BookOpen className="h-3.5 w-3.5 mr-1" />
            Condiments
          </TabsTrigger>
          <TabsTrigger value="metabolic" className="text-xs sm:text-sm min-h-10 px-3 whitespace-nowrap flex-shrink-0">
            <Activity className="h-3.5 w-3.5 mr-1" />
            Metabolic
          </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="troubleshooting" className="mt-4">
          <SupportSection tabKey="troubleshooting">
            <ClientTroubleshootingDialog />
          </SupportSection>
        </TabsContent>

        <TabsContent value="water" className="mt-4">
          <SupportSection tabKey="water">
            <WaterCalculator />
          </SupportSection>
        </TabsContent>

        <TabsContent value="exercise" className="mt-4">
          <SupportSection tabKey="exercise">
            <ExerciseGuide />
          </SupportSection>
        </TabsContent>

        <TabsContent value="condiments" className="mt-4">
          <SupportSection tabKey="condiments">
            <OPTAVIAReferenceGuide />
          </SupportSection>
        </TabsContent>

        <TabsContent value="metabolic" className="mt-4">
          <SupportSection tabKey="metabolic">
            <MetabolicHealthInfo />
          </SupportSection>
        </TabsContent>
      </Tabs>

      {/* Mobile quick-jump bar for one-handed tab switching */}
      <div className="md:hidden sticky bottom-0 z-20 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 border border-gray-200 rounded-lg p-1 shadow-sm">
        <div className="grid grid-cols-5 gap-1">
          {QUICK_TAB_ITEMS.map((item) => {
            const Icon = TAB_META[item.key].icon
            const isActive = activeTab === item.key
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => setActiveTab(item.key)}
                className={`min-h-10 rounded-md border text-[10px] font-medium flex flex-col items-center justify-center gap-0.5 transition-colors ${
                  isActive
                    ? "bg-[hsl(var(--optavia-green-light))] border-[hsl(var(--optavia-green))] text-[hsl(var(--optavia-green-dark))]"
                    : "bg-white border-gray-200 text-gray-600"
                }`}
                aria-label={`Go to ${TAB_META[item.key].title}`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{item.short}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

