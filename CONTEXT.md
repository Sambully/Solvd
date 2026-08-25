# Solvd — Project Context & Comprehensive Documentation

> **AI-Powered NEET-UG Computer-Based Test (CBT) Generator & Practice Simulation Platform**  
> *Transform any syllabus notes, textbook chapters, coaching PDFs, and scanned pages into full-length, timed NEET-standard mock exams in seconds.*

---

## 1. Executive Summary & Vision

**Solvd** is an ed-tech test-preparation platform specifically designed for **NEET (National Eligibility cum Entrance Test - UG)** aspirants in India.

### The Core Problem
NEET aspirants often study from diverse materials (coaching modules, NCERT chapters, handwritten summary notes, class test papers), but lack an instant way to test themselves specifically on what they just studied with authentic NEET-standard Computer-Based Test (CBT) exam conditions.

### The Solution
With Solvd, a student can:
1. **Upload study materials** (PDFs, handwritten notes, textbook photos, problem sets).
2. **Customize exam parameters** (Question count: 10–45, Subject: Physics/Chemistry/Biology/Mixed, Difficulty: Foundation/NEET Standard/Rank Booster).
3. **Generate an authentic NEET mock exam** powered by multimodal Gemini LLMs in seconds.
4. **Attempt the exam under real CBT exam conditions**:
   - **Official NTA CBT Interface Mode** (pixel-authentic replication of the National Testing Agency examination software, with the 5-state palette, official color schemes, candidate console, and NTA action buttons).
   - **Modern Solvd UI** (sleek, minimalist dark/light design).
5. **Receive instant scoring & review** calculated using NEET's authentic `+4 / -1 / 0` marking scheme.
6. **Analyze performance** using a comprehensive performance analytics dashboard featuring score trajectories, negative marking impact, pacing gauges, difficulty mastery breakdowns, and AI tactical insights.

---

## 2. Technology Stack & Architecture

| Layer | Technology | Description |
| :--- | :--- | :--- |
| **Framework** | **Next.js 16 (App Router)** | Full-stack React framework with Server Actions and Route Handlers |
| **Frontend Library** | **React 19** | Component-driven UI with modern hooks (`useTransition`, `useRef`, `useState`, `useEffect`) |
| **Language** | **TypeScript 5** | Strict end-to-end type safety |
| **Styling** | **Tailwind CSS v4** | Modern utility-first CSS with dark/light mode support |
| **Database** | **PostgreSQL** | Relational database (compatible with Supabase / Neon / AWS RDS) |
| **ORM** | **Prisma 6** | Schema-driven data modeling, migrations, and type-safe queries |
| **Authentication** | **Clerk (`@clerk/nextjs`)** | User authentication, session management, and custom webhook/sync logic |
| **AI / LLM Engine** | **Google Gemini API (`@google/genai`)** | Multimodal exam generation with fallback cascading (`gemini-2.5-flash`, `gemini-2.0-flash`, `gemini-1.5-flash`) |
| **Schema Validation** | **Zod 4** | Strict parsing and validation of LLM JSON outputs and user inputs |
| **Icons** | **Lucide React** | Modern, accessible iconography |

---

## 3. Database Schema (`prisma/schema.prisma`)

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum SubscriptionTier {
  FREE
  TIER_5   // ₹150 for 5 exams
  TIER_10  // ₹250 for 10 exams
}

enum MaterialStatus {
  PROCESSING
  READY
  FAILED
}

enum ExamStatus {
  DRAFT
  ACTIVE
  SUBMITTED
  EXPIRED
}

enum Difficulty {
  EASY
  MEDIUM
  HARD
}

model User {
  id                String             @id @default(uuid())
  clerkId           String             @unique
  email             String             @unique
  name              String
  createdAt         DateTime           @default(now())

  subscription      Subscription?
  uploadedMaterials UploadedMaterial[]
  exams             Exam[]
  attempts          Attempt[]

  @@map("users")
}

model Subscription {
  id                  String           @id @default(uuid())
  userId              String           @unique
  user                User             @relation(fields: [userId], references: [id], onDelete: Cascade)
  tier                SubscriptionTier @default(FREE)
  examsUsedThisPeriod Int              @default(0)
  periodStart         DateTime         @default(now())
  paymentRef          String?

  @@map("subscriptions")
}

