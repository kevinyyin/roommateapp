# House Announcements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a household-wide bulletin board — post/pin/delete announcements, a new bottom-nav tab, and a teaser on the dashboard home screen.

**Architecture:** One new Supabase table (`announcements`) following the exact RLS/column conventions already used by `chores`/`grocery_items`/`quiet_hours`, a query module, two new client components mirroring the existing `AddChoreForm`/`ChoresBoard` pair, and a 5th entry threaded through the existing category system (`Lane`, `icons.tsx`, `BottomNav`).

**Tech Stack:** Next.js 16 App Router, React 19, Supabase (Postgres + RLS + realtime), Tailwind v4. No automated test framework exists in this repo — every task's "test" step is `npx tsc --noEmit -p tsconfig.json` (must produce no output) plus a manual check (SQL query or browser walkthrough) as specified.

**Spec:** [docs/superpowers/specs/2026-09-14-house-announcements-design.md](../specs/2026-09-14-house-announcements-design.md)

## Global Constraints

- Supabase project id: `uytxmnftvhipulaocbga` (the "roommateapp" project). Use the Supabase MCP tools (`apply_migration`, `generate_typescript_types`, `execute_sql`) against this project id.
- No test framework in this repo (`package.json` has no `test` script, no jest/vitest). Do not add one as part of this feature — that's out of scope. Use `npx tsc --noEmit -p tsconfig.json` as the automated check for every task; it must produce empty output.
- RLS `UPDATE` policy is intentionally not column-restricted (same as `chores`, `expenses`, `grocery_items`). The app layer must only ever send `{ pinned: boolean }` in its update call to `announcements` — never a raw/generic patch.
- New accent tokens (exact values, from the spec): `--color-announcements: #b1467c`; `--color-announcements-tint: #f6e8ef`.
- Out of scope (do not implement): editing an existing post, comments/reactions, notifications, auto-expiry/archiving.
- This is a fresh Supabase project with no SMTP configured, so creating a *new* signup in the browser fails at the confirmation-email step (a known, pre-existing limitation, not something to fix here). Manual browser verification should use whatever existing logged-in session/account is available; if none is available, verification for browser-only steps may be skipped with a note, but `tsc --noEmit` must still pass.

---

### Task 1: Database schema — `announcements` table + RLS

**Files:**
- Migration: applied via Supabase MCP `apply_migration` (no local migration files exist in this repo — schema lives in Supabase directly, same as the `day_of_week` migration in the prior chores feature).
- Modify: `lib/supabase/database.types.ts` (fully regenerated, not hand-edited).
- Modify: `lib/types.ts`

**Interfaces:**
- Produces: a Postgres table `public.announcements` with columns `id uuid pk`, `household_id uuid fk→households.id`, `author_id uuid fk→auth.users.id`, `title text not null`, `body text not null`, `pinned boolean not null default false`, `created_at timestamptz not null default now()`.
- Produces: `export type Announcement = Tables<"announcements">;` in `lib/types.ts`, consumed by Task 2 and onward.

- [ ] **Step 1: Apply the migration**

Call the Supabase MCP `apply_migration` tool with `project_id: "uytxmnftvhipulaocbga"`, `name: "add_announcements_table"`, and this `query`:

```sql
create table public.announcements (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id),
  author_id uuid not null references auth.users(id),
  title text not null,
  body text not null,
  pinned boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.announcements enable row level security;

create policy "members can view announcements"
  on public.announcements for select
  using (is_household_member(household_id));

create policy "members can add announcements"
  on public.announcements for insert
  with check (author_id = auth.uid() and is_household_member(household_id));

create policy "members can update announcements"
  on public.announcements for update
  using (is_household_member(household_id));

create policy "authors can delete their announcements"
  on public.announcements for delete
  using (author_id = auth.uid());
```

- [ ] **Step 2: Verify the schema landed correctly**

Call the Supabase MCP `execute_sql` tool with `project_id: "uytxmnftvhipulaocbga"` and this query:

```sql
select column_name, data_type, is_nullable, column_default
from information_schema.columns
where table_schema = 'public' and table_name = 'announcements'
order by ordinal_position;
```

Expected: 7 rows — `id` (uuid, default `gen_random_uuid()`), `household_id` (uuid, not null, no default), `author_id` (uuid, not null, no default), `title` (text, not null), `body` (text, not null), `pinned` (boolean, not null, default `false`), `created_at` (timestamptz, not null, default `now()`).

- [ ] **Step 3: Regenerate TypeScript types**

