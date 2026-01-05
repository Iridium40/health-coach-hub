-- ============================================
-- SCHEMA: Touchpoint Templates
-- Admin-managed templates for client milestone messaging
-- ============================================

-- Touchpoint Triggers (the milestone/phase definitions)
CREATE TABLE IF NOT EXISTS touchpoint_triggers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  trigger_key TEXT NOT NULL UNIQUE, -- e.g., 'critical_phase', 'week_1', 'one_month'
  trigger_label TEXT NOT NULL, -- e.g., 'Critical Phase (Days 1-3)'
  phase TEXT NOT NULL, -- 'critical', 'week1', 'milestone', 'attention', etc.
  action_type TEXT NOT NULL CHECK (action_type IN ('text', 'call')),
  emoji TEXT DEFAULT '📱',
  day_start INTEGER, -- Starting day for this trigger (null for attention-based)
  day_end INTEGER, -- Ending day for this trigger (null for single day milestones)
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Touchpoint Templates (the actual messages)
CREATE TABLE IF NOT EXISTS touchpoint_templates (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  trigger_id UUID NOT NULL REFERENCES touchpoint_triggers(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_default BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Meeting Invite Templates (for 'call' action type triggers)
CREATE TABLE IF NOT EXISTS touchpoint_meeting_invites (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  trigger_id UUID NOT NULL UNIQUE REFERENCES touchpoint_triggers(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Talking Points (for 'call' action type triggers)
CREATE TABLE IF NOT EXISTS touchpoint_talking_points (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  trigger_id UUID NOT NULL REFERENCES touchpoint_triggers(id) ON DELETE CASCADE,
  point TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_touchpoint_templates_trigger ON touchpoint_templates(trigger_id);
CREATE INDEX IF NOT EXISTS idx_touchpoint_talking_points_trigger ON touchpoint_talking_points(trigger_id);
CREATE INDEX IF NOT EXISTS idx_touchpoint_triggers_sort ON touchpoint_triggers(sort_order);

-- Enable RLS
ALTER TABLE touchpoint_triggers ENABLE ROW LEVEL SECURITY;
ALTER TABLE touchpoint_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE touchpoint_meeting_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE touchpoint_talking_points ENABLE ROW LEVEL SECURITY;

-- RLS Policies - All users can read, only admins can write
CREATE POLICY "Anyone can view touchpoint triggers"
  ON touchpoint_triggers FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage touchpoint triggers"
  ON touchpoint_triggers FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.user_role = 'admin'
    )
  );

CREATE POLICY "Anyone can view touchpoint templates"
  ON touchpoint_templates FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage touchpoint templates"
  ON touchpoint_templates FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.user_role = 'admin'
    )
  );

CREATE POLICY "Anyone can view meeting invites"
  ON touchpoint_meeting_invites FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage meeting invites"
  ON touchpoint_meeting_invites FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.user_role = 'admin'
    )
  );

CREATE POLICY "Anyone can view talking points"
  ON touchpoint_talking_points FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage talking points"
  ON touchpoint_talking_points FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.user_role = 'admin'
    )
  );

-- Triggers for updated_at
CREATE TRIGGER update_touchpoint_triggers_updated_at
  BEFORE UPDATE ON touchpoint_triggers
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER update_touchpoint_templates_updated_at
  BEFORE UPDATE ON touchpoint_templates
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER update_touchpoint_meeting_invites_updated_at
  BEFORE UPDATE ON touchpoint_meeting_invites
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

-- ============================================
-- SEED DATA: Default Touchpoint Triggers & Templates
-- ============================================

