"use client"

import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { AdminDashboardButtons } from "@/components/admin-dashboard-buttons"

export default function AdminDashboardButtonsPage() {
  const router = useRouter()

  // Middleware handles admin authentication
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-1 bg-white">
        <AdminDashboardButtons onClose={() => router.push("/dashboard")} />
      </main>
      <Footer />
    </div>
  )
}
