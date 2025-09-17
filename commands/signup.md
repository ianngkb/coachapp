You are a senior full-stack engineer working in Next.js (App Router) + React + TypeScript with Tailwind and shadcn/ui, integrating Supabase (Auth + Postgres). Build production-grade Sign Up and Sign In pages that *faithfully replicate the attached UI screenshots* (“Sign Up”, “Sign In”, and “Sign Up Success/Check your email”). After the UI is built, wire up full Magic Link authentication with Supabase and ensure a DB row is inserted into public.users as soon as the user clicks “Create account”, with is_verified=false until they confirm via email.

====================================
ROLE & SCOPE
====================================
- Role: Implementer with authority to choose best-practice patterns, file structure, and security defaults.
- Scope:
  1) Pixel-accurate UI for Sign Up + Sign In + Success (email sent) screen, following the attached references.
  2) Fully working Magic Link auth via Supabase (email OTP link).
  3) On “Create account” click, immediately insert a row into public.users with is_verified=false (pre-verification), then auto-flip is_verified=true once the user confirms their email.
  4) Include robust UX states (loading, success, error), and secure server routes.
- Constraints:
  - Keep everything in a single Next.js app with App Router.
  - Don’t use experimental/no-longer-maintained libs.
  - Production-ready: strong typing, error handling, input validation, and RLS-safe DB access.

====================================
TECH STACK & LIBRARIES
====================================
- Framework: Next.js (App Router), React 18, TypeScript
- Styling: Tailwind CSS; shadcn/ui for inputs, labels, buttons, alerts; lucide-react for icons if needed
- Auth + DB: Supabase JS v2; Postgres on Supabase
- Forms & Validation: React Hook Form + Zod
- State: Minimal local state; no heavy global state
- Email deep link: Supabase’s Magic Link (gotrue)
- env: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY for client; SUPABASE_SERVICE_ROLE_KEY for server route

====================================
UI / UX REQUIREMENTS (MIRROR THE ATTACHMENTS)
====================================
Treat the attached screenshots as the UI source of truth. Replicate:
- Layout: overall spacing, container widths, vertical rhythm, padding, and alignment.
- Colors: backgrounds, text colors, button fills/hover/disabled, input borders, placeholder color, link color.
- Typography: font family, weights, sizes, line-height, letter-spacing.
- Components:
  - Page shell: centered auth card on desktop; comfortable padding on mobile.
  - Logo/brand area (if shown), headline, supporting copy.
  - Form fields (Sign Up): Full name (optional if not in screenshot), Email (required), Password (only if the design includes it—if not, omit and clearly present “Magic Link” flow), Terms checkbox if present.
  - Form fields (Sign In): Email (required); if the design shows password, include; otherwise present “Send magic link”.
  - Buttons: Primary action (Create account / Sign in), alternate action (e.g., “Sign in with Google” if shown; otherwise omit).
  - Ancillary links: “Already have an account? Sign in” or “Don’t have an account? Create one”.
  - Error/success toasts: inline error messages beneath fields; non-blocking toast for form-level outcomes.
- Success screen: A “Check your email” confirmation state matching the provided success page—include explanation text and a button like “Open mail app” (mobile hint) and “Resend link” with cooldown.

If any element is ambiguous in the screenshots, use modern, minimal defaults and note them in comments.

====================================
INFORMATION ARCHITECTURE & ROUTES
====================================
- Routes:
  - /sign-in
  - /sign-up
  - /sign-up/sent  (Magic Link sent / success state screen)
  - /api/auth/precreate-user   (server route)
  - /api/auth/verify-webhook   (optional: receives Supabase auth webhook, see below)
- Post-login redirect:
  - After magic link confirmation, redirect to /dashboard (configurable via env or constant).
- Deep links:
  - Use Supabase’s built-in email confirmation handler; ensure NEXT_PUBLIC_SITE_URL is set and Auth → URL config is correct.

====================================
DATA MODEL & SECURITY
====================================
- Table: public.users
  - id: uuid (PK) — **should match auth.users.id when available**
  - email: text (unique not null)
  - full_name: text (nullable if not collected at sign-up)
  - is_verified: boolean not null default false
  - created_at: timestamptz default now()
  - updated_at: timestamptz default now()
  - signup_source: text default 'email_magic_link'  (optional)
  - status: text default 'pending'  (optional)
- RLS:
  - Enable RLS on public.users.
  - Policies:
    1) Insert (pre-verification) only via server route with Service Role (no anon insert). This is safest.
    2) Select/update by the owner (auth.uid() = users.id) once linked.
