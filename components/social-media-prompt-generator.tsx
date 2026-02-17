"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Copy, Check, ExternalLink, Sparkles, RotateCcw, Lightbulb } from "lucide-react"

// ============================================================================
// CONFIGURATION OPTIONS
// ============================================================================

const MOOD_OPTIONS = [
  { value: "inspiring", label: "✨ Inspiring", description: "Uplifting and motivational" },
  { value: "vulnerable", label: "💜 Vulnerable", description: "Real, raw, and relatable" },
  { value: "educational", label: "📚 Educational", description: "Teaching something valuable" },
  { value: "fun", label: "🎉 Fun & Playful", description: "Light-hearted and engaging" },
  { value: "celebratory", label: "🎊 Celebratory", description: "Wins and milestones" },
  { value: "reflective", label: "🪞 Reflective", description: "Thoughtful and introspective" },
  { value: "urgent", label: "🔥 Urgent/Exciting", description: "Time-sensitive energy" },
]

const TOPIC_OPTIONS = [
  { value: "transformation", label: "🦋 My Transformation", description: "Your personal journey" },
  { value: "client_win", label: "🏆 Client Success", description: "Celebrating a client" },
  { value: "habits", label: "📋 Healthy Habits", description: "Daily routines that work" },
  { value: "water", label: "💧 Water/Hydration", description: "Importance of hydration" },
  { value: "cravings", label: "🍫 Handling Cravings", description: "Tips for cravings" },
  { value: "exercise", label: "🏃 Movement/Exercise", description: "Fitness and activity" },
  { value: "sleep", label: "😴 Sleep & Rest", description: "Rest and recovery" },
  { value: "mindset", label: "🧠 Mindset", description: "Mental game and beliefs" },
  { value: "family", label: "👨‍👩‍👧 Family & Balance", description: "Family life and health" },
  { value: "meal_prep", label: "🥗 Meal Prep/Recipes", description: "Food planning tips" },
  { value: "fuelings", label: "📦 Fuelings", description: "OPTAVIA products" },
  { value: "why", label: "❤️ My Why", description: "Your deeper motivation" },
  { value: "before_after", label: "📸 Before/After", description: "Transformation photos" },
  { value: "day_in_life", label: "🌅 Day in the Life", description: "Daily routine content" },
  { value: "myth_busting", label: "🚫 Myth Busting", description: "Correcting misconceptions" },
  { value: "motivation_monday", label: "💪 Motivation Monday", description: "Weekly motivation" },
  { value: "testimonial", label: "💬 Testimonial", description: "Sharing feedback received" },
  { value: "struggle", label: "🌧️ Overcoming Struggles", description: "Real challenges faced" },
  { value: "tip", label: "💡 Quick Tip", description: "Single actionable tip" },
  { value: "question", label: "❓ Engagement Question", description: "Ask your audience" },
]

const PLATFORM_OPTIONS = [
  { value: "instagram", label: "📷 Instagram", description: "Visual, hashtags, reels-friendly" },
  { value: "facebook", label: "📘 Facebook", description: "Longer form, community-focused" },
  { value: "both", label: "📱 Both Platforms", description: "Adaptable for either" },
]

const POST_TYPE_OPTIONS = [
  { value: "feed", label: "📝 Feed Post", description: "Standard photo + caption" },
  { value: "story", label: "📱 Story Idea", description: "Quick story content" },
  { value: "reel", label: "🎬 Reel/Video Idea", description: "Short video concept" },
  { value: "carousel", label: "🎠 Carousel", description: "Multiple slides/images" },
]

const CTA_OPTIONS = [
  { value: "none", label: "No CTA", description: "Just share, no ask" },
  { value: "engage", label: "💬 Engagement", description: "Ask for comments/shares" },
  { value: "dm", label: "📩 DM Me", description: "Invite to message you" },
  { value: "link", label: "🔗 Link in Bio", description: "Direct to your link" },
  { value: "soft_offer", label: "🌱 Soft Offer", description: "Gentle invitation to learn more" },
]

const LENGTH_OPTIONS = [
  { value: "short", label: "Short", description: "1-2 sentences" },
  { value: "medium", label: "Medium", description: "3-5 sentences" },
  { value: "long", label: "Long", description: "Full story format" },
]

