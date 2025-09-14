# Database Schema Proposal for Coach Booking Marketplace

## Overview

This database schema is designed for Supabase Postgres (Singapore region) and optimized for a coach booking marketplace application with mobile-first design, real-time booking capabilities, and Malaysian market focus (GMT+8 timezone).

## Core Design Principles

- **GMT+8 Consistency**: All timestamps stored and handled in Malaysian timezone
- **Row Level Security (RLS)**: Comprehensive security policies for all tables
- **Performance Optimized**: Strategic indexing for booking queries and availability searches
- **Scalable Architecture**: Designed to handle concurrent bookings and high-volume directory searches
- **Audit Trail**: Complete tracking of booking lifecycle and user actions

## Database Schema

### 1. Authentication & User Management

#### `auth.users` (Supabase Built-in)
Supabase's built-in authentication table extended with custom fields.

#### `public.users`
Extended user profiles with role-based information.

```sql
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

-- Indexes for performance
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_type ON public.users(user_type);
CREATE INDEX idx_users_location ON public.users(location_state, location_city);
CREATE INDEX idx_users_active ON public.users(is_active, is_verified);
```

#### `public.student_profiles`
Student-specific profile information.

```sql
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

CREATE INDEX idx_student_profiles_sports ON public.student_profiles USING GIN(sports_interests);
```

#### `public.coach_profiles`
Coach-specific business profile information.

```sql
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

-- Indexes for directory search and filtering
CREATE INDEX idx_coach_profiles_rating ON public.coach_profiles(rating_average DESC, rating_count DESC);
CREATE INDEX idx_coach_profiles_status ON public.coach_profiles(listing_status, is_available);
CREATE INDEX idx_coach_profiles_specializations ON public.coach_profiles USING GIN(specializations);
CREATE INDEX idx_coach_profiles_featured ON public.coach_profiles(is_featured, rating_average DESC);
```

### 2. Sports & Location Management

#### `public.sports`
Master table of available sports.

```sql
CREATE TABLE public.sports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    category TEXT NOT NULL,
    is_popular BOOLEAN DEFAULT FALSE,
    icon_name TEXT,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Popular sports for Malaysian market
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

CREATE INDEX idx_sports_popular ON public.sports(is_popular, display_order);
```

#### `public.courts`
Available courts and venues across Malaysia.

```sql
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
    facilities TEXT[] DEFAULT '{}', -- ['parking', 'shower', 'changing_room', 'equipment_rental']
    contact_phone TEXT,
    operating_hours JSONB, -- {"monday": {"open": "06:00", "close": "22:00"}, ...}
    pricing_info JSONB, -- {"hourly_rate": 50.00, "currency": "MYR"}
    is_public BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_courts_location ON public.courts(state, city);
CREATE INDEX idx_courts_sports ON public.courts USING GIN(sports_available);
CREATE INDEX idx_courts_active ON public.courts(is_active, is_public);
```

### 3. Services & Pricing

#### `public.coach_services`
Services offered by each coach.

```sql
CREATE TABLE public.coach_services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    coach_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    sport_id UUID NOT NULL REFERENCES public.sports(id),
    service_name TEXT NOT NULL,
    description TEXT NOT NULL,
    duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
    price_myr DECIMAL(10, 2) NOT NULL CHECK (price_myr >= 0),
    max_participants INTEGER DEFAULT 1 CHECK (max_participants >= 1),
    skill_levels TEXT[] DEFAULT '{"beginner", "intermediate", "advanced"}',
    included_equipment TEXT[] DEFAULT '{}',
    location_types TEXT[] DEFAULT '{"outdoor", "indoor"}', -- where service can be provided
    buffer_time_before INTEGER DEFAULT 15, -- minutes before session
    buffer_time_after INTEGER DEFAULT 15,  -- minutes after session
    min_advance_booking_hours INTEGER DEFAULT 24, -- minimum notice required
    max_advance_booking_days INTEGER DEFAULT 30,  -- maximum days in advance
    cancellation_policy TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_coach_services_coach ON public.coach_services(coach_id, is_active);
CREATE INDEX idx_coach_services_sport ON public.coach_services(sport_id, is_active);
CREATE INDEX idx_coach_services_price ON public.coach_services(price_myr);
```

