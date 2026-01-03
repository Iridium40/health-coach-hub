"use client"

import { useState, useEffect } from "react"
import { CheckCircle, Circle, ChevronRight, ChevronDown, FileText, Clock, Star, ArrowLeft, ArrowRight, Video, MessageCircle, Copy, Check, TrendingUp, Lightbulb, Play, ExternalLink, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/use-auth"
import { useSupabaseData } from "@/hooks/use-supabase-data"

interface Benefit {
  icon: string
  benefit: string
  description: string
}

interface Pillar {
  number: number
  name: string
  icon: string
  description: string
  tips: string[]
}

interface ContentCategory {
  category: string
  color: string
  borderColor: string
  examples: string[]
  why: string
}

interface Platform {
  platform: string
  icon: string
  bestFor: string
  tips: string[]
  priority: string
}

interface ScheduleDay {
  theme: string
  ideas: string
}

interface EngagementTip {
  action: string
  detail: string
}

interface DontItem {
  dont: string
  why: string
}

interface Stat {
  stat: string
  label: string
}

interface VideoDetails {
  title: string
  duration: string
  vimeoId: string
  covers: string[]
}

interface StepItem {
  step: number
  title: string
  instruction: string
  ideas?: string[]
  tips?: string[]
}

interface ReelIdea {
  type: string
  description: string
  examples: string[]
  difficulty: string
}

interface DosDonts {
  dos: string[]
  donts: string[]
}

interface AZMethodItem {
  letter: string
  word: string
  description: string
  example: string
}

interface FullExample {
  theirComment: string
  response: string
}

interface Situation {
  situation: string
  icon: string
  starters: string[]
}

interface FrameworkItem {
  letter: string
  word: string
  description: string
  example: string
  timeframe: string
}

interface Script {
  label: string
  script?: string
  message?: string
}

interface Section {
  title: string
  content?: string
  benefits?: Benefit[]
  pillars?: Pillar[]
  categories?: ContentCategory[]
  platforms?: Platform[]
  schedule?: Record<string, ScheduleDay>
  engagementTips?: EngagementTip[]
  donts?: DontItem[]
  videoSection?: boolean
  videoDetails?: VideoDetails
  stats?: Stat[]
  steps?: StepItem[]
  reelIdeas?: ReelIdea[]
  dosDonts?: DosDonts
  azMethod?: AZMethodItem[]
  fullExample?: FullExample
  situations?: Situation[]
  framework?: FrameworkItem[]
  buyingSignals?: string[]
  transitionScripts?: Script[]
  templates?: Script[]
}

interface Lesson {
  id: string
  title: string
  type: string
  icon: typeof TrendingUp
  duration: string
  canvaLink?: string
  content: {
    intro: string
    sections: Section[]
    keyTakeaways: string[]
  }
}

const lessons: Lesson[] = [
  {
    id: "4.1.1",
    title: "Using Social Media to Build Your Business",
    type: "Strategy",
    icon: TrendingUp,
    duration: "15 min read",
    content: {
      intro: "Social media is your FREE billboard to the world. When used strategically, it attracts clients to you instead of you chasing them. This lesson teaches you how to show up consistently, provide value, and turn followers into clients.",
      sections: [
        {
          title: "Why Social Media Matters for Your Business",
          content: "Social media allows you to reach hundreds or thousands of people without leaving your home. It builds trust over time, showcases your transformation, and positions you as someone worth following.",
          benefits: [
            { icon: "👀", benefit: "Visibility", description: "People can't buy from you if they don't know you exist" },
            { icon: "🤝", benefit: "Trust Building", description: "Consistent posting builds familiarity and credibility" },
            { icon: "🧲", benefit: "Attraction Marketing", description: "People come to YOU instead of you chasing them" },
            { icon: "💰", benefit: "Free Advertising", description: "No cost to reach your audience daily" },
          ],
        },
        {
          title: "The 3 Pillars of Social Media Success",
          pillars: [
            { number: 1, name: "Consistency", icon: "📆", description: "Post regularly – ideally daily. The algorithm rewards consistency, and so do your followers. Showing up every day keeps you top of mind.", tips: ["Set a posting schedule and stick to it", "Batch create content when you have energy", "Use scheduling tools if helpful", "Something is better than nothing – post even if it's not perfect"] },
            { number: 2, name: "Authenticity", icon: "💚", description: "Be REAL. Share your actual journey – the wins AND the struggles. People connect with humans, not highlight reels. Your imperfections make you relatable.", tips: ["Share your real story, not a perfect facade", "Show behind-the-scenes moments", "Be vulnerable about challenges", "Let your personality shine through"] },
            { number: 3, name: "Value", icon: "🎁", description: "Give more than you ask. Educate, inspire, and entertain your audience. When you provide value consistently, asking for business feels natural.", tips: ["Teach something helpful in your posts", "Share tips your audience can use today", "Inspire with your transformation", "Entertain with relatable content"] },
          ],
        },
        {
          title: "Content Categories: The 80/20 Rule",
          content: "80% of your content should provide VALUE. Only 20% should directly promote your business. This ratio builds trust without feeling salesy.",
          categories: [
            { category: "Lifestyle & Personal (30%)", color: "#e3f2fd", borderColor: "#2196f3", examples: ["Your morning routine", "Family moments", "Hobbies and interests", "Day in your life", "What you're grateful for"], why: "People buy from people they LIKE. Let them see the real you." },
            { category: "Value & Education (30%)", color: "#e8f5e9", borderColor: "#4caf50", examples: ["Health tips", "Recipe ideas", "Mindset motivation", "Quick workout tips", "Meal prep hacks"], why: "Position yourself as a helpful resource, not just a salesperson." },
            { category: "Transformation & Results (20%)", color: "#fff8e1", borderColor: "#ffc107", examples: ["Your before/after photos", "Client success stories (with permission)", "Non-scale victories", "Energy and mood changes", "Milestone celebrations"], why: "Show PROOF that what you do works. Results speak louder than words." },
            { category: "Business & Opportunity (20%)", color: "#fce4ec", borderColor: "#e91e63", examples: ["Why you became a coach", "What you love about OPTAVIA", "Income or freedom stories", "Invitations to learn more", "Program highlights"], why: "This is where you invite people to work with you – but only 20%!" },
          ],
        },
        {
          title: "Platform Strategy",
          platforms: [
            { platform: "Instagram", icon: "📸", bestFor: "Visual content, Reels, Stories, building relationships", tips: ["Post to Feed 4-5x/week", "Use Stories daily (polls, questions, behind-scenes)", "Reels get the most reach – aim for 2-3/week", "Engage in DMs – that's where business happens"], priority: "high" },
            { platform: "Facebook", icon: "👥", bestFor: "Longer posts, community building, connecting with existing network", tips: ["Post to Feed 3-5x/week", "Use Stories (many people forget FB has them!)", "Engage in groups where your audience hangs out", "Facebook is great for your existing warm market"], priority: "high" },
            { platform: "TikTok", icon: "🎵", bestFor: "Short-form video, reaching new audiences, going viral", tips: ["Great for reaching people outside your network", "Authentic, unpolished content performs well", "Trending sounds boost visibility", "Can repurpose Instagram Reels here"], priority: "medium" },
          ],
        },
        {
          title: "Weekly Posting Schedule",
          schedule: {
            monday: { theme: "Motivation Monday", ideas: "Mindset tip, inspirational quote, weekly intention" },
            tuesday: { theme: "Transformation Tuesday", ideas: "Before/after, progress pics, client wins" },
            wednesday: { theme: "Wellness Wednesday", ideas: "Health tip, recipe, workout idea" },
            thursday: { theme: "Thankful Thursday", ideas: "Gratitude post, appreciate your community" },
            friday: { theme: "Fun Friday", ideas: "Lighter content, weekend plans, personality" },
            saturday: { theme: "Story Saturday", ideas: "Share a personal story, behind the scenes" },
            sunday: { theme: "Self-Care Sunday", ideas: "Rest, reflection, prep for the week" },
          },
        },
        {
          title: "Engagement: The Secret Sauce",
          content: "Posting is only HALF the equation. Engaging with others is equally important. The algorithm rewards accounts that are active, not just broadcasting.",
          engagementTips: [
            { action: "Respond to every comment", detail: "Shows you care and boosts your post's visibility" },
            { action: "Comment on others' posts", detail: "Spend 15-30 min daily engaging genuinely with your audience" },
            { action: "Reply to DMs quickly", detail: "This is where relationships and sales happen" },
            { action: "Use Stories for interaction", detail: "Polls, questions, and quizzes drive engagement" },
            { action: "Go Live occasionally", detail: "Live video gets priority in the algorithm and builds connection" },
          ],
        },
        {
          title: "What NOT to Do",
          donts: [
            { dont: "Don't spam your links", why: 'Nobody wants to see "DM me!" on every post. Provide value first.' },
            { dont: "Don't be inconsistent", why: "Posting once a month won't build momentum. Show up regularly." },
            { dont: "Don't compare yourself", why: "Your Day 1 isn't someone else's Day 1000. Run your own race." },
            { dont: "Don't be inauthentic", why: "Copying others exactly won't work. Be YOU – that's your superpower." },
            { dont: "Don't get discouraged by metrics", why: "Likes don't pay bills. One client from a post with 5 likes is still a win!" },
          ],
        },
      ],
      keyTakeaways: ["Consistency beats perfection – show up daily", "80% value, 20% business promotion", "Engagement is as important as posting", "Be authentically YOU – that's what attracts people"],
    },
  },
  {
    id: "4.1.2",
    title: "How to Create a Simple Reel",
    type: "Video Tutorial",
    icon: Video,
    duration: "10 min watch",
    content: {
      intro: "Reels are the #1 way to grow on Instagram right now. They get 2x more reach than regular posts! This tutorial walks you through creating simple, effective Reels – even if you've never made one before.",
      sections: [
        {
          title: "Why Reels Matter",
          content: "Instagram's algorithm LOVES Reels. They're shown to people who don't follow you yet, making them the best way to attract new followers and potential clients.",
          stats: [
            { stat: "2x", label: "More reach than static posts" },
            { stat: "67%", label: "Higher engagement rate" },
            { stat: "#1", label: "Discovery tool on Instagram" },
          ],
        },
        {
          title: "Tutorial Video",
          videoSection: true,
          videoDetails: { title: "How to Create a Simple Reel", duration: "~8 minutes", vimeoId: "805182567", covers: ["Opening the Reels camera", "Recording clips", "Adding trending audio", "Basic editing and text", "Writing engaging captions", "Best posting practices"] },
        },
        {
          title: "Step-by-Step Reel Creation",
          steps: [
            { step: 1, title: "Choose Your Content", instruction: "Pick ONE simple idea. The best Reels are focused on a single message.", ideas: ["What I eat in a day", "3 tips for [topic]", "Day in my life", "Before & after reveal", "Get ready with me", "POV: You started OPTAVIA"] },
            { step: 2, title: "Find Trending Audio", instruction: "Use audio that's trending – you'll see a small arrow next to popular sounds. Trending audio gets more reach!", tips: ["Save audios you like when scrolling", "Check what sounds other coaches are using", "Original audio works too for talking Reels"] },
            { step: 3, title: "Record Your Clips", instruction: "Keep it simple! You can record multiple short clips or one longer take.", tips: ["Good lighting makes a huge difference (face a window!)", "Clean, uncluttered background", "Hold phone steady or use a tripod", "Record more than you need – you can trim later"] },
            { step: 4, title: "Edit Simply", instruction: "Don't overcomplicate it. Basic edits work great!", tips: ["Trim clips to remove awkward starts/ends", "Add text to highlight key points", "Use captions for accessibility", "Keep total length 15-30 seconds for best engagement"] },
            { step: 5, title: "Write a Strong Caption", instruction: "Your caption should add value or invite engagement.", tips: ['Hook them in the first line', 'Include a call-to-action ("Save this!" "Comment below!")', "Use 3-5 relevant hashtags", "Ask a question to drive comments"] },
            { step: 6, title: "Post at the Right Time", instruction: "Post when your audience is online. Check your Instagram Insights!", tips: ["Generally: 6-9 AM, 12-2 PM, 7-9 PM", "Check YOUR insights for your specific audience", "Consistency matters more than perfect timing"] },
          ],
        },
        {
          title: "Easy Reel Ideas for Coaches",
          reelIdeas: [
            { type: "Talking Head", description: "Just you talking to the camera", examples: ["3 things I wish I knew before starting", "Why I became a health coach", "The truth about [topic]"], difficulty: "Easy" },
            { type: "Day in My Life", description: "Multiple clips showing your routine", examples: ["What I eat in a day on OPTAVIA", "My morning routine", "Meal prep with me"], difficulty: "Easy" },
            { type: "Before & After", description: "Transformation reveal", examples: ["My 30-day transformation", "Before OPTAVIA vs now", "POV: You finally feel confident"], difficulty: "Easy" },
            { type: "Tips & Lists", description: "Educational content with text overlay", examples: ["5 mistakes new clients make", "3 ways to stay on track", "Foods I eat every day"], difficulty: "Easy" },
            { type: "Trending Audio", description: "Lip sync or act out to popular sounds", examples: ["When someone asks how I lost the weight", "Me explaining OPTAVIA to my family"], difficulty: "Medium" },
            { type: "Get Ready With Me", description: "Talk while doing hair/makeup/getting dressed", examples: ["GRWM while I share my health journey", "Chatty GRWM about my coaching business"], difficulty: "Medium" },
          ],
        },
        {
          title: "Reel Do's and Don'ts",
          dosDonts: {
            dos: ["Hook viewers in the first 1-2 seconds", "Use captions – many watch without sound", "Keep it under 30 seconds when starting out", "Post consistently (aim for 2-3 Reels/week)", "Engage with comments within the first hour"],
            donts: ["Don't use copyrighted music (use Instagram's library)", "Don't put too much text on screen", "Don't worry about being perfect", "Don't delete low-performing Reels (give them time!)", "Don't compare your Reel views to influencers"],
          },
        },
      ],
      keyTakeaways: ["Reels get more reach than any other content type", "Simple Reels perform just as well as fancy ones", "Use trending audio to boost visibility", "Done is better than perfect – just start posting!"],
    },
  },
  {
    id: "4.1.3",
    title: "How to Have Effective Conversations",
    type: "Scripts",
    icon: MessageCircle,
    duration: "12 min read",
    canvaLink: "https://www.canva.com/design/DAGwKmV4-qY/jcb8D4BueFoAYZsc8uERiQ/view",
    content: {
      intro: "Social media isn't just about posting – it's about CONVERSATIONS. The real magic happens in the comments and DMs. This lesson teaches you how to start conversations naturally and move them toward Health Assessments.",
      sections: [
        {
          title: "The A-Z Commenting Strategy",
          content: "When someone comments on your post or you comment on theirs, use the A-Z method to keep the conversation going:",
          azMethod: [
            { letter: "A", word: "Acknowledge", description: "Thank them or validate what they said", example: "Thank you so much! That means a lot! 💚" },
            { letter: "B", word: "Bridge", description: "Connect their comment to a deeper topic", example: "I totally get that – I felt the same way before I started!" },
            { letter: "Z", word: "Zoom In", description: "Ask a follow-up question to continue the conversation", example: "What's been your biggest challenge with [topic]?" },
          ],
          fullExample: { theirComment: "Wow you look amazing! I need to do something about my health too.", response: "Thank you so much! 💚 I totally understand – I was in that exact spot 6 months ago and finally decided to do something about it. What's been holding you back from making a change?" },
        },
        {
          title: "Conversation Starters by Situation",
          situations: [
            { situation: "When They Comment on Your Post", icon: "💬", starters: ["Thank you! What resonated with you most?", "I appreciate that! Are you on a health journey too?", "Thanks for being here! What's your biggest goal right now?", "So glad this helped! What's your biggest challenge with [topic]?"] },
            { situation: "When They View Your Story", icon: "👀", starters: ["Hey! Thanks for watching my story! How are you doing?", "I saw you caught my story! What did you think?", "Hey girl! Haven't chatted in a while – how's everything going?", "Thanks for the support! What's new with you?"] },
            { situation: "When Commenting on Their Post", icon: "❤️", starters: ["Love this! You always brighten my feed! 💚", "This is so relatable! I felt the same way when...", "You're killing it! What's your secret?", "I needed to see this today – thank you for sharing!"] },
            { situation: "Re-Engaging an Old Connection", icon: "🔄", starters: ["Hey! Your post popped up and made me think of you! How have you been?", "I can't believe we haven't talked in so long! What's new in your world?", "Just thinking about you! How's life treating you?", "Your page looks amazing! I'd love to catch up – what's been going on?"] },
            { situation: "After They Attend an Event", icon: "🎉", starters: ["So glad you could make it! What was your biggest takeaway?", "Thanks for joining! Did anything surprise you?", "It was great having you there! Any questions I can answer?", "I saw you watched the training! What did you think?"] },
            { situation: "When They Express Interest", icon: "🌟", starters: ["I'm so glad you reached out! Tell me more about what you're looking for.", "I'd love to help! What made you interested in making a change?", "That's exciting! What's your biggest health goal right now?", "I'm here for you! What would success look like for you?"] },
          ],
        },
        {
          title: "The CARE Framework for DM Conversations",
          framework: [
            { letter: "C", word: "Connect", description: "Start with genuine connection – NOT business", example: "Ask about their life, kids, job, recent post", timeframe: "First 2-3 messages" },
            { letter: "A", word: "Ask", description: "Ask questions to understand their situation", example: "What's going on in their life? What are they struggling with?", timeframe: "After building rapport" },
            { letter: "R", word: "Relate", description: "Share your own similar experience", example: '"I totally get it – I was in the exact same spot before..."', timeframe: "When they share struggles" },
            { letter: "E", word: "Explore", description: "Explore if they're open to learning more", example: '"Would you be open to hearing what helped me?"', timeframe: "Only when there's genuine interest" },
          ],
        },
        {
          title: "Moving to a Health Assessment",
          content: "The goal is to transition naturally from casual conversation to a Health Assessment. Never force it – look for buying signals.",
          buyingSignals: ["They ask how you lost weight", "They mention wanting to make a change", "They express frustration with their current situation", "They ask about OPTAVIA specifically", 'They say things like "I need to do something"'],
          transitionScripts: [
            { label: "When they ask about your results", script: "I'd love to share more about what's worked for me! Would you be open to a quick call so I can learn more about your goals and see if it might be a good fit? No pressure at all – just a conversation!" },
            { label: "When they express frustration", script: "I hear you – that's exactly how I felt before I found something that actually worked. I'd love to tell you more about my experience. Would you be open to hopping on a quick call? I promise it's super casual!" },
            { label: "When they seem interested but hesitant", script: "I totally get being skeptical – I was too! What if we just did a quick 15-minute chat? You can ask me anything, and there's zero obligation. Worst case, you walk away with some tips!" },
            { label: "Soft close", script: 'It sounds like you\'re really ready for a change. I\'d love to connect you with some more info! The best way is a quick Health Assessment call – it\'s free, takes about 20 minutes, and I can answer all your questions. How does [day/time] work?' },
          ],
        },
        {
          title: "Conversation Do's and Don'ts",
          dosDonts: {
            dos: ["Lead with genuine curiosity about THEM", "Listen more than you talk (70/30 rule)", "Follow up consistently (don't ghost!)", "Be patient – relationships take time", "Celebrate their wins even if they're not clients"],
            donts: ["Don't pitch immediately in DMs", "Don't copy/paste the same message to everyone", "Don't be pushy or salesy", "Don't take 'not now' as a personal rejection", "Don't give up after one conversation"],
          },
        },
        {
          title: "Follow-Up Message Templates",
          templates: [
            { label: "24-hour follow-up (no response)", message: "Hey! Just wanted to bump this in case it got buried. No worries if the timing isn't right – just want to make sure you saw my message! 💚" },
            { label: "After they said 'not right now'", message: "Totally understand! I'll check back in a few weeks. In the meantime, feel free to reach out if anything changes. Rooting for you! 🙌" },
            { label: "Re-engaging after a while", message: "Hey! I was thinking about you today and wanted to check in. How have things been going? Still thinking about making some changes? I'm here whenever you're ready! 💚" },
            { label: "After a great conversation", message: "I loved chatting with you! I'm so excited to see where your journey takes you. Let me know if you have any questions before our call on [date]. Talk soon!" },
          ],
        },
      ],
      keyTakeaways: ["Use the A-Z method: Acknowledge, Bridge, Zoom In", "Follow the CARE framework: Connect, Ask, Relate, Explore", "Never pitch immediately – build genuine relationships first", "Follow up consistently – most people need multiple touchpoints"],
    },
  },
]

export function SocialMediaBusinessContent() {
  const { toast } = useToast()
  const { user } = useAuth()
  const { completedResources, toggleCompletedResource } = useSupabaseData(user)
  const [expandedLesson, setExpandedLesson] = useState(lessons[0].id)
  const [copiedScript, setCopiedScript] = useState<string | null>(null)
  const [expandedSection, setExpandedSection] = useState<string | null>(null)

  const getResourceId = (lessonId: string) => `social-media-business-${lessonId}`

  const completedLessons = new Set(lessons.map((lesson) => lesson.id).filter((lessonId) => completedResources.includes(getResourceId(lessonId))))

  useEffect(() => {
    const saved = localStorage.getItem("socialMediaBusinessExpanded")
    if (saved) {
      try {
        const lessonId = JSON.parse(saved)
        if (lessons.some((l) => l.id === lessonId)) {
          setExpandedLesson(lessonId)
        }
      } catch (e) {
        console.error("Failed to load expanded lesson", e)
      }
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("socialMediaBusinessExpanded", JSON.stringify(expandedLesson))
  }, [expandedLesson])

  const toggleComplete = async (lessonId: string) => {
    if (!user) {
      toast({ title: "Please sign in", description: "You need to be signed in to track your progress.", variant: "destructive" })
      return
    }

    const resourceId = getResourceId(lessonId)
    await toggleCompletedResource(resourceId)

    const isNowCompleted = !completedLessons.has(lessonId)
    toast({ title: isNowCompleted ? "Lesson completed!" : "Lesson unmarked", description: isNowCompleted ? "Great progress! Your coach can see this." : "You can complete it later." })
  }

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedScript(id)
      setTimeout(() => setCopiedScript(null), 2000)
      toast({ title: "Copied!", description: "Script copied to clipboard." })
    } catch {
      toast({ title: "Failed to copy", description: "Please try again.", variant: "destructive" })
    }
  }

  const completedCount = completedLessons.size
  const progressPercent = lessons.length > 0 ? Math.round((completedCount / lessons.length) * 100) : 0

  const currentLessonIndex = lessons.findIndex((l) => l.id === expandedLesson)
  const currentLesson = lessons[currentLessonIndex]
  const prevLesson = currentLessonIndex > 0 ? lessons[currentLessonIndex - 1] : null
  const nextLesson = currentLessonIndex < lessons.length - 1 ? lessons[currentLessonIndex + 1] : null

  const renderCopyableScript = (script: Script, id: string) => (
    <div className="bg-gray-50 rounded-lg p-4 mb-3 border border-gray-200">
      {script.label && <div className="text-xs font-semibold text-[hsl(var(--optavia-green))] mb-2 uppercase">{script.label}</div>}
      <p className="text-sm text-optavia-dark italic leading-relaxed mb-3">"{script.script || script.message}"</p>
      <Button onClick={() => copyToClipboard(script.script || script.message || "", id)} variant={copiedScript === id ? "default" : "outline"} size="sm" className={copiedScript === id ? "bg-[hsl(var(--optavia-green))] hover:bg-[hsl(var(--optavia-green-dark))]" : ""}>
        {copiedScript === id ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
        {copiedScript === id ? "Copied!" : "Copy"}
      </Button>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-[hsl(var(--optavia-green))] to-[hsl(var(--optavia-green-dark))] text-white py-8 shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 text-sm opacity-90 mb-2 uppercase tracking-wide">
            <span>Training Center</span>
            <ChevronRight className="h-4 w-4" />
            <span>Phase 4: Growing to Senior Coach</span>
            <ChevronRight className="h-4 w-4" />
            <span className="font-semibold">Module 4.1</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Social Media for Business Growth</h1>
          <p className="text-lg opacity-90 max-w-2xl">Use social media consistently to attract clients and grow your coaching business.</p>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="grid lg:grid-cols-[320px_1fr] gap-8">
          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Phase Badge */}
            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-300 text-center">
              <CardContent className="pt-6">
                <div className="text-4xl mb-2">📈</div>
                <div className="font-bold text-green-800 text-sm">PHASE 4</div>
                <div className="text-sm text-green-700">Growing to Senior Coach</div>
              </CardContent>
            </Card>

            {/* Progress Card */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-sm font-semibold text-optavia-dark">Module Progress</CardTitle>
                  <span className="text-sm font-semibold text-[hsl(var(--optavia-green))]">
                    {completedCount}/{lessons.length} Complete
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <Progress value={progressPercent} className="h-2" />
              </CardContent>
            </Card>

            {/* Lesson List */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xs font-semibold text-optavia-gray uppercase tracking-wide">Lessons in this Module</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {lessons.map((lesson) => {
                  const Icon = lesson.icon
                  const isActive = expandedLesson === lesson.id
                  const isComplete = completedLessons.has(lesson.id)

                  return (
                    <button key={lesson.id} onClick={() => setExpandedLesson(lesson.id)} className={`w-full p-4 flex items-start gap-3 border-b border-gray-100 last:border-b-0 transition-colors text-left ${isActive ? "bg-green-50 border-l-4 border-l-[hsl(var(--optavia-green))]" : "hover:bg-gray-50"}`}>
                      <div className="mt-1">{isComplete ? <CheckCircle className="h-5 w-5 text-[hsl(var(--optavia-green))]" /> : <Circle className="h-5 w-5 text-gray-300" />}</div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold text-[hsl(var(--optavia-green))] mb-1">{lesson.id}</div>
                        <div className={`text-sm font-semibold mb-2 ${isActive ? "text-[hsl(var(--optavia-green))]" : "text-optavia-dark"}`}>{lesson.title}</div>
                        <div className="flex items-center gap-3 text-xs text-optavia-gray">
                          <Badge variant="outline" className="text-xs bg-gray-50">
                            <Icon className="h-3 w-3 mr-1" />
                            {lesson.type}
                          </Badge>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {lesson.duration}
                          </span>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </CardContent>
            </Card>

            {/* Pro Tip */}
            <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-300">
              <CardHeader>
                <div className="flex items-center gap-2 font-semibold text-amber-800">
                  <Lightbulb className="h-5 w-5 text-amber-600" />
                  Pro Tip
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-amber-900 leading-relaxed">The best time to post is when YOUR audience is online. Check your Instagram Insights to find your best times!</p>
              </CardContent>
            </Card>
          </aside>

          {/* Main Content */}
          <main>
            <Card>
              {/* Content Header */}
              <CardHeader className="border-b">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-xs font-semibold text-[hsl(var(--optavia-green))] uppercase tracking-wide mb-2">Lesson {currentLesson.id}</div>
                    <CardTitle className="text-2xl font-bold text-optavia-dark">{currentLesson.title}</CardTitle>
                  </div>
                  <Button onClick={() => toggleComplete(currentLesson.id)} variant={completedLessons.has(currentLesson.id) ? "default" : "outline"} className={completedLessons.has(currentLesson.id) ? "bg-[hsl(var(--optavia-green))] hover:bg-[hsl(var(--optavia-green-dark))]" : ""}>
                    {completedLessons.has(currentLesson.id) ? (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Completed
                      </>
                    ) : (
                      <>
                        <Circle className="h-4 w-4 mr-2" />
                        Mark Complete
                      </>
                    )}
                  </Button>
                </div>
              </CardHeader>

              {/* Canva Link if available */}
              {currentLesson.canvaLink && (
                <div className="px-8 pt-6">
                  <a href={currentLesson.canvaLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-5 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl border border-purple-200 hover:from-purple-100 hover:to-purple-200 transition-colors">
                    <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                      <FileText className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-purple-900">View Full Presentation in Canva</div>
                      <div className="text-sm text-purple-700">Visual guide with examples and templates</div>
                    </div>
                    <ExternalLink className="h-5 w-5 text-purple-600" />
                  </a>
                </div>
              )}

              <CardContent className="p-8">
                {/* Intro */}
                <div className="bg-green-50 border-l-4 border-[hsl(var(--optavia-green))] p-5 rounded-lg mb-8">
                  <p className="text-base leading-relaxed text-optavia-dark">{currentLesson.content.intro}</p>
                </div>

                {/* Sections */}
                {currentLesson.content.sections.map((section, idx) => (
                  <div key={idx} className="mb-10">
                    <h3 className="text-lg font-bold text-optavia-dark mb-4 flex items-center gap-3">
                      <span className="w-7 h-7 rounded-full bg-gradient-to-br from-[hsl(var(--optavia-green))] to-[hsl(var(--optavia-green-dark))] text-white flex items-center justify-center text-sm font-bold">{idx + 1}</span>
                      {section.title}
                    </h3>

                    {section.content && <p className="text-base leading-relaxed text-optavia-gray mb-5">{section.content}</p>}

                    {/* Benefits Grid */}
                    {section.benefits && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {section.benefits.map((item, i) => (
                          <div key={i} className="p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-xl">{item.icon}</span>
                              <span className="font-bold text-optavia-dark">{item.benefit}</span>
                            </div>
                            <p className="text-sm text-optavia-gray">{item.description}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Pillars */}
                    {section.pillars && (
                      <div className="space-y-3">
                        {section.pillars.map((pillar, i) => (
                          <div key={i} className="p-5 bg-gray-50 rounded-xl border-l-4 border-[hsl(var(--optavia-green))]">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="w-10 h-10 rounded-full bg-[hsl(var(--optavia-green))] text-white flex items-center justify-center font-bold">{pillar.number}</div>
                              <span className="text-2xl">{pillar.icon}</span>
                              <span className="font-bold text-lg text-optavia-dark">{pillar.name}</span>
                            </div>
                            <p className="text-sm text-optavia-gray leading-relaxed mb-3">{pillar.description}</p>
                            <div className="flex flex-wrap gap-2">
                              {pillar.tips.map((tip, j) => (
                                <Badge key={j} variant="secondary" className="text-xs bg-green-100 text-green-800">
                                  ✓ {tip}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Content Categories */}
                    {section.categories && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {section.categories.map((cat, i) => (
                          <div key={i} className="p-4 rounded-xl" style={{ backgroundColor: cat.color, borderLeft: `4px solid ${cat.borderColor}` }}>
                            <div className="font-bold text-optavia-dark mb-2">{cat.category}</div>
                            <div className="mb-2 space-y-1">
                              {cat.examples.map((ex, j) => (
                                <div key={j} className="text-sm text-optavia-gray">
                                  • {ex}
                                </div>
                              ))}
                            </div>
                            <div className="text-xs text-optavia-gray italic pt-2 border-t border-gray-200/50">💡 {cat.why}</div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Platforms */}
                    {section.platforms && (
                      <div className="space-y-3">
                        {section.platforms.map((plat, i) => (
                          <div key={i} className={`p-5 rounded-xl ${plat.priority === "high" ? "bg-green-50 border-2 border-[hsl(var(--optavia-green))]" : "bg-gray-50 border border-gray-200"}`}>
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <span className="text-3xl">{plat.icon}</span>
                                <span className="font-bold text-lg text-optavia-dark">{plat.platform}</span>
                              </div>
                              {plat.priority === "high" && <Badge className="bg-white text-[hsl(var(--optavia-green))] border border-green-300">HIGH PRIORITY</Badge>}
                            </div>
                            <p className="text-sm text-optavia-gray mb-3">
                              <strong>Best for:</strong> {plat.bestFor}
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {plat.tips.map((tip, j) => (
                                <Badge key={j} variant="outline" className="text-xs bg-white">
                                  {tip}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Weekly Schedule */}
                    {section.schedule && (
                      <div className="grid grid-cols-7 gap-2">
                        {Object.entries(section.schedule).map(([day, info], i) => (
                          <div key={day} className={`p-3 rounded-lg text-center ${i < 5 ? "bg-gray-50" : "bg-gray-100"}`}>
                            <div className="font-bold text-[hsl(var(--optavia-green))] text-xs uppercase mb-1">{day.slice(0, 3)}</div>
                            <div className="text-xs font-semibold text-optavia-dark mb-2">{info.theme}</div>
                            <div className="text-[10px] text-optavia-gray leading-tight">{info.ideas}</div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Engagement Tips */}
                    {section.engagementTips && (
                      <div className="space-y-2">
                        {section.engagementTips.map((tip, i) => (
                          <div key={i} className={`flex items-start gap-3 p-3 rounded-lg ${i % 2 === 0 ? "bg-gray-50" : "bg-white"}`}>
                            <CheckCircle className="h-5 w-5 text-[hsl(var(--optavia-green))] flex-shrink-0 mt-0.5" />
                            <div>
                              <span className="font-semibold text-optavia-dark">{tip.action}</span>
                              <span className="text-sm text-optavia-gray"> — {tip.detail}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Don'ts */}
                    {section.donts && (
                      <div className="space-y-2">
                        {section.donts.map((item, i) => (
                          <div key={i} className="p-4 bg-red-50 rounded-lg border-l-4 border-red-400">
                            <div className="flex items-center gap-2 mb-1">
                              <AlertTriangle className="h-4 w-4 text-red-600" />
                              <span className="font-bold text-red-800">{item.dont}</span>
                            </div>
                            <p className="text-sm text-red-700">{item.why}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Video Section */}
                    {section.videoSection && section.videoDetails && (
                      <div className="bg-gray-50 rounded-xl p-6 mb-5">
                        <div className="flex items-center gap-4 mb-5">
                          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[hsl(var(--optavia-green))] to-[hsl(var(--optavia-green-dark))] flex items-center justify-center">
                            <Play className="h-7 w-7 text-white fill-white" />
                          </div>
                          <div>
                            <div className="font-bold text-optavia-dark text-lg">{section.videoDetails.title}</div>
                            <div className="text-sm text-optavia-gray">{section.videoDetails.duration}</div>
                          </div>
                        </div>
                        <div className="relative pb-[56.25%] bg-gray-200 rounded-xl mb-5 flex items-center justify-center">
                          <div className="absolute inset-0 flex items-center justify-center text-optavia-gray">
                            <Play className="h-12 w-12" />
                          </div>
                        </div>
                        <div className="text-xs font-semibold text-optavia-gray uppercase mb-2">This video covers:</div>
                        <div className="grid grid-cols-2 gap-2">
                          {section.videoDetails.covers.map((item, i) => (
                            <div key={i} className="flex items-center gap-2 text-sm text-optavia-gray">
                              <Check className="h-4 w-4 text-[hsl(var(--optavia-green))]" />
                              {item}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Stats */}
                    {section.stats && (
                      <div className="grid grid-cols-3 gap-4 mb-5">
                        {section.stats.map((stat, i) => (
                          <div key={i} className="p-5 bg-gradient-to-br from-green-50 to-green-100 rounded-xl text-center">
                            <div className="text-3xl font-bold text-[hsl(var(--optavia-green))]">{stat.stat}</div>
                            <div className="text-xs text-green-800">{stat.label}</div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Steps */}
                    {section.steps && (
                      <div className="space-y-4">
                        {section.steps.map((item, i) => (
                          <div key={i} className="flex gap-4">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[hsl(var(--optavia-green))] to-[hsl(var(--optavia-green-dark))] text-white flex items-center justify-center font-bold flex-shrink-0">{item.step}</div>
                            <div className="flex-1 p-4 bg-gray-50 rounded-xl">
                              <div className="font-bold text-optavia-dark mb-2">{item.title}</div>
                              <p className="text-sm text-optavia-gray mb-3">{item.instruction}</p>
                              {item.ideas && (
                                <div className="flex flex-wrap gap-2">
                                  {item.ideas.map((idea, j) => (
                                    <Badge key={j} variant="secondary" className="text-xs bg-green-100 text-green-800">
                                      {idea}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                              {item.tips && (
                                <div className="space-y-1 mt-2">
                                  {item.tips.map((tip, j) => (
                                    <div key={j} className="text-xs text-optavia-gray">
                                      💡 {tip}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Reel Ideas */}
                    {section.reelIdeas && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {section.reelIdeas.map((idea, i) => (
                          <div key={i} className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                            <div className="flex justify-between items-center mb-2">
                              <span className="font-bold text-optavia-dark">{idea.type}</span>
                              <Badge variant={idea.difficulty === "Easy" ? "default" : "secondary"} className={`text-xs ${idea.difficulty === "Easy" ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"}`}>
                                {idea.difficulty}
                              </Badge>
                            </div>
                            <p className="text-sm text-optavia-gray mb-2">{idea.description}</p>
                            <div className="space-y-1">
                              {idea.examples.map((ex, j) => (
                                <div key={j} className="text-xs text-optavia-gray">
                                  • {ex}
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Do's and Don'ts side by side */}
                    {section.dosDonts && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-5 bg-green-50 rounded-xl">
                          <div className="font-bold text-green-800 mb-3 flex items-center gap-2">
                            <CheckCircle className="h-5 w-5" />
                            DO
                          </div>
                          {section.dosDonts.dos.map((item, i) => (
                            <div key={i} className="text-sm text-green-900 mb-2">
                              ✓ {item}
                            </div>
                          ))}
                        </div>
                        <div className="p-5 bg-red-50 rounded-xl">
                          <div className="font-bold text-red-800 mb-3 flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5" />
                            DON'T
                          </div>
                          {section.dosDonts.donts.map((item, i) => (
                            <div key={i} className="text-sm text-red-900 mb-2">
                              ✗ {item}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* A-Z Method */}
                    {section.azMethod && (
                      <div>
                        <div className="grid grid-cols-3 gap-3 mb-5">
                          {section.azMethod.map((item, i) => (
                            <div key={i} className="p-5 bg-green-50 rounded-xl text-center border-2 border-[hsl(var(--optavia-green))]">
                              <div className="w-12 h-12 rounded-full bg-[hsl(var(--optavia-green))] text-white flex items-center justify-center font-bold text-2xl mx-auto mb-3">{item.letter}</div>
                              <div className="font-bold text-optavia-dark mb-2">{item.word}</div>
                              <p className="text-sm text-optavia-gray mb-2">{item.description}</p>
                              <div className="text-xs text-[hsl(var(--optavia-green))] italic">"{item.example}"</div>
                            </div>
                          ))}
                        </div>
                        {section.fullExample && (
                          <div className="p-5 bg-gray-50 rounded-xl">
                            <div className="font-bold text-optavia-dark mb-3">📝 Full Example</div>
                            <div className="p-3 bg-blue-50 rounded-lg mb-3">
                              <div className="text-xs text-blue-700 mb-1">THEIR COMMENT:</div>
                              <div className="text-sm text-blue-900 italic">"{section.fullExample.theirComment}"</div>
                            </div>
                            <div className="p-3 bg-green-50 rounded-lg">
                              <div className="text-xs text-green-700 mb-1">YOUR A-Z RESPONSE:</div>
                              <div className="text-sm text-green-900 italic">"{section.fullExample.response}"</div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Conversation Situations */}
                    {section.situations && (
                      <div className="space-y-3">
                        {section.situations.map((sit, i) => (
                          <div key={i} className="rounded-xl border border-gray-200 overflow-hidden">
                            <button onClick={() => setExpandedSection(expandedSection === `sit-${i}` ? null : `sit-${i}`)} className={`w-full p-4 flex items-center gap-3 text-left transition-colors ${expandedSection === `sit-${i}` ? "bg-green-50" : "bg-gray-50 hover:bg-gray-100"}`}>
                              <span className="text-2xl">{sit.icon}</span>
                              <span className="flex-1 font-semibold text-optavia-dark">{sit.situation}</span>
                              <ChevronDown className={`h-5 w-5 text-optavia-gray transition-transform ${expandedSection === `sit-${i}` ? "rotate-180" : ""}`} />
                            </button>
                            {expandedSection === `sit-${i}` && (
                              <div className="p-4 bg-white border-t border-gray-100 space-y-2">
                                {sit.starters.map((starter, j) => (
                                  <div key={j} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <span className="text-sm text-optavia-gray flex-1">"{starter}"</span>
                                    <Button onClick={() => copyToClipboard(starter, `starter-${i}-${j}`)} variant="ghost" size="sm" className={copiedScript === `starter-${i}-${j}` ? "text-[hsl(var(--optavia-green))]" : ""}>
                                      {copiedScript === `starter-${i}-${j}` ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* CARE Framework */}
                    {section.framework && (
                      <div className="grid grid-cols-4 gap-3">
                        {section.framework.map((item, i) => (
                          <div key={i} className="p-4 bg-gray-50 rounded-xl text-center">
                            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[hsl(var(--optavia-green))] to-[hsl(var(--optavia-green-dark))] text-white flex items-center justify-center font-bold text-xl mx-auto mb-2">{item.letter}</div>
                            <div className="font-bold text-optavia-dark mb-1">{item.word}</div>
                            <p className="text-xs text-optavia-gray mb-2">{item.description}</p>
                            <div className="text-[10px] text-optavia-gray italic">{item.timeframe}</div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Buying Signals */}
                    {section.buyingSignals && (
                      <div className="mb-5">
                        <div className="font-bold text-optavia-dark mb-3">🎯 Buying Signals to Watch For:</div>
                        <div className="flex flex-wrap gap-2">
                          {section.buyingSignals.map((signal, i) => (
                            <Badge key={i} variant="outline" className="text-sm bg-green-50 text-green-800 border-green-300">
                              "{signal}"
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Transition Scripts */}
                    {section.transitionScripts && (
                      <div>
                        <div className="font-bold text-optavia-dark mb-3">💬 Transition Scripts:</div>
                        {section.transitionScripts.map((script, i) => renderCopyableScript(script, `transition-${i}`))}
                      </div>
                    )}

                    {/* Follow-up Templates */}
                    {section.templates && (
                      <div className="space-y-3">
                        {section.templates.map((template, i) => renderCopyableScript(template, `template-${i}`))}
                      </div>
                    )}
                  </div>
                ))}

                {/* Key Takeaways */}
                {currentLesson.content.keyTakeaways && (
                  <div className="mt-10 p-6 bg-gradient-to-r from-amber-50 to-amber-100 rounded-lg border border-amber-200">
                    <h4 className="text-base font-bold text-amber-900 mb-4 flex items-center gap-2">
                      <Star className="h-5 w-5 fill-amber-600 text-amber-600" />
                      Key Takeaways
                    </h4>
                    <ul className="space-y-2">
                      {currentLesson.content.keyTakeaways.map((takeaway, i) => (
                        <li key={i} className="text-sm text-amber-900 flex items-start gap-2">
                          <span className="text-amber-600 mt-1">•</span>
                          <span>{takeaway}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>

              {/* Navigation Footer */}
              <div className="border-t bg-gray-50 p-6 flex justify-between items-center">
                {prevLesson ? (
                  <Button variant="outline" onClick={() => setExpandedLesson(prevLesson.id)}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Previous
                  </Button>
                ) : (
                  <Button variant="outline" onClick={() => (window.location.href = "/training/thirty-day-evaluation")}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Phase 3
                  </Button>
                )}

                {nextLesson ? (
                  <Button onClick={() => setExpandedLesson(nextLesson.id)} className="bg-[hsl(var(--optavia-green))] hover:bg-[hsl(var(--optavia-green-dark))] text-white">
                    Next: {nextLesson.title.split(" ").slice(0, 3).join(" ")}...
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                ) : (
                  <Button className="bg-[hsl(var(--optavia-green))] hover:bg-[hsl(var(--optavia-green-dark))] text-white" onClick={() => (window.location.href = "/training/client-acquisition")}>
                    Continue to Module 4.2
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                )}
              </div>
            </Card>
          </main>
        </div>
      </div>
    </div>
  )
}
