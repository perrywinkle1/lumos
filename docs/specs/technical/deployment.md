# Technical Spec: Production Deployment

## Summary
Deploy Lumos Next.js application to Vercel with PostgreSQL database, enabling full functionality including authentication, payments, and email services.

## Architecture

### Components
```
┌─────────────────────────────────────────────────────────────┐
│                         VERCEL                               │
│  ┌─────────────────┐    ┌─────────────────┐                 │
│  │   Next.js App   │───▶│   Serverless    │                 │
│  │   (Frontend +   │    │   Functions     │                 │
│  │    API Routes)  │    │   (API)         │                 │
│  └─────────────────┘    └────────┬────────┘                 │
└──────────────────────────────────┼──────────────────────────┘
                                   │
        ┌──────────────────────────┼──────────────────────────┐
        │                          │                          │
        ▼                          ▼                          ▼
┌───────────────┐         ┌───────────────┐         ┌───────────────┐
│   PostgreSQL  │         │    Stripe     │         │    Resend     │
│   (Neon/      │         │   (Payments)  │         │   (Email)     │
│   Vercel PG)  │         │               │         │               │
└───────────────┘         └───────────────┘         └───────────────┘
```

### Data Flow
1. User requests → Vercel Edge Network → Next.js App
2. API routes → Serverless functions → PostgreSQL
3. Auth flows → NextAuth.js → Database sessions
4. Payments → Stripe webhooks → Database updates
5. Notifications → Resend API → User email

## Dependencies

| Service | Purpose | Free Tier | Paid Tier |
|---------|---------|-----------|-----------|
| Vercel | Hosting | 100GB bandwidth, serverless | $20/mo Pro |
| Neon / Vercel Postgres | Database | 0.5GB storage | Usage-based |
| Stripe | Payments | Test mode free | 2.9% + 30¢/tx |
| Resend | Email | 3,000 emails/mo | $20/mo |
| Google OAuth | Social login | Free | Free |

## Environment Variables

### Required for Basic Deployment
```bash
# Database
DATABASE_URL="postgresql://user:pass@host:5432/lumos?sslmode=require"

# NextAuth
NEXTAUTH_URL="https://your-domain.vercel.app"
NEXTAUTH_SECRET="<generate: openssl rand -base64 32>"
```

### Required for Full Functionality
```bash
# Google OAuth
GOOGLE_CLIENT_ID="xxx.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-xxx"

# Stripe
STRIPE_SECRET_KEY="sk_live_xxx"
STRIPE_WEBHOOK_SECRET="whsec_xxx"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_xxx"

# Email
RESEND_API_KEY="re_xxx"
EMAIL_FROM="Lumos <noreply@yourdomain.com>"
```

## Deployment Steps

### Phase 1: Repository Setup
- [ ] Initialize git repository (if not done)
- [ ] Create `.gitignore` with sensitive files excluded
- [ ] Push to GitHub

```bash
# Commands
git init
git add .
git commit -m "Initial commit"
gh repo create lumos --public --source=. --push
```

### Phase 2: Database Setup (Neon - Recommended)

1. **Create Neon Account**
   - Go to https://neon.tech
   - Sign up with GitHub

2. **Create Database**
   - Create new project "lumos-prod"
   - Region: Select closest to your users
   - Copy connection string

3. **Configure Connection**
   ```bash
   # Format
   DATABASE_URL="postgresql://[user]:[password]@[host]/[database]?sslmode=require"
   ```

### Phase 3: Vercel Deployment

1. **Connect Repository**
   - Go to https://vercel.com/new
   - Import GitHub repository
   - Framework: Next.js (auto-detected)

2. **Configure Environment Variables**
   Add in Vercel dashboard → Settings → Environment Variables:

   | Variable | Environment | Value |
   |----------|-------------|-------|
   | DATABASE_URL | Production | (from Neon) |
   | NEXTAUTH_SECRET | Production | (generate new) |
   | NEXTAUTH_URL | Production | https://your-app.vercel.app |

3. **Deploy**
   - Click "Deploy"
   - Wait for build completion

### Phase 4: Database Migration

```bash
# Option A: Via Vercel CLI
vercel env pull .env.local
npx prisma db push

# Option B: Via local with production DB
DATABASE_URL="<prod-url>" npx prisma db push
```

### Phase 5: OAuth Configuration (Google)

1. **Google Cloud Console**
   - Go to https://console.cloud.google.com
   - Create new project or select existing
   - Enable "Google+ API"

