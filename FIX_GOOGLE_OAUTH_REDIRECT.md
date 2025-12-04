# Fix Google OAuth Redirect URL Issue

Kung ang Google OAuth ay nagre-redirect sa `http://localhost:3000` sa production, ito ang mga dapat gawin:

## Problem
Ang Google OAuth redirect ay nagpapakita ng `http://localhost:3000` sa production URL. Dapat ay ang production URL ang gamitin.

## Solution

### Step 1: Update Supabase Dashboard Settings

1. **Go to Supabase Dashboard**
   - Navigate to: https://app.supabase.com
   - Piliin ang project mo

2. **Go to Authentication Settings**
   - Click **Authentication** sa left sidebar
   - Click **URL Configuration** o **Settings**

3. **Update Redirect URLs**
   - Hanapin ang **"Redirect URLs"** o **"Site URL"** section
   - Dapat may listahan ng allowed redirect URLs
   - **Add your production URL** (e.g., `https://your-site.netlify.app`)
   - **Remove or keep** `http://localhost:3000` (para sa development lang)
   
   Example ng redirect URLs:
   ```
   http://localhost:3000
   https://your-site.netlify.app
   https://your-production-domain.com
   ```

4. **Update Site URL**
   - Hanapin ang **"Site URL"** field
   - I-set ito sa production URL mo (e.g., `https://your-site.netlify.app`)
   - Ito ang default URL na gagamitin ng Supabase

5. **Save Changes**
   - Click **Save** button
   - Wait for changes to apply

### Step 2: Set Environment Variable in Netlify

1. **Go to Netlify Dashboard**
   - Navigate to your site
   - Go to **Site settings** → **Environment variables**

2. **Add Environment Variable**
   - Add: `VITE_NETLIFY_SITE_URL`
   - Value: `https://your-site.netlify.app` (your actual production URL)
   - O kung may custom domain ka: `https://your-domain.com`

3. **Redeploy**
   - After adding the environment variable, trigger a new deployment
   - O kung automatic deployment, wait for the next build

### Step 3: Verify the Fix

1. **Test in Production**
   - Go to your production site
   - Click "Continue with Google"
   - Check kung ang redirect URL ay production URL na, hindi localhost

2. **Check Browser Console**
   - Open browser DevTools (F12)
   - Check Console tab
   - Dapat makita mo: `Google OAuth redirect URL: https://your-site.netlify.app`

## Important Notes

- **Development**: Ang `localhost:3000` ay dapat naka-configure para sa local development
- **Production**: Ang production URL ay dapat naka-configure sa Supabase dashboard
- **Environment Variables**: Make sure na naka-set ang `VITE_NETLIFY_SITE_URL` sa Netlify
- **Multiple URLs**: Pwede mong i-add ang multiple redirect URLs (dev, staging, production)

## Troubleshooting

### Still redirecting to localhost?

1. **Check Supabase Dashboard**
   - Verify na naka-add ang production URL sa redirect URLs list
   - Check kung tama ang Site URL

2. **Check Environment Variables**
   - Verify na naka-set ang `VITE_NETLIFY_SITE_URL` sa Netlify
   - Check kung tama ang value

3. **Clear Browser Cache**
   - Clear cache at cookies
   - Try sa incognito/private window

4. **Check Code**
   - Verify na updated na ang code (should use production URL in production)
   - Check browser console for redirect URL logs

### OAuth callback not working?

- Make sure na ang production URL ay naka-add sa Supabase redirect URLs
- Check kung may error sa browser console
- Verify na ang OAuth callback handler ay working (code updated na)

## Code Changes Made

The code has been updated to:
1. Use production URL from environment variables when in production
2. Handle OAuth callbacks with hash fragments properly
3. Clean up URL after OAuth callback

The main fix is in `src/contexts/AuthContext.tsx`:
- `signInWithGoogle()` now uses production URL when available
- Added OAuth callback handler in `useEffect`

