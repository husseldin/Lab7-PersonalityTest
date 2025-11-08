import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth-options'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Fetch user's test attempts
    const attempts = await prisma.testAttempt.findMany({
      where: {
        userId: session.user.id
      },
      include: {
        questionVersion: {
          select: {
            versionName: true,
            description: true
          }
        },
        entitlement: {
          where: {
            expiresAt: {
              gt: new Date()
            }
          },
          select: {
            id: true,
            type: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Format response
    const formattedAttempts = attempts.map(attempt => ({
      id: attempt.id,
      status: attempt.status,
      resultType: attempt.resultType,
      createdAt: attempt.createdAt,
      completedAt: attempt.completedAt,
      questionVersion: attempt.questionVersion,
      hasPremiumAccess: !!attempt.entitlement,
      scores: attempt.status === 'COMPLETED' ? {
        EI: { E: attempt.scoreE, I: attempt.scoreI },
        SN: { S: attempt.scoreS, N: attempt.scoreN },
        TF: { T: attempt.scoreT, F: attempt.scoreF },
        JP: { J: attempt.scoreJ, P: attempt.scoreP }
      } : null
    }))

    return NextResponse.json({
      attempts: formattedAttempts,
      total: formattedAttempts.length
    })

  } catch (error) {
    console.error('Test history error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
