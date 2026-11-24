# AssessmentPro – Enterprise Aptitude Assessment Dashboard

An enterprise-grade, full-stack recruitment assessment platform engineered for corporate graduate and early-career hiring. AssessmentPro features a candidate-facing distraction-free test delivery engine with live server-side countdown timers, tamper-proof auto-saving, randomized question sequences, negative marking, and an administrative telemetry suite featuring Recharts analytics, immutable question snapshots, and CSV audit exports with formula injection safeguards.

---

## 1. Quick Reference & Demo Credentials

| Role | Access URL | Credentials |
| :--- | :--- | :--- |
| **Candidate Portal** | `/register` | Any valid name, email, 10-digit phone number, age 18–60 |
| **Admin Portal** | `/admin/login` | **Email:** `admin@assessment.com`<br/>**Password:** `Admin@123456` |

> *An **Auto-Fill Demo Credentials** button is provided on `/admin/login` for instant evaluator access.*

---

## 2. Technology Stack

- **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui-inspired components, Lucide React, Recharts, Axios, React Hook Form, Zod.
- **Backend:** Node.js, Express.js, TypeScript, Prisma ORM, PostgreSQL (Neon Serverless), JWT authentication, bcryptjs (10 salt rounds), Helmet security headers, CORS with credentials, express-rate-limit, Zod API validation.
- **Hosting Targets:** Vercel (Frontend), Render (Backend), Neon (PostgreSQL Database), GitHub Monorepo.

---

## 3. Project Structure (Monorepo)

```text
aptitude-assessment-dashboard/
│
├── frontend/                              # Next.js 14 App Router application
│   ├── src/
│   │   ├── app/
│   │   │   ├── admin/
│   │   │   │   ├── candidates/            # Candidate list, search, filter, CSV export
│   │   │   │   │   └── [id]/page.tsx      # Immutable question response audit view
│   │   │   │   ├── dashboard/page.tsx     # Recharts analytics & summary telemetry
│   │   │   │   ├── login/page.tsx         # Admin login with auto-fill helper
│   │   │   │   ├── questions/page.tsx     # Question bank CRUD & 10 active rules
│   │   │   │   └── settings/page.tsx      # Configurable duration & pass percentage
│   │   │   ├── instructions/page.tsx      # Real-time eligibility check & rules
│   │   │   ├── register/page.tsx          # Candidate verification with inline Zod validation
│   │   │   ├── result/[attemptId]/page.tsx# Scorecard report (+2 / -1 scoring & pass/fail)
│   │   │   ├── test/[attemptId]/page.tsx  # Timed assessment engine & answer persistence
│   │   │   ├── globals.css                # Corporate Tailwind design theme
│   │   │   ├── layout.tsx                 # Root layout & meta tags
│   │   │   └── page.tsx                   # Enterprise landing page
│   │   ├── components/
│   │   │   ├── ui/                        # Button, Input, Select, Card, Modal, Badge
│   │   │   ├── AdminLayout.tsx            # Protected sticky sidebar admin layout
│   │   │   └── Navbar.tsx                 # Responsive branding header
│   │   └── lib/
│   │       ├── api.ts                     # Axios client with auto /api normalization
│   │       ├── types.ts                   # Shared TypeScript definitions
│   │       └── utils.ts                   # Formatting & Tailwind class merging
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
├── backend/                               # Express.js REST API with Prisma ORM
│   ├── prisma/
│   │   ├── migrations/                    # Versioned database migrations
│   │   ├── schema.prisma                  # Relational database models & enums
│   │   ├── seed.ts                        # Seed: Admin, default settings, 10 corporate questions
│   │   └── tsconfig.json                  # Isolated TypeScript config for Prisma tooling
│   ├── src/
│   │   ├── config/                        # Prisma singleton & environment config
│   │   ├── controllers/                   # Candidate, Assessment, and Admin controllers
│   │   ├── middleware/                    # Auth (JWT/cookie), Zod validation, error handler
│   │   ├── routes/                        # REST endpoint routers
│   │   ├── services/                      # Business logic, scoring, and CSV streaming
│   │   ├── types/                         # Express & JWT interfaces
│   │   ├── validators/                    # Zod input schemas
│   │   └── index.ts                       # Express server entrypoint
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
├── package.json                           # Root monorepo workspace scripts
├── .gitignore
└── README.md
```

---

## 4. Setup and Run Steps

