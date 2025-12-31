-- ============================================
-- SCHEMA: Modules and Resources
-- ============================================

-- Modules table
CREATE TABLE IF NOT EXISTS modules (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Getting Started', 'Client Support', 'Business Building', 'Training')),
  sort_order INTEGER NOT NULL DEFAULT 0,
  for_new_coach BOOLEAN NOT NULL DEFAULT false,
  icon TEXT NOT NULL DEFAULT '📚',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Module resources table (one-to-many)
CREATE TABLE IF NOT EXISTS module_resources (
  id TEXT PRIMARY KEY,
  module_id TEXT NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  resource_type TEXT NOT NULL CHECK (resource_type IN ('doc', 'video')),
  url TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_module_resources_module_id ON module_resources(module_id);

-- ============================================
-- SCHEMA: Recipes
-- ============================================

CREATE TABLE IF NOT EXISTS recipes (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  image TEXT,
  category TEXT NOT NULL CHECK (category IN ('Chicken', 'Seafood', 'Beef', 'Turkey', 'Pork', 'Vegetarian', 'Breakfast')),
  prep_time INTEGER NOT NULL DEFAULT 0,
  cook_time INTEGER NOT NULL DEFAULT 0,
  servings INTEGER NOT NULL DEFAULT 1,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('Easy', 'Medium', 'Hard')) DEFAULT 'Easy',
  lean_count INTEGER NOT NULL DEFAULT 0,
  green_count INTEGER NOT NULL DEFAULT 0,
  fat_count INTEGER NOT NULL DEFAULT 0,
  condiment_count INTEGER NOT NULL DEFAULT 0,
  ingredients TEXT[] NOT NULL DEFAULT '{}',
  instructions TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for category filtering
CREATE INDEX IF NOT EXISTS idx_recipes_category ON recipes(category);

-- ============================================
-- Enable RLS
-- ============================================

ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE module_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;

-- Public read access for all authenticated users
CREATE POLICY "Authenticated users can read modules"
  ON modules FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can read module_resources"
  ON module_resources FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can read recipes"
  ON recipes FOR SELECT
  TO authenticated
  USING (true);

-- Admin write access
CREATE POLICY "Admins can manage modules"
  ON modules FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.user_role = 'Admin'
    )
  );

CREATE POLICY "Admins can manage module_resources"
  ON module_resources FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.user_role = 'Admin'
    )
  );

CREATE POLICY "Admins can manage recipes"
  ON recipes FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.user_role = 'Admin'
    )
  );

-- ============================================
-- DATA: Modules
-- ============================================

INSERT INTO modules (id, title, description, category, sort_order, for_new_coach, icon) VALUES
('coach-launch', 'Coach Launch Playbook', 'Essential resources to kickstart your coaching journey and build a strong foundation.', 'Getting Started', 1, true, '🚀'),
('client-month-one', 'Launching a Client & Month One', 'Step-by-step guidance for supporting clients through their critical first month.', 'Client Support', 2, true, '🎯'),
('client-support', 'Client Support Texts & Videos', 'Ready-to-use communication templates and video resources for effective client support.', 'Client Support', 3, true, '💬'),
('branding', 'Branding Your Business', 'Tools and strategies to create a compelling personal brand that attracts clients.', 'Business Building', 4, true, '✨'),
('social-media', 'Social Media Strategy', 'Proven social media tactics to grow your audience and generate leads.', 'Business Building', 5, false, '📱'),
('coaching-10x', 'Coaching 10X', 'Advanced coaching strategies to scale your business and achieve exponential growth.', 'Business Building', 6, false, '⚡'),
('metabolic-reset', 'Coaching a Metabolic Reset', 'Comprehensive resources for coaching clients through metabolic health transformation.', 'Client Support', 7, false, '🔄'),
('moving-to-ed', 'Moving to ED and Beyond', 'Resources for advancing your coaching practice and expanding your business reach.', 'Business Building', 8, false, '📈'),
('connect-business', 'How to Use Connect to Grow Your Business', 'Learn how to leverage OPTAVIA Connect to expand your coaching business and track your growth.', 'Business Building', 9, false, '🔗'),
('team-resources', 'Team Resources', 'Essential trackers and tools for managing and growing your coaching team.', 'Business Building', 10, false, '👥'),
('gold-standard', 'Gold Standard Trainings', 'Advanced coaching techniques and best practices for experienced coaches.', 'Business Building', 11, false, '🏆');

-- ============================================
-- DATA: Module Resources
-- ============================================

-- Coach Launch Playbook resources
INSERT INTO module_resources (id, module_id, title, resource_type, url, sort_order) VALUES
('launch-1', 'coach-launch', 'New Coach Welcome Letter', 'doc', 'https://docs.google.com/document/d/1arNc-lNb1zJ2WJ0VS87Dpfre973u-IboIYxQqNUr7Vs/edit?usp=sharing', 1),
('launch-2', 'coach-launch', 'New Coach Printable Checklist', 'doc', 'https://docs.google.com/document/d/118onAvS-zWGDClUpkSOLEcXhRNnuaCir/edit?usp=sharing&ouid=103643178845055801965&rtpof=true&sd=true', 2),
('launch-3', 'coach-launch', 'How to Purchase Your Coaching Kit', 'video', 'https://vimeo.com/548985412', 3),
('launch-4', 'coach-launch', 'How to Prepare for Your Social Media Launch', 'doc', 'https://docs.google.com/document/d/1MmQrsmqenglJr_SenBcBH_qkc4k6mWe_/edit?usp=sharing&ouid=103643178845055801965&rtpof=true&sd=true', 4),
('launch-5', 'coach-launch', 'How to Work Your Launch Post and Common Mistakes to Avoid', 'doc', 'https://docs.google.com/document/d/11tutR54Y_rDUUWkQupfY8cHN9n_VH-fIQPwnTSnDLnU/edit?usp=sharing', 5),
('launch-6', 'coach-launch', 'How to Nail the Health Assessment', 'doc', 'https://docs.google.com/document/d/1A8UIEidVXGrz8jeDsqKbrRVPbbpWc3b0/edit?usp=sharing&ouid=103643178845055801965&rtpof=true&sd=true', 6),
('launch-7', 'coach-launch', 'How to Back Into a Health Assessment: Re-Record This', 'video', 'https://vimeo.com/671134401', 7),
('launch-8', 'coach-launch', 'Effective Follow Up After a Health Assessment', 'doc', 'https://docs.google.com/document/d/1D-DyRUeV5r4jipqnudUxweh3HGFh_hPD/edit?usp=sharing&ouid=103643178845055801965&rtpof=true&sd=true', 8),
('launch-9', 'coach-launch', 'Common Objections and How to Address Them', 'doc', 'https://docs.google.com/document/d/1TQPw-pKAllqEz7MZXa3XEsxjN5Jo1T5b/edit?usp=sharing&ouid=103643178845055801965&rtpof=true&sd=true', 9),
('launch-10', 'coach-launch', 'Week One Posting Guide', 'doc', 'https://docs.google.com/document/d/1DIV9pEZlmqzA8ZIAnCPExQ_KhOedjA38OauiOqtqL5c/edit?usp=sharing', 10),
('launch-11', 'coach-launch', 'Fast Track to Senior Coach', 'doc', 'https://www.canva.com/design/DAGRyr_F44Y/3_36EEwhi6JmMZfl1ZKAvw/edit?utm_content=DAGRyr_F44Y&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton', 11),
('launch-12', 'coach-launch', '30 Day New Coach Self-Evaluation', 'doc', 'https://docs.google.com/document/d/1nOC6erBMIws-SZzQ40TCz5DEvBQpmVLMUCI5V7E_8Ys/edit?usp=sharing', 12);

