# CoachConnect - Coach Booking Marketplace

A mobile-first scheduling platform that empowers coaches to easily share their availability and manage lessons, while giving students a simple way to discover, book, and manage coaching sessions — all in one place.

## 🎯 Vision Statement

**"The Calendly for Coaches"** - Unlike general-purpose scheduling tools, this app is built specifically for coaching with a public coach directory as its centerpiece, focusing on discovery, booking, and coaching workflows.

## 🚀 Project Status

This project is currently in the **planning and documentation phase**. No source code has been implemented yet. The `/mind` directory contains comprehensive specifications that serve as the foundation for development.

## 📋 Core Value Proposition

### For Coaches
- Professional profile in a central directory
- Easy tools to set availability and prevent double booking
- Visibility to new students they might never reach otherwise

### For Students
- Browse a directory of available coaches
- See up-to-date availability (in GMT+8)
- Book instantly — no back-and-forth

## 🏗️ Technical Architecture

### Frontend Stack
- **Framework**: Next.js (App Router) + React 18
- **Styling**: Tailwind CSS v4 with custom design tokens
- **UI Components**: Complete shadcn/ui component library
- **State Management**: TanStack Query (server state) + Zustand (local state)
- **Authentication**: Magic link (passwordless) via Supabase Auth

### Backend Stack
- **Database**: Supabase Postgres (Singapore region)
- **API**: Next.js API routes with Zod validation
- **Caching**: Upstash Redis for slot computation caching
- **Background Jobs**: QStash or Supabase Edge Functions
- **Rate Limiting**: Upstash Rate Limit
- **Monitoring**: Sentry for error tracking, performance monitoring, and structured logging

## 📱 Application Features

### Core MVP Features
1. **Coach Directory** - Searchable and filterable list of coaches
2. **Coach Profiles** - Bio, services offered, availability, and booking button
3. **Availability Management** - Weekly schedules, exceptions, and time off
4. **Booking Flow** - Select service, pick a slot, confirm booking
5. **User Dashboards** - Role-specific interfaces for students and coaches

### Advanced Features (Post-MVP)
- Google Calendar integration with bi-directional sync
- Review and rating system
- Email notifications and reminders
- Payment processing integration
- Group sessions and workshops

## 🎨 Design Principles

- **Mobile-first**: Optimized for one-thumb booking on the go
- **Simple by design**: Focus on availability and scheduling excellence
- **Coach-centric directory**: Discovery is a first-class feature
- **Consistent timezone**: All times in GMT+8 (Malaysian market focus)
- **Scalable foundation**: Built for future expansion

## 🗂️ Documentation Structure

### `/mind` Directory Contents

- **`identity.md`** - Development guidelines and coding standards
  - React/Next.js/TypeScript best practices
  - Code style guidelines (early returns, Tailwind-first, accessibility)
  - Test-Driven Development (TDD) workflow and testing guidelines
  - Component architecture patterns

- **`vision.md`** - Product vision and strategy
  - Problem definition for coaches and students
  - Market opportunity and competitive positioning
  - Success criteria and long-term roadmap

- **`tech.md`** - Complete technical specifications
  - Detailed frontend and backend architecture
  - Database design and security considerations
  - Performance optimization strategies
  - Component library and state management patterns

- **`screens.md`** - Application screens and user flows
  - All 12 primary screens with detailed specifications
  - Authentication flow and navigation patterns
  - User experience and interaction design

### `/design` Directory
- Homepage design specifications and visual references

## 🌏 Market Focus

**Primary Market**: Malaysia (Kuala Lumpur & Selangor)
- Malaysian Ringgit (RM) currency formatting
- GMT+8 timezone consistency
- Local phone number validation
- Court location preferences

## 🔒 Security & Performance

- **Authentication**: Magic link with email verification
- **Authorization**: Row Level Security (RLS) with role-based access
- **Performance**: Optimized with Redis caching and proper database indexing
- **Reliability**: Automated backups and point-in-time recovery
- **Testing**:
  - Test-Driven Development (TDD) with Jest framework
  - Unit, integration, and end-to-end testing
  - Visual regression testing with Puppeteer
  - Concurrency tests to prevent double-bookings

## 🚦 Getting Started

1. **Review Documentation**: Start with `/mind/vision.md` for product understanding
2. **Technical Architecture**: Read `/mind/tech.md` for implementation details
3. **Screen Specifications**: Study `/mind/screens.md` for UI requirements
4. **Development Guidelines**: Follow `/mind/identity.md` for code standards
5. **Setup Development**: Initialize Next.js project with specified tech stack
6. **Configure Monitoring**: Setup Sentry using `npx @sentry/wizard@latest -i nextjs --saas --org base-61 --project javascript-nextjs`

### Development Resources
- **Sentry Guidelines**: See `/mind/sentry.md` for error tracking implementation patterns
- **Project Configuration**: Complete setup instructions in `CLAUDE.md`

## 📄 License

This project is proprietary. All rights reserved.

---

*This README is generated from comprehensive planning documents in the `/mind` directory. For detailed technical specifications, user flows, and implementation guidelines, please refer to the individual documentation files.*