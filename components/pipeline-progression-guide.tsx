"use client"

import { useState, useCallback } from "react"

interface JourneyStage {
  id: string
  label: string
  emoji: string
  action: string
  description: string
  color: string
  tips: string[]
}

const JOURNEY_STAGES: JourneyStage[] = [
  {
    id: "new", label: "New", emoji: "✨", color: "#3b82f6",
    action: "Add to your 100's list",
    description: "Someone you know who could benefit from OPTAVIA. Start with a nickname for privacy.",
    tips: ["Think about who in your life struggles with health", "Add notes about how you know them"],
  },
  {
    id: "interested", label: "Interested", emoji: "🔥", color: "#f59e0b",
    action: "Send Health Assessment",
    description: "They want to learn more! Send them the Health Assessment to understand their goals.",
    tips: ["Strike while the iron is hot!", "Send the HA link right away", "Let them know you'll review it together"],
  },
  {
    id: "ha_scheduled", label: "HA Scheduled", emoji: "📅", color: "#8b5cf6",
    action: "Conduct the Health Assessment call",
    description: "Meeting is booked! Prepare to walk through their HA and present the program.",
    tips: ["Review their HA responses before the call", "Focus on THEIR goals and struggles", "Consider a 3-way call with your coach"],
  },
  {
    id: "client", label: "Client!", emoji: "🎉", color: "#00A651",
    action: "Welcome to OPTAVIA!",
    description: "They've said YES! Onboard them, set their start date, and begin the journey together.",
    tips: ["Celebrate this win! 🎊", "Set their program start date", "Schedule your first check-in", "Add them to My Clients"],
  },
]

const OFF_RAMP = {
  label: "Not Interested",
  emoji: "⏸️",
  description: "Not right now — and that's okay! Keep them on your list and nurture the relationship.",
  tips: ["Don't take it personally", "Timing is everything", "Stay connected — circumstances change", "They may come back when ready"],
}

