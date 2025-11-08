import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'
import { authOptions } from '@/lib/auth'

const prisma = new PrismaClient()

const submitTestSchema = z.object({
  answers: z.record(z.string(), z.number()),
})

function calculatePersonalityType(answers: Record<string, number>) {
  const personalityType =
    (answers.E >= answers.I ? 'E' : 'I') +
    (answers.S >= answers.N ? 'S' : 'N') +
    (answers.T >= answers.F ? 'T' : 'F') +
    (answers.J >= answers.P ? 'J' : 'P')

  return personalityType
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = submitTestSchema.parse(body)

    const personalityType = calculatePersonalityType(validatedData.answers)

    // Store the test attempt
    const testAttempt = await prisma.testAttempt.create({
      data: {
        userId: parseInt(session.user.id),
        answers: JSON.stringify(validatedData.answers),
        personalityType,
        scores: JSON.stringify(validatedData.answers),
        hasPremiumAccess: false,
      },
    })

    return NextResponse.json({
      id: testAttempt.id,
      personalityType: testAttempt.personalityType,
      scores: validatedData.answers,
      hasPremiumAccess: testAttempt.hasPremiumAccess,
    }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Test submission error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
