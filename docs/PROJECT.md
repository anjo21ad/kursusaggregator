COURSEHUB - PROJECT CONTEXT FOR CLAUDE CODE

Læs denne fil først før du koder noget.
Dette dokument definerer vores tech stack, vision, og hvordan vi bygger ting.


🎯 VISION & MISSION
Hvad Vi Bygger
CourseHub er en AI-first marketplace for corporate learning i Norden.
3 Faser:

Fase 1 (Måned 1-6): AI-drevet matching mellem virksomheder og eksisterende kurser
Fase 2 (Måned 7-12): AI genererer custom kurser on-demand
Fase 3 (År 2+): Outcome-guaranteed learning (betalingssucces baseret på målbare resultater)

Nøgle Principper:

AI-first: AI gør 95% af arbejdet fra dag 1
Speed over perfection: Ship hver uge, iterer konstant
Minimal viable features: Byg kun det nødvendige
User-centric: Hvis brugeren ikke beder om det, byg det ikke
Data-driven: Alle beslutninger baseret på metrics

Success Metrics
North Star: GMV (Gross Merchandise Value)
Vigtige KPIs:

Conversion rate (visitor → booking)
CAC (Customer Acquisition Cost)
LTV (Customer Lifetime Value)
AI accuracy (% recommendations der fører til booking)
NPS (Net Promoter Score)


🛠 TECH STACK
Core Infrastructure
┌────────────────────────────────────┐
│      FRONTEND (Next.js 15)         │
│   TypeScript + Tailwind + Shadcn   │
└────────────────────────────────────┘
                 ↓
┌────────────────────────────────────┐
│    BACKEND (Supabase + Edge Fns)   │
│  PostgreSQL + Auth + Realtime      │
└────────────────────────────────────┘
                 ↓
┌────────────────────────────────────┐
│      AI (Claude Sonnet 4.5)        │
│    Matching, Support, Content      │
└────────────────────────────────────┘
                 ↓
┌────────────────────────────────────┐
│     AUTOMATION (n8n self-hosted)   │
│   Workflows, Emails, Processing    │
└────────────────────────────────────┘
                 ↓
┌────────────────────────────────────┐
│         PAYMENTS (Stripe)          │
│  Payment Processing + Marketplace  │
└────────────────────────────────────┘
                 ↓
┌────────────────────────────────────┐
│       HOSTING (Vercel Edge)        │
│   Global CDN + Auto-scaling        │
└────────────────────────────────────┘
Detailed Stack
Frontend
json{
  "framework": "Next.js 15 (App Router)",
  "language": "TypeScript",
  "styling": "Tailwind CSS v4",
  "components": "shadcn/ui",
  "forms": "React Hook Form + Zod",
  "state": "Zustand (minimal global state)",
  "data_fetching": "Supabase client (realtime)",
  "routing": "Next.js App Router (RSC)",
  "icons": "Lucide React"
}
Key Points:

Use Server Components by default, Client Components only when needed
Prefer server actions over API routes
All UI components from shadcn/ui (consistent design system)
Mobile-first responsive design
Dark mode optional (start with light only)

Backend
json{
  "database": "PostgreSQL 15 (via Supabase)",
  "orm": "Supabase Client (direct SQL when needed)",
  "auth": "Supabase Auth",
  "storage": "Supabase Storage",
  "realtime": "Supabase Realtime",
  "edge_functions": "Supabase Edge Functions (Deno)",
  "vector_search": "pgvector extension"
}
Key Points:

Row Level Security (RLS) for all tables
Use Edge Functions for custom logic
Database migrations via Supabase CLI
Store embeddings directly in Postgres (pgvector)

AI
json{
  "primary_llm": "Claude Sonnet 4.5 (via Anthropic API)",
  "embeddings": "Claude embedding model",
  "use_cases": [
    "Course matching (semantic search)",
    "Customer support chat",
    "Content generation (blog posts, descriptions)",
    "Supplier screening",
    "Email writing",
    "Quality assessment"
  ]
}
Key Points:

