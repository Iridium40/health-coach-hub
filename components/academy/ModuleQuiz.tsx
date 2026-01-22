"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { CheckCircle2, XCircle, AlertCircle } from "lucide-react"
import type { QuizQuestion } from "@/lib/academy-quiz-questions"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { getAcademyModuleNav, getRankDisplayName, ACADEMY_MODULES } from "@/lib/academy-utils"

interface ModuleQuizProps {
  moduleId: string
  questions: QuizQuestion[]
  userId: string
  userEmail?: string
  userName?: string
  userRank?: string | null
  moduleTitle?: string
  moduleNumber?: number
  onComplete: (passed: boolean) => void
  resourceId: string // Module resource ID to mark as complete
}

export function ModuleQuiz({ 
  moduleId, 
  questions, 
  userId, 
  userEmail,
  userName,
  userRank,
  moduleTitle,
  moduleNumber,
  onComplete, 
  resourceId 
}: ModuleQuizProps) {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, "A" | "B" | "C" | "D">>({})
  const [submitted, setSubmitted] = useState(false)
  const [score, setScore] = useState<number | null>(null)
  const [passed, setPassed] = useState(false)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleAnswerSelect = (questionId: string, answer: "A" | "B" | "C" | "D") => {
    if (submitted) return
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }))
  }

  const calculateScore = (): number => {
    let correct = 0
    questions.forEach(q => {
      if (selectedAnswers[q.id] === q.correctAnswer) {
        correct++
      }
    })
    return (correct / questions.length) * 100
  }

  const handleSubmit = async () => {
    // Check if all questions are answered
    if (Object.keys(selectedAnswers).length < questions.length) {
      toast({
        title: "Please answer all questions",
        description: "You must answer all questions before submitting.",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    const calculatedScore = calculateScore()
    const hasPassed = calculatedScore >= 80

    setScore(calculatedScore)
    setPassed(hasPassed)
    setSubmitted(true)

    // Save quiz attempt to database
    const supabase = createClient()
    const answers: Record<string, string> = {}
    const correctAnswers: Record<string, string> = {}
    
    questions.forEach(q => {
      answers[q.id] = selectedAnswers[q.id]
      correctAnswers[q.id] = q.correctAnswer
    })

    const { error } = await supabase
      .from("quiz_attempts")
      .upsert({
        user_id: userId,
        module_id: moduleId,
        score: calculatedScore,
        passed: hasPassed,
        answers,
        correct_answers: correctAnswers
      }, {
        onConflict: "user_id,module_id"
      })

    if (error) {
      console.error("Error saving quiz attempt:", error)
      toast({
        title: "Error saving results",
        description: "Your quiz results couldn't be saved, but you can still see your score.",
        variant: "destructive"
      })
    }

    // If passed, mark module resource as complete
    if (hasPassed) {
      const { error: progressError } = await supabase
        .from("user_progress")
        .upsert({
          user_id: userId,
          resource_id: resourceId,
          completed_at: new Date().toISOString()
        }, {
          onConflict: "user_id,resource_id"
        })

      if (progressError) {
        console.error("Error marking module complete:", progressError)
      }

      // Check if this unlocks a new module and send email
      if (userEmail && userName && moduleTitle && moduleNumber) {
        // Extract module number from moduleId (e.g., "academy-module-1" -> "module-1")
        const moduleMatch = moduleId.match(/module-(\d+)/)
        if (moduleMatch) {
          const currentModuleId = `module-${moduleMatch[1]}`
          const nav = getAcademyModuleNav(currentModuleId, userRank || null)

          // If there's a next module and user can access it, send unlock email
          if (nav.next && nav.canAccessNext && nav.nextRequiredRank) {
            const nextModule = ACADEMY_MODULES.find(m => m.id === currentModuleId)?.next
            const nextModuleData = ACADEMY_MODULES.find(m => m.id === nextModule)

            if (nextModuleData && nextModule) {
              const nextModuleNumber = parseInt(nextModule.replace('module-', ''), 10)
              const rankDisplayName = getRankDisplayName(nav.nextRequiredRank)

              // Send email asynchronously (don't wait for it)
              fetch('/api/send-module-completion-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  to: userEmail,
                  fullName: userName,
                  completedModuleTitle: moduleTitle,
                  completedModuleNumber: moduleNumber,
                  unlockedModuleTitle: nextModuleData.title,
                  unlockedModuleNumber: nextModuleNumber,
                  unlockedModuleRank: rankDisplayName
                })
              }).catch(error => {
                console.error("Error sending module completion email:", error)
                // Don't show error to user - email sending failure shouldn't block completion
              })
            }
          } else if (!nav.next) {
            // Last module completed - send completion email without unlock
            fetch('/api/send-module-completion-email', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                to: userEmail,
                fullName: userName,
                completedModuleTitle: moduleTitle,
                completedModuleNumber: moduleNumber
              })
            }).catch(error => {
              console.error("Error sending module completion email:", error)
            })
          }
        }
      }
    }

    setLoading(false)
    onComplete(hasPassed)

    if (hasPassed) {
      toast({
        title: "🎉 Congratulations!",
        description: `You passed with ${calculatedScore.toFixed(0)}%! This module has been marked as complete.`,
      })
    } else {
      toast({
        title: "Quiz not passed",
        description: `You scored ${calculatedScore.toFixed(0)}%. You need 80% to pass. Review the material and try again!`,
        variant: "destructive"
      })
    }
  }

  const getAnswerClass = (question: QuizQuestion, option: "A" | "B" | "C" | "D") => {
    if (!submitted) {
      return selectedAnswers[question.id] === option
        ? "bg-[hsl(var(--optavia-green-light))] border-[hsl(var(--optavia-green))] text-[hsl(var(--optavia-green))]"
        : "border-gray-300 hover:border-[hsl(var(--optavia-green))] hover:bg-gray-50"
    }

    const isSelected = selectedAnswers[question.id] === option
    const isCorrect = option === question.correctAnswer

    if (isCorrect) {
      return "bg-green-100 border-green-500 text-green-800"
    }
    if (isSelected && !isCorrect) {
      return "bg-red-100 border-red-500 text-red-800"
    }
    return "border-gray-300 bg-gray-50 text-gray-600"
  }

  return (
    <Card className="bg-white border border-[hsl(var(--optavia-border))] rounded-2xl p-6 md:p-8 my-8">
      <div className="mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-optavia-dark mb-2">
          📝 Module Quiz
        </h2>
        <p className="text-optavia-gray">
          Answer all questions to complete this module. You need 80% or higher to pass.
        </p>
      </div>

      <div className="space-y-8 mb-8">
        {questions.map((question, index) => (
          <div key={question.id} className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-[hsl(var(--optavia-green))] text-white rounded-lg flex items-center justify-center font-bold flex-shrink-0">
                {index + 1}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-optavia-dark mb-4">
                  {question.question}
                </h3>
                <div className="space-y-3">
                  {(["A", "B", "C", "D"] as const).map(option => (
                    <button
                      key={option}
                      onClick={() => handleAnswerSelect(question.id, option)}
                      disabled={submitted}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                        submitted ? "cursor-default" : "cursor-pointer"
                      } ${getAnswerClass(question, option)}`}
                    >
                      <div className="flex items-center gap-3">
                        {submitted && option === question.correctAnswer && (
                          <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                        )}
                        {submitted && selectedAnswers[question.id] === option && option !== question.correctAnswer && (
                          <XCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                        )}
                        <span className="font-semibold mr-2">{option}.</span>
                        <span>{question.options[option]}</span>
                      </div>
                    </button>
                  ))}
                </div>
                {submitted && question.explanation && (
                  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-blue-800">{question.explanation}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {!submitted && (
        <div className="flex justify-end">
          <Button
            onClick={handleSubmit}
            disabled={Object.keys(selectedAnswers).length < questions.length}
            className="bg-[hsl(var(--optavia-green))] hover:bg-[hsl(var(--optavia-green-dark))] text-white px-8 py-6 text-lg"
          >
            Submit Quiz
          </Button>
        </div>
      )}

      {submitted && score !== null && (
        <div className={`rounded-2xl p-6 text-center ${
          passed
            ? "bg-green-50 border-2 border-green-500"
            : "bg-red-50 border-2 border-red-500"
        }`}>
          <div className="text-4xl mb-2">{passed ? "🎉" : "📚"}</div>
          <h3 className={`text-2xl font-bold mb-2 ${
            passed ? "text-green-800" : "text-red-800"
          }`}>
            {passed ? "Congratulations! You Passed!" : "Quiz Not Passed"}
          </h3>
          <p className={`text-xl mb-4 ${
            passed ? "text-green-700" : "text-red-700"
          }`}>
            Your Score: {score.toFixed(1)}%
          </p>
          <p className={`text-sm ${
            passed ? "text-green-600" : "text-red-600"
          }`}>
            {passed
              ? "You've successfully completed this module! Review the content anytime to reinforce your learning."
              : `You need 80% to pass. Review the material and retake the quiz to complete this module.`
            }
          </p>
          {!passed && (
            <Button
              onClick={() => {
                setSubmitted(false)
                setSelectedAnswers({})
                setScore(null)
                setPassed(false)
              }}
              className="mt-4 bg-[hsl(var(--optavia-green))] hover:bg-[hsl(var(--optavia-green-dark))]"
            >
              Retake Quiz
            </Button>
          )}
        </div>
      )}
    </Card>
  )
}
