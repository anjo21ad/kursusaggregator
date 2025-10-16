# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a B2B course platform (kursusaggregator) that serves as a marketplace connecting course providers with companies seeking competency development for their employees. The platform operates with a hybrid business model combining commission-based sales and lead generation.

**Current Implementation**: Basic Next.js application with Pages Router, Prisma, PostgreSQL, Supabase auth, and Stripe payments.

**Target Architecture**: Scalable B2B marketplace platform with enterprise-grade features.

## Development Commands

All commands are run from the `frontend/` directory:

```bash
# Development
npm run dev          # Start development server on localhost:3000
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Database Commands

```bash
npx prisma generate  # Generate Prisma client (runs automatically on postinstall)
npx prisma migrate   # Run database migrations
npx prisma db seed   # Seed database
npx prisma studio    # Open Prisma Studio
```

### Docker Development

```bash
docker-compose up    # Run with PostgreSQL database
```

## Architecture & Tech Stack

### Current Tech Stack
- **Next.js 15.1.8** with Pages Router (not App Router)
- **TypeScript** for type safety
- **Prisma 6.8.2** as ORM with PostgreSQL
- **Supabase** for authentication and user management
- **Stripe** for payment processing
- **Sentry** for error monitoring and performance tracking
- **Tailwind CSS** for styling

### Target Tech Stack (Recommended Evolution)
- **Frontend**: Next.js with TypeScript and Tailwind CSS
- **Backend**: Node.js/NestJS or Next.js API routes (current)
- **Database**: PostgreSQL with Prisma ORM
- **Hosting**: Vercel for frontend, managed PostgreSQL (Supabase/AWS RDS)
- **Authentication**: Supabase Auth with SSO/SAML support for B2B
- **Payments**: Stripe Connect for marketplace payments
- **Search**: Elasticsearch or Algolia for course search
- **Architecture**: API-first design, start as monolith, migrate to microservices
- **Deployment**: Containerized with Docker, cloud-hosted with auto-scaling

### Current Database Schema
The application uses three main models:
- **User**: Authentication via Supabase (id, email, role)
- **Course**: Course catalog (id, title, description, priceCents, provider)
- **Purchase**: Purchase records linking users to courses (userId, courseId, createdAt)

### Target B2B Platform Features
**Core Functionalities to Implement:**
1. **Course Provider Dashboard** - Provider registration and course management
2. **Company Search Portal** - Advanced filtering (geography, category, price, date)
3. **Hybrid Business Model** - Commission-based sales (10-20%) + lead generation
4. **Admin Backend** - Content moderation and user management
5. **Affiliate Tracking** - Conversion tracking and analytics
6. **Enterprise Integration** - HR system integrations and SSO/SAML

**MVP Priorities:**
1. Basic course catalog with search/filtering
2. Provider registration and course creation
3. Simple lead generation (contact forms)
4. Admin backend for moderation
5. Company user registration

### Project Structure
```
frontend/
├── src/
│   ├── pages/           # Next.js pages (Pages Router)
│   │   ├── api/         # API routes
│   │   ├── courses/     # Course-related pages
│   │   ├── index.tsx    # Home page with course listing
│   │   ├── login.tsx    # Authentication page
│   │   └── my-courses.tsx # User's purchased courses
│   └── instrumentation.ts # Sentry configuration
├── lib/
│   ├── prisma.ts        # Prisma client configuration
│   └── supabaseClient.ts # Supabase client setup
├── prisma/
│   ├── schema.prisma    # Database schema
│   └── seed.js          # Database seed data
└── public/              # Static assets
```

## Key Implementation Details

### Authentication Flow
- Uses Supabase for user authentication
- User sessions are managed client-side
- API routes validate authentication via Bearer tokens
- User IDs from Supabase are stored as strings in the User model

### Payment Integration
- Stripe Checkout integration with webhook handling
- Course purchases redirect to success URL with query parameters
- Purchase registration happens on the client after successful payment
- Prices stored in cents (Danish Kroner)

### Environment Variables Required
```bash
DATABASE_URL="postgresql://..."
NEXT_PUBLIC_SUPABASE_URL="..."
NEXT_PUBLIC_SUPABASE_ANON_KEY="..."
SUPABASE_SERVICE_ROLE_KEY="..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="..."
STRIPE_SECRET_KEY="..."
SENTRY_DSN="..."
UPSTASH_REDIS_REST_URL="..."
UPSTASH_REDIS_REST_TOKEN="..."
```

### API Endpoints
- `GET/POST /api/checkout` - Create Stripe checkout session
- `POST /api/purchase` - Register purchase after payment
- `GET /api/my-courses` - Fetch user's purchased courses
- `GET /api/has-access` - Check user access to specific course

## Development Guidelines

### Code Style
- Uses ESLint with Next.js TypeScript configuration
- Tailwind CSS for styling
- Danish language used in UI text and comments
- TypeScript strict mode enabled

### Database Development
- Use Prisma migrations for schema changes
- Database connection pooling configured for production
- Development uses local PostgreSQL via Docker Compose
- Production uses external PostgreSQL with SSL

### Error Monitoring
- Sentry configured for both client and server
- Automatic error tracking and performance monitoring
- Source maps uploaded for better error reporting

## Business Model & Strategy

**Hybrid Revenue Model:**
- **Commission-based sales**: 10-20% commission on direct course purchases
- **Lead generation**: Pay-per-lead for affiliate traffic and inquiries
- **Target market**: B2B companies seeking employee competency development

**Key Success Factors:**
- Quality assurance of course providers through moderation
- Streamlined onboarding process for both providers and companies
- Enterprise-grade security and SSO integration
- Scalable architecture for growth

## Important Notes

- This project uses **Pages Router**, not App Router
- The main application logic is in the `frontend/` directory
- Danish language is used throughout the UI
- All monetary values are stored in cents (øre)
- Authentication state management happens client-side with Supabase
- **Strategic Focus**: Start with a well-functioning MVP, then scale based on user feedback
- **Architecture Pattern**: Begin as monolith, evolve to microservices as needed

## Documentation

Additional documentation can be found in the `/docs` directory:
- [Web Design Style Guide](docs/WEB-DESIGN-STYLEGUIDE.md) - Complete design system documentation
- [Migration Guide](docs/MIGRATION-GUIDE.md) - Database migration strategies
- [Provider Workflow Test](docs/PROVIDER-WORKFLOW-TEST.md) - Provider feature testing
- [Style Guide](docs/STYLEGUIDE.md) - UI/UX and coding standards
- [Migration Strategy](docs/migration-strategy.md) - Technical migration planning