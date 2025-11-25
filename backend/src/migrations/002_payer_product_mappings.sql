-- Migration: Add payer product mappings
-- Purpose: Enable admins to assign products (transaction types) to payer organizations

-- 1. Create payer_product_mappings table
CREATE TABLE IF NOT EXISTS payer_product_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  product_type TEXT NOT NULL, -- '270/271', '837', '278', '835', '834', etc.
  assigned_at TIMESTAMP DEFAULT NOW(),
  assigned_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(organization_id, product_type)
);

-- 2. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_payer_product_mappings_org 
  ON payer_product_mappings(organization_id);

CREATE INDEX IF NOT EXISTS idx_payer_product_mappings_product 
  ON payer_product_mappings(product_type);

CREATE INDEX IF NOT EXISTS idx_payer_product_mappings_assigned_at 
  ON payer_product_mappings(assigned_at DESC);

-- 3. Add RLS policies (Row Level Security)
ALTER TABLE payer_product_mappings ENABLE ROW LEVEL SECURITY;

-- Allow payers to read their own product assignments
CREATE POLICY "Payers can read their own product mappings" 
  ON payer_product_mappings FOR SELECT 
  USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

-- Only admins can insert/update/delete product mappings
CREATE POLICY "Only admins can modify product mappings" 
  ON payer_product_mappings FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.is_admin = TRUE
    )
  );

-- 4. Add updated_at trigger
CREATE TRIGGER update_payer_product_mappings_updated_at
  BEFORE UPDATE ON payer_product_mappings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 5. Comments for documentation
COMMENT ON TABLE payer_product_mappings IS 'Maps payer organizations to products (transaction types) they can access';
COMMENT ON COLUMN payer_product_mappings.product_type IS 'Transaction type identifier (e.g., 270/271, 837, 278)';
COMMENT ON COLUMN payer_product_mappings.assigned_by IS 'Admin user who assigned this product to the payer';

