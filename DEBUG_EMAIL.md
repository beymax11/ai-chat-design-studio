# Debugging Email Confirmation Issues

Kung hindi nagpapadala ng email confirmation, sundin ang steps na ito para i-debug:

## Step 1: Check Browser Console

1. **Open Browser Developer Tools**
   - Press `F12` or `Cmd+Option+I` (Mac) / `Ctrl+Shift+I` (Windows)
   - Go to **Console** tab

2. **Try to sign up** at tingnan ang console logs
   - Dapat makita mo:
     - `Sending confirmation email to: [email]`
     - `Function URL: [url]`
     - `Email response status: [status]`

3. **Check for errors:**
   - Kung may error, makikita mo ang exact error message
   - Common errors:
     - `Failed to fetch` - Function URL ay mali o hindi accessible
     - `404 Not Found` - Function ay hindi naka-deploy
     - `500 Internal Server Error` - Function may error

## Step 2: Check Netlify Function Logs

1. **Go to Netlify Dashboard**
   - Navigate to your site
   - Click on **Functions** sa left sidebar
   - Click on **send-confirmation-email**

2. **Check the Logs tab**
   - Dapat makita mo ang logs mula sa function
   - Look for:
     - `Received email request: ...`
     - `Gmail credentials found...`
     - `Sending email to: ...`
     - `Email sent successfully: ...`

3. **Common log messages:**
   - `Gmail credentials not configured` - Environment variables ay hindi set
   - `Missing required fields` - Request body ay incomplete
   - `Error sending email: ...` - Gmail SMTP error

## Step 3: Verify Environment Variables

1. **Go to Netlify Dashboard**
   - Navigate to your site → **Site settings** → **Environment variables**

2. **Check if these are set:**
   - `GMAIL_USER` - Dapat may value (e.g., `your-email@gmail.com`)
   - `GMAIL_APP_PASSWORD` - Dapat may value (16-character app password)
   - `BASE_URL` - Optional pero recommended (e.g., `https://bugbounty-ai.netlify.app`)

3. **If missing:**
   - Add them
   - **Redeploy** your site para ma-apply ang changes

## Step 4: Test Function Directly

Maaari mong i-test ang function directly gamit ang curl o Postman:

```bash
curl -X POST https://bugbounty-ai.netlify.app/.netlify/functions/send-confirmation-email \
  -H "Content-Type: application/json" \
  -d '{
    "to": "test@example.com",
    "name": "Test User",
    "confirmationToken": "test-token-123"
  }'
```

**Expected response:**
- `200 OK` - Email sent successfully
- `400 Bad Request` - Missing fields
- `500 Internal Server Error` - Configuration error

## Step 5: Common Issues and Solutions

### Issue: "Function not found" or 404

**Solution:**
1. Check if `netlify.toml` has `functions = "netlify/functions"`
2. Make sure `netlify/functions/send-confirmation-email.ts` exists
3. Redeploy your site

### Issue: "Gmail credentials not configured"

**Solution:**
1. Set `GMAIL_USER` at `GMAIL_APP_PASSWORD` sa Netlify environment variables
2. Make sure you're using **App Password**, hindi regular password
3. Redeploy after setting variables

### Issue: "Failed to fetch" sa browser

**Possible causes:**
1. Function URL ay mali
2. CORS issue (dapat na-fix na namin ito)
3. Network error

**Solution:**
1. Check browser console para sa exact error
2. Verify function URL sa code matches your site URL
3. Check Netlify function logs

### Issue: Email sent pero hindi natanggap

**Possible causes:**
1. Email nasa spam folder
2. Gmail blocking emails
3. Wrong email address

**Solution:**
1. Check spam/junk folder
2. Verify Gmail account settings
3. Check Gmail account activity for blocked attempts

## Step 6: Verify Function is Deployed

1. **Go to Netlify Dashboard**
   - Navigate to **Functions**
   - Dapat makita mo ang `send-confirmation-email` function listed

2. **If not listed:**
   - Check `netlify.toml` configuration
   - Make sure function file exists
   - Redeploy site

## Step 7: Check Gmail App Password

1. **Verify App Password is correct:**
   - Go to Google Account → Security → App passwords
   - Make sure the app password is active
   - Copy the exact 16-character password (no spaces)

2. **If App Password doesn't work:**
   - Generate a new one
   - Update `GMAIL_APP_PASSWORD` sa Netlify
   - Redeploy

## Quick Checklist

- [ ] Browser console shows function is being called
- [ ] Netlify function logs show request received
- [ ] Environment variables are set in Netlify
- [ ] Function is listed in Netlify Functions
- [ ] Gmail App Password is correct
- [ ] Site has been redeployed after changes

## Still Not Working?

1. **Check all logs** (browser console + Netlify logs)
2. **Verify environment variables** are set correctly
3. **Test function directly** using curl/Postman
4. **Check Gmail account** for any security alerts
5. **Try generating new App Password**

Kung may specific error message, i-share mo para mas matulungan kita!

