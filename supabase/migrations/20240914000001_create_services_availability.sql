-- Coach Booking Marketplace - Services & Availability Management
-- Version: 1.0.0
-- Date: 2024-09-14
-- Dependencies: 20240914000000_create_core_tables.sql

-- ============================================================================
-- 1. SERVICES & PRICING TABLES
-- ============================================================================

-- Coach services offerings
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

-- Coach service locations (preferred courts/venues)
CREATE TABLE public.coach_service_locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_id UUID NOT NULL REFERENCES public.coach_services(id) ON DELETE CASCADE,
    court_id UUID NOT NULL REFERENCES public.courts(id) ON DELETE CASCADE,
    travel_fee_myr DECIMAL(8, 2) DEFAULT 0.00,
    is_preferred BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(service_id, court_id)
);

-- ============================================================================
-- 2. AVAILABILITY MANAGEMENT TABLES
-- ============================================================================

-- Weekly availability rules (recurring schedule)
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

-- Date-specific availability exceptions (overrides weekly rules)
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

-- Simplified date blocking for coaches
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

-- ============================================================================
-- 3. PERFORMANCE INDEXES FOR SERVICES & AVAILABILITY
-- ============================================================================

-- Coach services indexes
CREATE INDEX idx_coach_services_coach ON public.coach_services(coach_id, is_active);
CREATE INDEX idx_coach_services_sport ON public.coach_services(sport_id, is_active);
CREATE INDEX idx_coach_services_price ON public.coach_services(price_myr);

-- Service locations indexes
CREATE INDEX idx_service_locations_service ON public.coach_service_locations(service_id);
CREATE INDEX idx_service_locations_court ON public.coach_service_locations(court_id);

-- Availability rules indexes
CREATE INDEX idx_availability_rules_coach ON public.coach_availability_rules(coach_id, day_of_week);

-- Availability exceptions indexes
CREATE INDEX idx_availability_exceptions_coach_date ON public.coach_availability_exceptions(coach_id, exception_date);

-- Blocked dates indexes
CREATE INDEX idx_blocked_dates_coach ON public.coach_blocked_dates(coach_id, blocked_date);

-- ============================================================================
-- 4. UPDATE TRIGGERS FOR SERVICES & AVAILABILITY
-- ============================================================================

-- Apply timestamp triggers
CREATE TRIGGER update_coach_services_updated_at
    BEFORE UPDATE ON public.coach_services
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_availability_rules_updated_at
    BEFORE UPDATE ON public.coach_availability_rules
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- 5. ROW LEVEL SECURITY POLICIES - SERVICES & AVAILABILITY
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.coach_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coach_service_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coach_availability_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coach_availability_exceptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coach_blocked_dates ENABLE ROW LEVEL SECURITY;

-- Coach services policies
CREATE POLICY "Anyone can view active services" ON public.coach_services
    FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Coaches can manage own services" ON public.coach_services
    FOR ALL USING (auth.uid() = coach_id);

-- Service locations policies
CREATE POLICY "Anyone can view service locations" ON public.coach_service_locations
    FOR SELECT USING (
        service_id IN (
            SELECT id FROM public.coach_services WHERE is_active = TRUE
        )
    );

CREATE POLICY "Coaches can manage own service locations" ON public.coach_service_locations
    FOR ALL USING (
        service_id IN (
            SELECT id FROM public.coach_services WHERE coach_id = auth.uid()
        )
    );

-- Availability rules policies
CREATE POLICY "Anyone can view coach availability rules" ON public.coach_availability_rules
    FOR SELECT USING (
        coach_id IN (
            SELECT user_id FROM public.coach_profiles
            WHERE listing_status = 'active' AND is_available = TRUE
        )
    );

CREATE POLICY "Coaches can manage own availability rules" ON public.coach_availability_rules
    FOR ALL USING (auth.uid() = coach_id);

-- Availability exceptions policies
CREATE POLICY "Anyone can view availability exceptions" ON public.coach_availability_exceptions
    FOR SELECT USING (
        coach_id IN (
            SELECT user_id FROM public.coach_profiles
            WHERE listing_status = 'active' AND is_available = TRUE
        )
    );

CREATE POLICY "Coaches can manage own availability exceptions" ON public.coach_availability_exceptions
    FOR ALL USING (auth.uid() = coach_id);

-- Blocked dates policies
CREATE POLICY "Coaches can manage own blocked dates" ON public.coach_blocked_dates
    FOR ALL USING (auth.uid() = coach_id);

-- ============================================================================
-- 6. VIEW FOR AVAILABILITY COMPUTATION
-- ============================================================================

-- Real-time availability computation helper view
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

-- ============================================================================
-- 7. GRANT PERMISSIONS
-- ============================================================================

-- Grant select permissions for public data
GRANT SELECT ON public.coach_services TO anon, authenticated;
GRANT SELECT ON public.coach_service_locations TO anon, authenticated;
GRANT SELECT ON public.coach_availability_rules TO anon, authenticated;
GRANT SELECT ON public.coach_availability_exceptions TO anon, authenticated;
GRANT SELECT ON public.booking_slots TO anon, authenticated;

-- Grant full permissions for authenticated users on their own data
GRANT ALL ON public.coach_services TO authenticated;
GRANT ALL ON public.coach_service_locations TO authenticated;
GRANT ALL ON public.coach_availability_rules TO authenticated;
GRANT ALL ON public.coach_availability_exceptions TO authenticated;
GRANT ALL ON public.coach_blocked_dates TO authenticated;

-- ============================================================================
-- MIGRATION COMPLETED: SERVICES & AVAILABILITY
-- ============================================================================

COMMENT ON TABLE public.coach_services IS 'Coach service offerings with pricing and requirements';
COMMENT ON TABLE public.coach_service_locations IS 'Preferred courts and locations for each service';
COMMENT ON TABLE public.coach_availability_rules IS 'Weekly recurring availability patterns';
COMMENT ON TABLE public.coach_availability_exceptions IS 'Date-specific availability overrides';
COMMENT ON TABLE public.coach_blocked_dates IS 'Simplified date blocking system for coaches';
COMMENT ON VIEW public.booking_slots IS 'Helper view for availability computation and slot generation';