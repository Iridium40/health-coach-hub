"use client"

import { useEffect, useState, type ReactNode } from "react"
import { useRouter, useParams } from "next/navigation"
import dynamic from "next/dynamic"
import Link from "next/link"
import { ArrowLeft, Lock, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useUserData } from "@/contexts/user-data-context"
import { canAccessModule, getAcademyModuleNav, getRankDisplayName } from "@/lib/academy-utils"
import { createClient } from "@/lib/supabase/client"
import type { Module } from "@/lib/types"
import { ACADEMY_QUIZZES } from "@/lib/academy-quiz-questions"
import { ModuleQuiz } from "@/components/academy/ModuleQuiz"

// Dynamic imports for module content components - improves bundle size
const Module1Content = dynamic(() => import("@/components/academy/module-1-content").then(mod => ({ default: mod.Module1Content })), {
  loading: () => <div className="text-center py-8">Loading module content...</div>
})
const Module2Content = dynamic(() => import("@/components/academy/module-2-content").then(mod => ({ default: mod.Module2Content })), {
  loading: () => <div className="text-center py-8">Loading module content...</div>
})
const Module3Content = dynamic(() => import("@/components/academy/module-3-content").then(mod => ({ default: mod.Module3Content })), {
  loading: () => <div className="text-center py-8">Loading module content...</div>
})
const Module4Content = dynamic(() => import("@/components/academy/module-4-content").then(mod => ({ default: mod.Module4Content })), {
  loading: () => <div className="text-center py-8">Loading module content...</div>
})
const Module5Content = dynamic(() => import("@/components/academy/module-5-content").then(mod => ({ default: mod.Module5Content })), {
  loading: () => <div className="text-center py-8">Loading module content...</div>
})
const Module6Content = dynamic(() => import("@/components/academy/module-6-content").then(mod => ({ default: mod.Module6Content })), {
  loading: () => <div className="text-center py-8">Loading module content...</div>
})