const PERSONAL_TOUCH_OPTIONS = [
  { value: "kids", label: "👶 Mention Kids" },
  { value: "spouse", label: "💑 Mention Spouse/Partner" },
  { value: "pet", label: "🐕 Mention Pet" },
  { value: "work", label: "💼 Mention Day Job" },
  { value: "busy_mom", label: "🏃‍♀️ Busy Mom Life" },
  { value: "working_parent", label: "👔 Working Parent" },
  { value: "empty_nester", label: "🏠 Empty Nester" },
  { value: "grandparent", label: "👴 Grandparent" },
  { value: "fitness", label: "🏋️ Fitness Journey" },
  { value: "foodie", label: "🍳 Love of Cooking" },
  { value: "travel", label: "✈️ Travel/Adventure" },
  { value: "faith", label: "🙏 Faith-Based" },
]

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function SocialMediaPromptGenerator() {
  const { toast } = useToast()
  
  // Form state
  const [mood, setMood] = useState("")
  const [topic, setTopic] = useState("")
  const [platform, setPlatform] = useState("both")
  const [postType, setPostType] = useState("feed")
  const [cta, setCta] = useState("engage")
  const [length, setLength] = useState("medium")
  const [personalTouches, setPersonalTouches] = useState<string[]>([])
  const [customContext, setCustomContext] = useState("")
  const [specificDetail, setSpecificDetail] = useState("")
  
  // Output state
  const [generatedPrompt, setGeneratedPrompt] = useState("")
  const [copied, setCopied] = useState(false)

  // Toggle personal touch
  const togglePersonalTouch = (value: string) => {
    setPersonalTouches(prev => 
      prev.includes(value) 
        ? prev.filter(v => v !== value)
        : [...prev, value]
    )
  }

  // Generate the ChatGPT prompt
  const generatePrompt = () => {
    if (!mood || !topic) {
      toast({
        title: "Missing required fields",
        description: "Please select a mood and topic",
        variant: "destructive",
      })
      return
    }

    const moodLabel = MOOD_OPTIONS.find(m => m.value === mood)?.label || mood
    const topicLabel = TOPIC_OPTIONS.find(t => t.value === topic)?.label || topic
    const platformLabel = PLATFORM_OPTIONS.find(p => p.value === platform)?.label || platform
    const postTypeLabel = POST_TYPE_OPTIONS.find(p => p.value === postType)?.label || postType
    const ctaLabel = CTA_OPTIONS.find(c => c.value === cta)?.label || cta
    const lengthLabel = LENGTH_OPTIONS.find(l => l.value === length)?.label || length
    
    const personalTouchLabels = personalTouches.map(pt => 
      PERSONAL_TOUCH_OPTIONS.find(p => p.value === pt)?.label || pt
    )

    // Build the prompt
    let prompt = `You are an expert social media copywriter for health and wellness coaches. Create 3 different versions of a social media post with the following specifications:

**TONE/MOOD:** ${moodLabel}
**TOPIC:** ${topicLabel}
**PLATFORM:** ${platformLabel}
**POST TYPE:** ${postTypeLabel}
**LENGTH:** ${lengthLabel}
**CALL TO ACTION:** ${ctaLabel}`

    if (personalTouchLabels.length > 0) {
      prompt += `\n**PERSONAL ELEMENTS TO WEAVE IN:** ${personalTouchLabels.join(", ")}`
    }

    if (specificDetail.trim()) {
      prompt += `\n**SPECIFIC DETAIL TO INCLUDE:** ${specificDetail.trim()}`
    }

    if (customContext.trim()) {
      prompt += `\n**ADDITIONAL CONTEXT:** ${customContext.trim()}`
    }

    prompt += `

---

**IMPORTANT GUIDELINES:**
- Write as a real person sharing their genuine experience, NOT as a salesperson
- Use conversational, relatable language (not corporate or overly polished)
- Include emotional hooks that make people stop scrolling
- Make it feel authentic and personal, not generic
- Do NOT mention specific product names or make income claims
- Focus on lifestyle transformation, not just weight loss
- Include relevant emojis naturally (not excessively)
${platform === "instagram" || platform === "both" ? "- Suggest 5-10 relevant hashtags for Instagram" : ""}
${postType === "carousel" ? "- Include slide-by-slide breakdown for carousel" : ""}
${postType === "reel" ? "- Include a hook for the first 3 seconds and a simple video concept" : ""}

---

**Please provide 3 DISTINCT versions:**

**VERSION 1 - HOOK STYLE:** Start with a pattern-interrupt or controversial/curiosity-driven opening

**VERSION 2 - STORY STYLE:** Start with a mini-story or "moment in time" narrative

**VERSION 3 - VALUE-FIRST STYLE:** Lead with the tip/insight/value before personal context

For each version, include:
1. The complete post caption
2. A suggested image/visual description
3. Best time to post suggestion
${platform === "instagram" || platform === "both" ? "4. Hashtag suggestions" : ""}`

    setGeneratedPrompt(prompt)
    setCopied(false)
    
    toast({
      title: "Prompt generated!",
      description: "Copy it and paste into ChatGPT",
    })
  }

  // Copy to clipboard
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedPrompt)
      setCopied(true)
      toast({
        title: "Copied!",
        description: "Prompt copied to clipboard",
      })
      setTimeout(() => setCopied(false), 3000)
    } catch (err) {
      // Fallback for older browsers
      const textarea = document.createElement("textarea")
      textarea.value = generatedPrompt
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand("copy")
      document.body.removeChild(textarea)
      setCopied(true)
      setTimeout(() => setCopied(false), 3000)
    }
  }

  // Reset form
  const resetForm = () => {
    setMood("")
    setTopic("")
    setPlatform("both")
    setPostType("feed")
    setCta("engage")
    setLength("medium")
    setPersonalTouches([])
    setCustomContext("")
    setSpecificDetail("")
    setGeneratedPrompt("")
    setCopied(false)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
      {/* LEFT: Form Inputs */}
      <div className="space-y-3 lg:space-y-4">
        {/* Mood Selection */}
        <Card>
          <CardHeader className="pb-2 lg:pb-3">
            <CardTitle className="text-sm font-semibold">
              1. What&apos;s the mood/tone? <span className="text-red-500">*</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
              {MOOD_OPTIONS.map(option => (
                <button
                  key={option.value}
                  onClick={() => setMood(option.value)}
                  className={`p-2.5 rounded-lg border-2 text-left transition-all min-w-0 min-h-[56px] flex flex-col justify-center ${
                    mood === option.value
                      ? "border-[hsl(var(--optavia-green))] bg-green-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <span className="font-medium text-sm block truncate">{option.label}</span>
                  <p className="text-xs text-gray-500 mt-0.5 hidden sm:block truncate">{option.description}</p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Topic Selection */}
        <Card>
          <CardHeader className="pb-2 lg:pb-3">
            <CardTitle className="text-sm font-semibold">
              2. What's the topic? <span className="text-red-500">*</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <Select value={topic} onValueChange={setTopic}>
              <SelectTrigger>
                <SelectValue placeholder="Select a topic..." />
              </SelectTrigger>
              <SelectContent>
                {TOPIC_OPTIONS.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Platform, Post Type, CTA, Length - Responsive Grid */}
        <Card>
          <CardContent className="pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs font-semibold mb-1.5 block text-gray-600">Platform</Label>
                <Select value={platform} onValueChange={setPlatform}>
                  <SelectTrigger className="h-9 w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PLATFORM_OPTIONS.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs font-semibold mb-1.5 block text-gray-600">Post Type</Label>
                <Select value={postType} onValueChange={setPostType}>
                  <SelectTrigger className="h-9 w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {POST_TYPE_OPTIONS.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs font-semibold mb-1.5 block text-gray-600">Call to Action</Label>
                <Select value={cta} onValueChange={setCta}>
                  <SelectTrigger className="h-9 w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CTA_OPTIONS.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs font-semibold mb-1.5 block text-gray-600">Length</Label>
                <Select value={length} onValueChange={setLength}>
                  <SelectTrigger className="h-9 w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LENGTH_OPTIONS.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Personal Touches */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">
              Personal touches (optional)
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex flex-wrap gap-1.5">
              {PERSONAL_TOUCH_OPTIONS.map(option => (
                <button
                  key={option.value}
                  onClick={() => togglePersonalTouch(option.value)}
                  className={`px-2 py-1 rounded-full text-xs transition-all ${
                    personalTouches.includes(option.value)
                      ? "bg-[hsl(var(--optavia-green))] text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Custom Details */}
        <Card>
          <CardContent className="pt-4 space-y-3">
            <div>
              <Label className="text-xs font-semibold mb-1.5 block text-gray-600">
                Specific detail to include (optional)
              </Label>
              <Input
                value={specificDetail}
                onChange={(e) => setSpecificDetail(e.target.value)}
                placeholder="e.g., 'I just hit 50 lbs lost'"
                className="h-9 text-sm"
              />
            </div>
            
            <div>
              <Label className="text-xs font-semibold mb-1.5 block text-gray-600">
                Any other context? (optional)
              </Label>
              <Textarea
                value={customContext}
                onChange={(e) => setCustomContext(e.target.value)}
                placeholder="e.g., 'I'm posting this on a Monday morning'"
                rows={2}
                className="text-sm"
              />
            </div>
          </CardContent>
        </Card>

        {/* Generate Button */}
        <div className="flex gap-2">
          <Button
            onClick={generatePrompt}
            disabled={!mood || !topic}
            className="flex-1 bg-[hsl(var(--optavia-green))] hover:bg-[hsl(var(--optavia-green-dark))] text-white"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Generate Prompt
          </Button>
          <Button variant="outline" onClick={resetForm} size="icon">
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* RIGHT: Generated Prompt Output */}
      <div className="lg:sticky lg:top-4 h-fit space-y-3">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="text-base flex items-center gap-2">
                📋 Your Prompt
              </CardTitle>
              {generatedPrompt && (
                <Button
                  onClick={copyToClipboard}
                  size="sm"
                  className={copied 
                    ? "bg-green-100 text-green-700 hover:bg-green-100" 
                    : "bg-[hsl(var(--optavia-green))] hover:bg-[hsl(var(--optavia-green-dark))] text-white"
                  }
                >
                  {copied ? (
                    <>
                      <Check className="h-3 w-3 mr-1" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3 mr-1" />
                      Copy
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {generatedPrompt ? (
              <>
                <div className="bg-gray-50 rounded-lg p-3 max-h-[250px] lg:max-h-[400px] overflow-y-auto">
                  <pre className="whitespace-pre-wrap text-xs lg:text-sm text-gray-700 font-mono">
                    {generatedPrompt}
                  </pre>
                </div>
                
                {/* Quick Actions */}
                <div className="mt-3 flex gap-2">
                  <Button
                    onClick={copyToClipboard}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    Copy
                  </Button>
                  <a
                    href="https://chat.openai.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1"
                  >
                    <Button size="sm" className="w-full bg-gray-900 hover:bg-gray-800 text-white">
                      <ExternalLink className="h-3 w-3 mr-1" />
                      ChatGPT
                    </Button>
                  </a>
                </div>

                {/* Instructions - Compact */}
                <div className="mt-3 p-2.5 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-xs text-blue-700">
                    <strong>Next:</strong> Copy prompt → Paste in ChatGPT → Get 3 post variations → Edit to match your voice
                  </p>
                </div>
              </>
            ) : (
              <div className="bg-gray-50 rounded-lg p-6 text-center">
                <div className="text-3xl mb-2">✏️</div>
                <p className="text-sm text-gray-500">
                  Select mood & topic, then click "Generate Prompt"
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Get 3 unique post ideas
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tips Card - More Compact */}
        <Card className="bg-gradient-to-br from-green-50 to-blue-50 border-0">
          <CardContent className="py-3">
            <p className="text-xs font-semibold text-gray-700 mb-2">🎯 Pro Tips</p>
            <ul className="text-xs text-gray-600 space-y-1">
              <li className="flex items-start gap-1.5">
                <span className="text-green-500">✓</span>
                <span>Add specific details for personalized posts</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-green-500">✓</span>
                <span>Mix up moods throughout the week</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-green-500">✓</span>
                <span>Always edit AI output to sound like YOU</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
