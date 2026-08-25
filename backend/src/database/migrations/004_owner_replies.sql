-- ============================================================================
-- Migration: 004_owner_replies.sql
-- Store Rating Web Application — Store Owner Review Replies Support
-- ============================================================================

-- Add owner_reply and owner_replied_at columns to ratings table
ALTER TABLE ratings 
ADD COLUMN IF NOT EXISTS owner_reply TEXT,
ADD COLUMN IF NOT EXISTS owner_replied_at TIMESTAMPTZ;

-- Performance index for store owner reply lookups
CREATE INDEX IF NOT EXISTS idx_ratings_owner_replied_at ON ratings (owner_replied_at DESC);
