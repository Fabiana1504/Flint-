# Flint ⚡

**Small tasks. Real rewards.**

Flint is a micro-bounty platform built as a Nimiq Pay Mini App. Post a task with a NIM or USDT reward, let someone claim and complete it, then approve and pay — all without leaving Nimiq Pay.

## Stack

- **React + Vite + TypeScript** — fast, typed, modern
- **Tailwind CSS** — utility-first styling with Nimiq's design tokens
- **Supabase** — Postgres database + Row Level Security
- **Nimiq Hub API** — wallet connection and payments
- **Vercel** — deployment

## Getting started

```bash
# Install dependencies
npm install

# Copy env vars
cp .env.example .env.local
# Fill in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY

# Run the dev server
npm run dev
```

## Database setup

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Run the migration in `supabase/migrations/001_initial_schema.sql` via the SQL editor
3. Copy your project URL and anon key into `.env.local`

## Project structure

```
src/
├── components/
│   ├── bounty/       # BountyCard, CategoryPill, StatusBadge
│   ├── common/       # EmptyState, SkeletonCard
│   ├── layout/       # AppShell, BottomNav
│   └── ui/           # Button, Card, Input, Textarea, Badge, Skeleton
├── context/          # WalletContext (Nimiq wallet state)
├── hooks/            # useBounties, useBounty
├── lib/              # supabase.ts, nimiq.ts, utils.ts
├── pages/            # Home, Browse, BountyDetail, CreateBounty, SubmitWork, Dashboard
└── types/            # Shared TypeScript types
```

## Bounty lifecycle

```
open → claimed → submitted → approved → paid
                                      ↘ cancelled
```

## License

MIT
