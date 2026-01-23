"use client"

import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { InviteManagement } from "@/components/invite-management"

export default function AdminInvitePage() {
  const router = useRouter()
  
  // Middleware now handles admin authentication - no need for client-side checks
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header activeTab="training" />
      <main className="flex-1 bg-white">
        <InviteManagement onClose={() => router.push("/training")} />
      </main>
      <Footer />
    </div>
  )
}