-- Launching a Client & Month One resources
INSERT INTO module_resources (id, module_id, title, resource_type, url, sort_order) VALUES
('client-1', 'client-month-one', 'New Client Checklist', 'doc', 'https://docs.google.com/document/d/1c8WqcDJPVmSm6h9Ss2x3V02L0apIemDp/edit?usp=sharing&ouid=103643178845055801965&rtpof=true&sd=true', 1),
('client-2', 'client-month-one', 'Welcome and 9 Tips Text', 'doc', 'https://docs.google.com/document/d/1x9k469K6XvuQ8rcPdgR3z4i9iXKLxBvSIR_77UuDgpM/edit?usp=sharing', 2),
('client-3', 'client-month-one', '5 Success Tips', 'doc', 'https://docs.google.com/document/d/1nss0Lsj1L6jr0X8AEZHZ4cdLOt9vW_SZXokHHLy-r9M/edit?usp=sharing', 3),
('client-4', 'client-month-one', 'Daily Metabolic Health Text Messages Days 1-10', 'doc', 'https://docs.google.com/document/d/1gtH2fYDKLA6f3sv6-yxFUM8b6rLBqp8jF5R7h4ec6i4/edit?usp=sharing', 4),
('client-5', 'client-month-one', 'Optional Metabolic Health Text Messages Days 10-31', 'doc', 'https://docs.google.com/document/d/1G9YtI07xIvazS4KZcCkLlB4N_E1axueXVeV4R0Na4Yc/edit?usp=sharing', 5),
('client-6', 'client-month-one', 'Systems Check Questions', 'doc', 'https://docs.google.com/document/d/1xZJ_afiL_W4YcinCkM6NbNWrH2GqZmRnS1XrB_BRLIM/edit?usp=sharing', 6),
('client-7', 'client-month-one', 'Detailed Systems Check Video for Clients Who Are Not Losing Well', 'video', 'https://docs.google.com/document/d/1HLqL_l7IELKgjlx5d3SBuXi2xdyBSaawJ5JmcKDoGHM/edit?usp=sharing', 7),
('client-8', 'client-month-one', 'VIP Call How To', 'doc', 'https://docs.google.com/document/d/1vtYewe5sbVziNTzz3Fk3l3DhRt1x0xTps_hxtYEQk7Q/edit?usp=sharing', 8),
('client-9', 'client-month-one', 'The Mindset Behind Effective Sponsorship', 'video', 'https://vimeo.com/665762974', 9);

-- Client Support Texts & Videos resources
INSERT INTO module_resources (id, module_id, title, resource_type, url, sort_order) VALUES
('support-1', 'client-support', 'Schedule for New Client Communication', 'doc', 'https://docs.google.com/document/d/1iYiwp4tMmlmqFDj8JoG8PNiFbF4ed6yRnMJnRMmzW1g/edit?usp=sharing', 1),
('support-2', 'client-support', 'New Client Videos', 'video', 'https://docs.google.com/document/d/1yfVgcKDiXCP6Og1hopzSBGvI8l0MlQpoGt0hnxjXf_U/edit?usp=sharing', 2),
('support-3', 'client-support', 'Welcome and 9 Tips', 'doc', 'https://docs.google.com/document/d/1x9k469K6XvuQ8rcPdgR3z4i9iXKLxBvSIR_77UuDgpM/edit?usp=sharing', 3),
('support-4', 'client-support', 'Metabolic Health Texts Days 1-9', 'doc', 'https://docs.google.com/document/d/1gtH2fYDKLA6f3sv6-yxFUM8b6rLBqp8jF5R7h4ec6i4/edit?usp=sharing', 4),
('support-5', 'client-support', 'Expanded Metabolic Health Texts Days 10-30', 'doc', 'https://docs.google.com/document/d/1G9YtI07xIvazS4KZcCkLlB4N_E1axueXVeV4R0Na4Yc/edit?usp=sharing', 5),
('support-6', 'client-support', 'Digital Guides', 'doc', 'https://docs.google.com/document/d/1TtZoQcKzTT77PZP0XNlMH-e8HiYzwKhS1UL8ZW5BcT8/edit?usp=sharing', 6),
('support-7', 'client-support', 'Eat This Every Day', 'doc', 'https://docs.google.com/document/d/1_4kgw8X0_bHp6mbGW5Xtwdg0_W7hVYBWwNgHNSM3xLk/edit?usp=sharing', 7),
('support-8', 'client-support', 'How to Update Your Premier Order', 'doc', 'https://docs.google.com/document/d/1D-ueL9kljNxEdqHFrvp9u-aze-z3-2glZaYN-936fCc/edit?usp=sharing', 8);

-- Branding Your Business resources
INSERT INTO module_resources (id, module_id, title, resource_type, url, sort_order) VALUES
('brand-1', 'branding', 'How to Add a Disclaimer to Your Pictures', 'video', 'https://www.youtube.com/watch?v=Z4ABPUk5JHs', 1),
('brand-2', 'branding', 'How to Add a Wellness Credit', 'video', 'https://vimeo.com/473831198', 2),
('brand-3', 'branding', 'Branding and Setting Up Your Business', 'doc', 'https://docs.google.com/document/d/10aK_KwiHBXsVuUzRS2DjFmly0QH_VJ44ohSIMuxEJ3A/edit?usp=sharing', 3),
('brand-4', 'branding', 'Setting Up Your Coaching Website', 'video', 'https://youtu.be/xtSR2nJJfAg?si=dHRxhzOE_b1wcIF5', 4),
('brand-5', 'branding', 'Setting Up Your OPTAVIA Pay', 'doc', 'https://docs.google.com/document/d/1LuGK2ZNo8lFI51vesDKKHdUDCpgKhvtztv3-KS06KvE/edit?usp=sharing', 5),
('brand-6', 'branding', 'OPTAVIA Vocabulary', 'doc', 'https://docs.google.com/document/d/1jLPNcT5cROxHm8y_XWpCC4AQjnMo9bjwZs-Kz5UVXTY/edit?usp=sharing', 6);

