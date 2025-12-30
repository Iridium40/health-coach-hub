-- Create announcement_templates table for email notifications
CREATE TABLE IF NOT EXISTS announcement_templates (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  is_html BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE announcement_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for announcement_templates
-- Allow authenticated users to view templates
CREATE POLICY "Authenticated users can view templates"
  ON announcement_templates FOR SELECT
  USING (auth.role() = 'authenticated');

-- Allow admins to insert templates
CREATE POLICY "Admins can insert templates"
  ON announcement_templates FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND user_role = 'admin')
  );

-- Allow admins to update templates
CREATE POLICY "Admins can update templates"
  ON announcement_templates FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND user_role = 'admin')
  );

-- Allow admins to delete templates
CREATE POLICY "Admins can delete templates"
  ON announcement_templates FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND user_role = 'admin')
  );

-- Create updated_at trigger (uses existing handle_updated_at function)
CREATE TRIGGER update_announcement_templates_updated_at
  BEFORE UPDATE ON announcement_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Add comment for documentation
COMMENT ON TABLE announcement_templates IS 'Email templates for announcement notifications';
COMMENT ON COLUMN announcement_templates.name IS 'Template name for identification';
COMMENT ON COLUMN announcement_templates.subject IS 'Email subject line';
COMMENT ON COLUMN announcement_templates.body IS 'Email body content';
COMMENT ON COLUMN announcement_templates.is_html IS 'Whether the body contains HTML content';

