# Seeding Supabase Database

This guide explains how to seed your Supabase database with the mock data.

## Prerequisites

1. Make sure you have your Supabase project set up
2. Ensure your `.env.local` file contains:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key (only for full seed)
   ```

## Option 1: Simple Seed (Recommended)

This option seeds all the data using your existing Supabase user account.

1. First, find your Supabase user ID:
   - Go to your Supabase Dashboard
   - Navigate to Authentication > Users
   - Copy your user ID (format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)

2. Edit `scripts/seed-supabase-simple.js` and replace:
   ```javascript
   const YOUR_USER_ID = 'YOUR_SUPABASE_USER_ID_HERE';
   ```
   with your actual user ID.

3. Run the seed script:
   ```bash
   npm run seed:mock
   ```

## Option 2: Full Seed (Creates Demo Users)

This option creates demo user accounts and seeds all data. Requires service role key.

```bash
npm run seed:mock:full
```

This will create a demo account:
- Email: user-001@example.com
- Password: demo123456

## What Gets Seeded

The seed scripts will populate your database with:
- 20 leads with various statuses and priorities
- 73 phone calls with transcripts and AI analysis
- 94 emails (both inbound and outbound)
- 20 lead evaluations
- 31 internal comments

## Clearing Data

The seed scripts automatically clear existing data before seeding. If you want to start fresh, just run the seed command again.

## Troubleshooting

1. **Missing environment variables**: Make sure your `.env.local` file has all required Supabase credentials

2. **Permission errors**: Ensure your Supabase tables have the correct RLS policies or temporarily disable RLS for seeding

3. **User ID not found**: For the simple seed, make sure you've created at least one user account in Supabase Authentication

4. **Foreign key constraints**: The scripts handle deletion order, but if you still get errors, you may need to manually clear data from Supabase dashboard