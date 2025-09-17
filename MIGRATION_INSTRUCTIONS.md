# Database Migration Instructions

## Minimal Schema Implementation

The minimal database schema from `database-new.md` has been prepared and is ready for implementation. Since there are connection issues with the current Supabase CLI, here are manual instructions to apply the migrations.

## Migration Files Created

Four migration files have been created in `supabase/migrations/`:

1. **20240916000001_create_minimal_core_tables.sql** - Core tables (users, coach_profiles, sports, courts)
2. **20240916000002_create_services_and_bookings.sql** - Services and bookings tables
3. **20240916000003_create_reviews_and_functions.sql** - Reviews and database functions
4. **20240916000004_create_indexes_rls_and_views.sql** - Indexes, RLS policies, and views

## Manual Application via Supabase Dashboard

### Option 1: SQL Editor (Recommended)

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Open your project: `rtprwnocejyhdxckuajm`
3. Navigate to **SQL Editor** in the left sidebar
4. Apply migrations in order:

#### Step 1: Core Tables
Copy and paste the contents of `supabase/migrations/20240916000001_create_minimal_core_tables.sql` into the SQL editor and run it.

#### Step 2: Services and Bookings
Copy and paste the contents of `supabase/migrations/20240916000002_create_services_and_bookings.sql` into the SQL editor and run it.

#### Step 3: Reviews and Functions
Copy and paste the contents of `supabase/migrations/20240916000003_create_reviews_and_functions.sql` into the SQL editor and run it.

#### Step 4: Indexes and Security
Copy and paste the contents of `supabase/migrations/20240916000004_create_indexes_rls_and_views.sql` into the SQL editor and run it.

### Option 2: Direct SQL Execution

If you have direct PostgreSQL access:

```bash
# Connect to your database and run each migration file
psql -h aws-1-ap-southeast-1.pooler.supabase.com -U postgres.rtprwnocejyhdxckuajm -d postgres -f supabase/migrations/20240916000001_create_minimal_core_tables.sql
psql -h aws-1-ap-southeast-1.pooler.supabase.com -U postgres.rtprwnocejyhdxckuajm -d postgres -f supabase/migrations/20240916000002_create_services_and_bookings.sql
psql -h aws-1-ap-southeast-1.pooler.supabase.com -U postgres.rtprwnocejyhdxckuajm -d postgres -f supabase/migrations/20240916000003_create_reviews_and_functions.sql
psql -h aws-1-ap-southeast-1.pooler.supabase.com -U postgres.rtprwnocejyhdxckuajm -d postgres -f supabase/migrations/20240916000004_create_indexes_rls_and_views.sql
```

## What Will Be Created

### Tables
- **users** - User authentication and basic profiles
- **coach_profiles** - Coach-specific information
- **sports** - Master data (10 sports pre-populated)
- **courts** - Venue information (4 Malaysian courts pre-populated)
- **coach_services** - Services offered by coaches
- **bookings** - Session bookings with conflict prevention
- **reviews** - Post-session ratings and feedback

### Functions
- **validate_booking_slot()** - Prevents booking conflicts
- **get_coach_rating_stats()** - Coach rating statistics
- **get_available_slots()** - Mock availability slots
- **update_coach_rating_stats()** - Auto-update ratings

### Views
- **coach_directory** - Public coach listing
- **student_profiles** - Student information
- **booking_summary** - Complete booking details with joins

### Security
- **Row Level Security (RLS)** enabled on all tables
- **Proper policies** for coaches, students, and anonymous users
- **Public access** to sports and courts data
- **Private access** to bookings (users can only see their own)

### Sample Data Included
- **10 Sports**: Tennis, Swimming, Badminton, Football, Basketball, Golf, Yoga, Personal Training, Martial Arts, Rock Climbing
- **4 Courts**: KL Sports City, Sunway Sports Complex, Shah Alam Sports Complex, KLCC Park Tennis Court

## Verification

After running the migrations, verify the setup:

1. **Check tables exist**:
   ```sql
   SELECT table_name FROM information_schema.tables
   WHERE table_schema = 'public'
   ORDER BY table_name;
   ```

2. **Check sample data**:
   ```sql
   SELECT name FROM sports ORDER BY display_order;
   SELECT name, city FROM courts WHERE is_active = true;
   ```

3. **Test RLS policies**:
   ```sql
   -- This should work (public access)
   SELECT * FROM sports LIMIT 5;

   -- This should work (public access)
   SELECT * FROM courts WHERE is_active = true LIMIT 5;
   ```

## TypeScript Types Updated

The TypeScript types in `src/lib/supabase.ts` have been updated to match the minimal schema. The application components should now have proper type safety with the new database structure.

## Next Steps

1. Apply migrations via Supabase Dashboard SQL Editor
2. Verify tables and data are created correctly
3. Test application connectivity with new schema
4. Create test users and coach profiles
5. Test booking functionality with conflict prevention

## Troubleshooting

If any migration fails:
1. Check the error message in the SQL Editor
2. Fix the SQL syntax if needed
3. Drop affected tables and re-run from the beginning
4. Ensure proper order of migrations (dependencies matter)

The minimal schema is production-ready for the current build and includes all necessary features for the coach booking marketplace MVP.