# Lumos - Technology Literacy for Gen X and Beyond

A platform that illuminates the possibilities of new technologies for Gen X and older generations.

## Project Overview

Lumos is a service dedicated to helping Gen X and older adults discover and embrace new technologies. Many people in these demographics either don't know what they're missing, know what they're missing but don't know where to look, or simply lack the literacy to learn from existing tools. Lumos bridges this gap by providing accessible, approachable content and guidance.

The platform is built with Next.js 14 and uses a clean, minimal design with orange (#ff6719) as the primary accent color to feel welcoming and approachable.

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom `lumos-*` color palette
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js (credentials + OAuth)
- **Payments**: Stripe (subscriptions, checkout, customer portal)
- **Email**: Resend for transactional emails
- **Rich Text Editor**: TipTap
- **Icons**: Lucide React

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   │   ├── auth/          # NextAuth + registration
│   │   ├── email/         # Email send/subscribe/unsubscribe
│   │   ├── posts/         # Posts CRUD + publish
│   │   ├── publications/  # Publications CRUD
│   │   ├── stripe/        # Checkout, webhook, portal
│   │   ├── subscriptions/ # Subscription management
│   │   └── users/         # User profile
│   ├── auth/              # Sign in/up pages
│   ├── dashboard/         # Publication management
│   ├── explore/           # Browse publications
│   ├── subscribe/         # Subscription/pricing pages
│   ├── [slug]/            # Dynamic publication pages
│   └── [slug]/[postSlug]/ # Dynamic post pages
├── components/
│   ├── ui/                # Design system (Button, Input, Card, etc.)
│   ├── layout/            # Header, Footer, Navigation, Container
│   ├── auth/              # LoginForm, RegisterForm, AuthProvider
│   ├── publication/       # PublicationHeader, PostList, SubscribeButton
│   ├── post/              # Editor, EditorToolbar, PostSettings
│   ├── explore/           # SearchBar, PublicationCard
│   ├── settings/          # ProfileForm, AccountForm
│   ├── subscription/      # PricingCard, SubscriptionStatus
│   └── newsletter/        # EmailSubscribeForm, UnsubscribeConfirm
├── hooks/                 # Custom React hooks (usePublication, usePosts)
├── lib/                   # Utilities and configurations
│   ├── auth.ts            # NextAuth configuration
│   ├── db.ts              # Prisma client
│   ├── stripe.ts          # Stripe utilities
│   ├── email.ts           # Resend client
│   ├── email-templates.tsx # React email templates
│   ├── notifications.ts   # High-level email functions
│   ├── api.ts             # Frontend API client
│   ├── utils.ts           # Helper functions (cn, slugify, formatDate)
│   └── validations.ts     # Zod schemas
├── types/                 # TypeScript type definitions
└── middleware.ts          # Auth middleware
```

## Key Conventions

### Component Patterns

- Use `"use client"` directive for interactive components
- Server components are the default for pages
- Barrel exports via `index.ts` in each component folder
- Components use existing UI primitives from `@/components/ui`

### Styling

- Use Tailwind with custom colors: `lumos-orange-*`, `lumos-gray-*`
- Primary accent: `lumos-orange-500` (#ff6719)
- Use `cn()` utility for conditional class merging
- Prefer `min-h-[60vh]` for centered content containers

### API Routes

- All API routes return `{ success: boolean, data?: T, error?: string }`
- Use Zod schemas from `@/lib/validations.ts` for validation
- Protected routes check `getServerSession(authOptions)`
- Error responses use appropriate HTTP status codes

### Database

- Prisma schema at `prisma/schema.prisma`
- Use `prisma` client from `@/lib/db`
- Key models: User, Publication, Post, Subscription
- Slugs are unique identifiers for publications and posts

### Authentication

- NextAuth with credentials (email/password) and Google OAuth
- Session includes `user.id` via JWT callback
- Protected routes redirect to `/auth/signin`
- Middleware handles route protection

### Forms

- Client-side forms use React state
- Loading states with `isLoading` boolean
- Error display with `error` state
- Success redirects or toast notifications

## Environment Variables

```env
# Database
DATABASE_URL="postgresql://..."

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="..."
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."

# Stripe
STRIPE_SECRET_KEY="sk_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_..."

# Email
RESEND_API_KEY="re_..."
EMAIL_FROM="Lumos <noreply@yourdomain.com>"
```

## Common Tasks

### Adding a new page

1. Create page at `src/app/[route]/page.tsx`
2. Use `Container` from `@/components/layout` for consistent max-width
3. Add to middleware public routes if needed

### Adding a new API route

1. Create route at `src/app/api/[resource]/route.ts`
2. Export named functions: `GET`, `POST`, `PATCH`, `DELETE`
3. Add corresponding method to `src/lib/api.ts` client

### Adding a new component

1. Create in appropriate `src/components/[category]/` folder
2. Add to barrel export in `index.ts`
3. Use existing UI components from `@/components/ui`

## Running the Project

```bash
# Install dependencies
npm install

# Set up database
npx prisma generate
npx prisma db push

# Start development server
npm run dev
```

## Type Checking

```bash
npm run build  # Includes TypeScript type checking
```
