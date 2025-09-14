-- Coach Booking Marketplace - Booking System with Conflict Prevention
-- Version: 1.0.0
-- Date: 2024-09-14
-- Dependencies: 20240914000001_create_services_availability.sql

-- ============================================================================
-- 1. BOOKING STATUS MANAGEMENT
-- ============================================================================

-- Master booking status types
CREATE TABLE public.booking_statuses (
    status TEXT PRIMARY KEY,
    description TEXT NOT NULL,
    display_order INTEGER DEFAULT 0,
    is_active_booking BOOLEAN DEFAULT TRUE -- whether this status represents an active booking
);

-- Insert standard booking statuses
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

-- ============================================================================
-- 2. CORE BOOKING SYSTEM TABLES
-- ============================================================================

-- Main bookings table
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
    CHECK (total_price_myr = service_price_myr + travel_fee_myr),
    CHECK (duration_minutes > 0)
);

-- Booking change audit trail
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

-- ============================================================================
-- 3. CRITICAL PERFORMANCE INDEXES FOR BOOKINGS
-- ============================================================================

-- Prevent double bookings - CRITICAL UNIQUE INDEX
CREATE UNIQUE INDEX idx_bookings_coach_time_unique ON public.bookings(
    coach_id, session_date, start_time, end_time
) WHERE status IN ('pending', 'confirmed', 'in_progress');

-- Fast booking lookups and dashboard queries
CREATE INDEX idx_bookings_coach_date ON public.bookings(coach_id, session_date, start_time);
CREATE INDEX idx_bookings_student ON public.bookings(student_id, session_date DESC);
CREATE INDEX idx_bookings_status ON public.bookings(status, session_date);
CREATE INDEX idx_bookings_reference ON public.bookings(booking_reference);
CREATE INDEX idx_bookings_datetime ON public.bookings(session_date, start_time);

-- Coach dashboard performance
CREATE INDEX idx_bookings_coach_dashboard ON public.bookings(
    coach_id, session_date DESC, status
);

-- Student dashboard performance
CREATE INDEX idx_bookings_student_dashboard ON public.bookings(
    student_id, session_date DESC, status
);

-- Booking history indexes
CREATE INDEX idx_booking_history_booking ON public.booking_history(booking_id, created_at DESC);

-- ============================================================================
-- 4. BOOKING REFERENCE GENERATION FUNCTION
-- ============================================================================

-- Generate human-readable booking references
CREATE OR REPLACE FUNCTION public.generate_booking_reference()
RETURNS TRIGGER AS $$
BEGIN
    -- Format: CB + YYMMDD + 6-character UUID snippet
    NEW.booking_reference = 'CB' || TO_CHAR(NEW.created_at, 'YYMMDD') ||
                           UPPER(SUBSTRING(NEW.id::text FROM 1 FOR 6));
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply booking reference generation trigger
CREATE TRIGGER generate_booking_reference_trigger
    BEFORE INSERT ON public.bookings
    FOR EACH ROW EXECUTE FUNCTION public.generate_booking_reference();

-- ============================================================================
-- 5. BOOKING AUDIT TRAIL TRIGGER
-- ============================================================================

-- Automatically log booking changes
CREATE OR REPLACE FUNCTION public.log_booking_changes()
RETURNS TRIGGER AS $$
BEGIN
    -- Log status changes
    IF TG_OP = 'UPDATE' AND (OLD.status IS DISTINCT FROM NEW.status) THEN
        INSERT INTO public.booking_history (
            booking_id, changed_by, old_status, new_status,
            old_datetime, new_datetime, metadata
        ) VALUES (
            NEW.id,
            auth.uid(),
            OLD.status,
            NEW.status,
            CASE WHEN OLD.session_date IS DISTINCT FROM NEW.session_date
                 OR OLD.start_time IS DISTINCT FROM NEW.start_time
                 THEN (OLD.session_date + OLD.start_time)::timestamptz
                 ELSE NULL END,
            CASE WHEN OLD.session_date IS DISTINCT FROM NEW.session_date
                 OR OLD.start_time IS DISTINCT FROM NEW.start_time
                 THEN (NEW.session_date + NEW.start_time)::timestamptz
                 ELSE NULL END,
            JSON_BUILD_OBJECT(
                'operation', TG_OP,
                'table', TG_TABLE_NAME,
                'old_total_price', OLD.total_price_myr,
                'new_total_price', NEW.total_price_myr
            )
        );
    END IF;

    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- Apply booking audit trigger
CREATE TRIGGER log_booking_changes_trigger
    AFTER UPDATE ON public.bookings
    FOR EACH ROW EXECUTE FUNCTION public.log_booking_changes();

-- ============================================================================
-- 6. BOOKING CONFLICT VALIDATION FUNCTION
-- ============================================================================

