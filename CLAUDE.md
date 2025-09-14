# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Knowledge Base
**IMPORTANT**: When working on this application, always consult the comprehensive documentation in the `/mind` directory as your primary knowledge base:
- All technical decisions, architectural patterns, and implementation guidelines are documented there
- Refer to these files before making any coding decisions or architectural choices
- The `/mind` directory contains the complete specification for this coach booking marketplace application

## Project Overview
This is a mobile-first coach booking marketplace application focused on sports and skills training. The app connects coaches with students through a central directory and scheduling platform, specifically designed for the Malaysian market with GMT+8 timezone handling.

**Core Value Proposition**: A "Calendly for Coaches" with built-in discovery through a public coach directory, allowing students to browse, compare, and instantly book coaching sessions.

## Project Status
This project is currently in the **planning and documentation phase**. No source code has been implemented yet. The repository contains comprehensive design documents, technical specifications, and screen definitions that serve as the foundation for development.

## Key Documentation Files

### Design and Vision
- `mind/vision.md` - Core vision statement, problem definition, and success criteria
- `mind/identity.md` - Development guidelines and coding standards (React/Next.js/TypeScript focus)
- `mind/tech.md` - Complete technical architecture and technology stack decisions
- `mind/screens.md` - Detailed specification of all 12 application screens and user flows
- `design/homepage.md` - Homepage design specifications
- `design/homepage.png` - Homepage visual design reference

## Technology Stack (Planned)

### Frontend
- **Framework**: Next.js (App Router) + React 18
- **Styling**: Tailwind CSS v4 with custom design tokens
- **UI Components**: Complete shadcn/ui component library
- **State Management**:
  - TanStack Query for server state
  - Zustand/React Context for local UI state
- **Icons**: Lucide React
- **Date Handling**: date-fns
- **Forms**: React Hook Form
- **Notifications**: Sonner v2.0.3

### Backend
- **Database**: Supabase Postgres (Singapore region)
- **Authentication**: Magic link (passwordless) via Supabase Auth
- **API**: Next.js API routes with Zod validation
- **Caching**: Upstash Redis for slot computation caching
- **Background Jobs**: QStash or Supabase Edge Functions
- **Rate Limiting**: Upstash Rate Limit
- **Monitoring**: Sentry for error tracking, performance monitoring, and structured logging

### Key Features (Planned)
1. **Coach Directory** - Searchable marketplace of coaches
2. **Real-time Booking System** - Availability management and instant booking
3. **Role-based Dashboards** - Separate interfaces for coaches and students
4. **Google Calendar Integration** - Two-way sync for coaches
5. **Malaysian Localization** - RM currency, local phone formatting, GMT+8 timezone
6. **Mobile-first Design** - One-thumb usability principles
7. **Review System** - Post-session ratings and feedback

## Development Guidelines

### Code Style (from mind/identity.md)
- Use early returns for better readability
- Always use Tailwind classes for styling (avoid CSS tags)
- Use descriptive variable and function names with "handle" prefix for event functions
- Implement accessibility features on all elements
- Use const instead of functions: `const toggle = () =>`
- Define TypeScript types wherever possible
- Follow DRY principles and write bug-free, fully functional code

### Testing Guidelines (from mind/identity.md)
Follow strict Test-Driven Development (TDD) with this workflow:

1. **Write Tests First** - Generate complete test cases based on expected input/output pairs using Jest
2. **Run Tests and Confirm Failure** - Execute tests to confirm they fail (no implementation exists)
3. **Commit the Tests** - Commit only test files, no implementation code
4. **Implement the Code** - Write minimal code to make tests pass, never modify test files
5. **Run Tests Until Green** - Iterate on implementation until all tests pass
6. **Independent Verification** - Verify correctness beyond tests with static reasoning and additional inputs
7. **Commit Final Code** - Commit implementation once all tests pass and verification is complete
8. **Visual Regression Testing** - Use Puppeteer for UI screenshot comparison against baselines

**Key Testing Rules**:
- Always follow sequence: write tests → run & fail → commit tests → implement → pass tests → verify → visual test → commit code
- Never modify tests to fit the code
- Prefer unit tests first, then expand to integration, end-to-end, and visual regression tests
- Tests must be isolated, reproducible, and easy to read

### Architecture Principles
- **Mobile-first**: Optimized for one-thumb booking
- **Single Page Application**: State-based routing with authentication guards
- **GMT+8 Consistency**: All times stored and displayed in Malaysian timezone
- **Security**: Row Level Security (RLS) with least-privilege policies
- **Performance**: Optimized with caching, proper indexing, and minimal re-renders

### Monitoring and Error Tracking (from mind/sentry.md)
**Sentry Configuration**: Complete error tracking, performance monitoring, and structured logging setup

**Setup Requirements**:
- Run `npx @sentry/wizard@latest -i nextjs --saas --org base-61 --project javascript-nextjs` during initial setup
- Configure client-side initialization in `instrumentation-client.ts`
- Configure server-side initialization in `sentry.server.config.ts`
- Configure edge runtime initialization in `sentry.edge.config.ts`

**Implementation Guidelines**:
- Use `Sentry.captureException(error)` for exception handling in try-catch blocks
- Implement custom spans with `Sentry.startSpan()` for UI interactions and API calls
- Add meaningful `op` and `name` properties for span identification
- Attach relevant attributes using `span.setAttribute()` for context
- Enable structured logging with `_experiments: { enableLogs: true }`
- Use console logging integration for automatic error capture
- Import consistently: `import * as Sentry from "@sentry/nextjs"`

**DSN**: `https://5d1f04c28446b5cd41e5ac3abd65c74c@o4510016221216768.ingest.us.sentry.io/4510016344752128`

### Component Organization (Planned Structure)
```
/components
  /auth          - Authentication flows
  /booking       - Booking process components
  /calendar      - Calendar integration features
  /coaches       - Coach-related components
  /dashboard     - User dashboard interfaces
  /layout        - Shared layout components
  /reviews       - Review and rating system
  /ui            - shadcn/ui component library

/utils
  /supabase      - Database connection utilities
  - api.ts       - API helper functions
  - auth.ts      - Authentication utilities
  - calendar.ts  - Calendar file generation
```

## Application Screens (from mind/screens.md)
The application will have 12 primary screens:

**Authentication Flow**: Welcome → Sign In → Email Verification → Role Selection
**Student Flow**: Coach Directory → Coach Profile → Booking Flow → Student Dashboard
**Coach Flow**: Coach Dashboard → Profile Management → Availability Management
**Shared**: Settings Screen

All screens follow mobile-first design with consistent black/white branding and state-based navigation.

## Development Commands
*Note: No package.json or build system has been set up yet. This section will be updated when the development environment is initialized.*

## Getting Started
1. Review all documentation in the `mind/` directory to understand the complete vision
2. Examine design specifications in `design/` directory
3. Set up the Next.js project with the specified technology stack
4. Configure Sentry monitoring using the wizard: `npx @sentry/wizard@latest -i nextjs --saas --org base-61 --project javascript-nextjs`
5. Implement authentication flow first, followed by core booking functionality
6. Ensure all implementations follow the mobile-first and accessibility guidelines

## Important Notes
- **Timezone**: All development must consistently use GMT+8 (Malaysian timezone)
- **Security**: Implement Row Level Security from the start
- **Testing**: Include concurrency tests for booking creation to prevent double-bookings
- **Performance**: Implement slot caching and query optimization early
- **Accessibility**: Follow WCAG guidelines throughout development