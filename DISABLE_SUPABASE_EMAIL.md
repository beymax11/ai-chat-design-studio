# How to Disable Supabase Automatic Email Confirmation

To ensure only your custom Gmail SMTP template is used, you need to disable Supabase's built-in email confirmation system.

## Method 1: Via Supabase Dashboard (Recommended)

1. **Go to Supabase Dashboard**
   - Navigate to your project: https://app.supabase.com

2. **Access Authentication Settings**
   - Click on **Authentication** in the left sidebar
   - Click on **Settings** (or look for **Email Templates**)

3. **Disable Email Confirmation**
   - Find the section for **Email Confirmation** or **Confirm email**
   - Look for a toggle/switch that says:
     - "Enable email confirmations"
     - "Confirm email"
     - "Require email confirmation"
   - **Turn it OFF** or set it to **Disabled**

4. **Save Changes**
   - Click **Save** if there's a save button
   - Changes should be applied immediately

## Method 2: Via Project Settings

1. **Go to Project Settings**
   - Click on the **Settings** icon (gear icon) in the left sidebar
   - Click on **Auth** or **Authentication**

2. **Find Email Settings**
   - Scroll to find **Email** or **Email Confirmation** settings
   - Disable the email confirmation feature

## Method 3: Via SQL (Advanced)

If you have access to the database, you can also check the auth configuration:

```sql
-- Check current auth configuration
SELECT * FROM auth.config;

-- Note: Direct modification of auth.config is not recommended
-- Use the dashboard instead
```

## Verification

After disabling, test by:

1. **Sign up a new user**
2. **Check your email** - You should ONLY receive the email from your Gmail SMTP function (with the BugBounty AI template)
3. **You should NOT receive** Supabase's default confirmation email

## Troubleshooting

### Still receiving Supabase emails?

1. **Double-check the settings** - Make sure the toggle is OFF
2. **Clear browser cache** - Sometimes settings don't update immediately
3. **Wait a few minutes** - Settings changes may take a moment to propagate
4. **Check all email-related toggles** - There might be multiple settings to disable

### Can't find the setting?

1. **Check Supabase version** - Some older versions have different UI
2. **Look in different sections**:
   - Authentication → Settings
   - Authentication → Email Templates
   - Project Settings → Auth
   - Project Settings → Authentication
3. **Contact Supabase support** - They can help locate the setting

## Important Notes

- ⚠️ **After disabling**, Supabase will NOT send any confirmation emails
- ✅ **Your custom Gmail SMTP function** will handle all email confirmations
- 🔒 **Make sure** your Gmail SMTP function is working before disabling Supabase emails
- 📧 **Test thoroughly** to ensure emails are being sent correctly

## Alternative: Keep Both (Not Recommended)

If you want to keep Supabase emails as a backup, you can leave it enabled, but users will receive TWO confirmation emails:
1. One from Supabase (default template)
2. One from your Gmail SMTP (custom template)

This is not recommended as it can confuse users.

