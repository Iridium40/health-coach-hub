"use client"

import { Suspense } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Hero } from "@/components/hero"
import { ExternalResourcesTab } from "@/components/external-resources-tab"
import { Announcements } from "@/components/announcements"

function ExternalResourcesLoading() {
  return (
    <div className="text-center py-12">
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-56 mx-auto mb-4" />
        <div className="h-4 bg-gray-200 rounded w-96 mx-auto" />
      </div>
    </div>
  )
}

export default function ExternalResourcesPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header activeTab="external-resources" />
      <main className="flex-1 bg-white">
        <Hero />
        <Announcements />
        <div className="container mx-auto px-4 py-4 sm:py-8 bg-white">
          <Suspense fallback={<ExternalResourcesLoading />}>
            <ExternalResourcesTab mode="external-resources" />
          </Suspense>
        </div>
      </main>
      <Footer />
    </div>
  )
}

