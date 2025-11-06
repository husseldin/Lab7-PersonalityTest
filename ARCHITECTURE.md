# PersonalityTest Platform - Architecture Overview

## Executive Summary

A production-ready MBTI-inspired personality assessment platform featuring:
- Freemium/Premium monetization with Stripe payments
- 60-80 item Likert-scale test with scientific scoring
- PDF report generation with tiered content
- Social sharing and friend comparison features
- Multi-tenant admin console for content management

**Stack**: .NET 8 Web API + Angular 17 + PostgreSQL 16 + S3-compatible storage + Stripe

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client Layer                             │
│  Angular 17 SPA (Standalone Components + Material + Tailwind)   │
└────────────────────────┬────────────────────────────────────────┘
                         │ HTTPS/JSON
┌────────────────────────▼────────────────────────────────────────┐
│                      API Gateway Layer                           │
│    ASP.NET Core 8 Web API (JWT Auth + Rate Limiting)           │
│                  Controllers + Middleware                        │
└────────────┬─────────────────┬──────────────────────────────────┘
             │                 │
┌────────────▼─────────────┐   │   ┌──────────────────────────────┐
│   Application Layer      │   │   │   External Services          │
│  - Use Cases             │◄──┼───┤  - Stripe (Payments)         │
│  - DTOs & Mappers        │   │   │  - SMTP (Email)              │
│  - Validation            │   │   │  - S3/MinIO (Files)          │
└────────────┬─────────────┘   │   │  - Playwright (PDF)          │
             │                 │   └──────────────────────────────┘
┌────────────▼─────────────┐   │
│   Domain Layer           │   │
│  - Entities              │   │
│  - Value Objects         │   │
│  - Business Logic        │   │
└────────────┬─────────────┘   │
             │                 │
┌────────────▼─────────────────▼───────────────────────────────────┐
│                  Infrastructure Layer                            │
│  - EF Core DbContext & Repositories                             │
│  - External API Clients (Stripe, S3, SMTP)                      │
│  - Background Jobs (PDF Generation Queue)                       │
└────────────┬────────────────────────────────────────────────────┘
             │
