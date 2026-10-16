# Roomly

A shared household hub for roommates. Split expenses, rotate chores, keep a shared grocery list, post announcements, and line up quiet hours, all in one place that stays in sync in real time.

Built for college and shared-housing roommates who mostly check in from their phones between classes. Instead of juggling an expense splitter, a chore chart, and a group chat for groceries, everything lives under one household, and whatever one roommate does shows up for everyone else right away.

## Features

### Households
- Sign up and log in with email and password (Supabase Auth).
- Create a household, or join one with its **invite code**.
- A user belongs to one household at a time. Members are ordered by when they joined, and that order drives chore rotation.

### Expenses
- Log a shared expense: who paid, what it was for, and the total.
- Split it however you like: **custom amounts per person**, not just even splits.
- See a **running balance** for each roommate. A positive balance means the household owes you, a negative one means you owe the household.
- Mark individual splits as **settled** once they're paid back. Settled splits stop counting toward balances.

### Chores
- Create a chore that repeats every N days, or weekly on a set weekday.
- Pick who goes first. When someone marks it **done**, it **automatically rotates** to the next roommate in join order, wrapping around at the end.
- View chores as a list or on a **calendar**.

### Groceries
- A shared list anyone can add to.
- Check items off when bought.

### Announcements
- Post household notes (title and body).
- **Pin** important ones so they stay at the top.

### Quiet hours
- Each roommate sets their own **weekly schedule** of quiet windows (day, start time, end time).
- Everyone's schedules merge into one **household view** on a timeline, so it's easy to see when the place should be quiet.

### Dashboard
- A **Today** card with what's due now, plus a **week-ahead strip** for the next few days.

### Realtime sync
- Every feature page subscribes to Postgres changes through **Supabase Realtime**. When a roommate adds, edits, or completes something, your page re-fetches without a manual refresh.
- Rows that changed **flash briefly**, so you can see what moved instead of having the list silently reshuffle.

## Tech stack

| Layer     | Choice |
| --------- | ------ |
| Framework | [Next.js 16](https://nextjs.org) (App Router, Server Components, Server Actions) |
| UI        | React 19, TypeScript, [Tailwind CSS 4](https://tailwindcss.com) |
| Backend   | [Supabase](https://supabase.com): Postgres, Auth, Realtime |
| Auth glue | [`@supabase/ssr`](https://supabase.com/docs/guides/auth/server-side) for cookie-based sessions |

## How it works

### Request flow
1. `proxy.ts` (Next 16's replacement for `middleware.ts`) runs on every request. It refreshes the Supabase session cookie and sends signed-out users to `/login`. Only `/login` and `/signup` are public.
2. `/` checks whether you belong to a household and redirects you to `/dashboard` or `/household/setup`.
3. `app/dashboard/layout.tsx` loads the household context and sends anyone without a household back to setup.

### Data access
- Reads and writes go through small typed functions in `lib/queries/`, one file per feature. They take a Supabase client, so the same functions work from Server Components, Server Actions, and the browser.
- Types come from `lib/supabase/database.types.ts`, which Supabase generates.
- Creating and joining a household use Postgres functions (`create_household`, `join_household`) so membership is set up in one step on the database side.

### Realtime
`lib/hooks/useRealtimeRefresh.ts` opens a Realtime channel for the given tables and calls `router.refresh()` whenever a change arrives. The server components then re-run their queries. `lib/hooks/useFlashOnChange.ts` highlights the changed row.

## Data model

| Table               | Holds |
| ------------------- | ----- |
| `households`        | Name, invite code, creator |
| `household_members` | User ↔ household, display name, join `position` |
| `expenses`          | Payer, description, total amount |
| `expense_splits`    | Per-person `amount_owed` for an expense, plus `settled` |
| `chores`            | Name, `recurrence_days`, optional `day_of_week` |
| `chore_assignments` | Who has a chore this cycle, and whether/when it was done |
| `grocery_items`     | Item name, who added it, `bought` |
| `announcements`     | Title, body, author, `pinned` |
| `quiet_hours`       | Per-user weekly windows (`day_of_week`, `start_time`, `end_time`) |

Access is scoped to household members (the schema includes an `is_household_member` helper for row-level security).

## Getting started

### Prerequisites
- Node.js 20 or newer
- A [Supabase](https://supabase.com) project

### 1. Install

```bash
git clone https://github.com/kevinyyin/roommateapp.git
cd roommateapp
npm install
```

### 2. Configure environment

Create `.env.local` in the project root with values from your Supabase project's **Settings → API** page:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://<your-project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
```

### 3. Set up the database

> **Note:** `supabase/migrations/` currently holds only a follow-up migration (adding `announcements` to Realtime and cascading deletes). The base schema isn't checked in yet. Use the data model above and `lib/supabase/database.types.ts` as the reference for the tables and functions the app expects.

Once the schema exists, make sure every shared table is in the `supabase_realtime` publication, or live updates won't fire.

### 4. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), sign up, then create a household. To try the realtime sync, sign up a second account in another browser, join with the invite code, and make changes side by side.

## Scripts

| Command         | What it does |
| --------------- | ------------ |
| `npm run dev`   | Start the dev server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint`  | Run ESLint |

## Project structure

```
app/
  page.tsx               Redirects to /dashboard or /household/setup
  login/, signup/        Auth pages and their server actions
  household/setup/       Create or join a household
  dashboard/
    page.tsx             Overview: Today card and week-ahead strip
    expenses/            Expenses, splits, balances
    chores/              Chore list, calendar, rotation
    groceries/           Shared grocery list
    announcements/       Household posts and pinning
    quiet-hours/         Personal schedule editor and household view
components/
  <feature>/             Feature UI (boards, forms, calendar, timeline)
  ui/                    Shared primitives: Button, Input, Checkbox, Label, Skeleton
  BottomNav.tsx          Mobile tab bar
lib/
  queries/               Typed Supabase reads and writes, one file per feature
  hooks/                 useRealtimeRefresh, useFlashOnChange
  supabase/              Browser and server clients, generated types, session refresh
proxy.ts                 Session refresh and auth redirect on every request
supabase/migrations/     Database migrations
PRODUCT.md               Product brief: users, purpose, principles
```

## Deployment

Any Next.js host works. On [Vercel](https://vercel.com), import the repo and set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` as environment variables. In Supabase, add your deployed URL under **Authentication → URL Configuration**.