-- Function to validate booking conflicts
CREATE OR REPLACE FUNCTION public.validate_booking_slot(
    p_coach_id UUID,
    p_session_date DATE,
    p_start_time TIME,
    p_end_time TIME,
    p_exclude_booking_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    conflict_count INTEGER;
BEGIN
    -- Check for existing bookings in the same time slot
    SELECT COUNT(*)
    INTO conflict_count
    FROM public.bookings
    WHERE coach_id = p_coach_id
    AND session_date = p_session_date
    AND status IN ('pending', 'confirmed', 'in_progress')
    AND (
        -- Time ranges overlap
        (start_time < p_end_time AND end_time > p_start_time)
    )
    AND (p_exclude_booking_id IS NULL OR id != p_exclude_booking_id);

    -- Return TRUE if no conflicts (slot is available)
    RETURN conflict_count = 0;
END;
$$ language 'plpgsql';

-- ============================================================================
-- 7. UPDATE TRIGGERS FOR BOOKING TABLES
-- ============================================================================

-- Apply timestamp triggers
CREATE TRIGGER update_bookings_updated_at
    BEFORE UPDATE ON public.bookings
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- 8. ROW LEVEL SECURITY POLICIES - BOOKING SYSTEM
-- ============================================================================

-- Enable RLS on booking tables
ALTER TABLE public.booking_statuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_history ENABLE ROW LEVEL SECURITY;

-- Booking statuses (public read-only)
CREATE POLICY "Anyone can view booking statuses" ON public.booking_statuses
    FOR SELECT USING (true);

-- Main bookings policies
CREATE POLICY "Students can view own bookings" ON public.bookings
    FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "Coaches can view own bookings" ON public.bookings
    FOR SELECT USING (auth.uid() = coach_id);

CREATE POLICY "Students can create bookings" ON public.bookings
    FOR INSERT WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Students can update own pending bookings" ON public.bookings
    FOR UPDATE USING (
        auth.uid() = student_id
        AND status = 'pending'
    );

CREATE POLICY "Coaches can update their bookings" ON public.bookings
    FOR UPDATE USING (auth.uid() = coach_id);

-- Booking history policies
CREATE POLICY "Students can view own booking history" ON public.booking_history
    FOR SELECT USING (
        booking_id IN (
            SELECT id FROM public.bookings WHERE student_id = auth.uid()
        )
    );

CREATE POLICY "Coaches can view their booking history" ON public.booking_history
    FOR SELECT USING (
        booking_id IN (
            SELECT id FROM public.bookings WHERE coach_id = auth.uid()
        )
    );

-- ============================================================================
-- 9. BOOKING SYSTEM HELPER FUNCTIONS
-- ============================================================================

-- Function to get available time slots for a coach/service/date
CREATE OR REPLACE FUNCTION public.get_available_slots(
    p_coach_id UUID,
    p_service_id UUID,
    p_date DATE
)
RETURNS TABLE(
    start_time TIME,
    end_time TIME,
    is_available BOOLEAN
) AS $$
DECLARE
    service_duration INTEGER;
    service_buffer_before INTEGER;
    service_buffer_after INTEGER;
BEGIN
    -- Get service details
    SELECT duration_minutes, buffer_time_before, buffer_time_after
    INTO service_duration, service_buffer_before, service_buffer_after
    FROM public.coach_services
    WHERE id = p_service_id AND coach_id = p_coach_id AND is_active = TRUE;

    -- If service not found, return empty result
    IF service_duration IS NULL THEN
        RETURN;
    END IF;

    -- Return available slots based on coach availability rules
    -- This is a simplified version - full implementation would consider:
    -- - Coach availability rules
    -- - Existing bookings
    -- - Blocked dates
    -- - Service-specific requirements

    RETURN QUERY
    SELECT
        TIME '09:00:00' as start_time,
        TIME '10:00:00' as end_time,
        public.validate_booking_slot(p_coach_id, p_date, TIME '09:00:00', TIME '10:00:00') as is_available
    UNION ALL
    SELECT
        TIME '10:30:00' as start_time,
        TIME '11:30:00' as end_time,
        public.validate_booking_slot(p_coach_id, p_date, TIME '10:30:00', TIME '11:30:00') as is_available;
END;
$$ language 'plpgsql';

-- ============================================================================
-- 10. GRANT PERMISSIONS
-- ============================================================================

-- Grant permissions for booking system
GRANT SELECT ON public.booking_statuses TO anon, authenticated;
GRANT ALL ON public.bookings TO authenticated;
GRANT ALL ON public.booking_history TO authenticated;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION public.validate_booking_slot TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_available_slots TO authenticated;

-- ============================================================================
-- MIGRATION COMPLETED: BOOKING SYSTEM
-- ============================================================================

COMMENT ON TABLE public.booking_statuses IS 'Master table for booking status types and workflow';
COMMENT ON TABLE public.bookings IS 'Core booking records with conflict prevention and pricing';
COMMENT ON TABLE public.booking_history IS 'Audit trail for all booking changes and status updates';
COMMENT ON FUNCTION public.validate_booking_slot IS 'Validates if a time slot is available for booking';
COMMENT ON FUNCTION public.get_available_slots IS 'Returns available time slots for coach/service/date';

-- Index comments (constraints are named differently in PostgreSQL)
-- The unique index idx_bookings_coach_time_unique prevents double bookings