Call the Supabase MCP `generate_typescript_types` tool with `project_id: "uytxmnftvhipulaocbga"`, then overwrite the full contents of `lib/supabase/database.types.ts` with the returned `types` string exactly (this file is fully regenerated, never hand-patched — see how the `day_of_week` migration did this).

- [ ] **Step 4: Add the `Announcement` type**

In `lib/types.ts`, after the `QuietHoursEntry` line, add:

```ts
export type Announcement = Tables<"announcements">;
```

- [ ] **Step 5: Typecheck**

Run: `npx tsc --noEmit -p tsconfig.json`
Expected: no output.

- [ ] **Step 6: Commit**

```bash
git add lib/supabase/database.types.ts lib/types.ts
git commit -m "Add announcements table with RLS policies"
```

---

### Task 2: Query layer — `lib/queries/announcements.ts`

**Files:**
- Create: `lib/queries/announcements.ts`

**Interfaces:**
- Consumes: `Announcement` type from `lib/types.ts` (Task 1); `Database` type from `lib/supabase/database.types.ts`.
- Produces (consumed by Task 4's `AnnouncementsBoard`/`AddAnnouncementForm` and Task 5/6's pages):
  - `listAnnouncements(supabase: Client, householdId: string): Promise<Announcement[]>` — sorted pinned-first, then newest-first.
  - `addAnnouncement(supabase: Client, input: { householdId: string; authorId: string; title: string; body: string }): Promise<void>`
  - `setAnnouncementPinned(supabase: Client, id: string, pinned: boolean): Promise<void>`
  - `deleteAnnouncement(supabase: Client, id: string): Promise<void>`

- [ ] **Step 1: Write the query module**

Create `lib/queries/announcements.ts`:

```ts
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../supabase/database.types";
import type { Announcement } from "../types";

type Client = SupabaseClient<Database>;

export async function listAnnouncements(
  supabase: Client,
  householdId: string
): Promise<Announcement[]> {
  const { data, error } = await supabase
    .from("announcements")
    .select("*")
    .eq("household_id", householdId)
    .order("pinned", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function addAnnouncement(
  supabase: Client,
  input: { householdId: string; authorId: string; title: string; body: string }
): Promise<void> {
  const { error } = await supabase.from("announcements").insert({
    household_id: input.householdId,
    author_id: input.authorId,
    title: input.title,
    body: input.body,
  });

  if (error) throw error;
}

export async function setAnnouncementPinned(
  supabase: Client,
  id: string,
  pinned: boolean
): Promise<void> {
  const { error } = await supabase.from("announcements").update({ pinned }).eq("id", id);
  if (error) throw error;
}

export async function deleteAnnouncement(supabase: Client, id: string): Promise<void> {
  const { error } = await supabase.from("announcements").delete().eq("id", id);
  if (error) throw error;
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit -p tsconfig.json`
Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add lib/queries/announcements.ts
git commit -m "Add announcements query layer"
```

---

### Task 3: Design tokens, icon, and category registration

**Files:**
- Modify: `app/globals.css`
- Modify: `components/icons.tsx`
- Modify: `components/Lane.tsx`
- Modify: `components/BottomNav.tsx`

**Interfaces:**
- Consumes: nothing from earlier tasks.
- Produces: `Category` type (in `components/Lane.tsx`) now includes `"announcements"`; `CATEGORY_META.announcements` and `CATEGORY_ICONS.announcements` exist — consumed by Task 4's `AnnouncementsBoard` (via `<Lane category="announcements">`) and by `BottomNav`.

- [ ] **Step 1: Add the accent color tokens**

In `app/globals.css`, in the `:root` block, after the `--color-quiet-tint` line, add:

```css
  --color-announcements: #b1467c;
  --color-announcements-tint: #f6e8ef;
```

In the `@theme inline` block, after the `--color-quiet-tint: var(--color-quiet-tint);` line, add:

```css
  --color-announcements: var(--color-announcements);
  --color-announcements-tint: var(--color-announcements-tint);
```

- [ ] **Step 2: Add the icon**

In `components/icons.tsx`, after `QuietHoursIcon`'s closing brace and before `export const CATEGORY_ICONS`, add:

```tsx
export function AnnouncementsIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M9 4.5h9l-1.2 5.2L18 15H9" />
      <path d="M9 4.5v15" />
    </svg>
  );
}
```

Then update the `CATEGORY_ICONS` map to:

```ts
export const CATEGORY_ICONS = {
  expenses: ExpensesIcon,
  chores: ChoresIcon,
  groceries: GroceriesIcon,
  quiet: QuietHoursIcon,
  announcements: AnnouncementsIcon,
} as const;
```

- [ ] **Step 3: Register the category**

In `components/Lane.tsx`, change:

```ts
export type Category = "expenses" | "chores" | "groceries" | "quiet";
```

to:

```ts
export type Category = "expenses" | "chores" | "groceries" | "quiet" | "announcements";
```

And add this entry to `CATEGORY_META` (after the `quiet` entry):

```ts
  announcements: { label: "Announcements", color: "var(--color-announcements)", tint: "var(--color-announcements-tint)", href: "/dashboard/announcements" },
