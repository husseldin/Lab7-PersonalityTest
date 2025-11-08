import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: { attemptId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Fetch test attempt with results
    const attempt = await prisma.testAttempt.findUnique({
      where: { id: params.attemptId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            fullName: true
          }
        },
        questionVersion: {
          select: {
            versionName: true,
            description: true
          }
        }
      }
    })

    if (!attempt) {
      return NextResponse.json(
        { error: 'Test attempt not found' },
        { status: 404 }
      )
    }

    if (attempt.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    if (attempt.status !== 'COMPLETED') {
      return NextResponse.json(
        { error: 'Test not completed yet' },
        { status: 400 }
      )
    }

    // Check if user has premium access (entitlement)
    const entitlement = await prisma.entitlement.findFirst({
      where: {
        userId: session.user.id,
        testAttemptId: params.attemptId,
        expiresAt: {
          gt: new Date()
        }
      }
    })

    const hasPremiumAccess = !!entitlement

    // Return results
    return NextResponse.json({
      attempt: {
        id: attempt.id,
        status: attempt.status,
        completedAt: attempt.completedAt,
        resultType: attempt.resultType
      },
      results: {
        personalityType: attempt.resultType,
        scores: {
          EI: { E: attempt.scoreE, I: attempt.scoreI },
          SN: { S: attempt.scoreS, N: attempt.scoreN },
          TF: { T: attempt.scoreT, F: attempt.scoreF },
          JP: { J: attempt.scoreJ, P: attempt.scoreP }
        }
      },
      hasPremiumAccess,
      questionVersion: attempt.questionVersion
    })

  } catch (error) {
    console.error('Get results error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
