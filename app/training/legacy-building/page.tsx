"use client"

import { TrainingModuleWrapper } from "@/components/training/training-module-wrapper"
import { LegacyBuildingContent } from "@/components/training/legacy-building-content"

export default function LegacyBuildingPage() {
  return (
    <TrainingModuleWrapper
      moduleId="legacy-building"
      moduleTitle="Legacy Building"
      moduleDescription="Create lasting impact and income through multiple FIBC teams."
      phase="Phase 7: Legacy Building"
      moduleNumber="Module 7.1"
      nextModuleHref="/training/advanced-tools"
      nextModuleTitle="Next: Advanced Tools"
    >
      <LegacyBuildingContent />
    </TrainingModuleWrapper>
  )
}
