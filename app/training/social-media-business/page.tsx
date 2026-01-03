"use client"

import { TrainingModuleWrapper } from "@/components/training/training-module-wrapper"
import { SocialMediaBusinessContent } from "@/components/training/social-media-business-content"

export default function SocialMediaBusinessPage() {
  return (
    <TrainingModuleWrapper
      moduleId="social-media-business"
      moduleTitle="Social Media for Business Growth"
      moduleDescription="Use social media consistently to attract clients and grow your coaching business."
      phase="Phase 3: Growing to Senior Coach"
      moduleNumber="Module 3.1"
      nextModuleHref="/training/client-acquisition"
      nextModuleTitle="Next: Client Acquisition Mastery"
    >
      <SocialMediaBusinessContent />
    </TrainingModuleWrapper>
  )
}
