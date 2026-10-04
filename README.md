<div align="center">

# ⚡ Solvd
### High-Stakes NTA NEET Assessment Engine & AI Pedagogical Studio

[![Next.js](https://img.shields.io/badge/Next.js-16.3-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-6.19-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Google Gemini](https://img.shields.io/badge/Gemini_2.5_Flash-Multimodal-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)
[![Capacitor](https://img.shields.io/badge/Capacitor-8.5-53B9EA?style=for-the-badge&logo=capacitor&logoColor=white)](https://capacitorjs.com/)

<br />

**Stop guessing in NEET — simulate the real exam under authentic NTA conditions.**  
Solvd transforms handwritten coaching notes, NCERT textbook excerpts, and complex diagrams into authentic computer-based tests and animated 16:9 pedagogical micro-lectures.

[Live Demo](https://solvd-neet.app) • [Features](#-core-features) • [Architecture](#-architecture--tech-stack) • [Quickstart](#-getting-started) • [Contributing](#-contributing)

<br />

---

</div>

## 🌟 Overview

The National Eligibility cum Entrance Test (**NEET-UG**) is one of the most competitive medical examinations globally. Success demands rapid pattern recognition, negative marking discipline (+4 / -1), and psychological stamina under timed computer-based testing conditions.

**Solvd** is built ground-up to eliminate exam-hall disorientation and bridge the gap between static revision and high-stakes computer-based performance.

---

## 🚀 Core Features

### 🎯 1. 1:1 Authentic NTA CBT Simulator
- **Official Layout Parity**: Exact 1:1 color-coded question status matrix (Answered, Active, Marked for Review, Unvisited).
- **Mandatory vs. Optional Logic**: Strict Section A (35 mandatory) and Section B (10 out of 15 optional) question enforcement.
- **Marking Scheme**: Precise $+4$ for correct, $-1$ for incorrect, and $0$ for unattempted.
- **Synchronized Exam Clock**: Live countdown timers with auto-lock upon expiry.

### 👁️ 2. Multimodal Note OCR & Mock Generator
- **Handwritten Notes Ingestion**: Ingest camera snaps of coaching binders (Allen, Aakash, Resonance), NCERT PDFs, and textbook margin notes.
- **Scientific Diagram Extraction**: Multimodal vision pipeline reconstructs Ray Optics diagrams, organic reaction mechanisms, and morphology tables.
- **Instant Test Synthesis**: Generates calibrated NTA single-choice numerical and assertion-reasoning MCQs in under 15 seconds.

### 🎬 3. AI Notes-to-Video Studio (Micro-Lectures)
- **16:9 Vector Pedagogy**: Converts dense notes and reaction pathways into animated vector concept cards and SVG diagrams.
- **Studio Audio Narration**: Clean, studio-quality educator voiceover synchronized with visual transitions.
- **Phrase-Synced Dynamic Subtitles**: Word-by-word / phrase-by-phrase subtitle highlights for key terms and formulas.
- **Playback Controls & HD Export**: Instant $1\times, 1.25\times, 1.5\times, 2\times$ playback speed cycling and client-side 1080p MP4 export for offline revision.

### 👥 4. Synchronized Study Circles & Multiplayer Rooms
- **Persistent Study Cohorts**: Create or join locked 6-digit room codes with batchmates.
- **Automated Gmail Alerts**: Dispatches automatic 15-minute test countdown reminders via email.
- **Synchronized Lobbies**: Shared countdown start timers for simultaneous test launches.
- **Batch Trajectory**: Multi-user leaderboard tracking All-India percentiles and score progression across weekly sprints.

### 📊 5. Negative Marking Post-Mortem Diagnostics
- **3-Tier Error Classification**:
  - ⚠️ **Calculation Slips**: Formula transposition and arithmetic errors.
  - 🔍 **Misread Keywords**: Trapped in `EXCEPT`, `NOT`, or `INCORRECT` wording.
  - 🧠 **Conceptual Voids**: Core theoretical gaps requiring revision.
- **Pacing Speedometer**: Real-time pacing metrics ($50-55\text{s}$ target per question).

---

## 🛠️ Architecture & Tech Stack

```mermaid
graph TD
    A[Student / Aspirant] -->|Web / Mobile APK| B[Next.js 16 App Router]
    B -->|Authentication| C[Clerk Auth]
    B -->|OCR & Synthesis| D[Google Gemini 2.5 Flash]
    B -->|Voiceover Engine| E[Edge-TTS Audio Pipeline]
    B -->|Video Canvas Exporter| F[Client WebCodecs / MP4 Engine]
    B -->|Database & State| G[Prisma ORM + PostgreSQL]
    B -->|Automated Reminders| H[Nodemailer / Resend]
    B -->|Native Wrapper| I[Capacitor 8 Android SDK]
```

### Technology Matrix

| Layer | Technologies |
| :--- | :--- |
| **Frontend Framework** | [Next.js 16 (App Router)](https://nextjs.org), [React 19](https://react.dev) |
| **Language** | [TypeScript 5](https://www.typescriptlang.org) |
| **Styling & UI** | [Tailwind CSS v4](https://tailwindcss.com), [Lucide React Icons](https://lucide.dev) |
| **Authentication** | [Clerk Next.js SDK](https://clerk.com) |
| **Database & ORM** | [PostgreSQL](https://www.postgresql.org), [Prisma ORM](https://www.prisma.io) |
| **AI Vision & Text** | [Google Gemini 2.5 Flash SDK (`@google/genai`)](https://ai.google.dev) |
| **Voice Narration** | [Edge-TTS Universal](https://github.com) |
| **Email Service** | [Nodemailer](https://nodemailer.com), [Resend](https://resend.com) |
| **Mobile Compilation** | [Capacitor 8 (`@capacitor/android`, `@capacitor/core`)](https://capacitorjs.com) |

---

## 📂 Project Structure

```
Neet CBT/
├── src/
│   ├── app/                                # Next.js App Router
│   │   ├── page.tsx                        # Landing Page (Particle wave, showcases)
│   │   ├── features/page.tsx               # Deep-Dive Features Page
│   │   ├── cbt-simulator/page.tsx          # Standalone Interactive CBT Preview
│   │   ├── pricing/page.tsx                # Pricing & Early Access Promotion
│   │   ├── dashboard/                      # Authenticated Aspirant Dashboard
│   │   │   ├── page.tsx                    # Dashboard Home & Active Mocks
│   │   │   ├── notes-to-video/             # AI Video Micro-Lecture Studio
│   │   │   ├── question-bank/              # Curated & Shared NCERT Banks
│   │   │   └── room/                       # Multiplayer Study Circles
│   │   └── api/                            # Backend Serverless Endpoints
│   │       ├── generate-mock/              # Gemini Multimodal OCR Pipeline
│   │       ├── notes-to-video/             # Script & Audio Synthesis
│   │       └── rooms/                      # Study Circle Scheduling & Alerts
│   ├── components/                         # Global Shared UI Components
│   │   ├── SolvdLogo.tsx                   # Vector Brand Identity
│   │   ├── WaveParticleCanvas.tsx          # Dynamic Harmonic Particle Waves
│   │   ├── AppDownloadBanner.tsx           # APK & PWA Install Prompts
│   │   └── NavigationProgressBar.tsx       # Top Bar Routing Indicator
│   ├── features/                           # Domain Modules
│   │   └── notes-to-video/                 # Micro-Lecture Architecture
│   │       ├── components/                 # Cinema Player, SVG Scene Renderers
│   │       ├── utils/                      # TTS Service, Video Exporter Engine
│   │       └── demoLesson.ts               # Pre-rendered High-Yield Lesson
│   └── lib/                                # Core Utilities & Database Clients
│       ├── prisma.ts                       # Prisma Client Instance
│       └── gemini.ts                       # Gemini AI Client
├── prisma/
│   └── schema.prisma                       # Database Schema (Users, Rooms, Tests)
├── android/                                # Android Studio Capacitor Project
├── capacitor.config.ts                     # Capacitor Native App Configuration
└── package.json                            # Package Manifest
```

---

## ⚡ Getting Started

### Prerequisites
- **Node.js**: `v20.x` or later
- **npm** / **pnpm** / **yarn**
- **PostgreSQL Database** (Neon, Supabase, or local)
- **Google Gemini API Key** ([Google AI Studio](https://aistudio.google.com))
- **Clerk Auth Keys** ([Clerk Dashboard](https://clerk.com))

### 1. Clone the Repository
```bash
git clone https://github.com/Sambully/Solvd.git
cd Solvd
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env.local` file in the root directory:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# PostgreSQL Database
DATABASE_URL="postgresql://user:password@localhost:5432/solvd_db"

# Google Gemini AI
GEMINI_API_KEY=AIzaSy...

# Automated Email Alerts (Optional for Study Circles)
EMAIL_USER=your-email@gmail.com
EMAIL_APP_PASSWORD=your-app-password
RESEND_API_KEY=re_...
```

### 4. Initialize Database
```bash
npx prisma db push
```

### 5. Launch Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view Solvd in your browser.

---

## 📱 Mobile Build (Android APK)

To build the native Android application using Capacitor:

```bash
# 1. Build Next.js production bundle
npm run build

# 2. Sync web assets with Capacitor
npx cap sync android

# 3. Open project in Android Studio
npx cap open android
```

---

## 🔒 Security & Best Practices

- **Strict Type Checking**: 100% TypeScript coverage with zero-error `tsc` validation.
- **Row-Level User Isolation**: Test data, mistake ledgers, and notes are strictly scoped per authenticated user session via Clerk.
- **Client-Side Video Export**: Video canvas recording runs securely in the browser, minimizing server compute overhead and preserving user privacy.

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

<br />

<div align="center">

**Built for NEET aspirants by Solvd Edtech Labs.**  
*Empowering future doctors to master the exam hall.*

</div>
