# Personality Test Platform

A production-ready MBTI-inspired personality assessment platform with freemium/premium monetization, built with Next.js 14, TypeScript, Prisma, and Stripe.

## 🚀 Features

### Core Functionality
- **60-Question MBTI-Inspired Test**: Scientifically balanced across E/I, S/N, T/F, J/P dimensions
- **Dual-Tier Reports**: Free basic report + premium complete report with career insights
- **User Management**: Full authentication with email verification, password reset
- **Payment Processing**: Stripe integration for one-time premium report purchases
- **PDF Export**: Server-side PDF generation with Playwright
- **Social Sharing**: Share results with customizable privacy settings
- **Friend Comparison**: Invite friends and compare personality results
- **Test History**: Track all past attempts with detailed scores

### Technical Highlights
- **Modern Full-Stack**: Next.js 14 App Router with Server Components and API Routes
- **Security First**: bcryptjs password hashing, NextAuth JWT authentication
- **Type-Safe**: Full TypeScript implementation with Zod validation
- **Modern Stack**: Next.js 14, React 18, Prisma ORM, SQLite/PostgreSQL
- **Payment Integration**: Stripe Checkout with webhook handling
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

# Prisma commands
npx prisma generate      # Generate Prisma Client
npx prisma migrate dev   # Run migrations in development
npx prisma studio        # Open Prisma Studio GUI
```

## 📦 Project Structure

```
Lab7-PersonalityTest/
├── app/
│   ├── api/                              # API Routes (Backend)
│   │   ├── auth/                         # Authentication endpoints
│   │   ├── test/                         # Test submission & results
│   │   └── payments/                     # Stripe integration
│   ├── auth/                             # Auth pages (signin, signup)
│   ├── test/                             # Test taking page
│   ├── about/                            # About page
│   ├── layout.tsx                        # Root layout
│   └── page.tsx                          # Home page
├── lib/                                  # Utility functions
│   └── pdf-generator.ts                  # PDF generation logic
├── prisma/
│   ├── schema.prisma                     # Database schema
│   └── dev.db                            # SQLite database (dev)
├── public/
│   └── data/
│       └── questions.json                # 60-question test bank
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

### Key Endpoints

```
Authentication:
POST   /api/auth/register           # Create new user account
POST   /api/auth/[...nextauth]      # NextAuth endpoints (signin, callback, etc.)

Test:
POST   /api/test/submit             # Submit test answers
GET    /api/test/history            # Get user's test history
GET    /api/test/result/[id]        # Get specific test result
GET    /api/test/result/[id]/pdf    # Download PDF report (premium only)

Payments:
POST   /api/payments/checkout       # Create Stripe checkout session
POST   /api/payments/webhook        # Stripe webhook handler
```

## 🔐 Security Features

- **Password Hashing**: bcryptjs with salt rounds
- **JWT Authentication**: NextAuth with secure session handling
- **Input Validation**: Zod schema validation on all API routes
- **SQL Injection Prevention**: Prisma ORM with parameterized queries
- **XSS Protection**: React automatic escaping + Next.js built-in protections
- **CSRF Protection**: NextAuth built-in CSRF tokens
- **Type Safety**: Full TypeScript implementation

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