- Triggers:
  - updated_at trigger on UPDATE to keep timestamps fresh.

====================================
AUTH FLOWS & DB INSERTION LOGIC
====================================
Goal: “Create account” immediately writes to public.users with is_verified=false, *before* email verification.

Two safe patterns — choose #1 by default:

1) **Server Route + Service Role (recommended):**
   - On submit at /sign-up:
     a) Client calls POST /api/auth/precreate-user with { email, full_name? }.
     b) API validates input, checks if a user row already exists with same email; if not, inserts:
        - email
        - full_name (if provided)
        - is_verified=false
        - status='pending'
     c) API returns 200 even if row already exists (idempotent semantics).
   - Then the client calls supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: "<SITE_URL>/dashboard" } }).
   - Navigate to /sign-up/sent with state showing “Check your email”.

   On email confirmation:
   - Option A (DB trigger): Create a Postgres trigger that listens for changes to auth.users where email_confirmed_at is not null; when a matching email is confirmed, update public.users.is_verified=true and link id if needed (e.g., by matching email first, then updating users.id to auth.uid()).
   - Option B (Webhook): Configure Supabase Auth webhooks (GoTrue) to hit /api/auth/verify-webhook. On “USER_CONFIRMED” (or equivalent) event with email/user_id, set is_verified=true and set users.id = auth.user.id (if you initially created the row without id).

2) **Anon Insert with Tight RLS (not recommended unless you must):**
   - Allow insert to public.users where is_verified=false AND auth.role()='anon' AND now() - created_at < interval '5 minutes', etc.
   - This is trickier and less secure; prefer server route + service role.

**Linking IDs cleanly (recommended approach):**
- Precreate row with email only (no id).
- After confirmation, a DB trigger (on auth.users) finds public.users by email and sets:
  - users.id := auth.users.id
  - users.is_verified := true
  - users.status := 'active'

====================================
FORM & VALIDATION
====================================
- Use React Hook Form + Zod schema:
  - email: required, RFC 5322 compliant
  - full_name: optional unless UI requires
  - Accept T&Cs if present: required boolean
- Disable submit while pending; show spinner on the button.
- Handle errors:
  - Email already registered → Show inline message, still allow “Resend link” action.
  - Network/Supabase errors → Show toast + inline error.

====================================
IMPLEMENTATION STEPS (DO THESE IN ORDER)
====================================
1) **Scaffold**
   - Create Next.js app with App Router, Tailwind, shadcn/ui installed.
   - Add supabase client (browser) and a supabaseAdmin client (server) using SUPABASE_SERVICE_ROLE_KEY.
   - Add shared UI primitives (Input, Label, Button, Form, Alert, Toaster).

2) **UI Reproduction**
   - Implement /sign-up to match the attached Sign Up design.
   - Implement /sign-in to match the attached Sign In design.
   - Implement /sign-up/sent (“Check your email”) to match the success screen.
   - Ensure responsive behavior faithful to the screenshots (mobile/desktop).

3) **DB & RLS**
   - Create public.users table and indexes.
   - Add updated_at trigger.
   - Enable RLS. Add owner-read/update policy; restrict inserts to service role only.

4) **Server Route for Pre-Creation**
   - /api/auth/precreate-user (POST): zod-validate payload; idempotently insert a pending user row by email with is_verified=false. Use service role client.
   - Return 200 with { ok: true } whether row was created or already exists.

5) **Sign Up Flow Wiring**
   - On submit:
     a) await fetch('/api/auth/precreate-user', { method:'POST', body: {email, full_name} })
     b) await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: `${SITE_URL}/dashboard` } })
     c) route.push('/sign-up/sent?email='+encodeURIComponent(email))
   - Show resend with cooldown (e.g., 30–60s).

6) **Verification → is_verified=true**
   - Preferred: DB trigger on auth.users updates public.users on email_confirmed_at NOT NULL.
     * Pseudocode: on UPDATE of auth.users when NEW.email_confirmed_at IS NOT NULL AND OLD.email_confirmed_at IS NULL:
       - UPDATE public.users SET id=NEW.id, is_verified=true, status='active' WHERE email=NEW.email;
   - Alternative: configure Auth webhook to /api/auth/verify-webhook and perform the same update server-side.

7) **Sign In Flow**
   - /sign-in sends magic link to provided email.
   - On success, route to a “Check your email” message or inline success state.
   - On deep-link return (post-auth), supabase client has a session; redirect to /dashboard.
   - If a user signed up but never confirmed, still allow re-sending link.

