"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { AdvancedClientSupportContent } from "@/components/training/advanced-client-support-content"

export default function AdvancedClientSupportPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-slate-200">
      <Header activeTab="training" />
      <main className="flex-1">
        <AdvancedClientSupportContent />
      </main>
      <Footer />
    </div>
  )
}
