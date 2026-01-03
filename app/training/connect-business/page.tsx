"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ConnectBusinessContent } from "@/components/training/connect-business-content"

export default function ConnectBusinessPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-slate-200">
      <Header activeTab="training" />
      <main className="flex-1">
        <ConnectBusinessContent />
      </main>
      <Footer />
    </div>
  )
}