model UploadedMaterial {
  id            String         @id @default(uuid())
  userId        String
  user          User           @relation(fields: [userId], references: [id], onDelete: Cascade)
  fileName      String?
  fileUrl       String?
  extractedText String?
  status        MaterialStatus @default(PROCESSING)
  createdAt     DateTime       @default(now())

  exams         Exam[]

  @@index([userId])
  @@map("uploaded_materials")
}

model Exam {
  id              String           @id @default(uuid())
  materialId      String
  material        UploadedMaterial @relation(fields: [materialId], references: [id], onDelete: Cascade)
  userId          String
  user            User             @relation(fields: [userId], references: [id], onDelete: Cascade)
  title           String
  durationMinutes Int
  status          ExamStatus       @default(DRAFT)
  createdAt       DateTime         @default(now())

  questions       Question[]
  attempts        Attempt[]

  @@index([userId])
  @@index([materialId])
  @@map("exams")
}

model Question {
  id                 String     @id @default(uuid())
  examId             String
  exam               Exam       @relation(fields: [examId], references: [id], onDelete: Cascade)
  questionText       String
  options            Json       // Array of 4 string options: [A, B, C, D]
  correctOptionIndex Int        // 0 to 3
  explanation        String?
  diagramSvg         String?    // Auto-generated standalone SVG vector diagram
  difficulty         Difficulty @default(MEDIUM)

  @@index([examId])
  @@map("questions")
}

