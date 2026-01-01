"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Copy, Check, Droplets } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

const ACTIVITY_LEVELS = [
  { value: "sedentary", label: "Sedentary", description: "Little or no exercise", modifier: 0 },
  { value: "light", label: "Light Activity", description: "Light exercise 1-3 days/week", modifier: 12 },
  { value: "moderate", label: "Moderate Activity", description: "Moderate exercise 3-5 days/week", modifier: 24 },
  { value: "active", label: "Active", description: "Hard exercise 6-7 days/week", modifier: 36 },
  { value: "very-active", label: "Very Active", description: "Very hard exercise, physical job", modifier: 48 },
]

export function WaterCalculator() {
  const { toast } = useToast()
  const [weight, setWeight] = useState<string>("")
  const [useKg, setUseKg] = useState(false)
  const [activityLevel, setActivityLevel] = useState<string>("sedentary")
  const [copied, setCopied] = useState(false)
  const [glassesConsumed, setGlassesConsumed] = useState(0)

  // Calculate water intake
  const calculateWaterIntake = () => {
    if (!weight || isNaN(parseFloat(weight))) return null

    let weightInLbs = parseFloat(weight)
    if (useKg) {
      weightInLbs = weightInLbs * 2.20462 // Convert kg to lbs
    }

    const activity = ACTIVITY_LEVELS.find((a) => a.value === activityLevel)
    const baseOunces = weightInLbs / 2
    const totalOunces = baseOunces + (activity?.modifier || 0)

    return {
      ounces: Math.round(totalOunces),
      liters: (totalOunces * 0.0295735).toFixed(1),
      glasses: Math.ceil(totalOunces / 8),
      percentage: Math.min((totalOunces / 100) * 100, 100), // For visual bar, cap at 100%
    }
  }

  const result = calculateWaterIntake()

  // Generate text for copying
  const getResultText = () => {
    if (!result) return ""
    const activity = ACTIVITY_LEVELS.find((a) => a.value === activityLevel)
    return `Daily Water Intake Recommendation
Weight: ${weight} ${useKg ? "kg" : "lbs"}
Activity Level: ${activity?.label}

Recommended Daily Intake:
• ${result.ounces} oz (${result.liters} L)
• ${result.glasses} glasses (8 oz each)

Remember: This is a general guideline. Adjust based on climate, health conditions, and individual needs.`
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(getResultText())
      setCopied(true)
      toast({
        title: "Copied!",
        description: "Water intake recommendation copied to clipboard",
      })
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Inputs */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="weight" className="text-optavia-dark">Client Weight</Label>
            <div className="flex items-center gap-2">
              <span className={`text-xs ${!useKg ? "font-semibold text-optavia-dark" : "text-optavia-gray"}`}>lbs</span>
              <Switch
                id="unit"
                checked={useKg}
                onCheckedChange={setUseKg}
                className="data-[state=checked]:bg-[hsl(var(--optavia-green))]"
              />
              <span className={`text-xs ${useKg ? "font-semibold text-optavia-dark" : "text-optavia-gray"}`}>kg</span>
            </div>
          </div>
          <Input
            id="weight"
            type="number"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder={`Enter weight in ${useKg ? "kg" : "lbs"}`}
            className="border-gray-300"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="activity" className="text-optavia-dark">Activity Level</Label>
          <Select value={activityLevel} onValueChange={setActivityLevel}>
            <SelectTrigger id="activity" className="border-gray-300 bg-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white">
              {ACTIVITY_LEVELS.map((level) => (
                <SelectItem key={level.value} value={level.value}>
                  <div className="flex flex-col">
                    <span className="font-medium">{level.label}</span>
                    <span className="text-xs text-optavia-gray">{level.description}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results */}
      {result && (
        <div className="bg-[hsl(var(--optavia-green-light))] rounded-lg p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-optavia-dark flex items-center gap-2">
              <Droplets className="h-5 w-5 text-blue-500" />
              Daily Water Goal
            </h4>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="gap-2 border-gray-300 bg-white hover:bg-gray-50"
            >
              {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
              {copied ? "Copied!" : "Copy Results"}
            </Button>
          </div>

          {/* Main result display */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-white rounded-lg p-3 shadow-sm">
              <div className="text-2xl font-bold text-blue-600">{result.ounces}</div>
              <div className="text-xs text-optavia-gray">ounces</div>
            </div>
            <div className="bg-white rounded-lg p-3 shadow-sm">
              <div className="text-2xl font-bold text-blue-600">{result.liters}</div>
              <div className="text-xs text-optavia-gray">liters</div>
            </div>
            <div className="bg-white rounded-lg p-3 shadow-sm">
              <div className="text-2xl font-bold text-blue-600">{result.glasses}</div>
              <div className="text-xs text-optavia-gray">8oz glasses</div>
            </div>
          </div>

          {/* Interactive progress tracker */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-optavia-gray">
              <span>Daily Progress Tracker (click to track)</span>
              <span>{glassesConsumed} of {result.glasses} glasses</span>
            </div>
            <div className="flex gap-1 flex-wrap">
              {Array.from({ length: result.glasses }).map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setGlassesConsumed(i + 1 === glassesConsumed ? i : i + 1)}
                  className={`flex-1 min-w-[2rem] h-8 rounded border-2 flex items-center justify-center transition-all cursor-pointer hover:scale-105 ${
                    i < glassesConsumed
                      ? "bg-blue-500 border-blue-600"
                      : "bg-white border-blue-200 hover:border-blue-400"
                  }`}
                  title={i < glassesConsumed ? `Glass ${i + 1} - Click to remove` : `Click to mark glass ${i + 1} as drunk`}
                >
                  <Droplets className={`h-4 w-4 ${i < glassesConsumed ? "text-white" : "text-blue-300"}`} />
                </button>
              ))}
            </div>
            {glassesConsumed > 0 && (
              <div className="flex justify-between items-center">
                <p className="text-xs text-blue-600 font-medium">
                  {glassesConsumed === result.glasses 
                    ? "🎉 Goal reached! Great job staying hydrated!" 
                    : `${result.glasses - glassesConsumed} more to go!`}
                </p>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setGlassesConsumed(0)}
                  className="text-xs text-optavia-gray hover:text-optavia-dark h-6 px-2"
                >
                  Reset
                </Button>
              </div>
            )}
          </div>

          <p className="text-xs text-optavia-gray">
            <strong>Note:</strong> This is a general guideline based on body weight and activity level. 
            Individual needs may vary based on climate, health conditions, and other factors. 
            Always consult with a healthcare provider for personalized recommendations.
          </p>
        </div>
      )}

      {/* Empty state */}
      {!result && (
        <div className="bg-gray-50 rounded-lg p-6 text-center">
          <Droplets className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-optavia-gray">
            Enter client weight and activity level to calculate daily water intake
          </p>
        </div>
      )}
    </div>
  )
}

