# Samantha Lead Voice AI Leadgen

A comprehensive lead management dashboard built with Next.js 15.4 and Supabase, featuring a kanban-style interface for managing sales leads through different pipeline stages.

## Features

- **Kanban Board Interface**: Drag and drop leads between pipeline stages
- **Real-time Updates**: Live updates using Supabase subscriptions
- **Lead Management**: Add, edit, delete, and track leads
- **Advanced Filtering**: Search, filter by status/priority, sort by various criteria
- **Comments System**: Add internal notes and threaded discussions
- **Responsive Design**: Works on desktop and mobile devices
- **Database Integration**: Full Supabase PostgreSQL integration with RLS

## Technology Stack

- **Frontend**: Next.js 15.4 with App Router, React 19, TypeScript
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS
- **UI Components**: Headless UI, Heroicons
- **Drag & Drop**: @dnd-kit
- **Rich Text**: TipTap
- **Validation**: Zod

## Quick Start

### 1. Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Supabase account

### 2. Clone and Install

```bash
git clone <repository-url>
cd samantha-leadgen
npm install
```

### 3. Supabase Setup

#### Create a Supabase Project

1. Go to [Supabase](https://supabase.com) and create a new project
2. Wait for the project to be fully set up
3. Go to Settings > API to get your project credentials

#### Configure Environment Variables

1. Copy the environment template:
   ```bash
   cp .env.local.example .env.local
   ```

2. Fill in your Supabase credentials in `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
   ```

#### Set Up Database Schema

The application includes a comprehensive setup script to help you configure the database. Choose one of the following methods:

**Method 1: Automated Setup Script (Recommended)**
```bash
# Run the full setup (migrations + seeding)
npm run setup

# Or run individual steps:
npm run setup:migrate  # Setup database tables only
npm run setup:seed     # Seed with sample data only
```

**Method 2: Manual Setup via Supabase Dashboard**

1. Go to your Supabase project dashboard
2. Navigate to the **SQL Editor** 
3. Run each migration file in this exact order:
   - `supabase/migrations/20250101000001_create_leads_table.sql`
   - `supabase/migrations/20250101000002_create_user_profiles_table.sql`
   - `supabase/migrations/20250101000003_create_lead_phone_calls_table.sql`
   - `supabase/migrations/20250101000004_create_lead_emails_table.sql`
   - `supabase/migrations/20250101000005_create_lead_evaluations_table.sql`
   - `supabase/migrations/20250101000006_create_lead_comments_table.sql`
   - `supabase/migrations/20250101000007_enable_rls_on_leads.sql`

4. **Seed the database** (optional):
   ```bash
   npm run seed
   ```

**Method 3: Supabase CLI (Advanced)**

1. **Install Supabase CLI**:
   ```bash
   # Using npm (may have restrictions)
   npm install -g supabase
   
   # Or use other installation methods:
   # https://supabase.com/docs/guides/cli/getting-started
   ```

2. **Login and link project**:
   ```bash
   supabase login
   supabase link --project-ref YOUR_PROJECT_REF
   ```

3. **Push migrations**:
   ```bash
   supabase db push
   ```

4. **Seed the database**:
   ```bash
   npm run seed
   ```

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Database Schema

The application uses the following main tables:

- **leads**: Main lead information (name, email, status, priority, etc.)
- **user_profiles**: Extended user information linking to Supabase auth.users
- **lead_phone_calls**: Phone call records with transcripts and AI analysis
- **lead_emails**: Email communications tracking
- **lead_evaluations**: AI evaluation results and scoring
- **lead_comments**: Internal comments and notes with threading support

## Available Scripts

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run start`: Start production server
- `npm run lint`: Run ESLint
- `npm run seed`: Seed database with sample data

## Database Commands

### Migration Commands

```bash
# Push local migrations to Supabase
supabase db push

# Pull schema changes from Supabase
supabase db pull

# Create a new migration
supabase migration new migration_name

# Reset database (WARNING: This will delete all data)
supabase db reset
```

### Seed Commands

```bash
# Run seed script with default options
npm run seed

# Run with TypeScript directly
npx tsx supabase/seed/seed.ts
```

## Row Level Security (RLS)

The application implements Row Level Security policies to ensure data access control:

- **Authenticated Access**: Only authenticated users can access data
- **Role-based Permissions**: Admin, Manager, and Sales Rep roles with appropriate permissions
- **Data Isolation**: Users can only see data they have permission to access
- **Comment Visibility**: Internal comments are restricted to team members

## Real-time Features

The application supports real-time updates using Supabase subscriptions:

- **Lead Updates**: Real-time kanban board updates when leads change
- **Comment Threading**: Live comment updates in lead discussions
- **Status Changes**: Instant updates when leads move between pipeline stages

## API Endpoints

The application includes Next.js API routes for server-side operations:

- `GET /api/leads` - Fetch leads with filtering
- `POST /api/leads` - Create new lead
- `GET /api/leads/[id]` - Get specific lead with related data
- `PUT /api/leads/[id]` - Update lead
- `DELETE /api/leads/[id]` - Delete lead

## Troubleshooting

### Common Issues

1. **Environment Variables Not Loading**
   - Ensure `.env.local` file is in the project root
   - Restart the development server after changing environment variables
   - Check that all required variables are set

2. **Database Connection Issues**
   - Verify Supabase project URL and keys are correct
   - Ensure your Supabase project is active and running (not paused)
   - Check network connectivity to supabase.co
   - If getting "fetch failed" errors, try running from a local environment with internet access

3. **Migration Errors**
   - Ensure migrations are run in the correct order
   - Check for syntax errors in migration files
   - Verify you have proper permissions in Supabase
   - If automated migration fails, use the manual SQL Editor method

4. **Seeding Errors ("Error seeding leads: undefined")**
   - This usually means database tables don't exist yet
   - Run migrations first using one of the methods above
   - Ensure all 7 migration files have been executed successfully
   - Verify tables exist in your Supabase dashboard under Database > Tables

5. **Network/Environment Issues**
   - If running in a containerized or restricted environment, ensure external internet access
   - Some development environments may block external API calls
   - Try running the setup from your local machine instead

6. **RLS Policy Issues**
   - Make sure RLS is enabled on all tables
   - Verify user authentication is working
   - Check policy definitions match your user roles

### Getting Help

- Check the [Supabase Documentation](https://supabase.com/docs)
- Review [Next.js Documentation](https://nextjs.org/docs)
- Submit issues to the project repository

## Development Workflow

1. **Making Schema Changes**:
   ```bash
   # Create new migration
   supabase migration new your_change_name
   # Edit the migration file
   # Push changes
   supabase db push
   ```

2. **Adding New Features**:
   - Update database schema if needed
   - Create/update API routes
   - Update frontend components
   - Add proper TypeScript types
   - Test with real data

3. **Deployment**:
   - Build the application: `npm run build`
   - Deploy to your hosting provider (Vercel recommended)
   - Ensure environment variables are set in production

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.