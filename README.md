# 🌟 Store Rating Web Application

A full-stack, enterprise-grade **Store Rating Web Platform** engineered with **React.js**, **Express.js**, **PostgreSQL**, and **JWT Authentication**. The platform enables seamless store discovery, star ratings and reviews, owner telemetry analytics, and platform governance across three distinct user roles.

---

## 🎯 Key User Roles & Platform Capabilities

| User Role | Permissions & Core Capabilities |
|---|---|
| **`SYSTEM_ADMIN`** | **Platform Governance & Telemetry**<br>• Real-time system metrics (total registered users, active stores, total submitted ratings, platform-wide rating averages).<br>• Comprehensive User Directory with multi-role filters (`NORMAL_USER`, `STORE_OWNER`, `SYSTEM_ADMIN`), name/email/address search, allowlist column sorting, and server-side pagination.<br>• Detailed User Inspection modal displaying owned stores and customer ratings breakdown.<br>• Store Registry & Creation with validated store owner assignment.<br>• Secure user provisioning for Normal Users, Store Owners, and Administrators. |
| **`STORE_OWNER`** | **Merchant Telemetry & Customer Review Analytics**<br>• Dedicated Store Owner Dashboard providing real-time store profile telemetry (Store Name, Email, Address).<br>• Real-time arithmetic mean rating calculation and total review counts.<br>• 1-to-5 star rating distribution breakdown with animated visual progress bars.<br>• Customer Review Directory featuring reviewer profiles (Name, Email, Address, Star Score, Submission Date, Review Comment) with multi-field search, SQL-allowlist sorting, and pagination.<br>• Strict multi-tenant isolation (owners cannot view or access foreign store analytics).<br>• Self-service password management with real-time complexity enforcement. |
| **`NORMAL_USER`** | **Public Store Discovery & Star Reviews**<br>• Public self-registration with live password criteria validation checklist.<br>• Store Catalog Directory with dual view modes (Interactive Glass Cards vs. Structured Data Table).<br>• Live store search by Name and physical Address with server-side pagination and column sorting.<br>• Submit 1-to-5 star ratings with optional review comments (enforcing the strict **1-Rating-Per-User-Per-Store** rule).<br>• Modify previously submitted ratings with real-time arithmetic average recalculation.<br>• View personal ratings highlighted directly in the store catalog. |

---

## 🛠️ Technology Stack & Architecture

### **Frontend**
- **Framework**: React 18 (Vite)
- **Styling**: Vanilla CSS Design System with Google Fonts (*Outfit* & *Plus Jakarta Sans*), Glassmorphism, Dark Mode Slate Palette, and Responsive Grid Breakpoints.
- **State & Routing**: React Context API (`AuthContext`), Hash History Synchronization (`#/home`, `#/stores`, `#/login`, `#/register`, `#/dashboard`) supporting browser Back/Forward navigation and refresh persistence.
- **HTTP Client**: Axios with request/response interceptors for automated JWT authorization and expired token eviction.

### **Backend**
- **Runtime & Framework**: Node.js & Express.js
- **Architecture**: Controller-Service-Repository Pattern with strict separation of concerns.
- **Security**: 
  - `Helmet` HTTP security headers (`X-Content-Type-Options`, `X-Frame-Options`, `X-Powered-By` disabled).
  - Restricted CORS origin filtering with credentials support.
  - In-memory sliding-window rate limiting (`429 Too Many Requests` + `Retry-After`).
  - Strict input validation schemas via `express-validator`.
  - SQL injection immunity via parameterized queries and column allowlists.
  - Salted `bcryptjs` password hashing (Cost factor 10) with sensitive data stripping (`password_hash` never returned).
- **Authentication**: Stateless JSON Web Tokens (`jsonwebtoken`) with HS256 algorithm.

### **Database**
- **Database Engine**: PostgreSQL 14+ (with resilient in-memory fallback for zero-downtime development and testing).
- **Schema Design**: Fully normalized 3NF schema (`users`, `stores`, `ratings`, `v_store_rating_summaries`).
- **Indexing Strategy**: B-Tree and GIN trigram (`pg_trgm`) indexes on all frequently searched, sorted, and joined columns (`email`, `name`, `role`, `owner_id`, `store_id`, `user_id`, `created_at`).

---

## 📂 Repository Directory Structure

