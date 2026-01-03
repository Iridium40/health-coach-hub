"use client"

import { TrainingModuleWrapper } from "@/components/training/training-module-wrapper"
import { AdvancedClientSupportContent } from "@/components/training/advanced-client-support-content"

export default function AdvancedClientSupportPage() {
  return (
    <TrainingModuleWrapper
      moduleId="advanced-client-support"
      moduleTitle="Advanced Client Support"
      moduleDescription="Master client retention and results through VIP experiences and metabolic coaching expertise."
      phase="Phase 4: Using Connect"
      moduleNumber="Module 4.3"
      nextModuleHref="/training/team-building"
      nextModuleTitle="Next: Team Building Fundamentals"
    >
      <AdvancedClientSupportContent />
    </TrainingModuleWrapper>
  )
}
