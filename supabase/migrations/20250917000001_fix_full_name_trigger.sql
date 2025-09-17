-- Fix the problematic full_name trigger that's causing INSERT failures
-- This trigger was created in the consolidated migration but references a column that was later dropped

BEGIN;

-- Drop the problematic trigger and function
DROP TRIGGER IF EXISTS trigger_update_full_name ON users;
DROP FUNCTION IF EXISTS update_full_name();

-- Note: The full_name column was removed in migration 20250916000000_deprecate_full_name.sql
-- Views now compute full_name as (first_name || ' ' || last_name) dynamically
-- No trigger is needed for this computed field

COMMIT;