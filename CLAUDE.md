# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

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

### Architecture Principles
- **Mobile-first**: Optimized for one-thumb booking
- **Single Page Application**: State-based routing with authentication guards
- **GMT+8 Consistency**: All times stored and displayed in Malaysian timezone
- **Security**: Row Level Security (RLS) with least-privilege policies
- **Performance**: Optimized with caching, proper indexing, and minimal re-renders

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
4. Implement authentication flow first, followed by core booking functionality
5. Ensure all implementations follow the mobile-first and accessibility guidelines

## Important Notes
- **Timezone**: All development must consistently use GMT+8 (Malaysian timezone)
- **Security**: Implement Row Level Security from the start
- **Testing**: Include concurrency tests for booking creation to prevent double-bookings
- **Performance**: Implement slot caching and query optimization early
- **Accessibility**: Follow WCAG guidelines throughout development