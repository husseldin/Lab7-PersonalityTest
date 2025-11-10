import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  isRateLimited,
  getRemainingRequests,
  resetRateLimit,
  cleanupRateLimitStore,
  RATE_LIMITS,
  getClientIp
} from '@/lib/rate-limit'

describe('Rate Limiting', () => {
  beforeEach(() => {
    // Clear rate limit store before each test
    vi.clearAllMocks()
  })

  describe('isRateLimited', () => {
    it('should allow requests within limit', () => {
      const identifier = 'test-user-1'
      const config = { interval: 60000, maxRequests: 3 }

      expect(isRateLimited(identifier, config)).toBe(false)
      expect(isRateLimited(identifier, config)).toBe(false)
      expect(isRateLimited(identifier, config)).toBe(false)
    })

    it('should block requests exceeding limit', () => {
      const identifier = 'test-user-2'
      const config = { interval: 60000, maxRequests: 2 }

      expect(isRateLimited(identifier, config)).toBe(false)
      expect(isRateLimited(identifier, config)).toBe(false)
      expect(isRateLimited(identifier, config)).toBe(true)
      expect(isRateLimited(identifier, config)).toBe(true)
    })

    it('should reset after interval expires', () => {
      const identifier = 'test-user-3'
      const config = { interval: 100, maxRequests: 1 } // 100ms interval

      expect(isRateLimited(identifier, config)).toBe(false)
      expect(isRateLimited(identifier, config)).toBe(true)

      // Wait for interval to expire
      return new Promise((resolve) => {
        setTimeout(() => {
          expect(isRateLimited(identifier, config)).toBe(false)
          resolve(undefined)
        }, 150)
      })
    })

    it('should track different identifiers separately', () => {
      const config = { interval: 60000, maxRequests: 1 }

      expect(isRateLimited('user-1', config)).toBe(false)
      expect(isRateLimited('user-2', config)).toBe(false)
      expect(isRateLimited('user-1', config)).toBe(true)
      expect(isRateLimited('user-2', config)).toBe(true)
    })
  })

  describe('getRemainingRequests', () => {
    it('should return correct remaining requests', () => {
      const identifier = 'test-user-4'
      const config = { interval: 60000, maxRequests: 5 }

      let remaining = getRemainingRequests(identifier, config)
      expect(remaining.remaining).toBe(5)

      isRateLimited(identifier, config)
      remaining = getRemainingRequests(identifier, config)
      expect(remaining.remaining).toBe(4)

      isRateLimited(identifier, config)
      remaining = getRemainingRequests(identifier, config)
      expect(remaining.remaining).toBe(3)
    })

    it('should return 0 when rate limited', () => {
      const identifier = 'test-user-5'
      const config = { interval: 60000, maxRequests: 1 }

      isRateLimited(identifier, config)
      isRateLimited(identifier, config)

      const remaining = getRemainingRequests(identifier, config)
      expect(remaining.remaining).toBe(0)
    })
  })

  describe('resetRateLimit', () => {
    it('should reset rate limit for identifier', () => {
      const identifier = 'test-user-6'
      const config = { interval: 60000, maxRequests: 1 }

      isRateLimited(identifier, config)
      expect(isRateLimited(identifier, config)).toBe(true)

      resetRateLimit(identifier, config)
      expect(isRateLimited(identifier, config)).toBe(false)
    })
  })

  describe('RATE_LIMITS configuration', () => {
    it('should have auth rate limit', () => {
      expect(RATE_LIMITS.auth).toBeDefined()
      expect(RATE_LIMITS.auth.maxRequests).toBeGreaterThan(0)
      expect(RATE_LIMITS.auth.interval).toBeGreaterThan(0)
    })

    it('should have password reset rate limit', () => {
      expect(RATE_LIMITS.passwordReset).toBeDefined()
      expect(RATE_LIMITS.passwordReset.maxRequests).toBeGreaterThan(0)
      expect(RATE_LIMITS.passwordReset.interval).toBeGreaterThan(0)
    })

    it('should have email verification rate limit', () => {
      expect(RATE_LIMITS.emailVerification).toBeDefined()
      expect(RATE_LIMITS.emailVerification.maxRequests).toBeGreaterThan(0)
    })

    it('should have API rate limit', () => {
      expect(RATE_LIMITS.api).toBeDefined()
      expect(RATE_LIMITS.api.maxRequests).toBeGreaterThan(0)
    })
  })

  describe('getClientIp', () => {
    it('should extract IP from x-forwarded-for header', () => {
      const headers = new Headers({
        'x-forwarded-for': '192.168.1.1, 10.0.0.1'
      })
      expect(getClientIp(headers)).toBe('192.168.1.1')
    })

    it('should extract IP from x-real-ip header', () => {
      const headers = new Headers({
        'x-real-ip': '192.168.1.2'
      })
      expect(getClientIp(headers)).toBe('192.168.1.2')
    })

    it('should return "unknown" when no IP headers present', () => {
      const headers = new Headers()
      expect(getClientIp(headers)).toBe('unknown')
    })

    it('should prefer x-forwarded-for over x-real-ip', () => {
      const headers = new Headers({
        'x-forwarded-for': '192.168.1.1',
        'x-real-ip': '192.168.1.2'
      })
      expect(getClientIp(headers)).toBe('192.168.1.1')
    })
  })
})