Use streaming responses for better UX
Implement caching for repeated queries
Track all AI interactions for improvement
Log prompt versions for A/B testing
Use system prompts consistently

Automation
json{
  "platform": "n8n (self-hosted)",
  "workflows": [
    "Booking confirmation emails",
    "Supplier onboarding flow",
    "Payment processing",
    "Review collection",
    "Analytics reporting",
    "Content publishing"
  ],
  "integrations": [
    "Supabase",
    "Stripe",
    "Resend (email)",
    "Claude API",
    "Posthog (analytics)"
  ]
}
Key Points:

Self-hosted for cost control
Visual workflows for non-technical edits
All workflows version controlled
Error handling with retry logic
Monitoring via n8n UI + Sentry

Payments
json{
  "provider": "Stripe",
  "features": [
    "Stripe Connect (marketplace payouts)",
    "Payment Intents (3D Secure)",
    "Webhooks (async processing)",
    "Invoicing",
    "Subscriptions (future)"
  ]
}
Supporting Tools
json{
  "email": "Resend",
  "analytics": "Posthog",
  "monitoring": "Sentry",
  "cdn": "Vercel Edge",
  "dns": "Cloudflare"
}

📁 PROJECT STRUCTURE
coursehub/
├── apps/
│   ├── web/                    # Main Next.js app
│   │   ├── app/                # App Router
│   │   │   ├── (auth)/         # Auth routes
│   │   │   ├── (dashboard)/    # Dashboard routes
│   │   │   ├── (marketing)/    # Public pages
│   │   │   ├── api/            # API routes (minimal)
│   │   │   └── layout.tsx
│   │   ├── components/         # React components
│   │   │   ├── ui/             # shadcn/ui components
│   │   │   ├── ai/             # AI-specific components
│   │   │   ├── booking/        # Booking flow
│   │   │   └── shared/         # Shared components
│   │   ├── lib/                # Utilities
│   │   │   ├── supabase/       # Supabase clients
│   │   │   ├── ai/             # AI utilities
│   │   │   ├── stripe/         # Stripe utilities
│   │   │   └── utils.ts        # General utils
│   │   └── public/             # Static assets
│   └── n8n/                    # n8n workflows (exported)
├── packages/
│   ├── database/               # Supabase schema & migrations
│   │   ├── migrations/
│   │   ├── seed/
│   │   └── types/
│   ├── ai/                     # AI prompt library
│   │   ├── prompts/
│   │   └── templates/
│   └── config/                 # Shared config
├── docs/                       # Documentation
├── scripts/                    # Build/deploy scripts
└── tests/                      # E2E tests (Playwright)

🗄 DATABASE SCHEMA
Core Tables
sql-- Virksomheder (Companies)
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  cvr TEXT UNIQUE,
  industry TEXT,
  size TEXT CHECK (size IN ('1-10', '11-50', '51-200', '201-500', '500+')),
  contact_email TEXT,
  contact_phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Brugere (Users)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  company_id UUID REFERENCES companies(id),
  role TEXT CHECK (role IN ('admin', 'buyer', 'viewer')),
  full_name TEXT,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Instruktører (Instructors)
