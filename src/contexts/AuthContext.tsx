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
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

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

    return { error: null };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { error };
    }

    return { error: null };
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}`,
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
      // Find the token in the database
      const { data: tokenData, error: tokenError } = await supabase
        .from('email_confirmation_tokens')
        .select('*')
        .eq('token', token)
        .eq('used', false)
        .single();

      if (tokenError || !tokenData) {
        return { error: { message: 'Invalid or expired confirmation token' } };
      }

      // Check if token is expired
      const expiresAt = new Date(tokenData.expires_at);
      if (expiresAt < new Date()) {
        return { error: { message: 'Confirmation token has expired' } };
      }

      // Mark token as used
      await supabase
        .from('email_confirmation_tokens')
        .update({ used: true })
        .eq('id', tokenData.id);

      // Update user's email_verified status in profiles
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ email_verified: true })
        .eq('id', tokenData.user_id);

      if (profileError) {
        console.error('Error updating profile:', profileError);
      }

      // Note: Supabase handles email confirmation automatically through their auth system
      // We've updated the profile's email_verified field, which is what we use in the app

      return { error: null, success: true };
    } catch (error: any) {
      return { error: { message: error.message || 'Failed to confirm email' } };
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