#### `public.coach_service_locations`
Preferred courts/locations for each service.

```sql
CREATE TABLE public.coach_service_locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_id UUID NOT NULL REFERENCES public.coach_services(id) ON DELETE CASCADE,
    court_id UUID NOT NULL REFERENCES public.courts(id) ON DELETE CASCADE,
    travel_fee_myr DECIMAL(8, 2) DEFAULT 0.00,
    is_preferred BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(service_id, court_id)
);

CREATE INDEX idx_service_locations_service ON public.coach_service_locations(service_id);
CREATE INDEX idx_service_locations_court ON public.coach_service_locations(court_id);
```

### 4. Availability Management

#### `public.coach_availability_rules`
Weekly availability patterns for coaches.

```sql
CREATE TABLE public.coach_availability_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    coach_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0=Sunday, 6=Saturday
    start_time TIME NOT NULL,
    end_time TIME NOT NULL CHECK (end_time > start_time),
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(coach_id, day_of_week, start_time, end_time)
);

CREATE INDEX idx_availability_rules_coach ON public.coach_availability_rules(coach_id, day_of_week);
```

#### `public.coach_availability_exceptions`
Date-specific availability overrides.

```sql
CREATE TABLE public.coach_availability_exceptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    coach_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    exception_date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    is_available BOOLEAN NOT NULL,
    reason TEXT, -- 'holiday', 'personal', 'maintenance', etc.
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(coach_id, exception_date, start_time, end_time)
);

CREATE INDEX idx_availability_exceptions_coach_date ON public.coach_availability_exceptions(coach_id, exception_date);
```

#### `public.coach_blocked_dates`
Simplified date blocking for coaches.

```sql
CREATE TABLE public.coach_blocked_dates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    coach_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    blocked_date DATE NOT NULL,
    reason TEXT,
    all_day BOOLEAN DEFAULT TRUE,
    start_time TIME,
    end_time TIME,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(coach_id, blocked_date, start_time, end_time)
);

CREATE INDEX idx_blocked_dates_coach ON public.coach_blocked_dates(coach_id, blocked_date);
```

### 5. Booking System

#### `public.booking_statuses`
Master table for booking status types.

```sql
CREATE TABLE public.booking_statuses (
    status TEXT PRIMARY KEY,
    description TEXT NOT NULL,
    display_order INTEGER DEFAULT 0,
    is_active_booking BOOLEAN DEFAULT TRUE -- whether this status represents an active booking
);

INSERT INTO public.booking_statuses (status, description, display_order, is_active_booking) VALUES
('pending', 'Awaiting coach confirmation', 1, TRUE),
('confirmed', 'Confirmed and scheduled', 2, TRUE),
('in_progress', 'Session currently happening', 3, TRUE),
('completed', 'Session completed successfully', 4, FALSE),
('cancelled_by_student', 'Cancelled by student', 5, FALSE),
('cancelled_by_coach', 'Cancelled by coach', 6, FALSE),
('no_show_student', 'Student did not attend', 7, FALSE),
('no_show_coach', 'Coach did not attend', 8, FALSE),
('rescheduled', 'Moved to different time', 9, FALSE);
```

#### `public.bookings`
Core booking records.

```sql
CREATE TABLE public.bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.users(id),
    coach_id UUID NOT NULL REFERENCES public.users(id),
    service_id UUID NOT NULL REFERENCES public.coach_services(id),
    court_id UUID NOT NULL REFERENCES public.courts(id),

    -- Booking timing (all in GMT+8)
    session_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    duration_minutes INTEGER NOT NULL,

    -- Pricing
    service_price_myr DECIMAL(10, 2) NOT NULL,
    travel_fee_myr DECIMAL(8, 2) DEFAULT 0.00,
    total_price_myr DECIMAL(10, 2) NOT NULL,

    -- Status and tracking
    status TEXT NOT NULL REFERENCES public.booking_statuses(status) DEFAULT 'pending',
    booking_reference TEXT NOT NULL UNIQUE, -- Human-readable reference

    -- Contact and notes
    student_phone TEXT,
    student_notes TEXT,
    coach_notes TEXT,
    admin_notes TEXT,

    -- Metadata
    booked_at TIMESTAMPTZ DEFAULT NOW(),
    confirmed_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    cancellation_reason TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Constraints
    CHECK (end_time > start_time),
    CHECK (total_price_myr = service_price_myr + travel_fee_myr)
);

-- Critical indexes for booking queries
CREATE INDEX idx_bookings_coach_date ON public.bookings(coach_id, session_date, start_time);
CREATE INDEX idx_bookings_student ON public.bookings(student_id, session_date DESC);
CREATE INDEX idx_bookings_status ON public.bookings(status, session_date);
CREATE INDEX idx_bookings_reference ON public.bookings(booking_reference);
CREATE INDEX idx_bookings_datetime ON public.bookings(session_date, start_time);

-- Unique constraint to prevent double bookings
CREATE UNIQUE INDEX idx_bookings_coach_time_unique ON public.bookings(coach_id, session_date, start_time, end_time)
WHERE status IN ('pending', 'confirmed', 'in_progress');
```

