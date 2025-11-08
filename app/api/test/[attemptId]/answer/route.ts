import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth-options'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const answerSchema = z.object({
  questionId: z.string(),
  value: z.number().int().min(1).max(5)
})

export async function POST(
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

    const body = await request.json()
    const { questionId, value } = answerSchema.parse(body)

    // Verify attempt belongs to user and is in progress
    const attempt = await prisma.testAttempt.findUnique({
      where: { id: params.attemptId }
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

    if (attempt.status !== 'IN_PROGRESS') {
      return NextResponse.json(
        { error: 'Test attempt is not in progress' },
        { status: 400 }
      )
    }

    // Verify question exists and belongs to the same version
    const question = await prisma.question.findUnique({
      where: { id: questionId }
    })

    if (!question || question.versionId !== attempt.questionVersionId) {
      return NextResponse.json(
        { error: 'Invalid question' },
        { status: 400 }
      )
    }

    // Upsert answer (update if exists, create if not)
    const answer = await prisma.testAnswer.upsert({
      where: {
        attemptId_questionId: {
          attemptId: params.attemptId,
          questionId
        }
      },
      update: {
        answer: value,
        updatedAt: new Date()
      },
      create: {
        attemptId: params.attemptId,
        questionId,
        answer: value
      }
    })

    return NextResponse.json({ answer })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Answer save error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
