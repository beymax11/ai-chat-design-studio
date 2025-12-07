import type { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';

interface DeleteAccountRequest {
  userId: string;
  accessToken: string;
  supabaseUrl?: string; // Optional: can be passed from client as fallback
}

export const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  // Get the origin from the request headers for CORS
  const requestOrigin = event.headers.origin || 
                       event.headers.Origin || 
                       event.headers['ORIGIN'] ||
                       '';
  
  const allowedOrigins = [
    'http://localhost:8080',
    'http://localhost:5173',
    'http://localhost:3000',
    'http://127.0.0.1:8080',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:3000',
    'https://bugbounty-ai.netlify.app',
  ];
  
  // Normalize origin for comparison
  const normalizedOrigin = requestOrigin.toLowerCase().replace(/\/$/, '');
  const normalizedAllowed = allowedOrigins.map(o => o.toLowerCase().replace(/\/$/, ''));
  
  const corsOrigin = requestOrigin && normalizedAllowed.includes(normalizedOrigin)
    ? requestOrigin 
    : '*';
  
  // Add CORS headers to all responses
  const corsHeaders: Record<string, string> = {
    'Access-Control-Allow-Origin': corsOrigin,
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Allow-Methods': 'POST, OPTIONS, DELETE',
    'Access-Control-Max-Age': '86400',
  };
  
  if (corsOrigin !== '*') {
    corsHeaders['Access-Control-Allow-Credentials'] = 'true';
  }

  // Handle CORS preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: '',
    };
  }
  
  corsHeaders['Content-Type'] = 'application/json';

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { userId, accessToken, supabaseUrl: requestSupabaseUrl }: DeleteAccountRequest = JSON.parse(event.body || '{}');

    if (!userId || !accessToken) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Missing required fields: userId, accessToken' }),
      };
    }

    // Get Supabase URL from environment variables or request (URL is public, so safe to accept from client)
    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || requestSupabaseUrl;
    // Service role key MUST come from environment variables for security
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl) {
      console.error('Supabase URL not configured', {
        hasEnvUrl: !!(process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL),
        hasRequestUrl: !!requestSupabaseUrl,
      });
      return {
        statusCode: 500,
        headers: corsHeaders,
        body: JSON.stringify({ 
          error: 'Server configuration error: Supabase URL not found. Please set SUPABASE_URL environment variable or contact support.',
        }),
      };
    }

    if (!supabaseServiceRoleKey) {
      console.error('Supabase Service Role Key not configured', {
        hasServiceRoleKey: !!supabaseServiceRoleKey,
      });
      return {
        statusCode: 500,
        headers: corsHeaders,
        body: JSON.stringify({ 
          error: 'Server configuration error: SUPABASE_SERVICE_ROLE_KEY environment variable is not set. This is required for account deletion. Please contact support.',
        }),
      };
    }

    // Create admin client with service role key (bypasses RLS)
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Verify the user's session is valid by checking the access token
    // We use the admin client to verify, but we need to check if the token matches the userId
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(accessToken);

    if (userError || !user) {
      console.error('Error verifying user:', userError);
      return {
        statusCode: 401,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Unauthorized. Invalid session.' }),
      };
    }

    // Double-check that the userId matches the token's user
    if (user.id !== userId) {
      return {
        statusCode: 403,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Forbidden. User ID mismatch.' }),
      };
    }

    // Delete the auth user permanently
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (deleteError) {
      console.error('Error deleting auth user:', deleteError);
      return {
        statusCode: 500,
        headers: corsHeaders,
        body: JSON.stringify({ 
          error: 'Failed to delete account',
          details: deleteError.message,
        }),
      };
    }

    console.log('Successfully deleted auth user:', userId);

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ 
        success: true,
        message: 'Account deleted successfully',
      }),
    };
  } catch (error: any) {
    console.error('Error in delete-account function:', {
      message: error.message,
      stack: error.stack,
    });
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ 
        error: 'Internal server error',
        details: error.message,
      }),
    };
  }
};

