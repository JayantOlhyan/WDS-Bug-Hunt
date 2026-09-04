# MSIT Website Bug Hunt

> Find it. Report it. Get recognized. A student-powered website QA and contributor recognition platform.

## Overview
The **MSIT Website Bug Hunt** is a Next.js web application built for the Web Development Society (WDS) at MSIT. It gamifies the process of finding and reporting bugs on the official MSIT and WDS websites. Students can submit bug reports with screenshots, earn points based on issue severity, climb a global leaderboard, and get recognized through badges. Reviewers (Admins) manage the submissions queue via a secure dashboard.

## Why This Project Exists
This project solves the problem of undocumented broken links, visual glitches, and outdated information on college websites. By gamifying the QA process, it incentivizes students to rigorously test the college's digital infrastructure, providing the maintenance team with structured, actionable bug reports while rewarding students for their technical scrutiny.

## Target Users
- **Students (Bug Hunters):** Search for issues on target websites, submit structured bug reports with evidence, and compete on the leaderboard.
- **WDS Admins (Reviewers):** Verify bug reports, assign severities, distribute points, and mark bugs as fixed via a secure admin console.

## Features
- **Structured Bug Reporting:** Form-based submission process capturing URLs, expected vs. actual behavior, severity estimates, and screenshot evidence.
- **Leaderboard & Gamification:** Points-based ranking system. Students earn points for valid bugs and receive badges (e.g., FIRST_FIND, BUG_HUNTER, FIX_FINDER).
- **Admin Review Console:** PIN-protected dashboard for admins to review the submission queue, update bug statuses, and allocate points.
- **Notion Database Integration:** Seamlessly uses Notion databases as a headless CMS for storing bugs, students, and orientations data.
- **Automated Image Hosting:** Screenshots are automatically uploaded to ImgBB and linked within the bug reports.
- **Cyberpunk UI:** A visually distinct retro-terminal/cyberpunk aesthetic using custom CSS and Tailwind CSS.

## Architecture
```text
User (Student/Admin)
       ↓
Next.js Frontend (React + Tailwind CSS)
       ↓
Next.js API Routes (/api/bugs, /api/admin, /api/upload)
       ↓
-----------------------------------------
|               SERVICES                |
| - Notion API (Database/Records)       |
| - ImgBB API (Image Storage)           |
-----------------------------------------
```

