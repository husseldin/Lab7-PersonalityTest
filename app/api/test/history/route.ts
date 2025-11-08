import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { PrismaClient } from '@prisma/client'
import { authOptions } from '@/lib/auth'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const testAttempts = await prisma.testAttempt.findMany({
      where: {
        userId: parseInt(session.user.id)
      },
      orderBy: {
        completedAt: 'desc'
      },
      select: {
        id: true,
        personalityType: true,
        completedAt: true,
        hasPremiumAccess: true,
      }
    })

    return NextResponse.json({ testAttempts })
  } catch (error) {
    console.error('Fetch history error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
