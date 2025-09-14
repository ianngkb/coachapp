# Screens Documentation

## Overview

This document provides comprehensive documentation of all 12 screens in the Coach Booking Marketplace application, including their purposes, key functions, user flows, and relationships. The application is built with a mobile-first design philosophy and supports both student and coach user types with passwordless authentication via magic links.

## Application State Management

**App States:** 12 primary screens
**User Types:** Student, Coach  
**Authentication:** Passwordless magic link system  
**Default Entry:** Coach Directory (for demo purposes)  
**Navigation:** State-based routing with authentication guards

---

## Authentication Flow Screens

### 1. Welcome Screen
**State:** `welcome`  
**Component:** `WelcomeScreen.tsx`  
**Access:** Public (unauthenticated users)

#### Purpose
First-time user onboarding screen that introduces the CoachConnect platform and its value proposition.

#### Key Functions
- **Brand Introduction**: Displays app logo, name, and value proposition
- **Feature Highlights**: Shows key benefits (instant booking, verified coaches, secure auth)
- **Entry Point**: Single CTA to continue to sign-in process
- **Visual Appeal**: Clean welcome experience with consistent black/white branding

#### User Flow
```
Welcome Screen → Continue → Sign In Screen
```

#### Screen Elements
- App branding and logo
- Value proposition messaging
- Feature benefit list with checkmarks
- Primary "Continue" button
- Clean card-based layout

---

### 2. Sign In Screen
**State:** `signin`  
**Component:** `SignInScreen.tsx`  
**Access:** Public (unauthenticated users)

#### Purpose
Passwordless authentication entry point where existing users enter their email to receive a magic link.

#### Key Functions
- **Email Validation**: Real-time email format validation
- **User Verification**: Checks if email exists in database
- **Magic Link Request**: Sends authentication link to verified email
- **User Type Detection**: Automatically determines if user is student or coach
- **Sign Up Redirect**: Routes new users to registration flow

#### User Flow
```
Sign In Screen → Email Verification → Magic Link Sent → Email Sent Screen
Sign In Screen → Email Not Found → Sign Up Option → Sign Up Screen
```

#### Screen Elements
- Email input field with validation
- Real-time email checking feedback
- User type display (auto-populated)
- "Send magic link" CTA button
- "Create new account" option for new users
- Back navigation to directory

#### Technical Features
- Async email validation
- Database user lookup
- Magic link generation
- Error state handling
- Loading states

---

### 3. Sign Up Screen
**State:** `signup`  
**Component:** `SignUpScreen.tsx`  
**Access:** Public (unauthenticated users)

#### Purpose
New user registration flow where users create accounts by providing basic information and selecting their role.

#### Key Functions
- **User Registration**: Collects name, email, and user type
- **Role Selection**: Choose between Student or Coach account types
- **Account Creation**: Creates new user profile in database
- **Magic Link Generation**: Sends welcome magic link to complete registration
- **Profile Initialization**: Sets up basic user profile structure

#### User Flow
```
Sign Up Screen → Complete Registration → Magic Link Sent → Email Sent Screen
Sign Up Screen → Back → Sign In Screen
```

#### Screen Elements
- Name input field
- Email input field with validation
- User type selection (Student/Coach radio buttons)
- Role descriptions and benefits
- "Create Account" CTA button
- Terms and privacy policy agreement
- Back navigation to sign in

#### Technical Features
- Form validation
- User type selection logic
- Account creation API integration
- Magic link generation for new users

---

### 4. Email Sent Screen
**State:** `email-sent`  
**Component:** `EmailSentScreen.tsx`  
**Access:** Public (after magic link request)

#### Purpose
Confirmation screen informing users that a magic link has been sent to their email address.

#### Key Functions
- **Confirmation Message**: Displays successful magic link delivery
- **Email Display**: Shows the email address where link was sent
- **Resend Option**: Allows users to request another magic link
- **Email Change**: Option to go back and use different email
- **Auto-Authentication**: Demo mode auto-authenticates after 3 seconds

#### User Flow
```
Email Sent Screen → Check Email → Click Magic Link → Authenticated
Email Sent Screen → Resend Link → New Magic Link Sent
Email Sent Screen → Change Email → Sign In Screen
Email Sent Screen → Auto Demo Login (3s) → User Dashboard
```

#### Screen Elements
- Success confirmation message
- Email address display
- "Resend magic link" button
- "Use different email" option
- Loading spinner during auto-demo
- Instructions for checking email

