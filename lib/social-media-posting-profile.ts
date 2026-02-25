export const VOICE_SUGGESTIONS = [
  { id: "warm-encouraging", label: "Warm & Encouraging", emoji: "🤗", example: "I'm so proud of you for showing up today!" },
  { id: "funny-real", label: "Funny & Real", emoji: "😂", example: "I meal prepped in my pajamas at 11pm and honestly? Still counts." },
  { id: "no-bs-direct", label: "No-BS & Direct", emoji: "💪", example: "Stop waiting for Monday. Start now. You already know what to do." },
  { id: "gentle-nurturing", label: "Gentle & Nurturing", emoji: "🌸", example: "Take a breath. You don't have to be perfect - you just have to keep going." },
  { id: "energetic-hype", label: "Energetic & Hype", emoji: "🔥", example: "LET'S GOOO!! Another client just hit their goal and I'm SCREAMING!!" },
  { id: "calm-wise", label: "Calm & Wise", emoji: "🧘", example: "The journey isn't about speed. It's about learning to trust yourself again." },
  { id: "faith-led", label: "Faith-Led & Uplifting", emoji: "🙏", example: "God didn't bring you this far to leave you here. Keep walking in faith." },
  { id: "relatable-neighbor", label: "Girl Next Door", emoji: "👋", example: "Ok but why did nobody tell me healthy food could actually taste good??" },
] as const

export const NICHE_SUGGESTIONS = [
  { id: "busy-moms", label: "Busy Moms", emoji: "👩‍👧‍👦" },
  { id: "working-professionals", label: "Working Professionals", emoji: "💼" },
  { id: "over-40", label: "Women Over 40", emoji: "✨" },
  { id: "over-50", label: "Adults 50+", emoji: "🌟" },
  { id: "postpartum", label: "Postpartum Moms", emoji: "🍼" },
  { id: "newlyweds-couples", label: "Newlyweds & Couples", emoji: "💍" },
  { id: "men-health", label: "Men's Health", emoji: "🏋️" },
  { id: "college-students", label: "College Students", emoji: "🎓" },
  { id: "empty-nesters", label: "Empty Nesters", emoji: "🏡" },
  { id: "faith-community", label: "Faith Community", emoji: "⛪" },
  { id: "corporate-teams", label: "Corporate Teams", emoji: "🏢" },
  { id: "military-families", label: "Military Families", emoji: "🎖️" },
  { id: "chronic-fatigue", label: "Low Energy / Chronic Fatigue", emoji: "😴" },
  { id: "emotional-eaters", label: "Emotional Eaters", emoji: "💜" },
  { id: "diabetic-prediabetic", label: "Diabetic / Pre-Diabetic", emoji: "🩺" },
  { id: "anyone", label: "A Little Bit of Everyone", emoji: "🌈" },
] as const

export const TOUCH_OPTIONS = [
  { id: "kids", emoji: "👶", label: "Kids" },
  { id: "spouse", emoji: "💑", label: "Spouse/Partner" },
  { id: "pet", emoji: "🐾", label: "Pet" },
  { id: "dayjob", emoji: "💼", label: "Day Job" },
  { id: "busyparent", emoji: "🏃", label: "Busy Parent" },
  { id: "workingparent", emoji: "👔", label: "Working Parent" },
  { id: "emptynester", emoji: "🏡", label: "Empty Nester" },
  { id: "grandparent", emoji: "👴", label: "Grandparent" },
  { id: "fitness", emoji: "🏋️", label: "Fitness Journey" },
  { id: "cooking", emoji: "🍳", label: "Love of Cooking" },
  { id: "travel", emoji: "✈️", label: "Travel/Adventure" },
  { id: "faith", emoji: "🙏", label: "Faith-Based" },
  { id: "career", emoji: "📈", label: "Career Professional" },
  { id: "student", emoji: "🎓", label: "Student" },
  { id: "military", emoji: "🎖️", label: "Military/Veteran" },
  { id: "newlywed", emoji: "💍", label: "Newlywed" },
  { id: "seniorwellness", emoji: "🧘", label: "Senior Wellness" },
  { id: "mentalhealth", emoji: "🧠", label: "Mental Health" },
] as const

export const EMOJI_OPTIONS = [
  { id: "minimal", label: "Minimal", desc: "Just 1-2 per post", preview: "One emoji here and there 💛" },
  { id: "moderate", label: "Moderate", desc: "A few throughout", preview: "Sprinkled in naturally ✨ to add warmth 💪" },
  { id: "heavy", label: "Lots!", desc: "Emoji-rich posts", preview: "🔥 Love this energy!! 💜✨ So proud 🎉🙌" },
] as const

export const HASHTAG_OPTIONS = [
  { id: "auto", label: "Auto-pick for me", desc: "AI chooses the best ones" },
  { id: "minimal", label: "Just a few (3-5)", desc: "Clean and targeted" },
  { id: "full", label: "Full set (15-30)", desc: "Maximum reach" },
  { id: "none", label: "No hashtags", desc: "I'll add my own" },
] as const

export type VoiceSuggestionId = (typeof VOICE_SUGGESTIONS)[number]["id"]
export type NicheSuggestionId = (typeof NICHE_SUGGESTIONS)[number]["id"]
export type TouchOptionId = (typeof TOUCH_OPTIONS)[number]["id"]
export type EmojiPreferenceId = (typeof EMOJI_OPTIONS)[number]["id"]
export type HashtagPreferenceId = (typeof HASHTAG_OPTIONS)[number]["id"]

export interface CoachPostingPreferences {
  voice: VoiceSuggestionId | null
  niches: NicheSuggestionId[]
  story: string
  touches: TouchOptionId[]
  emojiPref: EmojiPreferenceId | null
  hashtagPref: HashtagPreferenceId | null
  updated_at: string
}

