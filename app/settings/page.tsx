"use client"

import { Suspense, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { UserSettings } from "@/components/user-settings"
import { NotificationSettings } from "@/components/notification-settings"
import { ZoomSettings } from "@/components/zoom-settings"
import { useUserData } from "@/contexts/user-data-context"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { User, Bell, Video } from "lucide-react"

function SettingsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, authLoading, profile } = useUserData()

  const activeTab = searchParams.get("tab") || "profile"
  const isTrainingOnly = (profile?.org_id ?? 1) === 2

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login")
    }
  }, [authLoading, user, router])

  const handleTabChange = (value: string) => {
    router.replace(`/settings?tab=${value}`, { scroll: false })
  }

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

  // Show redirecting for unauthenticated users
  if (!user) {
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
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <h1 className="font-heading font-bold text-2xl sm:text-3xl text-optavia-dark mb-6">
            My Settings
          </h1>

          <Tabs value={activeTab} onValueChange={handleTabChange}>
            <TabsList className="w-full sm:w-auto mb-6 bg-gray-100 p-1 rounded-lg">
              <TabsTrigger
                value="profile"
                className="flex items-center gap-1.5 px-4 data-[state=active]:bg-white data-[state=active]:text-optavia-dark data-[state=active]:shadow-sm"
              >
                <User className="h-4 w-4" />
                <span>Profile</span>
              </TabsTrigger>
              <TabsTrigger
                value="notifications"
                className="flex items-center gap-1.5 px-4 data-[state=active]:bg-white data-[state=active]:text-optavia-dark data-[state=active]:shadow-sm"
              >
                <Bell className="h-4 w-4" />
                <span>Notifications</span>
              </TabsTrigger>
              {!isTrainingOnly && (
                <TabsTrigger
                  value="zoom"
                  className="flex items-center gap-1.5 px-4 data-[state=active]:bg-white data-[state=active]:text-optavia-dark data-[state=active]:shadow-sm"
                >
                  <Video className="h-4 w-4" />
                  <span>Zoom</span>
                </TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="profile">
              <UserSettings embedded />
            </TabsContent>

            <TabsContent value="notifications">
              <NotificationSettings embedded />
            </TabsContent>

            {!isTrainingOnly && (
              <TabsContent value="zoom">
                <ZoomSettings embedded />
              </TabsContent>
            )}
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default function SettingsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-white">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[hsl(var(--optavia-green))] mx-auto mb-4"></div>
            <p className="text-optavia-gray">Loading...</p>
          </div>
        </div>
      }
    >
      <SettingsContent />
    </Suspense>
  )
}
