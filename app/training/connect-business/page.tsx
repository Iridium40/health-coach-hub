"use client"

import { TrainingModuleWrapper } from "@/components/training/training-module-wrapper"
import { ConnectBusinessContent } from "@/components/training/connect-business-content"

export default function ConnectBusinessPage() {
  return (
    <TrainingModuleWrapper
      moduleId="connect-business"
      moduleTitle="Using Connect for Business Intelligence"
      moduleDescription="Master OPTAVIA Connect to manage, track, and grow your business strategically."
      phase="Phase 4: Using Connect"
      moduleNumber="Module 4.1"
      nextModuleHref="/training/business-planning"
      nextModuleTitle="Next: Business Planning"
    >
      <ConnectBusinessContent />
    </TrainingModuleWrapper>
  )
}
