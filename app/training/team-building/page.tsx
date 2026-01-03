"use client"

import { TrainingModuleWrapper } from "@/components/training/training-module-wrapper"
import { TeamBuildingContent } from "@/components/training/team-building-content"

export default function TeamBuildingPage() {
  return (
    <TrainingModuleWrapper
      moduleId="team-building"
      moduleTitle="Team Building Fundamentals"
      moduleDescription="Learn to sponsor and develop new coaches as you build toward FIBC."
      phase="Phase 5: ED to FIBC"
      moduleNumber="Module 5.1"
      nextModuleHref="/training/ten-x-system"
      nextModuleTitle="Next: The 10X System"
    >
      <TeamBuildingContent />
    </TrainingModuleWrapper>
  )
}