CREATE TABLE instructors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  bio TEXT,
  specialties TEXT[],
  rating DECIMAL(3,2),
  total_ratings INTEGER DEFAULT 0,
  stripe_account_id TEXT UNIQUE,
  onboarding_status TEXT CHECK (onboarding_status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Kurser (Courses)
CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instructor_id UUID REFERENCES instructors(id),
  title TEXT NOT NULL,
  description TEXT,
  learning_outcomes TEXT[],
  category TEXT,
  subcategory TEXT,
  price INTEGER NOT NULL, -- øre (100 = 1 kr)
  duration INTEGER, -- minutter
  location TEXT,
  location_type TEXT CHECK (location_type IN ('in-person', 'online', 'hybrid')),
  max_participants INTEGER,
  language TEXT DEFAULT 'da',
  
  -- AI fields
  embedding VECTOR(1536), -- For semantic search
  
  -- SEO
  slug TEXT UNIQUE,
  meta_description TEXT,
  
  -- Status
  status TEXT CHECK (status IN ('draft', 'published', 'archived')),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Kursus datoer (Course Dates)
CREATE TABLE course_dates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES courses(id),
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  available_spots INTEGER,
  status TEXT CHECK (status IN ('available', 'full', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bookings
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id),
  course_id UUID REFERENCES courses(id),
  course_date_id UUID REFERENCES course_dates(id),
  user_id UUID REFERENCES users(id),
  
  -- Participants
  num_participants INTEGER NOT NULL,
  participant_names TEXT[],
  
  -- Pricing
  total_price INTEGER NOT NULL, -- øre
  commission_rate DECIMAL(4,2) DEFAULT 15.00,
  commission_amount INTEGER, -- øre
  instructor_payout INTEGER, -- øre
  
  -- Status
  status TEXT CHECK (status IN (
    'pending', 
    'confirmed', 
    'completed', 
    'cancelled', 
    'refunded'
  )),
  
  -- Stripe
  stripe_payment_intent_id TEXT,
  stripe_transfer_id TEXT,
  
  -- Feedback
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  review TEXT,
  reviewed_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI Interactions (for analytics & improvement)
CREATE TABLE ai_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  session_id UUID,
  
  -- Query
  query TEXT NOT NULL,
  query_embedding VECTOR(1536),
  
  -- Response
  recommendations JSONB, -- Array of course recommendations
  model_used TEXT DEFAULT 'claude-sonnet-4.5',
  prompt_version TEXT,
  response_time_ms INTEGER,
  
  -- User feedback
  clicked_course_id UUID REFERENCES courses(id),
  booked_course_id UUID REFERENCES courses(id),
  feedback_rating INTEGER CHECK (feedback_rating BETWEEN 1 AND 5),
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI Generated Courses (Phase 2)
CREATE TABLE ai_courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id),
  
  -- Request
  request_description TEXT NOT NULL,
  custom_requirements JSONB,
  
  -- Generated content
  curriculum JSONB, -- Course structure
  video_urls TEXT[], -- HeyGen generated videos
  slides_url TEXT,
  exercises JSONB,
  
  -- Pricing
  price INTEGER NOT NULL,
  generation_cost INTEGER, -- What it cost us in AI credits
  
  -- Status
  status TEXT CHECK (status IN ('generating', 'ready', 'delivered')),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);
