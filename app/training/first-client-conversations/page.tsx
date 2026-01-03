"use client"

import { TrainingModuleWrapper } from "@/components/training/training-module-wrapper"
import { FirstClientConversationsContent } from "@/components/training/first-client-conversations-content"

export default function FirstClientConversationsPage() {
  return (
    <TrainingModuleWrapper
      moduleId="first-client-conversations"
      moduleTitle="First Client Conversations"
      moduleDescription="Learn by doing WITH your mentor. Master the scripts and frameworks that turn conversations into clients."
      phase="Phase 1: Launch Week"
      moduleNumber="Module 1.6"
      nextModuleHref="/training/first-client"
      nextModuleTitle="Next: When You Get Your First Client"
    >
      <FirstClientConversationsContent />
    </TrainingModuleWrapper>
  )
}
