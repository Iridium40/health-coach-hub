"use client"

import { TrainingModuleWrapper } from "@/components/training/training-module-wrapper"
import { ThirtyDayEvaluationContent } from "@/components/training/thirty-day-evaluation-content"

export default function ThirtyDayEvaluationPage() {
  return (
    <TrainingModuleWrapper
      moduleId="thirty-day-evaluation"
      moduleTitle="Your 30-Day Evaluation"
      moduleDescription="Assess your first month, celebrate wins, and set goals for your path to Senior Coach."
      phase="Phase 2: First 30 Days"
      moduleNumber="Module 2.3"
      nextModuleHref="/training/social-media-business"
      nextModuleTitle="Next: Social Media for Business Growth"
    >
      <ThirtyDayEvaluationContent />
    </TrainingModuleWrapper>
  )
}
