-- Performance optimization indexes for 5K users
-- Created: 2026-01-23
-- Purpose: Add composite indexes for frequently queried columns to improve query performance

-- Composite indexes for user-scoped queries
-- These improve lookups when filtering by user_id and a second column
CREATE INDEX IF NOT EXISTS idx_user_progress_user_resource 
  ON user_progress(user_id, resource_id);

CREATE INDEX IF NOT EXISTS idx_user_bookmarks_user_resource 
  ON user_bookmarks(user_id, resource_id);

CREATE INDEX IF NOT EXISTS idx_favorite_recipes_user_recipe 
  ON favorite_recipes(user_id, recipe_id);

-- Client filtering and sorting
-- Improves queries that filter by user_id and status, then sort by start_date
CREATE INDEX IF NOT EXISTS idx_clients_user_status_date 
  ON clients(user_id, status, start_date);

-- Prospect overdue queries
-- Improves queries that check for overdue prospects by next_action date
CREATE INDEX IF NOT EXISTS idx_prospects_user_action_status 
  ON prospects(user_id, next_action, status);

-- Sponsor/downline queries
-- Partial index for sponsor relationship lookups (only indexes rows with optavia_id)
CREATE INDEX IF NOT EXISTS idx_profiles_optavia_parent 
  ON profiles(optavia_id, parent_optavia_id) 
  WHERE optavia_id IS NOT NULL;

-- Training resource completions
-- Improves existence checks for completed resources
CREATE INDEX IF NOT EXISTS idx_training_completions_user_resource 
  ON training_resource_completions(user_id, resource_id);

-- Add comments for documentation
COMMENT ON INDEX idx_user_progress_user_resource IS 'Composite index for user progress lookups';
COMMENT ON INDEX idx_user_bookmarks_user_resource IS 'Composite index for user bookmark lookups';
COMMENT ON INDEX idx_favorite_recipes_user_recipe IS 'Composite index for favorite recipe lookups';
COMMENT ON INDEX idx_clients_user_status_date IS 'Composite index for client filtering and sorting';
COMMENT ON INDEX idx_prospects_user_action_status IS 'Composite index for prospect overdue queries';
COMMENT ON INDEX idx_profiles_optavia_parent IS 'Partial index for sponsor/downline relationships';
COMMENT ON INDEX idx_training_completions_user_resource IS 'Composite index for training completion checks';
