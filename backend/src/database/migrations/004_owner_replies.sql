-- ============================================================================
-- Migration: 004_owner_replies.sql
-- Add Store Owner Review Reply fields to ratings table
-- ============================================================================

ALTER TABLE ratings ADD COLUMN IF NOT EXISTS owner_reply TEXT;
ALTER TABLE ratings ADD COLUMN IF NOT EXISTS owner_replied_at TIMESTAMPTZ;

-- Performance index for filtering/searching replied reviews
CREATE INDEX IF NOT EXISTS idx_ratings_owner_replied_at ON ratings (owner_replied_at DESC) WHERE owner_reply IS NOT NULL;
