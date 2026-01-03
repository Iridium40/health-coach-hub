"use client"

import { TrainingModuleWrapper } from "@/components/training/training-module-wrapper"
import { ClientResourcesContent } from "@/components/training/client-resources-content"

export default function ClientResourcesPage() {
  return (
    <TrainingModuleWrapper
      moduleId="client-resources"
      moduleTitle="Client Resources to Share"
      moduleDescription="Know what resources to send clients and when. Your complete guide library with sharing scripts."
      phase="Phase 2: First 30 Days"
      moduleNumber="Module 2.2"
      nextModuleHref="/training/thirty-day-evaluation"
      nextModuleTitle="Next: 30-Day Evaluation"
    >
      <ClientResourcesContent />
    </TrainingModuleWrapper>
  )
}
