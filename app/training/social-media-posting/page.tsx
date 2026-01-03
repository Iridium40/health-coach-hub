"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { SocialMediaPostingContent } from "@/components/training/social-media-posting-content"

export default function SocialMediaPostingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-slate-200">
      <Header activeTab="training" />
      <main className="flex-1">
        <SocialMediaPostingContent />
      </main>
      <Footer />
    </div>
  )
}
