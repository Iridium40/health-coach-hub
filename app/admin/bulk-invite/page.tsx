"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { BulkInviteManager } from "@/components/bulk-invite-manager"
import { Card, CardContent } from "@/components/ui/card"
import { AlertTriangle } from "lucide-react"
import Link from "next/link"

export default function AdminBulkInvitePage() {
  // Middleware now handles admin authentication - no need for client-side checks
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header activeTab="training" />
      <main className="flex-1 bg-white">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="mb-6">
            <h1 className="font-heading font-bold text-2xl sm:text-3xl text-optavia-dark">
              Bulk Invite Coaches
            </h1>
            <p className="text-optavia-gray mt-2">
              Upload a CSV file to send multiple coach invitations at once
            </p>
          </div>

          {/* Important Disclaimer */}
          <Card className="bg-amber-50 border border-amber-200 shadow-lg mb-6">
            <CardContent className="pt-6">
              <div className="flex gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-amber-800">Important Notice</p>
                  <p className="text-sm text-amber-700">
                    Only active <strong>OPTAVIA Health Coaches</strong> should be invited to become users of Coaching Amplifier. 
                    By sending invites, you certify that all persons in your upload are active OPTAVIA Coaches in good standing.
                  </p>
                  <div className="p-3 bg-amber-100 rounded-lg border border-amber-300">
                    <p className="text-sm font-semibold text-amber-900 mb-1">⚠️ Front-Line Coaches Only</p>
                    <p className="text-sm text-amber-800">
                      You should only invite coaches who are on your <strong>front line</strong> or coaches that you are the <strong>direct sponsor</strong> of. 
                      This ensures proper team structure and allows you to track their progress.
                    </p>
                  </div>
                  <p className="text-sm text-amber-700">
                    Please review our{" "}
                    <Link href="/terms" className="text-amber-800 underline hover:text-amber-900 font-medium">
                      Terms and Conditions
                    </Link>{" "}
                    for more information.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <BulkInviteManager />
        </div>
      </main>
      <Footer />
    </div>
  )
}