-- Insert default triggers
INSERT INTO touchpoint_triggers (trigger_key, trigger_label, phase, action_type, emoji, day_start, day_end, sort_order) VALUES
  ('critical_phase', 'Critical Phase (Days 1-3)', 'critical', 'text', '🔴', 1, 3, 1),
  ('week_1', 'Week 1 (Days 4-6)', 'week1', 'text', '🟠', 4, 6, 2),
  ('week_1_complete', 'Week 1 Complete! 🎉 (Day 7)', 'milestone', 'call', '🎉', 7, 7, 3),
  ('week_2', 'Week 2 (Days 8-13)', 'week2', 'text', '🔵', 8, 13, 4),
  ('two_weeks', '2 Weeks! ⭐ (Day 14)', 'milestone', 'call', '⭐', 14, 14, 5),
  ('week_3', 'Week 3 (Days 15-20)', 'week3', 'text', '🟣', 15, 20, 6),
  ('twenty_one_days', '21 Days - Habit Formed! 💎 (Day 21)', 'milestone', 'call', '💎', 21, 21, 7),
  ('week_4', 'Week 4 (Days 22-29)', 'week4', 'text', '🩵', 22, 29, 8),
  ('one_month', 'ONE MONTH! 👑 (Day 30)', 'milestone', 'call', '👑', 30, 30, 9),
  ('ongoing', 'Ongoing (Day 31+)', 'ongoing', 'text', '🟢', 31, NULL, 10),
  ('scheduled_due', 'Scheduled Check-in Due', 'attention', 'text', '📅', NULL, NULL, 11),
  ('no_contact_10', '10+ Days No Contact', 'attention', 'text', '⚠️', NULL, NULL, 12),
  ('never_checked_in', 'Never Checked In (New Client)', 'attention', 'text', '🆕', NULL, NULL, 13)
ON CONFLICT (trigger_key) DO NOTHING;

-- Insert default templates for each trigger
-- Critical Phase
INSERT INTO touchpoint_templates (trigger_id, title, message, is_default, sort_order)
SELECT id, 'Day 1 Welcome', 'Hey {firstName}! 🎉 Day 1 is HERE! I''m so proud of you for starting this journey. Remember: today might feel tough, but you''re building something amazing. Text me anytime — I''ve got your back! 💪', true, 1
FROM touchpoint_triggers WHERE trigger_key = 'critical_phase';

INSERT INTO touchpoint_templates (trigger_id, title, message, is_default, sort_order)
SELECT id, 'Day 2 Check-in', 'Good morning {firstName}! Day 2 — you''re doing it! How are you feeling? Any questions about your Fuelings or your Lean & Green? I''m here for you! 🌟', false, 2
FROM touchpoint_triggers WHERE trigger_key = 'critical_phase';

INSERT INTO touchpoint_templates (trigger_id, title, message, is_default, sort_order)
SELECT id, 'Day 3 Encouragement', 'Hey {firstName}! Day 3 — you''re almost through the hardest part! Your body is adjusting and it WILL get easier. You''re stronger than you know. Keep going! 💎', false, 3
FROM touchpoint_triggers WHERE trigger_key = 'critical_phase';

-- Week 1
INSERT INTO touchpoint_templates (trigger_id, title, message, is_default, sort_order)
SELECT id, 'Momentum Builder', 'Hey {firstName}! You''re {days} days in and building momentum! How''s your energy feeling? Remember to drink your water and get those Fuelings in. You''ve got this! 🔥', true, 1
FROM touchpoint_triggers WHERE trigger_key = 'week_1';

-- Week 1 Complete (Milestone)
INSERT INTO touchpoint_templates (trigger_id, title, message, is_default, sort_order)
SELECT id, 'Week 1 Celebration Text', '🎉 {firstName}!!! ONE WEEK!! You did it! I am SO proud of you! This is a huge accomplishment and I want to celebrate with you. Can we hop on a quick call this week? I''d love to hear how you''re feeling! 🌟', true, 1
FROM touchpoint_triggers WHERE trigger_key = 'week_1_complete';

INSERT INTO touchpoint_meeting_invites (trigger_id, subject, body)
SELECT id, '🎉 Celebrating Your First Week, {firstName}!', 'Hi {firstName}!

Congratulations on completing your FIRST WEEK! This is such a big deal and I want to celebrate this milestone with you.

Let''s connect for a quick 15-minute call to:
• Celebrate your win! 🎉
• Chat about how the week went
• Answer any questions
• Set you up for an amazing Week 2

So proud of you!

{coachName}'
FROM touchpoint_triggers WHERE trigger_key = 'week_1_complete';

INSERT INTO touchpoint_talking_points (trigger_id, point, sort_order)
SELECT id, point, row_number FROM touchpoint_triggers, 
  unnest(ARRAY[
    'Celebrate! Make them feel proud of completing the hardest week',
    'Ask: What was harder/easier than expected?',
    'Ask: How are you feeling physically? Mentally?',
    'Address any struggles or questions',
    'Preview Week 2 — it gets easier from here!',
    'Set expectation for Day 14 milestone'
  ]) WITH ORDINALITY AS t(point, row_number)
