-- supabase/migrations/20250916000000_deprecate_full_name.sql

BEGIN;

-- This script handles the deprecation of the full_name column in the users table.
-- It migrates data to first_name and last_name before dropping the column.
-- It also handles dependencies on the full_name column by dropping and recreating views.

-- Drop the dependent view first.
DROP VIEW IF EXISTS booking_summary;

DO $$
BEGIN
  -- First, check if the full_name column exists to avoid errors on re-runs.
  IF EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='full_name') THEN

    -- Update users table to populate first_name and last_name from full_name
    -- where they are not already set.
    UPDATE users
    SET
      first_name = COALESCE(users.first_name, split_part(users.full_name, ' ', 1)),
      last_name = COALESCE(users.last_name, substring(users.full_name from position(' ' in users.full_name) + 1))
    WHERE users.full_name IS NOT NULL AND (users.first_name IS NULL OR users.last_name IS NULL);

    -- Finally, drop the redundant full_name column.
    ALTER TABLE users DROP COLUMN full_name;

  END IF;
END $$;

-- Recreate the booking_summary view without the full_name column.
-- Note: You may need to adjust this view definition if other related tables change.
CREATE OR REPLACE VIEW booking_summary AS
SELECT
    b.id,
    b.booking_reference,
    b.session_date,
    b.start_time,
    b.end_time,
    b.status,
    b.total_price_myr,
    (u_student.first_name || ' ' || u_student.last_name) as student_name,
    u_student.phone_number as student_phone,
    (u_coach.first_name || ' ' || u_coach.last_name) as coach_name,
    cp.business_name as coach_business,
    cs.service_name,
    s.name as sport_name,
    c.name as court_name,
    c.address as court_address,
    b.created_at,
    b.updated_at
FROM bookings b
LEFT JOIN users u_student ON b.student_id = u_student.id
LEFT JOIN users u_coach ON b.coach_id = u_coach.id
LEFT JOIN coach_profiles cp ON b.coach_id = cp.user_id
LEFT JOIN coach_services cs ON b.service_id = cs.id
LEFT JOIN sports s ON cs.sport_id = s.id
LEFT JOIN courts c ON b.court_id = c.id;


COMMIT;
