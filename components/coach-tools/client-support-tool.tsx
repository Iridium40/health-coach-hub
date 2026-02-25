"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Wrench, Droplets, Dumbbell, BookOpen, Activity } from "lucide-react"
import { ClientTroubleshootingDialog } from "@/components/coach-tools/client-troubleshooting-dialog"
import { WaterCalculator } from "@/components/coach-tools/water-calculator"
import { ExerciseGuide } from "@/components/coach-tools/exercise-guide"
import { OPTAVIAReferenceGuide } from "@/components/coach-tools/optavia-reference-guide"
import { MetabolicHealthInfo } from "@/components/coach-tools/metabolic-health-info"

export function ClientSupportTool() {
  return (
    <div className="space-y-4">
      <Tabs defaultValue="troubleshooting" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 h-auto gap-1 bg-gray-100 p-1">
          <TabsTrigger value="troubleshooting" className="text-xs sm:text-sm">
            <Wrench className="h-3.5 w-3.5 mr-1" />
            Troubleshoot
          </TabsTrigger>
          <TabsTrigger value="water" className="text-xs sm:text-sm">
            <Droplets className="h-3.5 w-3.5 mr-1" />
            Hydration
          </TabsTrigger>
          <TabsTrigger value="exercise" className="text-xs sm:text-sm">
            <Dumbbell className="h-3.5 w-3.5 mr-1" />
            Motion
          </TabsTrigger>
          <TabsTrigger value="condiments" className="text-xs sm:text-sm">
            <BookOpen className="h-3.5 w-3.5 mr-1" />
            Condiments
          </TabsTrigger>
          <TabsTrigger value="metabolic" className="text-xs sm:text-sm">
            <Activity className="h-3.5 w-3.5 mr-1" />
            Metabolic
          </TabsTrigger>
        </TabsList>

        <TabsContent value="troubleshooting" className="mt-4">
          <ClientTroubleshootingDialog />
        </TabsContent>

        <TabsContent value="water" className="mt-4">
          <WaterCalculator />
        </TabsContent>

        <TabsContent value="exercise" className="mt-4">
          <ExerciseGuide />
        </TabsContent>

        <TabsContent value="condiments" className="mt-4">
          <OPTAVIAReferenceGuide />
        </TabsContent>

        <TabsContent value="metabolic" className="mt-4">
          <MetabolicHealthInfo />
        </TabsContent>
      </Tabs>
    </div>
  )
}