Indexes
sql-- Performance indexes
CREATE INDEX idx_courses_category ON courses(category);
CREATE INDEX idx_courses_status ON courses(status);
CREATE INDEX idx_bookings_company ON bookings(company_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_ai_interactions_user ON ai_interactions(user_id);

-- Vector search index
CREATE INDEX ON courses USING ivfflat (embedding vector_cosine_ops);

-- Full text search
CREATE INDEX idx_courses_search ON courses USING gin(
  to_tsvector('danish', title || ' ' || description)
);
Row Level Security (RLS)
sql-- Companies: Users can only see their own company
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own company"
  ON companies FOR SELECT
  USING (id IN (
    SELECT company_id FROM users WHERE id = auth.uid()
  ));

-- Courses: Public can view published courses
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published courses"
  ON courses FOR SELECT
  USING (status = 'published');

CREATE POLICY "Instructors can manage own courses"
  ON courses FOR ALL
  USING (instructor_id IN (
    SELECT id FROM instructors WHERE email = auth.jwt() ->> 'email'
  ));

-- Bookings: Users can view own company bookings
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own bookings"
  ON bookings FOR SELECT
  USING (company_id IN (
    SELECT company_id FROM users WHERE id = auth.uid()
  ));

-- etc...

🤖 AI IMPLEMENTATION
Claude Integration
Client Setup
typescript// lib/ai/client.ts
import Anthropic from '@anthropic-ai/sdk';

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export const CLAUDE_MODEL = 'claude-sonnet-4-20250514';

export const DEFAULT_MAX_TOKENS = 4096;
Streaming Chat
typescript// lib/ai/chat.ts
export async function* streamChatResponse(
  messages: Array<{ role: string; content: string }>,
  systemPrompt: string
) {
  const stream = await anthropic.messages.stream({
    model: CLAUDE_MODEL,
    max_tokens: DEFAULT_MAX_TOKENS,
    system: systemPrompt,
    messages,
  });

  for await (const chunk of stream) {
    if (chunk.type === 'content_block_delta') {
      yield chunk.delta.text;
    }
  }
}
Core Prompts
Course Matching Prompt
typescript// packages/ai/prompts/course-matching.ts
export const COURSE_MATCHING_PROMPT = `Du er CourseHub's AI matching assistent.

Din opgave er at hjælpe danske virksomheder med at finde de perfekte kurser til deres behov.

REGLER:
1. Forstå det underliggende behov, ikke bare keywords
2. Prioriter relevans over pris (men nævn altid pris)
3. Vær specifik om hvorfor et kursus matcher
4. Hvis usikker, stil uddybende spørgsmål
5. Aldrig opfind kurser - brug kun hvad der findes i databasen
6. Tal dansk (unless user prefers English)

OUTPUT FORMAT:
Altid JSON med denne struktur:
{
  "understanding": "Kort opsummering af hvad kunden har brug for",
  "recommendations": [
    {
      "course_id": "uuid",
      "title": "Kursus navn",
      "relevance_score": 0.95,
      "reasoning": "Hvorfor dette kursus matcher...",
      "price": 8500,
      "duration": 120,
      "next_available": "2025-03-15"
    }
  ],
  "clarifying_questions": ["Hvis nødvendigt"] // optional
}

TONE: Professionel men venlig. Hjælpsom uden at være pushy.`;

export function buildCourseMatchingPrompt(
  userQuery: string,
  companyContext: {
    name: string;
    industry: string;
    size: string;
  },
  availableCourses: any[]
): string {
  return `${COURSE_MATCHING_PROMPT}

VIRKSOMHED:
- Navn: ${companyContext.name}
- Branche: ${companyContext.industry}
- Størrelse: ${companyContext.size} medarbejdere

BRUGERS FORESPØRGSEL:
${userQuery}

TILGÆNGELIGE KURSER:
${JSON.stringify(availableCourses, null, 2)}

Giv dine anbefalinger nu:`;
}
Supplier Screening Prompt
typescript// packages/ai/prompts/supplier-screening.ts
export const SUPPLIER_SCREENING_PROMPT = `Du er CourseHub's AI kvalitetskontrol assistent.

Din opgave er at vurdere nye instruktør-ansøgninger og deres kurser.

VURDER PÅ:

1. Credentials (30%):
   - Har de relevant erfaring?
   - Er de eksperter i deres felt?
   - Er CV'et troværdigt?

2. Kursus Kvalitet (40%):
   - Er beskrivelsen klar og specifik?
   - Er learning outcomes realistiske?
   - Er prisen rimelig for indholdet?
   - Er materialet professionelt?

3. Professionalisme (30%):
   - Er kommunikationen professionel?
   - Har de portfolio/referencer?
   - Er deres online tilstedeværelse troværdig?

SCORING:
- 85-100: Auto-godkend (høj kvalitet)
- 70-84: Flaget til manuel review (potentiale)
- 0-69: Auto-afvis (ikke kvalificeret)

OUTPUT FORMAT:
{
  "score": 85,
  "decision": "approve" | "review" | "reject",
  "reasoning": "Detaljeret begrundelse...",
  "strengths": ["Styrke 1", "Styrke 2"],
  "concerns": ["Bekymring 1"], // hvis nogen
  "feedback_to_instructor": "Konstruktiv feedback..."
}`;
Semantic Search Implementation
typescript// lib/ai/semantic-search.ts
import { anthropic } from './client';
import { supabase } from '@/lib/supabase/client';

export async function generateEmbedding(text: string): Promise<number[]> {
  // Note: Claude doesn't have direct embedding endpoint yet
  // We'll use a workaround or wait for official support
  // For now, use OpenAI's embedding model or similar
  
  // Placeholder:
  return []; // Implement with actual embedding model
}

export async function semanticCourseSearch(
  query: string,
  limit: number = 10
): Promise<any[]> {
  const queryEmbedding = await generateEmbedding(query);
  
  const { data, error } = await supabase.rpc('match_courses', {
    query_embedding: queryEmbedding,
    match_threshold: 0.7,
    match_count: limit
  });
  
  if (error) throw error;
  return data;
}
Caching Strategy
typescript// lib/ai/cache.ts
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_TOKEN!,
});

