"use client"

import { useState } from "react"

// ========================================
// TYPES
// ========================================
interface Task {
  type: "text" | "graphic" | "video" | "call" | "resource" | "action"
  title: string
  icon: string
  hasScript?: boolean
  script?: string
  videoUrl?: string
  graphicPlaceholder?: string
  resourceUrl?: string
  note?: string
  isCoachPrep?: boolean
}

interface DayData {
  label: string
  phase: string
  tasks: Task[]
}

interface WeekColor {
  bg: string
  border: string
  header: string
}

interface ColorScript {
  emoji: string
  label: string
  color: string
  bg: string
  border: string
  script: string
}

// ========================================
// CALENDAR DATA — Month One (30 Days)
// ========================================
const WEEK_COLORS: WeekColor[] = [
  { bg: "#dbeafe", border: "#93c5fd", header: "#1e40af" },
  { bg: "#ede9fe", border: "#c4b5fd", header: "#5b21b6" },
  { bg: "#ffe4e6", border: "#fda4af", header: "#be123c" },
  { bg: "#fce7f3", border: "#f9a8d4", header: "#be185d" },
  { bg: "#ccfbf1", border: "#5eead4", header: "#0f766e" },
]

const CALENDAR_DAYS: Record<string, DayData> = {
  // ===== WEEK 1 =====
  "1-sun": {
    label: "Day Before Start",
    phase: "Pre-Start",
    tasks: [
      { type: "text", title: "Day Before Start Text", icon: "💬", hasScript: true, script: `I'm so excited for you… tomorrow is Day 1 of your Metabolic Reset, and tonight is just about getting ready so you can wake up and roll right into success. 🙌🏼 Here's your quick Pre-Day 1 checklist so we're all synced up for the morning:\n\n1️⃣ Watch this 20 minute video and read through the spiral guide that came in your box. We will have a quick 15-20 minute call to make sure you feel clear about YOUR path to fat burn. __JOURNEY KICKOFF VIDEO__\n\n2️⃣ Save this Client Linktree to your phone __CLIENT LINKTREE__\n\n3️⃣ Have your Renpho charged and ready. First thing tomorrow, hop on your scale before water, coffee, or clothes.\n✔️ Weight ✔️ Body fat % ✔️ Visceral fat ✔️ Skeletal muscle % ✔️ Metabolic age ✔️ Protein % ✔️ Hydration %\n\n4️⃣ Grab a tape measure. Tomorrow morning, measure your W.A.T.C.H.=Waist, Arm, Thigh, Chest, Hips\n\n5️⃣ Hydration plan ready. Fill a water bottle tonight… 💦\n\n6️⃣ Lay out your 5 fuelings + Lean & Green plan. ✨\n\n7️⃣ Sleep! Your metabolism loves a solid night's sleep. 😴\n\n8️⃣ Your mindset. This isn't about perfection…it's about consistency. 🤝\n\nText me in the morning with:\n📍 Renpho reading 📍 Measurements 📍 How you're feeling\n\nAnd then… we're off! 🚀` },
      { type: "video", title: "Kickoff Call Video", icon: "🎬", videoUrl: "https://vimeo.com/1158234614/d128997deb" },
      { type: "resource", title: "5&1 Tracker", icon: "📋", note: "Mention in the Kickoff Call", graphicPlaceholder: "https://rcucmbujkdwvrcjistub.supabase.co/storage/v1/object/public/CEC/5-and-1-daily-tracker.png" },
      { type: "video", title: "Lean and Green Video", icon: "🥗", videoUrl: "https://vimeo.com/414057972" },
    ],
  },
  "1-mon": {
    label: "Day 1",
    phase: "Foundation Day",
    tasks: [
      { type: "graphic", title: "Send Daily Graphic", icon: "🖼", graphicPlaceholder: "https://rcucmbujkdwvrcjistub.supabase.co/storage/v1/object/public/CEC/day-1-foundation-day.png" },
      { type: "text", title: "Send Day 1 Text", icon: "💬", hasScript: true, script: `🌅 DAY 1 — FOUNDATION DAY\nHELLO Day 1!! 🎉\nWelcome to your reset — and take a breath. This works when it's simple. No perfection. No pressure. No overthinking. Just consistency.\n\nHere's your only focus today: Your 5 Fat-Burn Anchors\n1️⃣ Choose 5 fuelings + keep backups nearby (purse, car, desk = success strategy 😅)\n2️⃣ Hydrate like it matters (64–100 oz water) + aim for 7 hours sleep\n3️⃣ Eat within 30 min of waking → then every 2–3 hours\n4️⃣ Follow the plan precisely — if it's not in the guide, it's not in your mouth\n5️⃣ Track it. Awareness creates results.\n\n🔥 Fat burn loves structure.\n🔥 Simplicity = consistency.\n🔥 Consistency = transformation.\n\nToday is about establishing rhythm, not chasing results.\n📸 Please weigh in today (smart scale data is gold), take pics + measurements. This is your baseline.\n\nText me what's for dinner tonight 💚 We're building momentum from Day 1.` },
      { type: "video", title: "What is Fat Burn Video", icon: "🔥", videoUrl: "https://vimeo.com/1044531642/fde0ddc92e" },
      { type: "call", title: "Daily Check In Questions Days 1-4", icon: "📞", hasScript: true, script: `DAY 1-4 DAILY CHECK IN QUESTIONS\n*Important to not provide the answers to them*\n\n• What time did you wake up?\n• What time did you eat for the first time?\n• Do you drink coffee? Do you put anything in your coffee?\n• How many ounces of water have you had today?\n• Did you set your timers / use the eat wise app?\n  - How far apart?\n• Did you go past 3 hours at any time without eating?\n  - How many fuelings have you had in your day?\n• What did you have for your lean and green meal?\n  - How many ounces of protein (before or after you cooked it)?\n• How many servings of vegetables?\n• Did you measure or weigh your vegetables?\n• What time are you planning to go to bed?\n• When time is your last fueling?\n  - If you come close to the 2.5 hr mark and you are not asleep, please add a small serving of protein in to balance your blood sugars.\n• Did you eat anything outside of the program today?\n\nLet us know if you have any EXTRA activity in your day!!!` },
    ],
  },
  "1-tue": {
    label: "Day 2",
    phase: "Transition Day",
    tasks: [
      { type: "graphic", title: "Daily Graphic", icon: "🖼", graphicPlaceholder: "https://rcucmbujkdwvrcjistub.supabase.co/storage/v1/object/public/CEC/day-2-transition-day.png" },
      { type: "text", title: "Day 2 Text", icon: "💬", hasScript: true, script: `🌤 DAY 2 — TRANSITION DAY\nHELLO Day 2!! 🤍\nYour body is shifting gears — and that's a good thing.\nYou're moving from sugar-burning → fat-burning.\n\nIf you feel:\n• tired • foggy • a little hungry • headache-ish • low energy\nThat's not failure — it's metabolic adaptation.\n\nSupport tools:\n🥒 Dill pickle or celery\n🍵 Chicken broth\n💧 Sugar-free electrolytes (up to 3/day)\n🚰 Extra water\n\nWhen insulin drops, your body releases water + minerals — replacing them keeps fat burn smooth and comfortable. This phase passes quickly — and what follows is:\n⚡ energy 😴 better sleep 🔥 fat loss 🧠 mental clarity 🍽 less hunger\n\nSmall mindset task today: Create a non-food reward list for every 10 lbs lost (new clothes, massage, trip, gym shoes, facial, nails, etc.) Send it to me 💛\n\nSuccess is built with structure + support — and you're not doing this alone.\n📸 Send me your Day 1 tracker when you can.` },
      { type: "call", title: "Daily Check In Questions Days 1-4", icon: "📞" },
    ],
  },
  "1-wed": {
    label: "Day 3",
    phase: "Ignition Day",
    tasks: [
      { type: "graphic", title: "Daily Graphic + Day 3 Text", icon: "🖼", graphicPlaceholder: "https://rcucmbujkdwvrcjistub.supabase.co/storage/v1/object/public/CEC/day-3-ignition-day.png" },
      { type: "text", title: "Day 3 Text", icon: "💬", hasScript: true, script: `🌱 DAY 3 — IGNITION DAY\nHELLO Day 3!! ✨\nYou're approaching fat-burn ignition 🔥\nThis is where the magic starts happening internally — even if the scale hasn't caught up yet.\n\nWatch this video to shift your mindset to success:\n👉 [CHASING GOALS VIDEO]\n\nFocus today:\n• Weigh + measure your Lean & Green\n• Eat every 2–3 hours\n• Stay hydrated\n• Track everything\n• No improvising — structure creates results\n\nThis isn't a diet — it's metabolic retraining.\n\n📸 Snap your tracker + send it to me — I want to coach you, not just cheer you on 💪` },
      { type: "video", title: "Chasing Your Goals Instead of Chasing Taste Video", icon: "🎯", videoUrl: "https://vimeo.com/723522647" },
      { type: "call", title: "Daily Check In Questions Days 1-4", icon: "📞" },
    ],
  },
  "1-thu": {
    label: "Day 4",
    phase: "Fat Burn Day",
    tasks: [
      { type: "graphic", title: "Daily Graphic + Day 4 Text", icon: "🖼", graphicPlaceholder: "https://rcucmbujkdwvrcjistub.supabase.co/storage/v1/object/public/CEC/day-4-fat-burn-day.png" },
      { type: "text", title: "Day 4 Text", icon: "💬", hasScript: true, script: `🔥 DAY 4 — FAT BURN DAY\nHELLO Day 4!! 🔥\nYou should officially be entering fat-burning mode today.\nIf hunger pops up:\n🚰 Drink water ⏱ Wait 15 minutes\n\nMost of the time it passes — it's habit hunger, not true hunger.\n\nWhat starts happening now:\n✔ More energy ✔ Better sleep ✔ Reduced cravings ✔ Clearer thinking ✔ Fat loss momentum ✔ Appetite regulation\n\nThis is where people start saying: "I don't feel obsessed with food anymore."\nAnd that's metabolic freedom.\n\n💬 Reflection question: Who in your life would benefit from feeling this way too?\n\n📸 Send me your updated tracker. Let's lock in this fat-burn phase strong.` },
      { type: "call", title: "Daily Check In Questions Days 1-4", icon: "📞" },
      { type: "video", title: "Send How to Protect Your Hard-Earned Fat Burn", icon: "🛡", videoUrl: "https://vimeo.com/1163428641", note: "Send AFTER the Day 4 call" },
    ],
  },
  "1-fri": { label: "", phase: "", tasks: [] },
  "1-sat": { label: "", phase: "", tasks: [] },

  // ===== WEEK 2 =====
  "2-sun": { label: "", phase: "", tasks: [] },
  "2-mon": {
    label: "Day 8",
    phase: "Celebration",
    tasks: [
      { type: "graphic", title: "Daily Graphic", icon: "🖼", graphicPlaceholder: "https://rcucmbujkdwvrcjistub.supabase.co/storage/v1/object/public/CEC/day-8-celebration-community.png" },
      { type: "text", title: "Day 8 Text", icon: "💬", hasScript: true, script: `🥳 DAY 8 — CELEBRATION + COMMUNITY POST COACHING\nHELLO Day 8!! 🎉\nYou did it — Week ONE complete. And that matters more than the scale number.\n\nFirst — send me:\n📊 Your Week 1 scale results\n📈 Your smart scale snapshot\n💬 What you're already noticing\n\nNow let's celebrate properly — and anchor this win 💛\n\n✨ Client Page Celebration Post\nHere's a simple template:\n"Week 1 done 🎉 I started this for fat loss, but what I'm noticing already is:\n• (example: more energy)\n• (example: better sleep)\n• (example: less cravings)\n\nI didn't think I could stick to something this structured — but I did. Grateful for coaching, support, and a plan that actually feels sustainable."\n\nWeek 1 = water weight + inflammation drop\nWeeks 2+ = true fat loss phase 🔥\n\nSo proud of you. We're just getting started 💛` },
      { type: "call", title: "Check In Call", icon: "📞", note: "Celebration Call + Schedule Week 3 Call" },
    ],
  },
  "2-tue": { label: "", phase: "", tasks: [] },
  "2-wed": {
    label: "Mid-Week",
    phase: "Check In",
    tasks: [
      { type: "action", title: "Mid-Week Check In — Choose 1 or More", icon: "💛", hasScript: true, script: `Choose at least 1:\n• Send a 30–60 second voice text check in\n• Share a simple Lean & Green idea\n• Send a reminder about client mindset calls\n• Quick Call to Celebrate something specific\n\n💡 Ideas:\n• Coffee with Clients or Let's Talk reminder\n• Mindset video/podcast\n• Community win spotlight\n• Pounds Down Jar reminder\n• Simple Lean & Green recipes\n• Protein, hydration, or travel tips` },
    ],
  },
  "2-thu": { label: "", phase: "", tasks: [] },
  "2-fri": { label: "", phase: "", tasks: [] },
  "2-sat": { label: "", phase: "", tasks: [] },

  // ===== WEEK 3 =====
  "3-sun": { label: "", phase: "", tasks: [] },
  "3-mon": {
    label: "Day 15",
    phase: "Progress Check",
    tasks: [
      { type: "text", title: "Touch base text", icon: "💬" },
      { type: "call", title: "Day 15 Check In Call", icon: "📞", note: "Celebration / troubleshooting / progress check" },
    ],
  },
  "3-tue": {
    label: "Premier Order",
    phase: "",
    tasks: [
      { type: "resource", title: "Update Your Premier Order", icon: "📦", note: "When you get 7-day premier order reminder, send:", resourceUrl: "https://answers.optavia.com/help/s/article/Edit-Your-Premier-Items" },
    ],
  },
  "3-wed": {
    label: "Mid-Week",
    phase: "Check In",
    tasks: [
      { type: "action", title: "Mid-Week Check In — Choose 1 or More", icon: "💛" },
    ],
  },
  "3-thu": { label: "", phase: "", tasks: [] },
  "3-fri": { label: "", phase: "", tasks: [] },
  "3-sat": { label: "", phase: "", tasks: [] },

  // ===== WEEK 4 =====
  "4-sun": { label: "", phase: "", tasks: [] },
  "4-mon": {
    label: "Day 22",
    phase: "Scheduled Call",
    tasks: [
      { type: "text", title: "Day 22 Text", icon: "💬", note: "Reminder of your scheduled call" },
    ],
  },
  "4-tue": {
    label: "Day 23",
    phase: "Graduation",
    tasks: [
      { type: "call", title: "Check In Call", icon: "📞", note: "Client 'graduates' to VIP" },
      { type: "action", title: "Go over Office Hours and Client Support Call Schedule", icon: "📋" },
      { type: "action", title: "Invite client to VIP call", icon: "🌟" },
    ],
  },
  "4-wed": {
    label: "Mid-Week",
    phase: "Check In",
    tasks: [
      { type: "action", title: "Mid-Week Check In — Choose 1 or More", icon: "💛" },
    ],
  },
  "4-thu": {
    label: "After Call",
    phase: "Send Resources",
    tasks: [
      { type: "text", title: "Red/Yellow/Green Support Model Text", icon: "🚦", hasScript: true, script: `Hey [Client NAME] 💛\nI am so proud of you…you have officially graduated to our next level of support! 🎉\n\nWe use a simple Red • Yellow • Green system\nThese are not labels, but signals to help us support you in the best way possible.\n\n👉 Starting now, when you check in on Monday mornings, please send:\n• Your smart scale full report (if you have one)\n• AND the color that best describes your week.\n\n🟢 Green — things are flowing\n🟡 Yellow — a small adjustment is needed\n🔴 Red — you need extra support\n\n🔥 Coach Office Hours are live, open-support Zoom calls.\n👉 If you're Yellow or Red, we strongly encourage you to attend that week.\nEven Green clients are welcome!\n\n⬇️ Please watch this short video + save these graphics ⬇️` },
      { type: "video", title: "How to Use Office Hours Video", icon: "🎬", videoUrl: "https://youtu.be/phRN32R_pHc" },
      { type: "graphic", title: "Office Hours Graphic", icon: "🖼", graphicPlaceholder: "https://rcucmbujkdwvrcjistub.supabase.co/storage/v1/object/public/CEC/office-hours-graphic.png" },
    ],
  },
  "4-fri": { label: "", phase: "", tasks: [] },
  "4-sat": { label: "", phase: "", tasks: [] },

  // ===== WEEK 5 =====
  "5-sun": { label: "", phase: "", tasks: [] },
  "5-mon": {
    label: "Day 29",
    phase: "R/Y/G Begins",
    tasks: [
      { type: "text", title: "Send Day 29 Text", icon: "💬", hasScript: true, script: `Happy Monday! 💛\nAs you check in today, please send:\n• Your smart scale full report\n• Your color for the week 🟢🟡🔴\n\n🟢 Green — things are flowing\n🟡 Yellow — small adjustment needed\n🔴 Red — extra support needed\n\nUsing support early keeps things moving — we've got you! 💪✨` },
      { type: "action", title: "Coaching Office Hours Begin (Optional)", icon: "🏢" },
    ],
  },
  "5-tue": {
    label: "",
    phase: "",
    tasks: [
      { type: "action", title: "Coaching Office Hours", icon: "🏢" },
    ],
  },
  "5-wed": {
    label: "Mid-Week",
    phase: "Check In",
    tasks: [
      { type: "action", title: "Mid-Week Check In — Choose 1 or More", icon: "💛" },
      { type: "action", title: "Coaching Office Hours", icon: "🏢" },
    ],
  },
  "5-thu": { label: "", phase: "", tasks: [] },
  "5-fri": { label: "", phase: "", tasks: [] },
  "5-sat": { label: "", phase: "", tasks: [] },
}

