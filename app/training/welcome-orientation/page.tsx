"use client"

import { TrainingModuleWrapper } from "@/components/training/training-module-wrapper"
import { WelcomeOrientationContent } from "@/components/training/welcome-orientation-content"

export default function WelcomeOrientationPage() {
  return (
    <TrainingModuleWrapper
      moduleId="welcome-orientation"
      moduleTitle="Welcome & Orientation"
      moduleDescription="Set expectations, understand the apprenticeship model, and get excited about your coaching journey!"
      phase="Phase 1: Pre-Launch"
      moduleNumber="Module 1.1"
      nextModuleHref="/training/business-setup"
      nextModuleTitle="Next: Business Setup"
    >
      <WelcomeOrientationContent />
    </TrainingModuleWrapper>
  )
}
