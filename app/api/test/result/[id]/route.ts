import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { PrismaClient } from '@prisma/client'
import { authOptions } from '@/lib/auth'

const prisma = new PrismaClient()

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const testAttempt = await prisma.testAttempt.findUnique({
      where: {
        id: parseInt(params.id)
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          }
        }
      }
    })

    if (!testAttempt) {
      return NextResponse.json(
        { error: 'Test result not found' },
        { status: 404 }
      )
    }

    // Check if the user owns this test result
    if (testAttempt.userId !== parseInt(session.user.id)) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    return NextResponse.json({
      id: testAttempt.id,
      personalityType: testAttempt.personalityType,
      scores: JSON.parse(testAttempt.scores),
      completedAt: testAttempt.completedAt,
      hasPremiumAccess: testAttempt.hasPremiumAccess,
    })
  } catch (error) {
    console.error('Fetch result error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