#### Technical Features
- Auto-redirect functionality (demo mode)
- Resend magic link capability
- Email change navigation
- User type routing logic

---

## Core Application Screens

### 5. Coach Directory (Home/Browse)
**State:** `directory`  
**Component:** `CoachDirectory.tsx`  
**Access:** Public and authenticated users

#### Purpose
Main discovery screen where users browse and search for available coaches across various sports and locations.

#### Key Functions
- **Coach Discovery**: Browse all available coaches with filtering
- **Search Functionality**: Text search by coach name or sport
- **Advanced Filtering**: Filter by sports, price range, and location
- **Coach Previews**: Display coach cards with key information
- **Favorites**: Save preferred coaches (authenticated users)
- **Navigation Hub**: Access to all major app sections

#### User Flow
```
Coach Directory → Search/Filter → View Results → Coach Profile
Coach Directory → Header Menu → User Dashboard/Profile
Coach Directory → Sign In → Authentication Flow
```

#### Screen Elements
- **Header**: Logo, search bar, filter button, user menu
- **Search Interface**: Text input with filter sheet
- **Coach Grid**: Responsive grid of coach cards
- **Filter System**: Sports, price, location filtering
- **Loading States**: Skeleton screens and spinners
- **Empty States**: No results messaging
- **Demo Mode Banner**: Role switching for demonstration

#### Technical Features
- Real-time search and filtering
- API integration with fallback to mock data
- Responsive grid layout
- Filter state management
- Loading and error handling
- Authentication state awareness

---

### 6. Coach Profile (Individual Coach View)
**State:** `coach-profile`  
**Component:** `CoachProfile.tsx`  
**Access:** Public and authenticated users

#### Purpose
Detailed view of individual coach information, services, availability, and booking interface.

#### Key Functions
- **Coach Information**: Complete profile with bio, experience, ratings
- **Service Listings**: Available coaching services with pricing
- **Availability Display**: Real-time available time slots
- **Reviews Section**: Student reviews and ratings
- **Booking Interface**: Direct booking with slot selection
- **Gallery**: Photos and credentials display

#### User Flow
```
Coach Profile → Select Service → Choose Time Slot → Booking Flow (Auth Required)
Coach Profile → View Reviews → Read Detailed Feedback
Coach Profile → Back → Coach Directory
```

#### Screen Elements
- **Profile Header**: Avatar, name, rating, contact info
- **About Section**: Bio, experience, specializations
- **Services Tab**: List of offered services with pricing
- **Reviews Tab**: Student feedback and ratings
- **Availability Calendar**: Interactive booking calendar
- **Preferred Courts**: List of coaching locations
- **Book Now CTA**: Primary booking action button

#### Technical Features
- Dynamic content loading based on coach ID
- Real-time availability checking
- Review aggregation and display
- Calendar integration
- Service pricing in Malaysian Ringgit
- Authentication-gated booking

---

### 7. Booking Flow (Session Booking)
**State:** `booking`  
**Component:** `BookingFlow.tsx`  
**Access:** Authenticated users only

#### Purpose
Multi-step booking process for students to confirm and pay for coaching sessions.

#### Key Functions
- **Booking Review**: Confirm session details and pricing
- **Payment Processing**: Secure payment integration (simulated)
- **Confirmation**: Booking success with session details
- **Calendar Integration**: Add session to personal calendar
- **Cancellation Policy**: Display terms and conditions

#### User Flow
```
Booking Flow → Review Details → Payment → Confirmation → Student Dashboard
Booking Flow → Back → Coach Profile
Booking Flow → Booking Conflict → Error Handling → Coach Profile
```

#### Screen Elements
- **Progress Indicator**: 3-step visual progress bar
- **Review Step**: Session details, pricing, policies
- **Payment Step**: Payment processing interface
- **Confirmation Step**: Success message and next actions
- **Sticky CTA**: Bottom action bar with pricing
- **Error Handling**: Conflict and payment error states

#### Technical Features
- Multi-step form management
- Payment simulation
- Booking conflict detection
- Calendar file generation (.ics)
- Error state handling
- Loading states during processing

---

## Student User Screens

### 8. Student Dashboard (My Sessions)
**State:** `dashboard`  
**Component:** `StudentDashboard.tsx`  
**Access:** Authenticated students only

#### Purpose
Central hub for students to manage their booked coaching sessions, view history, and access account features.

