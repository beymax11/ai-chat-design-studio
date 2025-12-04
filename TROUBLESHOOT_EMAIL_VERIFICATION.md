# Troubleshooting Email Verification - email_verified Hindi Nagiging TRUE

## Quick Fix Steps

### Step 1: Run ang Updated SQL
1. Pumunta sa Supabase Dashboard → SQL Editor
2. I-copy ang lahat ng contents ng `fix-email-verification-rls.sql`
3. I-paste at i-run sa SQL Editor
4. **IMPORTANT**: Check kung may errors sa output

### Step 2: Verify na Na-create ang Function
Run this query sa SQL Editor:
```sql
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name = 'verify_user_email';
```

Dapat may result na `verify_user_email` function.

### Step 3: Test ang Function Directly
Test ang function with a real user ID:
```sql
-- Replace 'USER_ID_HERE' with actual user ID from auth.users
SELECT public.verify_user_email('USER_ID_HERE'::UUID);
```

Dapat may result na:
```json
{"success": true, "message": "Email verified successfully", "rows_updated": 1}
```

### Step 4: Check Browser Console
1. Open Developer Tools (F12)
2. Pumunta sa Console tab
3. I-confirm ang email ulit
4. Tingnan ang logs - dapat may detailed logs na:
   - "Setting email_verified = TRUE for user: ..."
   - "RPC call result: ..."
   - "Verification check result: ..."

## Common Issues

### Issue 1: Function Not Found Error
**Symptom**: Error sa console na "function verify_user_email does not exist"

**Solution**:
1. Verify na na-run ang SQL
2. Check kung may function sa Database → Functions
3. I-run ulit ang SQL kung wala

### Issue 2: Permission Denied Error
**Symptom**: Error na "permission denied" o "RLS policy violation"

**Solution**:
1. Check kung may GRANT statements sa SQL
2. Verify na may `GRANT EXECUTE ON FUNCTION public.verify_user_email(UUID) TO anon;`
3. I-run ulit ang GRANT statements

### Issue 3: Function Returns Success pero email_verified ay FALSE pa rin
**Symptom**: Function call successful pero email_verified hindi nagiging TRUE

**Solution**:
1. Check ang browser console logs
2. Tingnan kung may "Verification check result" log
3. Kung FALSE pa rin, manual update:
   ```sql
   UPDATE public.profiles 
   SET email_verified = TRUE 
   WHERE id = 'USER_ID_HERE';
   ```

### Issue 4: Profile Doesn't Exist
**Symptom**: Error na "profile not found" o "no rows updated"

**Solution**:
1. Check kung may profile sa Table Editor → profiles
2. Kung wala, i-create manually:
   ```sql
   INSERT INTO public.profiles (id, email_verified, email)
   SELECT id, TRUE, email
   FROM auth.users
   WHERE id = 'USER_ID_HERE';
   ```

## Manual Fix (Emergency)

Kung lahat ng steps ay hindi gumana, pwede mong i-update manually:

```sql
-- 1. Find the user ID
SELECT id, email FROM auth.users WHERE email = 'user@example.com';

-- 2. Update email_verified manually
UPDATE public.profiles 
SET email_verified = TRUE 
WHERE id = 'USER_ID_FROM_STEP_1';

-- 3. Verify
SELECT id, email, email_verified FROM public.profiles WHERE id = 'USER_ID_FROM_STEP_1';
```

## Debug Checklist

- [ ] SQL na-run successfully (walang errors)
- [ ] Function exists sa Database → Functions
- [ ] Function can be called (test query works)
- [ ] Browser console shows detailed logs
- [ ] RPC call returns success
- [ ] Verification check shows email_verified = TRUE
- [ ] Profile exists sa profiles table
- [ ] Token exists at valid sa email_confirmation_tokens table

## Contact Support

Kung lahat ng steps ay hindi gumana, i-copy ang:
1. Browser console logs
2. Supabase logs (Dashboard → Logs)
3. Error messages
4. User ID na affected

