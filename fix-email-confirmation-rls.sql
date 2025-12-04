-- ============================================
-- Fix Email Confirmation RLS Policies
-- ============================================
-- This fixes the 406 error by allowing unauthenticated users
-- to read and update tokens for email confirmation

-- Drop existing policies if they exist (optional, will error if they don't exist)
DROP POLICY IF EXISTS "Users can view own confirmation tokens" ON public.email_confirmation_tokens;
DROP POLICY IF EXISTS "Users can update own confirmation tokens" ON public.email_confirmation_tokens;
DROP POLICY IF EXISTS "Allow token lookup for email confirmation" ON public.email_confirmation_tokens;
DROP POLICY IF EXISTS "Allow token update for email confirmation" ON public.email_confirmation_tokens;

-- Policy: Users can view their own tokens (authenticated users)
CREATE POLICY "Users can view own confirmation tokens"
  ON public.email_confirmation_tokens
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Allow reading tokens by token value for email confirmation
-- This allows unauthenticated users to verify their email using the token
-- Security: Only allows reading tokens that are not expired and not used
CREATE POLICY "Allow token lookup for email confirmation"
  ON public.email_confirmation_tokens
  FOR SELECT
  USING (
    expires_at > NOW() 
    AND used = FALSE
  );

-- Policy: Users can update their own tokens (authenticated users)
CREATE POLICY "Users can update own confirmation tokens"
  ON public.email_confirmation_tokens
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: Allow updating tokens by token value (to mark as used during confirmation)
-- This allows unauthenticated users to mark their token as used after confirmation
CREATE POLICY "Allow token update for email confirmation"
  ON public.email_confirmation_tokens
  FOR UPDATE
  USING (
    expires_at > NOW() 
    AND used = FALSE
  )
  WITH CHECK (
    expires_at > NOW()
  );

