import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import Stripe from 'stripe'

const prisma = new PrismaClient()
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-11-20.acacia',
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || ''

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')

    if (!signature) {
      return NextResponse.json(
        { error: 'No signature' },
        { status: 400 }
      )
    }

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      )
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session

        const payment = await prisma.payment.findUnique({
          where: { stripeSessionId: session.id }
        })

        if (payment) {
          // Update payment status
          await prisma.payment.update({
            where: { id: payment.id },
            data: {
              status: 'completed',
              stripePaymentId: session.payment_intent as string,
            },
          })

          // Grant premium access
          if (payment.testAttemptId) {
            await prisma.testAttempt.update({
              where: { id: payment.testAttemptId },
              data: { hasPremiumAccess: true },
            })
          }
        }
        break
      }

      case 'checkout.session.expired':
      case 'payment_intent.payment_failed': {
        const session = event.data.object as Stripe.Checkout.Session

        const payment = await prisma.payment.findUnique({
          where: { stripeSessionId: session.id }
        })

        if (payment) {
          await prisma.payment.update({
            where: { id: payment.id },
            data: { status: 'failed' },
          })
        }
        break
      }

      default:
        console.log(`Unhandled event type ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}
