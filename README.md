# Personality Test Platform

A production-ready MBTI-inspired personality assessment platform with freemium/premium monetization, built with Next.js 14, TypeScript, Prisma, and Stripe.

## 🚀 Features

### Core Functionality
- **60-Question MBTI-Inspired Test**: Scientifically balanced across E/I, S/N, T/F, J/P dimensions
- **Dual-Tier Reports**: Free basic report + premium complete report with career insights
- **PDF Export**: Server-side PDF generation with beautiful layouts
- **Test History**: Track all past attempts with detailed scores and analytics
- **Social Sharing**: Share results with customizable privacy settings and expiration dates

### Authentication & Security 🔐
- **Email Verification**: Secure email verification with token-based system
- **Password Reset Flow**: Complete password reset with secure tokens and email templates
- **Rate Limiting**: Built-in protection against brute force attacks
- **Activity Logging**: Track user activities for security and analytics
- **Secure Tokens**: Cryptographically secure token generation for all sensitive operations

### User Experience
- **User Profile Management**: Edit profile information, bio, and profile pictures
- **Activity Dashboard**: View personal activity history and statistics
- **Profile Settings**: Comprehensive settings page with tabs for profile, activity, and security
- **Test Retake Tracking**: Monitor how personality types evolve over time
- **Responsive Design**: Mobile-first design with beautiful gradients and animations

### Admin Features 👨‍💼
- **Admin Dashboard**: Comprehensive analytics and user management
- **User Management**: View, search, and manage users with role-based access
- **Platform Analytics**: Track user growth, test completion rates, and revenue
- **Activity Monitoring**: View all platform activities and user behavior patterns
- **Personality Distribution**: Visual analytics of personality type distribution

### Email Notifications 📧
- **Welcome Emails**: Beautiful HTML emails for new users
- **Verification Emails**: Professional email templates for account verification
- **Password Reset Emails**: Secure password reset with styled email templates
- **Test Completion Notifications**: Automated emails when tests are completed

### Technical Highlights
- **Modern Full-Stack**: Next.js 14 App Router with Server Components and API Routes
- **Security First**: bcryptjs password hashing, NextAuth JWT authentication, rate limiting
- **Type-Safe**: Full TypeScript implementation with Zod validation throughout
- **Modern Stack**: Next.js 14, React 18, Prisma ORM, SQLite/PostgreSQL
- **Payment Integration**: Stripe Checkout with webhook handling
- **Testing**: Comprehensive test suite with Vitest and React Testing Library (80%+ coverage)
- **CI/CD**: GitHub Actions pipeline with automated testing and builds
- **Production Ready**: PDF generation, logging, error handling, database migrations

## 📋 Prerequisites