// Month 2 repeating weekly pattern
const MONTH2_WEEKLY: Record<string, DayData> = {
  sun: { label: "", phase: "", tasks: [] },
  mon: {
    label: "Monday",
    phase: "Renpho + Color Day",
    tasks: [
      { type: "action", title: "Monday: Renpho + Color Day", icon: "📊" },
      { type: "action", title: "Coaching Office Hours", icon: "🏢" },
    ],
  },
  tue: {
    label: "",
    phase: "",
    tasks: [
      { type: "action", title: "Coaching Office Hours", icon: "🏢" },
    ],
  },
  wed: {
    label: "Mid-Week",
    phase: "Check In",
    tasks: [
      { type: "action", title: "Mid-Week Check In — Choose 1 or More", icon: "💛" },
      { type: "action", title: "Coaching Office Hours", icon: "🏢" },
    ],
  },
  thu: { label: "", phase: "", tasks: [] },
  fri: { label: "", phase: "", tasks: [] },
  sat: { label: "", phase: "", tasks: [] },
}

const DAYS_OF_WEEK = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"]
const DAY_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"]

const COLOR_SCRIPTS: Record<string, ColorScript> = {
  green: { emoji: "🟢", label: "GREEN", color: "#16a34a", bg: "#f0fdf4", border: "#bbf7d0", script: `Love seeing GREEN 💚\nThat tells me things are flowing!!! Great job staying consistent. Keep doing what you're doing and let's keep the momentum going this week. I'll be cheering you on!` },
  yellow: { emoji: "🟡", label: "YELLOW", color: "#ca8a04", bg: "#fefce8", border: "#fef08a", script: `Thanks for checking in and choosing YELLOW 💛\nThat's a great signal to make a small tweak before frustration builds. Coach Office Hours will be the best next step for clarity this week. Bring your questions and we'll get you dialed in. I've got you!` },
  red: { emoji: "🔴", label: "RED", color: "#dc2626", bg: "#fef2f2", border: "#fecaca", script: `Thank you for being honest and choosing RED ❤️\nThis is just a signal… it tells us it's time to lean into support. Please plan to attend Coach Office Hours this week. When is a good time for you and I to do a quick Systems Check call so we can reset and move forward together.` },
}

