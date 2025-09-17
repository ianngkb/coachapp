-- Consolidated Migration File
-- This file contains the complete schema for the application.
-- All previous migration files have been consolidated into this single file.

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;

-- 1. Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  full_name TEXT,
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

-- 2. Sports table
CREATE TABLE IF NOT EXISTS sports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT,
  category TEXT,
  equipment_required TEXT[],
  typical_duration_minutes INTEGER,
  min_participants INTEGER DEFAULT 1,
  max_participants INTEGER DEFAULT 1,
  is_popular BOOLEAN DEFAULT FALSE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Courts table
CREATE TABLE IF NOT EXISTS courts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  postal_code TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  phone_number TEXT,
  website_url TEXT,
  supported_sports TEXT[],
  amenities TEXT[],
  operating_hours JSONB,
  pricing_info JSONB,
  is_featured BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Coach Profiles table
CREATE TABLE IF NOT EXISTS coach_profiles (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  business_name TEXT,
  bio TEXT NOT NULL,
  years_experience INTEGER DEFAULT 0,
  certifications TEXT[],
  specializations TEXT[],
  languages_spoken TEXT[],
  rating_average NUMERIC(3, 2) DEFAULT 0.00,
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

-- 5. Coach Services table
CREATE TABLE IF NOT EXISTS coach_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

-- 6. Bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES users(id) ON DELETE CASCADE,
  coach_id UUID REFERENCES users(id) ON DELETE CASCADE,
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

-- 7. Reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  student_id UUID REFERENCES users(id) ON DELETE CASCADE,
  coach_id UUID REFERENCES users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  is_anonymous BOOLEAN DEFAULT FALSE,
  is_public BOOLEAN DEFAULT TRUE,
  coach_response TEXT,
  coach_response_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Cities table
CREATE TABLE IF NOT EXISTS cities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    state TEXT NOT NULL,
    district TEXT,
    is_popular BOOLEAN DEFAULT FALSE,
    display_order INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(name, state)
);

-- Functions and Triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE FUNCTION generate_booking_reference()
RETURNS TRIGGER AS $$
DECLARE
  ref_prefix TEXT := 'BKN';
  ref_timestamp TEXT;
  ref_random TEXT;
BEGIN
  ref_timestamp := to_char(NOW(), 'YYMMDDHH24MISS');
  ref_random := substr(md5(random()::text), 1, 6);
  NEW.booking_reference := ref_prefix || '-' || ref_timestamp || '-' || upper(ref_random);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_coach_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE coach_profiles
  SET
    rating_average = (
      SELECT AVG(rating) FROM reviews WHERE coach_id = NEW.coach_id AND is_public = TRUE
    ),
    rating_count = (
      SELECT COUNT(*) FROM reviews WHERE coach_id = NEW.coach_id AND is_public = TRUE
    )
  WHERE user_id = NEW.coach_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION increment_sessions_completed()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE coach_profiles
    SET total_sessions_completed = total_sessions_completed + 1
    WHERE user_id = NEW.coach_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_full_name()
RETURNS TRIGGER AS $$
BEGIN
  NEW.full_name = NEW.first_name || ' ' || NEW.last_name;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply Triggers
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_coach_profiles_updated_at ON coach_profiles;
CREATE TRIGGER update_coach_profiles_updated_at BEFORE UPDATE ON coach_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_coach_services_updated_at ON coach_services;
CREATE TRIGGER update_coach_services_updated_at BEFORE UPDATE ON coach_services FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_bookings_updated_at ON bookings;
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_reviews_updated_at ON reviews;
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS generate_booking_reference_trigger ON bookings;
CREATE TRIGGER generate_booking_reference_trigger BEFORE INSERT ON bookings FOR EACH ROW EXECUTE FUNCTION generate_booking_reference();

DROP TRIGGER IF EXISTS on_review_change_update_rating ON reviews;
CREATE TRIGGER on_review_change_update_rating AFTER INSERT OR UPDATE ON reviews FOR EACH ROW EXECUTE FUNCTION update_coach_rating();

