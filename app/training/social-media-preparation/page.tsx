"use client"

import { TrainingModuleWrapper } from "@/components/training/training-module-wrapper"
import { SocialMediaPreparationContent } from "@/components/training/social-media-preparation-content"

export default function SocialMediaPreparationPage() {
  return (
    <TrainingModuleWrapper
      moduleId="social-media-preparation"
      moduleTitle="Social Media Preparation"
      moduleDescription="Prepare everything you need for a successful, compliant social media launch announcement."
      phase="Phase 1: Pre-Launch"
      moduleNumber="Module 1.3"
      nextModuleHref="/training/understanding-health-assessment"
      nextModuleTitle="Next: Understanding Health Assessment"
    >
      <SocialMediaPreparationContent />
    </TrainingModuleWrapper>
  )
}