WHERE trigger_key = 'week_1_complete';

-- Week 2
INSERT INTO touchpoint_templates (trigger_id, title, message, is_default, sort_order)
SELECT id, 'Building Routine', 'Hey {firstName}! Week 2 is all about building your routine. Day {days} and counting! How''s it going? Notice any changes yet? 💙', true, 1
FROM touchpoint_triggers WHERE trigger_key = 'week_2';

-- 2 Weeks (Milestone)
INSERT INTO touchpoint_templates (trigger_id, title, message, is_default, sort_order)
SELECT id, '2 Week Celebration', '⭐ {firstName}!! TWO WEEKS!! You''re officially in a groove now! I would love to hop on a call and hear all about your journey so far. When works for you this week? So proud! 🙌', true, 1
FROM touchpoint_triggers WHERE trigger_key = 'two_weeks';

INSERT INTO touchpoint_meeting_invites (trigger_id, subject, body)
SELECT id, '⭐ 2 Weeks Strong, {firstName}!', 'Hi {firstName}!

2 WEEKS! You are officially building real habits and I couldn''t be more excited for you!

Let''s connect for a quick call to:
• Celebrate this milestone! ⭐
• Review what''s working
• Talk about any adjustments
• Look ahead to the BIG 21-day milestone!

You''re doing amazing!

{coachName}'
FROM touchpoint_triggers WHERE trigger_key = 'two_weeks';

INSERT INTO touchpoint_talking_points (trigger_id, point, sort_order)
SELECT id, point, row_number FROM touchpoint_triggers, 
  unnest(ARRAY[
    'Celebrate the 2-week mark!',
    'Ask: What''s your favorite Fueling so far?',
    'Ask: What Lean & Green recipes are you loving?',
    'Discuss any NSVs (non-scale victories)',
    'Build excitement for Day 21 — habit formation!',
    'Reinforce: They''re in the groove now'
  ]) WITH ORDINALITY AS t(point, row_number)
WHERE trigger_key = 'two_weeks';

-- Week 3
INSERT INTO touchpoint_templates (trigger_id, title, message, is_default, sort_order)
SELECT id, 'Almost to 21 Days', 'Hey {firstName}! Day {days} — you''re SO close to 21 days! That''s when they say a habit is formed. You''re literally rewiring your brain right now! 🧠💜', true, 1
FROM touchpoint_triggers WHERE trigger_key = 'week_3';

-- 21 Days (Milestone)
INSERT INTO touchpoint_templates (trigger_id, title, message, is_default, sort_order)
SELECT id, '21 Day Celebration', '💎💎💎 {firstName}!!! 21 DAYS!!! This is HUGE!! Science says it takes 21 days to form a habit — and YOU DID IT! I want to celebrate this with you! Can we schedule a call? This deserves recognition! 🏆', true, 1
FROM touchpoint_triggers WHERE trigger_key = 'twenty_one_days';

INSERT INTO touchpoint_meeting_invites (trigger_id, subject, body)
SELECT id, '💎 21 Days — You''ve Built a New Habit, {firstName}!', 'Hi {firstName}!

21 DAYS! This is one of the most important milestones in your journey!

Science shows it takes 21 days to form a new habit — and you''ve done exactly that. Your brain is literally rewired now!

Let''s celebrate with a call to:
• Honor this incredible achievement! 💎
• Reflect on how far you''ve come
• Discuss your transformation
• Look ahead to ONE MONTH!

I am so incredibly proud of you!

{coachName}'
FROM touchpoint_triggers WHERE trigger_key = 'twenty_one_days';

INSERT INTO touchpoint_talking_points (trigger_id, point, sort_order)
SELECT id, point, row_number FROM touchpoint_triggers, 
  unnest(ARRAY[
    'BIG celebration energy! This is a major milestone',
    'Explain the science: 21 days = habit formed',
    'Ask: How do you feel compared to Day 1?',
    'Document NSVs — have them list everything',
    'Discuss mindset shifts they''ve experienced',
    'Consider: 3-way call with upline to celebrate?',
    'Build excitement for Day 30 — ONE MONTH!'
  ]) WITH ORDINALITY AS t(point, row_number)
