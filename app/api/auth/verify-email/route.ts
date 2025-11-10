/**
 * Email Verification API
 * Verifies user email address using token
 */

import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { verifyEmailToken } from '@/lib/tokens'
import { logActivity } from '@/lib/activity-logger'
import { sendWelcomeEmail } from '@/lib/email'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      )
    }

    // Verify token
    const verification = await verifyEmailToken(token)

    if (!verification.valid) {
      return NextResponse.json(
        { error: verification.error || 'Invalid token' },
        { status: 400 }
      )
    }

    // Update user's emailVerified field
    const user = await prisma.user.update({
      where: { id: verification.userId },
      data: { emailVerified: new Date() }
    })

    // Log activity
    await logActivity(user.id, 'email_verified', 'Email address verified successfully')

    // Send welcome email
    if (user.email && user.name) {
      await sendWelcomeEmail(user.email, user.name)
    }

    return NextResponse.json({
      success: true,
      message: 'Email verified successfully'
    })
  } catch (error) {
    console.error('Email verification error:', error)
    return NextResponse.json(
      { error: 'Failed to verify email' },
      { status: 500 }
    )
  }
}

// GET endpoint to verify token without completing verification (for checking validity)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      )
    }

    // Check if token exists and is valid
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token }
    })

    if (!verificationToken) {
      return NextResponse.json(
        { valid: false, error: 'Invalid token' },
        { status: 400 }
      )
    }

    if (new Date() > verificationToken.expiresAt) {
      return NextResponse.json(
        { valid: false, error: 'Token expired' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      valid: true
    })
  } catch (error) {
    console.error('Token check error:', error)
    return NextResponse.json(
      { error: 'Failed to check token' },
      { status: 500 }
    )
  }
}