```

- [ ] **Step 4: Add the bottom-nav tab**

In `components/BottomNav.tsx`, change:

```ts
const TABS: Category[] = ["expenses", "chores", "groceries", "quiet"];
```

to:

```ts
const TABS: Category[] = ["expenses", "chores", "groceries", "quiet", "announcements"];
```

- [ ] **Step 5: Typecheck**

Run: `npx tsc --noEmit -p tsconfig.json`
Expected: no output.

- [ ] **Step 6: Manual check**

Start the dev server (`npm run dev` or the project's preview tooling) and open any dashboard page. Confirm a 5th "Announcements" tab appears in the bottom nav with a distinct dusty-rose color and the new flag icon. It's expected to 404 when clicked — the route is built in Task 5. If no logged-in session is available, skip this step and rely on the Task 5/6 manual checks instead.

- [ ] **Step 7: Commit**

```bash
git add app/globals.css components/icons.tsx components/Lane.tsx components/BottomNav.tsx
git commit -m "Register announcements as a 5th category (color, icon, nav tab)"
```

---

### Task 4: `AnnouncementsBoard` + `AddAnnouncementForm` components

**Files:**
- Create: `components/announcements/AddAnnouncementForm.tsx`
- Create: `components/announcements/AnnouncementsBoard.tsx`

**Interfaces:**
- Consumes: `Announcement`, `HouseholdMember` types (`lib/types.ts`); `listAnnouncements`/`addAnnouncement`/`setAnnouncementPinned`/`deleteAnnouncement` (`lib/queries/announcements.ts`, Task 2); `Category = "announcements"` / `Lane` (`components/Lane.tsx`, Task 3); `Button` (`components/ui/Button.tsx`); `Input`/`Label` (`components/ui/Input.tsx`); `useRealtimeRefresh` (`lib/hooks/useRealtimeRefresh.ts`); `createClient` (`lib/supabase/client.ts`).
- Produces: `AddAnnouncementForm({ householdId, authorId, onDone }: { householdId: string; authorId: string; onDone: () => void })` and `AnnouncementsBoard({ householdId, members, announcements, currentUserId }: { householdId: string; members: HouseholdMember[]; announcements: Announcement[]; currentUserId: string })` — both consumed by Task 5's page.

- [ ] **Step 1: Write `AddAnnouncementForm`**

Create `components/announcements/AddAnnouncementForm.tsx`:

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { addAnnouncement } from "@/lib/queries/announcements";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";

export function AddAnnouncementForm({
  householdId,
  authorId,
  onDone,
}: {
  householdId: string;
  authorId: string;
  onDone: () => void;
}) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const supabase = createClient();
      await addAnnouncement(supabase, {
        householdId,
        authorId,
        title: title.trim(),
        body: body.trim(),
      });
      router.refresh();
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't post announcement.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="ruled space-y-4 rounded-xl bg-paper-raised p-4">
      <div>
        <Label htmlFor="announcement-title">Title</Label>
        <Input
          id="announcement-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Rent due Friday"
          required
        />
      </div>
      <div>
        <Label htmlFor="announcement-body">Message</Label>
        <textarea
          id="announcement-body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Details for the house…"
          required
          rows={3}
          className="w-full border-0 border-b-2 border-rule bg-transparent px-0.5 py-2 text-base text-ink placeholder:text-ink-soft/60 focus:border-action focus:outline-none"
        />
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}

      <div className="flex gap-2">
        <Button type="submit" disabled={submitting}>
          {submitting ? "Posting…" : "Post"}
        </Button>
        <Button type="button" variant="ghost" onClick={onDone}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
```

- [ ] **Step 2: Write `AnnouncementsBoard`**

Create `components/announcements/AnnouncementsBoard.tsx`:

```tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useRealtimeRefresh } from "@/lib/hooks/useRealtimeRefresh";
import { deleteAnnouncement, setAnnouncementPinned } from "@/lib/queries/announcements";
import type { Announcement, HouseholdMember } from "@/lib/types";
import { Lane } from "@/components/Lane";
import { Button } from "@/components/ui/Button";
import { AddAnnouncementForm } from "./AddAnnouncementForm";

function sortAnnouncements(items: Announcement[]): Announcement[] {
  return [...items].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
}

export function AnnouncementsBoard({
  householdId,
  members,
  announcements,
  currentUserId,
}: {
  householdId: string;
  members: HouseholdMember[];
  announcements: Announcement[];
  currentUserId: string;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [adding, setAdding] = useState(false);
  const [pinOverrides, setPinOverrides] = useState<Record<string, boolean>>({});
  const [pinInFlight, setPinInFlight] = useState<Set<string>>(new Set());
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useRealtimeRefresh(supabase, `announcements-${householdId}`, [
    { table: "announcements", filter: `household_id=eq.${householdId}` },
  ]);

  // Once fresh server data agrees with an optimistic override, drop it so a
  // later change (ours or a roommate's) isn't masked by stale local state.
  useEffect(() => {
    setPinOverrides((prev) => {
      const next = { ...prev };
      for (const item of announcements) {
        if (next[item.id] === item.pinned) delete next[item.id];
      }
      return next;
    });
  }, [announcements]);

  const nameById = new Map(members.map((m) => [m.user_id, m.display_name]));
  const displayAnnouncements = sortAnnouncements(
    announcements.map((item) => (item.id in pinOverrides ? { ...item, pinned: pinOverrides[item.id] } : item))
  );

  async function togglePinned(item: Announcement) {
    const next = !item.pinned;
    setPinOverrides((prev) => ({ ...prev, [item.id]: next }));
    setPinInFlight((prev) => new Set(prev).add(item.id));
    try {
      await setAnnouncementPinned(supabase, item.id, next);
      router.refresh();
    } catch {
      setPinOverrides((prev) => ({ ...prev, [item.id]: item.pinned }));
    } finally {
      setPinInFlight((prev) => {
        const next = new Set(prev);
        next.delete(item.id);
        return next;
      });
    }
  }

  async function handleDelete(item: Announcement) {
    setDeletingId(item.id);
    try {
      await deleteAnnouncement(supabase, item.id);
      router.refresh();
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-4">
      {adding ? (
        <AddAnnouncementForm householdId={householdId} authorId={currentUserId} onDone={() => setAdding(false)} />
      ) : (
        <Button onClick={() => setAdding(true)} className="w-full">
          + Post an announcement
        </Button>
      )}

      <div className="space-y-3">
        {displayAnnouncements.length === 0 && (
          <p className="text-center text-sm text-ink-soft">No announcements yet.</p>
        )}
        {displayAnnouncements.map((item) => (
          <Lane key={item.id} category="announcements" title={item.title}>
            <p className="whitespace-pre-wrap text-sm text-ink">{item.body}</p>
            <div className="mt-3 flex items-center justify-between gap-3 text-xs text-ink-soft">
              <span>
                {nameById.get(item.author_id) ?? "someone"} · {new Date(item.created_at).toLocaleDateString()}
              </span>
              <div className="flex shrink-0 gap-2">
                <Button
                  variant={item.pinned ? "action" : "ghost"}
                  onClick={() => togglePinned(item)}
                  disabled={pinInFlight.has(item.id)}
                >
                  {item.pinned ? "Pinned" : "Pin"}
                </Button>
                {item.author_id === currentUserId && (
                  <Button variant="danger" onClick={() => handleDelete(item)} disabled={deletingId === item.id}>
                    {deletingId === item.id ? "…" : "Delete"}
                  </Button>
                )}
              </div>
            </div>
          </Lane>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit -p tsconfig.json`
Expected: no output.

- [ ] **Step 4: Commit**

```bash
git add components/announcements/AddAnnouncementForm.tsx components/announcements/AnnouncementsBoard.tsx
git commit -m "Add AnnouncementsBoard and AddAnnouncementForm components"
```

---

### Task 5: Route page — `/dashboard/announcements`

**Files:**
- Create: `app/dashboard/announcements/page.tsx`

**Interfaces:**
- Consumes: `getMyHousehold`, `getHouseholdMembers` (`lib/queries/household.ts`); `listAnnouncements` (`lib/queries/announcements.ts`, Task 2); `AnnouncementsBoard` (Task 4); `createClient` (`lib/supabase/server.ts`).
- Produces: the `/dashboard/announcements` route, reachable from the Task 3 nav tab and the Task 6 dashboard teaser.

- [ ] **Step 1: Write the page**