// ========================================
// BADGE COMPONENT
// ========================================
function TaskBadge({ type }: { type: Task["type"] }) {
  const styles: Record<string, { bg: string; color: string; label: string }> = {
    text: { bg: "#dbeafe", color: "#1e40af", label: "TEXT" },
    graphic: { bg: "#fce7f3", color: "#be185d", label: "GRAPHIC" },
    video: { bg: "#fef3c7", color: "#92400e", label: "VIDEO" },
    call: { bg: "#d1fae5", color: "#065f46", label: "CALL" },
    resource: { bg: "#e0e7ff", color: "#3730a3", label: "LINK" },
    action: { bg: "#f3e8ff", color: "#6b21a8", label: "ACTION" },
  }
  const s = styles[type] || styles.action
  return (
    <span style={{ background: s.bg, color: s.color, padding: "2px 6px", borderRadius: "3px", fontSize: "9px", fontWeight: 700, letterSpacing: "0.5px" }}>
      {s.label}
    </span>
  )
}

// ========================================
// DETAIL DRAWER
// ========================================
function DetailDrawer({
  day,
  onClose,
  completedTasks,
  onToggle,
  dayKey,
  showColorScripts,
}: {
  day: DayData
  onClose: () => void
  completedTasks: Record<string, boolean>
  onToggle: (key: string) => void
  dayKey: string
  showColorScripts: boolean
}) {
  const [copiedIdx, setCopiedIdx] = useState<string | null>(null)

  const copyScript = (text: string, idx: string) => {
    navigator.clipboard?.writeText(text)
    setCopiedIdx(idx)
    setTimeout(() => setCopiedIdx(null), 2000)
  }

  if (!day || day.tasks.length === 0) return null

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", justifyContent: "flex-end" }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(2px)" }} />
      <div style={{ position: "relative", width: "min(480px, 90vw)", background: "#fff", height: "100%", overflowY: "auto", boxShadow: "-4px 0 24px rgba(0,0,0,0.15)" }}>
        {/* Header */}
        <div style={{ padding: "20px 24px", background: "linear-gradient(135deg, #003B2E, #00A651)", color: "#fff", position: "sticky", top: 0, zIndex: 1 }}>
          <button onClick={onClose} style={{ position: "absolute", top: "16px", right: "16px", background: "rgba(255,255,255,0.2)", border: "none", color: "#fff", width: "32px", height: "32px", borderRadius: "50%", cursor: "pointer", fontSize: "16px" }}>✕</button>
          <div style={{ fontSize: "13px", opacity: 0.8, fontWeight: 500 }}>{day.phase}</div>
          <div style={{ fontSize: "22px", fontWeight: 800, fontFamily: "'Montserrat', sans-serif", marginTop: "4px" }}>{day.label || "Tasks"}</div>
          <div style={{ fontSize: "12px", opacity: 0.7, marginTop: "4px" }}>{day.tasks.length} task{day.tasks.length !== 1 ? "s" : ""}</div>
        </div>

        {/* Tasks */}
        <div style={{ padding: "16px" }}>
          {day.tasks.map((task, i) => {
            const taskKey = `${dayKey}-${i}`
            const done = !!completedTasks[taskKey]
            return (
              <div key={i} style={{ marginBottom: "12px", padding: "16px", borderRadius: "10px", border: done ? "1px solid #bbf7d0" : "1px solid #e5e7eb", background: done ? "#f0fdf4" : "#fafafa" }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                  <button onClick={() => onToggle(taskKey)} style={{
                    width: "24px", height: "24px", borderRadius: "50%", border: done ? "2px solid #00A651" : "2px solid #d1d5db",
                    background: done ? "#00A651" : "transparent", cursor: "pointer", flexShrink: 0, marginTop: "1px",
                    display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "13px",
                  }}>
                    {done && "✓"}
                  </button>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                      <span style={{ fontSize: "15px" }}>{task.icon}</span>
                      <span style={{ fontWeight: 600, fontSize: "14px", color: done ? "#6b7280" : "#111827" }}>{task.title}</span>
                      <TaskBadge type={task.type} />
                    </div>
                    {task.note && <p style={{ margin: "6px 0 0", fontSize: "12px", color: "#f59e0b", fontWeight: 600, fontStyle: "italic" }}>⚠️ {task.note}</p>}

                    {/* Action Buttons */}
                    <div style={{ display: "flex", gap: "6px", marginTop: "10px", flexWrap: "wrap" }}>
                      {task.hasScript && task.script && (
                        <button onClick={() => copyScript(task.script!, `script-${i}`)} style={{ fontSize: "12px", padding: "6px 12px", borderRadius: "6px", border: "1px solid #dbeafe", background: copiedIdx === `script-${i}` ? "#d1fae5" : "#eff6ff", cursor: "pointer", color: copiedIdx === `script-${i}` ? "#065f46" : "#1e40af", fontWeight: 600, transition: "all 0.2s" }}>
                          {copiedIdx === `script-${i}` ? "✅ Copied!" : "📋 Copy Script"}
                        </button>
                      )}
                      {task.videoUrl && (
                        <>
                          <button onClick={() => copyScript(task.videoUrl!, `video-${i}`)} style={{ fontSize: "12px", padding: "6px 12px", borderRadius: "6px", border: "1px solid #fef3c7", background: copiedIdx === `video-${i}` ? "#d1fae5" : "#fffbeb", cursor: "pointer", color: copiedIdx === `video-${i}` ? "#065f46" : "#92400e", fontWeight: 600, transition: "all 0.2s" }}>
                            {copiedIdx === `video-${i}` ? "✅ Copied!" : "🔗 Copy Video Link"}
                          </button>
                          <button onClick={() => window.open(task.videoUrl, "_blank")} style={{ fontSize: "12px", padding: "6px 12px", borderRadius: "6px", border: "1px solid #fef3c7", background: "#fffbeb", cursor: "pointer", color: "#92400e", fontWeight: 600 }}>
                            ▶️ Watch Video
                          </button>
                        </>
                      )}
                      {task.graphicPlaceholder && (
                        <>
                          <button onClick={() => copyScript(task.graphicPlaceholder!, `graphic-${i}`)} style={{ fontSize: "12px", padding: "6px 12px", borderRadius: "6px", border: "1px solid #fce7f3", background: copiedIdx === `graphic-${i}` ? "#d1fae5" : "#fdf2f8", cursor: "pointer", color: copiedIdx === `graphic-${i}` ? "#065f46" : "#be185d", fontWeight: 600, transition: "all 0.2s" }}>
                            {copiedIdx === `graphic-${i}` ? "✅ Copied!" : "🔗 Copy Graphic Link"}
                          </button>
                          <button onClick={() => window.open(task.graphicPlaceholder, "_blank")} style={{ fontSize: "12px", padding: "6px 12px", borderRadius: "6px", border: "1px solid #fce7f3", background: "#fdf2f8", cursor: "pointer", color: "#be185d", fontWeight: 600 }}>
                            🖼 View Graphic
                          </button>
                        </>
                      )}
                      {task.resourceUrl && (
                        <>
                          <button onClick={() => copyScript(task.resourceUrl!, `resource-${i}`)} style={{ fontSize: "12px", padding: "6px 12px", borderRadius: "6px", border: "1px solid #e0e7ff", background: copiedIdx === `resource-${i}` ? "#d1fae5" : "#eef2ff", cursor: "pointer", color: copiedIdx === `resource-${i}` ? "#065f46" : "#3730a3", fontWeight: 600, transition: "all 0.2s" }}>
                            {copiedIdx === `resource-${i}` ? "✅ Copied!" : "🔗 Copy Link"}
                          </button>
                          <button onClick={() => window.open(task.resourceUrl, "_blank")} style={{ fontSize: "12px", padding: "6px 12px", borderRadius: "6px", border: "1px solid #e0e7ff", background: "#eef2ff", cursor: "pointer", color: "#3730a3", fontWeight: 600 }}>
                            🌐 Open Link
                          </button>
                        </>
                      )}
                    </div>

                    {/* Script Preview */}
                    {task.hasScript && task.script && (
                      <details style={{ marginTop: "10px" }}>
                        <summary style={{ fontSize: "12px", color: "#6b7280", cursor: "pointer", fontWeight: 500 }}>Preview script</summary>
                        <pre style={{ marginTop: "8px", padding: "12px", background: "#f8fafc", borderRadius: "8px", fontSize: "12px", lineHeight: 1.6, whiteSpace: "pre-wrap", wordBreak: "break-word", color: "#374151", border: "1px solid #e2e8f0", maxHeight: "300px", overflowY: "auto" }}>
                          {task.script}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              </div>
            )
          })}

          {/* Color Response Scripts */}
          {showColorScripts && (
            <div style={{ marginTop: "16px", padding: "16px", borderRadius: "10px", border: "1px solid #e5e7eb", background: "#f8fafc" }}>
              <h4 style={{ margin: "0 0 12px", fontSize: "14px", fontWeight: 700, color: "#111827", fontFamily: "'Montserrat', sans-serif" }}>Response Scripts by Color</h4>
              {Object.values(COLOR_SCRIPTS).map(cs => (
                <div key={cs.label} style={{ marginBottom: "10px", padding: "12px", borderRadius: "8px", background: cs.bg, border: `1px solid ${cs.border}` }}>
                  <div style={{ fontWeight: 700, fontSize: "13px", color: cs.color, marginBottom: "6px" }}>{cs.emoji} {cs.label}</div>
                  <pre style={{ margin: 0, fontSize: "12px", lineHeight: 1.5, whiteSpace: "pre-wrap", color: "#374151" }}>{cs.script}</pre>
                  <button onClick={() => { navigator.clipboard?.writeText(cs.script) }} style={{ marginTop: "8px", fontSize: "11px", padding: "4px 10px", borderRadius: "4px", border: `1px solid ${cs.border}`, background: "#fff", cursor: "pointer", color: cs.color, fontWeight: 600 }}>
                    📋 Copy
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ========================================
// CALENDAR CELL
// ========================================
function CalendarCell({
  day,
  dayKey,
  onClick,
  completedTasks,
  weekColor,
}: {
  day: DayData
  dayKey: string
  onClick: () => void
  completedTasks: Record<string, boolean>
  weekColor: WeekColor
}) {
  const hasTasks = day && day.tasks && day.tasks.length > 0
  const completedCount = hasTasks ? day.tasks.filter((_, i) => completedTasks[`${dayKey}-${i}`]).length : 0
  const allDone = hasTasks && completedCount === day.tasks.length

  return (
    <div
      onClick={hasTasks ? onClick : undefined}
      style={{
        flex: "1 1 0", minWidth: 0, minHeight: "100px", padding: "8px",
        background: hasTasks ? weekColor.bg : "#f9fafb",
        border: allDone ? "2px solid #00A651" : `1px solid ${hasTasks ? weekColor.border : "#e5e7eb"}`,
        borderRadius: "6px", cursor: hasTasks ? "pointer" : "default",
        transition: "all 0.15s", position: "relative",
        opacity: hasTasks ? 1 : 0.5,
      }}
      onMouseEnter={e => { if (hasTasks) { (e.currentTarget as HTMLDivElement).style.transform = "scale(1.02)"; } (e.currentTarget as HTMLDivElement).style.zIndex = "1" }}
      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = "scale(1)"; (e.currentTarget as HTMLDivElement).style.zIndex = "0" }}
    >
      {allDone && <div style={{ position: "absolute", top: "4px", right: "4px", fontSize: "12px" }}>✅</div>}
      {day?.label && (
        <div style={{ fontWeight: 700, fontSize: "11px", color: weekColor.header, marginBottom: "2px", fontFamily: "'Montserrat', sans-serif", textTransform: "uppercase", letterSpacing: "0.3px" }}>
          {day.label}
        </div>
      )}
      {day?.phase && (
        <div style={{ fontSize: "10px", color: "#6b7280", marginBottom: "4px", fontWeight: 500 }}>{day.phase}</div>
      )}
      {hasTasks && day.tasks.map((task, i) => (
        <div key={i} style={{ fontSize: "10px", color: "#374151", lineHeight: 1.3, marginBottom: "3px", display: "flex", alignItems: "flex-start", gap: "3px" }}>
          <span style={{ flexShrink: 0 }}>{task.icon}</span>
          <span style={{ fontWeight: 500, textDecoration: completedTasks[`${dayKey}-${i}`] ? "line-through" : "none", opacity: completedTasks[`${dayKey}-${i}`] ? 0.5 : 1 }}>
            {task.title}
          </span>
        </div>
      ))}
      {hasTasks && (
        <div style={{ marginTop: "4px", height: "3px", borderRadius: "2px", background: "rgba(0,0,0,0.1)" }}>
          <div style={{ height: "100%", width: `${(completedCount / day.tasks.length) * 100}%`, background: "#00A651", borderRadius: "2px", transition: "width 0.3s" }} />
        </div>
      )}
    </div>
  )
}

// ========================================
// MAIN PAGE
// ========================================
export default function ClientSupportCalendarPage() {
  const [activeMonth, setActiveMonth] = useState<"month1" | "month2">("month1")
  const [selectedDay, setSelectedDay] = useState<DayData | null>(null)
  const [selectedDayKey, setSelectedDayKey] = useState<string | null>(null)
  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>({})

  const toggleTask = (key: string) => setCompletedTasks(prev => ({ ...prev, [key]: !prev[key] }))

  const openDay = (dayData: DayData, dayKey: string) => {
    if (dayData && dayData.tasks && dayData.tasks.length > 0) {
      setSelectedDay(dayData)
      setSelectedDayKey(dayKey)
    }
  }

  const month1Weeks = [1, 2, 3, 4, 5].map(weekNum => ({
    weekNum,
    color: WEEK_COLORS[weekNum - 1],
    days: DAY_KEYS.map(dk => ({
      key: `${weekNum}-${dk}`,
      data: CALENDAR_DAYS[`${weekNum}-${dk}`] || { label: "", phase: "", tasks: [] },
    })),
  }))

  const month2Weeks = [1, 2, 3, 4, 5].map(weekNum => ({
    weekNum,
    color: WEEK_COLORS[(weekNum - 1) % WEEK_COLORS.length],
    days: DAY_KEYS.map(dk => ({
      key: `m2-${weekNum}-${dk}`,
      data: MONTH2_WEEKLY[dk] || { label: "", phase: "", tasks: [] },
    })),
  }))

  const weeks = activeMonth === "month1" ? month1Weeks : month2Weeks

  const showColorScripts = selectedDayKey != null && (selectedDayKey.includes("5-mon") || selectedDayKey.startsWith("m2-"))

  return (
    <div style={{ minHeight: "100vh", background: "#e8ecf1", fontFamily: "'Open Sans', -apple-system, sans-serif" }}>
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700;800;900&family=Open+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />

      {/* HEADER */}
      <div style={{ background: "#1a2744", padding: "0" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "24px 20px 16px" }}>
          <h1 style={{ margin: 0, fontSize: "28px", fontWeight: 900, color: "#fff", fontFamily: "'Montserrat', sans-serif", letterSpacing: "-0.5px" }}>
            CREATING EMPOWERED CLIENTS
          </h1>
          <p style={{ margin: "4px 0 0", fontSize: "16px", color: "#94a3b8", fontStyle: "italic", fontFamily: "Georgia, serif" }}>
            {activeMonth === "month1" ? "Month One Guide" : "Month Two Guide"}
          </p>

          {/* Month Tabs */}
          <div style={{ display: "flex", gap: "4px", marginTop: "16px" }}>
            {([
              { id: "month1" as const, label: "Month One" },
              { id: "month2" as const, label: "Month Two" },
            ]).map(tab => (
              <button key={tab.id} onClick={() => setActiveMonth(tab.id)} style={{
                padding: "10px 24px", border: "none", cursor: "pointer", fontWeight: 700, fontSize: "13px",
                fontFamily: "'Montserrat', sans-serif", borderRadius: "8px 8px 0 0", transition: "all 0.2s",
                background: activeMonth === tab.id ? "#e8ecf1" : "rgba(255,255,255,0.05)",
                color: activeMonth === tab.id ? "#1a2744" : "#94a3b8",
              }}>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* CALENDAR */}
      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 20px 40px" }}>
        {/* Day Headers */}
        <div style={{ display: "flex", gap: "4px", padding: "12px 0 8px" }}>
          {DAYS_OF_WEEK.map(d => (
            <div key={d} style={{ flex: "1 1 0", textAlign: "center", fontWeight: 800, fontSize: "11px", color: "#475569", fontFamily: "'Montserrat', sans-serif", letterSpacing: "0.5px" }}>
              {d}
            </div>
          ))}
        </div>

        {/* Week Rows */}
        {weeks.map((week) => (
          <div key={week.weekNum} style={{ display: "flex", gap: "4px", marginBottom: "4px" }}>
            {week.days.map(({ key, data }) => (
              <CalendarCell
                key={key}
                day={data}
                dayKey={key}
                onClick={() => openDay(data, key)}
                completedTasks={completedTasks}
                weekColor={week.color}
              />
            ))}
          </div>
        ))}

        {/* Footer Note */}
        <div style={{ marginTop: "16px", padding: "12px 16px", background: "#fff", borderRadius: "8px", border: "1px solid #e5e7eb" }}>
          <p style={{ margin: 0, fontSize: "13px", color: "#6b7280" }}>
            {activeMonth === "month1"
              ? "* Click any day to see full task details, copy scripts, and access video links. For the full description of daily actions, refer to the master coaching guide."
              : "* Client Support Beyond the First 30 Days! Weekly rhythm: Monday Renpho + Color Day → Tuesday/Wednesday Office Hours → Mid-Week Touchpoint"
            }
          </p>
        </div>
      </div>

      {/* DETAIL DRAWER */}
      {selectedDay && selectedDayKey && (
        <DetailDrawer
          day={selectedDay}
          dayKey={selectedDayKey}
          onClose={() => { setSelectedDay(null); setSelectedDayKey(null) }}
          completedTasks={completedTasks}
          onToggle={toggleTask}
          showColorScripts={showColorScripts}
        />
      )}
    </div>
  )
}
