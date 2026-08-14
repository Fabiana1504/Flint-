-- 003_revision_and_ratings.sql
-- Run in Supabase Dashboard → SQL Editor

-- Revision feedback from creator to worker
ALTER TABLE bounties ADD COLUMN IF NOT EXISTS "revisionNote" TEXT;

-- Worker rating (1-5 stars) left by creator after payment
ALTER TABLE bounties ADD COLUMN IF NOT EXISTS "workerRating" INTEGER CHECK ("workerRating" >= 1 AND "workerRating" <= 5);
ALTER TABLE bounties ADD COLUMN IF NOT EXISTS "ratingComment" TEXT;