Create `app/dashboard/announcements/page.tsx`:

```tsx
import { createClient } from "@/lib/supabase/server";
import { getMyHousehold, getHouseholdMembers } from "@/lib/queries/household";
import { listAnnouncements } from "@/lib/queries/announcements";
import { AnnouncementsBoard } from "@/components/announcements/AnnouncementsBoard";

export default async function AnnouncementsPage() {
  const supabase = await createClient();
  const context = await getMyHousehold(supabase);
  if (!context) return null;

  const [members, announcements] = await Promise.all([
    getHouseholdMembers(supabase, context.household.id),
    listAnnouncements(supabase, context.household.id),
  ]);

  return (
    <AnnouncementsBoard
      householdId={context.household.id}
      members={members}
      announcements={announcements}
      currentUserId={context.membership.user_id}
    />
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit -p tsconfig.json`
Expected: no output.

- [ ] **Step 3: Manual browser walkthrough**

If a logged-in session is available (see Global Constraints re: signup being blocked in this project), start the dev server and:
1. Click the "Announcements" tab. Confirm the page loads with "No announcements yet."
2. Click "+ Post an announcement", fill in a title and message, submit. Confirm it appears in the feed with your display name and today's date.
3. Click "Pin" on it. Confirm the button switches to "Pinned" immediately (before any network round-trip visibly completes) and stays that way after the page's `router.refresh()` lands.
4. Confirm a "Delete" button is visible on your own post.
5. Click "Delete". Confirm the post disappears.

If no logged-in session is available, skip this step (note it as skipped) — Task 1's SQL check and this task's typecheck are sufficient to catch structural errors.

- [ ] **Step 4: Commit**

```bash
git add app/dashboard/announcements/page.tsx
git commit -m "Add /dashboard/announcements route"
```

---

### Task 6: Dashboard home teaser

**Files:**
- Modify: `app/dashboard/page.tsx`

**Interfaces:**
- Consumes: `listAnnouncements` (`lib/queries/announcements.ts`, Task 2); `Lane` with `category="announcements"` (Task 3).
- Produces: nothing consumed by later tasks (this is the last task).

- [ ] **Step 1: Fetch announcements on the dashboard**

In `app/dashboard/page.tsx`, add the import:

```ts
import { listAnnouncements } from "@/lib/queries/announcements";
```

Change the `Promise.all` call from:

```ts
  const [members, expenses, chores, groceries, quietHours] = await Promise.all([
    getHouseholdMembers(supabase, household.id),
    listExpenses(supabase, household.id),
    listChores(supabase, household.id),
    listGroceryItems(supabase, household.id),
    listQuietHours(supabase, household.id),
  ]);
```

to:

```ts
  const [members, expenses, chores, groceries, quietHours, announcements] = await Promise.all([
    getHouseholdMembers(supabase, household.id),
    listExpenses(supabase, household.id),
    listChores(supabase, household.id),
    listGroceryItems(supabase, household.id),
    listQuietHours(supabase, household.id),
    listAnnouncements(supabase, household.id),
  ]);
```

- [ ] **Step 2: Add the teaser section**

In the returned JSX, immediately after the opening `<p className="text-sm text-ink-soft">This week&apos;s spread for {household.name}.</p>` line and before the `<Link href="/dashboard/expenses">` block, add:

```tsx
      {announcements.length > 0 && (
        <Link href="/dashboard/announcements">
          <Lane category="announcements">
            <ul className="space-y-1.5">
              {announcements.slice(0, 2).map((a) => (
                <li key={a.id} className="text-sm">
                  <span className="font-semibold text-ink">{a.title}</span>{" "}
                  <span className="text-ink-soft">— {nameById.get(a.author_id) ?? "someone"}</span>
                </li>
              ))}
            </ul>
          </Lane>
        </Link>
      )}
```

(`nameById` already exists in this file from the existing `const nameById = new Map(members.map(...))` line — no new lookup needed.)

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit -p tsconfig.json`
Expected: no output.

- [ ] **Step 4: Manual browser walkthrough**

If a logged-in session is available:
1. With no announcements posted, load `/dashboard`. Confirm no announcements section renders (no empty-state clutter).
2. Post an announcement (via the Announcements tab), then return to `/dashboard`. Confirm a teaser card appears above the Expenses card showing the post's title and author, and that clicking it navigates to `/dashboard/announcements`.

If no logged-in session is available, skip this step and note it as skipped.

- [ ] **Step 5: Commit**

```bash
git add app/dashboard/page.tsx
git commit -m "Add announcements teaser to dashboard home"
```
