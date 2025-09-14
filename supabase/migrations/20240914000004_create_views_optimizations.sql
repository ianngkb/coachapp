-- Coach Booking Marketplace - Advanced Views & Final Optimizations
-- Version: 1.0.0
-- Date: 2024-09-14
-- Dependencies: 20240914000003_create_reviews_audit.sql

-- ============================================================================
-- 1. ADVANCED VIEWS FOR COMPLEX QUERIES
-- ============================================================================

-- Comprehensive coach directory view with all required data
CREATE OR REPLACE VIEW public.coach_directory AS
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
    cp.listing_status,
    cp.total_sessions_completed,
    cp.languages_spoken,

    -- Aggregate service information
    COALESCE(
        JSON_AGG(
            JSON_BUILD_OBJECT(
                'service_id', cs.id,
                'sport_name', s.name,
                'service_name', cs.service_name,
                'price_myr', cs.price_myr,
                'duration_minutes', cs.duration_minutes,
                'max_participants', cs.max_participants,
                'skill_levels', cs.skill_levels
            ) ORDER BY cs.price_myr
        ) FILTER (WHERE cs.is_active = TRUE),
        '[]'
    ) AS services,

    -- Pricing information
    MIN(cs.price_myr) FILTER (WHERE cs.is_active = TRUE) AS min_price_myr,
    MAX(cs.price_myr) FILTER (WHERE cs.is_active = TRUE) AS max_price_myr,

    -- Available sports
    ARRAY_AGG(DISTINCT s.name) FILTER (WHERE cs.is_active = TRUE) AS sports,

    -- Service count
    COUNT(cs.id) FILTER (WHERE cs.is_active = TRUE) AS service_count,

    -- Review count (detailed reviews will be fetched separately)
    COUNT(r.id) FILTER (WHERE r.is_public = TRUE) AS review_count

FROM public.users u
JOIN public.coach_profiles cp ON u.id = cp.user_id
LEFT JOIN public.coach_services cs ON u.id = cs.coach_id AND cs.is_active = TRUE
LEFT JOIN public.sports s ON cs.sport_id = s.id
LEFT JOIN public.reviews r ON u.id = r.coach_id AND r.is_public = TRUE

WHERE u.user_type = 'coach'
    AND cp.listing_status = 'active'
    AND cp.is_available = TRUE
    AND u.is_active = TRUE

GROUP BY u.id, u.full_name, u.profile_image_url, u.location_state, u.location_city,
         cp.bio, cp.years_experience, cp.specializations, cp.rating_average,
         cp.rating_count, cp.is_featured, cp.is_available, cp.listing_status,
         cp.total_sessions_completed, cp.languages_spoken;

