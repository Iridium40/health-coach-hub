"use client"

import { TrainingModuleWrapper } from "@/components/training/training-module-wrapper"
import { FirstClientContent } from "@/components/training/first-client-content"

export default function FirstClientPage() {
  return (
    <TrainingModuleWrapper
      moduleId="first-client"
      moduleTitle="When You Get Your First Client"
      moduleDescription="Know exactly how to launch and support a new client for success. Checklists, schedules, and scripts ready to use!"
      phase="Phase 2: First 30 Days"
      moduleNumber="Module 2.1"
      nextModuleHref="/training/client-resources"
      nextModuleTitle="Next: Client Resources"
    >
      <FirstClientContent />
    </TrainingModuleWrapper>
  )
}
