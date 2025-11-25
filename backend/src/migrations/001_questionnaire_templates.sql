-- Migration: Add questionnaire templates and version control
-- Purpose: Enable master configuration for X12 forms

-- 1. Add is_admin column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- 2. Create questionnaire_templates table
CREATE TABLE IF NOT EXISTS questionnaire_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_type TEXT NOT NULL, -- '270/271', '276/277', '837', etc.
  version TEXT NOT NULL, -- '1.0.0', '2.0.0', etc.
  status TEXT NOT NULL DEFAULT 'draft', -- 'draft', 'published', 'archived'
  config JSONB NOT NULL, -- Full questionnaire JSON (sections, questions, etc.)
  published_at TIMESTAMP,
  published_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  UNIQUE(transaction_type, version)
);

-- 3. Create questionnaire_versions table (audit log)
CREATE TABLE IF NOT EXISTS questionnaire_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES questionnaire_templates(id) ON DELETE CASCADE,
  version TEXT NOT NULL,
  config JSONB NOT NULL,
  changes_summary TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- 4. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_questionnaire_templates_transaction_type 
  ON questionnaire_templates(transaction_type);

CREATE INDEX IF NOT EXISTS idx_questionnaire_templates_status 
  ON questionnaire_templates(status);

CREATE INDEX IF NOT EXISTS idx_questionnaire_templates_published_at 
  ON questionnaire_templates(published_at DESC);

CREATE INDEX IF NOT EXISTS idx_questionnaire_versions_template_id 
  ON questionnaire_versions(template_id);

-- 5. Set Lisa Wilson as admin (update with actual user ID after user is created)
-- UPDATE users SET is_admin = TRUE WHERE email = 'lisa.wilson@availity.com';

-- 6. Add RLS policies (Row Level Security)
ALTER TABLE questionnaire_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE questionnaire_versions ENABLE ROW LEVEL SECURITY;

-- Allow all users to read published templates
CREATE POLICY "Anyone can read published templates" 
  ON questionnaire_templates FOR SELECT 
  USING (status = 'published');

-- Only admins can insert/update/delete templates
CREATE POLICY "Only admins can modify templates" 
  ON questionnaire_templates FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.is_admin = TRUE
    )
  );

-- Only admins can read version history
CREATE POLICY "Only admins can read versions" 
  ON questionnaire_versions FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.is_admin = TRUE
    )
  );

-- Only admins can insert version history
CREATE POLICY "Only admins can create versions" 
  ON questionnaire_versions FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.is_admin = TRUE
    )
  );

-- 7. Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_questionnaire_templates_updated_at
  BEFORE UPDATE ON questionnaire_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 8. Comments for documentation
COMMENT ON TABLE questionnaire_templates IS 'Master configuration for X12 transaction questionnaires';
COMMENT ON TABLE questionnaire_versions IS 'Version history and audit log for questionnaire changes';
COMMENT ON COLUMN users.is_admin IS 'Availity admin flag for master configuration access';

