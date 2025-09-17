-- Temporary fix: Remove foreign key constraint on users.id
-- This allows us to create users without requiring them to exist in auth.users first

-- Find the constraint name and remove it
DO $$
DECLARE
    r RECORD;
BEGIN
    -- Find foreign key constraints on users table that reference auth schema
    FOR r IN
        SELECT conname, conrelid::regclass as table_name
        FROM pg_constraint
        WHERE confrelid IN (
            SELECT oid
            FROM pg_class
            WHERE relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'auth')
        )
        AND conrelid = 'public.users'::regclass
    LOOP
        EXECUTE 'ALTER TABLE ' || r.table_name || ' DROP CONSTRAINT IF EXISTS ' || r.conname;
        RAISE NOTICE 'Dropped foreign key constraint: %', r.conname;
    END LOOP;
END $$;

-- Also check if there are any references to auth.users in the users table
-- and remove the foreign key constraint on the id column specifically
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_id_fkey;
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS fk_users_auth_id;
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_auth_id_fkey;

-- Verify the table structure
\d public.users;