model Attempt {
  id          String    @id @default(uuid())
  examId      String
  exam        Exam      @relation(fields: [examId], references: [id], onDelete: Cascade)
  userId      String
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  startedAt   DateTime  @default(now())
  submittedAt DateTime?
  answers     Json      // Record<questionId, selectedOptionIndex>
  score       Int?      // Computed NEET score (+4 * correct - 1 * wrong)

  @@index([examId])
  @@index([userId])
  @@map("attempts")
}
```

---

## 4. Key Features & Implementation Breakdown

### 4.1 Authentication & User Synchronization
- **Clerk Authentication**: Handles Sign-in (`/sign-in`) and Sign-up (`/sign-up`).
- **Middleware Protection**: `src/middleware.ts` guards `/dashboard`, `/tests`, `/analytics`, and `/api` routes.
- **Auto-Sync Helper (`src/lib/getOrCreateUser.ts`)**: Resolves the Clerk user session, checks if a record exists in PostgreSQL, and creates one seamlessly on first login.

---

### 4.2 Multimodal Exam Generation Engine (`/api/generate` & `src/lib/gemini.ts`)
- **Supported Formats**: Single or batch PDFs (`application/pdf`) and images (`image/png`, `image/jpeg`, `image/jpg`, `image/webp`) up to 30 MB total.
- **Multimodal Ingestion**:
  - Small files (<512 KB) are sent inline as base64 data.
  - Large files (>512 KB) are uploaded via the **Gemini Files API** (`ai.files.upload`), polled until `ACTIVE`, and automatically cleaned up (`ai.files.delete`) after generation.
- **Dynamic Exam Customization**:
  - **Question Count**: 10 (Quick Quiz), 15 (Standard Practice), 20 (Chapter Test), 30 (Unit Test), 45 (Full Section).
  - **Subject Focus**: Auto / Mixed, Physics, Chemistry, Biology, Botany, Zoology.
  - **Difficulty Calibration**:
    - `MIXED`: Standard NEET calibration (25% Easy, 50% Medium, 25% Hard).
    - `EASY`: Foundation / NCERT direct concept recall.
    - `HARD`: Rank Booster (multi-concept numericals, assertion-reasoning, tricky edge cases).
- **Handwriting & Diagram-Aware Vector Generation (`diagramSvg`)**:
  - Gemini intelligently identifies visual-heavy questions in Physics (circuit schematics, optical ray paths, free-body force diagrams), Chemistry (organic reaction mechanisms, skeletal bond structures, energy profile curves), and Biology (cell structures, nephron pathways, Punnett genetics, metabolic flowcharts).
  - Outputs standalone, self-contained, responsive SVG vector code directly within the question data.
- **System Prompting**: Expert prompt enforcing authentic 4-option single-choice MCQs, clean mathematical/chemical notation, plausible distractors, and detailed explanations.
- **Model Cascading & Fallback**: Automatically tries configured models in sequence (`gemini-2.5-flash` → `gemini-2.0-flash` → `gemini-1.5-flash`) with error backoff to ensure 99.9% generation uptime even during API quota spikes.
- **Validation**: Strict parsing with Zod schema (`generatedExamSchema`).

---

### 4.3 Dual-Skin Exam Simulation Engine (`ExamRunner.tsx` & `src/components/exam/*`)

The exam runner provides two distinct interfaces switchable at any time:

#### Skin 1: Authentic NTA Official CBT Simulation
Faithfully reproduces the National Testing Agency exam software used in actual NEET centers:
1. **NTA Top Header Banner (`NTAHeader.tsx`)**:
   - Examination name, candidate roll number (`Roll: 2026NEET-0042`), CBT terminal node ID.
   - Language selector (English / Hindi).
   - Font zoom switcher (`A-`, `A`, `A+` font scaling).
   - Real-time countdown timer with 5-minute low-time alert.
2. **Official 5-State Question Palette (`NTAPalette.tsx`)**:
   - 🟩 **Answered** (Green clipped rectangle)
   - 🟥 **Not Answered** (Red clipped rectangle)
   - ⬜ **Not Visited** (Grey border square)
   - 🟨 **Marked for Review** (Yellow circle)
   - 🟪 **Answered & Marked for Review** (Purple circle with green badge — evaluated in final score)
3. **NTA Action Bar (`NTAQuestionPane.tsx`)**:
   - `Save & Next`
   - `Clear Response`
   - `Save & Mark for Review`
   - `Mark for Review & Next`
   - `Previous` / `Next` navigation
4. **NTA Examination Summary Modal (`NTASubmitModal.tsx`)**:
   - Full tabular breakdown of Answered, Not Answered, Marked for Review, and Not Visited counts before final confirmation.

#### Skin 2: Modern Solvd UI
- Clean, distraction-free minimalist layout.
- Real-time attempt summary counter (Attempted vs Left).
- Quick-palette sidebar and responsive single-click submit modal.

#### Exam Security & Scoring Integrity
- **Zero Answer Leakage**: The client never receives `correctOptionIndex`.
- **Server-Side Scoring (`src/app/dashboard/exam/[id]/actions.ts`)**:
  - `+4` marks for every correct answer.
  - `-1` mark for every incorrect answer.
  - `0` marks for unattempted questions.
- **Auto-Submission**: When the countdown timer reaches `00:00`, the exam submits automatically.

---

### 4.4 Results & Solution Review (`/dashboard/attempt/[attemptId]`)
- **NEET Scorecard**: Total score out of maximum possible marks, accuracy percentage, and summary breakdown (Correct, Incorrect, Skipped).
- **Question-by-Question Diagnostic**:
  - Candidate's chosen answer vs. official correct answer.
  - Color-coded status badges (`+4 Correct`, `-1 Incorrect`, `Unattempted (0)`).
  - **Interactive High-Resolution Diagram Viewer (`DiagramViewer.tsx`)**: Renders sanitized vector SVGs for circuits, organic mechanisms, and anatomical structures with zoom-in, zoom-out, and full-screen modal expansion.
  - Detailed step-by-step concept explanations.
- **One-Click Reattempt**: Instantly start a fresh attempt of the same mock test.

---

### 4.5 Performance Analytics & Insights Engine (`/analytics` & `src/components/analytics/*`)
A full diagnostic suite for students to pinpoint weaknesses:
1. **Top Metric Cards**: Tests Attempted, MCQs Answered, Overall Accuracy %, Average Score %, Peak Score %.
2. **Score Trajectory Trend Chart (`ScoreTrendChart.tsx`)**: Visual SVG trend chart tracking score percentages and accuracy across chronological attempts.
3. **Marks Breakdown Donut (`MarksBreakdownDonut.tsx`)**: Visualizes total marks earned vs marks lost to negative marking penalty.
4. **Difficulty Mastery Cards (`DifficultyMasteryCards.tsx`)**: Progress bars and accuracy stats categorized into Easy, Medium, and Hard questions.
5. **Speed & Pacing Gauge (`PacingGaugeCard.tsx`)**: Evaluates average time spent per question against the ideal NEET target of 50–55 seconds.
6. **Smart AI Tactical Insights (`SmartInsightsCard.tsx`)**:
   - Negative marking penalty warnings with projected score recovery advice.
   - Rank booster recommendations for questions with low Hard-tier accuracy.
   - Projected NEET Percentile estimation (e.g. `99.5+ %ile (Top 1,000 AIR)`).
7. **Interactive Test History Table (`TestHistoryTable.tsx`)**: Detailed breakdown of every past attempt with direct links to review solutions.

---

### 4.6 Mock Test Management (`/dashboard`, `/tests`)
- **Tests List & Search (`TestsListClient.tsx`)**: Search through generated tests by title and filter by completion status (Attempted vs Unattempted).
- **Exam Actions (`src/lib/examActions.ts`)**:
  - **Rename Exam**: Modal dialog allowing students to rename mock tests to meaningful chapter/topic titles (`renameExam` Server Action).
  - **Delete Exam**: Safely deletes exams and all associated questions and attempts (`deleteExam` Server Action).
- **Dashboard Hub (`src/app/dashboard/page.tsx`)**: Recent activity list, quick generate card, time-based greetings, and summary counters.

---

### 4.7 Group Test Rooms (`/dashboard/room` & `src/components/room/*`)
- **Shared Exam Generation & Scheduling**:
  - Host generates a mock test from notes via `GenerateRoomExamCard`.
  - Date & time picker with automatic local timezone detection (`Intl.DateTimeFormat`) converted to UTC.
  - Unique human-shareable room code (`SLV-XXXX`) with copyable link and WhatsApp sharing template.
- **Waiting Lobby (`RoomWaitingLobby.tsx`)**:
  - Real-time countdown to test start time.
  - Live-polling participant roster with host moderation controls (Remove Participant).
- **Anti-Leak Deterministic Option Shuffling (`src/lib/optionShuffle.ts`)**:
  - Each participant receives a unique, deterministic permutation of options `[A, B, C, D]` seeded by `(userId + questionId)`.
  - Friends sitting together cannot copy option letters.
  - Server automatically re-maps selections back to the original answer key during scoring.
- **Analytics Isolation**:
  - Room attempts are scoped by `roomId` and excluded from personal `/analytics` and `/dashboard` metrics (`roomId: null`).
- **Room Leaderboard & Diagnostic Insights**:
  - Synchronized unlock when all participants finish or test window closes.
  - **Comparative SVG Bar Chart (`RoomLeaderboardChart.tsx`)**: Visual score rankings.
  - **Ranked Leaderboard Table (`RoomLeaderboardTable.tsx`)**: Rank, Name, Score, Accuracy %, Time Taken.
  - **Group Weak Topics Breakdown (`RoomWeakTopics.tsx`)**: Error cluster analysis for questions with >=40% group error rate.

---

## 5. Repository File Structure

```
Neet CBT/
├── docs/
│   ├── build_solvd_plan.py       # Build plan generator script
│   └── Solvd_Build_Plan.xlsx     # 8-phase milestone and roadmap workbook
├── prisma/
│   └── schema.prisma             # PostgreSQL schema (User, Exam, Question, Attempt, TestRoom, RoomParticipant)
├── public/                       # Static public assets
├── src/
│   ├── app/
│   │   ├── (auth)/               # Clerk authentication routes
│   │   │   ├── sign-in/[[...sign-in]]/page.tsx
│   │   │   └── sign-up/[[...sign-up]]/page.tsx
│   │   ├── analytics/            # Global /analytics route
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   ├── api/
│   │   │   └── generate/
│   │   │       └── route.ts      # Multimodal exam generation API endpoint
│   │   ├── dashboard/
│   │   │   ├── analytics/        # Nested /dashboard/analytics route
│   │   │   ├── attempt/[attemptId]/
│   │   │   │   └── page.tsx      # Test results & question solution review
│   │   │   ├── exam/[id]/
│   │   │   │   ├── actions.ts    # Server-side NEET attempt scoring action
│   │   │   │   └── page.tsx      # Exam runner launcher page
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx          # Main student dashboard
│   │   │   ├── room/             # Group test rooms routes
│   │   │   │   ├── [roomCode]/page.tsx
│   │   │   │   ├── create/page.tsx
│   │   │   │   ├── page.tsx
│   │   │   │   └── RoomLandingClient.tsx
│   │   │   └── tests/            # Tests management route
│   │   ├── tests/                # Global /tests route
│   │   ├── globals.css           # Tailwind CSS imports & animations
│   │   ├── layout.tsx            # Root layout with ClerkProvider
│   │   ├── page.tsx              # Public landing page
│   │   └── middleware.ts         # Route protection middleware
│   ├── components/
│   │   ├── analytics/            # Performance analytics components
│   │   ├── exam/                 # Authentic NTA CBT components
│   │   ├── room/                 # Group Test Rooms components
│   │   │   ├── GenerateRoomExamCard.tsx
│   │   │   ├── JoinRoomModal.tsx
│   │   │   ├── RoomExamClient.tsx
│   │   │   ├── RoomLeaderboardChart.tsx
│   │   │   ├── RoomLeaderboardTable.tsx
│   │   │   ├── RoomResultsWaiting.tsx
│   │   │   ├── RoomWaitingLobby.tsx
│   │   │   ├── RoomWeakTopics.tsx
│   │   │   └── ScheduleRoomModal.tsx
│   │   ├── DiagramViewer.tsx     # High-resolution SVG viewer with zoom modal
│   │   ├── ExamCardItem.tsx      # Interactive test card item
│   │   ├── ExamRunner.tsx        # Central dual-skin test taking engine
│   │   ├── GenerateExamCard.tsx  # Drag & drop upload + exam settings drawer
│   │   ├── RenameExamModal.tsx   # Modal for renaming exam titles
│   │   ├── Sidebar.tsx           # Dashboard navigation sidebar with Room item
│   │   └── TestsListClient.tsx   # Searchable test list client component
│   └── lib/
│       ├── analyticsData.ts      # Isolated analytics aggregation queries
│       ├── dashboardData.ts      # Dashboard stats & recent exams queries
│       ├── examActions.ts        # Rename & delete exam server actions
│       ├── examTypes.ts          # Zod schemas & exam data types
│       ├── gemini.ts             # Google GenAI client with diagram generation
│       ├── getOrCreateUser.ts    # Clerk session to PostgreSQL user sync with retries
│       ├── ntaTypes.ts           # NTA status enums & palette types
│       ├── optionShuffle.ts      # Anti-leak deterministic option permutations
│       ├── prisma.ts             # Prisma client singleton instance
│       ├── roomActions.ts        # Group test rooms server actions & queries
│       └── svgSanitizer.ts       # Security sanitizer for vector SVG diagrams
├── package.json
├── tsconfig.json
└── CONTEXT.md                    # This master context document
```

---

## 6. Environment Variables Guide

To run the project locally or in production, configure the following variables in `.env`:

```env
# Database Connections (PostgreSQL / Supabase / Neon)
DATABASE_URL="postgresql://user:password@host:port/database?pgbouncer=true"
DIRECT_URL="postgresql://user:password@host:port/database"

# Clerk Authentication Keys (https://dashboard.clerk.com)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL="/dashboard"
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL="/dashboard"

# Google Gemini API Key (https://aistudio.google.com)
GEMINI_API_KEY="AIzaSy..."
GEMINI_MODEL="gemini-2.5-flash"
```

---

## 7. Roadmap & Upcoming Milestones

| Phase | Milestone | Scope / Description | Status |
| :--- | :--- | :--- | :--- |
| **Phase 1** | **Foundation & Auth** | Next.js 16 + Prisma + Clerk integration + Database schema | ✅ **Completed** |
| **Phase 2** | **Upload Pipeline** | Drag-and-drop multi-file upload (PDFs + Images up to 30MB) | ✅ **Completed** |
| **Phase 3** | **Exam Generation** | Gemini multimodal prompting + JSON schema validation + Fallback cascading | ✅ **Completed** |
| **Phase 4** | **Authentic CBT Simulation** | Dual-skin runner (NTA Official 5-state CBT + Modern UI) + Timer lock | ✅ **Completed** |
| **Phase 5** | **Scoring & Review** | Server-side +4/-1 scoring + Question-by-question solution review | ✅ **Completed** |
| **Phase 6** | **Analytics & History** | Score trajectory chart, negative marking donut, pacing gauge, tactical AI advice | ✅ **Completed** |
| **Phase 7** | **Subscription & Quota** | Razorpay integration for ₹150 (5 exams) & ₹250 (10 exams) monthly tiers | ⏳ *Planned* |
| **Phase 8** | **Section A/B Grand Mocks**| 200-question full-length mock simulation with Section A (35 Qs) & Section B (15 Qs) | ⏳ *Planned* |
