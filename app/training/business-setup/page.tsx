"use client"

import { TrainingModuleWrapper } from "@/components/training/training-module-wrapper"
import { BusinessSetupContent } from "@/components/training/business-setup-content"

export default function BusinessSetupPage() {
  return (
    <TrainingModuleWrapper
      moduleId="business-setup"
      moduleTitle="Business Setup"
      moduleDescription="Get your coaching business officially set up with payment, website, and professional branding."
      phase="Phase 1: Pre-Launch"
      moduleNumber="Module 1.2"
      nextModuleHref="/training/social-media-preparation"
      nextModuleTitle="Next: Social Media Preparation"
    >
      <BusinessSetupContent />
    </TrainingModuleWrapper>
  )
}