#### Key Functions
- **Session Management**: View upcoming and past sessions
- **Calendar Export**: Download sessions as calendar files
- **Review System**: Leave reviews for completed sessions
- **Quick Booking**: Browse coaches from dashboard
- **Session Details**: Access booking information and coach contact

#### User Flow
```
Student Dashboard → Upcoming Sessions → Session Details → Calendar Export
Student Dashboard → Past Sessions → Leave Review → Review Modal
Student Dashboard → Browse Coaches → Coach Directory
Student Dashboard → Profile → Student Profile Edit
```

#### Screen Elements
- **Header**: Navigation and user menu
- **Session Tabs**: Upcoming vs Past sessions toggle
- **Session Cards**: Individual booking information
- **Calendar Actions**: "Add to Calendar" buttons
- **Review Actions**: "Leave Review" for completed sessions
- **Empty States**: No sessions messaging
- **Quick Actions**: Browse coaches CTA

#### Technical Features
- Session status management
- Calendar file generation
- Review submission integration
- Responsive card layout
- Real-time session updates
- Authentication verification

---

### 9. Student Profile Edit (Account Settings)
**State:** `student-profile-edit`  
**Component:** `StudentProfileEdit.tsx`  
**Access:** Authenticated students only

#### Purpose
Account management screen where students can update their personal information and preferences.

#### Key Functions
- **Profile Management**: Update name, email, phone number
- **Location Preferences**: Set preferred coaching locations
- **Sport Interests**: Select sports of interest
- **Privacy Settings**: Manage account visibility and preferences
- **Account Actions**: Sign out and account deletion options

#### User Flow
```
Student Profile Edit → Update Information → Save Changes → Dashboard
Student Profile Edit → Change Location → Update Preferences → Save
Student Profile Edit → Back → Student Dashboard
```

#### Screen Elements
- **Profile Photo**: Avatar upload and editing
- **Personal Information**: Name, email, phone fields
- **Location Settings**: Malaysian location selection
- **Sports Preferences**: Multi-select sport interests
- **Save Actions**: Update profile button
- **Account Management**: Sign out and danger zone

#### Technical Features
- Form validation
- Profile image upload
- Location-specific validation (Malaysia)
- Phone number formatting
- Profile update API integration
- Real-time validation feedback

---

## Coach User Screens

### 10. Coach Dashboard (My Schedule)
**State:** `coach-dashboard`  
**Component:** `CoachDashboard.tsx`  
**Access:** Authenticated coaches only

#### Purpose
Comprehensive dashboard for coaches to manage their schedule, view bookings, and access business tools.

#### Key Functions
- **Schedule Overview**: View all upcoming and past sessions
- **Booking Management**: Accept, reschedule, or cancel sessions
- **Student Communication**: Contact information and session notes
- **Availability Management**: Set available time slots and blocked dates
- **Revenue Tracking**: View earnings and payment information
- **Calendar Integration**: Google Calendar sync and conflict detection

#### User Flow
```
Coach Dashboard → View Sessions → Session Management → Update Status
Coach Dashboard → Manage Availability → Availability Scheduler
Coach Dashboard → Profile → Coach Profile Edit
Coach Dashboard → Services → Coach Services Manager
```

#### Screen Elements
- **Header**: Coach navigation and business tools
- **Schedule Calendar**: Visual schedule overview
- **Session Lists**: Upcoming and completed sessions
- **Student Cards**: Booking details and student information
- **Quick Actions**: Profile and service management
- **Analytics Overview**: Basic performance metrics

#### Technical Features
- Session status management
- Calendar integration (Google Calendar)
- Real-time schedule updates
- Student information display
- Booking conflict detection
- Revenue calculation

---

### 11. Coach Profile Edit (Business Profile)
**State:** `coach-profile-edit`  
**Component:** `CoachProfileEdit.tsx`  
**Access:** Authenticated coaches only

#### Purpose
Business profile management where coaches update their professional information, credentials, and public profile.

#### Key Functions
- **Professional Profile**: Bio, experience, certifications
- **Credential Management**: Upload certificates and qualifications
- **Photo Gallery**: Profile and action photos
- **Contact Information**: Business phone, email, social media
- **Location Settings**: Service areas and preferred courts
- **Sport Specializations**: Areas of coaching expertise

#### User Flow
```
Coach Profile Edit → Update Professional Info → Save Changes → Dashboard
Coach Profile Edit → Upload Credentials → Update Gallery → Save
Coach Profile Edit → Manage Locations → Select Courts → Save
Coach Profile Edit → Back → Coach Dashboard
```

