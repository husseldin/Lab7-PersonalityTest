import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import Stripe from 'stripe'

export async function POST(request: Request) {
  const body = await request.text()
  const signature = headers().get('stripe-signature')

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    )
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.error('STRIPE_WEBHOOK_SECRET is not set')
    return NextResponse.json(
      { error: 'Webhook secret not configured' },
      { status: 500 }
    )
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    )
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session

        // Extract metadata
        const userId = session.metadata?.userId
        const attemptId = session.metadata?.attemptId

        if (!userId || !attemptId) {
          console.error('Missing metadata in checkout session:', session.id)
          return NextResponse.json(
            { error: 'Missing metadata' },
            { status: 400 }
          )
        }

        // Update payment record
        await prisma.payment.updateMany({
          where: {
            stripeSessionId: session.id
          },
          data: {
            status: 'COMPLETED',
            paidAt: new Date(),
            stripePaymentIntentId: session.payment_intent as string || null
          }
        })

        // Create entitlement (lifetime access)
        await prisma.entitlement.create({
          data: {
            userId,
            attemptId: attemptId,
            type: 'COMPLETE_REPORT',
            expiresAt: new Date('2099-12-31') // Lifetime access
          }
        })

        console.log(`Premium access granted for user ${userId}, attempt ${attemptId}`)
        break
      }

      case 'checkout.session.expired': {
        const session = event.data.object as Stripe.Checkout.Session

        // Mark payment as failed
        await prisma.payment.updateMany({
          where: {
            stripeSessionId: session.id
          },
          data: {
            status: 'FAILED'
          }
        })

        console.log(`Checkout session expired: ${session.id}`)
        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent

        // Update payment record
        await prisma.payment.updateMany({
          where: {
            stripePaymentIntentId: paymentIntent.id
          },
          data: {
            status: 'FAILED'
          }
        })

        console.log(`Payment failed: ${paymentIntent.id}`)
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('Webhook handler error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}
