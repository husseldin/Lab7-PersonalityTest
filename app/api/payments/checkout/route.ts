import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'
import { authOptions } from '@/lib/auth'

const prisma = new PrismaClient()

const checkoutSchema = z.object({
  testAttemptId: z.number(),
})

async function getStripeClient() {
  const Stripe = (await import('stripe')).default
  return new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2025-02-24.acacia' as any,
  })
}

export async function POST(request: NextRequest) {
  try {
    const stripe = await getStripeClient()
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = checkoutSchema.parse(body)

    // Verify test attempt belongs to user
    const testAttempt = await prisma.testAttempt.findUnique({
      where: { id: validatedData.testAttemptId }
    })

    if (!testAttempt) {
      return NextResponse.json(
        { error: 'Test attempt not found' },
        { status: 404 }
      )
    }

    if (testAttempt.userId !== parseInt(session.user.id)) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    if (testAttempt.hasPremiumAccess) {
      return NextResponse.json(
        { error: 'Premium access already granted' },
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
              name: 'Premium Personality Report',
              description: `Complete analysis for ${testAttempt.personalityType} personality type`,
            },
            unit_amount: 999, // $9.99
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/result/${testAttempt.id}?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/result/${testAttempt.id}?canceled=true`,
      metadata: {
        userId: session.user.id,
        testAttemptId: validatedData.testAttemptId.toString(),
      },
    })

    // Create payment record
    await prisma.payment.create({
      data: {
        userId: parseInt(session.user.id),
        testAttemptId: validatedData.testAttemptId,
        stripeSessionId: checkoutSession.id,
        amount: 999,
        status: 'pending',
      },
    })

    return NextResponse.json({ url: checkoutSession.url })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
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