8) **Edge Cases**
   - Email already exists in auth.users but no public.users row → create missing row on first session (server guard).
   - User clicks multiple times → idempotent precreate route; no duplicates.
   - Disposable emails → optional: block known disposable domains.
   - Rate-limit resend link on client and server.

9) **QA & Tests**
   - Unit test zod schemas.
   - Integration test /api/auth/precreate-user happy & duplicate paths.
   - E2E (Playwright) for sign-up → success → email confirm (simulate) → is_verified flips to true → sign-in.

====================================
FILE / CODE STRUCTURE (SUGGESTED)
====================================
- /app
  - /sign-up/page.tsx
  - /sign-up/sent/page.tsx
  - /sign-in/page.tsx
  - /dashboard/page.tsx (placeholder)
  - /api/auth/precreate-user/route.ts
  - /api/auth/verify-webhook/route.ts (optional)
- /lib
  - supabaseClient.ts (browser)
  - supabaseAdmin.ts (server, service role)
  - validations/auth.ts (zod)
- /db
  - schema.sql (public.users, triggers, policies)
  - triggers.sql (auth.users → public.users sync)
- /components
  - ui/* (shadcn)
  - auth/* (forms, success state)
- /e2e
  - signup.spec.ts, signin.spec.ts

====================================
SCHEMA & SQL (EXACT)
====================================
-- Create table
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY,                 -- will be set to auth.users.id upon verify
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END $$;

DROP TRIGGER IF EXISTS trg_touch_updated_at ON public.users;
CREATE TRIGGER trg_touch_updated_at
BEFORE UPDATE ON public.users
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- RLS & policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Allow the logged-in owner to read/update their own row
CREATE POLICY users_owner_select ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY users_owner_update ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- No anon inserts; only service role route will insert.
-- (No insert policy needed when using service role key.)

-- Trigger to flip is_verified on auth email confirmation
-- (Requires Postgres function to react to auth.users changes via replica identity or via a periodic job; simplest is an AFTER INSERT/UPDATE trigger in a shadow table provided by Supabase “auth” schema.)
-- If direct triggers on auth.users are restricted, implement the webhook instead.

====================================
SERVER ROUTE (PRECREATE) – PSEUDOCODE
====================================
/api/auth/precreate-user (POST)
- Parse { email, full_name? } with zod.
- With supabaseAdmin (service role):
  - SELECT public.users WHERE email = $1
  - IF not found: INSERT (email, full_name, is_verified=false, status='pending')
  - Return { ok:true }
- Make idempotent: if found, still return { ok:true }.

====================================
ENV & SUPABASE SETTINGS
====================================
- .env
  NEXT_PUBLIC_SUPABASE_URL=
  NEXT_PUBLIC_SUPABASE_ANON_KEY=
  SUPABASE_SERVICE_ROLE_KEY=
  NEXT_PUBLIC_SITE_URL=https://your-domain.com
- Supabase Auth:
  - Confirm email required.
  - Email redirect URL: ${NEXT_PUBLIC_SITE_URL}/dashboard (or a guarded intermediary).
  - (Optional) Configure Auth Webhook to POST → /api/auth/verify-webhook on “user confirmed”.

====================================
ACCEPTANCE CRITERIA
====================================
1) Visual parity: Auth pages match the attached designs (spacing, colors, typography, component states).
2) Creating account:
   - Clicking “Create account” runs precreate API (idempotent) → row exists in public.users with is_verified=false before any email click.
   - Magic link is sent; user sees success screen.
3) Verifying email:
   - After confirmation, public.users row is updated: id = auth.users.id, is_verified=true, status='active'.
4) Signing in:
   - Magic link sign in succeeds; user lands on /dashboard.
5) Error handling:
   - Duplicate email shows a gentle error and offers “Resend link”.
   - Network/server failures produce clear inline + toast messages.
6) Security:
   - No anon insert to public.users (server route uses service role).
   - RLS policies prevent cross-user reads/writes.
7) Tests:
   - E2E: sign-up → email sent → (simulate confirm) → verified flips → sign-in works.
   - Integration: precreate route is idempotent.

====================================
DELIVERABLES
====================================
- Pixel-accurate /sign-up, /sign-in, /sign-up/sent pages.
- Working Magic Link auth.
- public.users table, triggers/webhook, RLS policies.
- /api/auth/precreate-user server route (service role).
- Basic Playwright tests for the flows.
- README snippet with setup steps.

Build now. If any UI detail is not visible in the screenshots, choose sensible defaults and leave inline comments noting the assumption.
