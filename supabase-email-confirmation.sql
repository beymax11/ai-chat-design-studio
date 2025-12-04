-- ============================================
-- Email Confirmation Setup
-- ============================================
-- This SQL sets up email confirmation tokens table

-- ============================================
-- 1. Create Email Confirmation Tokens Table
-- ============================================
CREATE TABLE IF NOT EXISTS public.email_confirmation_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  token TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.email_confirmation_tokens ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 2. Create Policies for Email Confirmation Tokens
-- ============================================

-- Policy: Users can view their own tokens
CREATE POLICY "Users can view own confirmation tokens"
  ON public.email_confirmation_tokens
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Allow service role to insert tokens (for signup)
-- Note: This might need to be adjusted based on your security requirements
-- You may want to use a service role key for this operation
CREATE POLICY "Service can insert confirmation tokens"
  ON public.email_confirmation_tokens
  FOR INSERT
  WITH CHECK (true);

-- Policy: Users can update their own tokens (to mark as used)
CREATE POLICY "Users can update own confirmation tokens"
  ON public.email_confirmation_tokens
  FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================
-- 3. Create Indexes for Better Performance
-- ============================================
CREATE INDEX IF NOT EXISTS email_confirmation_tokens_token_idx ON public.email_confirmation_tokens(token);
CREATE INDEX IF NOT EXISTS email_confirmation_tokens_user_id_idx ON public.email_confirmation_tokens(user_id);
CREATE INDEX IF NOT EXISTS email_confirmation_tokens_email_idx ON public.email_confirmation_tokens(email);
CREATE INDEX IF NOT EXISTS email_confirmation_tokens_expires_at_idx ON public.email_confirmation_tokens(expires_at);

-- ============================================
-- 4. Function to Clean Up Expired Tokens
-- ============================================
CREATE OR REPLACE FUNCTION public.cleanup_expired_tokens()
RETURNS void AS $$
BEGIN
  DELETE FROM public.email_confirmation_tokens
  WHERE expires_at < NOW() OR used = TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 5. Add email_verified column to profiles if not exists
-- ============================================
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'email_verified'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN email_verified BOOLEAN DEFAULT FALSE;
  END IF;
END $$;

-- ============================================
-- Notes:
-- ============================================
-- 1. Run this SQL in your Supabase SQL Editor
-- 2. The token should be generated in your application code
-- 3. Tokens expire after 24 hours by default
-- 4. Consider setting up a cron job to clean up expired tokens periodically