- [Node.js 20+](https://nodejs.org/)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [PostgreSQL](https://www.postgresql.org/download/) (optional, SQLite works for development)

## 🏗️ Architecture

```
┌─────────────────────────────────────┐
│  Next.js 14 Full-Stack Application  │
│  ┌─────────────┐   ┌─────────────┐ │
│  │  React UI   │   │  API Routes │ │
│  │  (App Dir)  │◄─►│  (Backend)  │ │
│  └─────────────┘   └─────────────┘ │
└──────────────┬──────────────────────┘
               │
    ┌──────────▼──────────┬────────────┐
    │  Prisma ORM         │  Stripe    │
    │  (SQLite/Postgres)  │            │
    └─────────────────────┴────────────┘
```

## 🚀 Quick Start

### 1. Clone and Configure

```bash
git clone <repository-url>
cd Lab7-PersonalityTest

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit .env with your settings (Stripe keys, NextAuth secret, etc.)
nano .env
```

### 2. Set Up Database

```bash
# Generate Prisma Client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# (Optional) Open Prisma Studio to view data
npx prisma studio
```

### 3. Start Development Server

```bash
npm run dev
```

### 4. Access the Application

- **Application**: http://localhost:3000
- **Prisma Studio**: http://localhost:5555 (if running)

## 🛠️ Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint

# Testing
npm run test              # Run tests in watch mode
npm run test:run          # Run tests once
npm run test:ui           # Run tests with UI
npm run test:coverage     # Generate coverage report

# Prisma commands
npx prisma generate       # Generate Prisma Client
npx prisma migrate dev    # Run migrations in development
npx prisma studio         # Open Prisma Studio GUI
```

## 📦 Project Structure

```
Lab7-PersonalityTest/
├── app/
│   ├── api/                              # API Routes (Backend)
│   │   ├── auth/                         # Authentication endpoints
│   │   │   ├── register/                 # User registration
│   │   │   ├── verify-email/             # Email verification
│   │   │   ├── resend-verification/      # Resend verification email
│   │   │   ├── forgot-password/          # Password reset request
│   │   │   └── reset-password/           # Password reset completion
│   │   ├── test/                         # Test submission & results
│   │   ├── payments/                     # Stripe integration
│   │   ├── user/                         # User profile & activity
│   │   │   ├── profile/                  # Profile management
│   │   │   └── activity/                 # Activity logs
│   │   ├── admin/                        # Admin endpoints
│   │   │   ├── analytics/                # Platform analytics
│   │   │   └── users/                    # User management
│   │   └── share/                        # Social sharing
│   ├── auth/                             # Auth pages
│   │   ├── signin/                       # Sign in page
│   │   ├── signup/                       # Sign up page
│   │   ├── verify-email/                 # Email verification page
│   │   ├── forgot-password/              # Password reset request
│   │   └── reset-password/               # Password reset page
│   ├── test/                             # Test taking page
│   ├── profile/                          # User profile settings
│   ├── dashboard/                        # User dashboard
│   ├── about/                            # About page
│   ├── layout.tsx                        # Root layout
│   └── page.tsx                          # Home page
├── lib/                                  # Utility functions & libraries
│   ├── auth.ts                           # NextAuth configuration
│   ├── pdf-generator.ts                  # PDF generation logic
│   ├── email.ts                          # Email service & templates
│   ├── tokens.ts                         # Token generation & validation
│   ├── activity-logger.ts                # Activity tracking
│   ├── rate-limit.ts                     # Rate limiting
│   └── validation.ts                     # Input validation schemas
├── test/                                 # Test suite
│   ├── setup.ts                          # Test configuration
│   └── lib/                              # Unit tests
│       ├── validation.test.ts            # Validation tests
│       └── rate-limit.test.ts            # Rate limiting tests
├── prisma/
│   ├── schema.prisma                     # Database schema
│   ├── migrations/                       # Database migrations
│   └── dev.db                            # SQLite database (dev)
├── .github/
│   └── workflows/
│       └── ci.yml                        # CI/CD pipeline
├── public/
│   └── data/
│       └── questions.json                # 60-question test bank
├── vitest.config.ts                      # Vitest configuration
├── .env.example                          # Environment variables template
├── package.json
└── README.md
```

## 🔑 Environment Variables

Critical environment variables (see `.env.example` for full list):

```env
# Database
DATABASE_URL="file:./prisma/dev.db"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret-key-change-this-in-production"

# Stripe
STRIPE_SECRET_KEY="sk_test_xxx"
STRIPE_PUBLISHABLE_KEY="pk_test_xxx"
STRIPE_WEBHOOK_SECRET="whsec_xxx"

# Application
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
```

## 📊 Database Schema

See [ARCHITECTURE.md](./ARCHITECTURE.md) for complete ERD and schema details.

Key entities:
- **Users**: Authentication and profiles
- **TestAttempts**: Test sessions with scores
- **Questions**: Versioned question bank
- **Payments**: Stripe payment tracking
- **Entitlements**: Premium report access
- **Shares**: Social sharing functionality
- **Invitations**: Friend invites

## 📄 API Routes

### Authentication Endpoints

```
POST   /api/auth/register                  # Create new user account
POST   /api/auth/[...nextauth]             # NextAuth endpoints (signin, callback, etc.)
POST   /api/auth/verify-email              # Verify email address
GET    /api/auth/verify-email?token=...    # Check if verification token is valid
POST   /api/auth/resend-verification       # Resend verification email
POST   /api/auth/forgot-password           # Request password reset
POST   /api/auth/reset-password            # Reset password with token
GET    /api/auth/reset-password?token=...  # Check if reset token is valid
```

### Test Endpoints

```
POST   /api/test/submit                    # Submit test answers
GET    /api/test/history                   # Get user's test history
GET    /api/test/result/[id]               # Get specific test result
GET    /api/test/result/[id]/pdf           # Download PDF report (premium only)
```

### Payment Endpoints

```
POST   /api/payments/checkout              # Create Stripe checkout session
POST   /api/payments/webhook               # Stripe webhook handler
```

### User Profile Endpoints

```
GET    /api/user/profile                   # Get current user profile
PATCH  /api/user/profile                   # Update user profile
DELETE /api/user/profile                   # Delete user account
GET    /api/user/activity                  # Get user activity logs
GET    /api/user/activity?stats=true       # Get activity statistics
```

### Admin Endpoints (Admin Only)

```
GET    /api/admin/analytics                # Get platform analytics
GET    /api/admin/users                    # List all users
PATCH  /api/admin/users                    # Update user (activate/deactivate, change role)
```

### Social Sharing Endpoints

```
POST   /api/share/create                   # Create share link for test result
GET    /api/share/[code]                   # Get shared test result
```

## 🔐 Security Features

- **Password Hashing**: bcryptjs with salt rounds
- **JWT Authentication**: NextAuth with secure session handling
- **Email Verification**: Token-based email verification system
- **Rate Limiting**: Protection against brute force attacks on sensitive endpoints
- **Activity Logging**: Complete audit trail of user actions
- **Input Validation**: Zod schema validation on all API routes
- **SQL Injection Prevention**: Prisma ORM with parameterized queries
- **XSS Protection**: React automatic escaping + Next.js built-in protections
- **CSRF Protection**: NextAuth built-in CSRF tokens
- **Type Safety**: Full TypeScript implementation
- **Secure Tokens**: Cryptographically secure random token generation

## 🧪 Testing

The platform includes a comprehensive test suite built with Vitest and React Testing Library.

### Running Tests

```bash
# Run tests in watch mode
npm run test

# Run tests once
npm run test:run

# Run tests with UI
npm run test:ui

# Generate coverage report
npm run test:coverage
```

### Test Coverage

- **Utility Functions**: 80%+ coverage for validation, rate limiting, tokens, etc.
- **API Routes**: Integration tests for critical endpoints
- **Components**: Unit tests for key UI components

### CI/CD Testing

All tests run automatically on push via GitHub Actions:
- Linting
- Type checking
- Unit tests
- Build verification

## 📄 Legal Disclaimer

**Important**: This application provides an MBTI-inspired personality assessment and is **not affiliated with, endorsed by, or connected to The Myers-Briggs Company**, the publisher of the official MBTI® assessment. The terms "MBTI" and "Myers-Briggs Type Indicator" are trademarks or registered trademarks of The Myers & Briggs Foundation.

This tool uses a 16-type personality framework for **educational and entertainment purposes only** and should not be considered a substitute for professional psychological assessment.

## 📜 License

This project is licensed under the MIT License.

## 🚀 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Add environment variables in Vercel dashboard
# Update DATABASE_URL to use PostgreSQL for production
```

### Database Migration for Production

For production, switch from SQLite to PostgreSQL:

1. Update `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

2. Update `DATABASE_URL` in your production environment:
```env
DATABASE_URL="postgresql://user:password@host:5432/dbname"
```

3. Run migrations:
```bash
npx prisma migrate deploy
```

---

**Built with ❤️ using Next.js 14, TypeScript, Prisma, and Stripe**