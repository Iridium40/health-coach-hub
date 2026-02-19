# Client Start Date & Coach Action System

## Overview

When a coach adds a client with a **start date**, the application calculates a **program day** and uses it to drive the entire coaching experience: phase labels, milestone celebrations, touchpoint templates, needs-attention alerts, contextual resources, and dashboard action items. The system automates the "what should I do for this client today?" decision so coaches never miss a key moment.

---

## 1. Program Day Calculation

The program day is the number of days since the client's start date.

**Primary implementation** — `hooks/use-clients.tsx` → `getProgramDay()`:

```typescript
export function getProgramDay(startDate: string): number {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const startDay = parseLocalDate(startDate)   // Parses "YYYY-MM-DD" as local
  const diffTime = today.getTime() - startDay.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
  return Math.max(1, diffDays)                 // Minimum of Day 1
}
```

A secondary utility in `lib/dateHelpers.ts` → `calculateProgramDay()` uses 0-based counting (Day 0 = start date). The UI-facing code uses `getProgramDay()` (1-based).

---

## 2. Phase System

Every program day maps to a **phase** with color coding and optional milestone flag. This drives the visual appearance of client cards throughout the app.

**Implementation** — `hooks/use-clients.tsx` → `getDayPhase()`:

| Day Range | Phase Label | Color | Milestone? |
|-----------|------------|-------|------------|
| 1–3 | Critical Phase | Red | No |
| 4–6 | Week 1 | Orange | No |
| **7** | **Week 1 Complete! 🎉** | **Green** | **Yes** |
| 8–13 | Week 2 | Blue | No |
| **14** | **2 Weeks! ⭐** | **Green** | **Yes** |
| 15–20 | Week 3 | Purple | No |
| **21** | **21 Days — Habit Formed! 💎** | **Green** | **Yes** |
| 22–29 | Week 4 | Cyan | No |
| **30** | **ONE MONTH! 👑** | **Gold** | **Yes** |
| 31+ | Day N | Green | No |

Each phase returns a `DayPhase` object with `label`, `color`, `bg` (background color), and `milestone` boolean used for styling.

---

## 3. Milestone System

### 3.1 Milestone Days

Four key days trigger special behavior: **Day 7, 14, 21, and 30**.

Detected by `isMilestoneDay()` in both `lib/dateHelpers.ts` and `hooks/use-touchpoint-templates.tsx`:

```typescript
export function isMilestoneDay(programDay: number): boolean {
  return [7, 14, 21, 30].includes(programDay)
}
```

### 3.2 Milestone Tracking

Each client record has a `last_celebrated_day` field (stored in Supabase) that tracks which milestone was last celebrated. This prevents showing the "Celebrate!" prompt repeatedly.

```
last_celebrated_day: number | null
```

### 3.3 What Happens on a Milestone Day

On the **Client Card** (`components/client-tracker/client-card.tsx`):
1. The card gets a green border and background highlight
2. A milestone badge appears next to the client name (e.g., "Week 1 Complete! 🎉")
3. The "Text" button transforms into an **animated pulsing "Celebrate!" button** (amber, with `animate-pulse`)
4. Clicking "Celebrate!" marks `last_celebrated_day = programDay` in the database and opens the **Milestone Action Modal**
5. After celebrating, the button changes to "Celebrated ✓" (green, static)

On the **Dashboard** (`components/dashboard/TodaysFocus.tsx`):
1. A milestone card appears in the Today's Focus section with a trophy icon and phase label
2. The card animates with a pulse effect
3. Two actions: **Dismiss** (hides for today via localStorage) or **"🎉 Celebrate!"** (opens the Milestone Action Modal)
4. Limited to 2 milestone clients shown at a time

### 3.4 Milestone Stats

The `useClients` hook computes a `milestonesToday` stat count:

```typescript
milestonesToday: clients.filter(c => {
  if (c.status !== 'active') return false
  const day = getProgramDay(c.start_date)
  return [7, 14, 21, 30].includes(day)
}).length
```

---

## 4. Touchpoint Trigger System

The touchpoint system determines **what type of outreach** (text vs. call) and **what message templates** to show for each program day or attention condition.

### 4.1 Trigger Matching

**Implementation** — `hooks/use-touchpoint-templates.tsx` → `getTriggerForDay()`:

