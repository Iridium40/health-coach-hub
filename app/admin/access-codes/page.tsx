"use client"

import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { AdminAccessCodes } from "@/components/admin-access-codes"

export default function AdminAccessCodesPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-1 bg-white">
        <AdminAccessCodes onClose={() => router.push("/dashboard")} />
      </main>
      <Footer />
    </div>
  )
}
