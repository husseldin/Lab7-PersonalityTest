import { describe, it, expect } from 'vitest'
import {
  isValidEmail,
  isValidPassword,
  getPasswordStrength,
  sanitizeInput,
  isValidUrl,
  emailSchema,
  passwordSchema,
  nameSchema,
  registrationSchema,
  profileUpdateSchema,
  passwordResetSchema
} from '@/lib/validation'

describe('Validation Utilities', () => {
  describe('isValidEmail', () => {
    it('should validate correct email addresses', () => {
      expect(isValidEmail('test@example.com')).toBe(true)
      expect(isValidEmail('user.name@example.co.uk')).toBe(true)
      expect(isValidEmail('user+tag@example.com')).toBe(true)
    })

    it('should reject invalid email addresses', () => {
      expect(isValidEmail('invalid')).toBe(false)
      expect(isValidEmail('invalid@')).toBe(false)
      expect(isValidEmail('@example.com')).toBe(false)
      expect(isValidEmail('test@')).toBe(false)
    })
  })

  describe('isValidPassword', () => {
    it('should validate strong passwords', () => {
      expect(isValidPassword('Password123')).toBe(true)
      expect(isValidPassword('MySecure123')).toBe(true)
    })

    it('should reject weak passwords', () => {
      expect(isValidPassword('weak')).toBe(false) // Too short
      expect(isValidPassword('password')).toBe(false) // No uppercase
      expect(isValidPassword('PASSWORD')).toBe(false) // No lowercase
      expect(isValidPassword('Password')).toBe(false) // No number
    })
  })

  describe('getPasswordStrength', () => {
    it('should return correct strength for weak passwords', () => {
      const result = getPasswordStrength('weak')
      expect(result.score).toBeLessThanOrEqual(2)
      expect(['Very weak', 'Weak']).toContain(result.feedback)
    })

    it('should return correct strength for medium passwords', () => {
      const result = getPasswordStrength('Password1')
      expect(result.score).toBeGreaterThanOrEqual(2)
    })

    it('should return correct strength for strong passwords', () => {
      const result = getPasswordStrength('MyVeryStr0ng!Pass')
      expect(result.score).toBeGreaterThanOrEqual(3)
    })
  })

  describe('sanitizeInput', () => {
    it('should escape HTML special characters', () => {
      expect(sanitizeInput('<script>alert("xss")</script>')).toBe(
        '&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;'
      )
      expect(sanitizeInput('Test & Company')).toBe('Test &amp; Company')
      expect(sanitizeInput("It's a test")).toBe('It&#x27;s a test')
    })

    it('should handle empty strings', () => {
      expect(sanitizeInput('')).toBe('')
    })
  })

  describe('isValidUrl', () => {
    it('should validate correct URLs', () => {
      expect(isValidUrl('https://example.com')).toBe(true)
      expect(isValidUrl('http://localhost:3000')).toBe(true)
      expect(isValidUrl('https://example.com/path?query=1')).toBe(true)
    })

    it('should reject invalid URLs', () => {
      expect(isValidUrl('not-a-url')).toBe(false)
      expect(isValidUrl('ftp://example.com')).toBe(true) // FTP is valid URL
      expect(isValidUrl('')).toBe(false)
    })
  })

  describe('Zod Schemas', () => {
    describe('emailSchema', () => {
      it('should validate valid emails', () => {
        expect(() => emailSchema.parse('test@example.com')).not.toThrow()
      })

      it('should throw on invalid emails', () => {
        expect(() => emailSchema.parse('invalid')).toThrow()
      })
    })

    describe('passwordSchema', () => {
      it('should validate strong passwords', () => {
        expect(() => passwordSchema.parse('Password123')).not.toThrow()
      })

      it('should reject weak passwords', () => {
        expect(() => passwordSchema.parse('weak')).toThrow()
      })
    })

    describe('nameSchema', () => {
      it('should validate valid names', () => {
        expect(() => nameSchema.parse('John Doe')).not.toThrow()
        expect(() => nameSchema.parse("O'Brien")).not.toThrow()
        expect(() => nameSchema.parse('Mary-Jane')).not.toThrow()
      })

      it('should reject invalid names', () => {
        expect(() => nameSchema.parse('A')).toThrow() // Too short
        expect(() => nameSchema.parse('John123')).toThrow() // Contains numbers
      })
    })

    describe('registrationSchema', () => {
      it('should validate complete registration data', () => {
        const validData = {
          email: 'test@example.com',
          password: 'Password123',
          name: 'John Doe',
          confirmPassword: 'Password123'
        }
        expect(() => registrationSchema.parse(validData)).not.toThrow()
      })

      it('should reject mismatched passwords', () => {
        const invalidData = {
          email: 'test@example.com',
          password: 'Password123',
          name: 'John Doe',
          confirmPassword: 'DifferentPassword123'
        }
        expect(() => registrationSchema.parse(invalidData)).toThrow()
      })
    })

    describe('profileUpdateSchema', () => {
      it('should validate profile updates', () => {
        const validData = {
          name: 'Jane Doe',
          bio: 'Software developer',
          image: 'https://example.com/image.jpg'
        }
        expect(() => profileUpdateSchema.parse(validData)).not.toThrow()
      })

      it('should accept partial updates', () => {
        expect(() => profileUpdateSchema.parse({ name: 'Jane Doe' })).not.toThrow()
        expect(() => profileUpdateSchema.parse({ bio: 'Developer' })).not.toThrow()
      })

      it('should reject bio that is too long', () => {
        const longBio = 'x'.repeat(501)
        expect(() => profileUpdateSchema.parse({ bio: longBio })).toThrow()
      })
    })

    describe('passwordResetSchema', () => {
      it('should validate password reset data', () => {
        const validData = {
          password: 'NewPassword123',
          confirmPassword: 'NewPassword123'
        }
        expect(() => passwordResetSchema.parse(validData)).not.toThrow()
      })

      it('should reject mismatched passwords', () => {
        const invalidData = {
          password: 'NewPassword123',
          confirmPassword: 'DifferentPassword123'
        }
        expect(() => passwordResetSchema.parse(invalidData)).toThrow()
      })
    })
  })
})
