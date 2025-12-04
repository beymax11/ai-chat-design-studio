# Sign Up Timeout Issue - Fix Guide

Kung nagti-timeout ang sign-up, ito ang mga dapat i-check:

## ⚠️ Most Common Cause: Email Confirmation Enabled

Kung naka-enable ang email confirmation sa Supabase, maaaring mag-hang ang sign-up dahil naghihintay ito na ma-send ang email.

### How to Disable Email Confirmation:

1. **Go to Supabase Dashboard**
   - https://app.supabase.com
   - Piliin ang project mo

2. **Navigate to Authentication Settings**
   - Click **Authentication** sa left sidebar
   - Click **Settings** (o **Providers** → **Email**)

3. **Disable Email Confirmation**
   - Hanapin ang **"Enable email confirmations"** toggle
   - **Turn it OFF** (dapat naka-OFF)
   - O hanapin ang **"Confirm email"** setting at i-disable

4. **Save Changes**
   - Click **Save** kung may save button
   - Wait for changes to apply (usually instant)

5. **Alternative Locations to Check:**
   - **Project Settings** → **Auth** → **Email** section
   - **Authentication** → **Email Templates** → Settings
   - **Authentication** → **Providers** → **Email** → Settings

## 🔍 Other Things to Check:

### 1. Browser Network Tab
- Press **F12** → **Network** tab
- Subukan mag-sign up ulit
- Hanapin ang request sa `/auth/v1/signup`
- Tingnan:
  - Nagsend ba ng request? (dapat may request)
  - Anong status code? (200 = success, 4xx/5xx = error)
  - Stuck ba sa "pending"? (network issue)
  - May error response ba? (tingnan ang Response tab)

### 2. Supabase Project Status
- Check kung active ang project
- Check kung may maintenance o issues
- Try accessing: `https://uszndsfpnzpugqmrwyxo.supabase.co` sa browser

### 3. Environment Variables
- Verify na naka-set ang:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
- Check kung tama ang format

### 4. Network/Firewall
- Check kung may firewall o VPN na nagb-block
- Try sa ibang network
- Try sa incognito/private window

## 🧪 Quick Test:

After disabling email confirmation, try:
1. Clear browser cache (Ctrl+Shift+R or Cmd+Shift+R)
2. Try sign up ulit
3. Check console logs para sa timing
4. Check Network tab para sa request status

## 📝 Expected Behavior:

After fixing:
- Sign up dapat mabilis (less than 2 seconds)
- Dapat may success message
- Dapat makita sa console: "Sign up response received after Xms"
- Dapat walang timeout error

## 🆘 If Still Timing Out:

1. **Check Supabase Logs:**
   - Go to Supabase Dashboard
   - **Logs** → **Auth Logs**
   - Tingnan kung may error sa sign-up attempts

2. **Try Direct API Call:**
   - Open browser console
   - Run:
   ```javascript
   fetch('https://uszndsfpnzpugqmrwyxo.supabase.co/auth/v1/signup', {
     method: 'POST',
     headers: {
       'Content-Type': 'application/json',
       'apikey': 'YOUR_ANON_KEY'
     },
     body: JSON.stringify({
       email: 'test@example.com',
       password: 'test123456'
     })
   }).then(r => r.json()).then(console.log).catch(console.error)
   ```

3. **Contact Support:**
   - If lahat ng steps ay na-try na pero nagti-timeout pa rin
   - May issue sa Supabase service mismo

