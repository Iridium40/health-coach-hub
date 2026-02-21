"use client"

import { useState, useEffect, useCallback } from "react"

interface JourneyStage {
  id: string
  label: string
  emoji: string
  color: string
  action: string
  description: string
}

const JOURNEY_STAGES: JourneyStage[] = [
  {
    id: "new_coach", label: "New Coach", emoji: "🌟", color: "#f59e0b",
    action: "Getting Started",
    description: "Just launched their OPTAVIA business. Focus is on completing coach onboarding, writing their 100's list of prospects, learning the Health Assessment process, and getting their first 3–5 clients on program.",
  },
  {
    id: "building", label: "Building", emoji: "🔧", color: "#7c3aed",
    action: "Growing the business",
    description: "Actively working their pipeline, supporting clients, and developing daily habits. Building social media presence, refining their HA conversations, and working toward certification milestones.",
  },
  {
    id: "certified", label: "Certified", emoji: "✅", color: "#00A651",
    action: "Established & consistent",
    description: "Hit key business milestones and maintaining a consistent client base. Now developing leadership skills, mentoring newer coaches, and building toward team growth and rank advancement.",
  },
  {
    id: "leader", label: "Leader", emoji: "👑", color: "#d97706",
    action: "Mentoring & scaling",
    description: "A proven coach who is now focused on developing other coaches, building a team, and scaling their impact. Leading by example with their own health journey while guiding others to do the same.",
  },
]

