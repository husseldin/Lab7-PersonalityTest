import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth/password'
import { z } from 'zod'

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).regex(/^(?=.*[A-Z])(?=.*[0-9])/,
    'Password must contain at least one uppercase letter and one number'),
  fullName: z.string().min(2).max(100),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validate input
    const { email, password, fullName } = registerSchema.parse(body)

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const passwordHash = await hashPassword(password)

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        fullName,
        emailVerificationToken: crypto.randomUUID(),
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        createdAt: true,
      }
    })

    // TODO: Send verification email

    return NextResponse.json({
      message: 'User created successfully. Please check your email to verify your account.',
      user
    }, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
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
