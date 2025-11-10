/**
 * Create Share Link API
 * Creates a shareable link for test results
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { PrismaClient } from '@prisma/client'
import { authOptions } from '@/lib/auth'
import { generateSecureToken } from '@/lib/tokens'
import { logActivity } from '@/lib/activity-logger'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { testAttemptId, privacy, expiresInDays } = await request.json()

    if (!testAttemptId) {
      return NextResponse.json(
        { error: 'Test attempt ID is required' },
        { status: 400 }
      )
    }

    // Verify test attempt belongs to user
    const testAttempt = await prisma.testAttempt.findFirst({
      where: {
        id: testAttemptId,
        userId: parseInt(session.user.id)
      }
    })

    if (!testAttempt) {
      return NextResponse.json(
        { error: 'Test attempt not found' },
        { status: 404 }
      )
    }

    // Generate unique share code
    const shareCode = generateSecureToken(12) // Shorter token for URLs

    // Calculate expiration
    let expiresAt = null
    if (expiresInDays && expiresInDays > 0) {
      expiresAt = new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
    }

    // Create share record
    const share = await prisma.share.create({
      data: {
        testAttemptId,
        shareCode,
        privacy: privacy || 'public',
        expiresAt
      }
    })

    // Log activity
    await logActivity(
      parseInt(session.user.id),
      'share_created',
      `Created ${privacy || 'public'} share link for test result`,
      { testAttemptId, shareCode }
    )

    const shareUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/share/${shareCode}`

    return NextResponse.json({
      success: true,
      share: {
        id: share.id,
        shareCode: share.shareCode,
        shareUrl,
        privacy: share.privacy,
        expiresAt: share.expiresAt
      }
    })
  } catch (error) {
    console.error('Create share error:', error)
    return NextResponse.json(
      { error: 'Failed to create share link' },
      { status: 500 }
    )
  }
}
