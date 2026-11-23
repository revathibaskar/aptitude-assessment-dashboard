# AssessmentPro – Enterprise Aptitude Assessment Dashboard

An enterprise-grade, full-stack recruitment assessment platform engineered for corporate graduate and early-career hiring. AssessmentPro features a candidate-facing distraction-free test delivery engine with live server-side countdown timers, tamper-proof auto-saving, randomized question sequences, negative marking, and an administrative telemetry suite featuring Recharts analytics, immutable question snapshots, and CSV audit exports with formula injection safeguards.

---

## 1. Project Overview

AssessmentPro was architected to fulfill the Full Stack Developer and AI Specialist assignment requirements. The platform provides:
- **Candidate Module:** Registration with validation, interactive instructions with live eligibility checks, single-question delivery, 10-question palette with review indicators, server-enforced countdown timer, negative marking (+2 for correct, -1 for wrong, 0 for unattempted), and instant score reporting.
- **Admin Module:** JWT + bcrypt authenticated portal, executive dashboard with Recharts visualizations (score distributions and pass/fail ratios), question bank management with active question constraints (strictly 10 active questions across Quantitative, Logical Reasoning, and Verbal domains), candidate result audit logs with immutable question snapshots, CSV data exports, and configurable assessment settings (duration and pass percentage).

---

## 2. Technology Stack

### Frontend Application (`frontend/`)
- **Framework:** Next.js 14 (App Router, Server & Client Components)
- **Language:** TypeScript
- **Styling:** Tailwind CSS with custom corporate design system
- **UI Components:** Modular accessible components inspired by shadcn/ui
- **Icons:** Lucide React
- **Data Visualization:** Recharts (BarChart, PieChart, ResponsiveContainer)
- **Data Fetching:** Axios with HTTP-only cookie support and request/response interceptors
- **Form Management & Validation:** React Hook Form with Zod schema resolvers

### Backend Application (`backend/`)
- **Runtime & Framework:** Node.js, Express.js
- **Language:** TypeScript
- **Database & ORM:** PostgreSQL, Prisma ORM
- **Security:** Helmet, CORS (with origin white-listing and credentials), express-rate-limit, cookie-parser
- **Authentication:** JSON Web Tokens (JWT) stored in HTTP-only secure cookies with fallback Authorization header support, bcryptjs password hashing (10 salt rounds)
- **Input Validation:** Zod schemas applied via centralized Express middleware

### Cloud & Database Hosting
- **Frontend Hosting:** Vercel
- **Backend Hosting:** Render
- **Database:** Neon Serverless PostgreSQL (or local PostgreSQL)
- **Repository:** GitHub monorepo structure

---

## 3. Folder Structure

```text
aptitude-assessment-dashboard/
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── admin/
│   │   │   │   ├── candidates/
│   │   │   │   │   ├── [id]/page.tsx      # Candidate detail & audit log
│   │   │   │   │   └── page.tsx           # Search, filter, sort, pagination, CSV export
│   │   │   │   ├── dashboard/page.tsx     # Executive metrics & Recharts graphs
│   │   │   │   ├── login/page.tsx         # Admin authentication with demo credentials
│   │   │   │   ├── questions/page.tsx     # Question bank CRUD & active constraints
│   │   │   │   └── settings/page.tsx      # Test duration & pass percentage settings
│   │   │   ├── instructions/page.tsx      # Assessment instructions & eligibility check
│   │   │   ├── register/page.tsx          # Candidate registration with inline validation
│   │   │   ├── result/[attemptId]/page.tsx# Scorecard report (+2 / -1 scoring & pass/fail)
│   │   │   ├── test/[attemptId]/page.tsx  # Timed assessment engine & answer persistence
│   │   │   ├── globals.css                # Corporate Tailwind design theme
│   │   │   ├── layout.tsx                 # Root layout & meta tags
│   │   │   └── page.tsx                   # Enterprise landing page
│   │   ├── components/
│   │   │   ├── ui/                        # Button, Input, Select, Card, Modal, Badge
│   │   │   ├── AdminLayout.tsx            # Protected admin layout with sidebar
│   │   │   └── Navbar.tsx                 # Responsive header
│   │   └── lib/
│   │       ├── api.ts                     # Axios client with credentials & interceptors
│   │       ├── types.ts                   # Shared TypeScript interfaces
│   │       └── utils.ts                   # Formatting and CSS class merge utilities
│   ├── .env.example
│   ├── next.config.mjs
│   ├── package.json
│   ├── tailwind.config.ts
│   └── tsconfig.json
│
├── backend/
│   ├── prisma/
│   │   ├── migrations/                    # Versioned database migrations
│   │   ├── schema.prisma                  # Relational database models & enums
│   │   └── seed.ts                        # Admin, settings, and 10 corporate questions
│   ├── src/
│   │   ├── config/                        # Database singleton & environment variables
│   │   ├── controllers/                   # Candidate, Assessment, and Admin controllers
│   │   ├── middleware/                    # Auth, Zod validation, error handling
│   │   ├── routes/                        # REST endpoint routers
│   │   ├── services/                      # Core business logic & scoring algorithms
│   │   ├── types/                         # Express & JWT types
│   │   ├── validators/                    # Zod input schemas
│   │   └── index.ts                       # Express application entrypoint
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
├── package.json                           # Root monorepo workspace scripts
├── .gitignore
└── README.md                              # Technical documentation
```

