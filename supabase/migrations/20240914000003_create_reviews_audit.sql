-- Coach Booking Marketplace - Reviews & Audit System
-- Version: 1.0.0
-- Date: 2024-09-14
-- Dependencies: 20240914000002_create_booking_system.sql

-- ============================================================================
-- 1. REVIEWS & RATINGS SYSTEM
-- ============================================================================

-- Student reviews of completed sessions
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

-- ============================================================================
-- 2. SYSTEM CONFIGURATION & AUDIT TABLES
-- ============================================================================

-- Application settings and feature flags
CREATE TABLE public.app_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    category TEXT DEFAULT 'general',
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- System-wide audit trail
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

-- ============================================================================
-- 3. INSERT DEFAULT APP SETTINGS
-- ============================================================================

-- Insert default application settings
INSERT INTO public.app_settings (key, value, description, category, is_public) VALUES
('booking_advance_limit_days', '30', 'Maximum days in advance for bookings', 'booking', FALSE),
('booking_minimum_notice_hours', '24', 'Minimum notice required for bookings', 'booking', FALSE),
('default_session_buffer_minutes', '15', 'Default buffer time between sessions', 'booking', FALSE),
('supported_timezones', '["Asia/Kuala_Lumpur"]', 'Supported timezone list', 'system', FALSE),
('maintenance_mode', 'false', 'Application maintenance mode toggle', 'system', FALSE),
('featured_sports', '["Tennis", "Badminton", "Swimming", "Football"]', 'Featured sports on homepage', 'display', TRUE),
('max_booking_cancellation_hours', '24', 'Maximum hours before session to allow cancellation', 'booking', FALSE),
('default_coach_rating', '0.0', 'Default rating for new coaches', 'coaching', FALSE),
('review_moderation_enabled', 'true', 'Whether reviews require moderation', 'reviews', FALSE),
('currency', '"MYR"', 'Default currency for pricing', 'localization', TRUE),
('supported_languages', '["en", "ms", "zh"]', 'Supported application languages', 'localization', TRUE);

-- ============================================================================
-- 4. PERFORMANCE INDEXES
-- ============================================================================

-- Reviews indexes
CREATE INDEX idx_reviews_coach ON public.reviews(coach_id, created_at DESC);
CREATE INDEX idx_reviews_student ON public.reviews(student_id, created_at DESC);
CREATE INDEX idx_reviews_rating ON public.reviews(rating, is_public);
CREATE INDEX idx_reviews_public ON public.reviews(is_public, created_at DESC);

-- App settings indexes
CREATE INDEX idx_app_settings_category ON public.app_settings(category);
CREATE INDEX idx_app_settings_public ON public.app_settings(is_public);

-- Audit logs indexes
CREATE INDEX idx_audit_logs_user ON public.audit_logs(user_id, created_at DESC);
CREATE INDEX idx_audit_logs_table ON public.audit_logs(table_name, created_at DESC);
CREATE INDEX idx_audit_logs_record ON public.audit_logs(table_name, record_id);

-- ============================================================================
-- 5. COACH RATING UPDATE TRIGGER
-- ============================================================================

-- Automatically update coach ratings when reviews change
CREATE OR REPLACE FUNCTION public.update_coach_rating()
RETURNS TRIGGER AS $$
DECLARE
    target_coach_id UUID;
BEGIN
    -- Determine which coach to update
    target_coach_id := COALESCE(NEW.coach_id, OLD.coach_id);

    -- Update coach profile with new rating statistics
    UPDATE public.coach_profiles
    SET
        rating_average = (
            SELECT ROUND(AVG(rating)::numeric, 2)
            FROM public.reviews
            WHERE coach_id = target_coach_id
            AND is_public = TRUE
        ),
        rating_count = (
            SELECT COUNT(*)
            FROM public.reviews
            WHERE coach_id = target_coach_id
            AND is_public = TRUE
        )
    WHERE user_id = target_coach_id;

    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- Apply coach rating update trigger
CREATE TRIGGER update_coach_rating_on_review_change
    AFTER INSERT OR UPDATE OR DELETE ON public.reviews
    FOR EACH ROW EXECUTE FUNCTION public.update_coach_rating();

-- ============================================================================
-- 6. COMPREHENSIVE AUDIT TRIGGER
-- ============================================================================

-- Generic audit logging for sensitive tables
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

CREATE TRIGGER audit_coach_profiles AFTER INSERT OR UPDATE OR DELETE ON public.coach_profiles
    FOR EACH ROW EXECUTE FUNCTION public.audit_trigger();

CREATE TRIGGER audit_coach_services AFTER INSERT OR UPDATE OR DELETE ON public.coach_services
    FOR EACH ROW EXECUTE FUNCTION public.audit_trigger();

CREATE TRIGGER audit_reviews AFTER INSERT OR UPDATE OR DELETE ON public.reviews
    FOR EACH ROW EXECUTE FUNCTION public.audit_trigger();

-- ============================================================================
-- 7. REVIEW VALIDATION FUNCTION
-- ============================================================================

