import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signInWithGoogle: () => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  confirmEmail: (token: string) => Promise<{ error: any; success?: boolean }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Handle OAuth callback with hash fragments
    const handleAuthCallback = async () => {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get('access_token');
      const error = hashParams.get('error');
      const errorDescription = hashParams.get('error_description');

      if (error) {
        console.error('OAuth error:', error, errorDescription);
        // Clean up the URL
        window.history.replaceState({}, document.title, window.location.pathname);
        return;
      }

      if (accessToken) {
        // Exchange the code/token for a session
        const { data, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Error getting session:', sessionError);
        }
        
        // Clean up the URL by removing hash fragments
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    };

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Handle OAuth callback
    handleAuthCallback();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    // First, sign up the user in Supabase
    // Note: We disable Supabase's automatic email confirmation by not setting emailRedirectTo
    // and handling email confirmation ourselves via Gmail SMTP
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
        // Don't set emailRedirectTo to prevent Supabase from sending its own email
        // We'll handle email confirmation via our custom Gmail SMTP function
      },
    });

    if (error) {
      return { error };
    }

    if (!data.user) {
      return { error: { message: 'Failed to create user' } };
    }

    // Generate confirmation token
    const confirmationToken = uuidv4() + '-' + Date.now();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // Token expires in 24 hours

    // Store token in database
    const { error: tokenError } = await supabase
      .from('email_confirmation_tokens')
      .insert({
        user_id: data.user.id,
        token: confirmationToken,
        email: email,
        expires_at: expiresAt.toISOString(),
        used: false,
      });

    if (tokenError) {
      console.error('Error storing confirmation token:', tokenError);
      // Don't fail signup if token storage fails, but log it
    }

    // Send confirmation email via Netlify function
    try {
      // Determine function URL
      // Use production URL from environment variable if set, otherwise use current origin
      // This works in both dev and production since the function is deployed on Netlify
      const productionBaseUrl = import.meta.env.VITE_NETLIFY_SITE_URL || 'https://bugbounty-ai.netlify.app';
      const currentOrigin = window.location.origin;
      
      // If we're on localhost (dev mode), use production URL since function is deployed
      // If we're on production, use current origin
      const baseUrl = (currentOrigin.includes('localhost') || currentOrigin.includes('127.0.0.1')) 
        ? productionBaseUrl 
        : currentOrigin;
      
      const functionUrl = `${baseUrl}/.netlify/functions/send-confirmation-email`;

      console.log('Sending confirmation email to:', email);
      console.log('Function URL:', functionUrl);
      console.log('Current origin:', currentOrigin);

      const emailResponse = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: email,
          name: fullName,
          confirmationToken: confirmationToken,
        }),
      });

      console.log('Email response status:', emailResponse.status);

      if (!emailResponse.ok) {
        const errorData = await emailResponse.json().catch(() => ({ error: 'Failed to parse error response' }));
        console.error('Error sending confirmation email:', {
          status: emailResponse.status,
          statusText: emailResponse.statusText,
          error: errorData,
        });
        // Return error so user knows email wasn't sent
        return { 
          error: { 
            message: `Account created but email confirmation failed: ${errorData.error || errorData.details || 'Unknown error'}. Please contact support.` 
          } 
        };
      } else {
        const successData = await emailResponse.json().catch(() => ({}));
        console.log('Email sent successfully:', successData);
      }
    } catch (emailError: any) {
      console.error('Error calling email function:', emailError);
      // Return error so user knows email wasn't sent
      return { 
        error: { 
          message: `Account created but failed to send confirmation email: ${emailError.message || 'Network error'}. Please contact support.` 
        } 
      };
    }

    // IMPORTANT: Sign out the user immediately after signup to prevent auto-login
    // User must confirm their email before they can login
    await supabase.auth.signOut();

    return { error: null };
  };

  const signIn = async (email: string, password: string) => {
    // First, try to sign in
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { error };
    }

    // If sign in successful, check if email is verified
    if (data.user) {
      // Get user's profile to check email_verified status
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('email_verified')
        .eq('id', data.user.id)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        // If we can't check the profile, sign out and return error
        await supabase.auth.signOut();
        return { 
          error: { 
            message: 'Unable to verify email status. Please try again or contact support.' 
          } 
        };
      }

      // Check if email is verified
      // Handle case where email_verified might be null (defaults to false)
      const isEmailVerified = profile?.email_verified === true;
      
      if (!profile) {
        console.error('Profile not found for user:', data.user.id);
        await supabase.auth.signOut();
        return { 
          error: { 
            message: 'User profile not found. Please contact support.' 
          } 
        };
      }

      if (!isEmailVerified) {
        // Email not verified, sign out the user
        await supabase.auth.signOut();
        return { 
          error: { 
            message: 'Please confirm your email address before logging in. Check your inbox for the confirmation email.' 
          } 
        };
      }
    }

    return { error: null };
  };

  const signInWithGoogle = async () => {
    // Get the current origin
    const currentOrigin = window.location.origin;
    
    // Get production URL from environment variables
    const productionUrl = import.meta.env.VITE_NETLIFY_SITE_URL || import.meta.env.VITE_SITE_URL;
    
    // Determine redirect URL:
    // - If we're on localhost, use localhost (for development)
    // - If we're in production, use production URL if available, otherwise use current origin
    // - This ensures production always uses the correct URL
    const isLocalhost = currentOrigin.includes('localhost') || currentOrigin.includes('127.0.0.1');
    const redirectTo = isLocalhost 
      ? currentOrigin 
      : (productionUrl || currentOrigin);
    
    console.log('Google OAuth redirect URL:', redirectTo);
    console.log('Current origin:', currentOrigin);
    console.log('Production URL:', productionUrl);
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectTo,
      },
    });

    if (error) {
      return { error };
    }

    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const confirmEmail = async (token: string) => {
    try {
      console.log('Confirming email with token:', token.substring(0, 20) + '...');
      
      // Find the token in the database
      const { data: tokenData, error: tokenError } = await supabase
        .from('email_confirmation_tokens')
        .select('*')
        .eq('token', token)
        .eq('used', false)
        .single();

      console.log('Token query result:', { 
        hasData: !!tokenData, 
        error: tokenError,
        errorCode: tokenError?.code,
        errorMessage: tokenError?.message,
        errorDetails: tokenError?.details,
        errorHint: tokenError?.hint
      });

      if (tokenError) {
        // Handle specific error codes
        if (tokenError.code === 'PGRST116' || tokenError.message?.includes('No rows')) {
          return { error: { message: 'Invalid or expired confirmation token' } };
        }
        if (tokenError.code === 'PGRST301' || tokenError.message?.includes('406')) {
          return { 
            error: { 
              message: 'Database access denied. Please check RLS policies or contact support.',
              details: tokenError.message 
            } 
          };
        }
        return { 
          error: { 
            message: tokenError.message || 'Failed to verify token',
            details: tokenError.details,
            hint: tokenError.hint
          } 
        };
      }

      if (!tokenData) {
        return { error: { message: 'Invalid or expired confirmation token' } };
      }

      // Check if token is expired
      const expiresAt = new Date(tokenData.expires_at);
      if (expiresAt < new Date()) {
        return { error: { message: 'Confirmation token has expired' } };
      }

      console.log('Token found, updating email_verified to TRUE...');

      // IMPORTANT: Update user's email_verified status to TRUE in profiles
      // This is the main trigger that sets email_verified = TRUE when email is confirmed
      // Using database function to bypass RLS since user is not authenticated during email confirmation
      console.log('Setting email_verified = TRUE for user:', tokenData.user_id);
      console.log('Calling verify_user_email function...');
      
      const { data: verifyResult, error: verifyError } = await supabase
        .rpc('verify_user_email', { user_id_param: tokenData.user_id });

      console.log('RPC call result:', { verifyResult, verifyError });

      if (verifyError) {
        console.error('❌ Error verifying email via function:', verifyError);
        console.error('Error details:', JSON.stringify(verifyError, null, 2));
        
        // Try direct update as fallback (might fail due to RLS, but worth trying)
        console.log('Attempting fallback: direct update to profiles table...');
        const { error: profileError, data: profileData } = await supabase
          .from('profiles')
          .update({ email_verified: true })
          .eq('id', tokenData.user_id)
          .select();

        if (profileError) {
          console.error('❌ Error updating profile (fallback):', profileError);
          return { 
            error: { 
              message: 'Token verified but failed to update email_verified status. Please contact support.',
              details: profileError.message 
            } 
          };
        }
        
        console.log('✅ Fallback update successful:', profileData);
      } else {
        // Check the result from the function
        if (verifyResult && typeof verifyResult === 'object') {
          const result = verifyResult as any;
          if (result.success === false) {
            console.error('❌ Function returned success: false', result);
            return {
              error: {
                message: result.message || 'Failed to verify email',
                details: result.error_code || 'Unknown error'
              }
            };
          }
          console.log('✅ Email verification function executed successfully:', result);
        } else {
          console.log('✅ Email verification function executed. Result:', verifyResult);
        }
        
        // Wait a bit for the update to propagate
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Verify that email_verified was actually set to TRUE
        console.log('Verifying email_verified status...');
        const { data: verifyCheck, error: checkError } = await supabase
          .from('profiles')
          .select('email_verified, id')
          .eq('id', tokenData.user_id)
          .single();
        
        console.log('Verification check result:', { verifyCheck, checkError });
        
        if (checkError) {
          console.error('❌ Error checking verification status:', checkError);
        } else if (verifyCheck) {
          console.log('📊 Current email_verified status:', verifyCheck.email_verified);
          if (verifyCheck.email_verified !== true) {
            console.warn('⚠️ WARNING: email_verified is not TRUE after update! Current value:', verifyCheck.email_verified);
            console.log('Retrying verification...');
            // Try one more time
            const { data: retryResult, error: retryError } = await supabase
              .rpc('verify_user_email', { user_id_param: tokenData.user_id });
            console.log('Retry result:', { retryResult, retryError });
          } else {
            console.log('✅ email_verified is confirmed to be TRUE!');
          }
        }
      }

      // Mark token as used AFTER successfully updating email_verified
      // The trigger will also ensure email_verified = TRUE as a backup
      console.log('Marking confirmation token as used...');
      const { error: updateTokenError } = await supabase
        .from('email_confirmation_tokens')
        .update({ used: true })
        .eq('id', tokenData.id);

      if (updateTokenError) {
        console.error('Error marking token as used:', updateTokenError);
        // Don't fail - email_verified is already set to TRUE
        // Token can be marked as used later if needed
      } else {
        console.log('Token marked as used successfully');
      }

      console.log('Email confirmation successful! email_verified is now TRUE');

      // Note: Supabase handles email confirmation automatically through their auth system
      // We've updated the profile's email_verified field, which is what we use in the app

      return { error: null, success: true };
    } catch (error: any) {
      console.error('Unexpected error in confirmEmail:', error);
      return { 
        error: { 
          message: error.message || 'Failed to confirm email',
          details: error.stack 
        } 
      };
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signUp, signIn, signInWithGoogle, signOut, confirmEmail }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