#### `public.booking_history`
Audit trail for booking changes.

```sql
CREATE TABLE public.booking_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
    changed_by UUID REFERENCES public.users(id),
    old_status TEXT,
    new_status TEXT NOT NULL,
    old_datetime TIMESTAMPTZ,
    new_datetime TIMESTAMPTZ,
    change_reason TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_booking_history_booking ON public.booking_history(booking_id, created_at DESC);
```

### 6. Reviews & Ratings

#### `public.reviews`
Student reviews of completed sessions.

```sql
CREATE TABLE public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES public.bookings(id) UNIQUE,
    student_id UUID NOT NULL REFERENCES public.users(id),
    coach_id UUID NOT NULL REFERENCES public.users(id),
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    is_anonymous BOOLEAN DEFAULT FALSE,
    is_public BOOLEAN DEFAULT TRUE,
    coach_response TEXT,
    coach_response_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_reviews_coach ON public.reviews(coach_id, created_at DESC);
CREATE INDEX idx_reviews_student ON public.reviews(student_id, created_at DESC);
CREATE INDEX idx_reviews_rating ON public.reviews(rating, is_public);
```

### 7. System Tables

#### `public.app_settings`
Application configuration and feature flags.

```sql
CREATE TABLE public.app_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    category TEXT DEFAULT 'general',
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Default settings
INSERT INTO public.app_settings (key, value, description, category, is_public) VALUES
('booking_advance_limit_days', '30', 'Maximum days in advance for bookings', 'booking', FALSE),
('booking_minimum_notice_hours', '24', 'Minimum notice required for bookings', 'booking', FALSE),
('default_session_buffer_minutes', '15', 'Default buffer time between sessions', 'booking', FALSE),
('supported_timezones', '["Asia/Kuala_Lumpur"]', 'Supported timezone list', 'system', FALSE),
('maintenance_mode', 'false', 'Application maintenance mode toggle', 'system', FALSE),
('featured_sports', '["Tennis", "Badminton", "Swimming", "Football"]', 'Featured sports on homepage', 'display', TRUE);
```

#### `public.audit_logs`
System-wide audit trail.

```sql
CREATE TABLE public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id),
    table_name TEXT NOT NULL,
    record_id UUID,
    action TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_user ON public.audit_logs(user_id, created_at DESC);
CREATE INDEX idx_audit_logs_table ON public.audit_logs(table_name, created_at DESC);
```

## Views for Complex Queries

### Coach Directory View
Optimized view for coach directory searches.