export async function getCachedResponse(
  promptHash: string
): Promise<string | null> {
  return await redis.get(`ai:${promptHash}`);
}

export async function cacheResponse(
  promptHash: string,
  response: string,
  ttl: number = 3600 // 1 hour
): Promise<void> {
  await redis.setex(`ai:${promptHash}`, ttl, response);
}

// Usage:
import crypto from 'crypto';

function hashPrompt(prompt: string): string {
  return crypto.createHash('sha256').update(prompt).digest('hex');
}

export async function getChatResponse(prompt: string) {
  const hash = hashPrompt(prompt);
  
  // Try cache first
  const cached = await getCachedResponse(hash);
  if (cached) return JSON.parse(cached);
  
  // Generate new
  const response = await callClaude(prompt);
  
  // Cache for next time
  await cacheResponse(hash, JSON.stringify(response));
  
  return response;
}

🎨 FRONTEND PATTERNS
Component Structure
typescript// components/booking/BookingFlow.tsx
'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AIChat } from '@/components/ai/AIChat';
import { CourseList } from '@/components/booking/CourseList';
import { CheckoutForm } from '@/components/booking/CheckoutForm';

type Step = 'chat' | 'selection' | 'checkout' | 'confirmation';

export function BookingFlow() {
  const [step, setStep] = useState<Step>('chat');
  const [selectedCourses, setSelectedCourses] = useState([]);
  
  return (
    <div className="container mx-auto py-8">
      {step === 'chat' && (
        <AIChat
          onCoursesFound={(courses) => {
            setSelectedCourses(courses);
            setStep('selection');
          }}
        />
      )}
      
      {step === 'selection' && (
        <CourseList
          courses={selectedCourses}
          onSelect={(course) => setStep('checkout')}
          onBack={() => setStep('chat')}
        />
      )}
      
      {step === 'checkout' && (
        <CheckoutForm
          onSuccess={() => setStep('confirmation')}
          onBack={() => setStep('selection')}
        />
      )}
      
      {step === 'confirmation' && (
        <ConfirmationMessage />
      )}
    </div>
  );
}
Server Components Pattern
typescript// app/courses/[slug]/page.tsx
import { createServerClient } from '@/lib/supabase/server';
import { CourseDetail } from '@/components/courses/CourseDetail';
import { BookingButton } from '@/components/booking/BookingButton';

export default async function CoursePage({
  params,
}: {
  params: { slug: string };
}) {
  const supabase = createServerClient();
  
  const { data: course } = await supabase
    .from('courses')
    .select('*, instructor:instructors(*), dates:course_dates(*)')
    .eq('slug', params.slug)
    .single();
  
  if (!course) {
    notFound();
  }
  
  return (
    <div className="container">
      <CourseDetail course={course} />
      <BookingButton courseId={course.id} />
    </div>
  );
}
Form Handling
typescript// components/forms/CourseSearchForm.tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const searchSchema = z.object({
  query: z.string().min(3, 'Minimum 3 tegn'),
  location: z.string().optional(),
  budget: z.number().optional(),
});

