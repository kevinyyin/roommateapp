# Roomly

A shared household hub for roommates. Split expenses, rotate chores, keep a shared grocery list, post announcements, and line up quiet hours, all in one place that stays in sync in real time.

Built for college and shared-housing roommates who mostly check in from their phones between classes.

## Features

- **Expenses**: log a shared expense with custom per-person splits and see running balances. Mark splits settled.
- **Chores**: recurring chores that rotate to the next roommate (in join order) when marked done. List and calendar views.
- **Groceries**: a shared list anyone can add to and check off.
- **Announcements**: household posts, with pinning.
- **Quiet hours**: each roommate sets a weekly schedule, and they merge into one household view.
- **Dashboard**: today's items plus a week-ahead strip.
- **Households**: create one or join with an invite code. A user belongs to one household at a time.
- **Realtime**: changes from one roommate show up for everyone else without a refresh (Supabase Realtime).

## Tech stack

- [Next.js 16](https://nextjs.org) (App Router, Server Actions) with React 19 and TypeScript
- [Tailwind CSS 4](https://tailwindcss.com)
- [Supabase](https://supabase.com) for Postgres, email/password Auth, and Realtime

## Getting started

### 1. Install

```bash
npm install
```

### 2. Configure Supabase

Create a Supabase project, then add a `.env.local` in the project root:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://<your-project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
```

> **Note:** `supabase/migrations/` currently holds only a follow-up migration. The base schema (households, members, expenses, chores, groceries, announcements, quiet hours) isn't checked in yet. `lib/supabase/database.types.ts` shows the expected tables.

### 3. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), sign up, then create or join a household.

## Scripts

| Command         | What it does             |
| --------------- | ------------------------ |
| `npm run dev`   | Start the dev server     |
| `npm run build` | Production build         |
| `npm run start` | Serve the production build |
| `npm run lint`  | Run ESLint               |

## Project structure

```
app/
  login/, signup/        Auth pages
  household/setup/       Create or join a household
  dashboard/             Overview plus one route per feature
    expenses/ chores/ groceries/ announcements/ quiet-hours/
components/              UI, grouped by feature (plus ui/ primitives)
lib/
  queries/               Supabase reads and writes per feature
  hooks/                 Realtime refresh and change-flash hooks
  supabase/              Browser/server clients, generated DB types, session refresh
proxy.ts                 Refreshes the Supabase session on each request
supabase/migrations/     Database migrations
```