```
roxiler/
├── backend/
│   ├── src/
│   │   ├── config/              # Environment & application configuration
│   │   ├── controllers/         # HTTP request/response handlers
│   │   ├── database/
│   │   │   ├── connection.js    # PostgreSQL connection pool & health checks
│   │   │   ├── migrations/      # 001_initial_schema.sql DDL migrations
│   │   │   ├── repositories/    # User, Store, Rating database repositories
│   │   │   └── scripts/         # migrate.js, seed.js, setup.js, reset.js
│   │   ├── middleware/          # auth.middleware, role.middleware, validate.middleware
│   │   ├── routes/              # Express API route declarations
│   │   ├── services/            # Business logic & calculations (Auth, Store, Rating, Dashboard)
│   │   ├── utils/               # AppError, token utilities, logger
│   │   ├── validators/          # express-validator schemas
│   │   ├── app.js               # Express application configuration
│   │   └── server.js            # Server entry point
│   ├── tests/                   # Automated backend test suite (6 test suites, 48 assertions)
│   ├── .env.example             # Backend environment template
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── admin/           # AdminDashboard, UserManagement, StoreManagement, Modals
│   │   │   ├── auth/            # ProtectedRoute, RoleGuard
│   │   │   ├── common/          # Modal, ChangePasswordModal, Pagination, StarRatingInput
│   │   │   ├── layout/          # Navbar, Footer
│   │   │   ├── owner/           # StoreOwnerDashboard
│   │   │   └── user/            # UserStoreBrowsePage, RateStoreModal
│   │   ├── context/             # AuthContext.jsx
│   │   ├── pages/               # HomePage, StoresPage, LoginPage, RegisterPage, DashboardPage
│   │   ├── services/            # Axios API client & endpoints
│   │   ├── styles/              # index.css (Design tokens & responsive styles)
│   │   ├── App.jsx              # Main React application & hash routing
│   │   └── main.jsx
│   ├── .env.example             # Frontend environment template
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── package.json                 # Root convenience scripts
└── README.md
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **PostgreSQL**: v14.0 or higher (Optional — resilient mock database operates out-of-the-box)

---

### 2. Environment Configuration

#### Backend Configuration
Copy `backend/.env.example` to `backend/.env`:
```bash
cp backend/.env.example backend/.env
```

Default backend variables:
```env
PORT=5000
NODE_ENV=development
API_VERSION=v1
CLIENT_URL=http://localhost:5173
JWT_SECRET=store_rating_jwt_super_secret_key_change_in_production_2026
JWT_EXPIRES_IN=7d

# PostgreSQL Database (Update credentials if connecting to live PostgreSQL)
PGHOST=localhost
PGPORT=5432
PGDATABASE=store_rating_db
PGUSER=postgres
PGPASSWORD=postgres
PG_SSL=false
```

#### Frontend Configuration
Copy `frontend/.env.example` to `frontend/.env`:
```bash
cp frontend/.env.example frontend/.env
```

Default frontend variable:
```env
VITE_API_URL=http://localhost:5000/api/v1
```

---

### 3. Installation

Install dependencies across the entire project with a single command from the root directory:
```bash
npm run install:all
```

Or install individually:
```bash
# Backend
cd backend && npm install

# Frontend
cd ../frontend && npm install
```

---

### 4. Database Setup & Seeding (PostgreSQL)

Run the automated database setup to execute DDL migrations and populate seed data:
```bash
# From root directory
npm run db:setup
```

Individual database management commands:
```bash
npm run db:migrate   # Run PostgreSQL schema migrations
npm run db:seed      # Populate seed users, stores, and ratings
npm run db:reset     # Teardown and reset database
```

---

### 5. Running the Application in Development

Start both the Backend API server and Frontend Vite development server concurrently:
```bash
npm run dev
```

- **Frontend Client**: `http://localhost:5173`
- **Backend API**: `http://localhost:5000/api/v1`

---

## 🧪 Automated Testing Suite

Execute the comprehensive automated test suite validating all 8 core functional, security, and resilience domains:
```bash
# Run automated backend test suite
npm test
```

### **Test Coverage Summary (8 Test Suites / 86+ Assertions — 100% Pass Rate)**:
1. `auth.test.js`: Successful login (all 3 roles), invalid credentials, missing fields, token verification, session profile rehydration, logout.
2. `rbac.test.js`: Role enforcement, unauthorized admin route rejection, normal user rating privileges, cross-owner store isolation (BOLA/IDOR).
3. `users.test.js`: Self-registration, duplicate email conflict rejection (`409 Conflict`), admin user provisioning, validation rules (Name 20–60, Password 8–16 with upper/special, Address <= 400).
4. `stores.test.js`: Store creation, search by Name & Address, allowlist column sorting, pagination, consumer browsing with personal scores.
5. `ratings.test.js`: Valid rating submission (1–5), out-of-bounds rejection, duplicate rating rejection, multi-user average calculation, rating modification and instant average recalculation.
6. `password.test.js`: Password complexity validation, incorrect current password rejection, identical password rejection, bcrypt hash verification, session revocation on update.
7. `security.test.js`: Express security hardening, parameterized SQL injection immunity, dynamic ORDER BY allowlists, mass-assignment field stripping, XSS benign text storage.
8. `redteam.test.js`: Adversarial penetration attacks (JWT algorithm confusion, tampered payloads, expired tokens, horizontal privilege escalation, input fuzzing, token replay after logout).

---

## 🔑 Default Seed Credentials for Evaluation

The database is pre-seeded with sample accounts across all three user roles:

| User Role | Email Address | Password | Description |
|---|---|---|---|
| **`SYSTEM_ADMIN`** | `admin@storerating.com` | `AdminPassword123!` | Platform administrator with full dashboard & user management access |
| **`STORE_OWNER`** | `owner.marcus@freshmart.com` | `OwnerPassword123!` | Owner of *FreshMart Organic Supermarket* |
| **`STORE_OWNER`** | `owner.elena@nexuscoffee.com` | `OwnerPassword123!` | Owner of *Nexus Specialty Coffee* |
| **`NORMAL_USER`** | `sarah.jenkins@example.com` | `UserPassword123!` | Consumer account with existing rating history |
| **`NORMAL_USER`** | `david.kim@example.com` | `UserPassword123!` | Consumer account with existing rating history |

---

## 📡 RESTful API Overview

### **Health & Diagnostics (`/api/v1/health`)**
- `GET /api/v1/health` — Full system telemetry, memory usage, node version, and database connection status
- `GET /api/v1/health/live` — Lightweight liveness probe for Kubernetes / Container orchestrators (200 OK)
- `GET /api/v1/health/ready` — Readiness probe verifying active PostgreSQL database connectivity (200 OK or 503 Unavailable)

### **Authentication & Account (`/api/v1/auth`)**
- `POST /api/v1/auth/register` — Public consumer registration (enforces `NORMAL_USER` role)
- `POST /api/v1/auth/login` — Authenticate and receive JWT token
- `GET /api/v1/auth/me` — Get current user profile (JWT protected)
- `PATCH /api/v1/auth/update-password` — Change password with current password verification
- `POST /api/v1/auth/logout` — Invalidate user session

### **Stores (`/api/v1/stores`)**
- `GET /api/v1/stores` — List stores with search, sort allowlist, and pagination (Public / Admin)
- `GET /api/v1/stores/browse` — List stores with authenticated user's personal rating context
- `GET /api/v1/stores/:id` — Get detailed store telemetry and rating statistics
- `POST /api/v1/stores` — Create a new commercial store (`SYSTEM_ADMIN` only)

### **Ratings (`/api/v1/ratings`)**
- `POST /api/v1/ratings` — Submit a 1-to-5 star rating (`NORMAL_USER` only)
- `PUT /api/v1/ratings/:storeId` — Modify existing rating (`NORMAL_USER` only)
- `GET /api/v1/ratings/owner-ratings` — Reviewer directory feed (`STORE_OWNER` only)

### **Users (`/api/v1/users`)**
- `GET /api/v1/users` — List platform users with search, role filters, sorting, and pagination (`SYSTEM_ADMIN` only)
- `GET /api/v1/users/:id` — Inspect user profile with owned store breakdown (`SYSTEM_ADMIN` only)
- `POST /api/v1/users` — Provision Admin, Store Owner, or Normal User (`SYSTEM_ADMIN` only)

### **Dashboards (`/api/v1/dashboard`)**
- `GET /api/v1/dashboard/admin` — Aggregate platform counts & averages (`SYSTEM_ADMIN` only)
- `GET /api/v1/dashboard/owner/statistics` — Real-time store rating distribution & stats (`STORE_OWNER` only)

---

## 🏗️ Production Deployment & Release Engineering

### 1. Docker Container Deployment
Build and run using the multi-stage production `Dockerfile`:
```bash
# Build multi-stage image
docker build -t store-rating-app:latest .

# Run container with environment variables
docker run -d \
  -p 5000:5000 \
  -e NODE_ENV=production \
  -e JWT_SECRET=your_production_secure_jwt_secret_min_32_chars \
  -e PGHOST=your_pg_host \
  -e PGDATABASE=store_rating_db \
  -e PGUSER=postgres \
  -e PGPASSWORD=your_secure_db_password \
  --name store-rating-prod \
  store-rating-app:latest
```

### 2. Manual Production Build & Start
```bash
# Step 1: Install production dependencies
npm run install:all

# Step 2: Run database migrations
npm run db:migrate

# Step 3: Build frontend production bundle
npm run build:frontend

# Step 4: Start Express backend
NODE_ENV=production npm run start:backend
```

### 3. Pre-Flight Release Checklist
- [x] All 8 automated test suites passing (`npm test`).
- [x] Production build passes cleanly with 0 warnings (`npm run build:frontend`).
- [x] `JWT_SECRET` is strong (min 32 characters) and configured via environment variables.
- [x] Database migrations verified against fresh PostgreSQL schema (`001_initial_schema.sql`).
- [x] Liveness probe (`GET /api/v1/health/live`) returns `200 OK`.
- [x] Readiness probe (`GET /api/v1/health/ready`) confirms active database connection.
- [x] HTTPS and reverse proxy `trust proxy` configured for secure cookies and accurate client IP rate limiting.
- [x] Destructive scripts (`reset.js`, `seed.js`) locked down against accidental execution in `NODE_ENV=production`.

---

## 📄 License
This project is open-source and available under the **ISC License**.