-- Social Media Strategy resources
INSERT INTO module_resources (id, module_id, title, resource_type, url, sort_order) VALUES
('social-1', 'social-media', 'How to Create a Simple Reel', 'video', 'https://vimeo.com/1147526154', 1),
('social-2', 'social-media', 'How to Have Effective Conversations', 'doc', 'https://www.canva.com/design/DAGwKmV4-qY/jcb8D4BueFoAYZsc8uERiQ/view?utm_content=DAGwKmV4-qY&utm_campaign=designshare&utm_medium=link&utm_source=viewer', 2);

-- Coaching 10X resources
INSERT INTO module_resources (id, module_id, title, resource_type, url, sort_order) VALUES
('10x-1', 'coaching-10x', '10X Kickoff Call', 'video', 'https://vimeo.com/1114863189?fl=tl&fe=ec', 1);

-- Coaching a Metabolic Reset resources
INSERT INTO module_resources (id, module_id, title, resource_type, url, sort_order) VALUES
('metabolic-1', 'metabolic-reset', 'Metabolic Talking Points for Coaches', 'doc', 'https://docs.google.com/document/d/1GzyY4Je8wWtYxoY7DsuVlPTgCJWdEUzK8jp4UmS6MnQ/edit?usp=sharing', 1),
('metabolic-2', 'metabolic-reset', '10 Questions That Will Help You Gauge Your Metabolic Health', 'video', 'https://vimeo.com/1135751990/8205c4652d?fl=tl&fe=ec', 2);

-- Moving to ED and Beyond resources
INSERT INTO module_resources (id, module_id, title, resource_type, url, sort_order) VALUES
('ed-1', 'moving-to-ed', 'Moving to ED and Beyond', 'doc', 'https://docs.google.com/document/d/15AyF_jd0KTKYgGyiruHMiZusQ_sDOg7DWXrpkxmAg7I/edit?usp=sharing', 1);

-- How to Use Connect to Grow Your Business resources
INSERT INTO module_resources (id, module_id, title, resource_type, url, sort_order) VALUES
('connect-1', 'connect-business', 'Basic How to Check Your Current and Projected FQV', 'video', 'https://www.loom.com/share/799a4ae74a7645aabab8f3d67a4215cf', 1),
('connect-2', 'connect-business', 'How to Run Projected Numbers for Yourself and a Team', 'video', 'https://www.loom.com/share/9da0ac3751e84db09ee375c9c039c527', 2),
('connect-3', 'connect-business', 'How to End the Month Strategically', 'video', 'https://vimeo.com/1105267713/6d51506452?fl=tl&fe=ec', 3);

-- Team Resources
INSERT INTO module_resources (id, module_id, title, resource_type, url, sort_order) VALUES
('team-1', 'team-resources', 'Teaching Your Chat GPT to Know You', 'doc', 'https://cdn.fbsbx.com/v/t59.2708-21/600933254_1848441836031561_1534090109953931690_n.pdf/PDF.pdf?_nc_cat=108&ccb=1-7&_nc_sid=2b0e22&_nc_ohc=pwe4VZspIpEQ7kNvwGV9R2-&_nc_oc=AdlX-wH52TdslJupV3jbn-wI8tvNc0Pnn9u5fwUtUcVGx5D9IWQNYKgujqwE7-bbYW29P6w7PzdCgymKzbYYxeJr&_nc_zt=7&_nc_ht=cdn.fbsbx.com&_nc_gid=MuExEBy5Lkhwb-W2_9Mx3Q&oh=03_Q7cD4AGKFuHDjq_XAG-rezLvQKghcg11VyMyou3qrtoeJOFSWA&oe=6940AD9F&dl=1', 1),
('team-2', 'team-resources', 'ED Daily Tracker', 'doc', 'https://docs.google.com/document/d/1kCzIHm7DV1WPSTsbTh-NZr4qXj278iZ52vOPs08PfbE/edit', 2),
('team-3', 'team-resources', 'FIBC Daily Tracker', 'doc', 'https://docs.google.com/document/d/1WSH2shc6mhmoJubPEdNOwyRC2VPotHOnzvYEBSDx-bk/edit', 3),
('team-4', 'team-resources', 'Grow to FIBC Bubble Tracker', 'doc', 'https://docs.google.com/document/d/1xwxMPmRRdBLHsyNLz1rkgMRDK6f8-_gr/edit', 4),
('team-5', 'team-resources', 'Global/Presidential Daily Tracker', 'doc', 'https://docs.google.com/document/d/1j9fcAHJ769BRyqaOhZ60HFzb7VhoB0gc3KL5pjyT1PQ/edit', 5),
('team-6', 'team-resources', 'IPD Bubble Tracker', 'doc', 'https://docs.google.com/document/d/1JRnQ_uavSfOVj3Mvwf7T2lCASmj8jnEb/edit', 6);

-- Gold Standard Trainings resources
INSERT INTO module_resources (id, module_id, title, resource_type, url, sort_order) VALUES
('gold-1', 'gold-standard', '10X Kickoff Call with Kristen Glass', 'video', 'https://vimeo.com/manage/videos/1115495757/3e666d9fcd', 1);

-- ============================================
-- DATA: Recipes
-- ============================================

