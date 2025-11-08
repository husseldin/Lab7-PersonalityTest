import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { PrismaClient } from '@prisma/client'
import { authOptions } from '@/lib/auth'
import { generatePDF } from '../../../../../../lib/pdf-generator'

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
      where: { id: parseInt(params.id) },
      include: {
        user: {
          select: {
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

    if (testAttempt.userId !== parseInt(session.user.id)) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    if (!testAttempt.hasPremiumAccess) {
      return NextResponse.json(
        { error: 'Premium access required' },
        { status: 403 }
      )
    }

    const pdfBuffer = await generatePDF({
      personalityType: testAttempt.personalityType,
      name: testAttempt.user.name || undefined,
      scores: JSON.parse(testAttempt.scores),
      completedAt: testAttempt.completedAt,
    })

    return new NextResponse(pdfBuffer as unknown as BodyInit, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="personality-report-${testAttempt.personalityType}.pdf"`,
      },
    })
  } catch (error) {
    console.error('PDF generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    )
  }
}
