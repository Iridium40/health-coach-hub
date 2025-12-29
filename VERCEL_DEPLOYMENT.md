# Vercel Deployment Guide

## Environment Variables Setup

When deploying to Vercel, you need to set the following environment variables in your Vercel project settings:

### Required Environment Variables

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add the following variables:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Why NEXT_PUBLIC_ prefix?

The `NEXT_PUBLIC_` prefix is required for environment variables that need to be accessible in the browser (client-side code). Since Supabase client runs in the browser for authentication and data fetching, these variables must be prefixed with `NEXT_PUBLIC_`.

**Important:** These variables will be exposed in your client-side bundle. This is safe for the Supabase anon key as it's designed to be public and protected by Row Level Security (RLS) policies.

### Setting Environment Variables in Vercel

1. **Via Dashboard:**
   - Go to your project → Settings → Environment Variables
   - Add each variable for all environments (Production, Preview, Development)

2. **Via Vercel CLI:**
   ```bash
   vercel env add NEXT_PUBLIC_SUPABASE_URL
   vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
   ```

### After Adding Variables

1. Redeploy your application for the changes to take effect
2. The variables will be available in both server and client components

## Deployment Steps

1. **Connect your GitHub repository to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository

2. **Configure build settings:**
   - Framework Preset: Next.js
   - Build Command: `pnpm build` (or `npm run build`)
   - Output Directory: `.next`

3. **Add environment variables** (as described above)

4. **Deploy:**
   - Click "Deploy"
   - Vercel will automatically build and deploy your app

## Post-Deployment

1. **Update Supabase Authentication settings:**
   - Go to Supabase Dashboard → Authentication → Settings
   - Add your Vercel domain to **Site URL**: `https://your-app.vercel.app`
   - Add to **Redirect URLs**: `https://your-app.vercel.app/**`

2. **Test the deployment:**
   - Visit your Vercel URL
   - Test signup/login
   - Verify data persistence

## Troubleshooting

### "Invalid API key" error
- Verify environment variables are set correctly in Vercel
- Check that variables are deployed (may need to redeploy)

### Authentication redirects not working
- Verify Site URL and Redirect URLs in Supabase match your Vercel domain
- Check that HTTPS is enabled (Vercel provides this automatically)

### Build errors
- Ensure all dependencies are in `package.json`
- Check that Node.js version is compatible (Vercel uses Node 18+ by default)

