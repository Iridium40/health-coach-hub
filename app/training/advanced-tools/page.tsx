"use client"

import { TrainingModuleWrapper } from "@/components/training/training-module-wrapper"
import { AdvancedToolsContent } from "@/components/training/advanced-tools-content"

export default function AdvancedToolsPage() {
  return (
    <TrainingModuleWrapper
      moduleId="advanced-tools"
      moduleTitle="Advanced Tools"
      moduleDescription="Leverage technology and AI systems to scale your impact."
      phase="Phase 7: Legacy Building"
      moduleNumber="Module 7.2"
    >
      <AdvancedToolsContent />
    </TrainingModuleWrapper>
  )
}
