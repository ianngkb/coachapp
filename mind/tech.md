# Coach Booking Marketplace - Complete Tech Stack Documentation

## 📱 Application Overview
A comprehensive coach booking marketplace application with mobile-first design, featuring passwordless authentication, coach discovery, real-time booking, and integrated calendar management across various sports.

## 🏗️ Core Architecture

### Frontend Framework
- Framework: Next.js (App Router) + React 18
- **Single Page Application (SPA)** with state-based routing
- **Mobile-first responsive design** with one-thumb usability principles

### State Management
- **TanStack Query** for server state (coaches, availability, bookings) with caching, refetching, and error handling  
- **Zustand/React Context** for lightweight local UI state (toggles, filters, navigation)  
- **Authentication state** managed globally (Supabase Auth) and shared via Context/Zustand  
- **User type switching** (student/coach) handled through global state with role-based navigation  

## 🎨 Design System & Styling

### CSS Framework
- **Tailwind CSS v4** - Latest version with enhanced features
- **Custom CSS variables** for design tokens
- **Dark mode support** with automatic color scheme switching





## 🧩 UI Component Library

### shadcn/ui Components (Complete Set)
**Layout & Navigation**
- `accordion.tsx` - Collapsible content sections
- `breadcrumb.tsx` - Navigation breadcrumbs
- `navigation-menu.tsx` - Primary navigation
- `sidebar.tsx` - Side navigation panels
- `tabs.tsx` - Tabbed content organization

**Form Elements**
- `button.tsx` - Primary, secondary, tertiary variants
- `input.tsx` - Text input fields with validation states
- `textarea.tsx` - Multi-line text input
- `select.tsx` - Dropdown selection
- `checkbox.tsx` - Boolean input controls
- `radio-group.tsx` - Single choice selection
- `switch.tsx` - Toggle controls
- `slider.tsx` - Range input controls
- `form.tsx` - Form wrapper with validation
- `label.tsx` - Form field labels
- `input-otp.tsx` - One-time password input

**Feedback & Overlays**
- `dialog.tsx` - Modal dialogs
- `sheet.tsx` - Slide-in panels
- `drawer.tsx` - Bottom drawer component
- `popover.tsx` - Contextual overlays
- `tooltip.tsx` - Hover information
- `hover-card.tsx` - Rich hover content
- `alert.tsx` - Notification messages
- `alert-dialog.tsx` - Confirmation dialogs
- `sonner.tsx` - Toast notifications

**Data Display**
- `card.tsx` - Content containers
- `table.tsx` - Data tables
- `badge.tsx` - Status indicators
- `avatar.tsx` - User profile images
- `calendar.tsx` - Date picker component
- `chart.tsx` - Data visualization (Recharts integration)
- `progress.tsx` - Progress indicators
- `skeleton.tsx` - Loading placeholders

**Interactive Elements**
- `dropdown-menu.tsx` - Action menus
- `context-menu.tsx` - Right-click menus
- `menubar.tsx` - Menu bar navigation
- `command.tsx` - Command palette
- `collapsible.tsx` - Expandable sections
- `carousel.tsx` - Image/content carousels
- `pagination.tsx` - Page navigation

**Layout Utilities**
- `scroll-area.tsx` - Custom scrollbars
- `separator.tsx` - Visual dividers
- `aspect-ratio.tsx` - Responsive containers
- `resizable.tsx` - Adjustable panels
- `toggle.tsx` - Toggle buttons
- `toggle-group.tsx` - Toggle button groups

**Utility Files**
- `use-mobile.ts` - Mobile detection hook
- `utils.ts` - Shared utility functions

## 🔧 Additional Libraries

### Icons
- **Lucide React** - Modern, clean SVG icons
- Commonly used: `Calendar`, `Clock`, `User`, `MapPin`, `Star`, `Search`, `Filter`

### Date & Time Handling
- **date-fns** - Comprehensive date manipulation
  - `format()` - Date formatting
  - `parseISO()` - ISO string parsing
  - `isToday()`, `isTomorrow()`, `isThisWeek()` - Date comparisons
  - `addDays()`, `isSameDay()` - Date calculations

### Notifications
- **Sonner v2.0.3** - Toast notification system
- Integration with shadcn/ui toast component
- Success, error, and info message variants

### Form Handling
- **React Hook Form v7.55.0** - Form state management
- Built-in validation support
- Performance optimized re-rendering

### Calendar Integration
- **Custom ICS file generation** - Download calendar events
- **Google Calendar integration** (coach-only feature)
- **Conflict detection** and automatic sync capabilities

## 🌐 Backend & Infrastructure

### Database & Backend Services

**Database (Primary)**
- **Supabase Postgres (Singapore region)** – single source of truth for users, services, availability, exceptions, time-off, bookings.
- **Security:** Row Level Security (RLS) for coach/student/admin; least-privilege policies on all tables.
- **Reliability:** Automated backups + Point-in-Time Recovery; quarterly restore tests.
- **Performance:** Targeted composite indexes (e.g., `(coach_id, starts_at)`), and partial indexes on active/listed records.
- **Views:** Optional materialized views for per-day slot expansion if slot queries get hot.
- **Migrations:** Versioned SQL migrations in repo; reviewed via PR.

**Backend (MVP)**
- **Runtime:** Next.js API routes (TypeScript) as a Backend-for-Frontend (BFF).
- **Scheduling Engine:** Server module that:
  - Normalizes and computes availability in **GMT+8** (weekly rules + exceptions + time-off).
  - Applies service buffers, min-notice, max-advance.
  - Slices bookable slots and validates in a **DB transaction** to prevent overlaps.
