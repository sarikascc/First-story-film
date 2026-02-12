# First Story Films - Technical Documentation

## Project Overview
Job management and commission tracking system for a video production studio. Manages staff, vendors, services, and jobs with automatic commission calculations.

## Tech Stack
- **Framework**: Next.js 16.1.6 (App Router, React 19.2.3)
- **Database**: Supabase PostgreSQL
- **Authentication**: Supabase Auth (SSR with @supabase/ssr)
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React
- **TypeScript**: Full type safety

## Architecture

### Client-Server Setup
- **Client**: `lib/supabase.ts` - Browser client with cookie management
- **Server**: `lib/supabase-server.ts` - Admin client with service role key
- **API Routes**: `/app/api/admin/*` - Server-side operations bypassing RLS

### Authentication Flow
- Supabase Auth handles login/session
- Role stored in `users` table (ADMIN, MANAGER, USER)
- Dashboard layout (`app/dashboard/layout.tsx`) enforces auth & role-based routing
- RLS policies on Supabase tables for data security

## Database Schema

### Core Tables
1. **users** - Staff/Admin accounts
   - Fields: id, name, email, mobile, role (ADMIN|MANAGER|USER)
   - Synced with Supabase Auth

2. **services** - Service types (Teaser, Reels, Highlight, etc.)
   - Fields: id, name

3. **staff_service_configs** - Commission percentages per staff per service
   - Fields: staff_id, service_id, percentage

4. **vendors** - Studio/vendor information
   - Fields: studio_name, contact_person, mobile, email, location, notes

5. **jobs** - Job records with tracking
   - Fields: service_id, vendor_id, staff_id, description, data_location, final_location, job_due_date, status (PENDING|IN_PROGRESS|PAUSE|COMPLETED), amount, commission_amount, started_at, completed_at

## Key Features

### Admin Dashboard (`/dashboard/admin/*`)
1. **Services** (`/admin/services`) - CRUD for service types
2. **Staff** (`/admin/staff`) - User management with:
   - Create/Edit/Delete users
   - Service-wise commission configuration (for USER role)
   - Role assignment (ADMIN/MANAGER/USER)
3. **Vendors** (`/admin/vendors`) - Vendor/studio management
4. **Jobs** (`/admin/jobs`) - Job management with:
   - Create jobs with service, vendor, staff assignment
   - Automatic commission calculation: `commission = (amount × percentage) / 100`
   - Status tracking (PENDING → IN_PROGRESS → PAUSE → COMPLETED)
   - View/Edit/Delete jobs

### Staff Dashboard (`/dashboard/staff/*`)
1. **My Jobs** (`/staff/my-jobs`) - View assigned jobs only
   - Start/End job (sets started_at/completed_at)
   - Update status
   - Add final_location
   - Cannot see amount/commission (filtered by RLS)

### Dashboard Home (`/dashboard`)
- Role-based stats (Total Jobs, In-Progress, Completed, Total Users for Admin)
- Welcome screen with user name

## API Endpoints

### Admin APIs (`/api/admin/*`)
- `POST /api/admin/create-user` - Create user with auth sync
- `POST /api/admin/update-user` - Update user (bypasses RLS)
- `DELETE /api/admin/delete-user` - Delete user (cascades to related data)
- `POST /api/admin/create-vendor` - Create vendor

### Vendor APIs (`/api/vendors/*`)
- `GET /api/vendors` - List vendors
- `GET /api/vendors/[id]` - Get vendor details
- `PUT /api/vendors/[id]` - Update vendor
- `DELETE /api/vendors/[id]` - Delete vendor

## Business Logic

### Commission Calculation
```typescript
// In lib/utils.ts
commission = (jobAmount × staffPercentage) / 100
```
- Calculated when job is created/updated
- Staff percentage fetched from `staff_service_configs` based on job's service_id

### Time Tracking
- **Start Job**: Sets `started_at` timestamp, status → `IN_PROGRESS`
- **End Job**: Sets `completed_at` timestamp, status → `COMPLETED`
- Total time = `completed_at - started_at`

### Access Control
- **ADMIN**: Full CRUD on all modules, sees all jobs, financial data visible
- **MANAGER**: Similar to admin (role exists but may have limited scope)
- **USER**: Only assigned jobs visible, no amount/commission visibility (RLS filtered)

## Key Components

### Reusable Components (`/components`)
- `Pagination.tsx` - Page navigation
- `Spinner.tsx` - Loading indicator
- `AestheticSelect.tsx` - Custom select dropdown
- `Tooltip.tsx` - Hover tooltips

### Design System
- **Style**: Exaggerated Minimalism
- **Colors**: Indigo/Purple gradients, slate backgrounds
- **Typography**: Fira Code (headings), Nunito (body)
- **Pattern**: Conversion-optimized with feature-rich layouts

## File Structure
```
app/
├── dashboard/
│   ├── layout.tsx          # Auth guard + sidebar navigation
│   ├── page.tsx            # Dashboard home (stats)
│   ├── admin/
│   │   ├── services/       # Service CRUD
│   │   ├── staff/          # User management + commission config
│   │   ├── vendors/        # Vendor CRUD
│   │   └── jobs/           # Job management
│   └── staff/
│       └── my-jobs/        # Staff job tracking
├── login/                  # Login page
└── api/                    # API routes
lib/
├── supabase.ts            # Client Supabase instance
├── supabase-server.ts     # Server/admin Supabase instance
└── utils.ts               # Commission calc, formatting utilities
types/
└── database.ts            # TypeScript types for all tables
supabase/
├── schema.sql             # Database schema
└── migrations/            # SQL migration files
```

## Environment Variables
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Public anon key
- `SUPABASE_SERVICE_ROLE_KEY` - Admin service role key (server-only)

## Key Technical Patterns

1. **RLS Bypass**: Admin APIs use `supabaseAdmin` (service role) to bypass Row Level Security
2. **Auth Sync**: User creation syncs Supabase Auth with `users` table
3. **Pagination**: All list pages use 10 items per page with custom Pagination component
4. **Search**: Client-side filtering on name/email fields
5. **Modal Forms**: Create/Edit operations use modal dialogs
6. **Notification System**: Toast notifications for success/error feedback

## Status Flow
Jobs follow: `PENDING` → `IN_PROGRESS` → `PAUSE` → `COMPLETED`

## Data Relationships
- Job → Service (many-to-one)
- Job → Vendor (many-to-one, nullable)
- Job → Staff (many-to-one, nullable)
- Staff → Service (many-to-many via `staff_service_configs`)