┌────────────▼────────────────────────────────────────────────────┐
│                    Data Storage                                  │
│  PostgreSQL 16 │ S3/MinIO (Files) │ Redis (Cache/Sessions)     │
└─────────────────────────────────────────────────────────────────┘
```

## Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              Users                                       │
├─────────────────────────────────────────────────────────────────────────┤
│ Id (UUID, PK)                                                           │
│ Email (string, unique, indexed)                                         │
│ PasswordHash (string)                                                   │
│ FullName (string)                                                       │
│ Bio (string, nullable)                                                  │
│ ProfilePictureFileId (UUID, FK → Files, nullable)                      │
│ EmailVerified (bool)                                                    │
│ EmailVerificationToken (string, nullable, indexed)                      │
│ PasswordResetToken (string, nullable, indexed)                          │
│ PasswordResetExpiry (datetime, nullable)                                │
│ Role (enum: User, Admin)                                                │
│ IsDeleted (bool, soft delete)                                           │
│ CreatedAt, UpdatedAt (datetime)                                         │
└─────────────────┬───────────────────────────────────────────────────────┘
                  │
                  │ 1:N
┌─────────────────▼───────────────────────────────────────────────────────┐
│                         RefreshTokens                                    │
├─────────────────────────────────────────────────────────────────────────┤
│ Id (UUID, PK)                                                           │
│ UserId (UUID, FK → Users, indexed)                                      │
│ Token (string, unique, indexed)                                         │
│ ExpiresAt (datetime)                                                    │
│ CreatedAt (datetime)                                                    │
│ RevokedAt (datetime, nullable)                                          │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                              Files                                       │
├─────────────────────────────────────────────────────────────────────────┤
│ Id (UUID, PK)                                                           │
│ UserId (UUID, FK → Users, indexed)                                      │
│ FileName (string)                                                       │
│ ContentType (string)                                                    │
│ SizeBytes (long)                                                        │
│ StorageKey (string, unique)  // S3 object key                          │
│ FileType (enum: Avatar, GeneratedPdf)                                   │
│ CreatedAt (datetime)                                                    │
└─────────────────┬───────────────────────────────────────────────────────┘
                  │
                  │ 1:N (User can have many files)
                  └──────────────────────────────────────────────────────┐
                                                                          │
┌─────────────────────────────────────────────────────────────────────────▼┐
│                          QuestionVersions                                │
├──────────────────────────────────────────────────────────────────────────┤
│ Id (UUID, PK)                                                            │
│ VersionName (string, unique, e.g., "v1")                                 │
│ IsActive (bool)                                                          │
│ CreatedAt (datetime)                                                     │
└─────────────────┬────────────────────────────────────────────────────────┘
                  │
                  │ 1:N
┌─────────────────▼────────────────────────────────────────────────────────┐
│                            Questions                                      │
├───────────────────────────────────────────────────────────────────────────┤
│ Id (UUID, PK)                                                            │
│ VersionId (UUID, FK → QuestionVersions, indexed)                        │
│ OrderIndex (int)                                                         │
│ Text (string)                                                            │
│ Dimension (enum: EI, SN, TF, JP)                                         │
│ Direction (enum: Positive, Negative)  // scoring direction              │
│ Weight (decimal, default 1.0)                                            │
│ CreatedAt, UpdatedAt (datetime)                                          │
└─────────────────┬────────────────────────────────────────────────────────┘
                  │
                  │ Referenced by TestAnswers
                  │
┌─────────────────▼────────────────────────────────────────────────────────┐
│                          TestAttempts                                     │
├───────────────────────────────────────────────────────────────────────────┤
│ Id (UUID, PK)                                                            │
│ UserId (UUID, FK → Users, indexed)                                       │
│ QuestionVersionId (UUID, FK → QuestionVersions)                         │
│ Status (enum: InProgress, Completed)                                     │
│ StartedAt (datetime)                                                     │
│ CompletedAt (datetime, nullable)                                         │
│ ResultType (string, nullable, e.g., "INTJ")                              │
│ ScoreE, ScoreI, ScoreS, ScoreN, ScoreT, ScoreF, ScoreJ, ScoreP (int)    │
│ CreatedAt, UpdatedAt (datetime)                                          │
│ Index: (UserId, CompletedAt DESC)                                        │
└─────────────────┬────────────────────────────────────────────────────────┘
                  │
                  │ 1:N
┌─────────────────▼────────────────────────────────────────────────────────┐
│                           TestAnswers                                     │
├───────────────────────────────────────────────────────────────────────────┤
│ Id (UUID, PK)                                                            │
│ AttemptId (UUID, FK → TestAttempts, indexed)                            │
│ QuestionId (UUID, FK → Questions)                                        │
│ Answer (int, 1-5 Likert scale)                                           │
│ CreatedAt (datetime)                                                     │
│ Unique constraint: (AttemptId, QuestionId)                               │
└──────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────┐
│                           Entitlements                                    │
├───────────────────────────────────────────────────────────────────────────┤
│ Id (UUID, PK)                                                            │
│ UserId (UUID, FK → Users, indexed)                                       │
│ AttemptId (UUID, FK → TestAttempts, unique)                             │
│ EntitlementType (enum: CompleteReport)                                   │
│ GrantedAt (datetime)                                                     │
│ PaymentId (UUID, FK → Payments, nullable)                               │
└──────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────┐
│                            Payments                                       │
├───────────────────────────────────────────────────────────────────────────┤
│ Id (UUID, PK)                                                            │
│ UserId (UUID, FK → Users, indexed)                                       │
│ AttemptId (UUID, FK → TestAttempts)                                      │
│ StripePaymentIntentId (string, unique, indexed)                          │
│ Amount (decimal)                                                         │
│ Currency (string, default "USD")                                         │
│ Status (enum: Pending, Succeeded, Failed, Refunded)                      │
│ CreatedAt, UpdatedAt (datetime)                                          │
└──────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────┐
│                             Shares                                        │
├───────────────────────────────────────────────────────────────────────────┤
│ Id (UUID, PK)                                                            │
│ UserId (UUID, FK → Users, indexed)                                       │
│ AttemptId (UUID, FK → TestAttempts, unique)                             │
│ ShareCode (string, unique, indexed, e.g., "a3b9c2d1")                    │
│ Privacy (enum: Public, Unlisted, Private)                                │
│ ViewCount (int, default 0)                                               │
│ CreatedAt, UpdatedAt (datetime)                                          │
└──────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────┐
│                           Invitations                                     │
├───────────────────────────────────────────────────────────────────────────┤
│ Id (UUID, PK)                                                            │
│ InviterId (UUID, FK → Users, indexed)                                    │
│ InviteeEmail (string, indexed)                                           │
│ InviteeUserId (UUID, FK → Users, nullable, indexed)                      │
│ InviteCode (string, unique, indexed)                                     │
│ Status (enum: Pending, Accepted, Expired)                                │
│ CreatedAt (datetime)                                                     │
│ AcceptedAt (datetime, nullable)                                          │
│ ExpiresAt (datetime)                                                     │
└──────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────┐
│                           FriendLinks                                     │
├───────────────────────────────────────────────────────────────────────────┤
│ Id (UUID, PK)                                                            │
│ UserId (UUID, FK → Users, indexed)                                       │
│ FriendUserId (UUID, FK → Users, indexed)                                │
│ ConsentGiven (bool)  // Friend consented to share results                │
│ CreatedAt (datetime)                                                     │
│ Unique constraint: (UserId, FriendUserId)                                │
└──────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────┐
│                           AuditLogs                                       │
├───────────────────────────────────────────────────────────────────────────┤
│ Id (UUID, PK)                                                            │
│ UserId (UUID, FK → Users, nullable, indexed)                            │
│ Action (string, e.g., "TestCompleted", "PaymentProcessed")               │
│ EntityType (string)                                                      │
│ EntityId (UUID, nullable)                                                │
│ IpAddress (string, nullable)                                             │
│ UserAgent (string, nullable)                                             │
│ Details (jsonb, nullable)                                                │
│ CreatedAt (datetime, indexed)                                            │
└──────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────┐
│                          PricingConfigs                                   │
├───────────────────────────────────────────────────────────────────────────┤
│ Id (UUID, PK)                                                            │
│ ProductType (enum: CompleteReport)                                       │
│ PriceInCents (int)                                                       │
│ Currency (string)                                                        │
│ StripePriceId (string, nullable)                                         │
│ IsActive (bool)                                                          │
│ CreatedAt, UpdatedAt (datetime)                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

## Clean Architecture Layers

### 1. Domain Layer (`PersonalityTest.Domain`)
- **Entities**: User, TestAttempt, Question, Payment, etc.
- **Value Objects**: Email, PersonalityType, Score
- **Enums**: Dimension (EI/SN/TF/JP), UserRole, PaymentStatus
- **Business Logic**: Scoring algorithms, validation rules
- **No dependencies** on other layers

### 2. Application Layer (`PersonalityTest.Application`)
- **Interfaces**: IUserRepository, IScoringService, IPdfService
- **DTOs**: Request/Response models for API
- **Use Cases**: RegisterUser, StartTest, ProcessPayment
- **Validators**: FluentValidation rules
- **Depends on**: Domain only

### 3. Infrastructure Layer (`PersonalityTest.Infrastructure`)
- **EF Core**: DbContext, Configurations, Migrations
- **Repositories**: Concrete implementations
- **External Services**: StripePaymentService, S3FileService, SmtpEmailService
- **Background Jobs**: PDF generation queue
- **Depends on**: Application, Domain

### 4. API Layer (`PersonalityTest.API`)
- **Controllers**: AuthController, TestController, etc.
- **Middleware**: JWT authentication, error handling, rate limiting
- **Filters**: Authorization, CORS
- **Startup/Configuration**: DI, Swagger, logging
- **Depends on**: All layers

## Security & Compliance

### Authentication Flow
1. User registers → email verification required
2. Login → JWT access token (15 min) + refresh token (7 days)
3. Password hashing: **Argon2id** (OWASP recommendation)
4. Tokens stored in HTTP-only cookies (XSS protection)

### Authorization
- Role-based: User, Admin
- Resource-based: Users can only access their own data
- Route guards in Angular + API middleware

### Data Privacy (GDPR-like)
- User data export endpoint
- Right to deletion (soft delete with cascade)
- Audit logs for sensitive operations
- PII excluded from shared results

### OWASP ASVS Compliance
- Input validation (FluentValidation + Angular forms)
- CSRF protection (SameSite cookies)
- Rate limiting (ASP.NET middleware)
- SQL injection prevention (EF Core parameterized queries)
- XSS prevention (Angular sanitization + CSP headers)

## Performance Optimizations

### Database
- Indexes on: UserId, Email, CompletedAt, ShareCode
- Pagination for all list endpoints (default 20 items)
- N+1 prevention with `.Include()` and `.Select()`
- Connection pooling (default EF Core behavior)

### Caching Strategy
- Redis for session storage (optional enhancement)
- Static question versions cached in memory
- S3 signed URLs cached (15 min TTL)

### PDF Generation
- Async background job (Hangfire/BackgroundService)
- Pre-rendered HTML templates
- Cached in S3 after first generation
- Webhook notification when ready

## Scalability Considerations

### Horizontal Scaling
- Stateless API (JWT tokens, no sessions)
- Load balancer (Nginx/AWS ALB)
- Database read replicas for reporting queries

### File Storage
- S3-compatible: MinIO (dev) → AWS S3 (prod)
- CDN for static assets (CloudFront)
- Pre-signed URLs for secure access

### Background Jobs
- Hangfire for PDF generation and email sending
- Retry policies for transient failures
- Dead-letter queue for failed jobs

## Monitoring & Observability

### Logging
- Structured logs (Serilog → JSON)
- Correlation IDs for request tracing
- Log levels: Debug (dev), Info (prod), Error (always)

### Metrics
- API latency (p50, p95, p99)
- Test completion rate
- Payment conversion rate
- PDF generation time

### Health Checks
- `/health` endpoint: DB, S3, Stripe connectivity
- Kubernetes readiness/liveness probes

## Deployment Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                    Load Balancer (Nginx)                     │
│                    SSL Termination                           │
└────┬──────────────────────────────────┬────────────────────┘
     │                                  │
┌────▼────────────────┐       ┌────────▼─────────────────┐
│  API Instance 1     │       │  API Instance 2          │
│  (Docker Container) │       │  (Docker Container)      │
└────┬────────────────┘       └────────┬─────────────────┘
     │                                  │
     └──────────────┬───────────────────┘
                    │
     ┌──────────────┼──────────────────┬──────────────────┐
     │              │                  │                  │
┌────▼─────┐  ┌────▼─────┐      ┌────▼────┐      ┌─────▼─────┐
│PostgreSQL│  │ MinIO/S3 │      │ Redis   │      │ Stripe    │
│    16    │  │  Object  │      │ (Cache) │      │  (Ext)    │
└──────────┘  └──────────┘      └─────────┘      └───────────┘
```