2. **Create OAuth Credentials**
   - Go to APIs & Services → Credentials
   - Create OAuth 2.0 Client ID
   - Application type: Web application
   - Authorized redirect URIs:
     ```
     https://your-app.vercel.app/api/auth/callback/google
     ```

3. **Add to Vercel**
   - Add `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`

### Phase 6: Stripe Configuration

1. **Stripe Dashboard**
   - Go to https://dashboard.stripe.com
   - Switch to Live mode (top-right toggle)

2. **Get API Keys**
   - Developers → API keys
   - Copy Publishable and Secret keys

3. **Configure Webhook**
   - Developers → Webhooks → Add endpoint
   - URL: `https://your-app.vercel.app/api/stripe/webhook`
   - Events to listen:
     - `checkout.session.completed`
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.paid`
     - `invoice.payment_failed`

4. **Add to Vercel**
   - Add all Stripe environment variables

### Phase 7: Email Configuration (Resend)

1. **Resend Dashboard**
   - Go to https://resend.com
   - Create API key

2. **Domain Verification** (for custom domain)
   - Add domain in Resend
   - Add DNS records to your domain

3. **Add to Vercel**
   - Add `RESEND_API_KEY` and `EMAIL_FROM`

### Phase 8: Custom Domain (Optional)

1. **Add Domain in Vercel**
   - Project Settings → Domains → Add
   - Enter your domain (e.g., `lumos.app`)

2. **Configure DNS**
   - Add CNAME record: `@ → cname.vercel-dns.com`
   - Or A record: `@ → 76.76.21.21`

3. **Update Environment Variables**
   - Update `NEXTAUTH_URL` to custom domain
   - Update OAuth redirect URIs in Google Console
   - Update Stripe webhook URL

## Error Handling

| Error Condition | Response | Recovery |
|-----------------|----------|----------|
| Database connection failed | 500 error, log to Vercel | Check Neon status, verify connection string |
| Stripe webhook signature invalid | 400 error | Verify webhook secret matches |
| OAuth callback error | Redirect to /auth/error | Check redirect URI configuration |
| Email send failure | Log error, continue | Check Resend API key and domain |
| Build failure | Deployment blocked | Check build logs, fix TypeScript errors |

## Security Considerations

- **Secrets**: All secrets stored in Vercel environment variables (encrypted at rest)
- **Database**: SSL required (`sslmode=require`), IP allowlist in Neon if needed
- **Authentication**: NextAuth.js handles CSRF, secure cookies
- **Payments**: Stripe handles PCI compliance
- **HTTPS**: Automatic via Vercel

## Performance Requirements

- **Cold Start**: < 3s (Vercel serverless)
- **Database Queries**: < 100ms (use connection pooling)
- **Page Load**: < 2s (leverage Next.js caching)

## Monitoring & Observability

### Vercel Built-in
- Deployment logs
- Function logs
- Analytics (Pro plan)

### Recommended Additions
- Sentry for error tracking (free tier available)
- Vercel Analytics for performance

## Rollback Plan

1. **Immediate Rollback**
   - Vercel dashboard → Deployments → Select previous → "Promote to Production"

2. **Database Rollback**
   - Neon supports point-in-time recovery
   - Keep migration scripts reversible

## Testing Strategy

### Pre-deployment Checklist
- [ ] Build succeeds locally (`npm run build`)
- [ ] TypeScript has no errors
- [ ] Environment variables documented
- [ ] Database migrations tested

### Post-deployment Verification
- [ ] Homepage loads
- [ ] Authentication flow works
- [ ] Database queries succeed
- [ ] Stripe test payment works
- [ ] Email sends successfully

## Cost Estimation

### Minimum Viable (Free)
| Service | Cost |
|---------|------|
| Vercel Hobby | $0 |
| Neon Free | $0 |
| Resend Free | $0 |
| **Total** | **$0/mo** |

### Production Ready
| Service | Cost |
|---------|------|
| Vercel Pro | $20/mo |
| Neon Launch | $19/mo |
| Resend Pro | $20/mo |
| Domain | ~$12/yr |
| **Total** | **~$60/mo** |

## Open Questions

- [ ] Which region should be primary for database? (Consider user base location)
- [ ] Should we enable Vercel Edge Functions for auth?
- [ ] Do we need a staging environment before production?
- [ ] What is the expected traffic volume for capacity planning?
