"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, XCircle, Clock, Award, RotateCcw, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

export interface QuizQuestion {
  id: string
  question: string
  options: string[]
  correctAnswer: number // Index of correct option
  explanation?: string
}

interface ModuleQuizProps {
  moduleId: string
  moduleTitle: string
  questions: QuizQuestion[]
  onComplete?: (score: number, total: number) => void
}

export function ModuleQuiz({ moduleId, moduleTitle, questions, onComplete }: ModuleQuizProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [answers, setAnswers] = useState<(number | null)[]>(new Array(questions.length).fill(null))
  const [isComplete, setIsComplete] = useState(false)
  const [startTime] = useState(Date.now())
  const [elapsedTime, setElapsedTime] = useState(0)

  // Timer effect
  useEffect(() => {
    if (!isComplete) {
      const interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000))
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [isComplete, startTime])

  // Check localStorage for previous completion
  useEffect(() => {
    const saved = localStorage.getItem(`quiz-${moduleId}`)
    if (saved) {
      try {
        const data = JSON.parse(saved)
        if (data.completed) {
          setAnswers(data.answers)
          setIsComplete(true)
          setElapsedTime(data.elapsedTime || 0)
        }
      } catch (e) {
        console.error("Failed to load quiz state:", e)
      }
    }
  }, [moduleId])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const handleSelectAnswer = (optionIndex: number) => {
    if (showResult) return
    setSelectedAnswer(optionIndex)
  }

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) return

    const newAnswers = [...answers]
    newAnswers[currentQuestion] = selectedAnswer
    setAnswers(newAnswers)
    setShowResult(true)
  }

  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
      setSelectedAnswer(null)
      setShowResult(false)
    } else {
      // Quiz complete
      setIsComplete(true)
      const score = calculateScore()
      
      // Save to localStorage
      localStorage.setItem(`quiz-${moduleId}`, JSON.stringify({
        completed: true,
        answers,
        score,
        elapsedTime,
        completedAt: new Date().toISOString()
      }))

      onComplete?.(score, questions.length)
    }
  }

  const handleRetake = () => {
    setCurrentQuestion(0)
    setSelectedAnswer(null)
    setShowResult(false)
    setAnswers(new Array(questions.length).fill(null))
    setIsComplete(false)
    localStorage.removeItem(`quiz-${moduleId}`)
  }

  const calculateScore = () => {
    return answers.reduce((score, answer, index) => {
      if (answer === questions[index].correctAnswer) {
        return score + 1
      }
      return score
    }, 0)
  }

  const score = calculateScore()
  const percentage = Math.round((score / questions.length) * 100)
  const passed = percentage >= 70

  if (isComplete) {
    return (
      <Card className="border-2 border-[hsl(var(--optavia-green))] bg-gradient-to-br from-green-50 to-emerald-50">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4">
            {passed ? (
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
                <Award className="h-10 w-10 text-[hsl(var(--optavia-green))]" />
              </div>
            ) : (
              <div className="w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center">
                <RotateCcw className="h-10 w-10 text-amber-600" />
              </div>
            )}
          </div>
          <CardTitle className="text-2xl text-optavia-dark">
            {passed ? "🎉 Quiz Complete!" : "Almost There!"}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <div>
            <div className="text-5xl font-bold text-[hsl(var(--optavia-green))] mb-2">
              {score}/{questions.length}
            </div>
            <div className="text-optavia-gray">
              {percentage}% correct • Completed in {formatTime(elapsedTime)}
            </div>
          </div>

          {passed ? (
            <p className="text-green-700 bg-green-100 p-4 rounded-lg">
              Great job! You've demonstrated a solid understanding of <strong>{moduleTitle}</strong>.
            </p>
          ) : (
            <p className="text-amber-700 bg-amber-100 p-4 rounded-lg">
              You need 70% to pass. Review the module and try again!
            </p>
          )}

          {/* Answer Review */}
          <div className="text-left space-y-3 mt-6">
            <h4 className="font-semibold text-optavia-dark">Answer Review:</h4>
            {questions.map((q, index) => {
              const isCorrect = answers[index] === q.correctAnswer
              return (
                <div
                  key={q.id}
                  className={cn(
                    "p-3 rounded-lg border",
                    isCorrect ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
                  )}
                >
                  <div className="flex items-start gap-2">
                    {isCorrect ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600 mt-0.5 shrink-0" />
                    )}
                    <div>
                      <div className="font-medium text-sm text-optavia-dark">{q.question}</div>
                      {!isCorrect && (
                        <div className="text-sm text-green-700 mt-1">
                          Correct: {q.options[q.correctAnswer]}
                        </div>
                      )}
                      {q.explanation && (
                        <div className="text-xs text-optavia-gray mt-1 italic">
                          {q.explanation}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <Button
            onClick={handleRetake}
            variant="outline"
            className="mt-4"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Retake Quiz
          </Button>
        </CardContent>
      </Card>
    )
  }

  const currentQ = questions[currentQuestion]

  return (
    <Card className="border-2 border-[hsl(var(--optavia-green))]">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg text-optavia-dark flex items-center gap-2">
            <Award className="h-5 w-5 text-[hsl(var(--optavia-green))]" />
            Knowledge Check
          </CardTitle>
          <div className="flex items-center gap-4 text-sm text-optavia-gray">
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {formatTime(elapsedTime)}
            </span>
            <span className="font-medium">
              {currentQuestion + 1} of {questions.length}
            </span>
          </div>
        </div>
        {/* Progress bar */}
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden mt-3">
          <div
            className="h-full bg-[hsl(var(--optavia-green))] transition-all duration-300"
            style={{ width: `${((currentQuestion + (showResult ? 1 : 0)) / questions.length) * 100}%` }}
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-lg font-medium text-optavia-dark py-2">
          {currentQ.question}
        </div>

        <div className="space-y-2">
          {currentQ.options.map((option, index) => {
            const isSelected = selectedAnswer === index
            const isCorrect = index === currentQ.correctAnswer
            const showCorrect = showResult && isCorrect
            const showWrong = showResult && isSelected && !isCorrect

            return (
              <button
                key={index}
                onClick={() => handleSelectAnswer(index)}
                disabled={showResult}
                className={cn(
                  "w-full p-4 text-left rounded-lg border-2 transition-all",
                  !showResult && isSelected && "border-[hsl(var(--optavia-green))] bg-green-50",
                  !showResult && !isSelected && "border-gray-200 hover:border-gray-300 hover:bg-gray-50",
                  showCorrect && "border-green-500 bg-green-100",
                  showWrong && "border-red-500 bg-red-100",
                  showResult && !showCorrect && !showWrong && "border-gray-200 opacity-50"
                )}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "w-6 h-6 rounded-full border-2 flex items-center justify-center text-sm font-medium shrink-0",
                      !showResult && isSelected && "border-[hsl(var(--optavia-green))] bg-[hsl(var(--optavia-green))] text-white",
                      !showResult && !isSelected && "border-gray-300",
                      showCorrect && "border-green-500 bg-green-500 text-white",
                      showWrong && "border-red-500 bg-red-500 text-white"
                    )}
                  >
                    {showCorrect ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : showWrong ? (
                      <XCircle className="h-4 w-4" />
                    ) : (
                      String.fromCharCode(65 + index)
                    )}
                  </div>
                  <span className={cn(
                    "text-optavia-dark",
                    showWrong && "line-through text-red-700",
                    showCorrect && "text-green-700 font-medium"
                  )}>
                    {option}
                  </span>
                </div>
              </button>
            )
          })}
        </div>

        {showResult && currentQ.explanation && (
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-sm text-blue-800">
              <strong>💡 Explanation:</strong> {currentQ.explanation}
            </div>
          </div>
        )}

        <div className="flex justify-end pt-2">
          {!showResult ? (
            <Button
              onClick={handleSubmitAnswer}
              disabled={selectedAnswer === null}
              className="bg-[hsl(var(--optavia-green))] hover:bg-[hsl(var(--optavia-green-dark))] text-white"
            >
              Submit Answer
            </Button>
          ) : (
            <Button
              onClick={handleNextQuestion}
              className="bg-[hsl(var(--optavia-green))] hover:bg-[hsl(var(--optavia-green-dark))] text-white"
            >
              {currentQuestion < questions.length - 1 ? (
                <>
                  Next Question
                  <ChevronRight className="h-4 w-4 ml-1" />
                </>
              ) : (
                "See Results"
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
