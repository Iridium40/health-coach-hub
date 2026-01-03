"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { FirstClientConversationsContent } from "@/components/training/first-client-conversations-content"

export default function FirstClientConversationsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-slate-200">
      <Header activeTab="training" />
      <main className="flex-1">
        <FirstClientConversationsContent />
      </main>
      <Footer />
    </div>
  )
}
