/**
 * Email Service
 * Handles sending transactional emails for the application
 * In production, integrate with SendGrid, AWS SES, or similar service
 */

import crypto from 'crypto'

export interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

/**
 * Mock email sending function
 * In production, replace with actual email service (SendGrid, AWS SES, etc.)
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    // In development, just log the email
    if (process.env.NODE_ENV === 'development') {
      console.log('📧 Email would be sent:', {
        to: options.to,
        subject: options.subject,
        preview: options.text?.substring(0, 100) || 'No preview'
      })
      return true
    }

    // In production, implement actual email sending
    // Example with SendGrid:
    // const msg = {
    //   to: options.to,
    //   from: process.env.EMAIL_FROM!,
    //   subject: options.subject,
    //   html: options.html,
    //   text: options.text,
    // }
    // await sgMail.send(msg)

    return true
  } catch (error) {
    console.error('Failed to send email:', error)
    return false
  }
}

/**
 * Send email verification email
 */
export async function sendVerificationEmail(
  email: string,
  name: string,
  token: string
): Promise<boolean> {
  const verificationUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/auth/verify-email?token=${token}`

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Verify Your Email</h1>
          </div>
          <div class="content">
            <p>Hi ${name},</p>
            <p>Thank you for signing up! Please verify your email address to complete your registration.</p>
            <p style="text-align: center;">
              <a href="${verificationUrl}" class="button">Verify Email Address</a>
            </p>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #667eea;">${verificationUrl}</p>
            <p>This link will expire in 24 hours.</p>
            <p>If you didn't create an account, you can safely ignore this email.</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Personality Test Platform. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `

  const text = `Hi ${name},\n\nThank you for signing up! Please verify your email address by clicking the link below:\n\n${verificationUrl}\n\nThis link will expire in 24 hours.\n\nIf you didn't create an account, you can safely ignore this email.`

  return sendEmail({
    to: email,
    subject: 'Verify Your Email Address',
    html,
    text
  })
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(
  email: string,
  name: string,
  token: string
): Promise<boolean> {
  const resetUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/auth/reset-password?token=${token}`

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 12px; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Reset Your Password</h1>
          </div>
          <div class="content">
            <p>Hi ${name},</p>
            <p>We received a request to reset your password. Click the button below to create a new password:</p>
            <p style="text-align: center;">
              <a href="${resetUrl}" class="button">Reset Password</a>
            </p>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #667eea;">${resetUrl}</p>
            <div class="warning">
              <strong>Security Notice:</strong> This link will expire in 1 hour. If you didn't request a password reset, please ignore this email and your password will remain unchanged.
            </div>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Personality Test Platform. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `

  const text = `Hi ${name},\n\nWe received a request to reset your password. Click the link below to create a new password:\n\n${resetUrl}\n\nThis link will expire in 1 hour.\n\nIf you didn't request a password reset, please ignore this email.`

  return sendEmail({
    to: email,
    subject: 'Reset Your Password',
    html,
    text
  })
}

/**
 * Send welcome email after email verification
 */
export async function sendWelcomeEmail(
  email: string,
  name: string
): Promise<boolean> {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .feature { background: white; padding: 15px; margin: 10px 0; border-radius: 5px; border-left: 4px solid #667eea; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to Personality Test Platform! 🎉</h1>
          </div>
          <div class="content">
            <p>Hi ${name},</p>
            <p>Welcome aboard! Your email has been verified and your account is now active.</p>
            <h3>Here's what you can do:</h3>
            <div class="feature">
              <strong>📝 Take the MBTI Test</strong><br>
              Discover your personality type with our comprehensive 60-question assessment.
            </div>
            <div class="feature">
              <strong>📊 Get Detailed Results</strong><br>
              Receive in-depth analysis and downloadable PDF reports.
            </div>
            <div class="feature">
              <strong>🔄 Track Your Progress</strong><br>
              Retake tests and see how you evolve over time.
            </div>
            <div class="feature">
              <strong>🤝 Share Results</strong><br>
              Share your personality insights with friends and colleagues.
            </div>
            <p style="text-align: center;">
              <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/dashboard" class="button">Go to Dashboard</a>
            </p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Personality Test Platform. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `

  const text = `Hi ${name},\n\nWelcome aboard! Your email has been verified and your account is now active.\n\nStart by taking the MBTI test and discovering your personality type!\n\nVisit: ${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/dashboard`

  return sendEmail({
    to: email,
    subject: 'Welcome to Personality Test Platform! 🎉',
    html,
    text
  })
}

/**
 * Send test completion notification
 */
export async function sendTestCompletionEmail(
  email: string,
  name: string,
  personalityType: string,
  resultId: number
): Promise<boolean> {
  const resultUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/result/${resultId}`

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .result-box { background: white; padding: 20px; text-align: center; border-radius: 10px; margin: 20px 0; }
          .personality-type { font-size: 36px; font-weight: bold; color: #667eea; margin: 10px 0; }
          .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Your Test Results Are Ready! 🎯</h1>
          </div>
          <div class="content">
            <p>Hi ${name},</p>
            <p>Congratulations on completing the personality test!</p>
            <div class="result-box">
              <p>Your personality type is:</p>
              <div class="personality-type">${personalityType}</div>
            </div>
            <p style="text-align: center;">
              <a href="${resultUrl}" class="button">View Full Results</a>
            </p>
            <p>Your detailed report includes:</p>
            <ul>
              <li>Complete personality analysis</li>
              <li>Strengths and growth areas</li>
              <li>Career suggestions</li>
              <li>Relationship insights</li>
              <li>Downloadable PDF report</li>
            </ul>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Personality Test Platform. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `

  const text = `Hi ${name},\n\nCongratulations! Your personality type is: ${personalityType}\n\nView your full results at: ${resultUrl}`

  return sendEmail({
    to: email,
    subject: `Your Personality Type: ${personalityType}`,
    html,
    text
  })
}
