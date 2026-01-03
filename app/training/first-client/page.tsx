"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { FirstClientContent } from "@/components/training/first-client-content"

export default function FirstClientPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-slate-200">
      <Header activeTab="training" />
      <main className="flex-1">
        <FirstClientContent />
      </main>
      <Footer />
    </div>
  )
}
