-- Fix Audit Trigger - Coach Profile Table
-- The audit trigger was referencing 'id' field but coach_profiles uses 'user_id'

-- Drop the problematic audit trigger
DROP TRIGGER IF EXISTS audit_coach_profiles ON public.coach_profiles;

-- Create a corrected audit trigger function for coach_profiles
CREATE OR REPLACE FUNCTION public.audit_coach_profiles_trigger()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.audit_logs (
        user_id, table_name, record_id, action, old_values, new_values
    ) VALUES (
        auth.uid(),
        'coach_profiles',
        COALESCE(NEW.user_id, OLD.user_id), -- Use user_id instead of id
        TG_OP,
        CASE WHEN TG_OP = 'DELETE' THEN row_to_json(OLD) ELSE NULL END,
        CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN row_to_json(NEW) ELSE NULL END
    );
    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- Apply the corrected audit trigger to coach_profiles
CREATE TRIGGER audit_coach_profiles
    AFTER INSERT OR UPDATE OR DELETE ON public.coach_profiles
    FOR EACH ROW EXECUTE FUNCTION public.audit_coach_profiles_trigger();

-- Also fix the get_coach_rating_stats function return type
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
        COALESCE(ROUND(AVG(rating), 2), 0.00)::DECIMAL(3,2) as average_rating,
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

COMMENT ON FUNCTION public.get_coach_rating_stats IS 'Fixed: Returns detailed rating statistics for a coach with correct return type';