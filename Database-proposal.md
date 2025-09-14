### Database Proposal (Supabase / Postgres)

This document outlines a pragmatic schema to support the current UI: coach profiles, services, student profiles, booking sessions, weekly availability, blocked dates, and reviews. It’s designed for Supabase (Postgres + RLS).

### Goals
- Model coaches and students with role-based profiles
- Coaches define services and availability; students book sessions
- Handle in-person/online/hybrid, venues, and blocked periods
- Basic reviews post-session
- Secure access with RLS: public discovery, owner-managed data

### Core Entities
- profiles: 1 row per auth user (role: student|coach)
- coach_profiles, student_profiles: role-specific extensions
- sports & coach_sports: tagging and filtering
- venues & coach_preferred_venues: location choices
- coach_services: offer catalog (price, duration, capacity, mode)
- coach_availability_rules: recurring weekly windows
- coach_blocked_periods: exceptions (vacations, single days)
- sessions: bookings (status + timing + price + venue)
- reviews: student feedback after completed sessions

### Suggested Tables (high-level)
- profiles(id, role, full_name, email, phone, avatar_url, age, city, region, created_at, updated_at)
- coach_profiles(coach_id, years_experience, certifications[], languages[], specialties, bio, timezone)
- student_profiles(student_id)
- sports(id, name)
- coach_sports(coach_id, sport_id)
- venues(id, name, city, region)
- coach_preferred_venues(coach_id, venue_id)
- coach_services(id, coach_id, title, category, description, duration_min, mode, price, currency, max_students, active, created_at)
- coach_availability_rules(id, coach_id, day_of_week, start_time, end_time, enabled, slot_no)
- coach_blocked_periods(id, coach_id, title, type, start_at, end_at, created_at)
- sessions(id, coach_id, student_id, service_id, status, start_at, end_at, duration_min, price, currency, venue_id, location_text, notes, google_calendar_event_id, created_at)
- reviews(id, coach_id, student_id, service_id, rating, text, created_at)

### Key Enums
- user_role: student, coach
- service_mode: in_person, online, hybrid (maps UI: In-Person Only, Online Only, Online & In-Person)
- session_status: upcoming, completed, cancelled
- blocked_type: single_day, date_range

### Relationships
- profiles ↔ auth.users (1:1 via id)
- profiles (coach) ↔ coach_profiles (1:1)
- profiles (student) ↔ student_profiles (1:1)
- coach_services ↔ profiles(coach)
- sessions ↔ profiles(coach, student), coach_services, venues
- reviews ↔ profiles(coach, student), coach_services

### Access Control (RLS recommendations)
- Public read: profiles (safe fields), coach_profiles, coach_services, coach_availability_rules, coach_blocked_periods, venues, sports for discovery/browse
- Owner manage: each user can insert/update their own profile, services, availability, blocked periods, preferred venues, sports
- Sessions: both coach and student can read/update their shared session; students insert their own bookings
- Reviews: public read; insert only if a completed session exists between student and coach

### Operational Notes
- Default currency: MYR (RM). Use `numeric(10,2)` for prices
- Timezone: default `Asia/Kuala_Lumpur`; store session times as timestamptz
- Availability: compute bookable slots by combining weekly rules minus blocked periods minus existing sessions
- Group sessions: current UI shows `maxStudents`. For multi-student attendance, add `session_enrollments(session_id, student_id)` later
- Google Calendar: store `google_calendar_event_id` on `sessions`; tokens should live in a separate `user_integrations` table (owner-only RLS)

### Minimal Triggers
- On new auth user: create `profiles` row (default role could be `student`), copy email and optional `full_name` from metadata

### Migration Phasing (recommended)
1) Phase 1: profiles, role extensions, sports/venues, services, availability, blocked periods, sessions, enums, base RLS
2) Phase 2: reviews + RLS constraint (completed session)
3) Phase 3: auth trigger to auto-create profiles; optional seeds for sports and venues
4) Phase 4: search indexes (text, composite time indexes), reporting views

### Indexing (examples)
- coach_services(coach_id), coach_services(active)
- sessions(coach_id, start_at), sessions(student_id, start_at), sessions(status)
- reviews(coach_id)

### Seeds (optional)
- sports: Tennis, Badminton, Swimming, Basketball, etc.
- venues: common courts/centers in target cities

### Next Steps
- Approve this proposal
- I will generate a single SQL migration (Supabase-ready) with enums, tables, constraints, RLS policies, and minimal trigger for profile auto-create