type SearchForm = z.infer<typeof searchSchema>;

export function CourseSearchForm() {
  const form = useForm<SearchForm>({
    resolver: zodResolver(searchSchema),
  });
  
  async function onSubmit(data: SearchForm) {
    // Call AI search
    const results = await searchCourses(data);
    // Handle results...
  }
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="query"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Hvad skal I lære?</FormLabel>
              <Input 
                placeholder="f.eks. Sales training for account managers"
                {...field}
              />
            </FormItem>
          )}
        />
        <Button type="submit">Søg kurser</Button>
      </form>
    </Form>
  );
}

🔄 N8N WORKFLOWS
Workflow Patterns
1. Booking Confirmation
json{
  "name": "Booking Confirmation",
  "nodes": [
    {
      "type": "trigger",
      "name": "New Booking",
      "typeVersion": 1,
      "position": [0, 0],
      "parameters": {
        "tableName": "bookings",
        "event": "INSERT"
      }
    },
    {
      "type": "code",
      "name": "Fetch Details",
      "typeVersion": 1,
      "position": [200, 0],
      "parameters": {
        "code": "// Fetch related data from Supabase"
      }
    },
    {
      "type": "ai",
      "name": "Generate Emails",
      "typeVersion": 1,
      "position": [400, 0],
      "parameters": {
        "model": "claude-sonnet-4-20250514",
        "prompt": "Generate confirmation emails..."
      }
    },
    {
      "type": "email",
      "name": "Send to Customer",
      "typeVersion": 1,
      "position": [600, -100]
    },
    {
      "type": "email",
      "name": "Send to Instructor",
      "typeVersion": 1,
      "position": [600, 100]
    }
  ]
}
2. Supplier Onboarding
json{
  "name": "Supplier Onboarding",
  "nodes": [
    {
      "type": "webhook",
      "name": "Application Submitted",
      "parameters": {
        "path": "supplier-application"
      }
    },
    {
      "type": "ai",
      "name": "Screen Application",
      "parameters": {
        "model": "claude-sonnet-4-20250514",
        "systemPrompt": "{{$json.SUPPLIER_SCREENING_PROMPT}}"
      }
    },
    {
      "type": "switch",
      "name": "Route by Score",
      "parameters": {
        "rules": [
          {"score": ">= 85", "output": "auto_approve"},
          {"score": "70-84", "output": "manual_review"},
          {"score": "< 70", "output": "auto_reject"}
        ]
      }
    }
  ]
}
Integration Examples
typescript// lib/n8n/client.ts
export async function triggerN8nWorkflow(
  webhookUrl: string,
  data: any
): Promise<any> {
  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  
  return response.json();
}

// Usage:
await triggerN8nWorkflow(
  process.env.N8N_BOOKING_WEBHOOK!,
  {
    bookingId: booking.id,
    customerId: customer.id,
  }
);

💳 STRIPE INTEGRATION
Marketplace Setup
typescript// lib/stripe/connect.ts
import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
});

// Create connected account for instructor
export async function createInstructorAccount(instructor: {
  email: string;
  name: string;
  country: string;
}) {
  const account = await stripe.accounts.create({
    type: 'express',
    country: instructor.country,
    email: instructor.email,
    capabilities: {
      transfers: { requested: true },
    },
    business_profile: {
      name: instructor.name,
    },
  });
  
  return account.id;
}

// Create onboarding link
export async function createOnboardingLink(accountId: string) {
  const accountLink = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: `${process.env.NEXT_PUBLIC_URL}/instructor/onboarding`,
    return_url: `${process.env.NEXT_PUBLIC_URL}/instructor/dashboard`,
    type: 'account_onboarding',
  });
  
  return accountLink.url;
}
Payment Flow
typescript// lib/stripe/payments.ts

