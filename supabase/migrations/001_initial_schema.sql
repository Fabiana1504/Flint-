-- Users
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  "walletAddress" text unique not null,
  "displayName" text not null,
  avatar text,
  "createdAt" timestamptz default now(),
  "completedBounties" integer default 0,
  "createdBounties" integer default 0,
  "reputationScore" integer default 0
);

-- Bounties
create type bounty_status as enum ('open', 'claimed', 'submitted', 'approved', 'paid', 'cancelled');
create type bounty_category as enum ('Testing', 'Design', 'Writing', 'Survey', 'Dev');
create type reward_currency as enum ('NIM', 'USDT');

create table if not exists bounties (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  category bounty_category not null,
  "rewardAmount" numeric(18,6) not null,
  "rewardCurrency" reward_currency not null,
  "creatorWallet" text not null references users("walletAddress"),
  "workerWallet" text references users("walletAddress"),
  status bounty_status not null default 'open',
  "evidenceRequired" text not null,
  "submittedEvidence" text,
  "submittedLink" text,
  "createdAt" timestamptz default now(),
  "updatedAt" timestamptz default now(),
  "claimedAt" timestamptz,
  "submittedAt" timestamptz,
  "approvedAt" timestamptz,
  "paidAt" timestamptz
);

create index bounties_status_idx on bounties(status);
create index bounties_category_idx on bounties(category);
create index bounties_creator_idx on bounties("creatorWallet");
create index bounties_worker_idx on bounties("workerWallet");

-- Payments
create type payment_status as enum ('pending', 'confirmed', 'failed');

create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  "bountyId" uuid not null references bounties(id),
  "fromWallet" text not null,
  "toWallet" text not null,
  amount numeric(18,6) not null,
  currency reward_currency not null,
  "txHash" text,
  status payment_status not null default 'pending',
  "createdAt" timestamptz default now()
);

-- RLS: allow public read on bounties
alter table bounties enable row level security;
create policy "Anyone can read open bounties" on bounties for select using (true);
create policy "Creator can insert" on bounties for insert with check (true);
create policy "Creator or worker can update" on bounties for update using (true);

alter table users enable row level security;
create policy "Public read" on users for select using (true);
create policy "Anyone can upsert" on users for insert with check (true);

alter table payments enable row level security;
create policy "Participants can read" on payments for select using (true);
create policy "Anyone can insert" on payments for insert with check (true);

-- Seed: example bounties (optional, remove before production)
insert into users ("walletAddress", "displayName") values
  ('NQ07 0000 0000 0000 0000 0000 0000 0000 0001', 'alice.nim'),
  ('NQ07 0000 0000 0000 0000 0000 0000 0000 0002', 'bob.nim')
on conflict do nothing;

insert into bounties (title, description, category, "rewardAmount", "rewardCurrency", "creatorWallet", "evidenceRequired", status)
values
  ('Test mobile checkout flow', 'Go through the full checkout on Nimiq Pay on iOS and Android. Report any bugs or UX issues.', 'Testing', 50, 'NIM', 'NQ07 0000 0000 0000 0000 0000 0000 0000 0001', 'Screenshot of each step + written bug report', 'open'),
  ('Write landing page copy', 'Write a short, punchy landing page for a DeFi product. 3 sections max. Tone: bold and approachable.', 'Writing', 30, 'USDT', 'NQ07 0000 0000 0000 0000 0000 0000 0000 0002', 'Google Doc link with the copy', 'open'),
  ('Design a logo for Flint', 'Create a simple, modern logo for Flint — the micro-bounty platform. Deliver as SVG.', 'Design', 100, 'NIM', 'NQ07 0000 0000 0000 0000 0000 0000 0000 0001', 'SVG file + 3 color variants', 'open')
on conflict do nothing;
