/**
 * Reset Password API
 * Resets user password using valid reset token
 */

import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { verifyPasswordResetToken, markPasswordResetTokenAsUsed } from '@/lib/tokens'
import { logActivity } from '@/lib/activity-logger'
import { passwordResetSchema } from '@/lib/validation'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const { token, password, confirmPassword } = await request.json()

    if (!token) {
      return NextResponse.json(
        { error: 'Reset token is required' },
        { status: 400 }
      )
    }

    // Validate password
    try {
      passwordResetSchema.parse({ password, confirmPassword })
    } catch (error: any) {
      return NextResponse.json(
        { error: 'Invalid password', details: error.errors },
        { status: 400 }
      )
    }

    // Verify reset token
    const verification = await verifyPasswordResetToken(token)

    if (!verification.valid) {
      return NextResponse.json(
        { error: verification.error || 'Invalid or expired reset token' },
        { status: 400 }
      )
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Update user password
    await prisma.user.update({
      where: { id: verification.userId },
      data: { password: hashedPassword }
    })

    // Mark token as used
    await markPasswordResetTokenAsUsed(token)

    // Log activity
    await logActivity(
      verification.userId!,
      'password_reset_completed',
      'Password successfully reset'
    )

    return NextResponse.json({
      success: true,
      message: 'Password reset successfully. You can now sign in with your new password.'
    })
  } catch (error) {
    console.error('Reset password error:', error)
    return NextResponse.json(
      { error: 'Failed to reset password' },
      { status: 500 }
    )
  }
}

// GET endpoint to check if token is valid
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

    const verification = await verifyPasswordResetToken(token)

    if (!verification.valid) {
      return NextResponse.json(
        { valid: false, error: verification.error },
        { status: 400 }
      )
    }

    return NextResponse.json({ valid: true })
  } catch (error) {
    console.error('Token verification error:', error)
    return NextResponse.json(
      { error: 'Failed to verify token' },
      { status: 500 }
    )
  }
}
