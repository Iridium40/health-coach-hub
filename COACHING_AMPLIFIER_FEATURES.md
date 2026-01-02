# Coaching Amplifier - Complete Feature Documentation

**Last Updated:** December 2024  
**Version:** 1.0

---

## Table of Contents
1. [Overview](#overview)
2. [Coach Features](#coach-features)
3. [Admin Features](#admin-features)
4. [Shared Features](#shared-features)
5. [Technical Capabilities](#technical-capabilities)

---

## Overview

Coaching Amplifier is a comprehensive web application designed to support OPTAVIA Health Coaches in their coaching journey and help administrators manage their coaching teams. The platform provides training resources, client support tools, business development materials, and administrative capabilities.

---

## Coach Features

### 🏠 Dashboard
- **Personalized Welcome**: Greeting based on time of day with coach's first name
- **Quick Stats**: 
  - Total badges earned
  - Resources completed
  - Current date display
- **Today's Meetings**: 
  - Shows only today's scheduled meetings/events
  - Join meeting buttons with direct Zoom links
  - Visual indicators for live meetings (red badge with pulse animation)
  - Meeting type badges (Coach-only vs. With Clients)
  - Empty state with link to calendar
- **Coach Tip of the Day**: 
  - Rotating tips about Habits of Health
  - Links to resources page
  - Focuses on holistic client support (not just diet)
- **New Coach Onboarding**: 
  - Progress tracking (3 modules: Welcome, Business Resources, Acronyms)
  - Visual progress bar
  - Direct link to continue training
  - Automatically marks user as no longer "new coach" when complete
- **Quick Links**:
  - Optavia Strong Facebook Group
  - OPTAVIA Connect
  - OPTAVIA Profile (with coach's optavia_id)
- **Training Progress Card**:
  - Overall completion percentage
  - Progress bar visualization
  - Recent badges earned (last 3)
  - Next module suggestion with direct link
- **Quick Actions**:
  - Create Meal Plan
  - Favorites
  - Coach Tools
  - View Calendar
- **Popular Recipes**: 
  - Shows recipes coach hasn't favorited yet
  - Weighted by popularity (favorite count)
  - Top 4 recipes displayed
  - Direct links to recipe details

### 📚 Training Center
- **Coaching Amplifier Academy** (Prominent Section):
  - 6 structured training modules with rank-based access control:
    1. New Coach Foundations (No rank required)
    2. Building Your Business (Requires: Senior Coach)
    3. Leadership Development (Requires: Executive Director)
    4. National Expansion (Requires: Integrated Regional Director)
    5. Executive Leadership (Requires: Integrated Global Director)
    6. Legacy Building (Requires: Presidential)
  - Visual progress indicator showing X/6 modules completed
  - Module cards show:
    - Completion status (checkmark for completed)
    - Lock icons for modules requiring higher ranks
    - Required rank badges
    - Direct links to modules
  - Quiz system for each module:
    - Multiple choice questions (2-5 per module)
    - 80% pass requirement
    - Visual feedback (correct/incorrect answers)
    - Explanations for each question
    - Retake option if not passed
    - Automatic module completion tracking
    - Email notifications when modules unlock new content
  - Achievement emails when unlocking new modules

- **Training Documents & Resources**:
  - Category-based organization:
    - Getting Started
    - Client Support
    - Business Building
    - Training
  - Search functionality with history
  - Category filtering (desktop buttons, mobile dropdown)
  - Module cards showing:
    - Progress percentage
    - Completion status
    - Resource count
    - Category badges
  - New coach filtering (shows only relevant modules for new coaches)

### 🎓 New Coach Onboarding
- **Three-Module Training Path**:
  1. **New Coach Welcome**:
     - The secret to new coach growth
     - Apprenticeship model explanation
     - Client → Coach parallel
     - First 30 days activities
     - Saturday New Coach Huddle information
     - CAB Bonus information
     - Senior Coach requirements
  2. **Business Resources**:
     - Saturday Huddle details
     - Power Hour calls
     - Monthly Action Plan (MAP)
     - Financial success setup
     - Branding guidelines
     - Legal disclaimers
  3. **Acronyms Guide**:
     - Searchable acronym database
     - Category filtering (Volume, Rank, Coaching, Bonus)
     - Comprehensive definitions
     - The Trilogy information
- **Progress Tracking**: Automatic completion detection and badge awarding
- **Navigation**: Previous/Next buttons between modules
- **Auto-Completion**: User marked as no longer "new coach" when all 3 modules complete

### 📅 Calendar & Events
- **Week View** (default for mobile):
  - Shows events for current week
  - Previous/Next week navigation
  - Today button to jump to current week
- **Month View**:
  - Full calendar grid
  - Event indicators on dates
  - Navigation between months
- **Event Types**:
  - Zoom meetings (coach-only or with clients)
  - In-person events
  - Recorded meetings (with Vimeo links)
- **Event Features**:
  - Event title and description
  - Date and time display
  - Location (for in-person events)
  - Start/end dates (for multi-day events)
  - Zoom meeting links
  - Recording links (Vimeo)
  - Status indicators (Upcoming, Live, Completed, Cancelled)
  - Add to Calendar feature:
    - Google Calendar
    - Outlook Calendar
    - Yahoo Calendar
    - ICS file download
  - Copy link functionality
  - Color-coded event types
- **Live Meeting Indicators**: Real-time status updates

### 📝 Recipes
- **Recipe Database**: Extensive collection of OPTAVIA-compliant recipes
- **Recipe Categories**:
  - Chicken
  - Seafood
  - Beef
  - Turkey
  - Pork
  - Vegetarian
  - Breakfast
- **Recipe Details**:
  - High-quality images
  - Prep and cook time
  - Difficulty level
  - Serving size
  - Lean & Green counts
  - Ingredients list
  - Step-by-step instructions
  - Favorite count (popularity indicator)
- **Features**:
  - Favorite/unfavorite recipes
  - Search functionality
  - Category filtering
  - Popular recipes highlighted
  - Direct links to recipe details

### 🍽️ Meal Planner
- **Plan Types**:
  - 5&1 Plan (single meal per day)
  - 4&2 Plan (lunch and dinner per day)
- **Weekly Grid View**:
  - 7-day meal planning
  - Drag-and-drop or click to add recipes
  - Visual recipe cards in meal slots
- **Dietary Filters**:
  - Vegetarian-only option
  - Protein preferences (chicken, beef, seafood, turkey, pork)
  - Dynamic recipe filtering
- **Recipe Picker Dialog**:
  - Searchable recipe list
  - Filtered by dietary preferences
  - Recipe details preview
- **Shopping List Generation**:
  - Auto-generated from selected recipes
  - Organized by meal
  - Total ingredients list
  - Print-friendly format
- **Email Client Plans**:
  - Professional email template
  - Includes meal plan and shopping list
  - Personalized with coach name
  - Send to client's email address

### 🛠️ Resources & Coach Tools
- **Coach Tools**:
  1. **Water Intake Calculator**:
     - Weight-based calculation
     - Daily water goal
     - Daily tracker (clickable)
     - Progress visualization
     - Local storage persistence
  2. **Exercise Guide**:
     - Exercise recommendations
     - Activity levels
     - Safety guidelines
  3. **Metabolic Health Info**:
     - Educational content
     - Health markers information
- **External Resources**:
  - Admin-managed resource links
  - Categories for organization
  - Features list for each resource
  - Quick access buttons
  - Pin/unpin resources (favorites)
  - External links:
    - Habits of Health website
    - OPTAVIA Habits of Health page
    - Healthy Edge 3.0 Team Page (Facebook)
    - Healthy Edge 3.0 Client Page (Facebook)
- **Habits of Health Integration**:
  - Educational content
  - Reminders about holistic approach
  - Link to external resources

### 🏆 Achievements & Badges
- **Badge System**:
  - Category completion badges:
    - Getting Started
    - Client Support
    - Business Building
    - Training
  - Automatic badge awarding
  - Badge display on profile
  - Badge icons and colors by category
- **Achievement Emails**: Automatic notifications when badges earned
- **Progress Tracking**: Visual indicators for badge progress

### ⭐ Favorites
- **Favorite Management**:
  - Favorite recipes
  - Bookmark training resources
  - Pin external resources
- **Quick Access**: Dedicated favorites page
- **Persistent Storage**: Favorites saved across sessions

### 🔔 Notifications
- **Notification Settings**:
  - Email notifications toggle
  - Push notifications (prepared for future)
  - Announcement notifications
  - Progress update notifications
- **Notification Center**: Centralized notification viewing
- **Read Status**: Track which announcements have been read

### 👤 Profile & Settings
- **Profile Management**:
  - Full name
  - Email address
  - Avatar upload
  - OPTAVIA ID
  - Coach rank display
- **Share Profile Feature**:
  - QR code generation for OPTAVIA profile
  - Share via text message
  - Share via email
  - Native share API support
  - Copy link functionality
  - Mobile-optimized QR code display
- **Account Settings**:
  - Password management
  - Notification preferences
  - Privacy settings

### 🔗 Quick Links & External Resources
- **External Quick Links**:
  - Optavia Strong Facebook Group
  - OPTAVIA Connect
  - OPTAVIA Profile (personalized with coach ID)
- **Resource Links**:
  - Habits of Health resources
  - Facebook group links
  - Admin-managed external resources

---

## Admin Features

### 👥 User Management

#### Invite Coach System
- **Invite Generation**:
  - Generate unique invite links
  - 48-hour expiration on invites
  - Email invitations sent automatically
  - New coach toggle:
    - Marks coach as "new coach"
    - Sends welcome email with onboarding resources
    - Sets default rank to "Coach"
  - Certification: Clicking "Generate Invite Link" certifies coach is active OPTAVIA Health Coach
- **Invite Information Required**:
  - Full name
  - Email address
  - Coach rank selection
  - OPTAVIA ID
- **Invite History**:
  - View all invites sent
  - Track invite status (Pending, Used, Expired, Inactive)
  - See when invites were created
  - Track when users signed up
  - View last login dates
  - Copy invite links
  - Filter by status
  - Search functionality

### 📢 Announcements Management
- **Create Announcements**:
  - Title and content (rich text)
  - Priority levels (Low, Normal, High, Urgent)
  - Active/inactive status
  - Start and end dates
  - Email template selection
  - Push notification options:
    - Send now
    - Schedule for later
- **Email Integration**:
  - Send email notifications to all users
  - Use email templates
  - Scheduled email sending
- **Announcement Features**:
  - Edit existing announcements
  - Delete announcements
  - Search announcements
  - View read status
  - Priority-based display
  - Date-based activation/deactivation

### 📊 Reports & Analytics
- **User Statistics**:
  - Total users count
  - Active users (last 30 days)
  - Active users by role (Admin/Coach)
  - Users logged in last 7 days
  - Percentage calculations
- **Training Completion Reports**:
  - Category completion percentages
  - Users who completed each category
  - Completion trends
  - Badge earning statistics
- **Visual Dashboards**:
  - Progress bars
  - Percentage displays
  - User counts by category

### 🍳 Recipe Management
- **CRUD Operations**:
  - Create new recipes
  - Edit existing recipes
  - Delete recipes
  - View all recipes
- **Recipe Fields**:
  - Title and description
  - Category selection
  - Prep and cook time
  - Servings
  - Difficulty level
  - Lean & Green counts
  - Ingredients list
  - Instructions
  - Image upload
- **Features**:
  - Image management
  - Recipe search
  - Category filtering
  - Favorite count tracking

### 📅 Events & Meetings Management
- **Create Events/Meetings**:
  - Title and description
  - Event type (Meeting or Event)
  - Start date/time
  - End date (for multi-day events)
  - Location (for in-person events)
  - Virtual/In-person toggle
  - Zoom meeting details:
    - Meeting ID
    - Passcode
    - Zoom link
  - Recording information:
    - Recording URL (Vimeo)
    - Recording platform selection
    - Availability date
  - Recurring meetings support
  - Status management (Upcoming, Live, Completed, Cancelled)
  - Email notification toggle
- **Meeting Features**:
  - Edit events
  - Delete events
  - View event history
  - Status updates
  - Automatic email notifications when events created

### 📚 Training Content Management
- **Module Management**:
  - Create new modules
  - Edit modules
  - Delete modules
  - Module fields:
    - Title and description
    - Category selection
    - Icon selection
    - Sort order
    - New coach flag
    - Required rank (for academy modules)
  - Reorder modules (up/down arrows)
- **Resource Management**:
  - Create resources within modules
  - Edit resources
  - Delete resources
  - Resource fields:
    - Title
    - Resource type (Document or Video)
    - URL
    - Sort order
  - Reorder resources (up/down arrows)
- **Training Categories**:
  - Getting Started
  - Client Support
  - Business Building
  - Training
- **Tree View**: Hierarchical display of modules and resources
- **Content Types Supported**:
  - Google Docs
  - Vimeo videos
  - YouTube videos
  - Other web resources

### 🔗 External Resources Management
- **Resource CRUD**:
  - Create external resources
  - Edit resources
  - Delete resources
  - Activate/deactivate resources
- **Resource Fields**:
  - Title and description
  - URL
  - Button text
  - Category
  - Features list
  - Icon
  - Sort order
  - Dynamic display conditions
- **Features**:
  - Search functionality
  - Category organization
  - Sort order control
  - Active/inactive status

---

## Shared Features

### 🔐 Authentication & Security
- **Authentication**:
  - Email/password login
  - Invite-only signup
  - Password reset functionality
  - Session management
- **Row Level Security (RLS)**:
  - Users can only see their own data
  - Admins have elevated permissions
  - Secure data access
- **Role-Based Access Control**:
  - Admin role
  - Coach role
  - Feature access based on role

### 📱 Mobile Responsiveness
- **Responsive Design**:
  - Mobile-first approach
  - Tablet optimization
  - Desktop layouts
- **Mobile-Specific Features**:
  - Touch-friendly interfaces
  - Mobile-optimized navigation
  - Responsive grids
  - Mobile-friendly modals and dialogs
  - Swipe gestures support

### 🎨 User Interface
- **Design System**:
  - OPTAVIA brand colors
  - Consistent typography
  - Icon system (Lucide Icons)
  - Component library (Shadcn UI)
- **Dark Mode Support**: 
  - Email templates adapt to dark mode
  - Logo switching for dark mode
- **Accessibility**:
  - ARIA labels
  - Keyboard navigation
  - Screen reader support
  - Focus management

### 📧 Email System
- **Email Templates**:
  - Badge award emails
  - Module completion emails
  - Invite emails
  - Welcome emails (new coaches)
  - Announcement emails
  - Meeting/event notification emails
  - Meal plan emails
- **Email Features**:
  - HTML and plain text versions
  - Responsive design
  - Dark mode support
  - Branded templates
  - Resend API integration

### 🔍 Search Functionality
- **Search Features**:
  - Search training modules
  - Search resources
  - Search recipes
  - Search history
  - Auto-suggestions
- **Search Scope**:
  - Module titles
  - Resource titles
  - Recipe titles
  - Content descriptions

### 💾 Data Persistence
- **Local Storage**:
  - Water tracker progress
  - Search history
  - UI preferences
- **Database Storage**:
  - User progress
  - Favorites
  - Bookmarks
  - Quiz attempts
  - Badge history
  - Invite history

### 🌐 External Integrations
- **Zoom Integration**:
  - Meeting links
  - Meeting IDs and passcodes
  - Join meeting functionality
- **Vimeo Integration**:
  - Video embedding
  - Recording playback
- **YouTube Integration**:
  - Video embedding
  - Content playback
- **Google Docs Integration**:
  - Document embedding
  - Real-time document access
- **Calendar Integration**:
  - Google Calendar
  - Outlook Calendar
  - Yahoo Calendar
  - ICS file generation
- **QR Code Generation**: QRServer API integration
- **Email Service**: Resend API

---

## Technical Capabilities

### 🗄️ Database Schema
- **Tables**:
  - `profiles` - User profiles and settings
  - `user_progress` - Training completion tracking
  - `user_bookmarks` - Bookmarked resources
  - `favorite_recipes` - Favorite recipes
  - `user_badges` - Achievement badges
  - `notification_settings` - User notification preferences
  - `announcements` - System announcements
  - `announcement_reads` - Read status tracking
  - `invites` - Invite link management
  - `zoom_calls` - Events and meetings
  - `recipes` - Recipe database
  - `modules` - Training modules
  - `module_resources` - Resources within modules
  - `external_resources` - External resource links
  - `quiz_attempts` - Academy quiz tracking

### 🔄 Automatic Features
- **Auto-Badge Awarding**: Badges awarded when categories completed
- **Progress Tracking**: Automatic completion detection
- **New Coach Status**: Auto-updates when onboarding complete
- **Email Notifications**: Automatic emails for achievements and milestones
- **Favorite Counts**: Automatic aggregation using database triggers

### 📈 Analytics & Tracking
- **User Activity**: Last login tracking
- **Training Progress**: Completion percentages
- **Engagement Metrics**: Badge earning, resource access
- **Quiz Performance**: Scores and attempts tracked

### 🛡️ Security Features
- **Authentication**: Secure email/password auth via Supabase
- **Authorization**: Role-based access control
- **Data Protection**: Row Level Security policies
- **Secure Storage**: Encrypted credentials
- **Session Management**: Secure session handling

---

## Feature Summary by User Type

### Coaches Can:
✅ Access training modules and resources  
✅ Complete quizzes and earn badges  
✅ View calendar and join meetings  
✅ Create and email meal plans  
✅ Browse and favorite recipes  
✅ Use coach tools (water tracker, calculators)  
✅ Access external resources  
✅ Complete onboarding training  
✅ Share OPTAVIA profile via QR code  
✅ View personalized dashboard  
✅ Track training progress  
✅ Receive achievement notifications  

### Admins Can (Everything Coaches Can, Plus):
✅ Invite new coaches  
✅ Manage announcements  
✅ View reports and analytics  
✅ Manage recipes  
✅ Manage events and meetings  
✅ Manage training content (CRUD)  
✅ Manage external resources  
✅ View invite history  
✅ Track user engagement  
✅ Send email notifications  

---

## Potential Areas for Enhancement

Based on the current feature set, here are potential areas to consider for future development:

### For Coaches:
- **Client Management**:
  - Client roster/database
  - Client progress tracking
  - Client communication tools
  - Client note-taking
  - Client appointment scheduling
- **Business Tools**:
  - Income tracking
  - Goal setting and tracking
  - Team organization view
  - Leaderboard/rankings
  - Business metrics dashboard
- **Communication**:
  - Direct messaging between coaches
  - Team chat/forums
  - Client messaging
  - Announcement replies/comments
- **Content Creation**:
  - Social media post templates
  - Content calendar
  - Post scheduling
  - Image library
- **Advanced Analytics**:
  - Personal progress reports
  - Training time tracking
  - Learning path recommendations
  - Achievement timelines

### For Admins:
- **Advanced Analytics**:
  - User engagement dashboards
  - Training completion trends
  - Time-to-completion metrics
  - User activity heatmaps
- **Bulk Operations**:
  - Bulk invite sending
  - Bulk email sending
  - Bulk content updates
- **Content Management**:
  - Content versioning
  - Content scheduling
  - A/B testing for content
  - Content analytics
- **User Management**:
  - User role management
  - User rank updates
  - User activity monitoring
  - User suspension/deactivation
- **Advanced Reporting**:
  - Custom report generation
  - Export capabilities (CSV, PDF)
  - Scheduled reports
  - Data visualization
- **Integration Enhancements**:
  - OPTAVIA API integration
  - Calendar sync (two-way)
  - CRM integration
  - Analytics platform integration

---

**Document Generated:** December 2024  
**Application:** Coaching Amplifier  
**Version:** 1.0
