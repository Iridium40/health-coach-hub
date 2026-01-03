"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ClientAcquisitionContent } from "@/components/training/client-acquisition-content"

export default function ClientAcquisitionPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-slate-200">
      <Header activeTab="training" />
      <main className="flex-1">
        <ClientAcquisitionContent />
      </main>
      <Footer />
    </div>
  )
}
