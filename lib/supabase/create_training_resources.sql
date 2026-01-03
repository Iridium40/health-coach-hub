-- Training Resources Schema
-- Simple external URL-based training resources with searchable descriptions

-- Drop existing tables if they exist (for clean migration)
DROP TABLE IF EXISTS training_resources CASCADE;
DROP TABLE IF EXISTS training_categories CASCADE;

-- Training categories
CREATE TABLE training_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT DEFAULT '📚',
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Training resources with description for search
CREATE TABLE training_resources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  url TEXT NOT NULL,
  type TEXT DEFAULT 'document' CHECK (type IN ('document', 'video', 'canva', 'other')),
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Full-text search index for fast searching
CREATE INDEX idx_training_resources_search ON training_resources 
  USING GIN (to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, '')));

-- Regular indexes
CREATE INDEX idx_training_resources_category ON training_resources(category);
CREATE INDEX idx_training_resources_active ON training_resources(is_active);
CREATE INDEX idx_training_resources_title ON training_resources(title);

-- Updated at trigger
CREATE TRIGGER training_resources_updated_at
  BEFORE UPDATE ON training_resources
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Enable RLS
ALTER TABLE training_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_resources ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Everyone can read active resources
CREATE POLICY "Anyone can view active categories" ON training_categories
  FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Anyone can view active resources" ON training_resources
  FOR SELECT USING (is_active = TRUE);

-- Admin policies for management
CREATE POLICY "Admins can manage categories" ON training_categories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.user_role = 'admin'
    )
  );

CREATE POLICY "Admins can manage resources" ON training_resources
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.user_role = 'admin'
    )
  );

