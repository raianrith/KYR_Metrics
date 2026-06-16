# KYR Metrics

**Know Your Role** — internal performance metrics dashboard for [Weidert Group](https://www.weidert.com).

Track agency-wide KPIs by team, role, owner, and tier. Supervisors use the Admin panel to log metric entries at their regular cadence.

## Stack

- **Frontend:** Next.js 15, React 19, Tailwind CSS 4
- **Database:** Supabase (PostgreSQL)
- **Charts:** Recharts
- **UI:** Radix UI primitives, custom Weidert-branded design

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Set up Supabase

1. Open your [Supabase project](https://supabase.com/dashboard) (already linked to this GitHub repo).
2. Go to **SQL Editor** and run the migrations in order:
   - `supabase/migrations/001_schema.sql` — creates tables, views, and RLS policies
   - `supabase/migrations/002_seed.sql` — seeds all 22 KYR metrics + sample entries
3. Copy your project credentials from **Settings → API**.

### 3. Configure environment

```bash
cp .env.example .env.local
```

Edit `.env.local` with your Supabase URL and anon key:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

> **Demo mode:** Without Supabase credentials, the app runs with built-in sample data so you can preview the UI immediately.

## Features

### Dashboard (`/`)

- Agency-wide stat cards: total metrics, on track, at risk, not met, pending
- Team performance stacked bar chart
- Multi-dimensional views:
  - **All Metrics** — full list with status badges
  - **By Team** — grouped team cards
  - **By Owner** — individual metric owners (Mike, Vicki, Robert)
  - **By Supervisor** — department owners (Michelle, Nicole, Chelsea, Jo)
  - **By Tier** — Tier 1 (extensible for future tiers)

### Admin (`/admin`)

- Select any metric from the dropdown
- See definition, cadence, how-to-pull instructions, and target
- Enter actual values for a reporting period
- Auto-calculates status based on target direction
- Upserts entries (no duplicates for same metric + period)

## Database Schema

| Table | Purpose |
|-------|---------|
| `teams` | Pinnacle, Administration, Marketing Solutions, etc. |
| `roles` | President & Visionary, VP Admin, Strategist, etc. |
| `people` | Metric owners and department supervisors |
| `metrics` | 22 KYR metric definitions with targets and cadence |
| `metric_entries` | Time-series actual values entered by supervisors |
| `metric_dashboard` | View joining everything for the dashboard |

## Metrics Tracked (22 total)

| Team | Metrics |
|------|---------|
| Pinnacle | Free Cash Flow, ESOP Share Value, Growth milestones, Meeting effectiveness |
| Administration | Overhead, Time-to-fill, Reporting accuracy |
| Marketing Solutions | Method adoption, SALs, Leads, Branded search, AI visibility |
| Business Development | AGI, CSAT, New AGI, Close rate |
| Client Services | Client AGI, CSAT, Project success |
| Creative Services | Rework, Throughput |
| Web Dev | Utilization |

## Deploy

Push to `main` on GitHub. Connect the repo to Vercel and add the same environment variables.

## License

Internal use only — Weidert Group.
