"use client"

import { TrainingModuleWrapper } from "@/components/training/training-module-wrapper"
import { ScalingYourBusinessContent } from "@/components/training/scaling-your-business-content"

export default function ScalingYourBusinessPage() {
  return (
    <TrainingModuleWrapper
      moduleId="scaling-your-business"
      moduleTitle="Scaling Your Business"
      moduleDescription="Build systems that work without you."
      phase="Phase 6: Leadership"
      moduleNumber="Module 6.2"
      nextModuleHref="/training/legacy-building"
      nextModuleTitle="Next: Legacy Building"
    >
      <ScalingYourBusinessContent />
    </TrainingModuleWrapper>
  )
}