- **Caching:** **Upstash Redis** short-TTL cache for `(coachId, serviceId, date)` slot results (e.g., 30–60s).
- **Async Jobs:** **QStash** or **Supabase Edge Functions** for email sends, cleanup, and (later) calendar write-backs.
- **Rate Limiting:** **Upstash Rate Limit** on slot search and booking endpoints.
- **Contracts:** REST endpoints with **Zod** validation; consistent error model; idempotency keys on bookings.
- **Integrations:** Google Calendar (OAuth2 for coaches, bi-directional sync planned post-MVP)
- Google Calendar API (for coach calendar sync and conflict detection)

**Scale Path (when needed)**
- **Service split:** Promote the Scheduling Engine to a small Fastify/Hono service (still TS), keep Next.js as web BFF.
- **DB scale:** Read replicas for analytics; move heavy reads (directory, public profiles) behind ISR/Edge caching.
- **Queues:** Graduate to managed queue (e.g., QStash/Cloud Tasks) for high-volume reminders & syncs.
- **Observability:** Add OpenTelemetry traces from API → DB; SLOs on p95 slot query & booking latency.

**Operational Defaults**
- **Regions:** Keep API and DB in Singapore to align with GMT+8 users.
- **Secrets:** Managed via Vercel/Supabase env vars; no secrets in code.
- **Testing:** Concurrency tests around booking creation; fixtures for edge cases (buffers, exceptions, min-notice).

### Authentication System
- **Magic link authentication** (passwordless)
- **Email validation** with comprehensive sign-up flow
- **Role-based access** (student/coach)
- **Session management** with automatic routing

### API Architecture
- **RESTful API** endpoints via Supabase Edge Functions
- **Hono web framework** for server routing
- **Key-value store** for flexible data storage
- **File upload** and storage management

## 📱 Application Features

### Core Functionality
1. **Coach Directory** - Browse and filter coaches
2. **Coach Profiles** - Detailed coach information with services
3. **Booking System** - Real-time availability and scheduling
4. **User Dashboards** - Role-specific management interfaces
5. **Profile Management** - Comprehensive user profile editing
6. **Review System** - Post-session rating and feedback

### Advanced Features
1. **Preferred Courts System** - Coach location preferences
2. **Google Calendar Integration** - Automated scheduling sync
3. **Email Notifications** - Booking confirmations and updates
4. **Calendar File Downloads** - .ics file generation for students
5. **Malaysian Localization** - RM currency, local phone formatting
6. **Accessibility Compliance** - WCAG guidelines implementation

### Mobile Optimization
- **One-thumb usability** design principles
- **Touch-friendly interfaces** with adequate tap targets
- **Responsive layouts** adapting to all screen sizes
- **Progressive Web App** capabilities

## 🗂️ File Structure Organization

```
/components
  /auth          - Authentication flows
  /booking       - Booking process components
  /calendar      - Calendar integration features
  /coaches       - Coach-related components
  /dashboard     - User dashboard interfaces
  /figma         - Design import utilities
  /layout        - Shared layout components
  /reviews       - Review and rating system
  /ui            - shadcn/ui component library

/utils
  /supabase      - Database connection utilities
  - api.ts       - API helper functions
  - auth.ts      - Authentication utilities
  - calendar.ts  - Calendar file generation

/styles
  - globals.css  - Global styles and design tokens

/supabase
  /functions
    /server      - Backend Edge Functions
```

## 🔒 Security & Data Management

### Data Storage
- **Key-value store** for flexible application data
- **Secure file storage** with private buckets
- **Environment variables** for sensitive configuration
- **API key management** with secure secret handling

### Authentication Security
- **Magic link validation** with email verification
- **Session token management** with automatic expiry
- **Role-based access control** throughout application
- **Secure API endpoints** with proper authorization

## 🌍 Localization & Regional Features

### Malaysian Market Focus
- **Malaysian Ringgit (RM)** currency display
- **Malaysian phone number** formatting and validation
- **Location restrictions** to Kuala Lumpur and Selangor
- **Local court preferences** and location data

### Timezone Handling
- **Consistent timezone** management across features
- **Calendar integration** with proper timezone conversion
- **Booking system** timezone awareness

## 🎯 Performance Optimizations

### Frontend Performance
- **React.useMemo()** for expensive computations
- **Component lazy loading** where appropriate
- **Optimized re-rendering** with proper dependency arrays
- **Image optimization** with fallback handling
- **Slot prefetching and client-side caching** with TanStack Query to minimize repeat API calls and keep availability views responsive

### Backend Performance
- **Edge function optimization** for fast response times
- **Database query optimization** with proper indexing
- **Caching strategies** for frequently accessed data
- **File storage optimization** with CDN delivery
- **Slot computation caching** using Upstash Redis for frequently accessed availability queries (per coach/service/date), reducing load on the database and improving response times


## 🔄 Development Workflow

### Code Organization
- **Component-based architecture** with clear separation of concerns
- **TypeScript interfaces** for type safety
- **Consistent naming conventions** across components
- **Modular utility functions** for reusability

### State Management Patterns
-Server state with TanStack Query (auto caching, refetching).
-Local UI state with Zustand/Context.
-Auth & role management globally via Supabase Auth.

This comprehensive tech stack provides a solid foundation for a production-ready coach booking marketplace with modern development practices, excellent user experience, and scalable architecture.