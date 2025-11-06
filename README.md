# Personality Test Platform

A production-ready MBTI-inspired personality assessment platform with freemium/premium monetization, built with .NET 8, Angular 17, PostgreSQL, and Stripe.

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
- **Clean Architecture**: Domain → Application → Infrastructure → API layers
- **Security First**: Argon2id password hashing, JWT auth, rate limiting, OWASP ASVS compliance
- **Scalable**: Stateless API, S3 storage, horizontal scaling ready
- **Modern Stack**: .NET 8, Angular 17 standalone components, PostgreSQL 16
- **Fully Dockerized**: Complete Docker Compose setup for development
- **Production Ready**: Logging, monitoring, error handling, migrations

## 📋 Prerequisites

- [Docker](https://www.docker.com/get-started) & Docker Compose
- [.NET 8 SDK](https://dotnet.microsoft.com/download) (for local development)
- [Node.js 20+](https://nodejs.org/) (for local frontend development)
- [PostgreSQL 16](https://www.postgresql.org/download/) (optional, included in Docker)

## 🏗️ Architecture

```
┌─────────────────┐
│  Angular 17 SPA │  (Standalone Components + Material + Tailwind)
└────────┬────────┘
         │ HTTPS/JSON
┌────────▼────────┐
│  .NET 8 Web API │  (Clean Architecture + JWT Auth)
└────────┬────────┘
         │
┌────────▼─────────────────┬────────────────┬───────────────┐
│   PostgreSQL 16          │  MinIO (S3)    │  Stripe       │
└──────────────────────────┴────────────────┴───────────────┘
```

## 🚀 Quick Start (Docker Compose)

### 1. Clone and Configure

```bash
git clone <repository-url>
cd Lab7-PersonalityTest

# Copy environment template
cp .env.sample .env

# Edit .env with your settings (Stripe keys, SMTP, etc.)
nano .env
```

### 2. Start All Services

```bash
# Start all services (API, Frontend, DB, MinIO)
docker-compose up -d

# Check logs
docker-compose logs -f

# Services will be available at:
# - Frontend: http://localhost:4200
# - API: http://localhost:5000
# - API Docs (Swagger): http://localhost:5000/swagger
# - MinIO Console: http://localhost:9001
# - MailHog (dev email): http://localhost:8025
```

### 3. Run Database Migrations

```bash
# Enter API container
docker-compose exec api bash

# Run migrations
dotnet ef database update --project /app/PersonalityTest.Infrastructure.dll

# Seed test data (optional)
dotnet run --seed
```

### 4. Access the Application

- **Frontend**: http://localhost:4200
- **API Documentation**: http://localhost:5000/swagger
- **Email Testing** (MailHog): http://localhost:8025

## 🛠️ Local Development Setup

### Backend (.NET 8 API)

```bash
cd backend

# Restore dependencies
dotnet restore

# Update connection string in appsettings.json
# Set environment variables (see .env.sample)

# Run migrations
cd src/PersonalityTest.API
dotnet ef database update --project ../PersonalityTest.Infrastructure/PersonalityTest.Infrastructure.csproj

# Start API
dotnet run

# API runs on: https://localhost:5000
# Swagger UI: https://localhost:5000/swagger
```

### Frontend (Angular 17)

```bash
cd frontend

# Install dependencies
npm install

# Update API URL in src/environments/environment.ts

# Start dev server
npm start

# Frontend runs on: http://localhost:4200
```

## 📦 Project Structure

```
Lab7-PersonalityTest/
├── backend/
│   ├── src/
│   │   ├── PersonalityTest.Domain/        # Entities, ValueObjects, Enums
│   │   ├── PersonalityTest.Application/   # DTOs, Interfaces, Services
│   │   ├── PersonalityTest.Infrastructure/ # EF Core, Repositories, External Services
│   │   └── PersonalityTest.API/           # Controllers, Middleware, Startup
│   ├── data/
│   │   └── questions-v1.json             # 60-question test bank
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   └── app/
│   │       ├── core/                     # Guards, Interceptors, Services
│   │       ├── features/                 # Feature modules (Auth, Test, Results)
│   │       └── shared/                   # Shared components
│   └── Dockerfile
├── docker-compose.yml                     # Complete dev environment
├── .env.sample                           # Environment variables template
└── README.md
```

## 🔑 Environment Variables

Critical environment variables (see `.env.sample` for full list):

```env
# Database
POSTGRES_DB=personalitytest
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_secure_password

# JWT
JWT_SECRET_KEY=your-super-secret-jwt-key-minimum-32-characters

# Stripe
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Email (SMTP)
EMAIL_SMTP_HOST=smtp.gmail.com
EMAIL_SMTP_PORT=587
EMAIL_SMTP_USER=your-email@gmail.com
EMAIL_SMTP_PASSWORD=your-app-password

# S3 Storage
S3_SERVICE_URL=http://localhost:9000
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minioadmin
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

## 📄 API Documentation

### Swagger/OpenAPI

Access interactive API documentation:
- **Development**: http://localhost:5000/swagger
- **Production**: https://api.your-domain.com/swagger

### Key Endpoints

```
Authentication:
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/refresh
POST   /api/auth/verify-email
POST   /api/auth/forgot-password
POST   /api/auth/reset-password

Test:
POST   /api/test/start
PATCH  /api/test/attempts/{id}/answers
POST   /api/test/attempts/{id}/submit
GET    /api/test/attempts/{id}/result
GET    /api/test/history

Payments:
POST   /api/payments/checkout
POST   /api/payments/webhook

Sharing:
POST   /api/share
GET    /api/share/{shareCode}
```

## 🔐 Security Features

- **Password Hashing**: Argon2id (OWASP recommendation)
- **JWT Authentication**: Access + refresh token pattern
- **Rate Limiting**: IP-based request throttling
- **Input Validation**: FluentValidation + Angular forms
- **CSRF Protection**: SameSite cookies
- **SQL Injection Prevention**: EF Core parameterized queries
- **XSS Protection**: Angular sanitization + CSP headers
- **Audit Logging**: All sensitive operations logged

## 📄 Legal Disclaimer

**Important**: This application provides an MBTI-inspired personality assessment and is **not affiliated with, endorsed by, or connected to The Myers-Briggs Company**, the publisher of the official MBTI® assessment. The terms "MBTI" and "Myers-Briggs Type Indicator" are trademarks or registered trademarks of The Myers & Briggs Foundation.

This tool uses a 16-type personality framework for **educational and entertainment purposes only** and should not be considered a substitute for professional psychological assessment.

## 📜 License

This project is licensed under the MIT License.

---

**Built with ❤️ using .NET 8, Angular 17, PostgreSQL, and Stripe**