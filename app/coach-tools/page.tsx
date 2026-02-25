"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Hero } from "@/components/hero"
import { Announcements } from "@/components/announcements"
import { SocialMediaPromptGenerator } from "@/components/social-media-prompt-generator"

export default function CoachToolsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header activeTab="coach-tools" />
      <main className="flex-1 bg-white">
        <Hero />
        <Announcements />
        <div className="container mx-auto px-4 py-4 sm:py-8 bg-white">
          <div className="text-center py-2 sm:py-4 mb-6">
            <h1 className="font-heading font-bold text-2xl sm:text-3xl text-optavia-dark mb-2">
              Post Generator
            </h1>
            <p className="text-optavia-gray text-sm sm:text-base max-w-2xl mx-auto">
              Use the Social Media Post Generator to create engaging social posts from your phone.
            </p>
          </div>
          <SocialMediaPromptGenerator layout="page" />
        </div>
      </main>
      <Footer />
    </div>
  )
}

