"use client"

import { TrainingModuleWrapper } from "@/components/training/training-module-wrapper"
import { BusinessPlanningContent } from "@/components/training/business-planning-content"

export default function BusinessPlanningPage() {
  return (
    <TrainingModuleWrapper
      moduleId="business-planning"
      moduleTitle="Business Planning"
      moduleDescription="Create intentional plans for rank advancement with proven tools and frameworks."
      phase="Phase 4: Using Connect"
      moduleNumber="Module 4.2"
      nextModuleHref="/training/advanced-client-support"
      nextModuleTitle="Next: Advanced Client Support"
    >
      <BusinessPlanningContent />
    </TrainingModuleWrapper>
  )
}
