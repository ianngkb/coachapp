-- Coach Booking Marketplace - Core Database Schema Migration
-- Version: 1.0.0
-- Date: 2024-09-14
-- Region: Singapore (GMT+8 timezone)

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis"; -- For future location features

-- Set timezone to Malaysian time
SET timezone = 'Asia/Kuala_Lumpur';

-- ============================================================================
-- 1. EXTENDED USER MANAGEMENT TABLES
-- ============================================================================

-- Extended user profiles table (extends Supabase auth.users)
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    phone_number TEXT,
    user_type TEXT NOT NULL CHECK (user_type IN ('student', 'coach')),
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

-- Student-specific profiles
CREATE TABLE public.student_profiles (
    user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
    sports_interests TEXT[] DEFAULT '{}',
    preferred_locations TEXT[] DEFAULT '{}',
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    date_of_birth DATE,
    skill_level TEXT CHECK (skill_level IN ('beginner', 'intermediate', 'advanced')),
    bio TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Coach-specific business profiles
CREATE TABLE public.coach_profiles (
    user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
    business_name TEXT,
    bio TEXT NOT NULL,
    years_experience INTEGER DEFAULT 0,
    certifications TEXT[] DEFAULT '{}',
    specializations TEXT[] DEFAULT '{}',
    languages_spoken TEXT[] DEFAULT '{"en"}',
    rating_average DECIMAL(3,2) DEFAULT 0.00 CHECK (rating_average >= 0 AND rating_average <= 5),
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

-- ============================================================================
-- 2. SPORTS & LOCATION MANAGEMENT
-- ============================================================================

-- Master sports table
CREATE TABLE public.sports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    category TEXT NOT NULL,
    is_popular BOOLEAN DEFAULT FALSE,
    icon_name TEXT,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Malaysian courts and venues
CREATE TABLE public.courts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL CHECK (state IN ('Kuala Lumpur', 'Selangor')),
    postal_code TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    sports_available TEXT[] NOT NULL DEFAULT '{}',
    facilities TEXT[] DEFAULT '{}', -- parking, shower, changing_room, equipment_rental
    contact_phone TEXT,
    operating_hours JSONB, -- {"monday": {"open": "06:00", "close": "22:00"}, ...}
    pricing_info JSONB, -- {"hourly_rate": 50.00, "currency": "MYR"}
    is_public BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 3. PERFORMANCE INDEXES FOR CORE TABLES
-- ============================================================================

-- Users table indexes
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_type ON public.users(user_type);
CREATE INDEX idx_users_location ON public.users(location_state, location_city);
CREATE INDEX idx_users_active ON public.users(is_active, is_verified);

-- Student profiles indexes
CREATE INDEX idx_student_profiles_sports ON public.student_profiles USING GIN(sports_interests);

-- Coach profiles indexes (critical for directory search)
CREATE INDEX idx_coach_profiles_rating ON public.coach_profiles(rating_average DESC, rating_count DESC);
CREATE INDEX idx_coach_profiles_status ON public.coach_profiles(listing_status, is_available);
CREATE INDEX idx_coach_profiles_specializations ON public.coach_profiles USING GIN(specializations);
CREATE INDEX idx_coach_profiles_featured ON public.coach_profiles(is_featured, rating_average DESC);

-- Sports indexes
CREATE INDEX idx_sports_popular ON public.sports(is_popular, display_order);

-- Courts indexes
CREATE INDEX idx_courts_location ON public.courts(state, city);
CREATE INDEX idx_courts_sports ON public.courts USING GIN(sports_available);
CREATE INDEX idx_courts_active ON public.courts(is_active, is_public);

-- ============================================================================
-- 4. INSERT MASTER DATA
-- ============================================================================

-- Insert popular sports for Malaysian market
INSERT INTO public.sports (name, category, is_popular, display_order) VALUES
('Tennis', 'Racket Sports', TRUE, 1),
('Badminton', 'Racket Sports', TRUE, 2),
('Swimming', 'Water Sports', TRUE, 3),
('Football', 'Team Sports', TRUE, 4),
('Basketball', 'Team Sports', TRUE, 5),
('Table Tennis', 'Racket Sports', TRUE, 6),
('Squash', 'Racket Sports', FALSE, 7),
('Golf', 'Individual Sports', FALSE, 8),
('Martial Arts', 'Combat Sports', FALSE, 9),
('Yoga', 'Fitness', FALSE, 10);

-- Insert sample Malaysian courts
INSERT INTO public.courts (name, address, city, state, sports_available, facilities, contact_phone, is_active) VALUES
('KLCC Tennis Courts', 'Kuala Lumpur City Centre, KL', 'Kuala Lumpur', 'Kuala Lumpur',
 ARRAY['Tennis', 'Badminton'], ARRAY['parking', 'shower', 'changing_room'], '+60123456789', TRUE),
('Shah Alam Sports Complex', '40000 Shah Alam, Selangor', 'Shah Alam', 'Selangor',
 ARRAY['Basketball', 'Badminton', 'Table Tennis'], ARRAY['parking', 'shower', 'equipment_rental'], '+60198765432', TRUE),
('Bukit Jalil National Sports Complex', 'Bukit Jalil, KL', 'Kuala Lumpur', 'Kuala Lumpur',
 ARRAY['Swimming', 'Football', 'Tennis'], ARRAY['parking', 'shower', 'changing_room'], '+60387654321', TRUE),
('PJ Sports Centre', '46150 Petaling Jaya, Selangor', 'Petaling Jaya', 'Selangor',
 ARRAY['Squash', 'Badminton', 'Table Tennis'], ARRAY['parking', 'equipment_rental'], '+60376543210', TRUE);

-- ============================================================================
-- 5. UPDATE TIMESTAMPS TRIGGER FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply timestamp triggers to tables with updated_at columns
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_student_profiles_updated_at
    BEFORE UPDATE ON public.student_profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_coach_profiles_updated_at
    BEFORE UPDATE ON public.coach_profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_courts_updated_at
    BEFORE UPDATE ON public.courts
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- 6. ROW LEVEL SECURITY (RLS) POLICIES - CORE TABLES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coach_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courts ENABLE ROW LEVEL SECURITY;

-- Users table policies
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Anyone can view active coach profiles" ON public.users
    FOR SELECT USING (
        user_type = 'coach'
        AND is_active = TRUE
        AND id IN (
            SELECT user_id FROM public.coach_profiles
            WHERE listing_status = 'active' AND is_available = TRUE
        )
    );

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Student profiles policies
CREATE POLICY "Students can manage own profile" ON public.student_profiles
    FOR ALL USING (auth.uid() = user_id);

-- Coach profiles policies
CREATE POLICY "Anyone can view active coach profiles" ON public.coach_profiles
    FOR SELECT USING (listing_status = 'active' AND is_available = TRUE);

CREATE POLICY "Coaches can manage own profile" ON public.coach_profiles
    FOR ALL USING (auth.uid() = user_id);

-- Sports table policies (public read-only)
CREATE POLICY "Anyone can view sports" ON public.sports
    FOR SELECT USING (true);

-- Courts table policies (public read-only)
CREATE POLICY "Anyone can view active courts" ON public.courts
    FOR SELECT USING (is_active = TRUE);

-- ============================================================================
-- 7. GRANT PERMISSIONS
-- ============================================================================

-- Grant appropriate permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON public.sports TO anon, authenticated;
GRANT SELECT ON public.courts TO anon, authenticated;
GRANT SELECT ON public.users TO anon, authenticated;
GRANT SELECT ON public.coach_profiles TO anon, authenticated;
GRANT ALL ON public.users TO authenticated;
GRANT ALL ON public.student_profiles TO authenticated;
GRANT ALL ON public.coach_profiles TO authenticated;

GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- ============================================================================
-- MIGRATION COMPLETED: CORE TABLES
-- ============================================================================

COMMENT ON TABLE public.users IS 'Extended user profiles for coach booking marketplace';
COMMENT ON TABLE public.student_profiles IS 'Student-specific profile information';
COMMENT ON TABLE public.coach_profiles IS 'Coach business profiles with ratings and availability';
COMMENT ON TABLE public.sports IS 'Master sports catalog for Malaysian market';
COMMENT ON TABLE public.courts IS 'Malaysian courts and venues database';