## Technology Decisions

### Backend: .NET 8
- **Pros**: High performance, mature ecosystem, excellent async support
- **Cons**: Windows hosting costs (mitigated with Linux containers)
- **Alternatives considered**: Node.js (less type-safe), Go (steeper learning curve)

### Frontend: Angular 17
- **Pros**: Full-featured framework, TypeScript, enterprise-ready
- **Cons**: Larger bundle size than React/Vue
- **Alternatives considered**: React (more boilerplate), Vue (smaller ecosystem)

### Database: PostgreSQL 16
- **Pros**: JSONB support, full-text search, ACID compliance
- **Cons**: Horizontal scaling complexity
- **Alternatives considered**: MySQL (less feature-rich), MongoDB (no ACID for transactions)

### Payments: Stripe
- **Pros**: Industry standard, excellent docs, webhook reliability
- **Cons**: 2.9% + $0.30 fee
- **Alternatives considered**: PayPal (worse UX), Paddle (less flexible)

### PDF Generation: Playwright
- **Pros**: Headless browser, perfect HTML/CSS rendering
- **Cons**: Resource-intensive (solution: background jobs)
- **Alternatives considered**: wkhtmltopdf (deprecated), QuestPDF (code-based layout)

## Disclaimer

**Legal Notice**: This application provides an MBTI-inspired personality assessment and is not affiliated with, endorsed by, or connected to The Myers-Briggs Company, the publisher of the official MBTI® assessment. The terms "MBTI" and "Myers-Briggs Type Indicator" are trademarks or registered trademarks of The Myers & Briggs Foundation in the United States and other countries. This tool uses a 16-type personality framework for educational and entertainment purposes only and should not be considered a substitute for professional psychological assessment.