function CoachJourneyTimeline() {
  const [activeStage, setActiveStage] = useState<string | null>(null)
  const toggle = useCallback((id: string) => setActiveStage((prev) => (prev === id ? null : id)), [])

  return (
    <div style={{ marginBottom: "20px" }}>
      {JOURNEY_STAGES.map((stage, i) => (
        <div key={stage.id}>
          <button
            onClick={() => toggle(stage.id)}
            style={{ width: "100%", display: "flex", alignItems: "center", gap: "14px", padding: "14px 16px", background: activeStage === stage.id ? "#faf5ff" : "#fff", border: "1px solid #e2e8f0", borderRadius: "12px", cursor: "pointer", textAlign: "left", boxShadow: "0 1px 4px rgba(0,0,0,0.04)", transition: "all 0.2s" }}
          >
            <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: `linear-gradient(135deg, ${stage.color}, ${stage.color}cc)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", flexShrink: 0, boxShadow: "0 2px 6px rgba(0,0,0,0.1)" }}>
              {stage.emoji}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 800, fontSize: "15px", color: "#1e293b" }}>{stage.label}</div>
              <div style={{ fontSize: "13px", fontWeight: 600, color: "#00A651", marginTop: "1px" }}>→ {stage.action}</div>
            </div>
            <span style={{ color: "#cbd5e1", fontSize: "12px", transition: "transform 0.2s", transform: activeStage === stage.id ? "rotate(180deg)" : "rotate(0)" }}>▾</span>
          </button>

          {activeStage === stage.id && (
            <div style={{ padding: "10px 16px 10px 74px" }}>
              <p style={{ fontSize: "12px", color: "#64748b", lineHeight: 1.55, margin: 0 }}>{stage.description}</p>
            </div>
          )}

          {i < JOURNEY_STAGES.length - 1 && (
            <div style={{ display: "flex", justifyContent: "flex-start", paddingLeft: "37px" }}>
              <div style={{ width: "3px", height: "16px", background: "linear-gradient(180deg, #c4b5fd, #ddd6fe)", borderRadius: "2px" }} />
            </div>
          )}
        </div>
      ))}
      <p style={{ textAlign: "center", fontSize: "11px", color: "#94a3b8", marginTop: "8px" }}>
        👆 Tap any stage to see details
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

export function CoachLearningGuide({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    document.body.style.overflow = "hidden"
    return () => { document.body.style.overflow = "" }
  }, [])

  return (
    <>
      <div style={{ position: "fixed", inset: 0, zIndex: 10000, background: "rgba(15,23,42,0.6)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", overflowY: "auto" }}>
        <div style={{ maxWidth: "660px", width: "100%", background: "linear-gradient(170deg, #fff 0%, #f8fafb 100%)", borderRadius: "24px", overflow: "hidden", boxShadow: "0 8px 40px rgba(0,0,0,0.2)", animation: "coachSlideUp 0.3s ease", margin: "auto" }}>

          {/* HEADER */}
          <div style={{ background: "linear-gradient(135deg, #008C45 0%, #00A651 50%, #2dbf6e 100%)", padding: "36px 36px 32px", textAlign: "center", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: "-80px", right: "-50px", width: "240px", height: "240px", borderRadius: "50%", background: "radial-gradient(circle, rgba(255,255,255,0.12), transparent 70%)" }} />
            <div style={{ position: "absolute", bottom: "-60px", left: "-30px", width: "180px", height: "180px", borderRadius: "50%", background: "radial-gradient(circle, rgba(255,255,255,0.08), transparent 70%)" }} />
            <button onClick={onClose} style={{ position: "absolute", top: "14px", right: "14px", width: "32px", height: "32px", borderRadius: "50%", border: "none", background: "rgba(255,255,255,0.15)", color: "#fff", fontSize: "16px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1 }}>✕</button>
            <span style={{ fontSize: "44px", display: "inline-block", marginBottom: "10px", position: "relative", filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.15))" }}>🚀</span>
            <h1 style={{ margin: 0, fontFamily: "'Montserrat', sans-serif", fontWeight: 900, fontSize: "24px", color: "#fff", letterSpacing: "-0.5px", position: "relative", textShadow: "0 2px 12px rgba(0,0,0,0.15)" }}>
              Coach List
            </h1>
            <p style={{ color: "rgba(255,255,255,0.9)", fontSize: "14px", marginTop: "8px", position: "relative", lineHeight: 1.5 }}>
              Track the coaches you&apos;ve sponsored — their rank progression, development milestones, and growth. Mentor your team to build their businesses.
            </p>
          </div>

          {/* SCROLLABLE BODY */}
          <div style={{ maxHeight: "calc(80vh - 200px)", overflowY: "auto", padding: "28px 32px 14px" }}>

            <CollapsibleSection title="Getting Started" emoji="🎯">
              <div style={{ padding: "16px 18px", background: "linear-gradient(135deg, #f0fdf4, #ecfdf5)", border: "1px solid #d1fae5", borderRadius: "10px", marginBottom: "14px" }}>
                <h4 style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 800, fontSize: "12px", color: "#065f46", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "10px", display: "flex", alignItems: "center", gap: "6px" }}>🎯 Step by Step</h4>
                {[
                  <>Go to <strong style={{ color: "#065f46" }}>My Business → Coach List</strong></>,
                  <>Click <strong style={{ color: "#065f46" }}>+ Add Coach</strong> in the top-right corner</>,
                  <>Enter their <strong style={{ color: "#065f46" }}>Name / Nickname</strong> — something you&apos;ll recognize</>,
                  <>Select their <strong style={{ color: "#065f46" }}>Stage</strong> — New Coach, Building, Certified, or Leader</>,
                  <>Choose their <strong style={{ color: "#065f46" }}>OPTAVIA Rank</strong> from the dropdown</>,
                  <>Set their <strong style={{ color: "#065f46" }}>Launch Date</strong> — we&apos;ll calculate their day counter and week automatically</>,
                  <>Enter their current <strong style={{ color: "#065f46" }}>Clients</strong> and <strong style={{ color: "#065f46" }}>Prospects</strong> counts</>,
                  <>Add any <strong style={{ color: "#065f46" }}>Notes</strong> — coaching goals, next steps, or context (optional)</>,
                  <>Click <strong style={{ color: "#065f46" }}>Add Coach</strong> — their card appears with day counter, stage, rank, and more!</>,
                ].map((text, i) => (
                  <div key={i} style={{ display: "flex", gap: "10px", padding: "8px 0", alignItems: "flex-start", borderBottom: i < 8 ? "1px solid rgba(0,166,81,0.1)" : "none" }}>
                    <div style={{ width: "24px", height: "24px", borderRadius: "6px", background: "#00A651", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Montserrat', sans-serif", fontWeight: 800, fontSize: "11px", flexShrink: 0, boxShadow: "0 1px 4px rgba(0,166,81,0.2)" }}>{i + 1}</div>
                    <div style={{ fontSize: "13px", color: "#374151", lineHeight: 1.45 }}>{text}</div>
                  </div>
                ))}
              </div>

              <div style={{ padding: "14px 16px", borderRadius: "10px", display: "flex", alignItems: "flex-start", gap: "10px", background: "#f0fdf4", border: "1px solid #bbf7d0" }}>
                <span style={{ fontSize: "18px", flexShrink: 0, marginTop: "1px" }}>🎯</span>
                <p style={{ fontSize: "13px", color: "#475569", lineHeight: 1.5, margin: 0 }}>
                  <strong style={{ color: "#1e293b" }}>Why it matters:</strong> The coaches you sponsor are building their businesses too — and your mentorship makes the difference between a coach who thrives and one who stalls. The Coach List gives you a clear view of where each coach stands, what they should be focused on, and exactly how you can help them. With scheduled mentoring sessions and rank tracking, you can support a growing team without losing track of anyone.
                </p>
              </div>
            </CollapsibleSection>

            <CollapsibleSection title="Privacy & Labels" emoji="🔒">
              <div style={{ padding: "16px 18px", background: "linear-gradient(135deg, #f0fdf4, #ecfdf5)", border: "1px solid #bbf7d0", borderRadius: "12px", position: "relative", fontSize: "14px", color: "#475569", lineHeight: 1.65 }}>
                <span style={{ position: "absolute", top: "-10px", left: "14px", fontSize: "16px", background: "#fff", padding: "0 4px", borderRadius: "6px" }}>🔒</span>
                Just like your other lists, the Coach List is <strong style={{ color: "#00A651" }}>privacy-first</strong> — use nicknames or first names only. All official coach information stays in OPTAVIA&apos;s coach portal.
              </div>
            </CollapsibleSection>

            <CollapsibleSection title="Coach Development Stages" emoji="📊">
              <div style={{ display: "flex", alignItems: "center", gap: "4px", padding: "14px 16px", background: "linear-gradient(135deg, #f8fafc, #f1f5f9)", borderRadius: "12px", border: "1px solid #e2e8f0", overflowX: "auto" }}>
                {[
                  { label: "🌟 New Coach", bg: "#f59e0b" },
                  { label: "🔧 Building", bg: "#7c3aed" },
                  { label: "✅ Certified", bg: "#00A651" },
                  { label: "👑 Leader", bg: "#d97706" },
                ].map((s, i, arr) => (
                  <span key={s.label} style={{ display: "contents" }}>
                    <div style={{ padding: "6px 12px", borderRadius: "7px", fontSize: "11px", fontWeight: 700, fontFamily: "'Montserrat', sans-serif", whiteSpace: "nowrap", color: "#fff", background: s.bg, boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>{s.label}</div>
                    {i < arr.length - 1 && <span style={{ color: "#cbd5e1", fontSize: "14px", fontWeight: 700, flexShrink: 0 }}>→</span>}
                  </span>
                ))}
              </div>
            </CollapsibleSection>

            <CollapsibleSection title="The Journey — Stage by Stage" emoji="🗺️">
              <CoachJourneyTimeline />
            </CollapsibleSection>

            <CollapsibleSection title="Features" emoji="⚡">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                {[
                  { icon: "📆", text: "Auto-calculated day counter and week from their launch date" },
                  { icon: "📊", text: "Visual pipeline showing coaches at each development stage" },
                  { icon: "🏅", text: "OPTAVIA Rank tracking — from New Coach through the full rank structure" },
                  { icon: "👥", text: "Client & Prospect counts — see each coach's business at a glance" },
                  { icon: "📅", text: "Schedule mentoring calls — phone or Zoom with calendar invites" },
                  { icon: "🔍", text: "Search by name and filter by stage — New Coach, Building, Certified, Leader" },
                  { icon: "📝", text: "Notes — track coaching goals, next steps, and wins for each coach" },
                  { icon: "📥", text: "Export your full coach list to CSV for backup or review" },
                ].map((f) => (
                  <div key={f.text} style={{ display: "flex", alignItems: "flex-start", gap: "8px", padding: "10px 12px", background: "#f8fafc", borderRadius: "8px", border: "1px solid #f1f5f9" }}>
                    <span style={{ fontSize: "16px", flexShrink: 0, marginTop: "1px" }}>{f.icon}</span>
                    <span style={{ fontSize: "12px", color: "#475569", fontWeight: 600, lineHeight: 1.4 }}>{f.text}</span>
                  </div>
                ))}
              </div>
            </CollapsibleSection>

            <CollapsibleSection title="Key Tools" emoji="🔧">
              <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", padding: "14px 16px", marginBottom: "14px", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "10px" }}>
                <span style={{ fontSize: "22px", flexShrink: 0 }}>🏅</span>
                <div>
                  <h4 style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 800, fontSize: "13px", color: "#1e293b", marginBottom: "3px" }}>Rank Tracking</h4>
                  <p style={{ fontSize: "12px", color: "#475569", lineHeight: 1.5, margin: 0 }}>Use the <strong style={{ color: "#00A651" }}>Rank</strong> button on each coach card to update their OPTAVIA rank as they progress. The rank and stage work together — stage tracks their development phase while rank tracks their official OPTAVIA position. See their progress bar and current rank at a glance.</p>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", padding: "14px 16px", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "10px" }}>
                <span style={{ fontSize: "22px", flexShrink: 0 }}>📅</span>
                <div>
                  <h4 style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 800, fontSize: "13px", color: "#1e293b", marginBottom: "3px" }}>Schedule Mentoring Sessions</h4>
                  <p style={{ fontSize: "12px", color: "#475569", lineHeight: 1.5, margin: 0 }}>Tap <strong style={{ color: "#00A651" }}>Schedule</strong> on any coach card to set up mentoring calls — choose phone or Zoom, pick a day and time, and optionally send calendar invites. Consistent coaching is the #1 factor in a new coach&apos;s success — the scheduler makes it easy to stay on top of your mentoring cadence across your entire team.</p>
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
              Access your coach list anytime from the My Business menu
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes coachSlideUp {
          from { transform: translateY(20px) scale(0.97); opacity: 0; }
          to { transform: translateY(0) scale(1); opacity: 1; }
        }
      `}</style>
    </>
  )
}