Priority order:
1. **Attention-based triggers** (highest priority):
   - `never_checked_in` — client has never been checked in
   - `no_contact_10` — 10+ days since last contact
   - `scheduled_due` — scheduled check-in is due today/past
2. **Milestone triggers** (exact day match):
   - Day 7 → `week_1_complete` (call)
   - Day 14 → `two_weeks` (call)
   - Day 21 → `twenty_one_days` (call)
   - Day 30 → `one_month` (call)
3. **Phase-based triggers** (day range match):
   - Days 1–3 → `critical_phase` (text)
   - Days 4–6 → `week_1` (text)
   - Days 8–13 → `week_2` (text)
   - Days 15–20 → `week_3` (text)
   - Days 22–29 → `week_4` (text)
   - Days 31+ → `ongoing` (text)

### 4.2 Trigger Data Structure

Each trigger includes:
- **Templates** — Pre-written text messages with personalization tokens
- **Meeting Invite** — Subject and body for scheduling a celebration call (milestone triggers only)
- **Talking Points** — Numbered coaching points for calls
- **Action Type** — `"text"` or `"call"`

### 4.3 Personalization Tokens

Messages support these tokens, replaced at render time:
- `{firstName}` — client's first name (parsed from label)
- `{days}` — current program day number
- `{coachName}` — coach's first name (from profile)
- `{nextMilestone}` — next milestone day number

---

## 5. Milestone Action Modal

**Component** — `components/milestone-action-modal.tsx`

When a coach clicks "Celebrate!" or "Text", this modal opens with the matching trigger's content. The layout depends on the action type:

### For Call-Recommended Milestones (Days 7, 14, 21, 30):

Four tabs:
1. **📱 Text** — Pre-written SMS templates with copy-to-clipboard
2. **📧 Meeting** — Email subject/body to schedule a celebration call, plus "Schedule Celebration Call" button
3. **💬 Points** — Numbered talking points for the call
4. **💡 Resources** — Day-specific external resources from the database

### For Text-Based Phases (Days 1–6, 8–13, etc.):

Two tabs:
1. **📱 Text Templates** — Pre-written messages
2. **💡 Resources** — Day-specific resources

A recommendation badge at the top indicates whether a call or text is suggested.

---

## 6. Needs Attention System

**Implementation** — `hooks/use-clients.tsx` → `needsAttention()`:

An active client needs attention if they haven't been checked in today **AND** any of these conditions are true:

| Condition | Logic |
|-----------|-------|
| **Scheduled check-in is due** | `next_scheduled_at` date is today or in the past |
| **10+ days since last check-in** | `last_touchpoint_date` was 10+ days ago |
| **Never checked in** | `last_touchpoint_date` is null |

### UI Effects

- **Client Card**: Orange border and background (`border-orange-300 bg-orange-50`)
- **Sorting**: Needs-attention clients are sorted to the top of the client list
- **Dashboard**: Appears as an action item in Today's Focus with a "Done" button
- **Stats**: The `needsAttention` count appears in pipeline stats

### Check-In Resolution

When a coach marks a check-in as done:
- `am_done` is set to `true`
- `last_touchpoint_date` is set to today's date
- The client no longer shows as needing attention
- If a scheduled check-in was due, it can be cleared simultaneously

---

## 7. Daily Touchpoint Tracking

### 7.1 Daily Reset Logic

Touchpoints (`am_done`, `pm_done`) are scoped to the current day. Rather than writing resets to the database:

```typescript
// If the stored touchpoint date isn't today, treat AM/PM as not done for the UI
if (c.last_touchpoint_date !== today) {
  return { ...c, am_done: false, pm_done: false }
}
```

This avoids write bursts at midnight while keeping the UI accurate.

### 7.2 Touchpoint Toggle

When a touchpoint is toggled:
1. The `am_done` or `pm_done` field is flipped
2. `last_touchpoint_date` is set to today
3. The update is optimistic (UI updates immediately, then syncs to Supabase)

---

## 8. Contextual Resources by Program Day

**Components** — `components/resources/ClientContextualResources.tsx` and `lib/resource-helpers.ts`

External resources from the database can be tagged with day-specific `show_condition` values. When viewing a client card, a collapsible "Day N Resources" section shows relevant resources.

### Matching Rules

