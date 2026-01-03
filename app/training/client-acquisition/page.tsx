"use client"

import { TrainingModuleWrapper } from "@/components/training/training-module-wrapper"
import { ClientAcquisitionContent } from "@/components/training/client-acquisition-content"

export default function ClientAcquisitionPage() {
  return (
    <TrainingModuleWrapper
      moduleId="client-acquisition"
      moduleTitle="Client Acquisition Mastery"
      moduleDescription="Get confident doing Health Assessments independently through mindset training and practice."
      phase="Phase 3: Growing to Senior Coach"
      moduleNumber="Module 3.2"
      nextModuleHref="/training/business-model"
      nextModuleTitle="Next: Understanding the Business Model"
    >
      <ClientAcquisitionContent />
    </TrainingModuleWrapper>
  )
}
