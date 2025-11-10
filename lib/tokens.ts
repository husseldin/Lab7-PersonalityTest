/**
 * Token Utilities
 * Handles generation and validation of secure tokens
 */

import crypto from 'crypto'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Generate a cryptographically secure random token
 */
export function generateSecureToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex')
}

/**
 * Create email verification token
 */
export async function createVerificationToken(
  userId: number,
  type: 'email_verification' | 'email_change' = 'email_verification'
): Promise<string> {
  const token = generateSecureToken()
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

  // Delete any existing verification tokens for this user and type
  await prisma.verificationToken.deleteMany({
    where: { userId, type }
  })

  // Create new token
  await prisma.verificationToken.create({
    data: {
      userId,
      token,
      type,
      expiresAt
    }
  })

  return token
}

/**
 * Verify email verification token
 */
export async function verifyEmailToken(token: string): Promise<{ valid: boolean; userId?: number; error?: string }> {
  const verificationToken = await prisma.verificationToken.findUnique({
    where: { token }
  })

  if (!verificationToken) {
    return { valid: false, error: 'Invalid token' }
  }

  if (new Date() > verificationToken.expiresAt) {
    // Delete expired token
    await prisma.verificationToken.delete({
      where: { id: verificationToken.id }
    })
    return { valid: false, error: 'Token expired' }
  }

  // Token is valid - delete it after use
  await prisma.verificationToken.delete({
    where: { id: verificationToken.id }
  })

  return { valid: true, userId: verificationToken.userId }
}

/**
 * Create password reset token
 */
export async function createPasswordResetToken(userId: number): Promise<string> {
  const token = generateSecureToken()
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

  // Delete any existing reset tokens for this user
  await prisma.passwordResetToken.deleteMany({
    where: { userId }
  })

  // Create new token
  await prisma.passwordResetToken.create({
    data: {
      userId,
      token,
      expiresAt
    }
  })

  return token
}

/**
 * Verify password reset token
 */
export async function verifyPasswordResetToken(token: string): Promise<{ valid: boolean; userId?: number; error?: string }> {
  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { token }
  })

  if (!resetToken) {
    return { valid: false, error: 'Invalid token' }
  }

  if (resetToken.used) {
    return { valid: false, error: 'Token already used' }
  }

  if (new Date() > resetToken.expiresAt) {
    // Delete expired token
    await prisma.passwordResetToken.delete({
      where: { id: resetToken.id }
    })
    return { valid: false, error: 'Token expired' }
  }

  return { valid: true, userId: resetToken.userId }
}

/**
 * Mark password reset token as used
 */
export async function markPasswordResetTokenAsUsed(token: string): Promise<void> {
  await prisma.passwordResetToken.update({
    where: { token },
    data: { used: true }
  })
}

/**
 * Clean up expired tokens (should be run periodically)
 */
export async function cleanupExpiredTokens(): Promise<void> {
  const now = new Date()

  await prisma.verificationToken.deleteMany({
    where: { expiresAt: { lt: now } }
  })

  await prisma.passwordResetToken.deleteMany({
    where: { expiresAt: { lt: now } }
  })
}