#### Screen Elements
- **Profile Header**: Professional photo and basic info
- **About Section**: Bio and experience editing
- **Credentials**: Certificate upload and management
- **Photo Gallery**: Action shots and coaching photos
- **Location Management**: Preferred courts selection
- **Sports & Skills**: Specialization checkboxes
- **Save Actions**: Update profile and preview options

#### Technical Features
- Professional profile validation
- Image upload and management
- Court selection from predefined list
- Credential verification system
- Profile preview functionality
- Multi-section form management

---

### 12. Coach Services Manager (Service Offerings)
**State:** `coach-services`  
**Component:** `CoachServicesManager.tsx`  
**Access:** Authenticated coaches only

#### Purpose
Business management screen where coaches create, edit, and manage their service offerings and pricing.

#### Key Functions
- **Service Creation**: Add new coaching services
- **Pricing Management**: Set rates in Malaysian Ringgit
- **Service Editing**: Update descriptions, duration, and pricing
- **Availability Settings**: Set service-specific availability
- **Package Deals**: Create multi-session packages
- **Service Categories**: Organize services by type (individual, group, etc.)

#### User Flow
```
Coach Services → Add Service → Service Form → Save Service
Coach Services → Edit Service → Update Details → Save Changes
Coach Services → Manage Pricing → Update Rates → Save
Coach Services → Back → Coach Dashboard
```

#### Screen Elements
- **Services List**: All current service offerings
- **Add Service Button**: Create new service modal
- **Service Cards**: Individual service management
- **Pricing Display**: Malaysian Ringgit formatting
- **Edit Actions**: Modify, disable, or delete services
- **Quick Stats**: Service performance overview

#### Technical Features
- Service CRUD operations
- Dynamic pricing calculation
- Malaysian currency formatting
- Service category management
- Availability rule integration
- Performance analytics

---

## Shared Components & Features

### Header Navigation
**Component:** `Header.tsx`  
**Usage:** All authenticated screens

#### Functions
- **Brand Display**: App logo and identity
- **Search Interface**: Coach/sport search (directory only)
- **User Menu**: Role-based navigation dropdown
- **Authentication**: Sign in/out actions
- **Role Switching**: Demo mode user type toggle

### Review System
**Components:** `ReviewModal.tsx`, `ReviewsSection.tsx`  
**Usage:** Student Dashboard, Coach Profile

#### Functions
- **Rating System**: 5-star rating interface
- **Comment Submission**: Written feedback collection
- **Review Display**: Aggregate ratings and comments
- **Review Management**: Edit/delete own reviews

### Booking Components
**Components:** `BookingFlow.tsx`, Calendar integration  
**Usage:** Cross-platform booking system

#### Functions
- **Slot Selection**: Available time picking
- **Conflict Detection**: Double-booking prevention
- **Payment Integration**: Secure transaction processing
- **Calendar Export**: .ics file generation

## Navigation Flow Summary

### Authentication Flow
```
Welcome → Sign In → Email Sent → Dashboard/Directory
         ↓
      Sign Up → Email Sent → Dashboard/Directory
```

### Student Journey
```
Directory → Coach Profile → Booking Flow → Student Dashboard
     ↓              ↑              ↓              ↓
Profile Edit ←→ Review System ←→ Calendar Export ←→ Session Management
```

### Coach Journey
```
Directory → Coach Dashboard → Profile Edit ← → Services Manager
     ↓              ↓              ↓              ↓
Schedule Management ← → Availability ← → Business Tools ← → Analytics
```

## Technical Implementation Notes

### State Management
- **App State**: Centralized routing via React useState
- **Authentication**: JWT-like magic link authentication
- **User Type**: Dynamic role switching for demo purposes
- **Booking Data**: Session-based booking information persistence

### Responsive Design
- **Mobile-First**: Optimized for mobile with desktop enhancements
- **Touch-Friendly**: Large tap targets and gesture support
- **Progressive Enhancement**: Feature layering based on device capabilities

### Data Management
- **API Integration**: Supabase backend with fallback mock data
- **Real-Time Updates**: Live booking and schedule synchronization
- **Offline Support**: Local state management for demo functionality

### Security & Privacy
- **Passwordless Auth**: Magic link security implementation
- **Data Protection**: User information privacy controls
- **Role-Based Access**: Screen-level authentication guards

This comprehensive screen documentation provides the foundation for understanding the complete user experience across both student and coach journeys in the Coach Booking Marketplace application.