-- Search function
CREATE OR REPLACE FUNCTION search_training_resources(search_query TEXT)
RETURNS TABLE (
  id UUID,
  category TEXT,
  title TEXT,
  description TEXT,
  url TEXT,
  type TEXT,
  relevance REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    r.id,
    r.category,
    r.title,
    r.description,
    r.url,
    r.type,
    ts_rank(
      to_tsvector('english', coalesce(r.title, '') || ' ' || coalesce(r.description, '')),
      plainto_tsquery('english', search_query)
    ) as relevance
  FROM training_resources r
  WHERE r.is_active = TRUE
    AND (
      to_tsvector('english', coalesce(r.title, '') || ' ' || coalesce(r.description, '')) 
      @@ plainto_tsquery('english', search_query)
      OR r.title ILIKE '%' || search_query || '%'
      OR r.description ILIKE '%' || search_query || '%'
    )
  ORDER BY relevance DESC, r.sort_order;
END;
$$ LANGUAGE plpgsql;

-- Insert categories
INSERT INTO training_categories (name, icon, sort_order) VALUES
('COACH LAUNCH PLAYBOOK', '🚀', 1),
('LAUNCHING A CLIENT AND COACHING THROUGH MONTH ONE', '🎯', 2),
('CLIENT SUPPORT TEXTS AND VIDEOS', '💬', 3),
('BRANDING YOUR BUSINESS QUICK LINKS', '🎨', 4),
('USING SOCIAL MEDIA TO BUILD YOUR BUSINESS', '📱', 5),
('COACHING 10X', '⚡', 6),
('COACHING A METABOLIC RESET', '🔄', 7),
('MOVING TO ED AND BEYOND', '📈', 8),
('HOW TO USE CONNECT TO GROW YOUR BUSINESS', '🔗', 9),
('GOLD STANDARD TRAININGS', '🏆', 10);

-- Insert all resources
INSERT INTO training_resources (category, title, description, url, type, sort_order) VALUES

-- COACH LAUNCH PLAYBOOK
('COACH LAUNCH PLAYBOOK', 'NEW COACH WELCOME LETTER', 
 'Welcome letter template for new coaches. Covers first steps, what to expect, how to get started, and key resources. Perfect for sharing with newly signed coaches.',
 'https://docs.google.com/document/d/1arNc-lNb1zJ2WJ0VS87Dpfre973u-IboIYxQqNUr7Vs/edit?usp=sharing', 'document', 1),

('COACH LAUNCH PLAYBOOK', 'NEW COACH PRINTABLE CHECKLIST',
 'Printable checklist for new coaches covering all setup tasks: business registration, social media, website, banking, first 30 days activities. Track completion progress.',
 'https://docs.google.com/document/d/118onAvS-zWGDClUpkSOLEcXhRNnuaCir/edit?usp=sharing&ouid=103643178845055801965&rtpof=true&sd=true', 'document', 2),

('COACH LAUNCH PLAYBOOK', 'HOW TO PURCHASE YOUR COACHING KIT',
 'Video walkthrough of ordering your official OPTAVIA coaching kit through the portal. Shows step-by-step navigation and payment options.',
 'https://vimeo.com/548985412', 'video', 3),

('COACH LAUNCH PLAYBOOK', 'HOW TO PREPARE FOR YOUR SOCIAL MEDIA LAUNCH',
 'Guide to preparing your social media profiles before your coaching launch. Covers bio updates, profile photos, content planning, and announcement strategy.',
 'https://docs.google.com/document/d/1MmQrsmqenglJr_SenBcBH_qkc4k6mWe_/edit?usp=sharing&ouid=103643178845055801965&rtpof=true&sd=true', 'document', 4),

('COACH LAUNCH PLAYBOOK', 'HOW TO WORK YOUR LAUNCH POST AND COMMON MISTAKES TO AVOID',
 'Best practices for your launch announcement post. Includes timing, engagement strategies, responding to comments, and common mistakes that hurt reach and conversions.',
 'https://docs.google.com/document/d/11tutR54Y_rDUUWkQupfY8cHN9n_VH-fIQPwnTSnDLnU/edit?usp=sharing', 'document', 5),

('COACH LAUNCH PLAYBOOK', 'HOW TO NAIL THE HEALTH ASSESSMENT',
 'Step-by-step guide for conducting effective health assessment calls. Scripts for opening, asking about goals, weight history, motivation, and closing. Tips for handling objections.',
 'https://docs.google.com/document/d/1A8UIEidVXGrz8jeDsqKbrRVPbbpWc3b0/edit?usp=sharing&ouid=103643178845055801965&rtpof=true&sd=true', 'document', 6),

('COACH LAUNCH PLAYBOOK', 'HOW TO BACK INTO A HEALTH ASSESSMENT',
 'Video training on transitioning casual conversations into health assessments naturally. Techniques for social situations, DMs, and in-person encounters.',
 'https://vimeo.com/671134401', 'video', 7),

('COACH LAUNCH PLAYBOOK', 'EFFECTIVE FOLLOW UP AFTER A HEALTH ASSESSMENT',
 'Templates and timing for follow-up messages after health assessment calls. Includes scripts for yes, maybe, and not-now responses. Nurture sequences.',
 'https://docs.google.com/document/d/1D-DyRUeV5r4jipqnudUxweh3HGFh_hPD/edit?usp=sharing&ouid=103643178845055801965&rtpof=true&sd=true', 'document', 8),

('COACH LAUNCH PLAYBOOK', 'COMMON OBJECTIONS AND HOW TO ADDRESS THEM',
 'Comprehensive guide to handling common objections: cost concerns, time constraints, tried-before failures, spouse approval, and skepticism. Scripts and mindset tips.',
 'https://docs.google.com/document/d/1TQPw-pKAllqEz7MZXa3XEsxjN5Jo1T5b/edit?usp=sharing&ouid=103643178845055801965&rtpof=true&sd=true', 'document', 9),

('COACH LAUNCH PLAYBOOK', 'WEEK ONE POSTING GUIDE',
 'Day-by-day content calendar for your first week as a coach. Post ideas, engagement strategies, story templates, and hashtag recommendations.',
 'https://docs.google.com/document/d/1DIV9pEZlmqzA8ZIAnCPExQ_KhOedjA38OauiOqtqL5c/edit?usp=sharing', 'document', 10),

('COACH LAUNCH PLAYBOOK', 'FAST TRACK TO SENIOR COACH',
 'Visual roadmap to reaching Senior Coach rank quickly. Key activities, milestones, and strategies for accelerating your promotion timeline.',
 'https://www.canva.com/design/DAGRyr_F44Y/3_36EEwhi6JmMZfl1ZKAvw/edit?utm_content=DAGRyr_F44Y&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton', 'canva', 11),

('COACH LAUNCH PLAYBOOK', '30 DAY NEW COACH SELF-EVALUATION',
 'Self-assessment questionnaire for new coaches at 30 days. Evaluate your progress, identify gaps, and create action plans for month two.',
 'https://docs.google.com/document/d/1nOC6erBMIws-SZzQ40TCz5DEvBQpmVLMUCI5V7E_8Ys/edit?usp=sharing', 'document', 12),

-- LAUNCHING A CLIENT AND COACHING THROUGH MONTH ONE
('LAUNCHING A CLIENT AND COACHING THROUGH MONTH ONE', 'NEW CLIENT CHECKLIST',
 'Complete checklist for onboarding new clients. Covers welcome call, ordering fuelings, setting expectations, scheduling check-ins, and first week support.',
 'https://docs.google.com/document/d/1c8WqcDJPVmSm6h9Ss2x3V02L0apIemDp/edit?usp=sharing&ouid=103643178845055801965&rtpof=true&sd=true', 'document', 1),

('LAUNCHING A CLIENT AND COACHING THROUGH MONTH ONE', 'WELCOME AND 9 TIPS TEXT',
 'Copy-paste welcome message for new clients with 9 essential tips for success. Covers hydration, meal timing, fueling schedule, and mindset.',
 'https://docs.google.com/document/d/1x9k469K6XvuQ8rcPdgR3z4i9iXKLxBvSIR_77UuDgpM/edit?usp=sharing', 'document', 2),

('LAUNCHING A CLIENT AND COACHING THROUGH MONTH ONE', '5 SUCCESS TIPS',
 'Five key success tips to share with clients starting their journey. Focus on habits, hydration, planning, support, and consistency.',
 'https://docs.google.com/document/d/1nss0Lsj1L6jr0X8AEZHZ4cdLOt9vW_SZXokHHLy-r9M/edit?usp=sharing', 'document', 3),

('LAUNCHING A CLIENT AND COACHING THROUGH MONTH ONE', 'DAILY METABOLIC HEALTH TEXT MESSAGES DAYS 1-10',
 'Pre-written daily text messages for days 1-10 of a client journey. Covers critical first week support, encouragement, and troubleshooting common issues.',
 'https://docs.google.com/document/d/1gtH2fYDKLA6f3sv6-yxFUM8b6rLBqp8jF5R7h4ec6i4/edit?usp=sharing', 'document', 4),

('LAUNCHING A CLIENT AND COACHING THROUGH MONTH ONE', 'OPTIONAL METABOLIC HEALTH TEXT MESSAGES DAYS 10-31',
 'Extended daily text templates for days 10-31. Milestone celebrations, habit reinforcement, and motivation for the full first month.',
 'https://docs.google.com/document/d/1G9YtI07xIvazS4KZcCkLlB4N_E1axueXVeV4R0Na4Yc/edit?usp=sharing', 'document', 5),

('LAUNCHING A CLIENT AND COACHING THROUGH MONTH ONE', 'SYSTEMS CHECK QUESTIONS',
 'Diagnostic questions to ask clients who are struggling. Covers water intake, fueling timing, sleep, stress, lean and green compliance, and hidden carbs.',
 'https://docs.google.com/document/d/1xZJ_afiL_W4YcinCkM6NbNWrH2GqZmRnS1XrB_BRLIM/edit?usp=sharing', 'document', 6),

('LAUNCHING A CLIENT AND COACHING THROUGH MONTH ONE', 'DETAILED SYSTEMS CHECK VIDEO FOR CLIENTS WHO ARE NOT LOSING WELL',
 'In-depth guide for troubleshooting clients not seeing results. Covers plateau breaking, compliance auditing, and metabolic factors.',
 'https://docs.google.com/document/d/1HLqL_l7IELKgjlx5d3SBuXi2xdyBSaawJ5JmcKDoGHM/edit?usp=sharing', 'document', 7),

('LAUNCHING A CLIENT AND COACHING THROUGH MONTH ONE', 'VIP CALL HOW TO',
 'Guide to conducting VIP calls with clients. Structure, talking points, celebration strategies, and how to identify coaching opportunities.',
 'https://docs.google.com/document/d/1vtYewe5sbVziNTzz3Fk3l3DhRt1x0xTps_hxtYEQk7Q/edit?usp=sharing', 'document', 8),

('LAUNCHING A CLIENT AND COACHING THROUGH MONTH ONE', 'THE MINDSET BEHIND EFFECTIVE SPONSORSHIP',
 'Video on the psychology of sponsorship and team building. How to identify potential coaches, plant seeds, and have the business conversation.',
 'https://vimeo.com/665762974', 'video', 9),

-- CLIENT SUPPORT TEXTS AND VIDEOS
('CLIENT SUPPORT TEXTS AND VIDEOS', 'SCHEDULE FOR NEW CLIENT COMMUNICATION',
 'Recommended communication schedule for new clients. Daily, weekly, and milestone touchpoints. AM/PM check-in timing and content guidance.',
 'https://docs.google.com/document/d/1iYiwp4tMmlmqFDj8JoG8PNiFbF4ed6yRnMJnRMmzW1g/edit?usp=sharing', 'document', 1),

('CLIENT SUPPORT TEXTS AND VIDEOS', 'NEW CLIENT VIDEOS',
 'Collection of videos to share with new clients. Covers program overview, fueling preparation, lean and green basics, and motivation.',
 'https://docs.google.com/document/d/1yfVgcKDiXCP6Og1hopzSBGvI8l0MlQpoGt0hnxjXf_U/edit?usp=sharing', 'document', 2),

('CLIENT SUPPORT TEXTS AND VIDEOS', 'WELCOME AND 9 TIPS',
 'Welcome message with 9 essential tips for client success. Ready to copy and personalize for each new client.',
 'https://docs.google.com/document/d/1x9k469K6XvuQ8rcPdgR3z4i9iXKLxBvSIR_77UuDgpM/edit?usp=sharing', 'document', 3),

('CLIENT SUPPORT TEXTS AND VIDEOS', 'METABOLIC HEALTH TEXTS DAYS 1-9',
 'Daily text templates for the critical first 9 days. Encouragement, tips, and check-in prompts for each day of the initial phase.',
 'https://docs.google.com/document/d/1gtH2fYDKLA6f3sv6-yxFUM8b6rLBqp8jF5R7h4ec6i4/edit?usp=sharing', 'document', 4),

('CLIENT SUPPORT TEXTS AND VIDEOS', 'EXPANDED METABOLIC HEALTH TEXTS DAYS 10-30',
 'Continued daily texts for days 10-30. Habit building, milestone celebrations, and maintaining momentum through the first month.',
 'https://docs.google.com/document/d/1G9YtI07xIvazS4KZcCkLlB4N_E1axueXVeV4R0Na4Yc/edit?usp=sharing', 'document', 5),

('CLIENT SUPPORT TEXTS AND VIDEOS', 'DIGITAL GUIDES',
 'Links to digital resources and guides for clients. Quick reference materials, apps, and tools to support their journey.',
 'https://docs.google.com/document/d/1TtZoQcKzTT77PZP0XNlMH-e8HiYzwKhS1UL8ZW5BcT8/edit?usp=sharing', 'document', 6),

('CLIENT SUPPORT TEXTS AND VIDEOS', 'EAT THIS EVERY DAY',
 'Daily nutrition guide for clients. What to eat, portion sizes, lean and green options, and meal planning tips.',
 'https://docs.google.com/document/d/1_4kgw8X0_bHp6mbGW5Xtwdg0_W7hVYBWwNgHNSM3xLk/edit?usp=sharing', 'document', 7),

('CLIENT SUPPORT TEXTS AND VIDEOS', 'HOW TO UPDATE YOUR PREMIER ORDER',
 'Step-by-step instructions for clients to modify their premier (auto-ship) orders. Screenshots and navigation guide for the OPTAVIA portal.',
 'https://docs.google.com/document/d/1D-ueL9kljNxEdqHFrvp9u-aze-z3-2glZaYN-936fCc/edit?usp=sharing', 'document', 8),

-- BRANDING YOUR BUSINESS QUICK LINKS
('BRANDING YOUR BUSINESS QUICK LINKS', 'HOW TO ADD A DISCLAIMER TO YOUR PICTURES',
 'Video tutorial on adding required wellness disclaimers to transformation photos. Compliance requirements and easy methods using phone apps.',
 'https://www.youtube.com/watch?v=Z4ABPUk5JHs', 'video', 1),

('BRANDING YOUR BUSINESS QUICK LINKS', 'HOW TO ADD A WELLNESS CREDIT',
 'Tutorial on properly crediting OPTAVIA and wellness disclaimers in posts and images. Legal compliance and best practices.',
 'https://vimeo.com/473831198', 'video', 2),

('BRANDING YOUR BUSINESS QUICK LINKS', 'BRANDING AND SETTING UP YOUR BUSINESS',
 'Comprehensive guide to establishing your coaching brand. Logo considerations, color schemes, social media consistency, and professional presence.',
 'https://docs.google.com/document/d/10aK_KwiHBXsVuUzRS2DjFmly0QH_VJ44ohSIMuxEJ3A/edit?usp=sharing', 'document', 3),

('BRANDING YOUR BUSINESS QUICK LINKS', 'SETTING UP YOUR COACHING WEBSITE',
 'Video walkthrough of setting up your OPTAVIA coaching website. Domain, customization, bio, photos, and linking to your ordering page.',
 'https://youtu.be/xtSR2nJJfAg?si=dHRxhzOE_b1wcIF5', 'video', 4),

('BRANDING YOUR BUSINESS QUICK LINKS', 'SETTING UP YOUR OPTAVIA PAY',
 'Instructions for setting up OPTAVIA Pay to receive commission payments. Banking information, tax considerations, and payment schedule.',
 'https://docs.google.com/document/d/1LuGK2ZNo8lFI51vesDKKHdUDCpgKhvtztv3-KS06KvE/edit?usp=sharing', 'document', 5),

('BRANDING YOUR BUSINESS QUICK LINKS', 'OPTAVIA VOCABULARY',
 'Glossary of OPTAVIA terms and acronyms. FQV, QP, FIBC, ranks, fuelings, lean and green, and business terminology explained.',
 'https://docs.google.com/document/d/1jLPNcT5cROxHm8y_XWpCC4AQjnMo9bjwZs-Kz5UVXTY/edit?usp=sharing', 'document', 6),

-- USING SOCIAL MEDIA TO BUILD YOUR BUSINESS
('USING SOCIAL MEDIA TO BUILD YOUR BUSINESS', 'HOW TO CREATE A SIMPLE REEL',
 'Step-by-step video on creating engaging Instagram/Facebook Reels. Easy techniques, trending formats, and content ideas for coaches.',
 'https://vimeo.com/1147526154', 'video', 1),

('USING SOCIAL MEDIA TO BUILD YOUR BUSINESS', 'HOW TO HAVE EFFECTIVE CONVERSATIONS',
 'Visual guide to converting social media engagement into health assessment conversations. DM templates, conversation flows, and timing strategies.',
 'https://www.canva.com/design/DAGwKmV4-qY/jcb8D4BueFoAYZsc8uERiQ/view?utm_content=DAGwKmV4-qY&utm_campaign=designshare&utm_medium=link&utm_source=viewer', 'canva', 2),

-- COACHING 10X
('COACHING 10X', '10X KICKOFF CALL WITH KRISTEN GLASS',
 'Recording of 10X system kickoff call. Overview of the 10X methodology for rapid business growth, daily activities, and accountability structure.',
 'https://vimeo.com/manage/videos/1115495757/3e666d9fcd', 'video', 1),

-- COACHING A METABOLIC RESET
('COACHING A METABOLIC RESET', 'METABOLIC TALKING POINTS FOR COACHES',
 'Key talking points for explaining metabolic health and reset programs to clients. Science-based explanations in simple terms. Benefits and expectations.',
 'https://docs.google.com/document/d/1GzyY4Je8wWtYxoY7DsuVlPTgCJWdEUzK8jp4UmS6MnQ/edit?usp=sharing', 'document', 1),

('COACHING A METABOLIC RESET', '10 QUESTIONS THAT WILL HELP YOU GAUGE YOUR METABOLIC HEALTH',
 'Video covering 10 diagnostic questions to assess metabolic health. Use with prospects during health assessments or with struggling clients.',
 'https://vimeo.com/1135751990/8205c4652d?fl=tl&fe=ec', 'video', 2),

-- MOVING TO ED AND BEYOND
('MOVING TO ED AND BEYOND', 'TEACHING YOUR CHAT GPT TO KNOW YOU',
 'Guide to training AI assistants like ChatGPT to help with your coaching business. Prompts, use cases, and efficiency tips for coaches.',
 'https://cdn.fbsbx.com/v/t59.2708-21/600933254_1848441836031561_1534090109953931690_n.pdf/PDF.pdf?_nc_cat=108&ccb=1-7&_nc_sid=2b0e22&_nc_ohc=pwe4VZspIpEQ7kNvwGV9R2-&_nc_oc=AdlX-wH52TdslJupV3jbn-wI8tvNc0Pnn9u5fwUtUcVGx5D9IWQNYKgujqwE7-bbYW29P6w7PzdCgymKzbYYxeJr&_nc_zt=7&_nc_ht=cdn.fbsbx.com&_nc_gid=MuExEBy5Lkhwb-W2_9Mx3Q&oh=03_Q7cD4AGKFuHDjq_XAG-rezLvQKghcg11VyMyou3qrtoeJOFSWA&oe=6940AD9F&dl=1', 'document', 1),

('MOVING TO ED AND BEYOND', 'ED DAILY TRACKER',
 'Daily activity tracker for Executive Directors. Track client contacts, health assessments, team support, and business building activities.',
 'https://docs.google.com/document/d/1kCzIHm7DV1WPSTsbTh-NZr4qXj278iZ52vOPs08PfbE/edit', 'document', 2),

('MOVING TO ED AND BEYOND', 'FIBC DAILY TRACKER',
 'Daily activity tracker for FIBC-level coaches. Enhanced tracking for team building, leadership activities, and rank advancement metrics.',
 'https://docs.google.com/document/d/1WSH2shc6mhmoJubPEdNOwyRC2VPotHOnzvYEBSDx-bk/edit', 'document', 3),

('MOVING TO ED AND BEYOND', 'GROW TO FIBC BUBBLE TRACKER',
 'Visual bubble tracker for tracking progress toward FIBC status. Monitor qualifying points, team growth, and milestone completion.',
 'https://docs.google.com/document/d/1xwxMPmRRdBLHsyNLz1rkgMRDK6f8-_gr/edit', 'document', 4),

('MOVING TO ED AND BEYOND', 'GLOBAL/PRESIDENTIAL DAILY TRACKER',
 'Advanced daily tracker for Global and Presidential Directors. Team analytics, leadership activities, and organizational growth metrics.',
 'https://docs.google.com/document/d/1j9fcAHJ769BRyqaOhZ60HFzb7VhoB0gc3KL5pjyT1PQ/edit', 'document', 5),

('MOVING TO ED AND BEYOND', 'IPD BUBBLE TRACKER',
 'Bubble tracker for Integrated Presidential Directors. Track complex team structures, volume metrics, and leadership development.',
 'https://docs.google.com/document/d/1JRnQ_uavSfOVj3Mvwf7T2lCASmj8jnEb/edit', 'document', 6),

-- HOW TO USE CONNECT TO GROW YOUR BUSINESS
('HOW TO USE CONNECT TO GROW YOUR BUSINESS', 'BASIC HOW TO CHECK YOUR CURRENT AND PROJECTED FQV',
 'Loom video showing how to check your Field Qualifying Volume in OPTAVIA Connect. Navigate reports, understand numbers, and track progress.',
 'https://www.loom.com/share/799a4ae74a7645aabab8f3d67a4215cf', 'video', 1),

('HOW TO USE CONNECT TO GROW YOUR BUSINESS', 'HOW TO RUN PROJECTED NUMBERS FOR YOURSELF AND A TEAM',
 'Advanced Loom tutorial on projecting volume numbers for yourself and your team. Planning tool for rank advancement and bonus qualification.',
 'https://www.loom.com/share/9da0ac3751e84db09ee375c9c039c527', 'video', 2),

('HOW TO USE CONNECT TO GROW YOUR BUSINESS', 'HOW TO END THE MONTH STRATEGICALLY',
 'Video on strategic month-end planning. Maximizing volume, timing orders, supporting team members, and hitting rank qualifications.',
 'https://vimeo.com/1105267713/6d51506452?fl=tl&fe=ec', 'video', 3),

-- GOLD STANDARD TRAININGS
('GOLD STANDARD TRAININGS', '10X KICKOFF CALL',
 'Core 10X training call recording. Foundation of the 10X system for rapid business growth. Required watching for all team members.',
 'https://vimeo.com/1114863189?fl=tl&fe=ec', 'video', 1);
