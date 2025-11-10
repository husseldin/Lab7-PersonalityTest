/**
 * Rate Limiting
 * Prevents abuse by limiting requests per time window
 */

interface RateLimitEntry {
  count: number
  resetAt: number
}

const rateLimitStore = new Map<string, RateLimitEntry>()

/**
 * Rate limit configuration
 */
export interface RateLimitConfig {
  interval: number // Time window in milliseconds
  maxRequests: number // Maximum requests allowed in the time window
}

/**
 * Default rate limit configurations
 */
export const RATE_LIMITS = {
  // Authentication endpoints
  auth: {
    interval: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5 // 5 attempts per 15 minutes
  },
  // Password reset
  passwordReset: {
    interval: 60 * 60 * 1000, // 1 hour
    maxRequests: 3 // 3 attempts per hour
  },
  // Email verification resend
  emailVerification: {
    interval: 60 * 60 * 1000, // 1 hour
    maxRequests: 5 // 5 attempts per hour
  },
  // API endpoints
  api: {
    interval: 60 * 1000, // 1 minute
    maxRequests: 60 // 60 requests per minute
  },
  // Test submission
  testSubmission: {
    interval: 60 * 60 * 1000, // 1 hour
    maxRequests: 10 // 10 tests per hour
  }
}

/**
 * Check if request is rate limited
 * Returns true if rate limit exceeded
 */
export function isRateLimited(
  identifier: string, // Usually IP address or user ID
  config: RateLimitConfig
): boolean {
  const now = Date.now()
  const key = `${identifier}:${config.interval}`

  const entry = rateLimitStore.get(key)

  if (!entry || now > entry.resetAt) {
    // No entry or expired - create new
    rateLimitStore.set(key, {
      count: 1,
      resetAt: now + config.interval
    })
    return false
  }

  if (entry.count >= config.maxRequests) {
    // Rate limit exceeded
    return true
  }

  // Increment counter
  entry.count++
  rateLimitStore.set(key, entry)
  return false
}

/**
 * Get remaining requests for an identifier
 */
export function getRemainingRequests(
  identifier: string,
  config: RateLimitConfig
): { remaining: number; resetAt: number } {
  const now = Date.now()
  const key = `${identifier}:${config.interval}`

  const entry = rateLimitStore.get(key)

  if (!entry || now > entry.resetAt) {
    return {
      remaining: config.maxRequests,
      resetAt: now + config.interval
    }
  }

  return {
    remaining: Math.max(0, config.maxRequests - entry.count),
    resetAt: entry.resetAt
  }
}

/**
 * Reset rate limit for an identifier
 */
export function resetRateLimit(identifier: string, config: RateLimitConfig): void {
  const key = `${identifier}:${config.interval}`
  rateLimitStore.delete(key)
}

/**
 * Clean up expired entries (should be run periodically)
 */
export function cleanupRateLimitStore(): void {
  const now = Date.now()

  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetAt) {
      rateLimitStore.delete(key)
    }
  }
}

/**
 * Get client IP address from request headers
 */
export function getClientIp(headers: Headers): string {
  return (
    headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    headers.get('x-real-ip') ||
    'unknown'
  )
}
