"use client"

import { TrainingModuleWrapper } from "@/components/training/training-module-wrapper"
import { SocialMediaPostingContent } from "@/components/training/social-media-posting-content"

export default function SocialMediaPostingPage() {
  return (
    <TrainingModuleWrapper
      moduleId="social-media-posting"
      moduleTitle="Social Media Posting"
      moduleDescription="Execute your social media launch and work the responses to turn engagement into clients."
      phase="Phase 1: Launch Week"
      moduleNumber="Module 1.5"
      nextModuleHref="/training/first-client-conversations"
      nextModuleTitle="Next: First Client Conversations"
    >
      <SocialMediaPostingContent />
    </TrainingModuleWrapper>
  )
}
