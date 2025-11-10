/**
 * Validation Utilities
 * Common validation functions for user input
 */

import { z } from 'zod'

/**
 * Email validation schema
 */
export const emailSchema = z.string().email('Invalid email address')

/**
 * Password validation schema
 * Requirements: At least 8 characters, one uppercase, one lowercase, one number
 */
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')

/**
 * Name validation schema
 */
export const nameSchema = z
  .string()
  .min(2, 'Name must be at least 2 characters')
  .max(100, 'Name must not exceed 100 characters')
  .regex(/^[a-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes')

/**
 * User registration schema
 */
export const registrationSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  name: nameSchema,
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
})

/**
 * User profile update schema
 */
export const profileUpdateSchema = z.object({
  name: nameSchema.optional(),
  bio: z.string().max(500, 'Bio must not exceed 500 characters').optional(),
  image: z.string().url('Invalid image URL').optional()
})

/**
 * Password reset schema
 */
export const passwordResetSchema = z.object({
  password: passwordSchema,
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
})

/**
 * Email change schema
 */
export const emailChangeSchema = z.object({
  newEmail: emailSchema,
  password: z.string().min(1, 'Password is required')
})

/**
 * Validate email
 */
export function isValidEmail(email: string): boolean {
  try {
    emailSchema.parse(email)
    return true
  } catch {
    return false
  }
}

/**
 * Validate password strength
 */
export function isValidPassword(password: string): boolean {
  try {
    passwordSchema.parse(password)
    return true
  } catch {
    return false
  }
}

/**
 * Get password strength score (0-4)
 */
export function getPasswordStrength(password: string): {
  score: number
  feedback: string
} {
  let score = 0
  let feedback = 'Very weak'

  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++

  if (score === 0 || score === 1) {
    feedback = 'Very weak'
  } else if (score === 2) {
    feedback = 'Weak'
  } else if (score === 3) {
    feedback = 'Medium'
  } else if (score === 4) {
    feedback = 'Strong'
  } else {
    feedback = 'Very strong'
  }

  return { score: Math.min(score, 4), feedback }
}

/**
 * Sanitize user input to prevent XSS
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
}

/**
 * Validate and sanitize URL
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

/**
 * Check if string contains profanity (basic implementation)
 */
const profanityList = ['badword1', 'badword2'] // Add actual profanity list in production

export function containsProfanity(text: string): boolean {
  const lowerText = text.toLowerCase()
  return profanityList.some(word => lowerText.includes(word))
}

/**
 * Validate image file
 */
export function isValidImageFile(file: File): { valid: boolean; error?: string } {
  const maxSize = 5 * 1024 * 1024 // 5MB
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed.' }
  }

  if (file.size > maxSize) {
    return { valid: false, error: 'File size must be less than 5MB.' }
  }

  return { valid: true }
}