-- Enhanced booking availability view
CREATE OR REPLACE VIEW public.coach_availability_summary AS
SELECT
    cs.coach_id,
    cs.id as service_id,
    cs.service_name,
    s.name as sport_name,
    cs.duration_minutes,
    cs.price_myr,
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
                'end_time', ar.end_time,
                'is_available', ar.is_available
            ) ORDER BY ar.day_of_week, ar.start_time
        ) FILTER (WHERE ar.id IS NOT NULL),
        '[]'
    ) AS availability_rules,

    -- Service locations with travel fees
    COALESCE(
        JSON_AGG(
            JSON_BUILD_OBJECT(
                'court_id', c.id,
                'court_name', c.name,
                'court_address', c.address,
                'city', c.city,
                'state', c.state,
                'travel_fee_myr', csl.travel_fee_myr,
                'is_preferred', csl.is_preferred
            )
        ) FILTER (WHERE c.id IS NOT NULL),
        '[]'
    ) AS service_locations,

    -- Next 7 days blocked dates
    COALESCE(
        JSON_AGG(
            JSON_BUILD_OBJECT(
                'blocked_date', cbd.blocked_date,
                'reason', cbd.reason,
                'all_day', cbd.all_day,
                'start_time', cbd.start_time,
                'end_time', cbd.end_time
            )
        ) FILTER (WHERE cbd.blocked_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days'),
        '[]'
    ) AS upcoming_blocked_dates

FROM public.coach_services cs
JOIN public.sports s ON cs.sport_id = s.id
LEFT JOIN public.coach_availability_rules ar ON cs.coach_id = ar.coach_id
LEFT JOIN public.coach_service_locations csl ON cs.id = csl.service_id
LEFT JOIN public.courts c ON csl.court_id = c.id
LEFT JOIN public.coach_blocked_dates cbd ON cs.coach_id = cbd.coach_id

WHERE cs.is_active = TRUE

GROUP BY cs.coach_id, cs.id, cs.service_name, s.name, cs.duration_minutes,
         cs.price_myr, cs.buffer_time_before, cs.buffer_time_after,
         cs.min_advance_booking_hours, cs.max_advance_booking_days;

-- Student dashboard view
CREATE OR REPLACE VIEW public.student_dashboard AS
SELECT
    b.id as booking_id,
    b.booking_reference,
    b.session_date,
    b.start_time,
    b.end_time,
    b.duration_minutes,
    b.status,
    b.total_price_myr,
    b.student_notes,
    b.coach_notes,
    b.created_at,
    b.confirmed_at,

    -- Coach information
    coach.full_name as coach_name,
    coach.profile_image_url as coach_image,
    coach.phone_number as coach_phone,
    cp.whatsapp_number as coach_whatsapp,

    -- Service information
    cs.service_name,
    s.name as sport_name,

    -- Court information
    c.name as court_name,
    c.address as court_address,
    c.city as court_city,
    c.contact_phone as court_phone,

    -- Review status
    r.id IS NOT NULL as has_review,
    r.rating as review_rating,
    r.review_text,
    r.coach_response,

    -- Time-based flags
    (b.session_date + b.start_time)::TIMESTAMPTZ < NOW() as is_past,
    (b.session_date + b.start_time)::TIMESTAMPTZ BETWEEN NOW() AND NOW() + INTERVAL '24 hours' as is_upcoming,

    -- Can review flag
    (b.status = 'completed' AND r.id IS NULL AND
     (b.session_date + b.start_time)::TIMESTAMPTZ < NOW()) as can_review

FROM public.bookings b
JOIN public.users coach ON b.coach_id = coach.id
LEFT JOIN public.coach_profiles cp ON coach.id = cp.user_id
JOIN public.coach_services cs ON b.service_id = cs.id
JOIN public.sports s ON cs.sport_id = s.id
JOIN public.courts c ON b.court_id = c.id
LEFT JOIN public.reviews r ON b.id = r.booking_id

ORDER BY b.session_date DESC, b.start_time DESC;

-- Coach dashboard view
CREATE OR REPLACE VIEW public.coach_dashboard AS
SELECT
    b.id as booking_id,
    b.booking_reference,
    b.session_date,
    b.start_time,
    b.end_time,
    b.duration_minutes,
    b.status,
    b.total_price_myr,
    b.student_notes,
    b.coach_notes,
    b.created_at,
    b.confirmed_at,

    -- Student information
    student.full_name as student_name,
    student.profile_image_url as student_image,
    student.phone_number as student_phone,
    sp.emergency_contact_name,
    sp.emergency_contact_phone,

    -- Service information
    cs.service_name,
    s.name as sport_name,

    -- Court information
    c.name as court_name,
    c.address as court_address,
    c.city as court_city,

    -- Review information
    r.rating as review_rating,
    r.review_text,
    r.coach_response,
    r.is_public as review_is_public,

    -- Time-based flags
    (b.session_date + b.start_time)::TIMESTAMPTZ < NOW() as is_past,
    (b.session_date + b.start_time)::TIMESTAMPTZ BETWEEN NOW() AND NOW() + INTERVAL '2 hours' as is_today,

    -- Revenue tracking
    CASE WHEN b.status = 'completed' THEN b.total_price_myr ELSE 0 END as earned_amount

FROM public.bookings b
JOIN public.users student ON b.student_id = student.id
LEFT JOIN public.student_profiles sp ON student.id = sp.user_id
JOIN public.coach_services cs ON b.service_id = cs.id
JOIN public.sports s ON cs.sport_id = s.id
JOIN public.courts c ON b.court_id = c.id
LEFT JOIN public.reviews r ON b.id = r.booking_id

ORDER BY b.session_date DESC, b.start_time DESC;

-- ============================================================================
-- 2. MATERIALIZED VIEWS FOR PERFORMANCE
-- ============================================================================

-- Materialized view for popular coaches (refreshed periodically)
CREATE MATERIALIZED VIEW public.popular_coaches AS
SELECT
    u.id,
    u.full_name,
    u.profile_image_url,
    u.location_state,
    u.location_city,
    cp.rating_average,
    cp.rating_count,
    cp.total_sessions_completed,
    cp.specializations,
    MIN(cs.price_myr) as min_price,
    COUNT(DISTINCT cs.id) as service_count,
    ARRAY_AGG(DISTINCT s.name) as sports,

    -- Popularity score calculation
    (
        COALESCE(cp.rating_average, 0) * 0.4 +
        LEAST(cp.rating_count, 100) * 0.3 +
        LEAST(cp.total_sessions_completed, 500) * 0.002 +
        CASE WHEN cp.is_featured THEN 20 ELSE 0 END
    ) as popularity_score,

    CURRENT_TIMESTAMP as last_updated

FROM public.users u
JOIN public.coach_profiles cp ON u.id = cp.user_id
LEFT JOIN public.coach_services cs ON u.id = cs.coach_id AND cs.is_active = TRUE
LEFT JOIN public.sports s ON cs.sport_id = s.id

WHERE u.user_type = 'coach'
    AND cp.listing_status = 'active'
    AND cp.is_available = TRUE
    AND u.is_active = TRUE

GROUP BY u.id, u.full_name, u.profile_image_url, u.location_state, u.location_city,
         cp.rating_average, cp.rating_count, cp.total_sessions_completed,
         cp.specializations, cp.is_featured

ORDER BY popularity_score DESC;

-- Create unique index for materialized view
CREATE UNIQUE INDEX idx_popular_coaches_id ON public.popular_coaches(id);

-- ============================================================================
-- 3. ADVANCED PERFORMANCE INDEXES
-- ============================================================================

-- Composite indexes for complex directory queries
CREATE INDEX idx_coach_directory_search_composite ON public.coach_profiles(
    listing_status, is_available, is_featured, rating_average DESC
) INCLUDE (user_id, specializations);

-- Service search optimization
CREATE INDEX idx_services_sport_price_composite ON public.coach_services(
    sport_id, is_active, price_myr
) INCLUDE (coach_id, service_name, duration_minutes);

-- Location-based search optimization
CREATE INDEX idx_courts_location_sports_composite ON public.courts(
    state, city, is_active
) INCLUDE (name, sports_available, latitude, longitude);

-- Booking conflict detection optimization (supplement to unique constraint)
CREATE INDEX idx_bookings_overlap_detection ON public.bookings(
    coach_id, session_date
) INCLUDE (start_time, end_time, status)
WHERE status IN ('pending', 'confirmed', 'in_progress');

-- Review aggregation optimization
CREATE INDEX idx_reviews_coach_public ON public.reviews(
    coach_id, is_public, created_at DESC
) INCLUDE (rating, review_text);

-- Availability computation optimization
CREATE INDEX idx_availability_rules_day_time ON public.coach_availability_rules(
    coach_id, day_of_week, start_time, end_time
) WHERE is_available = TRUE;

-- ============================================================================
-- 4. ADVANCED HELPER FUNCTIONS
-- ============================================================================

-- Function to refresh materialized view
CREATE OR REPLACE FUNCTION public.refresh_popular_coaches()
RETURNS VOID AS $$
BEGIN
    REFRESH MATERIALIZED VIEW public.popular_coaches;
END;
$$ language 'plpgsql';

-- Function to get detailed coach availability for a specific date range
CREATE OR REPLACE FUNCTION public.get_coach_availability_detailed(
    p_coach_id UUID,
    p_start_date DATE,
    p_end_date DATE
)
RETURNS TABLE(
    date DATE,
    day_of_week INTEGER,
    available_slots JSONB,
    blocked_slots JSONB,
    booked_slots JSONB
) AS $$
BEGIN
    RETURN QUERY
    WITH date_series AS (
        SELECT generate_series(p_start_date, p_end_date, '1 day'::INTERVAL)::DATE as date
    ),
    date_info AS (
        SELECT
            ds.date,
            EXTRACT(DOW FROM ds.date)::INTEGER as day_of_week
        FROM date_series ds
    )
    SELECT
        di.date,
        di.day_of_week,

        -- Available slots based on coach rules
        COALESCE(
            JSON_AGG(
                JSON_BUILD_OBJECT(
                    'start_time', ar.start_time,
                    'end_time', ar.end_time
                ) ORDER BY ar.start_time
            ) FILTER (WHERE ar.is_available = TRUE),
            '[]'
        ) as available_slots,

        -- Blocked time slots
        COALESCE(
            JSON_AGG(
                JSON_BUILD_OBJECT(
                    'start_time', cbd.start_time,
                    'end_time', cbd.end_time,
                    'reason', cbd.reason,
                    'all_day', cbd.all_day
                )
            ) FILTER (WHERE cbd.blocked_date IS NOT NULL),
            '[]'
        ) as blocked_slots,

        -- Already booked slots
        COALESCE(
            JSON_AGG(
                JSON_BUILD_OBJECT(
                    'start_time', b.start_time,
                    'end_time', b.end_time,
                    'status', b.status,
                    'service_name', cs.service_name
                ) ORDER BY b.start_time
            ) FILTER (WHERE b.id IS NOT NULL),
            '[]'
        ) as booked_slots

    FROM date_info di
    LEFT JOIN public.coach_availability_rules ar
        ON ar.coach_id = p_coach_id AND ar.day_of_week = di.day_of_week
    LEFT JOIN public.coach_blocked_dates cbd
        ON cbd.coach_id = p_coach_id AND cbd.blocked_date = di.date
    LEFT JOIN public.bookings b
        ON b.coach_id = p_coach_id
        AND b.session_date = di.date
        AND b.status IN ('pending', 'confirmed', 'in_progress')
    LEFT JOIN public.coach_services cs ON b.service_id = cs.id

    GROUP BY di.date, di.day_of_week
    ORDER BY di.date;
END;
$$ language 'plpgsql';

-- Function to get booking statistics for a coach
CREATE OR REPLACE FUNCTION public.get_coach_stats(p_coach_id UUID)
RETURNS TABLE(
    total_bookings INTEGER,
    completed_sessions INTEGER,
    upcoming_sessions INTEGER,
    total_revenue DECIMAL(10,2),
    average_rating DECIMAL(3,2),
    total_reviews INTEGER,
    this_month_bookings INTEGER,
    cancellation_rate DECIMAL(5,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(*)::INTEGER as total_bookings,
        COUNT(*) FILTER (WHERE status = 'completed')::INTEGER as completed_sessions,
        COUNT(*) FILTER (WHERE status IN ('confirmed', 'pending') AND session_date >= CURRENT_DATE)::INTEGER as upcoming_sessions,
        COALESCE(SUM(total_price_myr) FILTER (WHERE status = 'completed'), 0) as total_revenue,
        COALESCE(AVG(r.rating), 0)::DECIMAL(3,2) as average_rating,
        COUNT(r.id)::INTEGER as total_reviews,
        COUNT(*) FILTER (WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE))::INTEGER as this_month_bookings,
        CASE
            WHEN COUNT(*) > 0 THEN
                (COUNT(*) FILTER (WHERE status LIKE 'cancelled_%')::DECIMAL / COUNT(*) * 100)::DECIMAL(5,2)
            ELSE 0
        END as cancellation_rate
    FROM public.bookings b
    LEFT JOIN public.reviews r ON b.id = r.booking_id
    WHERE b.coach_id = p_coach_id;
END;
$$ language 'plpgsql';

-- ============================================================================
-- 5. FINAL GRANT PERMISSIONS
-- ============================================================================

-- Grant permissions on views
GRANT SELECT ON public.coach_directory TO anon, authenticated;
GRANT SELECT ON public.coach_availability_summary TO anon, authenticated;
GRANT SELECT ON public.student_dashboard TO authenticated;
GRANT SELECT ON public.coach_dashboard TO authenticated;
GRANT SELECT ON public.popular_coaches TO anon, authenticated;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION public.refresh_popular_coaches TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_coach_availability_detailed TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_coach_stats TO authenticated;

-- ============================================================================
-- 6. FINAL COMMENTS AND DOCUMENTATION
-- ============================================================================

COMMENT ON VIEW public.coach_directory IS 'Comprehensive coach directory with services, ratings, and reviews';
COMMENT ON VIEW public.coach_availability_summary IS 'Complete availability information for booking system';
COMMENT ON VIEW public.student_dashboard IS 'Student dashboard with bookings, reviews, and coach information';
COMMENT ON VIEW public.coach_dashboard IS 'Coach dashboard with bookings, student details, and earnings';
COMMENT ON MATERIALIZED VIEW public.popular_coaches IS 'Pre-computed popular coaches ranking for performance';

COMMENT ON FUNCTION public.get_coach_availability_detailed IS 'Returns detailed availability for date range with blocks and bookings';
COMMENT ON FUNCTION public.get_coach_stats IS 'Returns comprehensive statistics for a coach including revenue and ratings';
COMMENT ON FUNCTION public.refresh_popular_coaches IS 'Manually refresh the popular coaches materialized view';

-- ============================================================================
-- MIGRATION COMPLETED: ADVANCED VIEWS & OPTIMIZATIONS
-- ============================================================================

-- Note: Materialized view refresh should be scheduled via Supabase Edge Functions or external cron
-- Example: SELECT public.refresh_popular_coaches(); -- Run periodically