WHERE trigger_key = 'twenty_one_days';

-- Week 4
INSERT INTO touchpoint_templates (trigger_id, title, message, is_default, sort_order)
SELECT id, 'Month is Coming', 'Hey {firstName}! Day {days} — ONE MONTH is right around the corner! You''ve built the habit, now you''re strengthening it every single day. So proud of you! 🩵', true, 1
FROM touchpoint_triggers WHERE trigger_key = 'week_4';

-- One Month (Milestone)
INSERT INTO touchpoint_templates (trigger_id, title, message, is_default, sort_order)
SELECT id, 'One Month Celebration', '👑👑👑 {firstName}!!! ONE. MONTH. I literally have chills! You committed to yourself and you showed up EVERY. SINGLE. DAY. This is incredible! We HAVE to celebrate — when can we talk?! 🎊', true, 1
FROM touchpoint_triggers WHERE trigger_key = 'one_month';

INSERT INTO touchpoint_meeting_invites (trigger_id, subject, body)
SELECT id, '👑 ONE MONTH, {firstName}! Let''s Celebrate!', 'Hi {firstName}!

ONE MONTH! I am beyond proud of you!

30 days ago you made a decision to change your life — and you''ve shown up every single day since. That takes courage, commitment, and strength.

Let''s get on a call to:
• CELEBRATE this huge milestone! 👑
• Review your transformation
• Talk about what''s next
• Discuss your goals going forward

You are amazing and I''m honored to be on this journey with you!

{coachName}'
FROM touchpoint_triggers WHERE trigger_key = 'one_month';

INSERT INTO touchpoint_talking_points (trigger_id, point, sort_order)
SELECT id, point, row_number FROM touchpoint_triggers, 
  unnest(ARRAY[
    'MAJOR celebration! This is the biggest milestone yet',
    'Compare Day 1 to Day 30 — physical, mental, emotional',
    'Document all NSVs and wins',
    'Take/compare progress photos if comfortable',
    'Discuss: Has anyone noticed their changes?',
    'Explore: Have they thought about coaching others?',
    'Consider: 3-way call with upline for recognition',
    'Set goals for Month 2 and beyond'
  ]) WITH ORDINALITY AS t(point, row_number)
WHERE trigger_key = 'one_month';

-- Ongoing
INSERT INTO touchpoint_templates (trigger_id, title, message, is_default, sort_order)
SELECT id, 'General Check-in', 'Hey {firstName}! Day {days} and going strong! 💚 Just checking in — how are you feeling? Anything you need from me?', true, 1
FROM touchpoint_triggers WHERE trigger_key = 'ongoing';

INSERT INTO touchpoint_templates (trigger_id, title, message, is_default, sort_order)
SELECT id, 'Quarterly Milestone (90 days)', '🏆 {firstName}!! 90 DAYS!! That''s 3 MONTHS of showing up for yourself! This is a lifestyle now. I''m so proud of the person you''ve become on this journey! 🙌', false, 2
FROM touchpoint_triggers WHERE trigger_key = 'ongoing';

-- Scheduled Due
INSERT INTO touchpoint_templates (trigger_id, title, message, is_default, sort_order)
SELECT id, 'Scheduled Follow-up', 'Hey {firstName}! Just wanted to check in like we planned. How''s everything going? 💙', true, 1
FROM touchpoint_triggers WHERE trigger_key = 'scheduled_due';

-- 10+ Days No Contact
INSERT INTO touchpoint_templates (trigger_id, title, message, is_default, sort_order)
SELECT id, 'Gentle Re-engagement', 'Hey {firstName}! I''ve been thinking about you and wanted to check in. How are you doing? I''m here whenever you need me — no judgment, just support. 💛', true, 1
FROM touchpoint_triggers WHERE trigger_key = 'no_contact_10';

-- Never Checked In
INSERT INTO touchpoint_templates (trigger_id, title, message, is_default, sort_order)
SELECT id, 'First Outreach', 'Hey {firstName}! 🎉 Welcome to the OPTAVIA family! I''m {coachName}, your coach, and I''m SO excited to be on this journey with you! How are you feeling about getting started? Any questions I can answer?', true, 1
FROM touchpoint_triggers WHERE trigger_key = 'never_checked_in';