---

## 4. Key Features

### Candidate Assessment Flow
1. **Validation & Verification:**
   - Full Name (letters and spaces only, 2–50 characters).
   - Email ID (strict format, one attempt limit).
   - Age (18–60 years).
   - Phone Number (exactly 10 digits).
   - Gender, Highest Qualification dropdown, and City.
   - Prevents duplicate assessment attempts gracefully with links to view prior results.
2. **Eligibility & Instructions:**
   - Real-time check verifying that exactly 10 active questions exist in the database with balanced categories before permitting test initialization.
   - Transparent marking scheme (+2 for correct, -1 for incorrect, 0 for unattempted).
3. **Timed Test Engine:**
   - Single-question focus with seamless Previous/Next navigation.
   - Interactive 1–10 palette with distinct indicators: Answered (Emerald), Unanswered (Slate), Marked for Review (Amber), and Current Question (Indigo ring).
   - Server-enforced countdown timer that auto-submits when time reaches 00:00.
   - Live backend synchronization upon option selection.
   - Accidental refresh recovery: questions, answers, and remaining time are preserved.
   - Shuffled question order personalized for each candidate.
   - Tamper-proof security: correct options and explanations are never sent to the browser before submission.
4. **Scoring & Performance Report:**
   - Raw Score = `(Correct × 2) - (Incorrect × 1)`.
   - Percentage = `(Net Score / 20) × 100` (Negative net scores and percentages supported).
   - Dynamic Pass/Fail status based on administrative pass percentage benchmark.
   - Printable candidate scorecard.

### Administrative Command Center
1. **Secure Admin Authentication:**
   - Email and password verification against bcrypt hashes.
   - Signed JSON Web Tokens (JWT) stored in HTTP-only secure cookies with rate limiting on login attempts.
2. **Executive Telemetry Dashboard:**
   - Total Candidates, Tests Completed, Average Score, Pass Rate, and Highest Score cards.
   - Recharts Score Distribution Bar Chart and Pass/Fail Donut Chart.
   - Real-time database telemetry without hardcoded mocks.
3. **Question Bank Management:**
   - Full CRUD: Add, edit, delete, activate, and deactivate questions.
   - Hard business rule enforcement: Strictly 10 active questions required (cannot exceed 10 active questions; cannot start tests with fewer than 10).
   - Category distribution rule (at least 3 questions in Quantitative, Logical Reasoning, and Verbal).
   - Question snapshots ensure historical tests remain immutable even if questions are later modified or removed.
4. **Candidate Records & CSV Auditing:**
   - Real-time search by candidate name or email.
   - Filtering by Pass/Fail status.
   - Sorting by score, date of attempt, or name.
   - Server-side pagination (10 records per page).
   - Candidate detail view with question-by-question response breakdown.
   - CSV export protected against CSV formula injection (`=`, `+`, `-`, `@`, `\t`, `\r`).
5. **Configurable Settings:**
   - Dynamic update of test duration (minutes) and pass percentage.
   - Employs snapshotting so existing attempts preserve their historical settings.

---

## 5. Frontend Setup Instructions

```bash
# Navigate to the frontend directory
cd frontend

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env.local

# Run development server
npm run dev
# The frontend will be available at http://localhost:3000 (or http://localhost:3001)

# Build for production
npm run build
npm run start
```

---

## 6. Backend Setup Instructions

```bash
# Navigate to the backend directory
cd backend

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env

# Run Prisma migration & seed
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed

# Run development server
npm run dev
# The backend will be available at http://localhost:5001
```

---

## 7. Environment Variables

