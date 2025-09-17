-- supabase/migrations/20250917000000_apply_schema_improvements.sql

BEGIN;

-- 1. Create Languages Table
CREATE TABLE languages (
  code TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE
);

-- Populate with some initial languages
INSERT INTO languages (code, name) VALUES
('en', 'English'),
('ms', 'Bahasa Melayu'),
('zh', 'Chinese');

-- 2. Create New Link Tables
CREATE TABLE coach_sports (
  coach_id UUID REFERENCES users(id) ON DELETE CASCADE,
  sport_id UUID REFERENCES sports(id) ON DELETE CASCADE,
  PRIMARY KEY (coach_id, sport_id)
);

CREATE TABLE coach_preferred_courts (
  coach_id UUID REFERENCES users(id) ON DELETE CASCADE,
  court_id UUID REFERENCES courts(id) ON DELETE CASCADE,
  PRIMARY KEY (coach_id, court_id)
);

CREATE TABLE coach_languages (
  coach_id UUID REFERENCES users(id) ON DELETE CASCADE,
  language_code TEXT REFERENCES languages(code) ON DELETE CASCADE,
  PRIMARY KEY (coach_id, language_code)
);

-- 3. Alter Cities Table
-- Add country column and drop district
ALTER TABLE cities ADD COLUMN country TEXT DEFAULT 'Malaysia' NOT NULL;
ALTER TABLE cities DROP COLUMN IF EXISTS district;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'cities_name_state_key'
  ) THEN
    ALTER TABLE cities ADD CONSTRAINT cities_name_state_key UNIQUE (name, state);
  END IF;
END;
$$;

-- 4. Alter Coach Profiles Table
-- Add new fields and drop old languages_spoken array
ALTER TABLE coach_profiles ADD COLUMN tagline TEXT;
ALTER TABLE coach_profiles ADD COLUMN short_bio TEXT;
ALTER TABLE coach_profiles ADD COLUMN base_hourly_rate DECIMAL(8,2);
ALTER TABLE coach_profiles DROP COLUMN IF EXISTS languages_spoken;

-- Drop dependent views before altering the users table
DROP VIEW IF EXISTS coach_directory;
DROP VIEW IF EXISTS student_profiles;

-- 5. Alter Users Table
-- Add city_id and migrate data before dropping old columns
ALTER TABLE users ADD COLUMN city_id UUID REFERENCES cities(id);

-- Data migration: Populate city_id from old text columns
UPDATE users u SET city_id = (
  SELECT id FROM cities c
  WHERE c.name = u.location_city AND c.state = u.location_state
  LIMIT 1
);

-- Drop old location columns
ALTER TABLE users DROP COLUMN IF EXISTS location_city;
ALTER TABLE users DROP COLUMN IF EXISTS location_state;

-- 6. Alter Courts Table
-- Add city_id and migrate data before dropping old columns
ALTER TABLE courts ADD COLUMN city_id UUID REFERENCES cities(id);

-- Data migration: Populate city_id from old text columns
UPDATE courts v SET city_id = (
  SELECT id FROM cities c
  WHERE c.name = v.city AND c.state = v.state
  LIMIT 1
);

-- Now that data is migrated, add NOT NULL constraint
ALTER TABLE courts ALTER COLUMN city_id SET NOT NULL;

-- Drop old location columns
ALTER TABLE courts DROP COLUMN IF EXISTS city;
ALTER TABLE courts DROP COLUMN IF EXISTS state;

-- 7. Recreate Views
-- Recreate the student_profiles view
CREATE OR REPLACE VIEW student_profiles AS
SELECT
    u.id as user_id,
    u.first_name,
    u.last_name,
    (u.first_name || ' ' || u.last_name) as full_name,
    u.email,
    u.phone_number,
    u.profile_image_url,
    c.name as location_city,
    c.state as location_state,
    u.preferred_language,
    u.created_at,
    u.updated_at
FROM users u
LEFT JOIN cities c ON u.city_id = c.id;

-- Recreate the coach_directory view
CREATE OR REPLACE VIEW coach_directory AS
SELECT
  u.id as user_id,
  u.first_name,
  u.last_name,
  u.profile_image_url,
  city.name as location_city,
  city.state as location_state,
  cp.tagline,
  cp.short_bio,
  cp.years_experience,
  cp.rating_average,
  cp.rating_count,
  cp.total_sessions_completed,
  cp.base_hourly_rate,
  cp.is_available,
  cp.listing_status,
  (
    SELECT jsonb_agg(jsonb_build_object('id', s.id, 'name', s.name))
    FROM coach_sports cs
    JOIN sports s ON s.id = cs.sport_id
    WHERE cs.coach_id = u.id
  ) as sports,
  (
    SELECT jsonb_agg(jsonb_build_object('code', l.code, 'name', l.name))
    FROM coach_languages cl
    JOIN languages l ON l.code = cl.language_code
    WHERE cl.coach_id = u.id
  ) as languages
FROM users u
JOIN coach_profiles cp ON u.id = cp.user_id
LEFT JOIN cities city ON u.city_id = city.id
WHERE u.user_type = 'coach'
AND cp.listing_status = 'active';

COMMIT;
