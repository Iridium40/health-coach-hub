# Supabase Setup Guide

This guide will help you set up Supabase for the Coaching Amplifier app.

## 1. Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Fill in your project details:
   - Name: `coaching-amplifier` (or your preferred name)
   - Database Password: (choose a strong password)
   - Region: (choose closest to your users)
5. Wait for the project to be created (takes a few minutes)

## 2. Get Your API Keys

1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy the following:
   - **Project URL** (under "Project URL")
   - **anon/public key** (under "Project API keys")

## 3. Set Up Environment Variables

1. Create a `.env.local` file in the root of your project (if it doesn't exist)
2. Add the following:

```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

Replace `your_project_url_here` and `your_anon_key_here` with the values from step 2.

## 4. Run Database Schema

1. In your Supabase project dashboard, go to **SQL Editor**
2. Open the file `lib/supabase/schema.sql` from this project
3. Copy the entire contents
4. Paste it into the SQL Editor in Supabase
5. Click **Run** to execute the schema

This will create:
- `profiles` table
- `user_progress` table
- `user_bookmarks` table
- `favorite_recipes` table
- `notification_settings` table
- `announcements` table
- `announcement_reads` table
- All necessary indexes and RLS policies
- Triggers for automatic profile creation

## 5. Set Up Storage Bucket for Avatars

1. In your Supabase project dashboard, go to **Storage**
2. Click **New bucket**
3. Name it: `user_avatars`
4. Make it **Public** (so avatars can be accessed)
5. Click **Create bucket**

## 6. Configure Storage Policies

1. Go to **Storage** → **Policies** → **user_avatars**
2. Add the following policies:

**Policy 1: Allow authenticated users to upload**
- Policy name: `Users can upload their own avatars`
- Allowed operation: `INSERT`
- Policy definition:
```sql
bucket_id = 'user_avatars'::text
```

**Policy 2: Allow authenticated users to update**
- Policy name: `Users can update their own avatars`
- Allowed operation: `UPDATE`
- Policy definition:
```sql
bucket_id = 'user_avatars'::text
```

**Policy 3: Allow authenticated users to delete**
- Policy name: `Users can delete their own avatars`
- Allowed operation: `DELETE`
- Policy definition:
```sql
bucket_id = 'user_avatars'::text
```

**Policy 4: Allow public read access**
- Policy name: `Public can read avatars`
- Allowed operation: `SELECT`
- Policy definition:
```sql
bucket_id = 'user_avatars'::text
```

## 7. Configure Authentication

1. Go to **Authentication** → **Settings**
2. Under **Site URL**, set it to your app URL (e.g., `http://localhost:3000` for development)
3. Under **Redirect URLs**, add:
   - `http://localhost:3000/**` (for development)
   - `https://your-production-domain.com/**` (for production)

## 8. Test the Setup

1. Start your development server: `pnpm dev`
2. Try signing up with a new account
3. Check the Supabase dashboard:
   - **Authentication** → **Users** should show your new user
   - **Table Editor** → **profiles** should show your profile
   - **Table Editor** → **notification_settings** should show your settings

## Troubleshooting

### "Invalid API key" error
- Make sure your `.env.local` file has the correct values
- Restart your development server after changing environment variables

### "Row Level Security policy violation" error
- Make sure you ran the schema.sql file completely
- Check that RLS policies were created in the **Authentication** → **Policies** section

### Avatar upload fails
- Make sure the `user_avatars` bucket exists and is public
- Check that storage policies are set up correctly
- Verify the file size is under 5MB

### Profile not created automatically
- Check the **Database** → **Functions** section to see if `handle_new_user` function exists
- Check **Database** → **Triggers** to see if `on_auth_user_created` trigger exists

## Next Steps

Once setup is complete, you can:
- Create announcements in the `announcements` table
- Manage user data through the Supabase dashboard
- Set up push notifications (requires additional configuration)
- Monitor usage in the Supabase dashboard

