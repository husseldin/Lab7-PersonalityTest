/**
 * Get Shared Result API
 * Retrieves test results via share code
 */

import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(
  request: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const { code } = params

    if (!code) {
      return NextResponse.json(
        { error: 'Share code is required' },
        { status: 400 }
      )
    }

    // Find share record
    const share = await prisma.share.findUnique({
      where: { shareCode: code },
      include: {
        testAttempt: {
          include: {
            user: {
              select: {
                name: true,
                email: false // Don't expose email in shared results
              }
            }
          }
        }
      }
    })

    if (!share) {
      return NextResponse.json(
        { error: 'Share link not found or has expired' },
        { status: 404 }
      )
    }

    // Check if expired
    if (share.expiresAt && new Date() > share.expiresAt) {
      return NextResponse.json(
        { error: 'This share link has expired' },
        { status: 410 }
      )
    }

    // Parse scores and answers
    const scores = JSON.parse(share.testAttempt.scores)
    const answers = JSON.parse(share.testAttempt.answers)

    return NextResponse.json({
      success: true,
      result: {
        personalityType: share.testAttempt.personalityType,
        scores,
        completedAt: share.testAttempt.completedAt,
        userName: share.testAttempt.user.name || 'Anonymous',
        privacy: share.privacy
      }
    })
  } catch (error) {
    console.error('Get shared result error:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve shared result' },
      { status: 500 }
    )
  }
}
