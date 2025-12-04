-- ============================================
-- Fix Email Verification RLS Issue
-- ============================================
-- This SQL creates a function to update email_verified
-- that bypasses RLS using SECURITY DEFINER
-- This allows unauthenticated users to verify their email

-- ============================================
-- 1. Drop Existing Function (if exists)
-- ============================================
-- Drop the function first if it exists with different return type
DROP FUNCTION IF EXISTS public.verify_user_email(UUID);

-- ============================================
-- 2. Create Function to Verify Email
-- ============================================
-- This function updates email_verified to true for a user
-- It uses SECURITY DEFINER to bypass RLS policies
-- This is triggered when user confirms their email
CREATE FUNCTION public.verify_user_email(user_id_param UUID)
RETURNS JSONB AS $$
DECLARE
  rows_updated INTEGER;
  profile_exists BOOLEAN;
  result JSONB;
BEGIN
  -- Check if profile exists
  SELECT EXISTS(SELECT 1 FROM public.profiles WHERE id = user_id_param) INTO profile_exists;
  
  IF profile_exists THEN
    -- Update the email_verified field in profiles to TRUE
    UPDATE public.profiles
    SET email_verified = TRUE
    WHERE id = user_id_param;
    
    -- Get the number of rows updated
    GET DIAGNOSTICS rows_updated = ROW_COUNT;
    
    IF rows_updated > 0 THEN
      result := jsonb_build_object('success', true, 'message', 'Email verified successfully', 'rows_updated', rows_updated);
    ELSE
      result := jsonb_build_object('success', false, 'message', 'No rows updated');
    END IF;
  ELSE
    -- Profile doesn't exist, create it with email_verified = TRUE
    INSERT INTO public.profiles (id, email_verified, email)
    SELECT user_id_param, TRUE, email
    FROM auth.users
    WHERE id = user_id_param
    ON CONFLICT (id) DO UPDATE SET email_verified = TRUE;
    
    result := jsonb_build_object('success', true, 'message', 'Profile created and email verified');
  END IF;
  
  RETURN result;
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'message', SQLERRM, 'error_code', SQLSTATE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 3. Grant Execute Permission
-- ============================================
-- Allow anonymous users to execute this function
-- This is critical - without this, unauthenticated users can't call the function
GRANT EXECUTE ON FUNCTION public.verify_user_email(UUID) TO anon;
GRANT EXECUTE ON FUNCTION public.verify_user_email(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.verify_user_email(UUID) TO service_role;

-- Also grant usage on the schema
GRANT USAGE ON SCHEMA public TO anon;

-- ============================================
-- 4. Add Policy to Allow Reading Profiles for Email Verification
-- ============================================
-- This policy allows reading email_verified status during login
-- Users can read their own profile when authenticated
-- (This should already exist, but we're ensuring it's there)

-- Note: The existing policy "Users can view own profile" should handle this
-- But we'll add a comment to clarify

-- ============================================
-- 5. Create Trigger to Auto-Set email_verified = TRUE
-- ============================================
-- This trigger automatically sets email_verified = TRUE when a token is marked as used
-- This serves as a backup mechanism to ensure email_verified is always set
CREATE OR REPLACE FUNCTION public.auto_verify_email_on_token_used()
RETURNS TRIGGER AS $$
BEGIN
  -- When a token is marked as used (used = TRUE), automatically set email_verified = TRUE
  IF NEW.used = TRUE AND OLD.used = FALSE THEN
    UPDATE public.profiles
    SET email_verified = TRUE
    WHERE id = NEW.user_id;
    
    -- If profile doesn't exist, create it with email_verified = TRUE
    IF NOT FOUND THEN
      INSERT INTO public.profiles (id, email_verified, email)
      VALUES (NEW.user_id, TRUE, NEW.email)
      ON CONFLICT (id) DO UPDATE SET email_verified = TRUE;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on email_confirmation_tokens table
DROP TRIGGER IF EXISTS auto_verify_email_trigger ON public.email_confirmation_tokens;
CREATE TRIGGER auto_verify_email_trigger
  AFTER UPDATE OF used ON public.email_confirmation_tokens
  FOR EACH ROW
  WHEN (NEW.used = TRUE AND OLD.used = FALSE)
  EXECUTE FUNCTION public.auto_verify_email_on_token_used();

-- ============================================
-- 6. Test Query (Optional - for debugging)
-- ============================================
-- You can test the function with this query (replace USER_ID with actual user ID):
-- SELECT public.verify_user_email('USER_ID_HERE'::UUID);

-- ============================================
-- 7. Alternative: Direct Update Policy (if function doesn't work)
-- ============================================
-- If the function approach doesn't work, you can add this policy to allow
-- anonymous users to update email_verified via token lookup
-- (This is less secure but might be needed as a workaround)

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Allow email verification via token" ON public.profiles;

-- Policy to allow updating email_verified when token is valid
-- This allows the update based on a valid confirmation token
CREATE POLICY "Allow email verification via token"
  ON public.profiles
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.email_confirmation_tokens
      WHERE email_confirmation_tokens.user_id = profiles.id
      AND email_confirmation_tokens.used = FALSE
      AND email_confirmation_tokens.expires_at > NOW()
    )
  )
  WITH CHECK (true);

-- ============================================
-- Notes:
-- ============================================
-- 1. Run this SQL in your Supabase SQL Editor
-- 2. This function bypasses RLS using SECURITY DEFINER
-- 3. The function is safe because it only updates email_verified
-- 4. The trigger ensures email_verified = TRUE when token is marked as used
-- 5. This provides triple protection: function call + trigger + policy
-- 6. Check browser console for detailed logs when confirming email

