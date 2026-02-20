-- Create client_support_resources table
-- Stores the master list of client support documents, videos, and guides
CREATE TABLE IF NOT EXISTS client_support_resources (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT '📄',
  url TEXT NOT NULL,
  category TEXT NOT NULL,
  color TEXT DEFAULT '#00A651',
  is_video BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE client_support_resources ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read active resources
CREATE POLICY "Authenticated users can view active resources"
  ON client_support_resources FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Admins can view all resources (including inactive)
CREATE POLICY "Admins can view all resources"
  ON client_support_resources FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND LOWER(user_role) IN ('system_admin', 'admin'))
  );

-- Admins can insert resources
CREATE POLICY "Admins can insert resources"
  ON client_support_resources FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND LOWER(user_role) IN ('system_admin', 'admin'))
  );

-- Admins can update resources
CREATE POLICY "Admins can update resources"
  ON client_support_resources FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND LOWER(user_role) IN ('system_admin', 'admin'))
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND LOWER(user_role) IN ('system_admin', 'admin'))
  );

-- Admins can delete resources
CREATE POLICY "Admins can delete resources"
  ON client_support_resources FOR DELETE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND LOWER(user_role) IN ('system_admin', 'admin'))
  );

-- Index for category-based queries and ordering
CREATE INDEX IF NOT EXISTS idx_client_support_resources_category ON client_support_resources(category);
CREATE INDEX IF NOT EXISTS idx_client_support_resources_sort ON client_support_resources(sort_order);
CREATE INDEX IF NOT EXISTS idx_client_support_resources_active ON client_support_resources(is_active);

-- Trigger for updated_at
CREATE TRIGGER update_client_support_resources_updated_at
  BEFORE UPDATE ON client_support_resources
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Seed initial data from the existing hardcoded master resource list
INSERT INTO client_support_resources (title, description, icon, url, category, color, is_video, sort_order) VALUES
  ('Launching a Client & Coaching Through Month One',
   'Complete step-by-step coaching guide for the first 30 days — every text, call, graphic, and video mapped to the right day.',
   '🚀', 'https://docs.google.com/document/d/1AN28hwkaXQAjYaWORapKMCgDGyRLoW0OI5W4cBN3QIU/edit',
   'Getting Started', '#00A651', false, 1),

  ('Clickable Day-by-Day Client Support Calendar',
   'Visual monthly calendar showing Month One and Month Two support rhythm at a glance.',
   '📅', 'https://drive.google.com/file/d/18jhQfmqxpR73Zwv146mG8HtnCWCAPn0r/view',
   'Getting Started', '#00A651', false, 2),

  ('Client Launch: Texts and Videos',
   'All daily text scripts (Days 1-4, Day 8, Day 21) and video links ready to copy and send.',
   '💬', 'https://docs.google.com/document/d/1tdBt7gAbgKwpvudYtp8Qr8YT6Eu5VrFMFOYSbekxQxA/edit',
   'Getting Started', '#00A651', false, 3),

  ('Red/Yellow/Green Client Support Model',
   'The complete R/Y/G system — how it works, when to escalate, and the coaching language to use.',
   '🚦', 'https://docs.google.com/document/d/1zYji1GlCR7IhO7W14fJMB5efviNO1kBQp9ByJD96QlI/edit',
   'Support Systems', '#f59e0b', false, 4),

  ('How to Use Office Hours for Supporting Clients',
   'Video guide on leveraging Coach Office Hours as a scalable support tool for your clients.',
   '🏢', 'https://youtu.be/phRN32R_pHc',
   'Support Systems', '#f59e0b', true, 5),

  ('Client Support After Month One',
   'Ongoing support model — Monday R/Y/G check-ins, mid-week touchpoints, Office Hours rhythm, and escalation system.',
   '📋', 'https://docs.google.com/document/d/1Oo3DDk2I15qa_a2CozV12_JsA2q1JPERiw54SxEwBP0/edit',
   'Support Systems', '#f59e0b', false, 6),

  ('How to Use the Client Referral Link',
   'Guide for setting up and sharing your client referral link for new client acquisition.',
   '🔗', 'https://docs.google.com/document/d/17PXSXLa65Teqrt4fZvSt6xyvNOb-D6QngQKEGNCPAPU/edit',
   'Growth', '#8b5cf6', false, 7),

  ('Metabolic Health Education',
   'Deep-dive educational content on metabolic health, fat burn science, and coaching through client questions.',
   '🧠', 'https://docs.google.com/document/d/1fq4hYbJV0jYBEZE_963ZPg2A9-sNymww-LwaCNXC-4I/edit',
   'Education', '#ec4899', false, 8),

  ('Transition and Optimization',
   'Guidance for transitioning clients through program phases and optimizing long-term results.',
   '⚡', 'https://docs.google.com/document/d/1366pPEylk2PWFQ-vH8sORzDW3C8hriEpONdztKBS0Ps/edit',
   'Education', '#ec4899', false, 9);