INSERT INTO recipes (id, title, description, image, category, prep_time, cook_time, servings, difficulty, lean_count, green_count, fat_count, condiment_count, ingredients, instructions) VALUES
-- CHICKEN RECIPES
('recipe-1', 'Lemon Herb Grilled Chicken', 'Tender grilled chicken breast with bright lemon and fresh herbs, served over roasted asparagus.', 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=400&h=300&fit=crop', 'Chicken', 15, 25, 4, 'Easy', 1, 3, 0, 2, ARRAY['24 oz chicken breast', '2 lemons, juiced and zested', '4 cloves garlic, minced', '2 tbsp fresh oregano, chopped', '2 tbsp fresh thyme', '1 lb asparagus, trimmed', 'Salt and pepper to taste'], ARRAY['Marinate chicken in lemon juice, zest, garlic, and herbs for 30 minutes.', 'Preheat grill to medium-high heat.', 'Grill chicken 6-7 minutes per side until internal temp reaches 165°F.', 'Toss asparagus with salt and grill 3-4 minutes.', 'Let chicken rest 5 minutes before slicing. Serve over asparagus.']),

('recipe-2', 'Caprese Chicken', 'Classic flavors of Caprese served on a tender chicken breast. So simple. So delicious.', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop', 'Chicken', 10, 20, 2, 'Easy', 1, 3, 1, 1, ARRAY['12 oz chicken breast', '2 oz fresh mozzarella, sliced', '2 Roma tomatoes, sliced', 'Fresh basil leaves', '1 tbsp balsamic glaze', '4 cups mixed greens', '1 tbsp olive oil', 'Salt and pepper'], ARRAY['Season chicken with salt and pepper.', 'Grill or pan-sear until cooked through, about 6-7 minutes per side.', 'Top chicken with mozzarella, tomato slices, and fresh basil.', 'Drizzle with balsamic glaze.', 'Serve over mixed greens dressed with olive oil.']),

('recipe-3', 'Grilled Fajita Bowl', 'Serve up a taste of the Southwest with a delicious dish perfect for family dinner.', 'https://images.unsplash.com/photo-1604909052743-94e838986d24?w=400&h=300&fit=crop', 'Chicken', 15, 15, 4, 'Easy', 1, 3, 1, 2, ARRAY['20 oz chicken breast, sliced', '2 bell peppers, sliced', '1 onion, sliced', '2 tbsp fajita seasoning', '4 cups romaine lettuce', '1/2 cup salsa', '1/4 cup Greek yogurt', '1 avocado, sliced'], ARRAY['Season chicken with fajita seasoning.', 'Grill chicken 5-6 minutes per side until cooked through.', 'Grill peppers and onions until slightly charred.', 'Arrange lettuce in bowls.', 'Top with chicken, peppers, onions, salsa, yogurt, and avocado.']),

('recipe-4', 'Buffalo Chicken Cauliflower Casserole', 'Creamy and delicious buffalo chicken paired with cauliflower florets in a satisfying casserole.', 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=400&h=300&fit=crop', 'Chicken', 15, 30, 4, 'Medium', 1, 3, 1, 2, ARRAY['20 oz cooked chicken breast, shredded', '4 cups cauliflower florets', '4 oz low-fat cream cheese', '1/4 cup buffalo sauce', '1/4 cup ranch dressing (light)', '1/2 cup reduced-fat cheddar cheese', 'Green onions for garnish'], ARRAY['Preheat oven to 375°F.', 'Steam cauliflower until tender, about 5 minutes.', 'Mix cream cheese, buffalo sauce, and ranch until smooth.', 'Combine chicken, cauliflower, and sauce mixture in a baking dish.', 'Top with cheddar cheese and bake 20 minutes until bubbly.', 'Garnish with green onions.']),

('recipe-5', 'Chicken Cacciatore (Instant Pot)', 'A healthy and flavorful Italian dish with chicken thighs in a rich tomato sauce with peppers.', 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=400&h=300&fit=crop', 'Chicken', 15, 25, 4, 'Medium', 1, 3, 0, 3, ARRAY['20 oz boneless skinless chicken thighs', '1 can crushed tomatoes (14 oz)', '1 red bell pepper, sliced', '1 green bell pepper, sliced', '1/2 cup scallions, chopped', '3 cloves garlic, minced', '1 bay leaf', 'Fresh parsley for garnish', 'Salt and pepper'], ARRAY['Season chicken with salt and pepper.', 'Set Instant Pot to sauté and brown chicken on both sides.', 'Add tomatoes, peppers, scallions, garlic, and bay leaf.', 'Pressure cook on high for 15 minutes.', 'Natural release for 5 minutes, then quick release.', 'Remove bay leaf and garnish with fresh parsley.']),

('recipe-6', 'Crispy Almond Chicken Parmesan', 'Crispy almond flour breaded chicken topped with marinara and melted mozzarella.', 'https://images.unsplash.com/photo-1632778149955-e80f8ceca2e8?w=400&h=300&fit=crop', 'Chicken', 20, 25, 4, 'Medium', 1, 3, 1, 2, ARRAY['20 oz chicken breast, pounded thin', '1/2 cup almond flour', '1/4 cup grated parmesan', '1 egg, beaten', '1 cup sugar-free marinara', '4 oz part-skim mozzarella', '4 cups zucchini noodles', 'Italian seasoning'], ARRAY['Preheat oven to 400°F.', 'Mix almond flour, parmesan, and Italian seasoning.', 'Dip chicken in egg, then coat in almond mixture.', 'Bake chicken for 15 minutes.', 'Top with marinara and mozzarella, bake 10 more minutes.', 'Serve over zucchini noodles.']),

('recipe-7', 'Tropical Chicken Medley', 'Lean chicken with sautéed peppers and broccoli, topped with toasted pine nuts.', 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop', 'Chicken', 15, 20, 4, 'Easy', 1, 3, 1, 1, ARRAY['20 oz boneless skinless chicken breast', '2 cups broccoli florets', '1 red bell pepper, sliced', '1 yellow bell pepper, sliced', '2 tbsp pine nuts, toasted', '2 cloves garlic, minced', '1 tbsp olive oil', 'Salt and pepper'], ARRAY['Cut chicken into bite-sized pieces and season.', 'Heat oil in a large skillet over medium-high heat.', 'Cook chicken until golden, about 6-7 minutes. Remove.', 'Sauté peppers and broccoli with garlic until tender-crisp.', 'Return chicken to pan and toss together.', 'Top with toasted pine nuts before serving.']),

('recipe-8', 'Chicken Zucchini Noodles with Pesto', 'Fresh zucchini noodles tossed with grilled chicken and homemade parsley almond pesto.', 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop', 'Chicken', 20, 15, 4, 'Medium', 1, 3, 1, 1, ARRAY['20 oz chicken breast', '4 medium zucchini, spiralized', '1 cup fresh parsley', '2 tbsp almonds', '2 cloves garlic', '2 tbsp olive oil', '2 tbsp parmesan cheese', 'Salt and pepper'], ARRAY['Blend parsley, almonds, garlic, olive oil, and parmesan for pesto.', 'Season and grill chicken until cooked through.', 'Spiralize zucchini into noodles.', 'Sauté zoodles for 2-3 minutes until slightly tender.', 'Slice chicken and toss with zoodles and pesto.', 'Season with salt and pepper to taste.']),

-- SEAFOOD RECIPES
('recipe-9', 'Blackened Shrimp Lettuce Wraps', 'Spicy blackened shrimp with creamy avocado crema and fresh tomato salsa in crisp lettuce cups.', 'https://images.unsplash.com/photo-1551248429-40975aa4de74?w=400&h=300&fit=crop', 'Seafood', 10, 8, 2, 'Easy', 1, 3, 1, 1, ARRAY['12 oz large shrimp, peeled and deveined', '2 tbsp blackened seasoning (Old Bay)', '1 head butter lettuce', '1 ripe avocado', '1/4 cup Greek yogurt', '2 Roma tomatoes, diced', '1/4 cup cilantro, chopped', '1 lime, juiced', '1 jalapeño, minced (optional)'], ARRAY['Pat shrimp dry and coat evenly with blackened seasoning.', 'Heat a skillet over high heat. Cook shrimp 2-3 minutes per side until opaque.', 'Blend avocado, Greek yogurt, and half the lime juice for crema.', 'Mix tomatoes, cilantro, jalapeño, and remaining lime juice for salsa.', 'Arrange shrimp in lettuce cups, top with crema and salsa.']),

('recipe-10', 'Salmon Piccata with Capers', 'Pan-seared salmon in a light lemon butter caper sauce with sautéed spinach.', 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop', 'Seafood', 10, 15, 2, 'Medium', 1, 3, 1, 2, ARRAY['12 oz salmon fillet', '2 tbsp capers, drained', '2 lemons, juiced', '2 tbsp butter', '6 cups fresh spinach', '2 cloves garlic, minced', 'Fresh parsley', 'Salt and pepper'], ARRAY['Season salmon with salt and pepper.', 'Sear salmon in a hot pan 4 minutes per side.', 'Remove salmon. Add butter, lemon juice, and capers to pan.', 'In another pan, sauté garlic and spinach until wilted.', 'Plate spinach, top with salmon, drizzle with piccata sauce.']),

('recipe-11', 'Sheet Pan Salmon with Asparagus', 'Easy one-pan meal with perfectly roasted salmon and tender asparagus.', 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400&h=300&fit=crop', 'Seafood', 10, 20, 4, 'Easy', 1, 3, 1, 1, ARRAY['20 oz salmon fillets', '1 lb asparagus, trimmed', '2 tbsp olive oil', '4 cloves garlic, minced', '1 lemon, sliced', 'Fresh dill', 'Salt and pepper'], ARRAY['Preheat oven to 400°F.', 'Arrange salmon and asparagus on a sheet pan.', 'Drizzle with olive oil, sprinkle with garlic, salt, and pepper.', 'Top salmon with lemon slices.', 'Roast for 15-20 minutes until salmon flakes easily.', 'Garnish with fresh dill.']),

('recipe-12', 'Shrimp Scampi Zoodles', 'Classic shrimp scampi flavors over light and fresh zucchini noodles.', 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=400&h=300&fit=crop', 'Seafood', 15, 10, 2, 'Easy', 1, 3, 1, 2, ARRAY['12 oz large shrimp, peeled', '3 medium zucchini, spiralized', '4 cloves garlic, minced', '2 tbsp butter', '1/4 cup white wine or chicken broth', '2 tbsp capers', 'Red pepper flakes', 'Fresh parsley'], ARRAY['Spiralize zucchini into noodles.', 'Sauté garlic in butter for 1 minute.', 'Add shrimp, cook 2 minutes per side until pink.', 'Add wine/broth and capers, simmer 2 minutes.', 'Toss with zoodles, garnish with parsley and red pepper flakes.']),

('recipe-13', 'Za''atar Salmon Salad', 'Middle Eastern spiced salmon served over a fresh cucumber tomato salad.', 'https://images.unsplash.com/photo-1580476262798-bddd9f4b7369?w=400&h=300&fit=crop', 'Seafood', 15, 15, 2, 'Easy', 1, 3, 1, 2, ARRAY['12 oz salmon fillets', '1 tbsp za''atar seasoning', '2 cups cucumber, diced', '1 cup cherry tomatoes, halved', '1/4 red onion, thinly sliced', '2 cups mixed greens', '2 tbsp olive oil', '1 lemon, juiced'], ARRAY['Season salmon with za''atar and roast at 400°F for 12-15 minutes.', 'Combine cucumber, tomatoes, onion, and greens.', 'Whisk olive oil and lemon juice for dressing.', 'Toss salad with dressing.', 'Top with roasted salmon and serve with lemon wedges.']),

('recipe-14', 'Lobster Roll Lettuce Wraps', 'Light and refreshing, yet filling. The perfect dish for summer!', 'https://images.unsplash.com/photo-1559742811-822873691df8?w=400&h=300&fit=crop', 'Seafood', 15, 0, 2, 'Easy', 1, 3, 1, 1, ARRAY['12 oz cooked lobster meat', '2 tbsp light mayo', '1 tbsp lemon juice', '1 celery stalk, diced', '1 tbsp chives, chopped', '1 head butter lettuce', 'Old Bay seasoning', 'Lemon wedges'], ARRAY['Chop lobster into bite-sized pieces.', 'Mix mayo, lemon juice, celery, and chives.', 'Fold in lobster meat gently.', 'Season with Old Bay to taste.', 'Serve in lettuce cups with lemon wedges.']),

('recipe-15', 'Mediterranean Cod with Tomatoes', 'Flaky cod topped with a zesty tomato mixture and feta cheese over zucchini.', 'https://images.unsplash.com/photo-1534604973900-c43ab4c2e0ab?w=400&h=300&fit=crop', 'Seafood', 15, 20, 2, 'Medium', 1, 3, 1, 2, ARRAY['12 oz cod fillets', '2 medium zucchini, sliced', '1 cup cherry tomatoes, halved', '2 oz feta cheese, crumbled', '2 cloves garlic, minced', '1 tbsp olive oil', 'Fresh oregano', 'Salt and pepper'], ARRAY['Preheat oven to 400°F.', 'Arrange zucchini slices on a baking dish, season with salt.', 'Place cod on top of zucchini.', 'Mix tomatoes, garlic, olive oil, and oregano. Spoon over cod.', 'Bake 15-20 minutes until cod flakes easily.', 'Top with crumbled feta before serving.']),

('recipe-16', 'Shrimp and Avocado Salad', 'Fresh and light salad with grilled shrimp, avocado, and pumpkin seeds.', 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop', 'Seafood', 15, 8, 2, 'Easy', 1, 3, 1, 1, ARRAY['12 oz shrimp, peeled and deveined', '4 cups mixed greens', '1 avocado, sliced', '1/4 cup cilantro, chopped', '2 tbsp pumpkin seeds', '1 lime, juiced', '1 tbsp olive oil', 'Salt and pepper'], ARRAY['Season shrimp with salt and pepper.', 'Grill or sauté shrimp until pink, about 2-3 minutes per side.', 'Arrange greens on plates.', 'Top with shrimp, avocado, cilantro, and pumpkin seeds.', 'Drizzle with lime juice and olive oil.']),

('recipe-17', 'Cajun Shrimp and Cauliflower Rice', 'Spicy Cajun shrimp served over fluffy cauliflower rice with peppers and onions.', 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&h=300&fit=crop', 'Seafood', 15, 15, 4, 'Easy', 1, 3, 1, 2, ARRAY['20 oz large shrimp', '4 cups cauliflower rice', '2 tbsp Cajun seasoning', '1 bell pepper, diced', '1/2 onion, diced', '2 cloves garlic, minced', '1 tbsp olive oil', 'Fresh parsley'], ARRAY['Season shrimp with Cajun seasoning.', 'Heat oil and sauté peppers and onions until soft.', 'Add garlic and cauliflower rice, cook 5 minutes.', 'Push rice to sides, add shrimp to center.', 'Cook shrimp 2-3 minutes per side.', 'Toss together and garnish with parsley.']),

-- BEEF RECIPES
('recipe-18', 'Beef & Chinese Broccoli', 'Quick and flavorful beef stir-fry with tender Chinese broccoli in savory sauce.', 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&h=300&fit=crop', 'Beef', 15, 12, 3, 'Easy', 1, 3, 1, 2, ARRAY['18 oz lean sirloin, thinly sliced', '1 lb Chinese broccoli', '3 cloves garlic, minced', '1 tbsp fresh ginger, minced', '2 tbsp coconut aminos', '1 tbsp sesame oil', 'Red pepper flakes'], ARRAY['Heat oil in a wok over high heat.', 'Stir-fry beef 2-3 minutes until browned. Remove and set aside.', 'Add garlic and ginger, cook 30 seconds.', 'Add broccoli, cook 3-4 minutes until tender-crisp.', 'Return beef, add coconut aminos, toss and serve.']),

('recipe-19', 'Big Mac Salad Bowl', 'All the flavors of a Big Mac without the bun - beef, cheese, lettuce, and special sauce.', 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=400&h=300&fit=crop', 'Beef', 10, 15, 2, 'Easy', 1, 3, 1, 2, ARRAY['12 oz lean ground beef (93%)', '4 cups romaine lettuce, chopped', '2 oz reduced-fat cheddar, shredded', '1/4 cup dill pickles, diced', '1/4 cup onion, diced', '2 tbsp light Thousand Island dressing', 'Sesame seeds'], ARRAY['Brown ground beef in a skillet, breaking into crumbles.', 'Season with salt and pepper.', 'Arrange lettuce in bowls.', 'Top with beef, cheese, pickles, and onion.', 'Drizzle with Thousand Island dressing.', 'Sprinkle with sesame seeds.']),

('recipe-20', 'Beef Stroganoff with Cauliflower Rice', 'Creamy beef stroganoff served over fluffy cauliflower rice with broccoli.', 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=300&fit=crop', 'Beef', 15, 25, 4, 'Medium', 1, 3, 1, 2, ARRAY['20 oz beef sirloin, sliced into strips', '4 cups cauliflower rice', '2 cups broccoli florets', '1 cup beef broth', '1/2 cup light sour cream', '8 oz mushrooms, sliced', '1 tbsp fresh dill', 'Salt and pepper'], ARRAY['Season beef and sear in a hot pan until browned.', 'Remove beef, sauté mushrooms until golden.', 'Add broth and simmer 5 minutes.', 'Stir in sour cream and dill.', 'Return beef to sauce.', 'Serve over cauliflower rice with steamed broccoli.']),

('recipe-21', 'Cheesy Taco Vegetable Skillet', 'Ground beef with fresh vegetables and melted cheese - taco Tuesday made lean!', 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400&h=300&fit=crop', 'Beef', 15, 20, 4, 'Easy', 1, 3, 0, 2, ARRAY['20 oz lean ground beef (93%)', '2 cups kale, chopped', '1 bell pepper, diced', '1/2 onion, diced', '2 tbsp taco seasoning', '1/2 cup reduced-fat cheddar', 'Salsa for topping', 'Fresh cilantro'], ARRAY['Brown ground beef with taco seasoning.', 'Add onion and pepper, cook until soft.', 'Stir in kale and cook until wilted.', 'Top with cheese and cover until melted.', 'Serve with salsa and fresh cilantro.']),

('recipe-22', 'Spiced Crockpot Roast Beef', 'Tender slow-cooked beef roast with vegetables and aromatic spices.', 'https://images.unsplash.com/photo-1558030006-450675393462?w=400&h=300&fit=crop', 'Beef', 20, 480, 6, 'Easy', 1, 3, 0, 3, ARRAY['2 lb beef chuck roast', '2 cups celery, chopped', '2 cups green beans', '1 onion, quartered', '4 cloves garlic', '2 cups beef broth', '1 tbsp Italian seasoning', 'Salt and pepper'], ARRAY['Season roast with Italian seasoning, salt, and pepper.', 'Place vegetables in the bottom of slow cooker.', 'Add roast on top, pour in broth.', 'Add garlic cloves around the roast.', 'Cook on low for 8 hours or high for 4-5 hours.', 'Shred beef and serve with vegetables.']),

('recipe-23', 'Korean Beef Lettuce Cups', 'Sweet and savory Korean-style ground beef served in crisp lettuce cups.', 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=400&h=300&fit=crop', 'Beef', 10, 15, 4, 'Easy', 1, 3, 0, 2, ARRAY['20 oz lean ground beef', '1 head butter lettuce', '3 tbsp coconut aminos', '1 tbsp sesame oil', '2 cloves garlic, minced', '1 tbsp fresh ginger, minced', 'Green onions, sliced', 'Sesame seeds'], ARRAY['Brown ground beef in a skillet.', 'Add garlic and ginger, cook 1 minute.', 'Stir in coconut aminos and sesame oil.', 'Simmer 2-3 minutes until sauce thickens.', 'Spoon into lettuce cups.', 'Top with green onions and sesame seeds.']),

-- TURKEY RECIPES
('recipe-24', 'Zucchini Noodles with Turkey Meatballs', 'Light and satisfying zoodles topped with lean turkey meatballs and marinara sauce.', 'https://images.unsplash.com/photo-1529042410759-befb1204b468?w=400&h=300&fit=crop', 'Turkey', 20, 25, 4, 'Medium', 1, 3, 1, 2, ARRAY['20 oz lean ground turkey (93%)', '4 medium zucchini, spiralized', '1 cup sugar-free marinara sauce', '1/4 cup parmesan cheese', '1 egg', '2 cloves garlic, minced', 'Italian seasoning', 'Fresh basil for garnish'], ARRAY['Mix turkey, egg, half the parmesan, garlic, and Italian seasoning.', 'Form into 16 meatballs. Bake at 400°F for 20 minutes.', 'Spiralize zucchini into noodles.', 'Sauté zoodles in a pan for 2-3 minutes until slightly tender.', 'Top with meatballs, marinara, remaining parmesan, and fresh basil.']),

('recipe-25', 'Turkey Taco Bake', 'All the flavors of taco night in a satisfying casserole form.', 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=400&h=300&fit=crop', 'Turkey', 15, 30, 4, 'Easy', 1, 3, 0, 2, ARRAY['20 oz lean ground turkey', '2 cups cauliflower rice', '1 can diced tomatoes with green chiles', '2 tbsp taco seasoning', '1/2 cup reduced-fat Mexican cheese', '1/4 cup Greek yogurt', 'Fresh cilantro', 'Jalapeños (optional)'], ARRAY['Preheat oven to 375°F.', 'Brown turkey with taco seasoning.', 'Mix with cauliflower rice and tomatoes.', 'Pour into baking dish, top with cheese.', 'Bake 25 minutes until bubbly.', 'Serve with yogurt and cilantro.']),

('recipe-26', 'Turkey Zucchini Lasagna', 'Classic lasagna flavors using zucchini slices instead of pasta.', 'https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=400&h=300&fit=crop', 'Turkey', 25, 45, 6, 'Medium', 1, 3, 1, 2, ARRAY['24 oz lean ground turkey', '4 large zucchini, sliced lengthwise', '2 cups sugar-free marinara', '1 cup part-skim ricotta', '1 cup part-skim mozzarella', '1/4 cup parmesan', 'Italian seasoning', 'Fresh basil'], ARRAY['Salt zucchini slices and let drain 15 minutes.', 'Brown turkey with Italian seasoning.', 'Layer in baking dish: zucchini, turkey, ricotta, marinara, mozzarella.', 'Repeat layers, ending with cheese.', 'Bake at 375°F for 45 minutes.', 'Rest 10 minutes before serving with fresh basil.']),

('recipe-27', 'Crockpot Chicken Taco Soup', 'A healthy and flavorful soup that combines lean protein, vegetables, and taco spices.', 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&h=300&fit=crop', 'Turkey', 15, 360, 6, 'Easy', 1, 3, 0, 3, ARRAY['24 oz chicken or turkey breast', '4 cups chicken broth', '1 can diced tomatoes', '2 cups cabbage, shredded', '2 tbsp taco seasoning', '1 tsp cumin', '1 tsp chili powder', '2 cloves garlic, minced'], ARRAY['Combine broth, tomatoes, seasonings, and garlic in slow cooker.', 'Add chicken/turkey breast and cabbage.', 'Cook on low for 6-8 hours or high for 3-4 hours.', 'Shred meat with two forks.', 'Serve in bowls, optionally top with cheese and Greek yogurt.']),

('recipe-28', 'BBQ Turkey Stuffed Peppers', 'Colorful bell peppers stuffed with BBQ turkey and cauliflower rice.', 'https://images.unsplash.com/photo-1601000938365-f182c5ec7e46?w=400&h=300&fit=crop', 'Turkey', 20, 35, 4, 'Medium', 1, 3, 0, 2, ARRAY['20 oz lean ground turkey', '4 large bell peppers, tops removed', '2 cups cauliflower rice', '1/4 cup sugar-free BBQ sauce', '1/2 cup reduced-fat cheddar', '1/4 cup onion, diced', 'Garlic powder', 'Fresh parsley'], ARRAY['Preheat oven to 375°F.', 'Brown turkey with onion and garlic powder.', 'Mix in cauliflower rice and BBQ sauce.', 'Stuff mixture into peppers.', 'Bake 30 minutes, top with cheese.', 'Bake 5 more minutes until cheese melts.']),

-- PORK RECIPES
('recipe-29', 'Pork Tacos', 'Easy, cheesy and perfect for any time you''re craving tacos.', 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400&h=300&fit=crop', 'Pork', 15, 20, 3, 'Easy', 1, 3, 0, 2, ARRAY['18 oz pork tenderloin, sliced', '2 tbsp taco seasoning', '1 head butter lettuce', '1/2 cup pico de gallo', '1/4 cup Greek yogurt', 'Fresh cilantro', '1 lime', 'Jalapeño slices'], ARRAY['Season pork with taco seasoning.', 'Grill or pan-sear 3-4 minutes per side.', 'Let rest 5 minutes, then slice.', 'Arrange pork in lettuce cups.', 'Top with pico, yogurt, cilantro, and lime.']),

('recipe-30', 'Asian Pork Stir-Fry', 'Quick pork tenderloin stir-fry with snap peas and water chestnuts.', 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400&h=300&fit=crop', 'Pork', 15, 15, 4, 'Easy', 1, 3, 1, 2, ARRAY['20 oz pork tenderloin, sliced thin', '2 cups snap peas', '1 cup water chestnuts, sliced', '1 red bell pepper, sliced', '3 tbsp coconut aminos', '1 tbsp sesame oil', '2 cloves garlic, minced', '1 tbsp ginger, minced'], ARRAY['Heat sesame oil in a wok over high heat.', 'Stir-fry pork 3-4 minutes until cooked. Remove.', 'Add garlic, ginger, and vegetables. Cook 3-4 minutes.', 'Return pork to wok.', 'Add coconut aminos and toss to combine.', 'Serve immediately.']),

-- VEGETARIAN RECIPES
('recipe-31', 'Cauliflower Grilled Cheese', 'The grilled cheese flavor you love, without all of the carbs and calories.', 'https://images.unsplash.com/photo-1528736235302-52922df5c122?w=400&h=300&fit=crop', 'Vegetarian', 15, 20, 2, 'Medium', 1, 3, 1, 0, ARRAY['3 cups riced cauliflower', '2 eggs', '1/2 cup shredded cheddar cheese', '1/4 cup parmesan cheese', '1/4 tsp garlic powder', 'Salt and pepper', 'Cooking spray'], ARRAY['Microwave riced cauliflower 4 minutes. Let cool and squeeze dry.', 'Mix with 1 egg, parmesan, and seasonings.', 'Form into 4 thin patties on parchment-lined pan.', 'Bake at 400°F for 15 minutes until golden.', 'Add cheddar between two patties and grill until melted.']),

('recipe-32', 'Crispy Tofu with Caramelized Veggies', 'Lightly seasoned tofu baked with fresh vegetables for a satisfying plant-based meal.', 'https://images.unsplash.com/photo-1546069901-d5bfd2cbfb1f?w=400&h=300&fit=crop', 'Vegetarian', 20, 30, 2, 'Medium', 1, 3, 1, 3, ARRAY['15 oz extra firm tofu, pressed and cubed', '2 cups asparagus, trimmed', '1 cup bell peppers, sliced', '1 cup zucchini, sliced', '2 tbsp olive oil', '2 tbsp coconut aminos', '1 tbsp sesame seeds', 'Garlic powder, salt, pepper'], ARRAY['Press tofu for 15 minutes, then cube.', 'Toss tofu with half the oil and seasonings.', 'Bake at 400°F for 20 minutes, flipping halfway.', 'Toss vegetables with remaining oil.', 'Add vegetables to pan, bake 10 more minutes.', 'Drizzle with coconut aminos and sesame seeds.']),

('recipe-33', 'Vegetable Tofu Bowl with Eggs', 'A Chinese-inspired bowl with crispy tofu, sautéed vegetables, and poached eggs.', 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop', 'Vegetarian', 20, 25, 2, 'Medium', 1, 3, 1, 2, ARRAY['10 oz extra firm tofu, cubed', '2 eggs', '1 cup cauliflower florets', '1 cup mushrooms, sliced', '1 bell pepper, diced', '2 tbsp soy sauce or coconut aminos', '1 tsp sriracha', 'Fresh cilantro, ginger, garlic'], ARRAY['Press and cube tofu. Pan-fry until golden.', 'Sauté vegetables with ginger and garlic.', 'Add soy sauce and sriracha.', 'Place tofu on vegetables, simmer.', 'Crack eggs into the pan, cover and cook until set.', 'Garnish with cilantro.']),

('recipe-34', 'Ricotta Spinach Dumplings', 'Italian-style ricotta and spinach dumplings baked with cherry tomatoes and basil.', 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=400&h=300&fit=crop', 'Vegetarian', 25, 25, 2, 'Medium', 1, 3, 1, 3, ARRAY['1 cup part-skim ricotta cheese', '2 cups fresh spinach, wilted and drained', '1 egg', '1/4 cup parmesan cheese', '1 cup cherry tomatoes, halved', 'Fresh basil', 'Garlic, Italian seasoning', 'Salt and pepper'], ARRAY['Mix ricotta, spinach, egg, parmesan, and seasonings.', 'Form into small dumplings.', 'Place in baking dish with cherry tomatoes.', 'Drizzle with olive oil.', 'Bake at 400°F for 20-25 minutes.', 'Garnish with fresh basil.']),

('recipe-35', 'Zucchini Pizza Casserole', 'All the pizza flavors you love in a veggie-packed casserole.', 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&fit=crop', 'Vegetarian', 20, 35, 4, 'Easy', 1, 3, 1, 2, ARRAY['4 medium zucchini, sliced', '1 cup sugar-free marinara', '1 cup part-skim mozzarella', '1/4 cup parmesan', '1/2 cup mushrooms, sliced', '1/4 cup black olives', 'Italian seasoning', 'Fresh basil'], ARRAY['Preheat oven to 375°F.', 'Layer zucchini in a baking dish.', 'Spread marinara over zucchini.', 'Add mushrooms and olives.', 'Top with cheeses and Italian seasoning.', 'Bake 30-35 minutes until bubbly.']),

('recipe-36', 'Vegetarian Chili', 'Plant-based, lower carb chili packed with vegetables and protein.', 'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=400&h=300&fit=crop', 'Vegetarian', 20, 40, 4, 'Easy', 1, 3, 0, 3, ARRAY['15 oz extra firm tofu, crumbled', '1 can diced tomatoes', '2 cups cauliflower, chopped', '1 bell pepper, diced', '1/2 onion, diced', '2 tbsp chili powder', '1 tsp cumin', 'Garlic, salt, pepper'], ARRAY['Sauté onion and pepper until soft.', 'Add crumbled tofu and cook 5 minutes.', 'Stir in tomatoes, cauliflower, and spices.', 'Simmer 30 minutes until vegetables are tender.', 'Adjust seasonings to taste.', 'Serve with Greek yogurt if desired.']),

-- BREAKFAST RECIPES
('recipe-37', 'Egg White Veggie Scramble', 'Protein-packed breakfast with fluffy egg whites and colorful sautéed vegetables.', 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=400&h=300&fit=crop', 'Breakfast', 10, 10, 1, 'Easy', 1, 3, 1, 1, ARRAY['6 egg whites', '1 cup spinach', '1/2 cup mushrooms, sliced', '1/4 cup bell pepper, diced', '2 tbsp feta cheese', '1 tsp olive oil', 'Fresh herbs', 'Salt and pepper'], ARRAY['Heat oil in a non-stick pan over medium heat.', 'Sauté mushrooms and peppers for 3 minutes.', 'Add spinach, cook until wilted.', 'Pour in egg whites, gently scramble.', 'Top with feta and fresh herbs.']),

('recipe-38', 'Hearty Veggie Frittata', 'A delicious baked frittata packed with fresh vegetables - perfect for any meal.', 'https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=400&h=300&fit=crop', 'Breakfast', 15, 30, 2, 'Easy', 1, 3, 1, 1, ARRAY['6 eggs', '2 tbsp almond milk', '2 cups spinach', '1 cup zucchini, diced', '1 cup mushrooms, sliced', '1 tbsp olive oil', 'Salt and pepper', 'Fresh herbs'], ARRAY['Preheat oven to 375°F.', 'Whisk eggs and almond milk.', 'Sauté vegetables in an oven-safe skillet.', 'Pour eggs over vegetables.', 'Cook on stovetop 2 minutes.', 'Transfer to oven, bake 20-30 minutes until set.']),

('recipe-39', 'Spinach Tomato Egg Muffins', 'Portable egg muffins loaded with spinach, tomatoes, and cheese.', 'https://images.unsplash.com/photo-1608039829572-9b79e4e37f29?w=400&h=300&fit=crop', 'Breakfast', 15, 25, 6, 'Easy', 1, 3, 1, 0, ARRAY['6 eggs', '2 cups spinach, chopped', '1/2 cup cherry tomatoes, diced', '1/4 cup onion, diced', '1/4 cup goat cheese, crumbled', 'Salt and pepper', 'Cooking spray'], ARRAY['Preheat oven to 350°F. Spray muffin tin.', 'Sauté spinach and onion until wilted.', 'Divide vegetables and tomatoes among muffin cups.', 'Whisk eggs with salt and pepper.', 'Pour eggs over vegetables.', 'Top with goat cheese, bake 20-25 minutes.']),

('recipe-40', 'Asparagus and Crabmeat Frittata', 'Elegant brunch option with tender crabmeat and fresh asparagus.', 'https://images.unsplash.com/photo-1510693206972-df098062cb71?w=400&h=300&fit=crop', 'Breakfast', 15, 25, 4, 'Medium', 1, 3, 1, 1, ARRAY['8 eggs', '6 oz crabmeat', '1 lb asparagus, cut into pieces', '1/4 cup parmesan cheese', '2 tbsp olive oil', '2 cloves garlic, minced', 'Fresh dill', 'Salt and pepper'], ARRAY['Preheat oven to 375°F.', 'Sauté asparagus and garlic in oil until tender.', 'Add crabmeat, toss gently.', 'Whisk eggs with parmesan and seasonings.', 'Pour over asparagus mixture.', 'Bake 20-25 minutes until set.']),

('recipe-41', 'Mason Jar Egg Salad', 'Simple, portable, and packed with lean protein and veggies.', 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&h=300&fit=crop', 'Breakfast', 15, 12, 2, 'Easy', 1, 3, 1, 1, ARRAY['6 hard-boiled eggs', '2 tbsp light mayo', '1 tbsp Dijon mustard', '2 cups mixed greens', '1/2 cup celery, diced', '1/4 cup red onion, diced', 'Salt and pepper', 'Paprika'], ARRAY['Hard boil eggs, cool and peel.', 'Chop eggs and mix with mayo and mustard.', 'Season with salt, pepper, and paprika.', 'Layer greens in mason jars.', 'Top with egg salad, celery, and onion.', 'Seal and refrigerate until ready to eat.']),

('recipe-42', 'Kohlrabi Egg Scramble', 'A unique breakfast featuring kohlrabi paired with fluffy scrambled eggs.', 'https://images.unsplash.com/photo-1528712306091-ed0763094c98?w=400&h=300&fit=crop', 'Breakfast', 15, 15, 2, 'Easy', 1, 3, 1, 1, ARRAY['4 eggs', '2 egg whites', '1 kohlrabi, peeled and diced', '1 cup kale, chopped', '1 tbsp olive oil', '2 cloves garlic, minced', 'Salt and pepper', 'Fresh chives'], ARRAY['Heat oil in a skillet over medium heat.', 'Sauté kohlrabi until tender, about 8 minutes.', 'Add garlic and kale, cook 2 minutes.', 'Whisk eggs and egg whites.', 'Pour over vegetables and scramble.', 'Top with chives and serve.']);

