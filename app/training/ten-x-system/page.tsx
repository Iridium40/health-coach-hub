"use client"

import { TrainingModuleWrapper } from "@/components/training/training-module-wrapper"
import { TenXSystemContent } from "@/components/training/ten-x-system-content"

export default function TenXSystemPage() {
  return (
    <TrainingModuleWrapper
      moduleId="ten-x-system"
      moduleTitle="The 10X System"
      moduleDescription="Implement high-accountability coaching systems that multiply your results."
      phase="Phase 5: ED to FIBC"
      moduleNumber="Module 5.2"
      nextModuleHref="/training/leadership-development"
      nextModuleTitle="Next: Leadership Development"
    >
      <TenXSystemContent />
    </TrainingModuleWrapper>
  )
}