## Tech Stack
### Frontend
- **Framework:** Next.js (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS, PostCSS, Custom CSS (scanlines, text-glow)
- **Icons:** `lucide-react`
- **Fonts:** `Space_Mono` (Next.js font optimization)

### Backend
- **Framework:** Next.js API Routes
- **Database / CMS:** Notion API (`@notionhq/client`)
- **Storage:** ImgBB API for screenshot uploads

## Repository Structure
```text
MSIT WEBSITE BUG HUNT/
├── src/
│   ├── app/
│   │   ├── admin/       # PIN-protected Admin dashboard & review queue
│   │   ├── api/         # Next.js API routes (bugs, leaderboard, stats, upload)
│   │   ├── bug-hunt/    # Landing page and report submission form
│   │   ├── dashboard/   # (Inferred) Student personal dashboard
│   │   ├── leaderboard/ # Public standings page
│   │   ├── layout.tsx   # Global HTML wrapper, BootSequence, and Navbar
│   │   └── page.tsx     # Root redirect to /bug-hunt
│   ├── components/      # Reusable UI components (Card, TerminalButton, etc.)
│   ├── services/
│   │   ├── db.ts               # Notion database interaction layer
│   │   └── storageService.ts   # ImgBB upload logic
│   └── types/           # TypeScript interfaces (BugReport, Student, etc.)
├── public/              # Static assets
├── .env.example         # Environment variable template
├── next.config.mjs      # Next.js configuration
├── tailwind.config.ts   # Tailwind configuration
└── package.json         # Project metadata and dependencies
```

## Prerequisites
- Node.js (v18 or higher recommended)
- A Notion Integration Token and Database IDs
- An ImgBB API Key

## Installation
1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd "MSIT WEBSITE BUG HUNT"
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Configure environment:**
   ```bash
   cp .env.example .env.local
   ```
   *Edit `.env.local` and add your actual API keys and Notion Database IDs.*

## Environment Variables
| Variable | Required | Purpose | Example |
| -------- | -------- | ------- | ------- |
| `ADMIN_PIN` | Yes | Secure PIN to access the `/admin` dashboard | `123456` |
| `NOTION_TOKEN` | Yes | Internal integration token from Notion | `secret_abc123...` |
| `NOTION_DATABASE_BUGS_ID` | Yes | Notion Database ID for Bug Reports | `abc123...` |
| `NOTION_DATABASE_STUDENTS_ID` | Yes | Notion Database ID for Students | `def456...` |
| `NOTION_DATABASE_ORIENTATIONS_ID` | Yes | Notion Database ID for Orientations | `ghi789...` |
| `NOTION_DATABASE_BADGES_ID` | Yes | Notion Database ID for Badges | `jkl012...` |
| `IMGBB_API_KEY` | Yes | API Key for ImgBB screenshot uploads | `xyz987...` |

## Local Development
Start the Next.js development server:
```bash
npm run dev
```
The application will be available at `http://localhost:3000`.

## Database (Notion)
The application uses Notion as a relational database. The schema expectations (based on `src/services/db.ts`) are:
- **Bugs DB:** Properties include `Report ID`, `Student`, `Mobile Number`, `Bug Description`, `Screenshot URL`, `Status`, `Points`, `Duplicate`, etc.
- **Students DB:** Properties include `Mobile Number`, `Name`, `Total Points`, `Valid Reports`, `Badges` (Multi-select), etc.
- **Orientations DB:** Tracks events, QR scans, and aggregate bug reports from specific orientation sessions.
- **Badges DB:** Defines available badges and requirements.

*Whenever a bug is created or updated, the student's metrics (Total Points, Badges) are proactively recalculated and updated in the Students DB.*

## API
The backend exposes several routes under `/api`:
- `GET /api/bugs` - Fetches all bug reports.
- `POST /api/bugs` - Creates a new bug report.
- `GET /api/leaderboard` - Fetches sorted students by total points.
- `GET /api/stats` - Fetches aggregate statistics (total bugs, active hunters, etc.).
- `POST /api/admin/verify` - Validates the `ADMIN_PIN`.
- `POST /api/upload` - Proxies screenshot uploads to ImgBB.

## Authentication
- **User/Student:** No explicit user authentication. Users are identified uniquely via their `Mobile Number` during bug submission. Profile details are cached in browser `localStorage`.
- **Admin:** Protected by a simple static `ADMIN_PIN` check. Upon successful validation (`/api/admin/verify`), a session flag `msit_bughunt_admin=true` is set in `sessionStorage` to allow access to the review queue.

## Security
- **Authentication:** Admin dashboard relies on a shared static PIN and client-side `sessionStorage`. **This is not cryptographically secure against sophisticated attackers.**
- **File Uploads:** Validates file size (<5MB) and extensions (png, jpg, jpeg, webp) before forwarding to ImgBB.
- **Data Input:** Basic required field validation on the frontend. No robust input sanitization layer is explicitly visible before sending to Notion.

## Development Workflow
- **Linting:** Run `npm run lint` to execute ESLint.
- **Build:** Run `npm run build` to create an optimized production build.
- **Start:** Run `npm run start` to serve the production build.

## Deployment
The project is a standard Next.js application, fully compatible with platforms like Vercel or Netlify.
1. Connect your GitHub repository to Vercel/Netlify.
2. Add all the required Environment Variables in the platform's dashboard.
3. Deploy.

## Known Limitations
- **Admin Authentication:** Uses a shared PIN and client-side session storage which can be easily bypassed or leaked. It is not a robust authentication system (like NextAuth or JWT).
- **User Identity:** Students are tracked solely by Mobile Number without verification (OTP), meaning a user could theoretically submit bugs under someone else's number.
- **Rate Limiting:** No explicit API rate limiting is implemented, leaving the Notion and ImgBB APIs susceptible to spam/abuse.
- **Testing:** No automated testing framework (Jest, Cypress) is currently configured in the repository.

## Roadmap
### Completed
- Bug submission form with ImgBB integration
- Notion Database integration for bugs, students, and orientations
- Leaderboard and aggregate statistics computation
- Admin review console for verifying bugs and assigning points

### Planned / Missing Integrations
- Secure Authentication (OAuth or OTP) for Students and Admins
- Server-side API Rate Limiting
- Robust form validation and input sanitization (e.g., Zod)
- Automated testing suite

## License
*Not explicitly specified in the repository.*

## Author
Web Development Society (WDS), MSIT