// Create payment intent with application fee
export async function createBookingPayment(booking: {
  amount: number;
  instructorAccountId: string;
  commissionRate: number;
}) {
  const commission = Math.round(booking.amount * booking.commissionRate);
  const instructorPayout = booking.amount - commission;
  
  const paymentIntent = await stripe.paymentIntents.create({
    amount: booking.amount,
    currency: 'dkk',
    application_fee_amount: commission,
    transfer_data: {
      destination: booking.instructorAccountId,
    },
    metadata: {
      bookingId: booking.id,
    },
  });
  
  return paymentIntent;
}

// Handle webhook
export async function handleStripeWebhook(
  signature: string,
  body: string
) {
  const event = stripe.webhooks.constructEvent(
    body,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET!
  );
  
  switch (event.type) {
    case 'payment_intent.succeeded':
      await handlePaymentSuccess(event.data.object);
      break;
    case 'payment_intent.payment_failed':
      await handlePaymentFailure(event.data.object);
      break;
    // ... more cases
  }
}

🎯 CODING CONVENTIONS
TypeScript
typescript// ALWAYS use TypeScript
// ALWAYS define interfaces for data structures
// PREFER type over interface for simple types
// USE zod for runtime validation

// Good:
type CourseCategory = 'sales' | 'leadership' | 'technical' | 'soft-skills';

interface Course {
  id: string;
  title: string;
  category: CourseCategory;
  price: number;
}

// Bad:
const course: any = { ... };
React
typescript// PREFER Server Components
// USE Client Components only when needed (useState, useEffect, event handlers)
// MARK Client Components with 'use client' directive

// Server Component (default):
export default async function CoursePage() {
  const courses = await getCourses();
  return <CourseList courses={courses} />;
}

// Client Component:
'use client';

export function BookingButton() {
  const [isOpen, setIsOpen] = useState(false);
  return <Button onClick={() => setIsOpen(true)}>Book</Button>;
}
Naming Conventions
typescript// Files: kebab-case
// booking-form.tsx, course-list.tsx

// Components: PascalCase
// BookingForm, CourseList

// Functions: camelCase
// getCourses(), createBooking()

// Constants: UPPER_SNAKE_CASE
// API_BASE_URL, MAX_COURSES_PER_PAGE

// Types/Interfaces: PascalCase
// type CourseData = ...
// interface BookingFormProps { ... }
Error Handling
typescript// ALWAYS handle errors explicitly
// USE custom error classes
// LOG errors for debugging

class APIError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code: string
  ) {
    super(message);
    this.name = 'APIError';
  }
}

async function getCourse(id: string) {
  try {
    const { data, error } = await supabase
      .from('courses')
      .select()
      .eq('id', id)
      .single();
    
    if (error) {
      throw new APIError(
        'Failed to fetch course',
        500,
        'COURSE_FETCH_ERROR'
      );
    }
    
    return data;
  } catch (error) {
    console.error('Course fetch error:', error);
    throw error;
  }
}
Comments
typescript// WRITE comments for complex logic
// EXPLAIN WHY, not what
// USE JSDoc for public functions

/**
 * Calculates instructor payout after commission
 * 
 * We take 15% commission, but always round up the instructor's payout
 * to the nearest krone to avoid confusion with øre.
 */
function calculateInstructorPayout(
  totalAmount: number,
  commissionRate: number = 0.15
): number {
  const commission = Math.floor(totalAmount * commissionRate);
  const payout = totalAmount - commission;
  
  // Round up to nearest krone
  return Math.ceil(payout / 100) * 100;
}

🚀 DEPLOYMENT & ENVIRONMENT
Environment Variables
bash# .env.local (development)
# .env.production (production)

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Anthropic
ANTHROPIC_API_KEY=sk-ant-...

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# n8n
N8N_URL=https://n8n.yourdomain.com
N8N_API_KEY=...