export default function AcademyModulePage() {
  const params = useParams()
  const router = useRouter()
  const { user, profile, authLoading } = useUserData()
  const [module, setModule] = useState<Module | null>(null)
  const [loading, setLoading] = useState(true)
  const [moduleContent, setModuleContent] = useState<ReactNode | null>(null)
  const [quizPassed, setQuizPassed] = useState<boolean | null>(null)
  const [quizLoading, setQuizLoading] = useState(true)
  const [resourceId, setResourceId] = useState<string>("")

  const moduleId = params?.['module-id'] as string
  const quizQuestions = moduleId ? ACADEMY_QUIZZES[moduleId] || [] : []

  useEffect(() => {
    if (!moduleId) return

    loadModule()
    loadQuizStatus()
  }, [moduleId, user?.id])

  const loadModule = async () => {
    setLoading(true)
    const supabase = createClient()

    // Find the module from modules table
    const { data, error } = await supabase
      .from("modules")
      .select("*")
      .eq("id", `academy-${moduleId}`)
      .single()

    if (error || !data) {
      console.error("Error loading module:", error)
      setLoading(false)
      return
    }

    const loadedModule: Module = {
      id: data.id,
      title: data.title,
      description: data.description,
      category: data.category as Module["category"],
      order: data.sort_order,
      forNewCoach: data.for_new_coach,
      icon: data.icon,
      resources: [], // Resources loaded separately if needed
      required_rank: (data as any).required_rank || null,
    }

    setModule(loadedModule)
    setResourceId(`academy-resource-${moduleId.split('-')[1]}`)
    setLoading(false)

    // Set module content based on module ID
    switch (moduleId) {
      case "module-1":
        setModuleContent(<Module1Content />)
        break
      case "module-2":
        setModuleContent(<Module2Content />)
        break
      case "module-3":
        setModuleContent(<Module3Content />)
        break
      case "module-4":
        setModuleContent(<Module4Content />)
        break
      case "module-5":
        setModuleContent(<Module5Content />)
        break
      case "module-6":
        setModuleContent(<Module6Content />)
        break
      default:
        setModuleContent(null)
    }
  }

  const loadQuizStatus = async () => {
    if (!user?.id || !moduleId) {
      setQuizLoading(false)
      return
    }

    setQuizLoading(true)
    const supabase = createClient()

    const { data, error } = await supabase
      .from("quiz_attempts")
      .select("passed")
      .eq("user_id", user.id)
      .eq("module_id", `academy-${moduleId}`)
      .single()

    if (error && error.code !== "PGRST116") {
      console.error("Error loading quiz status:", error)
    }

    setQuizPassed(data?.passed || false)
    setQuizLoading(false)
  }

  const handleQuizComplete = (passed: boolean) => {
    setQuizPassed(passed)
    if (passed) {
      // Refresh user data to reflect module completion
      if (window.location.reload) {
        // Small delay to ensure DB write completes
        setTimeout(() => {
          window.location.reload()
        }, 1000)
      }
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[hsl(var(--optavia-green))] mx-auto mb-4"></div>
          <p className="text-optavia-gray">Loading...</p>
        </div>
      </div>
    )
  }

  if (!module) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4 text-optavia-dark">Module Not Found</h1>
          <p className="text-optavia-gray mb-6">The requested module could not be found.</p>
          <Link href="/training">
            <Button className="bg-[hsl(var(--optavia-green))] hover:bg-[hsl(var(--optavia-green-dark))]">Back to Training</Button>
          </Link>
        </div>
      </div>
    )
  }

  // Check access control
  const userRank = profile?.coach_rank || null
  const canAccess = canAccessModule(userRank, module.required_rank || null)

  if (!canAccess) {
    const nav = getAcademyModuleNav(moduleId, userRank)
    const requiredRankDisplay = getRankDisplayName(module.required_rank || "Unknown")

    return (
      <div className="min-h-screen bg-white">
        {/* Navigation */}
        <nav className="bg-white border-b border-[hsl(var(--optavia-border))] sticky top-0 z-50">
          <div className="container max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
            <Link href="/training" className="flex items-center gap-2 text-optavia-gray hover:text-[hsl(var(--optavia-green))] transition-colors">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Training</span>
            </Link>
          </div>
        </nav>

        {/* Locked Content */}
        <div className="container max-w-4xl mx-auto px-6 py-16">
          <div className="bg-white border border-[hsl(var(--optavia-border))] rounded-2xl p-12 text-center shadow-lg">
            <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <Lock className="h-10 w-10 text-optavia-gray" />
            </div>
            <h1 className="text-3xl font-bold mb-4 text-optavia-dark">{module.title}</h1>
            <p className="text-xl text-optavia-gray mb-8">{module.description}</p>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 max-w-2xl mx-auto">
              <p className="text-lg mb-2 text-optavia-dark">
                You must achieve <strong className="text-amber-600">{requiredRankDisplay}</strong> rank to access this module.
              </p>
              <p className="text-optavia-gray">
                {nav.prev ? (
                  <>Complete the previous module and achieve the required rank to unlock this content.</>
                ) : (
                  <>Work on achieving the required rank to unlock this training module.</>
                )}
              </p>
            </div>
            <div className="mt-8">
              <Link href="/training">
                <Button className="bg-[hsl(var(--optavia-green))] hover:bg-[hsl(var(--optavia-green-dark))]">Back to Training</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const nav = getAcademyModuleNav(moduleId, userRank)

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white border-b border-[hsl(var(--optavia-border))] sticky top-0 z-50">
        <div className="container max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/training" className="flex items-center gap-2 text-optavia-gray hover:text-[hsl(var(--optavia-green))] transition-colors">
            <ArrowLeft className="h-4 w-4" />
            <span>All Modules</span>
          </Link>
        </div>
      </nav>

      {/* Module Header */}
      <header className="container max-w-4xl mx-auto px-6 py-12">
        <div className="inline-flex items-center gap-2 bg-[hsl(var(--optavia-green-light))] border border-[hsl(var(--optavia-green))] text-[hsl(var(--optavia-green))] px-4 py-2 rounded-full text-sm font-semibold mb-4">
          <span>Module {moduleId.split('-')[1]}</span>
          {module.required_rank && (
            <>
              <span>•</span>
              <span>{getRankDisplayName(module.required_rank)}</span>
            </>
          )}
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-optavia-dark">
          {module.title}
        </h1>
        <p className="text-xl text-optavia-gray max-w-3xl">{module.description}</p>
      </header>

      {/* Module Content */}
      <div className="container max-w-4xl mx-auto px-6 pb-16">
        {moduleContent}

        {/* Quiz Section */}
        {quizLoading ? (
          <div className="my-8 text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[hsl(var(--optavia-green))] mx-auto mb-4"></div>
            <p className="text-optavia-gray">Loading quiz...</p>
          </div>
        ) : quizPassed ? (
          <div className="bg-green-50 border-2 border-green-500 rounded-2xl p-8 my-8 text-center">
            <CheckCircle2 className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-green-800 mb-2">Module Complete!</h3>
            <p className="text-green-700 mb-4">
              You've successfully passed the quiz for this module. Great work!
            </p>
            <p className="text-sm text-green-600">
              You can review the content anytime, but the quiz has been completed.
            </p>
          </div>
        ) : quizQuestions.length > 0 && user?.id ? (
          <ModuleQuiz
            moduleId={`academy-${moduleId}`}
            questions={quizQuestions}
            userId={user.id}
            userEmail={profile?.email || undefined}
            userName={profile?.full_name || undefined}
            userRank={profile?.coach_rank || null}
            moduleTitle={module.title}
            moduleNumber={parseInt(moduleId.replace('module-', ''), 10)}
            resourceId={resourceId}
            onComplete={handleQuizComplete}
          />
        ) : null}
      </div>

      {/* Navigation Footer */}
      <div className="container max-w-4xl mx-auto px-6 pb-12">
        <div className="flex justify-between gap-4 pt-8 border-t border-[hsl(var(--optavia-border))]">
          {nav.prev ? (
            <Link href={nav.prev}>
              <Button variant="outline" className="border-[hsl(var(--optavia-border))] text-optavia-dark hover:bg-gray-50">
                ← Previous Module
              </Button>
            </Link>
          ) : (
            <div></div>
          )}

          {nav.next ? (
            nav.canAccessNext ? (
              <Link href={nav.next}>
                <Button className="bg-[hsl(var(--optavia-green))] hover:bg-[hsl(var(--optavia-green-dark))]">
                  Next Module →
                </Button>
              </Link>
            ) : (
              <div className="flex flex-col items-end">
                <Button disabled className="bg-gray-200 text-gray-400 cursor-not-allowed">
                  Next Module →
                </Button>
                <p className="text-xs text-optavia-light-gray mt-2">
                  Requires {getRankDisplayName(nav.nextRequiredRank || "")} rank
                </p>
              </div>
            )
          ) : (
            moduleId === "module-6" && (
              <Link href="/training">
                <Button className="bg-[hsl(var(--optavia-green))] hover:bg-[hsl(var(--optavia-green-dark))]">
                  ✓ Complete Training Guide
                </Button>
              </Link>
            )
          )}
        </div>
      </div>
    </div>
  )
}
