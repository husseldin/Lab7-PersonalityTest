import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { stripe } from '@/lib/stripe'
import { z } from 'zod'

const checkoutSchema = z.object({
  attemptId: z.string()
})

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { attemptId } = checkoutSchema.parse(body)

    // Verify test attempt exists and is completed
    const attempt = await prisma.testAttempt.findUnique({
      where: { id: attemptId }
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
        { error: 'Test must be completed before purchasing premium report' },
        { status: 400 }
      )
    }

    // Check if user already has premium access
    const existingEntitlement = await prisma.entitlement.findFirst({
      where: {
        userId: session.user.id,
        testAttemptId: attemptId,
        expiresAt: {
          gt: new Date()
        }
      }
    })

    if (existingEntitlement) {
      return NextResponse.json(
        { error: 'Premium report already purchased' },
        { status: 400 }
      )
    }

    // Create Stripe checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Premium Personality Test Report',
              description: `Full report for ${attempt.resultType || 'your personality type'} with career recommendations and growth insights`,
            },
            unit_amount: 990, // $9.90 in cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/test/${attemptId}/results?payment=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/test/${attemptId}/results?payment=cancelled`,
      customer_email: session.user.email || undefined,
      metadata: {
        userId: session.user.id,
        attemptId: attemptId,
      },
    })

    // Create payment record
    await prisma.payment.create({
      data: {
        userId: session.user.id,
        testAttemptId: attemptId,
        stripeSessionId: checkoutSession.id,
        amount: 9.90,
        currency: 'USD',
        status: 'PENDING'
      }
    })

    return NextResponse.json({
      sessionId: checkoutSession.id,
      url: checkoutSession.url
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
