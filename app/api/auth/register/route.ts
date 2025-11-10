import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { registrationSchema } from '@/lib/validation'
import { createVerificationToken } from '@/lib/tokens'
import { sendVerificationEmail } from '@/lib/email'
import { logActivity } from '@/lib/activity-logger'
import { isRateLimited, getClientIp, RATE_LIMITS } from '@/lib/rate-limit'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    // Check rate limit
    const clientIp = getClientIp(request.headers)
    if (isRateLimited(clientIp, RATE_LIMITS.auth)) {
      return NextResponse.json(
        { error: 'Too many registration attempts. Please try again later.' },
        { status: 429 }
      )
    }

    const body = await request.json()
    const validatedData = registrationSchema.parse(body)

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 12)

    // Create user
    const user = await prisma.user.create({
      data: {
        email: validatedData.email,
        password: hashedPassword,
        name: validatedData.name,
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      }
    })

    // Log signup activity
    await logActivity(user.id, 'signup', 'New user registered')

    // Create verification token and send email
    const verificationToken = await createVerificationToken(user.id, 'email_verification')
    await sendVerificationEmail(user.email, user.name || 'User', verificationToken)

    return NextResponse.json({
      user,
      message: 'Registration successful. Please check your email to verify your account.'
    }, { status: 201 })
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
