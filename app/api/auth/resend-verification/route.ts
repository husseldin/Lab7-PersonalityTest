/**
 * Resend Verification Email API
 * Sends a new verification email to the user
 */

import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createVerificationToken } from '@/lib/tokens'
import { sendVerificationEmail } from '@/lib/email'
import { isRateLimited, getClientIp, RATE_LIMITS } from '@/lib/rate-limit'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    // Check rate limit
    const clientIp = getClientIp(request.headers)
    if (isRateLimited(clientIp, RATE_LIMITS.emailVerification)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      )
    }

    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: parseInt(session.user.id) }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Check if already verified
    if (user.emailVerified) {
      return NextResponse.json(
        { error: 'Email already verified' },
        { status: 400 }
      )
    }

    // Create new verification token
    const token = await createVerificationToken(user.id, 'email_verification')

    // Send verification email
    const emailSent = await sendVerificationEmail(
      user.email,
      user.name || 'User',
      token
    )

    if (!emailSent) {
      return NextResponse.json(
        { error: 'Failed to send verification email' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Verification email sent successfully'
    })
  } catch (error) {
    console.error('Resend verification error:', error)
    return NextResponse.json(
      { error: 'Failed to resend verification email' },
      { status: 500 }
    )
  }
}
