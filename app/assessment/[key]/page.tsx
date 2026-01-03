"use client"

import { useState, useMemo, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Footer } from "@/components/footer"
import { decodeAssessmentKey } from "@/lib/assessment-links"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"
import { sendHealthAssessmentEmail } from "@/lib/email"

export default function HealthAssessmentPage({ params }: { params: Promise<{ key: string }> | { key: string } }) {
  const { toast } = useToast()
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<"success" | "error" | null>(null)
  const [coachEmail, setCoachEmail] = useState<string | null>(null)
  const [coachName, setCoachName] = useState<string | null>(null)
  const [coachAvatar, setCoachAvatar] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [assessmentKey, setAssessmentKey] = useState<string | null>(null)
  const today = useMemo(() => new Date().toISOString().slice(0, 10), [])

  // Handle async params in Next.js 15+
  useEffect(() => {
    const getKey = async () => {
      const resolvedParams = params instanceof Promise ? await params : params
      setAssessmentKey(resolvedParams.key)
    }
    getKey()
  }, [params])

  useEffect(() => {
    if (!assessmentKey) return

    // Decode the assessment key to get coach email
    const email = decodeAssessmentKey(assessmentKey)
    if (!email) {
      setLoading(false)
      return
    }

    setCoachEmail(email)

    // Fetch coach profile to get their name and avatar
    const supabase = createClient()
    supabase
      .from("profiles")
      .select("full_name, email, avatar_url")
      .eq("email", email)
      .single()
      .then(({ data, error }) => {
        if (data) {
          setCoachName(data.full_name || email)
          setCoachAvatar(data.avatar_url)
        } else {
          setCoachName(email)
        }
        setLoading(false)
      })
      .catch(() => {
        setCoachName(email)
        setLoading(false)
      })
  }, [assessmentKey])

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    
    if (!coachEmail) {
      toast({
        title: "Error",
        description: "Invalid assessment link",
        variant: "destructive",
      })
      return
    }

    const fd = new FormData(e.currentTarget)

    const b = (name: string) =>
      fd.get(name) === "on" || fd.get(name) === "true"
    const n = (name: string) => {
      const val = fd.get(name)?.toString().trim()
      if (!val) return undefined
      const num = Number(val)
      return Number.isFinite(num) ? num : undefined
    }
    const s = (name: string) => fd.get(name)?.toString().trim() || undefined

    // Get coach_id from email
    const supabase = createClient()
    const { data: coachProfile } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", coachEmail)
      .single()

    if (!coachProfile) {
      toast({
        title: "Error",
        description: "Coach not found",
        variant: "destructive",
      })
      return
    }

    // Prepare assessment data for email (all fields)
    const assessmentData = {
      phone: s("phone"),
      date: s("date") || today,
      dob: s("dob"),
      howHeard: s("howHeard"),
      goalsCurrentState: s("goalsCurrentState") || "",
      goalsWhy: s("goalsWhy"),
      pregnant: b("pregnant"),
      nursing: b("nursing"),
      babyAgeMonths: s("babyAgeMonths"),
      diabetesType1: b("diabetesType1"),
      diabetesType2: b("diabetesType2"),
      highBloodPressure: b("highBloodPressure"),
      highCholesterol: b("highCholesterol"),
      gout: b("gout"),
      ibs: b("ibs"),
      otherConditions: s("otherConditions"),
      onMedications: b("onMedications"),
      medications: s("medications"),
      sleepQuality: n("sleepQuality"),
      energyLevel: n("energyLevel"),
      mealsPerDay: n("mealsPerDay"),
      snacksPerDay: n("snacksPerDay"),
      waterIntakeOz: n("waterIntakeOz"),
      caffeinePerDay: n("caffeinePerDay"),
      alcoholPerWeek: n("alcoholPerWeek"),
      exerciseDaysPerWeek: n("exerciseDaysPerWeek"),
      exerciseTypes: s("exerciseTypes"),
      wakeTime: s("wakeTime"),
      bedTime: s("bedTime"),
      commitment: n("commitment"),
      additionalNotes: s("additionalNotes"),
    }

    const clientFirstName = s("firstName") || ""
    const clientLastName = s("lastName") || ""
    const clientEmail = s("email") || ""
    
    // Store form reference before async operations
    const formElement = e.currentTarget

    setSubmitting(true)
    setResult(null)

    try {
      // Send assessment via email to coach
      const emailResult = await sendHealthAssessmentEmail({
        to: coachEmail,
        coachName: coachName || coachEmail,
        clientFirstName,
        clientLastName,
        clientEmail,
        assessmentData,
      })

      if (!emailResult.success) {
        console.error("Error sending email:", emailResult.error)
        setResult("error")
        toast({
          title: "Error",
          description: "Failed to send assessment. Please try again.",
          variant: "destructive",
        })
        setSubmitting(false)
        return
      }

      // Store only metadata in database
      const { error: dbError } = await supabase
        .from("health_assessments")
        .insert({
          coach_id: coachProfile.id,
          coach_email: coachEmail,
          client_email: clientEmail,
          client_first_name: clientFirstName,
          client_last_name: clientLastName,
          email_sent_at: new Date().toISOString(),
          email_sent_successfully: true,
        })

      if (dbError) {
        console.error("Error storing metadata:", dbError)
        // Don't fail the submission if metadata storage fails - email was sent
      }

      setResult("success")
      formElement.reset()
      toast({
        title: "Success",
        description: "Your health assessment has been submitted successfully!",
      })
    } catch (error) {
      console.error("Error:", error)
      setResult("error")
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[hsl(var(--optavia-green))] mx-auto mb-4"></div>
          <p className="text-optavia-gray">Loading...</p>
        </div>
      </div>
    )
  }

  if (!coachEmail) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <div className="flex-1 flex items-center justify-center px-4 py-12">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-2xl font-heading text-optavia-dark">Invalid Link</CardTitle>
              <CardDescription className="text-optavia-gray">
                This assessment link is invalid or has expired.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_40%_at_50%_0%,hsl(var(--optavia-green)/60),transparent_70%)]" />
        <div className="mx-auto max-w-6xl px-4 py-16">
          <div className="grid items-start gap-10 lg:grid-cols-2">
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl text-optavia-dark">
                Book Your Free Health Assessment
              </h1>
              <p className="mt-4 text-lg text-optavia-gray">
                A 30-minute conversation to learn about your goals and share how
                the Optavia program and personalized coaching can help. No
                pressure—just helpful, practical guidance.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button asChild size="lg" className="bg-[hsl(var(--optavia-green))] hover:bg-[hsl(var(--optavia-green-dark))] text-white">
                  <a href="#health-assessment">Fill Health Assessment</a>
                </Button>
              </div>
            </div>
            <div>
              <div className="mb-4 flex justify-center">
                <div className="flex flex-col items-center">
                  <div className="h-[200px] w-[200px] rounded-lg overflow-hidden border-4 border-gray-700 bg-white shadow-md">
                    {coachAvatar ? (
                      <img 
                        src={coachAvatar} 
                        alt={coachName || "Your Health Coach"}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full bg-gradient-to-br from-[hsl(var(--optavia-green))] to-[#008542] flex items-center justify-center">
                        <span className="text-6xl font-bold text-white">
                          {coachName?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "HC"}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="mt-4 text-center">
                    <p className="text-lg font-semibold text-optavia-dark">{coachName}</p>
                    <p className="text-sm text-optavia-gray">Your Health Coach</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="health-assessment" className="mx-auto max-w-6xl px-4 pb-20">
        <div className="rounded-2xl border bg-card p-8 shadow-sm">
          <h2 className="text-2xl font-semibold tracking-tight text-optavia-dark">
            Health Assessment
          </h2>
          <p className="mt-2 text-optavia-gray">
            Please complete the assessment below. Your responses will be securely sent
            to {coachName} for review before your call.
          </p>

          {result === "success" && (
            <div className="mt-6 rounded-md border border-emerald-200 bg-emerald-50 p-4 text-emerald-900">
              Thanks! Your Health Assessment was submitted successfully. {coachName} will review it and contact you soon.
            </div>
          )}
          {result === "error" && (
            <div className="mt-6 rounded-md border border-red-200 bg-red-50 p-4 text-red-900">
              Sorry, there was a problem sending your assessment. Please try again.
            </div>
          )}

          <form
            className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2"
            onSubmit={onSubmit}
          >
            {/* Contact */}
            <label className="grid gap-1">
              <span className="text-sm font-medium text-optavia-dark">First Name</span>
              <input
                required
                name="firstName"
                className="h-11 rounded-md border bg-white px-3 outline-none ring-[hsl(var(--optavia-green))] focus:ring-2 text-optavia-dark"
              />
            </label>
            <label className="grid gap-1">
              <span className="text-sm font-medium text-optavia-dark">Last Name</span>
              <input
                required
                name="lastName"
                className="h-11 rounded-md border bg-white px-3 outline-none ring-[hsl(var(--optavia-green))] focus:ring-2 text-optavia-dark"
              />
            </label>
            <label className="grid gap-1">
              <span className="text-sm font-medium text-optavia-dark">Email</span>
              <input
                type="email"
                required
                name="email"
                className="h-11 rounded-md border bg-white px-3 outline-none ring-[hsl(var(--optavia-green))] focus:ring-2 text-optavia-dark"
              />
            </label>
            <label className="grid gap-1">
              <span className="text-sm font-medium text-optavia-dark">Phone</span>
              <input
                name="phone"
                className="h-11 rounded-md border bg-white px-3 outline-none ring-[hsl(var(--optavia-green))] focus:ring-2 text-optavia-dark"
              />
            </label>
            <label className="grid gap-1">
              <span className="text-sm font-medium text-optavia-dark">Today's Date</span>
              <input
                type="date"
                name="date"
                defaultValue={today}
                className="h-11 rounded-md border bg-white px-3 outline-none ring-[hsl(var(--optavia-green))] focus:ring-2 text-optavia-dark"
              />
            </label>
            <label className="grid gap-1">
              <span className="text-sm font-medium text-optavia-dark">Date of Birth</span>
              <input
                type="date"
                name="dob"
                className="h-11 rounded-md border bg-white px-3 outline-none ring-[hsl(var(--optavia-green))] focus:ring-2 text-optavia-dark"
              />
            </label>
            <label className="md:col-span-2 grid gap-1">
              <span className="text-sm font-medium text-optavia-dark">
                How did you hear about our program?
              </span>
              <input
                name="howHeard"
                className="h-11 rounded-md border bg-white px-3 outline-none ring-[hsl(var(--optavia-green))] focus:ring-2 text-optavia-dark"
              />
            </label>

            {/* Goals */}
            <div className="md:col-span-2 mt-6 text-sm font-semibold text-optavia-dark">
              GOALS
            </div>
            <label className="md:col-span-2 grid gap-1">
              <span className="text-sm font-medium text-optavia-dark">
                Right now, where are you in your health? (weight, energy, sleep,
                self‑confidence…)
              </span>
              <textarea
                required
                name="goalsCurrentState"
                className="min-h-28 rounded-md border bg-white px-3 py-2 outline-none ring-[hsl(var(--optavia-green))] focus:ring-2 text-optavia-dark"
              />
            </label>
            <label className="md:col-span-2 grid gap-1">
              <span className="text-sm font-medium text-optavia-dark">
                Why do you want to lose weight? What will be different in your
                life when you get to a healthy weight? What do your dream health
                goals look like?
              </span>
              <textarea
                name="goalsWhy"
                className="min-h-28 rounded-md border bg-white px-3 py-2 outline-none ring-[hsl(var(--optavia-green))] focus:ring-2 text-optavia-dark"
              />
            </label>

            {/* Medical */}
            <div className="md:col-span-2 mt-6 text-sm font-semibold text-optavia-dark">
              MEDICAL
            </div>
            <div className="grid grid-cols-1 gap-4 md:col-span-2 md:grid-cols-3">
              <label className="flex items-center gap-2 text-sm text-optavia-dark">
                <input type="checkbox" name="pregnant" /> Are you pregnant?
              </label>
              <label className="flex items-center gap-2 text-sm text-optavia-dark">
                <input type="checkbox" name="nursing" /> Are you nursing?
              </label>
              <label className="grid gap-1">
                <span className="text-sm font-medium text-optavia-dark">
                  If yes, baby's age (months)
                </span>
                <input
                  name="babyAgeMonths"
                  className="h-11 rounded-md border bg-white px-3 outline-none ring-[hsl(var(--optavia-green))] focus:ring-2 text-optavia-dark"
                />
              </label>
            </div>
            <div className="grid grid-cols-1 gap-4 md:col-span-2 md:grid-cols-3">
              <label className="flex items-center gap-2 text-sm text-optavia-dark">
                <input type="checkbox" name="diabetesType1" /> Diabetes Type 1
              </label>
              <label className="flex items-center gap-2 text-sm text-optavia-dark">
                <input type="checkbox" name="diabetesType2" /> Diabetes Type 2
              </label>
              <label className="flex items-center gap-2 text-sm text-optavia-dark">
                <input type="checkbox" name="highBloodPressure" /> High Blood
                Pressure
              </label>
              <label className="flex items-center gap-2 text-sm text-optavia-dark">
                <input type="checkbox" name="highCholesterol" /> High
                Cholesterol
              </label>
              <label className="flex items-center gap-2 text-sm text-optavia-dark">
                <input type="checkbox" name="gout" /> Gout
              </label>
              <label className="flex items-center gap-2 text-sm text-optavia-dark">
                <input type="checkbox" name="ibs" /> IBS
              </label>
            </div>
            <label className="md:col-span-2 grid gap-1">
              <span className="text-sm font-medium text-optavia-dark">Other conditions</span>
              <input
                name="otherConditions"
                className="h-11 rounded-md border bg-white px-3 outline-none ring-[hsl(var(--optavia-green))] focus:ring-2 text-optavia-dark"
              />
            </label>
            <div className="grid grid-cols-1 gap-4 md:col-span-2 md:grid-cols-2">
              <label className="flex items-center gap-2 text-sm text-optavia-dark">
                <input type="checkbox" name="onMedications" /> Are you currently
                taking any medications?
              </label>
              <label className="grid gap-1">
                <span className="text-sm font-medium text-optavia-dark">
                  If yes, list them here
                </span>
                <input
                  name="medications"
                  className="h-11 rounded-md border bg-white px-3 outline-none ring-[hsl(var(--optavia-green))] focus:ring-2 text-optavia-dark"
                />
              </label>
            </div>

            {/* Habits */}
            <div className="md:col-span-2 mt-6 text-sm font-semibold text-optavia-dark">
              HABITS
            </div>
            <div className="grid grid-cols-1 gap-4 md:col-span-2 md:grid-cols-3">
              <label className="grid gap-1">
                <span className="text-sm font-medium text-optavia-dark">Sleep quality (1–5)</span>
                <input
                  type="number"
                  min={1}
                  max={5}
                  name="sleepQuality"
                  className="h-11 rounded-md border bg-white px-3 outline-none ring-[hsl(var(--optavia-green))] focus:ring-2 text-optavia-dark"
                />
              </label>
              <label className="grid gap-1">
                <span className="text-sm font-medium text-optavia-dark">Energy level (1–5)</span>
                <input
                  type="number"
                  min={1}
                  max={5}
                  name="energyLevel"
                  className="h-11 rounded-md border bg-white px-3 outline-none ring-[hsl(var(--optavia-green))] focus:ring-2 text-optavia-dark"
                />
              </label>
              <label className="grid gap-1">
                <span className="text-sm font-medium text-optavia-dark">Meals per day</span>
                <input
                  type="number"
                  min={0}
                  max={15}
                  name="mealsPerDay"
                  className="h-11 rounded-md border bg-white px-3 outline-none ring-[hsl(var(--optavia-green))] focus:ring-2 text-optavia-dark"
                />
              </label>
              <label className="grid gap-1">
                <span className="text-sm font-medium text-optavia-dark">Snacks per day</span>
                <input
                  type="number"
                  min={0}
                  max={20}
                  name="snacksPerDay"
                  className="h-11 rounded-md border bg-white px-3 outline-none ring-[hsl(var(--optavia-green))] focus:ring-2 text-optavia-dark"
                />
              </label>
              <label className="grid gap-1">
                <span className="text-sm font-medium text-optavia-dark">Water intake (oz)</span>
                <input
                  type="number"
                  min={0}
                  max={1000}
                  name="waterIntakeOz"
                  className="h-11 rounded-md border bg-white px-3 outline-none ring-[hsl(var(--optavia-green))] focus:ring-2 text-optavia-dark"
                />
              </label>
              <label className="grid gap-1">
                <span className="text-sm font-medium text-optavia-dark">Caffeine (cups/day)</span>
                <input
                  type="number"
                  min={0}
                  max={30}
                  name="caffeinePerDay"
                  className="h-11 rounded-md border bg-white px-3 outline-none ring-[hsl(var(--optavia-green))] focus:ring-2 text-optavia-dark"
                />
              </label>
              <label className="grid gap-1">
                <span className="text-sm font-medium text-optavia-dark">
                  Alcohol (drinks/week)
                </span>
                <input
                  type="number"
                  min={0}
                  max={50}
                  name="alcoholPerWeek"
                  className="h-11 rounded-md border bg-white px-3 outline-none ring-[hsl(var(--optavia-green))] focus:ring-2 text-optavia-dark"
                />
              </label>
              <label className="grid gap-1">
                <span className="text-sm font-medium text-optavia-dark">Exercise days/week</span>
                <input
                  type="number"
                  min={0}
                  max={14}
                  name="exerciseDaysPerWeek"
                  className="h-11 rounded-md border bg-white px-3 outline-none ring-[hsl(var(--optavia-green))] focus:ring-2 text-optavia-dark"
                />
              </label>
              <label className="grid gap-1 md:col-span-2">
                <span className="text-sm font-medium text-optavia-dark">Exercise types</span>
                <input
                  name="exerciseTypes"
                  className="h-11 rounded-md border bg-white px-3 outline-none ring-[hsl(var(--optavia-green))] focus:ring-2 text-optavia-dark"
                />
              </label>
              <label className="grid gap-1">
                <span className="text-sm font-medium text-optavia-dark">Wake time</span>
                <input
                  type="time"
                  name="wakeTime"
                  className="h-11 rounded-md border bg-white px-3 outline-none ring-[hsl(var(--optavia-green))] focus:ring-2 text-optavia-dark"
                />
              </label>
              <label className="grid gap-1">
                <span className="text-sm font-medium text-optavia-dark">Bed time</span>
                <input
                  type="time"
                  name="bedTime"
                  className="h-11 rounded-md border bg-white px-3 outline-none ring-[hsl(var(--optavia-green))] focus:ring-2 text-optavia-dark"
                />
              </label>
              <label className="grid gap-1">
                <span className="text-sm font-medium text-optavia-dark">Commitment (1–10)</span>
                <input
                  type="number"
                  min={1}
                  max={10}
                  name="commitment"
                  className="h-11 rounded-md border bg-white px-3 outline-none ring-[hsl(var(--optavia-green))] focus:ring-2 text-optavia-dark"
                />
              </label>
            </div>

            <label className="md:col-span-2 grid gap-1">
              <span className="text-sm font-medium text-optavia-dark">
                Anything else you'd like to share?
              </span>
              <textarea
                name="additionalNotes"
                className="min-h-28 rounded-md border bg-white px-3 py-2 outline-none ring-[hsl(var(--optavia-green))] focus:ring-2 text-optavia-dark"
              />
            </label>

            <div className="md:col-span-2 mt-4 space-y-4">
              {/* Privacy Disclaimer */}
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-xs text-optavia-gray leading-relaxed">
                  <strong className="text-optavia-dark">Privacy Notice:</strong> The information you provide in this Health Assessment is sent directly to your health coach's email inbox—and nowhere else. Coaching Amplifier does not store your responses on our servers, and no one other than your health coach will ever have access to this information. By submitting this assessment, you agree to share your responses with your health coach.
                </p>
              </div>
              
              <Button 
                type="submit" 
                size="lg" 
                disabled={submitting}
                className="bg-[hsl(var(--optavia-green))] hover:bg-[hsl(var(--optavia-green-dark))] text-white"
              >
                {submitting ? "Submitting…" : "Submit Health Assessment"}
              </Button>
            </div>
          </form>
        </div>
      </section>
      <Footer />
    </div>
  )
}
