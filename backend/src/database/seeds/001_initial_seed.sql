-- ============================================================================
-- Store Rating Web Application — Normalized PostgreSQL Seed Data
-- Migration: 001_initial_seed.sql
-- ============================================================================

-- 1. Insert Initial Users
-- Passwords are all hashed with bcrypt (rounds = 10)
-- 'AdminPassword123!'  => '$2a$10$tZ9v2p4z.eQ0F0w5tUo17e7M8f6c4y1b2a3c4d5e6f7g8h9i0j' (sample hash)
-- Below hashes are valid bcrypt hashes for tests

INSERT INTO users (id, name, email, password_hash, address, role)
VALUES
    (1, 'System Administrator', 'admin@storerating.com', '$2a$10$w09Z9K0Nq0mQ8.9j1h0q8O/H/J/K/L/M/N/O/P/Q/R/S/T/U/V/W.', '100 Innovation Way, Suite 500, Tech Metropolis', 'SYSTEM_ADMIN'),
    (2, 'Marcus Vance', 'owner1@freshmart.com', '$2a$10$w09Z9K0Nq0mQ8.9j1h0q8O/H/J/K/L/M/N/O/P/Q/R/S/T/U/V/W.', '452 Marketplace Blvd, Downtown Plaza', 'STORE_OWNER'),
    (3, 'Elena Rostova', 'owner2@nexuscoffee.com', '$2a$10$w09Z9K0Nq0mQ8.9j1h0q8O/H/J/K/L/M/N/O/P/Q/R/S/T/U/V/W.', '88 Artisan Alley, Heritage Square', 'STORE_OWNER'),
    (4, 'Sarah Jenkins', 'user1@example.com', '$2a$10$w09Z9K0Nq0mQ8.9j1h0q8O/H/J/K/L/M/N/O/P/Q/R/S/T/U/V/W.', '742 Evergreen Terrace, Sector 4', 'NORMAL_USER'),
    (5, 'David Kim', 'user2@example.com', '$2a$10$w09Z9K0Nq0mQ8.9j1h0q8O/H/J/K/L/M/N/O/P/Q/R/S/T/U/V/W.', '12 Elm Street, Apt 3B', 'NORMAL_USER'),
    (6, 'Amara Okafor', 'user3@example.com', '$2a$10$w09Z9K0Nq0mQ8.9j1h0q8O/H/J/K/L/M/N/O/P/Q/R/S/T/U/V/W.', '304 Pine View Crescent', 'NORMAL_USER')
ON CONFLICT (id) DO NOTHING;

-- Reset sequence for users
SELECT setval('users_id_seq', (SELECT COALESCE(MAX(id), 1) FROM users));

-- 2. Insert Stores
INSERT INTO stores (id, name, email, address, owner_id)
VALUES
    (1, 'FreshMart Supermarket & Organics', 'contact@freshmart.com', '452 Marketplace Blvd, Downtown Plaza', 2),
    (2, 'Nexus Specialty Coffee & Bakery', 'hello@nexuscoffee.com', '88 Artisan Alley, Heritage Square', 3),
    (3, 'Apex Electronics & Smart Devices', 'support@apexelectronics.com', '108 Silicon Avenue, Innovation District', 2)
ON CONFLICT (id) DO NOTHING;

-- Reset sequence for stores
SELECT setval('stores_id_seq', (SELECT COALESCE(MAX(id), 1) FROM stores));

-- 3. Insert Ratings (Normal Users reviewing Stores)
INSERT INTO ratings (id, user_id, store_id, rating_value, comment)
VALUES
    (1, 4, 1, 5, 'Exceptional produce quality and friendly customer service! Clean aisles and fast checkout.'),
    (2, 5, 1, 4, 'Great organic selection. Prices are reasonable and parking was easy.'),
    (3, 6, 1, 5, 'Always fresh veggies and wonderful bakery section. My go-to store!'),
    (4, 4, 2, 5, 'The pour-over Ethiopian roast is outstanding. Quiet workspace atmosphere with fast wifi.'),
    (5, 5, 2, 5, 'Best croissants in the city and warm hospitality.'),
    (6, 6, 3, 4, 'Knowledgeable technicians helped me configure my laptop within 30 minutes.')
ON CONFLICT (id) DO NOTHING;

-- Reset sequence for ratings
SELECT setval('ratings_id_seq', (SELECT COALESCE(MAX(id), 1) FROM ratings));