function JourneyTimeline() {
  const [activeStage, setActiveStage] = useState<string | null>(null)
  const toggle = useCallback((id: string) => setActiveStage((prev) => (prev === id ? null : id)), [])

  return (
    <div style={{ marginBottom: "20px" }}>
      {JOURNEY_STAGES.map((stage, i) => (
        <div key={stage.id}>
          <button
            onClick={() => toggle(stage.id)}
            style={{ width: "100%", display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", background: activeStage === stage.id ? "#f8fafc" : "transparent", border: "none", borderBottom: "1px solid #f1f5f9", cursor: "pointer", textAlign: "left", borderRadius: activeStage === stage.id ? "10px" : 0, transition: "background 0.15s" }}
          >
            <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: stage.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", flexShrink: 0, boxShadow: "0 1px 3px rgba(0,0,0,0.12)" }}>
              {stage.emoji}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 700, fontSize: "13px", color: "#1e293b" }}>{stage.label}</div>
              <div style={{ fontSize: "11px", color: "#00A651", fontWeight: 600 }}>→ {stage.action}</div>
            </div>
            <span style={{ color: "#94a3b8", fontSize: "14px", transition: "transform 0.2s", transform: activeStage === stage.id ? "rotate(180deg)" : "rotate(0)" }}>▾</span>
          </button>

          {activeStage === stage.id && (
            <div style={{ padding: "8px 12px 14px 54px", fontSize: "13px", color: "#475569", lineHeight: 1.5 }}>
              <p style={{ margin: "0 0 8px" }}>{stage.description}</p>
              {stage.tips.map((tip, ti) => (
                <div key={ti} style={{ display: "flex", alignItems: "flex-start", gap: "6px", marginBottom: "3px" }}>
                  <span style={{ color: "#00A651", marginTop: "2px", fontSize: "12px" }}>✓</span>
                  <span style={{ fontSize: "12px", color: "#374151" }}>{tip}</span>
                </div>
              ))}
            </div>
          )}

          {/* Off-ramp after Interested */}
          {stage.id === "interested" && (
            <div style={{ marginLeft: "42px", marginBottom: "4px" }}>
              <button
                onClick={() => toggle("not_interested")}
                style={{ width: "100%", display: "flex", alignItems: "center", gap: "8px", padding: "8px 10px", background: activeStage === "not_interested" ? "#f8fafc" : "transparent", border: "1px dashed #d1d5db", borderRadius: "8px", cursor: "pointer", textAlign: "left", marginTop: "2px", marginBottom: "4px" }}
              >
                <span style={{ fontSize: "14px" }}>{OFF_RAMP.emoji}</span>
                <span style={{ fontSize: "12px", fontWeight: 600, color: "#64748b", flex: 1 }}>{OFF_RAMP.label}</span>
                <span style={{ fontSize: "10px", color: "#94a3b8" }}>(for now)</span>
              </button>
              {activeStage === "not_interested" && (
                <div style={{ padding: "6px 10px 12px 32px", fontSize: "12px", color: "#475569", lineHeight: 1.5 }}>
                  <p style={{ margin: "0 0 6px" }}>{OFF_RAMP.description}</p>
                  {OFF_RAMP.tips.map((tip, ti) => (
                    <div key={ti} style={{ display: "flex", alignItems: "flex-start", gap: "6px", marginBottom: "2px" }}>
                      <span style={{ color: "#94a3b8", marginTop: "2px" }}>•</span>
                      <span style={{ fontSize: "12px", color: "#64748b" }}>{tip}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Connector dot between stages */}
          {i < JOURNEY_STAGES.length - 1 && stage.id !== "interested" && (
            <div style={{ display: "flex", justifyContent: "flex-start", paddingLeft: "26px" }}>
              <div style={{ width: "2px", height: "8px", background: "#e2e8f0" }} />
            </div>
          )}
        </div>
      ))}
      <p style={{ textAlign: "center", fontSize: "11px", color: "#94a3b8", marginTop: "6px" }}>
        👆 Tap any stage to see tips
      </p>
    </div>
  )
}

function CollapsibleSection({ title, emoji, defaultOpen = false, children }: { title: string; emoji?: string; defaultOpen?: boolean; children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  return (
    <div style={{ marginBottom: "16px", border: "1px solid #e2e8f0", borderRadius: "12px", overflow: "hidden" }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{ width: "100%", display: "flex", alignItems: "center", gap: "10px", padding: "14px 16px", background: isOpen ? "#f8fafc" : "#fff", border: "none", cursor: "pointer", textAlign: "left", transition: "background 0.15s" }}
      >
        {emoji && <span style={{ fontSize: "18px", flexShrink: 0 }}>{emoji}</span>}
        <span style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 800, fontSize: "12px", color: "#374151", textTransform: "uppercase", letterSpacing: "1.5px", flex: 1 }}>{title}</span>
        <span style={{ color: "#94a3b8", fontSize: "14px", transition: "transform 0.2s", transform: isOpen ? "rotate(180deg)" : "rotate(0)" }}>▾</span>
      </button>
      {isOpen && (
        <div style={{ padding: "4px 16px 16px" }}>
          {children}
        </div>
      )}
    </div>
  )
}

export function PipelineProgressionGuide({ onClose }: { onClose: () => void }) {
  return (
    <>
      <div style={{ position: "fixed", inset: 0, zIndex: 10000, background: "rgba(15,23,42,0.6)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", overflowY: "auto" }}>
        <div style={{ maxWidth: "660px", width: "100%", background: "linear-gradient(170deg, #fff 0%, #f8fafb 100%)", borderRadius: "24px", overflow: "hidden", boxShadow: "0 8px 40px rgba(0,0,0,0.2)", animation: "plgSlideUp 0.3s ease", margin: "auto" }}>

          {/* HEADER */}
          <div style={{ background: "linear-gradient(135deg, #008C45 0%, #00A651 50%, #2dbf6e 100%)", padding: "36px 36px 32px", textAlign: "center", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: "-80px", right: "-50px", width: "240px", height: "240px", borderRadius: "50%", background: "radial-gradient(circle, rgba(255,255,255,0.12), transparent 70%)" }} />
            <div style={{ position: "absolute", bottom: "-60px", left: "-30px", width: "180px", height: "180px", borderRadius: "50%", background: "radial-gradient(circle, rgba(255,255,255,0.08), transparent 70%)" }} />
            <button onClick={onClose} style={{ position: "absolute", top: "14px", right: "14px", width: "32px", height: "32px", borderRadius: "50%", border: "none", background: "rgba(255,255,255,0.15)", color: "#fff", fontSize: "16px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1 }}>✕</button>
            <span style={{ fontSize: "44px", display: "inline-block", marginBottom: "10px", position: "relative", filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.15))" }}>📋</span>
            <h1 style={{ margin: 0, fontFamily: "'Montserrat', sans-serif", fontWeight: 900, fontSize: "24px", color: "#fff", letterSpacing: "-0.5px", position: "relative", textShadow: "0 2px 12px rgba(0,0,0,0.15)" }}>
              100&apos;s List
            </h1>
            <p style={{ color: "rgba(255,255,255,0.9)", fontSize: "14px", marginTop: "8px", position: "relative", lineHeight: 1.5 }}>
              Your prospect pipeline — track everyone who could benefit from OPTAVIA and never lose a follow-up.
            </p>
          </div>

          {/* SCROLLABLE BODY */}
          <div style={{ maxHeight: "calc(80vh - 200px)", overflowY: "auto", padding: "28px 32px 14px" }}>

            <CollapsibleSection title="Getting Started" emoji="🎯">
              <div style={{ padding: "16px 18px", background: "linear-gradient(135deg, #f0fdf4, #ecfdf5)", border: "1px solid #d1fae5", borderRadius: "10px", marginBottom: "14px" }}>
                <h4 style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 800, fontSize: "12px", color: "#065f46", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "10px", display: "flex", alignItems: "center", gap: "6px" }}>🎯 Step by Step</h4>
                {[
                  <>Go to <strong style={{ color: "#065f46" }}>My Business → 100&apos;s List</strong></>,
                  <>Click <strong style={{ color: "#065f46" }}>+ Add to List</strong> in the top-right corner</>,
                  <>Enter a <strong style={{ color: "#065f46" }}>Label / Nickname</strong> you&apos;ll recognize (e.g., &quot;Gym Sarah&quot;)</>,
                  <>Select <strong style={{ color: "#065f46" }}>How did you meet?</strong> — Family, Work, Social Media, etc.</>,
                  <>Add any helpful <strong style={{ color: "#065f46" }}>Notes</strong> for context (optional)</>,
                  <>Click <strong style={{ color: "#065f46" }}>Add to List</strong> — they appear as &quot;New&quot; in your pipeline!</>,
                ].map((text, i) => (
                  <div key={i} style={{ display: "flex", gap: "10px", padding: "8px 0", alignItems: "flex-start", borderBottom: i < 5 ? "1px solid rgba(0,166,81,0.1)" : "none" }}>
                    <div style={{ width: "24px", height: "24px", borderRadius: "6px", background: "#00A651", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Montserrat', sans-serif", fontWeight: 800, fontSize: "11px", flexShrink: 0, boxShadow: "0 1px 4px rgba(0,166,81,0.2)" }}>{i + 1}</div>
                    <div style={{ fontSize: "13px", color: "#374151", lineHeight: 1.45 }}>{text}</div>
                  </div>
                ))}
              </div>

              <div style={{ padding: "14px 16px", borderRadius: "10px", display: "flex", alignItems: "flex-start", gap: "10px", background: "#f0fdf4", border: "1px solid #bbf7d0" }}>
                <span style={{ fontSize: "18px", flexShrink: 0, marginTop: "1px" }}>🎯</span>
                <p style={{ fontSize: "13px", color: "#475569", lineHeight: 1.5, margin: 0 }}>
                  <strong style={{ color: "#1e293b" }}>Why it matters:</strong> Most coaches lose track of conversations and forget to follow up. Your 100&apos;s List keeps every prospect visible with their stage, meeting source, and notes — so no one falls through the cracks. When they become a client, they flow into your Client List automatically.
                </p>
              </div>
            </CollapsibleSection>

            <CollapsibleSection title="Privacy & Labels" emoji="🔒">
              <div style={{ padding: "16px 18px", background: "linear-gradient(135deg, #f0fdf4, #ecfdf5)", border: "1px solid #bbf7d0", borderRadius: "12px", position: "relative", fontSize: "14px", color: "#475569", lineHeight: 1.65 }}>
                <span style={{ position: "absolute", top: "-10px", left: "14px", fontSize: "16px", background: "#fff", padding: "0 4px", borderRadius: "6px" }}>🔒</span>
                Your 100&apos;s List is <strong style={{ color: "#00A651" }}>privacy-first</strong> — you only store nicknames and labels here. All real contact information stays in OPTAVIA&apos;s official coach portal.
              </div>
            </CollapsibleSection>

            <CollapsibleSection title="Your Prospect Pipeline" emoji="📊">
              <div style={{ display: "flex", alignItems: "center", gap: "4px", padding: "14px 16px", background: "linear-gradient(135deg, #f8fafc, #f1f5f9)", borderRadius: "12px", border: "1px solid #e2e8f0", overflowX: "auto" }}>
                {[
                  { label: "🆕 New", bg: "#3b82f6" },
                  { label: "🔥 Interested", bg: "#f59e0b" },
                  { label: "📅 HA Scheduled", bg: "#8b5cf6" },
                  { label: "🎉 Client Won", bg: "#00A651" },
                ].map((s, i, arr) => (
                  <span key={s.label} style={{ display: "contents" }}>
                    <div style={{ padding: "6px 12px", borderRadius: "7px", fontSize: "11px", fontWeight: 700, fontFamily: "'Montserrat', sans-serif", whiteSpace: "nowrap", color: "#fff", background: s.bg, boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>{s.label}</div>
                    {i < arr.length - 1 && <span style={{ color: "#cbd5e1", fontSize: "14px", fontWeight: 700, flexShrink: 0 }}>→</span>}
                  </span>
                ))}
              </div>
            </CollapsibleSection>

            <CollapsibleSection title="The Journey — Stage by Stage" emoji="🗺️">
              <JourneyTimeline />
            </CollapsibleSection>

            <CollapsibleSection title="Features" emoji="⚡">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                {[
                  { icon: "🏷️", text: "Privacy-first labels — nicknames only, no real contact info stored" },
                  { icon: "📊", text: "Visual pipeline counts showing prospects at each stage" },
                  { icon: "📅", text: "Schedule Health Assessments with date, time, and calendar invites" },
                  { icon: "📤", text: "Share HA — send the assessment link for your prospect to complete" },
                  { icon: "✅", text: "Check In to log each conversation and stay consistent" },
                  { icon: "🔍", text: "Search by label and filter by stage — New, Interested, Client Won, and more" },
                  { icon: "📝", text: "Notes on each card — add context for follow-ups" },
                  { icon: "⏰", text: "Set reminders so you never forget a follow-up" },
                  { icon: "✏️", text: "Edit prospects — update details as conversations progress" },
                  { icon: "📥", text: "Export your full list to CSV for backup or review" },
                ].map((f) => (
                  <div key={f.text} style={{ display: "flex", alignItems: "flex-start", gap: "8px", padding: "10px 12px", background: "#f8fafc", borderRadius: "8px", border: "1px solid #f1f5f9" }}>
                    <span style={{ fontSize: "16px", flexShrink: 0, marginTop: "1px" }}>{f.icon}</span>
                    <span style={{ fontSize: "12px", color: "#475569", fontWeight: 600, lineHeight: 1.4 }}>{f.text}</span>
                  </div>
                ))}
              </div>
            </CollapsibleSection>

            <CollapsibleSection title="Coaching Tips" emoji="💡">
              <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", padding: "14px 16px", marginBottom: "12px", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "10px" }}>
                <span style={{ fontSize: "22px", flexShrink: 0 }}>💡</span>
                <div>
                  <h4 style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 800, fontSize: "13px", color: "#1e293b", marginBottom: "3px" }}>Coaching Guide & Resources</h4>
                  <p style={{ fontSize: "12px", color: "#475569", lineHeight: 1.5, margin: 0 }}>Every prospect card has an expandable guide built right in. It shows coaching actions for their current stage — like initial outreach tips, how to share your story, and conversation starters — so you always know the right next step.</p>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", padding: "14px 16px", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "10px" }}>
                <span style={{ fontSize: "22px", flexShrink: 0 }}>📋</span>
                <div>
                  <h4 style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 800, fontSize: "13px", color: "#1e293b", marginBottom: "3px" }}>How Share HA Works</h4>
                  <p style={{ fontSize: "12px", color: "#475569", lineHeight: 1.5, margin: 0 }}>When a prospect is ready, tap <strong>Share HA</strong> to send them a Health Assessment link. They complete and submit it on their own, and the results are sent directly to your email. No health data is stored in the app — it stays private between you and your prospect.</p>
                </div>
              </div>
            </CollapsibleSection>

          </div>

          {/* FOOTER */}
          <div style={{ padding: "20px 32px 28px", borderTop: "1px solid #f1f5f9" }}>
            <button onClick={onClose} style={{ width: "100%", padding: "15px", border: "none", borderRadius: "14px", fontFamily: "'Montserrat', sans-serif", fontWeight: 700, fontSize: "15px", cursor: "pointer", textAlign: "center", color: "#fff", background: "linear-gradient(135deg, #008C45, #00A651)", boxShadow: "0 4px 16px rgba(0,166,81,0.3)", transition: "all 0.25s" }}>
              Got It! →
            </button>
            <p style={{ textAlign: "center", marginTop: "12px", fontSize: "12px", color: "#94a3b8" }}>
              Access your list anytime from the My Business menu
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes plgSlideUp {
          from { transform: translateY(20px) scale(0.97); opacity: 0; }
          to { transform: translateY(0) scale(1); opacity: 1; }
        }
      `}</style>
    </>
  )
}
