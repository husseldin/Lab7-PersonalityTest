import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth-options'
import { prisma } from '@/lib/prisma'

export async function POST() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get active question version
    const activeVersion = await prisma.questionVersion.findFirst({
      where: { isActive: true },
      include: {
        questions: {
          orderBy: { orderIndex: 'asc' }
        }
      }
    })

    if (!activeVersion) {
      return NextResponse.json(
        { error: 'No active question version found' },
        { status: 404 }
      )
    }

    // Check for existing incomplete test
    const existingAttempt = await prisma.testAttempt.findFirst({
      where: {
        userId: session.user.id,
        status: 'IN_PROGRESS'
      }
    })

    if (existingAttempt) {
      // Return existing attempt
      return NextResponse.json({
        attempt: existingAttempt,
        questions: activeVersion.questions
      })
    }

    // Create new test attempt
    const attempt = await prisma.testAttempt.create({
      data: {
        userId: session.user.id,
        questionVersionId: activeVersion.id,
        status: 'IN_PROGRESS'
      }
    })

    return NextResponse.json({
      attempt,
      questions: activeVersion.questions
    }, { status: 201 })

  } catch (error) {
    console.error('Test start error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
