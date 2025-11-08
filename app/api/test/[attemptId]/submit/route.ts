import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth-options'
import { prisma } from '@/lib/prisma'

// Convert Likert scale (1-5) to score (-2 to +2)
function likertToScore(value: number): number {
  return value - 3
}

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

    // Verify attempt belongs to user
    const attempt = await prisma.testAttempt.findUnique({
      where: { id: params.attemptId },
      include: {
        answers: {
          include: {
            question: true
          }
        },
        questionVersion: {
          include: {
            questions: true
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

    if (attempt.status !== 'IN_PROGRESS') {
      return NextResponse.json(
        { error: 'Test already submitted' },
        { status: 400 }
      )
    }

    // Verify all questions are answered
    const totalQuestions = attempt.questionVersion.questions.length
    const answeredQuestions = attempt.answers.length

    if (answeredQuestions < totalQuestions) {
      return NextResponse.json(
        {
          error: 'Not all questions answered',
          details: {
            total: totalQuestions,
            answered: answeredQuestions,
            remaining: totalQuestions - answeredQuestions
          }
        },
        { status: 400 }
      )
    }

    // Initialize dimension scores
    let scoreE = 0, scoreI = 0
    let scoreS = 0, scoreN = 0
    let scoreT = 0, scoreF = 0
    let scoreJ = 0, scoreP = 0

    // Calculate scores for each dimension
    for (const answer of attempt.answers) {
      const question = answer.question
      const rawScore = likertToScore(answer.answer)
      const weightedScore = rawScore * question.weight

      // Apply direction and accumulate scores
      const dimension = question.dimension
      const direction = question.direction

      if (dimension === 'EI') {
        if (direction === 'POSITIVE') {
          scoreE += weightedScore
        } else {
          scoreI += weightedScore
        }
      } else if (dimension === 'SN') {
        if (direction === 'POSITIVE') {
          scoreS += weightedScore
        } else {
          scoreN += weightedScore
        }
      } else if (dimension === 'TF') {
        if (direction === 'POSITIVE') {
          scoreT += weightedScore
        } else {
          scoreF += weightedScore
        }
      } else if (dimension === 'JP') {
        if (direction === 'POSITIVE') {
          scoreJ += weightedScore
        } else {
          scoreP += weightedScore
        }
      }
    }

    // Determine personality type
    const type1 = scoreE >= scoreI ? 'E' : 'I'
    const type2 = scoreS >= scoreN ? 'S' : 'N'
    const type3 = scoreT >= scoreF ? 'T' : 'F'
    const type4 = scoreJ >= scoreP ? 'J' : 'P'
    const resultType = `${type1}${type2}${type3}${type4}`

    // Update test attempt with results
    const updatedAttempt = await prisma.testAttempt.update({
      where: { id: params.attemptId },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
        scoreE: Math.round(scoreE),
        scoreI: Math.round(scoreI),
        scoreS: Math.round(scoreS),
        scoreN: Math.round(scoreN),
        scoreT: Math.round(scoreT),
        scoreF: Math.round(scoreF),
        scoreJ: Math.round(scoreJ),
        scoreP: Math.round(scoreP),
        resultType
      }
    })

    return NextResponse.json({
      attempt: updatedAttempt,
      results: {
        personalityType: resultType,
        scores: {
          EI: { E: Math.round(scoreE), I: Math.round(scoreI) },
          SN: { S: Math.round(scoreS), N: Math.round(scoreN) },
          TF: { T: Math.round(scoreT), F: Math.round(scoreF) },
          JP: { J: Math.round(scoreJ), P: Math.round(scoreP) }
        }
      }
    })

  } catch (error) {
    console.error('Test submit error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