### Backend (`backend/.env`)
```env
PORT=5001
NODE_ENV=development
DATABASE_URL="postgresql://username:password@localhost:5432/aptitude_assessment?schema=public"
JWT_SECRET="super-secret-jwt-key-change-in-production-random32chars"
FRONTEND_URL="http://localhost:3000"
```

### Frontend (`frontend/.env.local`)
```env
NEXT_PUBLIC_API_URL="http://localhost:5001/api"
```

---

## 8. Neon PostgreSQL Configuration

To deploy using Neon Serverless PostgreSQL:
1. Log in to [Neon Console](https://console.neon.tech) and create a project (e.g., `aptitude-assessment`).
2. Copy the pooled connection string provided in the Neon dashboard:
   ```text
   postgresql://[user]:[password]@[endpoint].neon.tech/neondb?sslmode=require
   ```
3. Set `DATABASE_URL` in `backend/.env` (and in Render environment variables) to this connection string.
4. Run `npm run prisma:deploy` to apply the migrations to your Neon database.

---

## 9. Prisma Migration Commands

```bash
# Inside backend/
# Generate Prisma Client
npx prisma generate

# Create and apply migrations in development
npx prisma migrate dev --name init

# Deploy migrations to production (Neon/Render)
npx prisma migrate deploy

# Open Prisma Studio GUI
npx prisma studio
```

---

## 10. Database Seed Commands

```bash
# Inside backend/
npm run prisma:seed
```
This script creates:
1. Default Admin Account (`admin@assessment.com`).
2. Default Test Settings (15 minutes duration, 60% pass percentage).
3. 10 Verified Corporate Aptitude Questions across Quantitative, Logical Reasoning, and Verbal reasoning.

---

## 11. Admin Demo Credentials

| Role | Email | Password |
| :--- | :--- | :--- |
| **Platform Administrator** | `admin@assessment.com` | `Admin@123456` |

*An Auto-Fill helper button is provided on the admin login page (`/admin/login`) for convenience.*

---

## 12. Database Schema Explanation

The schema is defined in `backend/prisma/schema.prisma` with the following entities:

1. **`Admin` (`admins` table):**
   - Stores administrator credentials with `passwordHash` (bcrypt) and unique email index.
2. **`Candidate` (`candidates` table):**
   - Stores candidate profile: `fullName`, unique `email`, `age`, `phoneNumber`, `gender`, `highestQualification`, `city`, and lifecycle `status` (`REGISTERED`, `IN_PROGRESS`, `COMPLETED`).
3. **`Question` (`questions` table):**
   - Master bank of questions: `text`, `optionA`, `optionB`, `optionC`, `optionD`, `correctOption` (A/B/C/D), `category` (QUANTITATIVE, LOGICAL_REASONING, VERBAL), `difficulty` (EASY, MEDIUM, HARD), `explanation`, and `isActive` flag.
4. **`TestSetting` (`test_settings` table):**
   - Configurable test configuration: `durationMinutes` (default 15) and `passPercentage` (default 60.0).
5. **`TestAttempt` (`test_attempts` table):**
   - Individual test session record: foreign key to `candidateId`, `startedAt`, server-enforced `deadlineAt`, `completedAt`, snapshots of `durationMinutes` and `passPercentage`, and calculated fields: `totalScore`, `percentage`, `correctCount`, `incorrectCount`, `unattemptedCount`, `marksDeducted`, and `isPassed`.
6. **`AttemptQuestion` (`attempt_questions` table):**
   - Immutable snapshot of question content for a specific test attempt, storing `orderIndex` (1–10 shuffled order), full question text and options snapshots, candidate's `selectedOption`, `isMarkedForReview`, `isCorrect`, and `marksAwarded`.

---

## 13. API Endpoint Documentation

### Candidate & Assessment Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/candidates/register` | Validates and registers a new candidate. Prevents duplicate attempts. |
| `GET` | `/api/assessments/instructions` | Returns duration, marking scheme, and eligibility (`canStart`). |
| `POST` | `/api/assessments/start` | Initializes attempt, shuffles questions, and creates snapshot. |
| `GET` | `/api/assessments/:attemptId` | Returns current test state. Omits correct answers & explanations. |
| `PUT` | `/api/assessments/:attemptId/answers` | Saves candidate's selected answer in real-time. |
| `POST` | `/api/assessments/:attemptId/mark-review` | Toggles marked-for-review flag on a question. |
| `POST` | `/api/assessments/:attemptId/submit` | Calculates score server-side and locks the attempt. |
| `GET` | `/api/results/:attemptId` | Retrieves final verified score summary and breakdown. |

### Admin Endpoints (Protected by JWT)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/admin/login` | Authenticates administrator; issues HTTP-only JWT cookie. |
| `POST` | `/api/admin/logout` | Clears authentication session cookie. |
| `GET` | `/api/admin/me` | Validates session token and returns current admin profile. |
| `GET` | `/api/admin/dashboard` | Returns summary statistics and Recharts distribution data. |
| `GET` | `/api/admin/questions` | Lists all questions with category and active filters. |
| `POST` | `/api/admin/questions` | Adds question; enforces strictly 10 active questions rule. |
| `PUT` | `/api/admin/questions/:id` | Updates question details or toggles active status. |
| `DELETE` | `/api/admin/questions/:id` | Deletes question safely without corrupting past snapshots. |
| `GET` | `/api/admin/candidates` | Paginated candidate list with search, status filters, and sorting. |
| `GET` | `/api/admin/candidates/:id` | Full candidate audit report with question-by-question breakdown. |
| `GET` | `/api/admin/results/export` | Generates RFC 4180 CSV export with formula injection escaping. |
| `GET` | `/api/admin/settings` | Returns current assessment duration and pass percentage. |
| `PUT` | `/api/admin/settings` | Updates global duration and pass percentage settings. |

---

## 14. AI Coding Tools Used

- **Antigravity AI (Google DeepMind):** Used for end-to-end full-stack systems engineering, Prisma relational modeling, test engine architecture, and defensive validation design.
- **Claude / Gemini 3.8:** Used for designing original, rigorous corporate aptitude test problems with multi-step reasoning, mathematical verification, and distractor modeling.

---

## 15. Key AI Prompts Used

- *"Act as a senior full-stack developer, UI/UX designer, database architect and QA engineer to build an enterprise corporate aptitude assessment dashboard in a TypeScript monorepo with Next.js App Router and Express Prisma PostgreSQL."*
- *"Formulate seven original, graduate-level corporate aptitude questions across Quantitative (percentages, break-even, ratios), Logical Reasoning (arrangements, assumptions, deductive logic), and Verbal (parallelism, precision, subject-verb agreement) with multi-step proofs and plausible distractors."*
- *"Architect a tamper-proof question snapshot model in Prisma so that editing or deleting questions in Question Management never mutates past candidate results or audits."*
- *"Implement defense-in-depth protection against CSV formula injection (`=`, `+`, `-`, `@`, `\t`, `\r`) when streaming filtered candidate results."*

---

## 16. Assumptions and Limitations

1. **One Attempt Per Email:** Each candidate email address is restricted to a single test session. If an attempt is currently `IN_PROGRESS`, the candidate is redirected to resume their active session.
2. **Strict Active Question Requirement:** An assessment can only be initiated when exactly 10 questions are marked active in the database and have at least 3 questions in each of the three core categories.
3. **Negative Marking:** Net scores can fall below zero (e.g., 0 correct and 10 incorrect yields -10 / 20 = -50%). Both raw score and percentage calculations allow negative values as specified.
4. **Time Zone Standard:** All database timestamps (`startedAt`, `deadlineAt`, `completedAt`) are stored in UTC ISO 8601 format and rendered in the candidate's localized time.

---

## 17. Deployment Instructions (Vercel & Render)

### Backend Deployment (Render)
1. Push your repository to GitHub.
2. Log in to [Render](https://render.com) and create a **Web Service**.
3. Select your repository and specify:
   - **Root Directory:** `backend`
   - **Environment:** `Node`
   - **Build Command:** `npm install && npx prisma generate && npx prisma migrate deploy`
   - **Start Command:** `node dist/index.js`
4. Add Environment Variables:
   - `DATABASE_URL`: Connection string from Neon PostgreSQL.
   - `JWT_SECRET`: Random 32+ character secret string.
   - `NODE_ENV`: `production`
   - `FRONTEND_URL`: Your Vercel frontend URL (e.g., `https://your-app.vercel.app`).
5. Run the seed script once after first deploy:
   - In Render Shell: `npm run prisma:seed`

### Frontend Deployment (Vercel)
1. Log in to [Vercel](https://vercel.com) and import the repository.
2. Select `frontend` as the **Root Directory**.
3. Framework Preset: **Next.js**.
4. Configure Environment Variables:
   - `NEXT_PUBLIC_API_URL`: Your deployed Render backend URL (e.g., `https://your-api.onrender.com/api`).
5. Click **Deploy**.

