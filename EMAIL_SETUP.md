# Gmail SMTP Email Confirmation Setup

This guide will help you set up Gmail SMTP for email confirmation in your BugBounty AI application.

## Prerequisites

1. A Gmail account
2. Access to your Netlify dashboard
3. Access to your Supabase dashboard

## Step 1: Generate Gmail App Password

1. Go to your Google Account settings: https://myaccount.google.com/
2. Navigate to **Security** → **2-Step Verification** (enable it if not already enabled)
3. Scroll down to **App passwords**
4. Click **Select app** and choose **Mail**
5. Click **Select device** and choose **Other (Custom name)**
6. Enter a name like "BugBounty AI Email Service"    
7. Click **Generate**
8. **Copy the 16-character password** (you'll need this for the environment variable)

## Step 2: Set Up Environment Variables in Netlify

1. Go to your Netlify dashboard
2. Navigate to your site → **Site settings** → **Environment variables**
3. Add the following environment variables:

   - `GMAIL_USER`: Your Gmail email address (e.g., `your-email@gmail.com`)
   - `GMAIL_APP_PASSWORD`: The 16-character app password you generated
   - `BASE_URL`: Your site URL (e.g., `https://your-site.netlify.app`)

## Step 3: Disable Supabase Automatic Email Confirmation

**IMPORTANT:** You need to disable Supabase's built-in email confirmation so that only your Gmail SMTP template is used.

1. Go to your Supabase dashboard
2. Navigate to **Authentication** → **Settings** (or **Auth** → **Email Templates**)
3. Find **Email Confirmation** settings
4. **Disable** or **Turn off** the automatic email confirmation feature
   - Look for options like "Enable email confirmations" and turn it OFF
   - Or set "Confirm email" to **Disabled**
5. Save the changes

**Alternative:** If you can't find the disable option, you can also:
- Go to **Authentication** → **Providers** → **Email**
- Look for "Confirm email" toggle and turn it OFF
- Or in **Project Settings** → **Auth** → disable "Enable email confirmations"

This ensures that Supabase won't send its own confirmation emails and only your custom Gmail SMTP template will be used.

## Step 4: Set Up Database Tables in Supabase

1. Go to your Supabase dashboard
2. Navigate to **SQL Editor**
3. Run the SQL script from `supabase-email-confirmation.sql`:

```sql
-- Copy and paste the contents of supabase-email-confirmation.sql
```

This will create:
- `email_confirmation_tokens` table
- Required indexes and policies
- `email_verified` column in profiles table

## Step 5: Install Dependencies

Run the following command to install the required packages:

```bash
npm install
```

This will install:
- `nodemailer` - For sending emails via SMTP
- `@netlify/functions` - For Netlify serverless functions

## Step 6: Deploy to Netlify

1. Commit your changes:
   ```bash
   git add .
   git commit -m "Add Gmail SMTP email confirmation"
   git push
   ```

2. Netlify will automatically build and deploy your site

## Step 7: Test Email Confirmation

1. Sign up with a new account
2. Check your email inbox (and spam folder) for the confirmation email
3. Click the confirmation link
4. You should be redirected to the confirmation page

## Troubleshooting

### Emails not sending

1. **Check environment variables**: Make sure `GMAIL_USER` and `GMAIL_APP_PASSWORD` are set correctly in Netlify
2. **Check function logs**: Go to Netlify dashboard → **Functions** → **send-confirmation-email** → **Logs**
3. **Verify app password**: Make sure you're using an App Password, not your regular Gmail password
4. **Check BASE_URL**: Ensure `BASE_URL` matches your actual site URL

### Token not found errors

1. **Check database**: Verify that the `email_confirmation_tokens` table exists in Supabase
2. **Check RLS policies**: Make sure Row Level Security policies are set up correctly
3. **Check token expiration**: Tokens expire after 24 hours

### Function not found

1. **Check netlify.toml**: Ensure `functions = "netlify/functions"` is set
2. **Check file structure**: Make sure `netlify/functions/send-confirmation-email.ts` exists
3. **Rebuild**: Try rebuilding your site in Netlify

## Security Notes

- **Never commit** your Gmail credentials to version control
- Use **App Passwords** instead of your regular Gmail password
- Keep your App Passwords secure and rotate them periodically
- The confirmation tokens expire after 24 hours for security

## Local Development

For local development, you can use Netlify CLI:

```bash
# Install Netlify CLI globally
npm install -g netlify-cli

# Set environment variables locally
export GMAIL_USER="your-email@gmail.com"
export GMAIL_APP_PASSWORD="your-app-password"
export BASE_URL="http://localhost:8080"

# Run Netlify dev server
netlify dev
```

## Support

If you encounter any issues, check:
1. Netlify function logs
2. Browser console for errors
3. Supabase logs
4. Gmail account activity for blocked login attempts

