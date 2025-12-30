"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Hero } from "@/components/hero"
import { ExternalResourcesTab } from "@/components/external-resources-tab"
import { Announcements } from "@/components/announcements"
import { useAuth } from "@/hooks/use-auth"
import { useSupabaseData } from "@/hooks/use-supabase-data"

export default function ResourcesPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { profile, loading: dataLoading } = useSupabaseData(user)

  useEffect(() => {
    if (authLoading || dataLoading) return

    if (!user) {
      router.push("/login")
      return
    }

    if (user && !profile) {
      router.push("/")
      return
    }
  }, [user, profile, authLoading, dataLoading, router])

  if (authLoading || dataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[hsl(var(--optavia-green))] mx-auto mb-4"></div>
          <p className="text-optavia-gray">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header activeTab="resources" />
      <main className="flex-1 bg-white">
        <Hero />
        <Announcements />
        <div className="container mx-auto px-4 py-4 sm:py-8 bg-white">
          <ExternalResourcesTab />
        </div>
      </main>
      <Footer />
    </div>
  )
}

