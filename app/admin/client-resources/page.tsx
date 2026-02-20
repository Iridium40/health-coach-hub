"use client"

import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { AdminClientResources } from "@/components/admin-client-resources"

export default function AdminClientResourcesPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-1 bg-white">
        <AdminClientResources onClose={() => router.push("/dashboard")} />
      </main>
      <Footer />
    </div>
  )
}
