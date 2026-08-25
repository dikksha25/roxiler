-- ============================================================================
-- Store Rating Web Application — Normalized PostgreSQL Database Schema
-- Migration: 001_initial_schema.sql
-- ============================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- 2. Define Custom ENUM Types
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('SYSTEM_ADMIN', 'NORMAL_USER', 'STORE_OWNER');
    END IF;
END $$;

-- 3. USERS Table
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    address VARCHAR(400),
    role user_role NOT NULL DEFAULT 'NORMAL_USER',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_users_name_len CHECK (char_length(trim(name)) >= 2),
    CONSTRAINT chk_users_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Performance Indexes for USERS
CREATE UNIQUE INDEX IF NOT EXISTS uq_idx_users_email_lower ON users (LOWER(trim(email)));
CREATE INDEX IF NOT EXISTS idx_users_name ON users (name);
CREATE INDEX IF NOT EXISTS idx_users_name_lower ON users (LOWER(name));
CREATE INDEX IF NOT EXISTS idx_users_role ON users (role);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users (created_at DESC);

-- 4. STORES Table
CREATE TABLE IF NOT EXISTS stores (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    address VARCHAR(400) NOT NULL,
    owner_id BIGINT REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_stores_name_len CHECK (char_length(trim(name)) >= 2),
    CONSTRAINT chk_stores_address_len CHECK (char_length(trim(address)) >= 5),
    CONSTRAINT chk_stores_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Performance Indexes for STORES
CREATE INDEX IF NOT EXISTS idx_stores_owner_id ON stores (owner_id);
CREATE INDEX IF NOT EXISTS idx_stores_name ON stores (name);
CREATE INDEX IF NOT EXISTS idx_stores_name_lower ON stores (LOWER(name));
CREATE INDEX IF NOT EXISTS idx_stores_email ON stores (email);
CREATE INDEX IF NOT EXISTS idx_stores_email_lower ON stores (LOWER(email));
CREATE INDEX IF NOT EXISTS idx_stores_address ON stores (address);
CREATE INDEX IF NOT EXISTS idx_stores_created_at ON stores (created_at DESC);

-- GIN trigram indexes for high-speed text filtering & fuzzy search
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_trgm') THEN
        CREATE INDEX IF NOT EXISTS idx_stores_name_trgm ON stores USING gin (name gin_trgm_ops);
        CREATE INDEX IF NOT EXISTS idx_stores_address_trgm ON stores USING gin (address gin_trgm_ops);
        CREATE INDEX IF NOT EXISTS idx_users_name_trgm ON users USING gin (name gin_trgm_ops);
    END IF;
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

-- 5. RATINGS Table
CREATE TABLE IF NOT EXISTS ratings (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
    store_id BIGINT NOT NULL REFERENCES stores(id) ON DELETE CASCADE ON UPDATE CASCADE,
    rating_value SMALLINT NOT NULL,
    comment TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Rating Value Constraint (1 to 5 stars only)
    CONSTRAINT chk_ratings_value_range CHECK (rating_value >= 1 AND rating_value <= 5),
    
    -- Unique constraint preventing a user from submitting multiple ratings for the same store
    CONSTRAINT uq_user_store_rating UNIQUE (user_id, store_id)
);

-- Performance Indexes for RATINGS
CREATE INDEX IF NOT EXISTS idx_ratings_store_id ON ratings (store_id);
CREATE INDEX IF NOT EXISTS idx_ratings_user_id ON ratings (user_id);
CREATE INDEX IF NOT EXISTS idx_ratings_created_at ON ratings (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ratings_store_rating_val ON ratings (store_id, rating_value);
CREATE INDEX IF NOT EXISTS idx_ratings_user_store_val ON ratings (user_id, store_id, rating_value);

-- 6. Trigger Functions & Business Rules

CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_timestamp_users ON users;
CREATE TRIGGER set_timestamp_users
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

DROP TRIGGER IF EXISTS set_timestamp_stores ON stores;
CREATE TRIGGER set_timestamp_stores
BEFORE UPDATE ON stores
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

DROP TRIGGER IF EXISTS set_timestamp_ratings ON ratings;
CREATE TRIGGER set_timestamp_ratings
BEFORE UPDATE ON ratings
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Role validation trigger: Store owners cannot rate their own store
CREATE OR REPLACE FUNCTION trigger_validate_rating_submission()
RETURNS TRIGGER AS $$
DECLARE
    v_user_role user_role;
    v_store_owner_id BIGINT;
BEGIN
    SELECT role INTO v_user_role FROM users WHERE id = NEW.user_id;
    
    IF v_user_role IS NULL THEN
        RAISE EXCEPTION 'Referenced user with ID % does not exist', NEW.user_id;
    END IF;

    -- Check if submitting user is the owner of the target store
    SELECT owner_id INTO v_store_owner_id FROM stores WHERE id = NEW.store_id;
    
    IF v_store_owner_id IS NOT NULL AND v_store_owner_id = NEW.user_id THEN
        RAISE EXCEPTION 'Store owners cannot submit ratings for their own store';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS validate_rating_submission ON ratings;
CREATE TRIGGER validate_rating_submission
BEFORE INSERT OR UPDATE ON ratings
FOR EACH ROW
EXECUTE FUNCTION trigger_validate_rating_submission();

-- 7. Aggregated Store Summary View
CREATE OR REPLACE VIEW v_store_rating_summaries AS
SELECT 
    s.id AS store_id,
    s.name AS store_name,
    s.email AS store_email,
    s.address AS store_address,
    s.owner_id,
    u.name AS owner_name,
    u.email AS owner_email,
    s.created_at,
    s.updated_at,
    COALESCE(ROUND(AVG(r.rating_value)::numeric, 2), 0.00) AS average_rating,
    COUNT(r.id)::int AS total_ratings,
    COUNT(CASE WHEN r.rating_value = 5 THEN 1 END)::int AS star_5_count,
    COUNT(CASE WHEN r.rating_value = 4 THEN 1 END)::int AS star_4_count,
    COUNT(CASE WHEN r.rating_value = 3 THEN 1 END)::int AS star_3_count,
    COUNT(CASE WHEN r.rating_value = 2 THEN 1 END)::int AS star_2_count,
    COUNT(CASE WHEN r.rating_value = 1 THEN 1 END)::int AS star_1_count
FROM stores s
LEFT JOIN users u ON s.owner_id = u.id
LEFT JOIN ratings r ON s.id = r.store_id
GROUP BY s.id, u.name, u.email;
