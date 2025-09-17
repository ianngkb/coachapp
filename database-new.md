# Minimal Database Architecture
## Current Build Essential Tables Only

Based on the current application state, here are the essential database tables needed for the current build:

## Core Tables

### 1. Users (Authentication & Basic Profiles)
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  phone_number TEXT,
  user_type TEXT CHECK (user_type IN ('student', 'coach')) NOT NULL,
  profile_image_url TEXT,
  location_state TEXT CHECK (location_state IN ('Kuala Lumpur', 'Selangor')),
  location_city TEXT,
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
CREATE TABLE coach_profiles (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  business_name TEXT,
  bio TEXT NOT NULL,
  years_experience INTEGER DEFAULT 0,
  certifications TEXT[] DEFAULT '{}',
  specializations TEXT[] DEFAULT '{}',
  languages_spoken TEXT[] DEFAULT '{}',
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

### 4. Courts/Venues
```sql
CREATE TABLE courts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  postal_code TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  phone_number TEXT,
  website_url TEXT,
  supported_sports TEXT[] DEFAULT '{}',
  amenities TEXT[] DEFAULT '{}',
  operating_hours JSONB,
  pricing_info JSONB,
  is_featured BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 5. Coach Services
```sql
CREATE TABLE coach_services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  coach_id UUID REFERENCES users(id) ON DELETE CASCADE,
  sport_id UUID REFERENCES sports(id),
  service_name TEXT NOT NULL,
  description TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL,
  price_myr DECIMAL(8,2) NOT NULL,
  max_participants INTEGER DEFAULT 1,
  skill_levels TEXT[] DEFAULT '{}',
  included_equipment TEXT[] DEFAULT '{}',
  location_types TEXT[] DEFAULT '{}',
  buffer_time_before INTEGER DEFAULT 0,
  buffer_time_after INTEGER DEFAULT 0,
  min_advance_booking_hours INTEGER DEFAULT 2,
  max_advance_booking_days INTEGER DEFAULT 30,
  cancellation_policy TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 6. Bookings
```sql
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES users(id),
  coach_id UUID REFERENCES users(id),
  service_id UUID REFERENCES coach_services(id),
  court_id UUID REFERENCES courts(id),
  session_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  duration_minutes INTEGER NOT NULL,
  service_price_myr DECIMAL(8,2) NOT NULL,
  travel_fee_myr DECIMAL(8,2) DEFAULT 0.00,
  total_price_myr DECIMAL(8,2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  booking_reference TEXT UNIQUE,
  student_phone TEXT,
  student_notes TEXT,
  coach_notes TEXT,
  admin_notes TEXT,
  booked_at TIMESTAMPTZ DEFAULT NOW(),
  confirmed_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  cancellation_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 7. Reviews
```sql
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID UNIQUE REFERENCES bookings(id),
  student_id UUID REFERENCES users(id),
  coach_id UUID REFERENCES users(id),
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  review_text TEXT,
  is_anonymous BOOLEAN DEFAULT FALSE,
  is_public BOOLEAN DEFAULT TRUE,
  coach_response TEXT,
  coach_response_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Essential Functions

### Booking Conflict Prevention
```sql
CREATE OR REPLACE FUNCTION validate_booking_slot(
  p_coach_id UUID,
  p_session_date DATE,
  p_start_time TIME,
  p_end_time TIME,
  p_exclude_booking_id UUID DEFAULT NULL
) RETURNS BOOLEAN AS $$
BEGIN
  RETURN NOT EXISTS (
    SELECT 1 FROM bookings
    WHERE coach_id = p_coach_id
    AND session_date = p_session_date
    AND status NOT IN ('cancelled', 'completed')
    AND (p_exclude_booking_id IS NULL OR id != p_exclude_booking_id)
    AND (
      (start_time <= p_start_time AND end_time > p_start_time) OR
      (start_time < p_end_time AND end_time >= p_end_time) OR
      (start_time >= p_start_time AND end_time <= p_end_time)
    )
  );
END;
$$ LANGUAGE plpgsql;
```

### Coach Rating Statistics
```sql
CREATE OR REPLACE FUNCTION get_coach_rating_stats(p_coach_id UUID)
RETURNS TABLE(
  total_reviews BIGINT,
  average_rating DECIMAL(3,2),
  rating_distribution JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT as total_reviews,
    COALESCE(AVG(rating), 0)::DECIMAL(3,2) as average_rating,
    COALESCE(
      jsonb_object_agg(
        rating::TEXT,
        rating_count
      ),
      '{}'::jsonb
    ) as rating_distribution
  FROM (
    SELECT
      rating,
      COUNT(*) as rating_count
    FROM reviews
    WHERE coach_id = p_coach_id
    AND is_public = TRUE
    GROUP BY rating
  ) subq;
END;
$$ LANGUAGE plpgsql;
```

## Essential Views

### Coach Directory
```sql
CREATE OR REPLACE VIEW coach_directory AS
SELECT
  u.id as user_id,
  u.full_name,
  u.profile_image_url,
  u.location_city,
  u.location_state,
  cp.bio,
  cp.specializations,
  cp.years_experience,
  cp.rating_average,
  cp.rating_count,
  cp.total_sessions_completed,
  cp.is_available,
  cp.listing_status,
  COALESCE(MIN(cs.price_myr), 0) as hourly_rate_myr
FROM users u
JOIN coach_profiles cp ON u.id = cp.user_id
LEFT JOIN coach_services cs ON u.id = cs.coach_id AND cs.is_active = TRUE
WHERE u.user_type = 'coach'
AND cp.listing_status = 'active'
GROUP BY u.id, u.full_name, u.profile_image_url, u.location_city, u.location_state,
         cp.bio, cp.specializations, cp.years_experience, cp.rating_average,
         cp.rating_count, cp.total_sessions_completed, cp.is_available, cp.listing_status;
```

## Essential Indexes

```sql
-- Booking conflict prevention
CREATE UNIQUE INDEX idx_bookings_coach_time_unique
ON bookings(coach_id, session_date, start_time, end_time)
WHERE status NOT IN ('cancelled');

-- Performance indexes
CREATE INDEX idx_bookings_coach_status ON bookings(coach_id, status);
CREATE INDEX idx_bookings_student_status ON bookings(student_id, status);
CREATE INDEX idx_coach_services_coach_active ON coach_services(coach_id, is_active);
CREATE INDEX idx_reviews_coach_public ON reviews(coach_id, is_public);
CREATE INDEX idx_users_type_active ON users(user_type, is_active);
```

## Row Level Security (RLS)

```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE coach_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE coach_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Users can see their own data
CREATE POLICY users_own_data ON users FOR ALL TO authenticated
USING (id = auth.uid());

-- Coach profiles are publicly viewable, but only coaches can edit their own
CREATE POLICY coach_profiles_view ON coach_profiles FOR SELECT TO anon, authenticated
USING (true);

CREATE POLICY coach_profiles_edit ON coach_profiles FOR ALL TO authenticated
USING (user_id = auth.uid());

-- Coach services are publicly viewable
CREATE POLICY coach_services_view ON coach_services FOR SELECT TO anon, authenticated
USING (is_active = true);

CREATE POLICY coach_services_edit ON coach_services FOR ALL TO authenticated
USING (coach_id = auth.uid());

-- Bookings - users can only see their own
CREATE POLICY bookings_own_data ON bookings FOR ALL TO authenticated
USING (student_id = auth.uid() OR coach_id = auth.uid());

-- Reviews are publicly viewable if public
CREATE POLICY reviews_view ON reviews FOR SELECT TO anon, authenticated
USING (is_public = true);

CREATE POLICY reviews_edit ON reviews FOR ALL TO authenticated
USING (student_id = auth.uid() OR coach_id = auth.uid());

-- Sports and courts are publicly readable
ALTER TABLE sports ENABLE ROW LEVEL SECURITY;
ALTER TABLE courts ENABLE ROW LEVEL SECURITY;

CREATE POLICY sports_public_read ON sports FOR SELECT TO anon, authenticated
USING (true);

CREATE POLICY courts_public_read ON courts FOR SELECT TO anon, authenticated
USING (is_active = true);
```

This minimal schema contains only the essential tables needed for the current build functionality without the advanced features that aren't yet implemented.