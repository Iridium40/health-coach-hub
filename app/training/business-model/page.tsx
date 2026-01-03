"use client"

import { TrainingModuleWrapper } from "@/components/training/training-module-wrapper"
import { BusinessModelContent } from "@/components/training/business-model-content"

export default function BusinessModelPage() {
  return (
    <TrainingModuleWrapper
      moduleId="business-model"
      moduleTitle="Understanding the Business Model"
      moduleDescription="Know how you get paid and what drives your income in OPTAVIA."
      phase="Phase 3: Growing to Senior Coach"
      moduleNumber="Module 3.3"
      nextModuleHref="/training/connect-business"
      nextModuleTitle="Next: Using Connect for Business"
    >
      <BusinessModelContent />
    </TrainingModuleWrapper>
  )
}