DROP TRIGGER IF EXISTS on_booking_completed_increment_sessions ON bookings;
CREATE TRIGGER on_booking_completed_increment_sessions AFTER UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION increment_sessions_completed();

DROP TRIGGER IF EXISTS trigger_update_full_name ON users;
CREATE TRIGGER trigger_update_full_name BEFORE INSERT OR UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_full_name();


-- RLS Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE coach_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE sports ENABLE ROW LEVEL SECURITY;
ALTER TABLE courts ENABLE ROW LEVEL SECURITY;
ALTER TABLE coach_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE cities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to cities" ON public.cities FOR SELECT USING (true);
CREATE POLICY "Users can view their own data" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own data" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Public can view all coach profiles" ON coach_profiles FOR SELECT USING (true);
CREATE POLICY "Coaches can create their own profile" ON coach_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Coaches can update their own profile" ON coach_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Public can view all sports" ON sports FOR SELECT USING (true);
CREATE POLICY "Public can view all courts" ON courts FOR SELECT USING (true);
CREATE POLICY "Public can view all coach services" ON coach_services FOR SELECT USING (true);
CREATE POLICY "Coaches can create their own services" ON coach_services FOR INSERT WITH CHECK (auth.uid() = coach_id);
CREATE POLICY "Coaches can update their own services" ON coach_services FOR UPDATE USING (auth.uid() = coach_id);
CREATE POLICY "Coaches can delete their own services" ON coach_services FOR DELETE USING (auth.uid() = coach_id);
CREATE POLICY "Users can view their own bookings" ON bookings FOR SELECT USING (auth.uid() = student_id OR auth.uid() = coach_id);
CREATE POLICY "Students can create bookings" ON bookings FOR INSERT WITH CHECK (auth.uid() = student_id);
CREATE POLICY "Users can update their own bookings" ON bookings FOR UPDATE USING (auth.uid() = student_id OR auth.uid() = coach_id);
CREATE POLICY "Public can view public reviews" ON reviews FOR SELECT USING (is_public = true);
CREATE POLICY "Students can create reviews for their bookings" ON reviews FOR INSERT WITH CHECK (auth.uid() = student_id);
CREATE POLICY "Users can update their own reviews" ON reviews FOR UPDATE USING (auth.uid() = student_id);
CREATE POLICY "Coaches can respond to reviews" ON reviews FOR UPDATE USING (auth.uid() = coach_id);

-- Views
CREATE OR REPLACE VIEW coach_directory AS
SELECT
    u.id as user_id,
    u.first_name,
    u.last_name,
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
    cp.listing_status
FROM users u
JOIN coach_profiles cp ON u.id = cp.user_id
WHERE u.user_type = 'coach';

CREATE OR REPLACE VIEW student_profiles AS
SELECT
    u.id as user_id,
    u.first_name,
    u.last_name,
    u.email,
    u.phone_number,
    u.profile_image_url,
    u.location_city,
    u.location_state,
    u.preferred_language,
    u.created_at,
    u.updated_at
FROM users u
WHERE u.user_type = 'student';

CREATE OR REPLACE VIEW booking_summary AS
SELECT
    b.id,
    b.booking_reference,
    b.session_date,
    b.start_time,
    b.end_time,
    b.status,
    b.total_price_myr,
    student.full_name as student_name,
    student.phone_number as student_phone,
    coach.full_name as coach_name,
    cp.business_name as coach_business,
    cs.service_name,
    s.name as sport_name,
    c.name as court_name,
    c.address as court_address,
    b.created_at,
    b.updated_at
FROM bookings b
JOIN users student ON b.student_id = student.id
JOIN users coach ON b.coach_id = coach.id
JOIN coach_profiles cp ON b.coach_id = cp.user_id
JOIN coach_services cs ON b.service_id = cs.id
JOIN sports s ON cs.sport_id = s.id
JOIN courts c ON b.court_id = c.id;
