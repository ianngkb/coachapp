-- Fix Missing Database Components
-- Create missing booking_summary view and fix get_coach_rating_stats function

-- Drop and recreate the get_coach_rating_stats function with correct return type
DROP FUNCTION IF EXISTS get_coach_rating_stats(UUID);

CREATE OR REPLACE FUNCTION get_coach_rating_stats(p_coach_id UUID)
RETURNS TABLE(
    total_reviews BIGINT,
    average_rating DECIMAL(3,2),
    rating_distribution JSONB
) LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(*)::BIGINT as total_reviews,
        COALESCE(AVG(rating)::DECIMAL(3,2), 0.00) as average_rating,
        COALESCE(
            jsonb_build_object(
                '5', COUNT(*) FILTER (WHERE rating = 5),
                '4', COUNT(*) FILTER (WHERE rating = 4),
                '3', COUNT(*) FILTER (WHERE rating = 3),
                '2', COUNT(*) FILTER (WHERE rating = 2),
                '1', COUNT(*) FILTER (WHERE rating = 1)
            ),
            '{"1":0,"2":0,"3":0,"4":0,"5":0}'::jsonb
        ) as rating_distribution
    FROM reviews
    WHERE coach_id = p_coach_id AND is_public = TRUE;
END;
$$;

-- Create booking_summary view
CREATE OR REPLACE VIEW booking_summary AS
SELECT
    b.id,
    b.booking_reference,
    b.session_date,
    b.start_time,
    b.end_time,
    b.status,
    b.total_price_myr,

    -- Student information
    u_student.full_name as student_name,
    u_student.phone_number as student_phone,

    -- Coach information
    u_coach.full_name as coach_name,
    cp.business_name as coach_business,

    -- Service and sport information
    cs.service_name,
    s.name as sport_name,

    -- Court information
    c.name as court_name,
    c.address as court_address,

    -- Timestamps
    b.created_at,
    b.updated_at

FROM bookings b
LEFT JOIN users u_student ON b.student_id = u_student.id
LEFT JOIN users u_coach ON b.coach_id = u_coach.id
LEFT JOIN coach_profiles cp ON b.coach_id = cp.user_id
LEFT JOIN coach_services cs ON b.service_id = cs.id
LEFT JOIN sports s ON cs.sport_id = s.id
LEFT JOIN courts c ON b.court_id = c.id;

-- Grant appropriate permissions
GRANT SELECT ON booking_summary TO authenticated;
GRANT EXECUTE ON FUNCTION get_coach_rating_stats(UUID) TO authenticated, anon;