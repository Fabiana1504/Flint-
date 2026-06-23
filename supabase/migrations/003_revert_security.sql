-- ============================================================
-- 003_revert_security.sql
-- Reverts all changes from 002_security_hardening.sql
-- Run this in Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. Drop new restrictive policies
drop policy if exists "Terminal states are immutable"      on bounties;
drop policy if exists "Payments require an approved bounty" on payments;

-- 2. Restore original permissive policies
create policy "Creator or worker can update" on bounties
  for update using (true);

create policy "Anyone can insert" on payments
  for insert with check (true);

-- 3. Drop rate limit trigger and function
drop trigger   if exists bounty_rate_limit on bounties;
drop function  if exists enforce_bounty_rate_limit();

-- 4. Drop check constraints
alter table bounties drop constraint if exists no_self_claim;
alter table bounties drop constraint if exists positive_reward;
alter table bounties drop constraint if exists title_min_length;
alter table bounties drop constraint if exists evidence_min_length;
