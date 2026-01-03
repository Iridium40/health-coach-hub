"use client"

import { TrainingModuleWrapper } from "@/components/training/training-module-wrapper"
import { LeadershipDevelopmentContent } from "@/components/training/leadership-development-content"

export default function LeadershipDevelopmentPage() {
  return (
    <TrainingModuleWrapper
      moduleId="leadership-development"
      moduleTitle="Leadership Development"
      moduleDescription="Develop leaders on your team who can develop leaders."
      phase="Phase 6: Leadership"
      moduleNumber="Module 6.1"
      nextModuleHref="/training/scaling-your-business"
      nextModuleTitle="Next: Scaling Your Business"
    >
      <LeadershipDevelopmentContent />
    </TrainingModuleWrapper>
  )
}