-- Validate that review can only be created for completed bookings
CREATE OR REPLACE FUNCTION public.validate_review_eligibility(
    p_booking_id UUID,
    p_student_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
    booking_status TEXT;
    booking_student_id UUID;
    session_datetime TIMESTAMPTZ;
BEGIN
    -- Get booking details
    SELECT status, student_id, (session_date + start_time)::TIMESTAMPTZ
    INTO booking_status, booking_student_id, session_datetime
    FROM public.bookings
    WHERE id = p_booking_id;

    -- Check if booking exists and belongs to student
    IF booking_student_id IS NULL OR booking_student_id != p_student_id THEN
        RETURN FALSE;
    END IF;

    -- Check if booking is completed
    IF booking_status != 'completed' THEN
        RETURN FALSE;
    END IF;

    -- Check if session has actually occurred (safety check)
    IF session_datetime > NOW() THEN
        RETURN FALSE;
    END IF;

    RETURN TRUE;
END;
$$ language 'plpgsql';

-- ============================================================================
-- 8. UPDATE TRIGGERS FOR REVIEWS & AUDIT TABLES
-- ============================================================================

-- Apply timestamp triggers
CREATE TRIGGER update_reviews_updated_at
    BEFORE UPDATE ON public.reviews
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_app_settings_updated_at
    BEFORE UPDATE ON public.app_settings
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- 9. ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Reviews policies
CREATE POLICY "Anyone can view public reviews" ON public.reviews
    FOR SELECT USING (is_public = TRUE);

CREATE POLICY "Students can view their own reviews" ON public.reviews
    FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "Coaches can view their reviews" ON public.reviews
    FOR SELECT USING (auth.uid() = coach_id);

CREATE POLICY "Students can create reviews for their completed bookings" ON public.reviews
    FOR INSERT WITH CHECK (
        auth.uid() = student_id
        AND public.validate_review_eligibility(booking_id, student_id)
    );

CREATE POLICY "Students can update their own reviews" ON public.reviews
    FOR UPDATE USING (auth.uid() = student_id);

CREATE POLICY "Coaches can respond to their reviews" ON public.reviews
    FOR UPDATE USING (auth.uid() = coach_id)
    WITH CHECK (coach_response IS NOT NULL);

-- App settings policies
CREATE POLICY "Anyone can view public settings" ON public.app_settings
    FOR SELECT USING (is_public = TRUE);

CREATE POLICY "Authenticated users can view all settings" ON public.app_settings
    FOR SELECT USING (auth.uid() IS NOT NULL);

-- Audit logs policies (admin only in production)
CREATE POLICY "Users can view their own audit logs" ON public.audit_logs
    FOR SELECT USING (auth.uid() = user_id);

-- ============================================================================
-- 10. HELPER FUNCTIONS FOR REVIEWS
-- ============================================================================

-- Get coach rating statistics
CREATE OR REPLACE FUNCTION public.get_coach_rating_stats(p_coach_id UUID)
RETURNS TABLE(
    total_reviews INTEGER,
    average_rating DECIMAL(3,2),
    rating_distribution JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(*)::INTEGER as total_reviews,
        ROUND(AVG(rating), 2) as average_rating,
        JSON_BUILD_OBJECT(
            '5', COUNT(*) FILTER (WHERE rating = 5),
            '4', COUNT(*) FILTER (WHERE rating = 4),
            '3', COUNT(*) FILTER (WHERE rating = 3),
            '2', COUNT(*) FILTER (WHERE rating = 2),
            '1', COUNT(*) FILTER (WHERE rating = 1)
        ) as rating_distribution
    FROM public.reviews
    WHERE coach_id = p_coach_id AND is_public = TRUE;
END;
$$ language 'plpgsql';

-- Get pending review opportunities for student
CREATE OR REPLACE FUNCTION public.get_pending_reviews(p_student_id UUID)
RETURNS TABLE(
    booking_id UUID,
    coach_name TEXT,
    service_name TEXT,
    session_date DATE,
    can_review BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        b.id as booking_id,
        u.full_name as coach_name,
        cs.service_name,
        b.session_date,
        (b.status = 'completed' AND r.id IS NULL) as can_review
    FROM public.bookings b
    JOIN public.users u ON b.coach_id = u.id
    JOIN public.coach_services cs ON b.service_id = cs.id
    LEFT JOIN public.reviews r ON b.id = r.booking_id
    WHERE b.student_id = p_student_id
    AND b.status = 'completed'
    AND r.id IS NULL
    ORDER BY b.session_date DESC;
END;
$$ language 'plpgsql';

-- ============================================================================
-- 11. GRANT PERMISSIONS
-- ============================================================================

-- Grant permissions for reviews and audit system
GRANT SELECT ON public.reviews TO anon, authenticated;
GRANT ALL ON public.reviews TO authenticated;

GRANT SELECT ON public.app_settings TO anon, authenticated;
GRANT ALL ON public.app_settings TO authenticated;

GRANT SELECT ON public.audit_logs TO authenticated;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION public.validate_review_eligibility TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_coach_rating_stats TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_pending_reviews TO authenticated;

-- ============================================================================
-- MIGRATION COMPLETED: REVIEWS & AUDIT SYSTEM
-- ============================================================================

COMMENT ON TABLE public.reviews IS 'Student reviews and ratings for completed coaching sessions';
COMMENT ON TABLE public.app_settings IS 'Application configuration and feature flags';
COMMENT ON TABLE public.audit_logs IS 'Comprehensive audit trail for system security and compliance';
COMMENT ON FUNCTION public.update_coach_rating IS 'Automatically updates coach rating statistics when reviews change';
COMMENT ON FUNCTION public.validate_review_eligibility IS 'Validates that reviews can only be created for completed bookings';
COMMENT ON FUNCTION public.get_coach_rating_stats IS 'Returns detailed rating statistics for a coach';
COMMENT ON FUNCTION public.get_pending_reviews IS 'Returns bookings eligible for review by a student';