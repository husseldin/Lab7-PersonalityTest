# Next.js Rebuild Guide

## ✅ What's Done
- Removed .NET/Angular stack
- Created package.json with all dependencies
- Committed to branch: `claude/tech-stack-business-alignment-011CUs2FC2RfVLng58uDwYYW`

## 🔨 To Complete the Build

### 1. Create Next.js Config Files

```bash
# Create these files in root directory:

# next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      enabled: true
    }
  }
}
module.exports = nextConfig

# tsconfig.json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}

# tailwind.config.ts
import type { Config } from "tailwindcss"

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
export default config

# postcss.config.js
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

### 2. Create Simple App Structure

```bash
mkdir -p app
cat > app/layout.tsx << 'EOF'
import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Personality Test Platform',
  description: 'MBTI-inspired personality assessment',
}

export default function RootLayout({
  children,
}: {
  children: React.Node
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
EOF

cat > app/page.tsx << 'EOF'
export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold">
        Personality Test Platform
      </h1>
      <p className="mt-4 text-xl">
        Next.js 14 + TypeScript + Prisma
      </p>
    </main>
  )
}
EOF

cat > app/globals.css << 'EOF'
@tailwind base;
@tailwind components;
@tailwind utilities;
EOF
```

### 3. Create Simple Dockerfile

```dockerfile
# Dockerfile
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED 1

RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

### 4. Test Build

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Test Docker build
docker build -t personality-test .
```

### 5. Add Prisma (Optional - for database)

```bash
npx prisma init

# Then create your schema in prisma/schema.prisma
# Run: npx prisma generate
# Run: npx prisma migrate dev
```

## 🚀 Why This Stack Works

✅ **Simple Docker Build**: Just Node.js, no browsers
✅ **Fast**: Next.js is optimized for performance
✅ **Modern**: Latest React, TypeScript, Tailwind
✅ **Reliable**: No PowerShell, no Playwright, no complex dependencies
✅ **Scalable**: Can deploy to Vercel, AWS, Azure easily

## 📦 Features to Add After Basic Build Works

1. Prisma schema (users, tests, payments)
2. NextAuth authentication
3. API routes (test, scoring, payment)
4. PDFKit PDF generation
5. Stripe integration
6. Email service
7. Frontend pages

Start with getting the basic app to build, then add features incrementally!
