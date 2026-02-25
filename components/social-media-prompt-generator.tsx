"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { useUserData } from "@/contexts/user-data-context"
import { Copy, Check, ExternalLink, Sparkles, RotateCcw, UserRound, Save, Trash2 } from "lucide-react"
import {
  EMOJI_OPTIONS,
  HASHTAG_OPTIONS,
  NICHE_SUGGESTIONS,
  TOUCH_OPTIONS,
  VOICE_SUGGESTIONS,
  type CoachPostingPreferences,
  type EmojiPreferenceId,
  type HashtagPreferenceId,
  type NicheSuggestionId,
  type TouchOptionId,
  type VoiceSuggestionId,
} from "@/lib/social-media-posting-profile"

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

const PERSONAL_TOUCH_OPTIONS = TOUCH_OPTIONS.map((option) => ({
  value: option.id,
  label: `${option.emoji} ${option.label}`,
}))

const hashtagGuidance: Record<HashtagPreferenceId, string> = {
  auto: "- Choose the best hashtag count and selection for the platform and topic.",
  minimal: "- Include 3-5 focused hashtags only.",
  full: "- Include a complete hashtag set (15-30) for reach.",
  none: "- Do not include hashtags.",
}

const emojiGuidance: Record<EmojiPreferenceId, string> = {
  minimal: "- Use 1-2 emojis total and keep them subtle.",
  moderate: "- Use emojis naturally throughout the post.",
  heavy: "- Use an emoji-rich style while keeping readability high.",
}

