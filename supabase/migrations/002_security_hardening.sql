-- ============================================================
-- 002_security_hardening.sql
-- Run this in Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. Drop the permissive "anyone can do anything" policies
drop policy if exists "Creator or worker can update" on bounties;
drop policy if exists "Anyone can insert"            on payments;

-- 2. BOUNTIES UPDATE: terminal states (paid / cancelled) become immutable.
--    Nobody can flip a bounty back from paid, or alter a paid record.
create policy "Terminal states are immutable" on bounties
  for update
  using (status NOT IN ('paid', 'cancelled'));

-- 3. CONSTRAINT: a worker cannot be the same person who created the bounty.
--    Prevents self-claiming to collect your own reward.
alter table bounties
  add constraint no_self_claim
  check ("workerWallet" IS NULL OR "workerWallet" != "creatorWallet");

-- 4. CONSTRAINT: reward must be a positive number.
alter table bounties
  add constraint positive_reward
  check ("rewardAmount" > 0);

-- 5. CONSTRAINT: title and evidence description must have real content.
alter table bounties
  add constraint title_min_length
  check (length(trim(title)) >= 5);

alter table bounties
  add constraint evidence_min_length
  check (length(trim("evidenceRequired")) >= 10);

-- 6. RATE LIMIT trigger: max 5 new bounties per wallet address per hour.
--    Blocks spam even if someone calls the API directly with the anon key.
create or replace function enforce_bounty_rate_limit()
returns trigger language plpgsql as $$
declare
  recent_count integer;
begin
  select count(*) into recent_count
  from bounties
  where "creatorWallet" = NEW."creatorWallet"
    and "createdAt" > (now() - interval '1 hour');

  if recent_count >= 5 then
    raise exception 'Rate limit: max 5 bounties per hour per wallet';
  end if;

  return NEW;
end;
$$;

-- Drop trigger first in case migration is re-run
drop trigger if exists bounty_rate_limit on bounties;

create trigger bounty_rate_limit
  before insert on bounties
  for each row execute function enforce_bounty_rate_limit();

-- 7. PAYMENTS INSERT: only allowed when the referenced bounty is in
--    'approved' or 'paid' state. Prevents inserting fake payment records
--    for bounties that were never actually approved.
create policy "Payments require an approved bounty" on payments
  for insert with check (
    exists (
      select 1 from bounties
      where id = "bountyId"
        and status in ('approved', 'paid')
    )
  );
