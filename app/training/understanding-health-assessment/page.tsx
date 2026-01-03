"use client"

import { TrainingModuleWrapper } from "@/components/training/training-module-wrapper"
import { UnderstandingHealthAssessmentContent } from "@/components/training/understanding-health-assessment-content"

export default function UnderstandingHealthAssessmentPage() {
  return (
    <TrainingModuleWrapper
      moduleId="understanding-health-assessment"
      moduleTitle="Understanding the Health Assessment"
      moduleDescription="Learn before you observe - understand what you'll see your mentors doing so you can learn effectively."
      phase="Phase 1: Pre-Launch"
      moduleNumber="Module 1.4"
      nextModuleHref="/training/social-media-posting"
      nextModuleTitle="Next: Social Media Posting"
    >
      <UnderstandingHealthAssessmentContent />
    </TrainingModuleWrapper>
  )
}
