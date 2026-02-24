"use client"

import { useState, useEffect } from "react"
import { Copy, ChevronDown, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"

type Category = "all" | "weight" | "compliance" | "motivation" | "physical" | "lifestyle" | "communication"
type Severity = "urgent" | "moderate" | "common"

interface Issue {
  id: string
  title: string
  category: Category
  severity: Severity
  icon: string
  iconColor: "red" | "orange" | "yellow" | "blue" | "purple" | "green"
  keywords: string
  whatsHappening: string
  whyHappens: string[]
  scripts: Array<{ context: string; text: string }>
  actionSteps: string[]
  warning?: string
  medicalNote?: string
}

const issues: Issue[] = [
  {
    id: "plateau",
    title: "Scale Plateau (Not Losing Weight)",
    category: "weight",
    severity: "common",
    icon: "📉",
    iconColor: "red",
    keywords: "plateau stuck not losing weight scale same stall stalled",
    whatsHappening: "Client has been on plan but the scale hasn't moved for 1-2+ weeks. They're frustrated and questioning if the program works.",
    whyHappens: [
      "Body is adjusting and recomposing (losing fat, retaining water temporarily)",
      "Hormonal fluctuations (especially for women)",
      "Hidden sodium causing water retention",
      "Not enough water intake",
      "Portion creep on Lean & Green meals",
      "Muscle gain from increased activity",
    ],
    scripts: [
      {
        context: "Normalize it first:",
        text: '"Plateaus are SO normal — almost everyone hits one! Your body is adjusting. Think of it like a staircase, not a slide. You\'ll hold, then whoosh down again."',
      },
      {
        context: "Redirect to non-scale wins:",
        text: '"Let\'s look at the bigger picture. How are your clothes fitting? Energy levels? Sleep? Sometimes the scale is the LAST thing to catch up."',
      },
      {
        context: "Troubleshoot gently:",
        text: '"Let\'s do a quick check — how\'s your water intake? Are you weighing your proteins? Sometimes small things sneak in without us noticing."',
      },
    ],
    actionSteps: [
      "Confirm they're drinking 64+ oz water daily",
      "Review their Lean & Green portions (use food scale?)",
      "Check for hidden sodium (condiments, seasonings)",
      "Ask about measurements — are inches coming off?",
      "Suggest hiding the scale for a week and focusing on habits",
      "Celebrate NON-scale victories to shift focus",
    ],
  },
  {
    id: "quit",
    title: "Wants to Quit",
    category: "motivation",
    severity: "urgent",
    icon: "🚪",
    iconColor: "red",
    keywords: "quit stop giving up done over it want to quit giving up frustrated",
    whatsHappening: "Client is expressing that they want to stop the program. They may be frustrated, overwhelmed, or feeling like it's not working for them.",
    whyHappens: [
      "Not seeing results fast enough (expectations vs reality)",
      "Life stress making it feel like \"one more thing\"",
      "Feeling deprived or restricted",
      "Cost concerns",
      "Lack of support from family/friends",
      "Comparing themselves to others",
      "Had a slip-up and feel like a failure",
    ],
    scripts: [
      {
        context: "First, validate their feelings:",
        text: '"I hear you, and I appreciate you being honest with me. This journey isn\'t easy, and it\'s okay to feel frustrated. Can you tell me more about what\'s going on?"',
      },
      {
        context: "Reconnect to their WHY:",
        text: '"Remember when you started and you told me [THEIR WHY]? That reason is still there. What would it mean for you to give up on that?"',
      },
      {
        context: "Offer a modified approach:",
        text: '"What if instead of quitting, we just adjust? Maybe we simplify things for a few weeks. I don\'t want you to give up — I want to find what works for YOU."',
      },
      {
        context: "If they're set on quitting:",
        text: '"I respect your decision. The door is always open if you want to come back. I\'m still here for you, and I\'m proud of what you accomplished."',
      },
    ],
    actionSteps: [
      "LISTEN first — don't jump to solutions",
      "Ask what specifically is making them want to quit",
      "Remind them of their progress (even small wins)",
      "Offer to simplify or modify the approach",
      "Suggest a \"pause\" instead of a \"quit\" if needed",
      "If they quit, leave the door open warmly",
    ],
    warning: "Don't guilt them or make them feel bad. Pressure will push them away faster. Sometimes people need to leave and come back on their own terms.",
  },
  {
    id: "cravings",
    title: "Strong Cravings",
    category: "physical",
    severity: "common",
    icon: "🍪",
    iconColor: "orange",
    keywords: "cravings hungry craving sugar carbs snack snacking want to eat",
    whatsHappening: "Client is experiencing intense cravings for sugar, carbs, or specific foods. They may feel like they're going to \"break\" at any moment.",
    whyHappens: [
      "Blood sugar still stabilizing (especially first 2 weeks)",
      "Dehydration (thirst mimics hunger)",
      "Emotional triggers (stress, boredom, habit)",
      "Not eating fuelings on time",
      "Seeing/smelling trigger foods",
      "Sleep deprivation increases cravings",
    ],
    scripts: [
      {
        context: "Normalize and explain:",
        text: '"Cravings are totally normal, especially in the first few weeks! Your body is used to running on sugar — it\'s basically throwing a tantrum. It WILL pass, I promise."',
      },
      {
        context: "Give tactical advice:",
        text: '"Try this: drink a big glass of water, wait 15 minutes, and see if the craving passes. Often we\'re actually thirsty, not hungry. If it\'s still there, have your next fueling early."',
      },
      {
        context: "Address emotional cravings:",
        text: '"Sometimes cravings aren\'t about food — they\'re about feelings. What\'s going on right now? Are you stressed, bored, tired? Let\'s talk about it."',
      },
    ],
    actionSteps: [
      "Check water intake — are they hydrated?",
      "Review fueling timing — eating every 2-3 hours?",
      "Identify triggers (time of day, emotions, situations)",
      "Suggest a distraction technique (walk, call friend, brush teeth)",
      "Remind them it gets easier after week 2-3",
      "Share your own craving-busting strategies",
    ],
  },
  {
    id: "not-following",
    title: "Not Following the Plan",
    category: "compliance",
    severity: "moderate",
    icon: "📋",
    iconColor: "orange",
    keywords: "cheating off plan not following eating extra snacking not compliant",
    whatsHappening: "Client admits to going off plan — eating extra food, skipping fuelings, or \"cheating\" regularly. They may be defensive or embarrassed about it.",
    whyHappens: [
      "Plan feels too restrictive",
      "Social pressure (family dinners, events)",
      "Emotional eating habits",
      "Lack of planning/preparation",
      "Boredom with the food options",
      "Self-sabotage patterns",
    ],
    scripts: [
      {
        context: "No judgment:",
        text: '"Thank you for being honest with me — that takes courage. I\'m not here to judge you. Let\'s figure out what happened and how we can set you up better."',
      },
      {
        context: "Get curious:",
        text: '"Help me understand — what was going on when you went off plan? Was it a specific situation, feeling, or just a moment of \'I don\'t care\'?"',
      },
      {
        context: "Refocus forward:",
        text: '"Here\'s the good news: every meal is a new choice. What happened yesterday doesn\'t define today. What\'s ONE thing we can do differently this week?"',
      },
    ],
    actionSteps: [
      "Create a judgment-free space for honesty",
      "Identify the trigger (emotional, situational, habitual)",
      "Problem-solve together for next time",
      "Suggest meal prepping or planning ahead",
      "Consider if they need more variety in fuelings",
      "Increase check-in frequency temporarily",
    ],
  },
  {
    id: "transition-symptoms",
    title: "Transition Symptoms (Days 3-7)",
    category: "physical",
    severity: "common",
    icon: "🤕",
    iconColor: "yellow",
    keywords: "tired headache keto flu sick nausea fatigue transition symptoms low energy",
    whatsHappening: "Client is experiencing headaches, fatigue, irritability, or brain fog — usually around days 3-7. They may think something is wrong or that the plan is hurting them.",
    whyHappens: [
      "Body switching from sugar-burning to fat-burning",
      "Electrolyte shifts as body releases water",
      "Caffeine reduction (if they cut back)",
      "Carbohydrate withdrawal is real",
      "Typically lasts 3-5 days then resolves",
    ],
    scripts: [
      {
        context: "Reassure them it's normal:",
        text: '"What you\'re feeling is actually a GOOD sign — it means your body is making the switch to fat-burning mode! It\'s like a metabolic upgrade. This will pass in a few days, I promise."',
      },
      {
        context: "Give practical relief:",
        text: '"In the meantime, make sure you\'re drinking LOTS of water — aim for 80-100 oz. You can also add a little salt to your food or sip on broth. That helps with the headaches."',
      },
    ],
    actionSteps: [
      "Increase water intake significantly",
      "Add electrolytes (salt, broth, sugar-free electrolyte drinks)",
      "Ensure they're eating all fuelings on time",
      "Allow extra rest if possible",
      "Remind them this is temporary (3-5 days)",
      "Check in daily until symptoms resolve",
    ],
    medicalNote: "If symptoms are severe or last more than 7 days, recommend they consult their doctor. This is especially important for clients with diabetes or on medications.",
  },
  {
    id: "not-responding",
    title: "Not Responding to Messages",
    category: "communication",
    severity: "moderate",
    icon: "👻",
    iconColor: "blue",
    keywords: "not responding ghosting silent no response ignoring messages",
    whatsHappening: "Client has gone quiet — they're not responding to check-ins, not engaging, and you're not sure what's going on. Radio silence is often a warning sign.",
    whyHappens: [
      "They've gone off plan and feel embarrassed",
      "Life got busy and they're overwhelmed",
      "They're struggling but don't want to admit it",
      "They've mentally \"checked out\" of the program",
      "Your messages feel like pressure to them",
    ],
    scripts: [
      {
        context: "Low-pressure check-in:",
        text: '"Hey! Just thinking about you and wanted to check in. No pressure to respond — just know I\'m here whenever you\'re ready. 💚"',
      },
      {
        context: "Permission to be imperfect:",
        text: '"I haven\'t heard from you in a bit, and I just want you to know — wherever you are, it\'s okay. Perfect isn\'t the goal. I\'m here with zero judgment whenever you\'re ready to chat."',
      },
      {
        context: "Value-add message:",
        text: '"Saw this recipe and thought of you! 🍽️ [link] Hope you\'re doing well. No need to reply — just wanted to send some inspiration your way!"',
      },
      {
        context: "Direct but kind (after 2+ weeks):",
        text: '"I miss hearing from you! I want to support you, but I can only help if we\'re connected. Can you send me a quick 👍 just so I know you\'re okay?"',
      },
    ],
    actionSteps: [
      "Don't assume the worst — give benefit of the doubt",
      "Try different communication methods (text, voice memo, call)",
      "Send value (recipe, tip) instead of just asking questions",
      "Space out messages — don't overwhelm them",
      "After 2 weeks, try a direct but compassionate reach-out",
      "Know when to step back and wait for them to come to you",
    ],
  },
  {
    id: "cost",
    title: "Cost Concerns",
    category: "motivation",
    severity: "moderate",
    icon: "💰",
    iconColor: "yellow",
    keywords: "expensive cost money afford price too much budget",
    whatsHappening: "Client is expressing that the program is too expensive. They may be considering stopping due to financial concerns or feeling guilty about the investment.",
    whyHappens: [
      "Genuine budget constraints",
      "Not seeing enough value for the cost",
      "Comparing to grocery store prices (not total food spend)",
      "Financial stress from other life areas",
      "Sometimes cost is a \"safe\" objection hiding other concerns",
    ],
    scripts: [
      {
        context: "Reframe the comparison:",
        text: '"I totally understand. Have you thought about what you were spending before — on fast food, snacks, drive-thrus, coffee runs? Most clients find it\'s actually similar when you add it all up."',
      },
      {
        context: "Talk about the real cost:",
        text: '"Here\'s what I think about: what\'s the cost of NOT doing this? Medical bills, medications, missing out on life with your family, how you feel every day... your health is worth investing in."',
      },
      {
        context: "If it's genuinely tight:",
        text: '"I hear you. Let\'s see if there\'s a way to make it work — maybe a less expensive kit, or looking at what else could be cut from the budget temporarily. This is an investment in you."',
      },
    ],
    actionSteps: [
      "Help them track their TOTAL food spend (before vs. now)",
      "Discuss meal planning their L&G to reduce grocery costs",
      "Explore different kit options if budget is tight",
      "Ask if cost is the real issue or if something else is going on",
      "Remind them this is temporary — not a forever expense",
    ],
  },
  {
    id: "family",
    title: "Unsupportive Family/Spouse",
    category: "lifestyle",
    severity: "moderate",
    icon: "👨‍👩‍👧",
    iconColor: "purple",
    keywords: "spouse husband wife family support sabotage unsupportive partner",
    whatsHappening: "Client's spouse, family, or friends are not supportive of their journey. They may be making negative comments, bringing tempting food home, or actively sabotaging.",
    whyHappens: [
      "Loved ones feel threatened by the change",
      "They don't understand the program",
      "Fear that the relationship will change",
      "Their own insecurities about health/weight",
      "Feeling left out of meals and food traditions",
      "Sometimes it's unintentional, not malicious",
    ],
    scripts: [
      {
        context: "Validate the difficulty:",
        text: '"That\'s so hard, and I\'m sorry you\'re dealing with that. Doing this without support at home makes it 10x harder. Let\'s talk about some strategies."',
      },
      {
        context: "Offer perspective:",
        text: '"Sometimes when we change, it makes the people around us uncomfortable — even if they love us. It\'s not about you doing something wrong. Change can feel threatening to them."',
      },
      {
        context: "Practical advice:",
        text: '"What if you invited them to be part of it? Not the plan itself, but maybe cooking a Lean & Green together? Sometimes involvement reduces resistance."',
      },
    ],
    actionSteps: [
      "Help them have a conversation with their spouse (share their WHY)",
      "Suggest ways to include family (L&G that everyone eats)",
      "Create boundaries around trigger foods (out of sight)",
      "Build up support outside the home (coach, community)",
      "Remind them: they're doing this FOR their family, not against them",
    ],
  },
  {
    id: "weekend",
    title: "Weekend Struggles",
    category: "lifestyle",
    severity: "common",
    icon: "📅",
    iconColor: "blue",
    keywords: "weekend struggle saturday sunday off track weekends parties",
    whatsHappening: "Client does great Monday-Friday but consistently struggles on weekends. Social events, relaxed schedules, and \"treat yourself\" mentality derail progress.",
    whyHappens: [
      "Less structure = more opportunities to slip",
      "Social pressure at events and gatherings",
      "\"I deserve a break\" mentality",
      "Alcohol lowers inhibitions and adds calories",
      "Sleeping in throws off fueling schedule",
      "Family activities centered around food",
    ],
    scripts: [
      {
        context: "Address the pattern:",
        text: '"I\'ve noticed weekends are tough for you — you\'re not alone! Let\'s make a game plan before Saturday hits. What\'s on the calendar this weekend?"',
      },
      {
        context: "Reframe weekends:",
        text: '"Here\'s a mindset shift: weekends are 2/7 days — that\'s almost 30% of your week. If you\'re only on plan 70% of the time, it\'s really hard to see results. What if we made weekends just as important?"',
      },
      {
        context: "Practical strategy:",
        text: '"Before any event, eat a fueling so you\'re not starving when you arrive. Bring something you can eat. And give yourself ONE planned treat if you need it — not a free-for-all."',
      },
    ],
    actionSteps: [
      "Plan the weekend in advance (events, meals)",
      "Keep fueling schedule consistent even if sleeping in",
      "Eat before events so they're not starving",
      "Bring a dish they can eat to gatherings",
      "Set a check-in for Saturday morning",
      "Celebrate successful weekends loudly!",
    ],
  },
  {
    id: "travel",
    title: "Traveling / Vacation",
    category: "lifestyle",
    severity: "common",
    icon: "✈️",
    iconColor: "green",
    keywords: "travel vacation trip traveling airport hotel work travel",
    whatsHappening: "Client has upcoming travel and is worried about staying on plan — or they've already traveled and fell off. Disrupted routines make compliance difficult.",
    whyHappens: [
      "No control over food options",
      "Vacation mentality (\"I'm on a break\")",
      "Hard to pack and transport fuelings",
      "Social pressure to eat with others",
      "Restaurant meals are harder to control",
    ],
    scripts: [
      {
        context: "Pre-trip planning:",
        text: '"Let\'s make a travel plan! The fuelings are super portable — you can throw them in your bag. For Lean & Green, most restaurants have grilled protein + veggies. You\'ve got this!"',
      },
      {
        context: "Reframe vacation:",
        text: '"What if you focused on ENJOYING the trip without using food as the entertainment? You can still have an amazing vacation while staying on plan. You\'ll feel so much better!"',
      },
      {
        context: "After a trip slip:",
        text: '"Welcome back! How did it go? No matter what happened, you\'re back now and that\'s what matters. Let\'s get right back on track — starting with your next fueling."',
      },
    ],
    actionSteps: [
      "Pack fuelings in carry-on (bars and shakes travel well)",
      "Research restaurants at destination ahead of time",
      "Bring a shaker bottle for convenience",
      "Set phone reminders for fueling times",
      "Plan one \"special meal\" if needed, not a free-for-all",
      "Check in with coach during the trip",
    ],
  },
  {
    id: "bored",
    title: "Bored with the Food",
    category: "compliance",
    severity: "common",
    icon: "😐",
    iconColor: "orange",
    keywords: "bored boring same food sick of fuelings tired of eating variety",
    whatsHappening: "Client is tired of eating the same things. They're bored with fuelings, unmotivated to eat them, or feeling like the food is monotonous.",
    whyHappens: [
      "Sticking with \"safe\" fuelings and not exploring",
      "Not trying fueling \"hacks\" or recipes",
      "Same Lean & Green meals every night",
      "Missing the variety of their old diet",
      "Food boredom often happens around week 3-4",
    ],
    scripts: [
      {
        context: "Validate and redirect:",
        text: '"I totally get it — eating the same things gets old! Let\'s mix it up. Have you tried any fueling hacks? You can make the pancakes into waffles, turn the shakes into pudding, bake the brownies..."',
      },
      {
        context: "Lean & Green ideas:",
        text: '"What about your Lean & Green meals — are you mixing those up? There are SO many recipes! Let me send you some new ones to try this week."',
      },
      {
        context: "Perspective shift:",
        text: '"Here\'s something to remember: this is temporary. The boredom is a small price for the freedom you\'ll have on the other side. And honestly — were you really that excited about food before, or just eating out of habit?"',
      },
    ],
    actionSteps: [
      "Share fueling hacks and recipes",
      "Encourage trying new fueling flavors",
      "Send new Lean & Green recipe ideas",
      "Suggest theme nights (Taco Tuesday, Stir-Fry Friday)",
      "Point them to OPTAVIA app for inspiration",
      "Remind them: the goal is progress, not gourmet meals",
    ],
  },
  {
    id: "emotional-eating",
    title: "Emotional Eating",
    category: "motivation",
    severity: "moderate",
    icon: "😢",
    iconColor: "purple",
    keywords: "emotional eating stress eating feelings sad eating binge comfort food",
    whatsHappening: "Client is using food to cope with emotions — stress, sadness, anxiety, boredom, or even happiness. They're eating when not physically hungry.",
    whyHappens: [
      "Lifelong pattern of using food for comfort",
      "Food triggers dopamine (temporary feel-good)",
      "Lack of alternative coping mechanisms",
      "Not recognizing emotional vs physical hunger",
      "Stress, trauma, or life circumstances",
    ],
    scripts: [
      {
        context: "Create awareness:",
        text: '"It sounds like you\'re reaching for food when you\'re not physically hungry. That\'s SO common. Can we talk about what was going on emotionally when you felt that urge?"',
      },
      {
        context: "Introduce alternatives:",
        text: '"Next time you feel that urge, try this: pause and ask \'What am I actually feeling right now?\' Then instead of eating, try a walk, call a friend, journal, or even just sit with the feeling for 10 minutes."',
      },
      {
        context: "Reference resources:",
        text: '"Have you read Dr. A\'s Stop. Challenge. Choose.? It\'s all about this — learning to pause before reacting. It\'s been a game-changer for a lot of clients."',
      },
    ],
    actionSteps: [
      "Help them identify triggers (stress, boredom, sadness)",
      "Create a list of non-food coping strategies",
      "Suggest the \"10-minute rule\" — wait before eating",
      "Recommend Stop. Challenge. Choose. book",
      "For deep-rooted issues, suggest professional support",
      "Celebrate when they choose a non-food response",
    ],
    warning: "You're a coach, not a therapist. If emotional eating is rooted in trauma or deep psychological issues, encourage them to seek professional help in addition to your support.",
  },
  {
    id: "scale-obsession",
    title: "Scale Obsession / Daily Weighing Anxiety",
    category: "weight",
    severity: "common",
    icon: "⚖️",
    iconColor: "yellow",
    keywords: "scale obsessed weighing daily weight fluctuation scale addiction checking weight",
    whatsHappening: "Client is weighing themselves daily (or multiple times per day) and their mood is dictated by the number. They're frustrated by normal daily fluctuations.",
    whyHappens: [
      "Using the scale as the only measure of success",
      "Not understanding normal weight fluctuation",
      "Seeking validation/dopamine from the number",
      "Previous diet experiences tied to scale",
      "Anxiety and need for control",
    ],
    scripts: [
      {
        context: "Educate on fluctuations:",
        text: '"Your weight can fluctuate 2-5 pounds in a single DAY based on water, sodium, hormones, and bathroom habits. That daily number isn\'t fat — it\'s noise. Let\'s focus on the weekly trend."',
      },
      {
        context: "Challenge the behavior:",
        text: '"Here\'s my challenge: hide the scale for one week. Just ONE week. Focus on how you FEEL, how your clothes fit, your energy. I bet you\'ll feel so much more free."',
      },
      {
        context: "Redefine success:",
        text: '"What if the scale wasn\'t the goal? What if the goal was feeling confident, having energy, and being healthy? The number is just ONE data point — not your worth."',
      },
    ],
    actionSteps: [
      "Educate on why weight fluctuates daily",
      "Suggest weighing only once per week (same day/time)",
      "Track non-scale victories alongside weight",
      "Consider a \"scale break\" for a week or more",
      "Have them track trends, not single weigh-ins",
      "Shift focus to behaviors (what they CAN control)",
    ],
  },
  {
    id: "comparing",
    title: "Comparing to Others",
    category: "motivation",
    severity: "common",
    icon: "👥",
    iconColor: "blue",
    keywords: "compare comparing others losing faster slow results jealous comparison",
    whatsHappening: "Client is frustrated because they see others losing weight faster. They feel like they're doing something wrong or that the program doesn't work as well for them.",
    whyHappens: [
      "Social media highlights big losses (survivor bias)",
      "Different starting points = different results",
      "Men often lose faster than women initially",
      "Age, metabolism, medications all play a role",
      "They don't see others' struggles, only successes",
    ],
    scripts: [
      {
        context: "Redirect the comparison:",
        text: '"The only fair comparison is you TODAY vs. you when you STARTED. Other people have different bodies, different histories, different metabolisms. Your journey is yours alone."',
      },
      {
        context: "Explain the variables:",
        text: '"Someone who has 100 lbs to lose will drop faster at first than someone with 30 lbs. Men often lose faster than women. Younger people faster than older. It\'s biology, not effort."',
      },
      {
        context: "Reality check:",
        text: '"Also — you\'re seeing highlight reels. You don\'t see their hard days, their struggles, their slip-ups. Everyone has them. Focus on YOUR progress, YOUR wins."',
      },
    ],
    actionSteps: [
      "Celebrate THEIR progress (show them how far they've come)",
      "Limit exposure to comparison triggers (social media mute?)",
      "Help them define success beyond the number",
      "Remind them slow and steady is more sustainable",
      "Share that you've seen this pattern before — it's normal",
    ],
  },
  {
    id: "gained-weight",
    title: "Gained Weight After a Slip-Up",
    category: "weight",
    severity: "moderate",
    icon: "📈",
    iconColor: "red",
    keywords: "gained weight back regain slip up cheat gained pounds after",
    whatsHappening: "Client went off plan and now the scale shows they've gained several pounds. They're devastated and feel like all their progress is lost.",
    whyHappens: [
      "Carbs cause water retention (glycogen storage)",
      "Sodium causes water retention",
      "It's physically impossible to gain 5 lbs of FAT overnight",
      "Most of the \"gain\" is water weight",
      "Will drop quickly once back on plan",
    ],
    scripts: [
      {
        context: "Calm them down with science:",
        text: '"I know that number feels devastating, but here\'s the truth: to gain 5 lbs of actual fat, you\'d have to eat 17,500 EXTRA calories. You didn\'t do that. What you\'re seeing is water weight from carbs and sodium. It will come off fast."',
      },
      {
        context: "Action plan:",
        text: '"Here\'s what to do: get back on plan immediately, drink extra water today, and don\'t weigh yourself for 3-4 days. I promise that number will drop. This is a blip, not a disaster."',
      },
      {
        context: "Prevent spiral:",
        text: '"The worst thing you can do right now is let this spiral into \'well, I already ruined it.\' You haven\'t. One off day doesn\'t undo weeks of progress. Let\'s move forward."',
      },
    ],
    actionSteps: [
      "Explain the science of water weight",
      "Get them back on plan at their next meal",
      "Increase water intake to flush sodium",
      "Suggest staying off the scale for 3-5 days",
      "Prevent the \"all or nothing\" spiral",
      "Check in daily until they're back on track",
    ],
  },
]

const categoryLabels: Record<Category, string> = {
  all: "All Issues",
  weight: "Weight & Plateaus",
  compliance: "Compliance",
  motivation: "Motivation",
  physical: "Physical",
  lifestyle: "Lifestyle",
  communication: "Communication",
}

const severityColors: Record<Severity, string> = {
  urgent: "bg-red-50 text-red-700 border-red-200",
  moderate: "bg-orange-50 text-orange-700 border-orange-200",
  common: "bg-green-50 text-green-700 border-green-200",
}

const iconBgColors: Record<string, string> = {
  red: "bg-red-100",
  orange: "bg-orange-100",
  yellow: "bg-yellow-100",
  blue: "bg-blue-100",
  purple: "bg-purple-100",
  green: "bg-green-100",
}

export function ClientTroubleshootingTool() {
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [activeFilter, setActiveFilter] = useState<Category>("all")
  const [expandedIssues, setExpandedIssues] = useState<Set<string>>(new Set([issues[0].id]))

  const filteredIssues = issues.filter((issue) => {
    const matchesFilter = activeFilter === "all" || issue.category === activeFilter
    const matchesSearch =
      searchTerm === "" ||
      issue.keywords.toLowerCase().includes(searchTerm.toLowerCase()) ||
      issue.title.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const copyScript = (text: string) => {
    const cleaned = text.replace(/^[""]|[""]$/g, "").trim()
    navigator.clipboard.writeText(cleaned).then(() => {
      toast({
        title: "Copied!",
        description: "Script copied to clipboard",
      })
    })
  }

  const toggleIssue = (issueId: string) => {
    const newExpanded = new Set(expandedIssues)
    if (newExpanded.has(issueId)) {
      newExpanded.delete(issueId)
    } else {
      newExpanded.add(issueId)
    }
    setExpandedIssues(newExpanded)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-200">
      {/* Tool Header */}
      <div className="sticky top-[73px] z-40 bg-gradient-to-r from-red-600 to-red-500 text-white shadow-lg shadow-red-500/30">
        <div className="max-w-4xl mx-auto px-6 py-5">
          <h1 className="text-xl font-bold flex items-center gap-2">
            🔧 <span className="hidden sm:inline">Client</span> Troubleshooting Guide
          </h1>
        </div>
      </div>

      {/* Search Container */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-6 py-5">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search issues... (e.g., 'plateau', 'quit', 'cravings')"
              className="pl-11 h-12 border-2 border-slate-200 focus:border-red-600 focus:ring-red-600 rounded-xl"
            />
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            {(Object.keys(categoryLabels) as Category[]).map((category) => (
              <Button
                key={category}
                variant={activeFilter === category ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveFilter(category)}
                className={
                  activeFilter === category
                    ? "bg-red-600 hover:bg-red-700 text-white border-red-600"
                    : "border-slate-300 text-slate-600 hover:border-red-600 hover:text-red-600 bg-white"
                }
              >
                {categoryLabels[category]}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-6">
        {/* Issue Cards */}
        {filteredIssues.length > 0 ? (
          <div className="space-y-4">
            {filteredIssues.map((issue) => (
              <Card
                key={issue.id}
                className="overflow-hidden border border-slate-200 hover:shadow-lg transition-shadow"
              >
                <div
                  className="bg-slate-50 border-b border-slate-200 p-4 cursor-pointer hover:bg-slate-100 transition-colors"
                  onClick={() => toggleIssue(issue.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${iconBgColors[issue.iconColor]}`}>
                      {issue.icon}
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-slate-800">{issue.title}</div>
                      <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                        {categoryLabels[issue.category]}
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${severityColors[issue.severity]}`}>
                      {issue.severity === "urgent" ? "Urgent" : issue.severity === "moderate" ? "Moderate" : "Common"}
                    </span>
                    <ChevronDown
                      className={`h-5 w-5 text-slate-400 transition-transform ${
                        expandedIssues.has(issue.id) ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                </div>
                {expandedIssues.has(issue.id) && (
                  <CardContent className="p-5 space-y-5">
                    {/* What's Happening */}
                    <div>
                      <div className="text-xs font-bold text-red-600 uppercase tracking-wide mb-2 flex items-center gap-1">
                        ⚠️ What's Happening
                      </div>
                      <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                        <p className="text-sm text-red-900">{issue.whatsHappening}</p>
                      </div>
                    </div>

                    {/* Why It Happens */}
                    <div>
                      <div className="text-xs font-bold text-blue-600 uppercase tracking-wide mb-2 flex items-center gap-1">
                        🧠 Why It Happens
                      </div>
                      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                        <ul className="space-y-2">
                          {issue.whyHappens.map((reason, idx) => (
                            <li key={idx} className="text-sm text-blue-900 flex items-start gap-2">
                              <span className="text-blue-600 mt-0.5">→</span>
                              <span>{reason}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* What To Say */}
                    <div>
                      <div className="text-xs font-bold text-green-600 uppercase tracking-wide mb-2 flex items-center gap-1">
                        💬 What To Say
                      </div>
                      <div className="bg-green-50 border-l-4 border-green-600 rounded-r-xl p-4 space-y-4">
                        {issue.scripts.map((script, idx) => (
                          <div key={idx} className="pb-4 border-b border-green-200 last:border-0 last:pb-0">
                            <div className="text-xs font-semibold text-green-800 mb-1">{script.context}</div>
                            <div className="text-sm text-green-900 italic leading-relaxed mb-2">{script.text}</div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => copyScript(script.text)}
                              className="text-xs bg-green-100 border-green-300 text-green-700 hover:bg-green-200 h-7"
                            >
                              <Copy className="h-3 w-3 mr-1" />
                              Copy
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Action Steps */}
                    <div>
                      <div className="text-xs font-bold text-purple-600 uppercase tracking-wide mb-2 flex items-center gap-1">
                        ✅ Action Steps
                      </div>
                      <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                        <ol className="space-y-2 list-none">
                          {issue.actionSteps.map((step, idx) => (
                            <li key={idx} className="text-sm text-purple-900 flex items-start gap-3">
                              <span className="w-6 h-6 bg-gradient-to-br from-purple-600 to-purple-700 text-white rounded-md flex items-center justify-center text-xs font-bold flex-shrink-0">
                                {idx + 1}
                              </span>
                              <span>{step}</span>
                            </li>
                          ))}
                        </ol>
                      </div>
                    </div>

                    {/* Warning Box */}
                    {issue.warning && (
                      <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex gap-3">
                        <div className="text-xl flex-shrink-0">⚠️</div>
                        <div className="text-sm text-orange-900">
                          <strong>Important:</strong> {issue.warning}
                        </div>
                      </div>
                    )}

                    {/* Medical Note */}
                    {issue.medicalNote && (
                      <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex gap-3">
                        <div className="text-xl flex-shrink-0">⚠️</div>
                        <div className="text-sm text-orange-900">
                          <strong>Medical Note:</strong> {issue.medicalNote}
                        </div>
                      </div>
                    )}
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-5xl mb-3">🔍</div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">No matching issues found</h3>
            <p className="text-slate-500">Try a different search term or clear filters</p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="text-center py-10 px-6 text-slate-500 text-sm">
        <p>Client Troubleshooting Guide • Coach Tools</p>
        <p className="mt-1 text-xs">Every problem has a solution. You've got this! 💪</p>
      </footer>
    </div>
  )
}