# Resend
RESEND_API_KEY=re_...

# Posthog
NEXT_PUBLIC_POSTHOG_KEY=phc_...
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com

# Sentry
SENTRY_DSN=https://...@sentry.io/...
Vercel Deployment
json// vercel.json
{
  "buildCommand": "pnpm build",
  "devCommand": "pnpm dev",
  "installCommand": "pnpm install",
  "framework": "nextjs",
  "regions": ["fra1"],
  "env": {
    "ANTHROPIC_API_KEY": "@anthropic-api-key"
  }
}

📝 COMMON TASKS & PROMPTS
When You Need to Add a Feature
Prompt to use:
Jeg skal tilføje en ny feature: [beskrivelse]

Tech stack:
- Next.js 15 (App Router)
- Supabase (PostgreSQL)
- Claude Sonnet 4.5 for AI
- Tailwind CSS + shadcn/ui

Følg vores conventions:
1. Server Components som default
2. TypeScript med proper typing
3. Zod for validation
4. RLS policies for security

Giv mig:
1. Database schema changes (hvis nødvendigt)
2. Component implementation
3. API routes (hvis nødvendigt)
4. Tests outline

Start med at spørge clarifying questions hvis noget er uklart.
When Debugging
Prompt to use:
Jeg har en bug: [beskrivelse af problemet]

Relevant kode:
[indsæt kode]

Fejlbesked:
[indsæt error]

Projektet bruger:
- Next.js 15
- Supabase
- TypeScript

Hjælp mig med at:
1. Identificere root cause
2. Foreslå fix
3. Tilføj error handling hvis mangler

Spørg hvis du har brug for mere context.
When Optimizing
Prompt to use:
Jeg vil optimere denne funktion/component:
[indsæt kode]

Mål:
- Hurtigere performance
- Bedre UX
- Lavere costs (hvis AI-relateret)

Foreslå forbedringer og forklar trade-offs.

🎓 LEARNING RESOURCES
Must-Read Docs

Next.js 15 Docs
Supabase Docs
Anthropic API Docs
Stripe API Docs
shadcn/ui Components

Code Examples
Se /examples folder for:

AI chat implementation
Booking flow
Stripe checkout
n8n workflow templates


✅ QUALITY CHECKLIST
Før du merger kode, check:

 TypeScript errors: 0
 All tests pass
 RLS policies added for new tables
 Error handling implemented
 Loading states added
 Mobile responsive
 Accessibility (keyboard nav, ARIA labels)
 Performance: No unnecessary re-renders
 Security: No secrets in code
 Analytics events added (if user-facing)


🚨 NEVER DO THIS
❌ Store API keys in code
❌ Skip RLS policies
❌ Use any type in TypeScript
❌ Make API calls in components (use server actions)
❌ Forget error handling
❌ Deploy without testing locally first
❌ Use force push to main
❌ Skip database migrations

📞 WHEN YOU'RE STUCK
Ask me directly:
"Claude, jeg sidder fast med [problem]. Hvad er den bedste måde at [løsning] på i vores tech stack?"
Common issues:

Supabase RLS not working: Check policies, check auth state
AI responses slow: Implement streaming, add caching
Stripe webhooks failing: Check webhook secret, check endpoint
Build errors: Check TypeScript errors, check imports


🎯 CURRENT PRIORITIES
Week 1-4 (MVP)

✅ Setup project structure
✅ Supabase schema
⏳ AI chat interface
⏳ Course listing & search
⏳ Booking flow
⏳ Stripe integration
⏳ n8n workflows

Week 5-6 (Launch)

Norway & Sweden localization
Instructor onboarding
Email automations
Analytics setup
Beta testing


LÆS ALTID DENNE FIL FØR DU STARTER PÅ EN NY OPGAVE.
Spørg hvis noget er uklart. Det er bedre at spørge end at bygge forkert.
Lad os bygge fremtidens lea