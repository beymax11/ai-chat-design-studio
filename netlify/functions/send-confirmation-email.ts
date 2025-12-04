import type { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import nodemailer from 'nodemailer';

interface EmailRequest {
  to: string;
  name: string;
  confirmationToken: string;
}

export const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  // Add CORS headers to all responses
  const corsHeaders: Record<string, string> = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS, GET',
    'Access-Control-Max-Age': '86400',
    'Content-Type': 'application/json',
  };

  // Handle CORS preflight requests FIRST
  if (event.httpMethod === 'OPTIONS') {
    console.log('Handling OPTIONS preflight request');
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: '',
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { to, name, confirmationToken }: EmailRequest = JSON.parse(event.body || '{}');

    console.log('Received email request:', { to, name, hasToken: !!confirmationToken });

    if (!to || !name || !confirmationToken) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Missing required fields: to, name, confirmationToken' }),
      };
    }

    // Get Gmail SMTP credentials from environment variables
    const gmailUser = process.env.GMAIL_USER;
    const gmailAppPassword = process.env.GMAIL_APP_PASSWORD;
    // Get base URL from environment or construct from request
    const baseUrl = process.env.BASE_URL || 
                    (event.headers['x-forwarded-proto'] && event.headers.host 
                      ? `${event.headers['x-forwarded-proto']}://${event.headers.host}`
                      : 'https://bugbounty-ai.netlify.app');

    if (!gmailUser || !gmailAppPassword) {
      console.error('Gmail credentials not configured', {
        hasUser: !!gmailUser,
        hasPassword: !!gmailAppPassword,
      });
      return {
        statusCode: 500,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Email service not configured. Please check environment variables.' }),
      };
    }

    console.log('Gmail credentials found, creating transporter...');

    // Create transporter using Gmail SMTP
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: gmailUser,
        pass: gmailAppPassword, // Use App Password, not regular password
      },
    });

    // Create confirmation URL
    const confirmationUrl = `${baseUrl}/confirm-email?token=${confirmationToken}`;

    // Email content
    const mailOptions = {
      from: `"BugBounty AI" <${gmailUser}>`,
      to: to,
      subject: 'Confirm Your Email Address - BugBounty AI',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Email Confirmation</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to BugBounty AI!</h1>
          </div>
          <div style="background: #ffffff; padding: 40px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <p style="font-size: 16px; margin-bottom: 20px;">Hi ${name},</p>
            <p style="font-size: 16px; margin-bottom: 20px;">
              Thank you for signing up! Please confirm your email address by clicking the button below:
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${confirmationUrl}" 
                 style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
                Confirm Email Address
              </a>
            </div>
            <p style="font-size: 14px; color: #666; margin-top: 30px;">
              Or copy and paste this link into your browser:
            </p>
            <p style="font-size: 12px; color: #999; word-break: break-all; background: #f5f5f5; padding: 10px; border-radius: 4px;">
              ${confirmationUrl}
            </p>
            <p style="font-size: 14px; color: #666; margin-top: 30px;">
              This link will expire in 24 hours. If you didn't create an account, you can safely ignore this email.
            </p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            <p style="font-size: 12px; color: #999; text-align: center; margin: 0;">
              © ${new Date().getFullYear()} BugBounty AI. All rights reserved.
            </p>
          </div>
        </body>
        </html>
      `,
      text: `
        Welcome to BugBounty AI!
        
        Hi ${name},
        
        Thank you for signing up! Please confirm your email address by visiting this link:
        
        ${confirmationUrl}
        
        This link will expire in 24 hours. If you didn't create an account, you can safely ignore this email.
        
        © ${new Date().getFullYear()} BugBounty AI. All rights reserved.
      `,
    };

    // Send email
    console.log('Sending email to:', to);
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ 
        success: true, 
        message: 'Confirmation email sent successfully',
        messageId: info.messageId,
      }),
    };
  } catch (error: any) {
    console.error('Error sending email:', {
      message: error.message,
      stack: error.stack,
      code: error.code,
    });
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ 
        error: 'Failed to send email',
        details: error.message,
        code: error.code,
      }),
    };
  }
};

