# Proposed Database Schema Improvements

Based on a review of the application codebase and the initial schema from `database-new.md`, here are some suggested improvements to better align the database with application features and improve data integrity.

## Summary of Key Changes

1.  **`users` table:** Replaced `full_name` with `first_name` and `last_name`. Replaced location text fields with a foreign key to a new `cities` table.
2.  **`coach_profiles` table:**
    *   Removed `languages_spoken` in favor of a new `coach_languages` link table.
    *   Added `short_bio` and `tagline` for directory/card views.
    *   Added `base_hourly_rate` for a quick price indication on listings.
3.  **New `cities` table:** A master table to manage supported cities and states, ensuring data consistency.
4.  **New `languages` table:** A master table for supported languages.
5.  **New many-to-many link tables:**
    *   `coach_sports`: To link coaches to the sports they teach.
    *   `coach_preferred_courts`: For coaches to list their preferred venues.
    *   `coach_languages`: To link coaches to the languages they speak.
6.  **Updated `coach_directory` view:** Modified to incorporate these new relationships and fields for a richer data output.

---

## Revised Schema

### 1. Users (Authentication & Basic Profiles)
```sql
-- Changed full_name to first_name and last_name
-- Changed location fields to a city_id foreign key
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone_number TEXT,
  user_type TEXT CHECK (user_type IN ('student', 'coach')) NOT NULL,
  profile_image_url TEXT,
  city_id UUID REFERENCES cities(id),
  preferred_language TEXT DEFAULT 'en' CHECK (preferred_language IN ('en', 'ms', 'zh')),
  is_active BOOLEAN DEFAULT TRUE,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_active_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 2. Coach Profiles
```sql
-- Removed languages_spoken
-- Added tagline, short_bio, and base_hourly_rate
CREATE TABLE coach_profiles (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  business_name TEXT,
  tagline TEXT, -- New: For search results/previews
  short_bio TEXT, -- New: A shorter version of the bio for cards
  bio TEXT NOT NULL,
  years_experience INTEGER DEFAULT 0,
  certifications TEXT[] DEFAULT '{}',
  specializations TEXT[] DEFAULT '{}',
  base_hourly_rate DECIMAL(8,2), -- New: For display on listings
  rating_average DECIMAL(3,2) DEFAULT 0.00,
  rating_count INTEGER DEFAULT 0,
  total_sessions_completed INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT FALSE,
  is_available BOOLEAN DEFAULT TRUE,
  listing_status TEXT DEFAULT 'active' CHECK (listing_status IN ('active', 'inactive', 'suspended')),
  google_calendar_connected BOOLEAN DEFAULT FALSE,
  google_calendar_sync_token TEXT,
  whatsapp_number TEXT,
  instagram_handle TEXT,
  website_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 3. Sports (Master Data)
```sql
-- No changes, schema is good
CREATE TABLE sports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT,
  category TEXT,
  equipment_required TEXT[] DEFAULT '{}',
  typical_duration_minutes INTEGER,
  min_participants INTEGER DEFAULT 1,
  max_participants INTEGER DEFAULT 10,
  is_popular BOOLEAN DEFAULT FALSE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 4. Cities (New Table)
```sql
-- New table to manage locations
CREATE TABLE cities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  state TEXT NOT NULL CHECK (state IN ('Kuala Lumpur', 'Selangor')),
  country TEXT DEFAULT 'Malaysia' NOT NULL,
  is_popular BOOLEAN DEFAULT FALSE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(name, state)
);
```

### 5. Courts/Venues
```sql
-- Replaced city/state text with a city_id foreign key
CREATE TABLE courts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  address TEXT NOT NULL,
  city_id UUID REFERENCES cities(id) NOT NULL,
  postal_code TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  phone_number TEXT,
  website_url TEXT,
  supported_sports TEXT[] DEFAULT '{}', -- Consider a link table `court_sports` in the future
  amenities TEXT[] DEFAULT '{}',
  operating_hours JSONB,
  pricing_info JSONB,
  is_featured BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 6. Languages (New Table)
```sql
-- New master table for languages
CREATE TABLE languages (
  code TEXT PRIMARY KEY, -- e.g., 'en', 'ms', 'zh'
  name TEXT NOT NULL UNIQUE -- e.g., 'English', 'Bahasa Melayu', 'Chinese'
);
```

### 7. Link Tables (New)
```sql
-- Links coaches to the sports they teach (many-to-many)
CREATE TABLE coach_sports (
  coach_id UUID REFERENCES users(id) ON DELETE CASCADE,
  sport_id UUID REFERENCES sports(id) ON DELETE CASCADE,
  PRIMARY KEY (coach_id, sport_id)
);

-- Links coaches to their preferred courts (many-to-many)
CREATE TABLE coach_preferred_courts (
  coach_id UUID REFERENCES users(id) ON DELETE CASCADE,
  court_id UUID REFERENCES courts(id) ON DELETE CASCADE,
  PRIMARY KEY (coach_id, court_id)
);

-- Links coaches to languages they speak (many-to-many)
CREATE TABLE coach_languages (
  coach_id UUID REFERENCES users(id) ON DELETE CASCADE,
  language_code TEXT REFERENCES languages(code) ON DELETE CASCADE,
  PRIMARY KEY (coach_id, language_code)
);
```

### 8. Coach Services, Bookings, Reviews
The schemas for `coach_services`, `bookings`, and `reviews` from `database-new.md` are solid and do not require changes based on the current codebase.

---

## Updated Views

### Coach Directory (Revised)
This view is updated to join the new tables, providing a much richer dataset for the coach listing page.

```sql
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
  -- Aggregate sports into a JSON array
  (
    SELECT jsonb_agg(jsonb_build_object('id', s.id, 'name', s.name))
    FROM coach_sports cs
    JOIN sports s ON s.id = cs.sport_id
    WHERE cs.coach_id = u.id
  ) as sports,
  -- Aggregate languages into a JSON array
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
```

These changes should provide a more robust and scalable foundation for your application. Let me know if you have any questions!
