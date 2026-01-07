-- Migration: Add category_id foreign key to training_resources
-- This creates a proper relationship between training_resources and training_categories
-- and ensures consistent ordering

-- Step 1: Add category_id column to training_resources
ALTER TABLE training_resources 
ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES training_categories(id);

-- Step 2: Populate category_id based on existing category name
UPDATE training_resources tr
SET category_id = tc.id
FROM training_categories tc
WHERE tr.category = tc.name;

-- Step 3: Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_training_resources_category_id 
ON training_resources(category_id);

-- Step 4: Create a view that joins resources with categories for easy querying
CREATE OR REPLACE VIEW training_resources_with_category AS
SELECT 
  tr.id,
  tr.title,
  tr.description,
  tr.url,
  tr.type,
  tr.sort_order as resource_sort_order,
  tr.is_active,
  tr.created_at,
  tr.updated_at,
  tr.category_id,
  tr.category as category_name,
  tc.name as category_display_name,
  tc.icon as category_icon,
  tc.description as category_description,
  tc.sort_order as category_sort_order,
  tc.required_rank
FROM training_resources tr
LEFT JOIN training_categories tc ON tr.category_id = tc.id
WHERE tr.is_active = TRUE AND (tc.is_active = TRUE OR tc.id IS NULL)
ORDER BY tc.sort_order NULLS LAST, tr.sort_order;

-- Grant access to the view
GRANT SELECT ON training_resources_with_category TO authenticated;
GRANT SELECT ON training_resources_with_category TO anon;