### Prerequisites
- **Node.js:** v18+ (tested on Node v20/v22)
- **npm:** v9+
- **PostgreSQL:** Local PostgreSQL 14+ instance OR a free cloud instance from [Neon](https://console.neon.tech).

### Step 1: Clone Repository
```bash
git clone https://github.com/revathibaskar/aptitude-assessment-dashboard.git
cd aptitude-assessment-dashboard
```

### Step 2: Backend Setup
```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env and set your DATABASE_URL and JWT_SECRET (see Environment Variables section below)

# Run Prisma migration to create database tables
npm run prisma:generate
npm run prisma:migrate

# Seed the database (creates admin@assessment.com, settings, and 10 corporate questions)
npm run prisma:seed

# Start backend development server
npm run dev
# Backend runs on http://localhost:5001
```

### Step 3: Frontend Setup
```bash
# In a new terminal, navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local
# Default NEXT_PUBLIC_API_URL is http://localhost:5001/api

# Start frontend development server
npm run dev
# Frontend runs on http://localhost:3000 (or http://localhost:3001)
```

---

## 5. Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Example Value |
| :--- | :--- | :--- |
| `PORT` | Port for Express server | `5001` |
| `NODE_ENV` | Runtime environment | `development` (or `production`) |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/aptitude_assessment?schema=public` |
| `JWT_SECRET` | 32+ character key for JWT token signing | `a81a24634173b57febd4e43e54eac982ad10e39902d3b0db67ee296a0b377a48` |
| `FRONTEND_URL` | Client origin URL for CORS whitelist | `http://localhost:3000` (or `https://your-app.vercel.app`) |

### Frontend (`frontend/.env.local`)

| Variable | Description | Example Value |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | Backend REST API base URL | `http://localhost:5001/api` (or `https://your-backend.onrender.com/api`) |

---

## 6. Admin Credentials

| Role | Email | Password |
| :--- | :--- | :--- |
| **System Administrator** | `admin@assessment.com` | `Admin@123456` |

- Passwords are encrypted with **bcrypt** (10 salt rounds). Plaintext passwords are never stored.
- JWT tokens are issued upon authentication and persisted in **HTTP-only secure cookies** (`token`), with bearer header support.
- Rate limiter active: Maximum 15 login attempts per 15-minute window.

---

## 7. Database Schema Explanation

Defined in `backend/prisma/schema.prisma` with relational integrity:

```mermaid
erDiagram
    Candidate ||--o{ TestAttempt : "takes"
    TestAttempt ||--|{ AttemptQuestion : "contains snapshots"
    Question ||--o{ AttemptQuestion : "referenced by"
    Admin ||--o{ Admin : "authenticates"
    TestSetting ||--o{ TestSetting : "configures"
```

1. **`Admin` (`admins` table):**
   - Stores administrator credentials with `passwordHash` (bcrypt) and unique email index.
2. **`Candidate` (`candidates` table):**
   - Profile: `fullName`, unique `email`, `age`, `phoneNumber`, `gender`, `highestQualification`, `city`, and lifecycle `status` (`REGISTERED`, `IN_PROGRESS`, `COMPLETED`).
   - Prevents duplicate assessment attempts.
3. **`Question` (`questions` table):**
   - Master question bank: `text`, `optionA`, `optionB`, `optionC`, `optionD`, `correctOption` (A/B/C/D), `category` (QUANTITATIVE, LOGICAL_REASONING, VERBAL), `difficulty` (EASY, MEDIUM, HARD), `explanation`, and `isActive` boolean.
4. **`TestSetting` (`test_settings` table):**
   - Platform configurations: `durationMinutes` (default 15) and `passPercentage` (default 60.0).
5. **`TestAttempt` (`test_attempts` table):**
   - Session record: `candidateId`, `startedAt`, server-enforced `deadlineAt`, `completedAt`, immutable snapshots of `durationMinutes` and `passPercentage`, and calculated metrics: `totalScore`, `percentage`, `correctCount`, `incorrectCount`, `unattemptedCount`, `marksDeducted`, and `isPassed`.
6. **`AttemptQuestion` (`attempt_questions` table):**
   - **Immutable Question Snapshot:** Stores exact copy of question text, options A–D, correct answer, category, and explanation at the time the candidate started the test.
   - Candidate response: `selectedOption`, `isMarkedForReview`, `answeredAt`, `isCorrect`, and `marksAwarded` (+2.0, -1.0, or 0.0).
   - **Crucial Architecture:** If questions are later edited or deleted from the Question Bank, past attempts remain 100% historically intact.

---

## 8. AI Tool(s) Used and Key Prompts

### AI Tools Utilized:
- **Google Antigravity AI (Google DeepMind):** Used as lead architect and QA engineer for end-to-end full-stack implementation, Prisma schema modeling, optimistic state synchronization, sticky responsive UI architecture, and defense-in-depth security.
- **Gemini 3.8 / Claude 3.5 Sonnet:** Used for drafting original, mathematically sound graduate-level corporate aptitude questions, proving unique defensible answers, and modeling realistic distractors.

### Key Prompts Employed:

1. **Full-Stack Architecture & Monorepo Prompt:**
   > *"Act as a senior full-stack developer, UI/UX designer, database architect and QA engineer. Build an enterprise corporate aptitude assessment dashboard in a monorepo (frontend Next.js App Router, backend Express Prisma PostgreSQL). Implement candidate registration with validation, 10-question timed test engine with +2/-1/0 marking, tamper-proof question snapshots, and an admin command center with Recharts, CSV export, and settings."*

2. **Immutable Snapshot & Business Rule Prompt:**
   > *"Design a Prisma schema and backend service that enforces: 1) Exactly 10 active questions must be available to start a test with at least 3 in Quantitative, 3 in Logical Reasoning, and 3 in Verbal; 2) Candidate attempts must store an immutable snapshot of question text, options, and settings so deleting or editing questions in the master bank never mutates past candidate results."*

3. **Corporate Aptitude Question Creation & Verification Prompt:**
   > *"Formulate seven original, graduate-level corporate aptitude questions across Quantitative (percentages, break-even, profit margins), Logical Reasoning (arrangements, assumptions, deductive logic), and Verbal (parallelism, precision, subject-verb agreement) with multi-step reasoning, exactly one defensible correct answer, common calculation error distractors, and a full mathematical/logical proof."*

4. **Security & CSV Injection Defense Prompt:**
   > *"Implement defense-in-depth protection against CSV formula injection (`=`, `+`, `-`, `@`, `\t`, `\r`) when streaming filtered candidate results to RFC 4180 CSV, and ensure correct options and explanations are never sent to candidate browsers prior to submission."*

---

## 9. Assumptions and Limitations

1. **One Attempt Per Email:** Each candidate email address is restricted to a single test session. If an email has an active `IN_PROGRESS` attempt, they are allowed to resume their session; if already `COMPLETED`, further attempts are blocked and they can view their completed scorecard.
2. **Strict Active Question Requirement:** An assessment can only be initiated when exactly 10 questions are marked active in the database and include at least 3 questions in each of the three core categories (Quantitative, Logical Reasoning, and Verbal).
3. **Negative Marking & Scoring Formula:**
   - Raw Score = `(Correct × 2) - (Incorrect × 1)`. Maximum possible raw score = 20.
   - Percentage = `(Net Score / 20) × 100`.
   - Negative net scores and percentages are fully supported (e.g., 0 correct and 10 wrong yields -10 / 20 = -50%).
4. **Time Zone Standard:** All timestamps (`startedAt`, `deadlineAt`, `completedAt`) are calculated in UTC on the backend and rendered localized in candidate and admin browsers.

---

## 10. Deployment Guide (Vercel & Render)

### Backend Deployment on Render:
1. Create a **Web Service** on [Render](https://dashboard.render.com).
2. Connect your GitHub repository.
3. Configure settings:
   - **Root Directory:** `backend` ⚠️ *(Crucial)*
   - **Environment:** `Node`
   - **Build Command:**
     ```bash
     npm install && npx prisma generate && npx prisma migrate deploy && npm run prisma:seed && npm run build
     ```
   - **Start Command:**
     ```bash
     node dist/index.js
     ```
4. Add Environment Variables:
   - `DATABASE_URL`: Connection string from Neon PostgreSQL.
   - `JWT_SECRET`: Random 32+ character string.
   - `NODE_ENV`: `production`
   - `FRONTEND_URL`: Your deployed Vercel URL (e.g. `https://your-app.vercel.app`).

### Frontend Deployment on Vercel:
1. Import your GitHub repository on [Vercel](https://vercel.com).
2. Configure settings:
   - **Root Directory:** `frontend` ⚠️ *(Crucial)*
   - **Framework Preset:** `Next.js`
3. Add Environment Variable:
   - `NEXT_PUBLIC_API_URL`: Your Render backend URL ending in `/api` (e.g. `https://your-backend.onrender.com/api`).
4. Click **Deploy**.