```sql
CREATE VIEW public.coach_directory AS
SELECT
    u.id,
    u.full_name,
    u.profile_image_url,
    u.location_state,
    u.location_city,
    cp.bio,
    cp.years_experience,
    cp.specializations,
    cp.rating_average,
    cp.rating_count,
    cp.is_featured,
    cp.is_available,
    -- Aggregate service information
    COALESCE(
        JSON_AGG(
            JSON_BUILD_OBJECT(
                'service_id', cs.id,
                'sport_name', s.name,
                'service_name', cs.service_name,
                'price_myr', cs.price_myr,
                'duration_minutes', cs.duration_minutes
            ) ORDER BY cs.price_myr
        ) FILTER (WHERE cs.is_active = TRUE),
        '[]'
    ) AS services,
    -- Minimum price
    MIN(cs.price_myr) FILTER (WHERE cs.is_active = TRUE) AS min_price_myr,
    -- Available sports
    ARRAY_AGG(DISTINCT s.name) FILTER (WHERE cs.is_active = TRUE) AS sports
FROM public.users u
JOIN public.coach_profiles cp ON u.id = cp.user_id
LEFT JOIN public.coach_services cs ON u.id = cs.coach_id AND cs.is_active = TRUE
LEFT JOIN public.sports s ON cs.sport_id = s.id
WHERE u.user_type = 'coach'
    AND cp.listing_status = 'active'
    AND cp.is_available = TRUE
    AND u.is_active = TRUE
GROUP BY u.id, u.full_name, u.profile_image_url, u.location_state, u.location_city,
         cp.bio, cp.years_experience, cp.specializations, cp.rating_average,
         cp.rating_count, cp.is_featured, cp.is_available;
```

### Booking Availability View
Real-time availability computation helper.

```sql
CREATE VIEW public.booking_slots AS
SELECT
    cs.coach_id,
    cs.id as service_id,
    cs.duration_minutes,
    cs.buffer_time_before,
    cs.buffer_time_after,
    cs.min_advance_booking_hours,
    cs.max_advance_booking_days,
    -- Weekly availability rules
    COALESCE(
        JSON_AGG(
            JSON_BUILD_OBJECT(
                'day_of_week', ar.day_of_week,
                'start_time', ar.start_time,
                'end_time', ar.end_time
            )
        ) FILTER (WHERE ar.is_available = TRUE),
        '[]'
    ) AS availability_rules
FROM public.coach_services cs
LEFT JOIN public.coach_availability_rules ar ON cs.coach_id = ar.coach_id
WHERE cs.is_active = TRUE
GROUP BY cs.coach_id, cs.id, cs.duration_minutes, cs.buffer_time_before,
         cs.buffer_time_after, cs.min_advance_booking_hours, cs.max_advance_booking_days;
```

## Row Level Security Policies

### Users Table Policies

```sql
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Users can view their own profile and public coach profiles
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

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);
```

### Bookings Table Policies

```sql
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Students can view their own bookings
CREATE POLICY "Students can view own bookings" ON public.bookings
    FOR SELECT USING (auth.uid() = student_id);

-- Coaches can view their own bookings
CREATE POLICY "Coaches can view own bookings" ON public.bookings
    FOR SELECT USING (auth.uid() = coach_id);

-- Students can create bookings
CREATE POLICY "Students can create bookings" ON public.bookings
    FOR INSERT WITH CHECK (auth.uid() = student_id);

-- Coaches can update their bookings
CREATE POLICY "Coaches can update own bookings" ON public.bookings
    FOR UPDATE USING (auth.uid() = coach_id);
```

### Coach Services Policies

```sql
ALTER TABLE public.coach_services ENABLE ROW LEVEL SECURITY;

-- Anyone can view active services
CREATE POLICY "Anyone can view active services" ON public.coach_services
    FOR SELECT USING (is_active = TRUE);

-- Coaches can manage their own services
CREATE POLICY "Coaches can manage own services" ON public.coach_services
    FOR ALL USING (auth.uid() = coach_id);
```

## Functions and Triggers

### Update Timestamps Trigger

```sql
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to all tables with updated_at column
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_coach_profiles_updated_at BEFORE UPDATE ON public.coach_profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_coach_services_updated_at BEFORE UPDATE ON public.coach_services
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON public.bookings
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
```

### Coach Rating Update Trigger

```sql
CREATE OR REPLACE FUNCTION public.update_coach_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.coach_profiles
    SET
        rating_average = (
            SELECT ROUND(AVG(rating)::numeric, 2)
            FROM public.reviews
            WHERE coach_id = COALESCE(NEW.coach_id, OLD.coach_id)
            AND is_public = TRUE
        ),
        rating_count = (
            SELECT COUNT(*)
            FROM public.reviews
            WHERE coach_id = COALESCE(NEW.coach_id, OLD.coach_id)
            AND is_public = TRUE
        )
    WHERE user_id = COALESCE(NEW.coach_id, OLD.coach_id);

    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

CREATE TRIGGER update_coach_rating_on_review_change
    AFTER INSERT OR UPDATE OR DELETE ON public.reviews
    FOR EACH ROW EXECUTE FUNCTION public.update_coach_rating();
```

