"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { AdminAnnouncements } from "@/components/admin-announcements"
import { useUserData } from "@/contexts/user-data-context"

export default function AdminAnnouncementsPage() {
  const router = useRouter()
  const { authLoading, profile } = useUserData()

  const isAdmin = profile?.user_role?.toLowerCase() === "admin"

  // Redirect non-admins to training
  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.replace("/training")
    }
  }, [authLoading, isAdmin, router])

  // Show loading only during initial auth check
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[hsl(var(--optavia-green))] mx-auto mb-4"></div>
          <p className="text-optavia-gray">Loading...</p>
        </div>
      </div>
    )
  }

  // Show redirecting for non-admins
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[hsl(var(--optavia-green))] mx-auto mb-4"></div>
          <p className="text-optavia-gray">Redirecting...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header activeTab="training" />
      <main className="flex-1 bg-white">
        <AdminAnnouncements onClose={() => router.push("/training")} />
      </main>
      <Footer />
    </div>
  )
}

