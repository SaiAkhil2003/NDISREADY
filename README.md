# NDISReady.ai

NDISReady.ai is a full-stack operations workspace for Australian disability support teams. It helps coordinators manage workers, participants, progress notes, and claim reviews from one dashboard, with backend workflows designed around structured data, validation, and audit-ready service documentation.

## Live Demo

https://ndisai.netlify.app/

## Tech Stack

- Next.js 15 App Router
- React 19
- TypeScript
- Tailwind CSS
- Supabase PostgreSQL and SSR clients
- Recharts for dashboard analytics
- Lucide React icons
- Anthropic API for optional claim-review assistance
- Netlify deployment

## Key Features

- Operations dashboard for workers, participants, progress notes, and claims.
- Worker and participant management with server-side validation and Supabase persistence.
- Progress note composer that turns raw shift context into structured note drafts and mapped participant goals.
- Claims workspace with local compliance checks and optional Anthropic-powered review support.
- Demo data fallback so reviewers can explore the product even when Supabase is not configured locally.
- Supabase migrations and seed data for a repeatable backend setup.
- Responsive dashboard layout designed for coordinators who need quick access to operational metrics.

## Setup Instructions

### Prerequisites

- Node.js 20 or newer
- npm
- Supabase project or local Supabase CLI setup

### Local Development

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open the local URL shown by Next.js, usually `http://localhost:3000`.

### Environment Variables

Create `.env.local` from `.env.example` and provide the values for your own Supabase and optional AI provider setup. Do not commit real secrets.

Required for live persistence:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SECRET_KEY=
```

Optional claim-review integration:

```bash
ANTHROPIC_API_KEY=
ANTHROPIC_CLAUDE_MODEL=
```

### Supabase Setup

If you are using the Supabase CLI locally:

```bash
npm run db:start
npm run db:reset
```

For a hosted Supabase project, apply the SQL migrations in `supabase/migrations` and seed data from `supabase/seed.sql` as needed.

## Future Improvements

- Add role-based access control for support coordinators, workers, and administrators.
- Add exportable PDF summaries for approved progress notes and claim reviews.
- Expand claim validation rules to cover more NDIS pricing and compliance scenarios.
- Add automated test coverage for the note composer, claims API, and dashboard data loaders.
- Add production screenshots or a short walkthrough video to the repository for recruiters.