function parsePostingPreferences(raw: unknown): CoachPostingPreferences | null {
  if (!raw || typeof raw !== "object") return null

  const value = raw as Partial<CoachPostingPreferences>
  return {
    voice: (value.voice ?? null) as VoiceSuggestionId | null,
    niches: Array.isArray(value.niches) ? (value.niches as NicheSuggestionId[]) : [],
    story: typeof value.story === "string" ? value.story : "",
    touches: Array.isArray(value.touches) ? (value.touches as TouchOptionId[]) : [],
    emojiPref: (value.emojiPref ?? null) as EmojiPreferenceId | null,
    hashtagPref: (value.hashtagPref ?? null) as HashtagPreferenceId | null,
    updated_at: typeof value.updated_at === "string" ? value.updated_at : "",
  }
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

interface SocialMediaPromptGeneratorProps {
  layout?: "modal" | "page"
}

type VoiceSelectValue = VoiceSuggestionId | "none"
type NicheSelectValue = NicheSuggestionId | "none"
type EmojiSelectValue = EmojiPreferenceId | "none"
type HashtagSelectValue = HashtagPreferenceId | "none"

export function SocialMediaPromptGenerator({ layout = "modal" }: SocialMediaPromptGeneratorProps) {
  const { toast } = useToast()
  const { user, profile, updateProfile } = useUserData()
  const isPageLayout = layout === "page"

  // Form state
  const [mood, setMood] = useState("inspiring")
  const [topic, setTopic] = useState("transformation")
  const [platform, setPlatform] = useState("both")
  const [postType, setPostType] = useState("feed")
  const [cta, setCta] = useState("engage")
  const [length, setLength] = useState("medium")
  const [personalTouches, setPersonalTouches] = useState<string[]>([])
  const [customContext, setCustomContext] = useState("")
  const [specificDetail, setSpecificDetail] = useState("")

  // Saved coach posting profile state
  const [profileVoice, setProfileVoice] = useState<VoiceSuggestionId | null>(null)
  const [profileNiches, setProfileNiches] = useState<NicheSuggestionId[]>([])
  const [profileStory, setProfileStory] = useState("")
  const [profileTouches, setProfileTouches] = useState<TouchOptionId[]>([])
  const [profileEmojiPref, setProfileEmojiPref] = useState<EmojiPreferenceId | null>(null)
  const [profileHashtagPref, setProfileHashtagPref] = useState<HashtagPreferenceId | null>(null)
  const [savingProfile, setSavingProfile] = useState(false)
  const [useSavedProfile, setUseSavedProfile] = useState(true)
  const [profileInitialized, setProfileInitialized] = useState(false)
  const [postVoice, setPostVoice] = useState<VoiceSelectValue>("none")
  const [postNicheFocus, setPostNicheFocus] = useState<NicheSelectValue>("none")
  const [postStoryAnchor, setPostStoryAnchor] = useState("")
  const [postEmojiStyle, setPostEmojiStyle] = useState<EmojiSelectValue>("none")
  const [postHashtagStyle, setPostHashtagStyle] = useState<HashtagSelectValue>("none")

  // Output state
  const [generatedPrompt, setGeneratedPrompt] = useState("")
  const [copied, setCopied] = useState(false)

  const savedPostingPreferences = useMemo(
    () => parsePostingPreferences(profile?.posting_preferences),
    [profile?.posting_preferences]
  )
  const hasSavedProfileDefaults = useMemo(() => {
    if (!savedPostingPreferences) return false
    return Boolean(
      savedPostingPreferences.voice ||
      savedPostingPreferences.niches.length > 0 ||
      savedPostingPreferences.story.trim() ||
      savedPostingPreferences.touches.length > 0 ||
      savedPostingPreferences.emojiPref ||
      savedPostingPreferences.hashtagPref
    )
  }, [savedPostingPreferences])

  useEffect(() => {
    if (profileInitialized) return

    const saved = savedPostingPreferences
    if (!saved) {
      setPostVoice("none")
      setPostNicheFocus("none")
      setPostStoryAnchor("")
      setPostEmojiStyle("none")
      setPostHashtagStyle("none")
      setProfileInitialized(true)
      return
    }

    setProfileVoice(saved.voice)
    setProfileNiches(saved.niches)
    setProfileStory(saved.story)
    setProfileTouches(saved.touches)
    setProfileEmojiPref(saved.emojiPref)
    setProfileHashtagPref(saved.hashtagPref)
    setPostVoice(saved.voice ?? "none")
    setPostNicheFocus(saved.niches[0] ?? "none")
    setPostStoryAnchor(saved.story || "")
    setPostEmojiStyle(saved.emojiPref ?? "none")
    setPostHashtagStyle(saved.hashtagPref ?? "none")
    if (saved.touches.length > 0) {
      setPersonalTouches(saved.touches)
    }
    setProfileInitialized(true)
  }, [profileInitialized, savedPostingPreferences])

  // Toggle personal touch
  const togglePersonalTouch = (value: string) => {
    setPersonalTouches((prev) =>
      prev.includes(value)
        ? prev.filter(v => v !== value)
        : [...prev, value]
    )
  }

  const toggleProfileNiche = (value: NicheSuggestionId) => {
    setProfileNiches((prev) => {
      if (prev.includes(value)) return prev.filter((item) => item !== value)
      if (prev.length >= 3) return prev
      return [...prev, value]
    })
  }

  const toggleProfileTouch = (value: TouchOptionId) => {
    setProfileTouches((prev) =>
      prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]
    )
  }

  const saveCoachProfile = async () => {
    if (!user) return

    setSavingProfile(true)
    const payload: CoachPostingPreferences = {
      voice: profileVoice,
      niches: profileNiches,
      story: profileStory.trim(),
      touches: profileTouches,
      emojiPref: profileEmojiPref,
      hashtagPref: profileHashtagPref,
      updated_at: new Date().toISOString(),
    }

    const { error } = await updateProfile({
      posting_preferences: payload,
    })
    setSavingProfile(false)

    if (error) {
      toast({
        title: "Could not save profile",
        description: error.message,
        variant: "destructive",
      })
      return
    }

    if (payload.touches.length > 0) {
      setPersonalTouches(payload.touches)
    }
    setUseSavedProfile(true)
    setPostVoice(payload.voice ?? "none")
    setPostNicheFocus(payload.niches[0] ?? "none")
    setPostStoryAnchor(payload.story || "")
    setPostEmojiStyle(payload.emojiPref ?? "none")
    setPostHashtagStyle(payload.hashtagPref ?? "none")

    toast({
      title: "Posting profile saved",
      description: "Future prompts will automatically use your saved coach voice and audience preferences.",
    })
  }

  const clearCoachProfile = async () => {
    if (!user) return

    setSavingProfile(true)
    const { error } = await updateProfile({
      posting_preferences: null,
    })
    setSavingProfile(false)

    if (error) {
      toast({
        title: "Could not clear profile",
        description: error.message,
        variant: "destructive",
      })
      return
    }

    setProfileVoice(null)
    setProfileNiches([])
    setProfileStory("")
    setProfileTouches([])
    setProfileEmojiPref(null)
    setProfileHashtagPref(null)
    setPostVoice("none")
    setPostNicheFocus("none")
    setPostStoryAnchor("")
    setPostEmojiStyle("none")
    setPostHashtagStyle("none")
    setPersonalTouches([])
    setUseSavedProfile(false)

    toast({
      title: "Profile defaults cleared",
      description: "Saved coach posting defaults were removed.",
    })
  }

  // Generate the ChatGPT prompt
  const generatePrompt = () => {
    const moodLabel = MOOD_OPTIONS.find(m => m.value === mood)?.label || mood
    const topicLabel = TOPIC_OPTIONS.find(t => t.value === topic)?.label || topic
    const platformLabel = PLATFORM_OPTIONS.find(p => p.value === platform)?.label || platform
    const postTypeLabel = POST_TYPE_OPTIONS.find(p => p.value === postType)?.label || postType
    const ctaLabel = CTA_OPTIONS.find(c => c.value === cta)?.label || cta
    const lengthLabel = LENGTH_OPTIONS.find(l => l.value === length)?.label || length
    
    const personalTouchLabels = personalTouches.map(pt => 
      PERSONAL_TOUCH_OPTIONS.find(p => p.value === pt)?.label || pt
    )

    const selectedVoice = VOICE_SUGGESTIONS.find((voice) => voice.id === profileVoice)
    const selectedNiches = profileNiches
      .map((nicheId) => NICHE_SUGGESTIONS.find((niche) => niche.id === nicheId)?.label || nicheId)
      .filter(Boolean)
    const selectedProfileTouches = profileTouches
      .map((touchId) => TOUCH_OPTIONS.find((touch) => touch.id === touchId)?.label || touchId)
      .filter(Boolean)
    const emojiPreferenceLabel = profileEmojiPref
      ? EMOJI_OPTIONS.find((option) => option.id === profileEmojiPref)?.label
      : null
    const hashtagPreferenceLabel = profileHashtagPref
      ? HASHTAG_OPTIONS.find((option) => option.id === profileHashtagPref)?.label
      : null
    const postVoiceChoice = postVoice !== "none"
      ? VOICE_SUGGESTIONS.find((voice) => voice.id === postVoice)
      : null
    const postNicheChoice = postNicheFocus !== "none"
      ? NICHE_SUGGESTIONS.find((niche) => niche.id === postNicheFocus)
      : null
    const postEmojiChoice = postEmojiStyle !== "none"
      ? EMOJI_OPTIONS.find((option) => option.id === postEmojiStyle)
      : null
    const postHashtagChoice = postHashtagStyle !== "none"
      ? HASHTAG_OPTIONS.find((option) => option.id === postHashtagStyle)
      : null
    const coachDisplayName = profile?.full_name || "Coach"
    const coachRank = profile?.coach_rank || "Coach"

    // Build the prompt
    let prompt = `You are an expert social media copywriter for health and wellness coaches. Create 3 different versions of a social media post with the following specifications:

**TONE/MOOD:** ${moodLabel}
**TOPIC:** ${topicLabel}
**PLATFORM:** ${platformLabel}
**POST TYPE:** ${postTypeLabel}
**LENGTH:** ${lengthLabel}
**CALL TO ACTION:** ${ctaLabel}
**COACH NAME:** ${coachDisplayName}
**COACH RANK:** ${coachRank}`

    if (useSavedProfile) {
      prompt += `

**COACH PROFILE (APPLY AS WRITING DNA):**
- Coach name: ${profile?.full_name || "Coach"}
- Voice style: ${selectedVoice ? `${selectedVoice.label} (${selectedVoice.emoji})` : "Use conversational and authentic coach voice"}
- Ideal audience niches: ${selectedNiches.length > 0 ? selectedNiches.join(", ") : "General wellness audience"}
- One-line story anchor: ${profileStory.trim() || "No custom story provided"}
- Personal life details to reference naturally: ${selectedProfileTouches.length > 0 ? selectedProfileTouches.join(", ") : "Only if contextually relevant"}
- Emoji preference: ${emojiPreferenceLabel || "Balanced"}
- Hashtag preference: ${hashtagPreferenceLabel || "Auto"}
`
    }

    if (postVoiceChoice || postNicheChoice || postStoryAnchor.trim() || postEmojiChoice || postHashtagChoice) {
      prompt += `

**THIS POST OVERRIDES:**
- Voice for this post: ${postVoiceChoice ? `${postVoiceChoice.label} (${postVoiceChoice.emoji})` : "None"}
- Audience focus for this post: ${postNicheChoice ? `${postNicheChoice.label} (${postNicheChoice.emoji})` : "General audience"}
- Story anchor for this post: ${postStoryAnchor.trim() || "Use standard profile context"}
- Emoji style for this post: ${postEmojiChoice?.label || "No override"}
- Hashtag style for this post: ${postHashtagChoice?.label || "No override"}
`
    }

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
- Write in first-person voice ("I", "me", "my") unless explicitly asked otherwise
- Do not refer to the coach in third person by name in the caption body
- Use conversational, relatable language (not corporate or overly polished)
- Include emotional hooks that make people stop scrolling
- Make it feel authentic and personal, not generic
- Do NOT mention specific product names or make income claims
- Focus on lifestyle transformation, not just weight loss
- Default to first-person voice ("I", "my", "me") when the coach is posting about themselves.
- Do not refer to the coach by their own name in the caption body unless explicitly requested.
- Include relevant emojis naturally (not excessively)
${postEmojiStyle !== "none" ? emojiGuidance[postEmojiStyle] : useSavedProfile && profileEmojiPref ? emojiGuidance[profileEmojiPref] : ""}
${platform === "instagram" || platform === "both"
  ? postHashtagStyle !== "none"
    ? hashtagGuidance[postHashtagStyle]
    : useSavedProfile && profileHashtagPref
    ? hashtagGuidance[profileHashtagPref]
    : "- Suggest 5-10 relevant hashtags for Instagram"
  : ""}
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
    setMood("inspiring")
    setTopic("transformation")
    setPlatform("both")
    setPostType("feed")
    setCta("engage")
    setLength("medium")
    setPersonalTouches(profileTouches.length > 0 ? profileTouches : [])
    setPostVoice(profileVoice ?? "none")
    setPostNicheFocus(profileNiches[0] ?? "none")
    setPostStoryAnchor(profileStory || "")
    setPostEmojiStyle(profileEmojiPref ?? "none")
    setPostHashtagStyle(profileHashtagPref ?? "none")
    setCustomContext("")
    setSpecificDetail("")
    setGeneratedPrompt("")
    setCopied(false)
  }

  return (
    <div className={isPageLayout ? "max-w-6xl mx-auto" : ""}>
      <div className={`grid grid-cols-1 lg:grid-cols-2 ${isPageLayout ? "gap-6 lg:gap-8" : "gap-4 lg:gap-6"}`}>
      {/* LEFT: Form Inputs */}
      <div className="space-y-3 lg:space-y-4">
        <Card className="border-[hsl(var(--optavia-green))/30]">
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between gap-3">
              <div>
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <UserRound className="h-4 w-4 text-[hsl(var(--optavia-green))]" />
                  Coach Posting Profile
                </CardTitle>
                <CardDescription className="text-xs mt-1">
                  Save your voice, niche, and style once. The generator can reuse it every time.
                </CardDescription>
              </div>
              <Button
                variant={useSavedProfile ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  const next = !useSavedProfile
                  setUseSavedProfile(next)
                  if (next) {
                    setPostVoice(profileVoice ?? "none")
                    setPostNicheFocus(profileNiches[0] ?? "none")
                    setPostStoryAnchor(profileStory || "")
                    setPostEmojiStyle(profileEmojiPref ?? "none")
                    setPostHashtagStyle(profileHashtagPref ?? "none")
                    setPersonalTouches(profileTouches)
                  }
                }}
                disabled={!hasSavedProfileDefaults}
                className={useSavedProfile ? "bg-[hsl(var(--optavia-green))] hover:bg-[hsl(var(--optavia-green-dark))] text-white" : ""}
              >
                {!hasSavedProfileDefaults
                  ? "Profile Not Set"
                  : useSavedProfile
                  ? "Using Saved Profile"
                  : "Use Saved Profile"}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {!hasSavedProfileDefaults ? (
              <div className="mb-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                Profile defaults are not set yet. Open this section and save your coach profile so prompts can use your voice automatically.
              </div>
            ) : useSavedProfile ? (
              <div className="mb-3 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-xs text-green-800">
                Post Generator is currently using your saved coach profile defaults.
              </div>
            ) : (
              <div className="mb-3 rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-700">
                Saved profile found, but it is currently turned off for prompt generation.
              </div>
            )}
            <Accordion type="single" collapsible>
              <AccordionItem value="profile">
                <AccordionTrigger className="py-2 text-xs text-gray-600 hover:no-underline">
                  Edit saved profile preferences
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pt-1">
                  <div>
                    <Label className="text-xs font-semibold mb-2 block">Voice</Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {VOICE_SUGGESTIONS.map((option) => {
                        const selected = profileVoice === option.id
                        return (
                          <button
                            key={option.id}
                            type="button"
                            onClick={() => setProfileVoice(option.id)}
                            className={`rounded-md border px-2.5 py-2 text-left text-xs transition-colors ${
                              selected
                                ? "border-[hsl(var(--optavia-green))] bg-green-50 text-[hsl(var(--optavia-green-dark))]"
                                : "border-gray-200 hover:bg-gray-50"
                            }`}
                          >
                            <div className="font-medium">{option.emoji} {option.label}</div>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs font-semibold mb-2 block">Audience niches (up to 3)</Label>
                    <div className="flex flex-wrap gap-1.5">
                      {NICHE_SUGGESTIONS.map((option) => {
                        const selected = profileNiches.includes(option.id)
                        const disabled = !selected && profileNiches.length >= 3
                        return (
                          <button
                            key={option.id}
                            type="button"
                            disabled={disabled}
                            onClick={() => toggleProfileNiche(option.id)}
                            className={`rounded-full border px-2.5 py-1 text-xs transition-colors ${
                              selected
                                ? "border-[hsl(var(--optavia-green))] bg-green-50 text-[hsl(var(--optavia-green-dark))]"
                                : "border-gray-200 hover:bg-gray-50"
                            } ${disabled ? "opacity-40 cursor-not-allowed" : ""}`}
                          >
                            {option.emoji} {option.label}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs font-semibold mb-1.5 block">Story anchor (one line)</Label>
                    <Input
                      value={profileStory}
                      onChange={(e) => setProfileStory(e.target.value)}
                      placeholder="e.g., Lost 60 lbs after baby #3"
                      className="h-9 text-sm"
                    />
                  </div>

                  <div>
                    <Label className="text-xs font-semibold mb-2 block">Personal touches</Label>
                    <div className="flex flex-wrap gap-1.5">
                      {TOUCH_OPTIONS.map((option) => {
                        const selected = profileTouches.includes(option.id)
                        return (
                          <button
                            key={option.id}
                            type="button"
                            onClick={() => toggleProfileTouch(option.id)}
                            className={`rounded-full border px-2.5 py-1 text-xs transition-colors ${
                              selected
                                ? "border-[hsl(var(--optavia-green))] bg-green-50 text-[hsl(var(--optavia-green-dark))]"
                                : "border-gray-200 hover:bg-gray-50"
                            }`}
                          >
                            {option.emoji} {option.label}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs font-semibold mb-1.5 block">Emoji style</Label>
                      <Select
                        value={profileEmojiPref ?? undefined}
                        onValueChange={(value) => setProfileEmojiPref(value as EmojiPreferenceId)}
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Select emoji style" />
                        </SelectTrigger>
                        <SelectContent>
                          {EMOJI_OPTIONS.map((option) => (
                            <SelectItem key={option.id} value={option.id}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs font-semibold mb-1.5 block">Hashtag style</Label>
                      <Select
                        value={profileHashtagPref ?? undefined}
                        onValueChange={(value) => setProfileHashtagPref(value as HashtagPreferenceId)}
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Select hashtag style" />
                        </SelectTrigger>
                        <SelectContent>
                          {HASHTAG_OPTIONS.map((option) => (
                            <SelectItem key={option.id} value={option.id}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={clearCoachProfile}
                      disabled={savingProfile}
                      className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                      Clear defaults
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      onClick={saveCoachProfile}
                      disabled={savingProfile}
                      className="bg-[hsl(var(--optavia-green))] hover:bg-[hsl(var(--optavia-green-dark))] text-white"
                    >
                      <Save className="h-3.5 w-3.5 mr-1.5" />
                      {savingProfile ? "Saving..." : "Save profile defaults"}
                    </Button>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>

        {/* Mood Selection */}
        <Card>
          <CardHeader className="pb-2 lg:pb-3">
            <CardTitle className="text-sm font-semibold">
              1. What&apos;s the mood/tone?
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div
              className={`grid gap-2 ${
                isPageLayout
                  ? "grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
                  : "grid-cols-2 sm:grid-cols-4 md:grid-cols-7"
              }`}
            >
              {MOOD_OPTIONS.map(option => (
                <button
                  key={option.value}
                  onClick={() => setMood(option.value)}
                  className={`p-2.5 rounded-lg border-2 text-left transition-all min-w-0 flex flex-col justify-center ${
                    isPageLayout ? "min-h-[68px]" : "min-h-[56px]"
                  } ${
                    mood === option.value
                      ? "border-[hsl(var(--optavia-green))] bg-green-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <span className={`font-medium text-sm block ${isPageLayout ? "leading-snug whitespace-normal" : "truncate"}`}>
                    {option.label}
                  </span>
                  <p
                    className={`text-xs text-gray-500 mt-0.5 ${
                      isPageLayout
                        ? "hidden lg:block whitespace-normal leading-snug"
                        : "hidden sm:block truncate"
                    }`}
                  >
                    {option.description}
                  </p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Topic Selection */}
        <Card>
          <CardHeader className="pb-2 lg:pb-3">
            <CardTitle className="text-sm font-semibold">
              2. What's the topic?
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <Select value={topic} onValueChange={setTopic}>
              <SelectTrigger className="w-full">
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

        {/* Optional: Specific detail */}
        <Card>
          <CardContent className="pt-4">
            <Label className="text-xs font-semibold mb-1.5 block text-gray-600">
              Specific detail to include (optional)
            </Label>
            <Input
              value={specificDetail}
              onChange={(e) => setSpecificDetail(e.target.value)}
              placeholder="e.g., 'I just hit 50 lbs lost' or 'posting on a Monday morning'"
              className="h-9 text-sm"
            />
          </CardContent>
        </Card>

        {/* Collapsed: Everything else */}
        <Card>
          <CardContent className="pt-2">
            <Accordion type="single" collapsible>
              <AccordionItem value="more-options">
                <AccordionTrigger className="py-2 text-sm font-semibold hover:no-underline">
                  More options (platform, length, touches, overrides)
                </AccordionTrigger>
                <AccordionContent className="space-y-5 pt-2">
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

                  <div>
                    <Label className="text-xs font-semibold mb-1.5 block text-gray-600">
                      Additional context (optional)
                    </Label>
                    <Textarea
                      value={customContext}
                      onChange={(e) => setCustomContext(e.target.value)}
                      placeholder="e.g., 'I'm doing a 5-day challenge this week'"
                      rows={2}
                      className="text-sm"
                    />
                  </div>

                  <div>
                    <Label className="text-xs font-semibold mb-2 block text-gray-600">Personal touches</Label>
                    <div className={`flex flex-wrap ${isPageLayout ? "gap-2" : "gap-1.5"}`}>
                      {PERSONAL_TOUCH_OPTIONS.map(option => (
                        <button
                          key={option.value}
                          onClick={() => togglePersonalTouch(option.value)}
                          className={`${isPageLayout ? "px-3 py-1.5 text-sm min-h-9" : "px-2 py-1 text-xs"} rounded-full transition-all whitespace-nowrap ${
                            personalTouches.includes(option.value)
                              ? "bg-[hsl(var(--optavia-green))] text-white"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-gray-100 pt-4">
                    <p className="text-xs font-semibold text-gray-500 mb-3">Per-post overrides</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs font-semibold mb-1.5 block text-gray-600">Voice style</Label>
                        <Select value={postVoice} onValueChange={(value) => setPostVoice(value as VoiceSelectValue)}>
                          <SelectTrigger className="h-9">
                            <SelectValue placeholder="No override" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">No override</SelectItem>
                            {VOICE_SUGGESTIONS.map((option) => (
                              <SelectItem key={option.id} value={option.id}>
                                {option.emoji} {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-xs font-semibold mb-1.5 block text-gray-600">Audience focus</Label>
                        <Select value={postNicheFocus} onValueChange={(value) => setPostNicheFocus(value as NicheSelectValue)}>
                          <SelectTrigger className="h-9">
                            <SelectValue placeholder="General audience" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">General audience</SelectItem>
                            {NICHE_SUGGESTIONS.map((option) => (
                              <SelectItem key={option.id} value={option.id}>
                                {option.emoji} {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="mt-3">
                      <Label className="text-xs font-semibold mb-1.5 block text-gray-600">Story anchor for this post</Label>
                      <Input
                        value={postStoryAnchor}
                        onChange={(e) => setPostStoryAnchor(e.target.value)}
                        placeholder="Optional one-liner to weave into this post"
                        className="h-9 text-sm"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                      <div>
                        <Label className="text-xs font-semibold mb-1.5 block text-gray-600">Emoji style</Label>
                        <Select value={postEmojiStyle} onValueChange={(value) => setPostEmojiStyle(value as EmojiSelectValue)}>
                          <SelectTrigger className="h-9">
                            <SelectValue placeholder="No override" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">No override</SelectItem>
                            {EMOJI_OPTIONS.map((option) => (
                              <SelectItem key={option.id} value={option.id}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-xs font-semibold mb-1.5 block text-gray-600">Hashtag style</Label>
                        <Select value={postHashtagStyle} onValueChange={(value) => setPostHashtagStyle(value as HashtagSelectValue)}>
                          <SelectTrigger className="h-9">
                            <SelectValue placeholder="No override" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">No override</SelectItem>
                            {HASHTAG_OPTIONS.map((option) => (
                              <SelectItem key={option.id} value={option.id}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>

        {/* Generate Button */}
        <div className="flex gap-2">
          <Button
            onClick={generatePrompt}
            className={`flex-1 bg-[hsl(var(--optavia-green))] hover:bg-[hsl(var(--optavia-green-dark))] text-white ${isPageLayout ? "h-10" : ""}`}
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
      <div className={`h-fit space-y-3 ${isPageLayout ? "lg:sticky lg:top-20" : "lg:sticky lg:top-4"}`}>
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
                <div className={`bg-gray-50 rounded-lg p-3 overflow-y-auto ${isPageLayout ? "max-h-[320px] lg:max-h-[560px]" : "max-h-[250px] lg:max-h-[400px]"}`}>
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
                  Review defaults (optional), then click "Generate Prompt"
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
    </div>
  )
}
