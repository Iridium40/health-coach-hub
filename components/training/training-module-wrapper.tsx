"use client"

import { ReactNode } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ModuleQuiz } from "@/components/training/module-quiz"
import { getModuleQuiz } from "@/lib/quiz-data"
import { ChevronRight, Clock, Award } from "lucide-react"
import Link from "next/link"

interface TrainingModuleWrapperProps {
  moduleId: string
  moduleTitle: string
  moduleDescription: string
  phase: string
  moduleNumber: string
  children: ReactNode
  nextModuleHref?: string
  nextModuleTitle?: string
}

export function TrainingModuleWrapper({
  moduleId,
  moduleTitle,
  moduleDescription,
  phase,
  moduleNumber,
  children,
  nextModuleHref,
  nextModuleTitle
}: TrainingModuleWrapperProps) {
  const quiz = getModuleQuiz(moduleId)

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-green-50 to-slate-50">
      <Header activeTab="training" />
      <main className="flex-1">
        {/* Header */}
        <div className="bg-gradient-to-r from-[hsl(var(--optavia-green))] to-[#008542] text-white py-8 shadow-lg">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center gap-2 text-sm opacity-90 mb-2 uppercase tracking-wide">
                <span>Training Center</span>
                <ChevronRight className="h-4 w-4" />
                <span>{phase}</span>
                <ChevronRight className="h-4 w-4" />
                <span className="font-semibold">{moduleNumber}</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">{moduleTitle}</h1>
              <p className="text-lg opacity-90 max-w-2xl">{moduleDescription}</p>
              
              {/* Module info badges */}
              <div className="flex items-center gap-4 mt-4">
                <div className="flex items-center gap-2 bg-white/20 rounded-full px-3 py-1 text-sm">
                  <Clock className="h-4 w-4" />
                  <span>~15 min</span>
                </div>
                {quiz && (
                  <div className="flex items-center gap-2 bg-white/20 rounded-full px-3 py-1 text-sm">
                    <Award className="h-4 w-4" />
                    <span>3 Question Quiz</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            {/* Main Content */}
            {children}

            {/* Knowledge Check Quiz */}
            {quiz && (
              <div className="mt-12 pt-8 border-t-2 border-gray-200">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-optavia-dark flex items-center gap-2">
                    <Award className="h-6 w-6 text-[hsl(var(--optavia-green))]" />
                    Knowledge Check
                  </h2>
                  <p className="text-optavia-gray mt-2">
                    Test your understanding with these 3 quick questions (~5 minutes).
                    You need 70% to pass.
                  </p>
                </div>
                <ModuleQuiz
                  moduleId={quiz.moduleId}
                  moduleTitle={quiz.moduleTitle}
                  questions={quiz.questions}
                />
              </div>
            )}

            {/* Footer Navigation */}
            <div className="flex justify-between items-center mt-12 pt-8 border-t border-gray-300">
              <Link
                href="/training"
                className="flex items-center gap-2 text-optavia-gray hover:text-[hsl(var(--optavia-green))] font-semibold"
              >
                ← Back to Training Center
              </Link>
              {nextModuleHref && nextModuleTitle && (
                <Link
                  href={nextModuleHref}
                  className="flex items-center gap-2 text-[hsl(var(--optavia-green))] hover:text-[hsl(var(--optavia-green-dark))] font-semibold"
                >
                  {nextModuleTitle}
                  <ChevronRight className="h-4 w-4" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