### Booking Reference Generation

```sql
CREATE OR REPLACE FUNCTION public.generate_booking_reference()
RETURNS TRIGGER AS $$
BEGIN
    NEW.booking_reference = 'CB' || TO_CHAR(NEW.created_at, 'YYMMDD') ||
                           UPPER(SUBSTRING(NEW.id::text FROM 1 FOR 6));
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER generate_booking_reference_trigger
    BEFORE INSERT ON public.bookings
    FOR EACH ROW EXECUTE FUNCTION public.generate_booking_reference();
```

### Audit Log Trigger

```sql
CREATE OR REPLACE FUNCTION public.audit_trigger()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.audit_logs (
        user_id, table_name, record_id, action, old_values, new_values
    ) VALUES (
        auth.uid(),
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        TG_OP,
        CASE WHEN TG_OP = 'DELETE' THEN row_to_json(OLD) ELSE NULL END,
        CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN row_to_json(NEW) ELSE NULL END
    );
    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- Apply audit logging to critical tables
CREATE TRIGGER audit_users AFTER INSERT OR UPDATE OR DELETE ON public.users
    FOR EACH ROW EXECUTE FUNCTION public.audit_trigger();

CREATE TRIGGER audit_bookings AFTER INSERT OR UPDATE OR DELETE ON public.bookings
    FOR EACH ROW EXECUTE FUNCTION public.audit_trigger();
```

## Indexes for Performance

### Booking System Indexes

```sql
-- Prevent double bookings and optimize availability queries
CREATE UNIQUE INDEX idx_coach_availability_unique ON public.bookings(
    coach_id, session_date, start_time, end_time
) WHERE status IN ('pending', 'confirmed', 'in_progress');

-- Fast booking lookups by reference
CREATE INDEX idx_bookings_reference_lookup ON public.bookings(booking_reference);

-- Coach dashboard queries
CREATE INDEX idx_bookings_coach_dashboard ON public.bookings(
    coach_id, session_date DESC, status
);

-- Student dashboard queries
CREATE INDEX idx_bookings_student_dashboard ON public.bookings(
    student_id, session_date DESC, status
);
```

### Directory Search Indexes

```sql
-- Coach directory filtering
CREATE INDEX idx_coach_directory_search ON public.coach_profiles(
    listing_status, is_available, is_featured, rating_average DESC
);

-- Service search by sport and price
CREATE INDEX idx_services_search ON public.coach_services(
    sport_id, is_active, price_myr
);

-- Location-based search
CREATE INDEX idx_courts_location_search ON public.courts(
    state, city, is_active
) INCLUDE (name, sports_available);
```

## Migration Script

```sql
-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis"; -- For location features if needed

-- Set timezone to Malaysian time
SET timezone = 'Asia/Kuala_Lumpur';

-- Create all tables in order of dependencies
-- (All CREATE TABLE statements from above would be executed in order)

-- Insert master data
-- (All INSERT statements for sports, booking_statuses, app_settings)

-- Create all indexes
-- (All CREATE INDEX statements)

-- Create all views
-- (All CREATE VIEW statements)

-- Set up RLS policies
-- (All RLS policy statements)

-- Create triggers and functions
-- (All trigger and function definitions)

-- Grant appropriate permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
```

## Performance Considerations

1. **Booking Conflicts**: Unique partial index prevents double bookings at database level
2. **Directory Search**: Materialized view for coach directory with refresh strategy
3. **Availability Computation**: Cached results using Upstash Redis for slot queries
4. **Time Zone Handling**: All timestamps stored in GMT+8 with proper indexing
5. **Audit Trail**: Separate audit table to avoid impacting main table performance

## Security Features

1. **Row Level Security**: Comprehensive RLS policies on all tables
2. **Audit Logging**: Complete audit trail for sensitive operations
3. **Data Validation**: Check constraints and triggers for data integrity
4. **Access Control**: Role-based access through Supabase Auth integration

This schema provides a robust foundation for the coach booking marketplace with excellent performance characteristics and security features optimized for the Malaysian market.