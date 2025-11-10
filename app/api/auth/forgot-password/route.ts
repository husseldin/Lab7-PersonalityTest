/**
 * Forgot Password API
 * Sends password reset email to user
 */

import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { createPasswordResetToken } from '@/lib/tokens'
import { sendPasswordResetEmail } from '@/lib/email'
import { logActivity } from '@/lib/activity-logger'
import { isRateLimited, getClientIp, RATE_LIMITS } from '@/lib/rate-limit'
import { emailSchema } from '@/lib/validation'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    // Check rate limit
    const clientIp = getClientIp(request.headers)
    if (isRateLimited(clientIp, RATE_LIMITS.passwordReset)) {
      return NextResponse.json(
        { error: 'Too many password reset requests. Please try again later.' },
        { status: 429 }
      )
    }

    const { email } = await request.json()

    // Validate email
    try {
      emailSchema.parse(email)
    } catch {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      )
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    })

    // Don't reveal if user exists or not (security best practice)
    // Always return success to prevent email enumeration
    if (!user) {
      return NextResponse.json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent.'
      })
    }

    // Create reset token
    const resetToken = await createPasswordResetToken(user.id)

    // Send reset email
    await sendPasswordResetEmail(user.email, user.name || 'User', resetToken)

    // Log activity
    await logActivity(user.id, 'password_reset_requested', 'Password reset email sent')

    return NextResponse.json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent.'
    })
  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json(
      { error: 'Failed to process password reset request' },
      { status: 500 }
    )
  }
}
