import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { generatePDF } from '@/lib/services/pdf-generator'

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
            fullName: true,
            email: true
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

    if (!attempt.resultType) {
      return NextResponse.json(
        { error: 'Results not available' },
        { status: 400 }
      )
    }

    // Check if user has premium access
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

    // Generate PDF
    const pdfBuffer = await generatePDF(
      {
        personalityType: attempt.resultType,
        scores: {
          EI: { E: attempt.scoreE, I: attempt.scoreI },
          SN: { S: attempt.scoreS, N: attempt.scoreN },
          TF: { T: attempt.scoreT, F: attempt.scoreF },
          JP: { J: attempt.scoreJ, P: attempt.scoreP }
        }
      },
      {
        fullName: attempt.user.fullName,
        email: attempt.user.email
      },
      {
        isPremium: hasPremiumAccess,
        completedAt: attempt.completedAt || new Date()
      }
    )

    // Return PDF as download
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="personality-test-${attempt.resultType}-${params.attemptId}.pdf"`,
        'Content-Length': pdfBuffer.length.toString()
      }
    })

  } catch (error) {
    console.error('PDF generation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