| show_condition | Matches Program Day |
|---------------|-------------------|
| `client_day_{N}` | Exact day N |
| `client_day_0_or_1` | Day 0 or 1 |
| `client_day_1_to_4` | Days 1–4 |
| `client_day_1_to_9` | Days 1–9 |
| `client_day_10_to_30` | Days 10–30 |

Additional filtering via `features.relevant_days` (JSON array) and `features.show_in` (must include `"client_tracker"`).

Resources also appear in the Milestone Action Modal's "Resources" tab, filtered to the client's current program day.

---

## 9. Client Journey Guide

**Component** — `components/client-journey-guide.tsx`

A visual interactive timeline showing the full 30-day journey. Each stage is tappable to reveal coaching tips. Includes:

- All 10 stages from "Critical Phase" through "Ongoing Journey"
- Color-coded circles and cards matching the phase system
- Action type indicators (📱 Text vs 📅 Call)
- Milestone badges highlighted with ring effects
- Coaching tips per stage (e.g., "Text every single day during this phase")
- Special statuses section: **Coach Prospect** and **Paused**
- "Needs Attention" triggers summary box
- Milestone summary grid (Days 7, 14, 21, 30)

---

## 10. Dashboard Integration

### Today's Focus Section

The dashboard's Today's Focus component aggregates all action items:

1. **Clients needing attention** — Overdue check-ins, no contact, or never checked in
2. **Milestone celebrations** — Active clients on Day 7, 14, 21, or 30
3. **Upcoming meetings** — Zoom calls scheduled for today
4. **Overdue prospect follow-ups** — Prospects past their next action date
5. **Today's reminders** — Custom reminders due today

### Milestone Dismissal

Milestone alerts on the dashboard use **localStorage-based daily dismissal**:
- Key: `dismissedMilestones_{YYYY-MM-DD}`
- Value: JSON array of `"{clientId}:{programDay}"` keys
- Resets automatically the next day

### Client List Sorting

In the client tracker, clients are sorted by:
1. Needs-attention clients first
2. Then by program day ascending (newest clients first)

---

## 11. Data Flow Summary

```
Client Start Date (YYYY-MM-DD, stored in Supabase)
        │
        ▼
  getProgramDay() → Program Day (integer)
        │
        ├──► getDayPhase() → Phase label, colors, milestone flag
        │         │
        │         └──► Client Card styling & badge
        │
        ├──► isMilestoneDay() → Boolean
        │         │
        │         ├──► "Celebrate!" button animation
        │         ├──► Dashboard milestone alert
        │         └──► Milestone stats count
        │
        ├──► getTriggerForDay() → Touchpoint Trigger
        │         │
        │         ├──► Text templates (personalized)
        │         ├──► Meeting invite (for calls)
        │         ├──► Talking points
        │         └──► Action type recommendation (text vs call)
        │
        ├──► needsAttention() → Boolean
        │         │
        │         ├──► Orange highlighting on client card
        │         ├──► Sort to top of client list
        │         └──► Dashboard action item
        │
        └──► getRelevantResourcesForClient() → External Resources
                  │
                  ├──► "Day N Resources" on client card
                  └──► Resources tab in Milestone Action Modal
```

---

## 12. Key Files Reference

| File | Purpose |
|------|---------|
| `hooks/use-clients.tsx` | Client data, `getProgramDay()`, `getDayPhase()`, `needsAttention()`, touchpoint toggle |
| `lib/dateHelpers.ts` | `calculateProgramDay()`, `isMilestoneDay()`, `getNextMilestone()`, date utilities |
| `hooks/use-touchpoint-templates.tsx` | `getTriggerForDay()`, trigger/template loading, personalization |
| `components/milestone-action-modal.tsx` | Modal with templates, meeting invites, talking points, resources |
| `components/client-tracker/client-card.tsx` | Client card UI with day badge, milestone celebration button |
| `components/dashboard/TodaysFocus.tsx` | Dashboard milestone alerts and action items |
| `components/client-journey-guide.tsx` | Visual interactive journey timeline |
| `components/resources/ClientContextualResources.tsx` | Day-specific resource display |
| `lib/resource-helpers.ts` | Resource filtering by program day and context |
| `lib/supabase/touchpoint_templates.sql` | Database schema and seed data for triggers/templates |
