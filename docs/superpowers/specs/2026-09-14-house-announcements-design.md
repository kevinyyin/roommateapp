# House Announcements — Design

## Purpose

Give a household a shared bulletin board for house-wide notes ("AC repair
Tuesday", "out of town this weekend", "rent due Friday") that's more visible
and more structured than a chat message, and doesn't fit any existing feature
(expenses, chores, groceries, quiet hours).

## Data model

New table `announcements`:

| column        | type        | notes                                   |
|---------------|-------------|------------------------------------------|
| `id`          | uuid        | primary key, default `gen_random_uuid()` |
| `household_id`| uuid        | FK → `households.id`                     |
| `author_id`   | uuid        | the posting user's id                    |
| `title`       | text        | required                                 |
| `body`        | text        | required                                 |
| `pinned`      | boolean     | default `false`                          |
| `created_at`  | timestamptz | default `now()`                          |

### RLS policies

Follows the two existing conventions in this schema:
- Shared, anyone-can-touch resources (`chores`, `expenses`, `grocery_items`)
  gate every operation on `is_household_member(household_id)`.
- Personally-owned rows (`quiet_hours`) additionally gate `INSERT`/`UPDATE`/
  `DELETE` on `user_id = auth.uid()`.

Announcements are a hybrid: anyone can post and anyone can pin/unpin (a
shared, house-wide signal — same shared-toggle trust model as marking a
chore done or a grocery item bought), but only the author can delete their
own post.

```sql
-- SELECT: any household member
is_household_member(household_id)

-- INSERT: any household member, but must insert as themselves
with check (author_id = auth.uid() and is_household_member(household_id))

-- UPDATE: any household member (app only ever sends {pinned} in this call,
-- same trust model the rest of the app uses — no column-level enforcement)
is_household_member(household_id)

-- DELETE: only the author
author_id = auth.uid()
```

## Query layer

New `lib/queries/announcements.ts`, mirroring `lib/queries/groceries.ts`:

- `listAnnouncements(supabase, householdId)` — ordered `pinned desc, created_at desc`.
- `addAnnouncement(supabase, { householdId, authorId, title, body })`
- `setAnnouncementPinned(supabase, id, pinned)`
- `deleteAnnouncement(supabase, id)`

`lib/types.ts` gains `export type Announcement = Tables<"announcements">;`.

## UI

### New feature area: `components/announcements/`

- `AnnouncementsBoard.tsx` — the full feed. Add-post button reveals
  `AddAnnouncementForm` (title + body fields), matching the
  `AddChoreForm`/`AddExpenseForm` show/hide pattern. Each post renders
  title, body, author display name, relative timestamp, a pin/unpin
  `Button` (any member), and a delete `Button` that only renders when
  `post.author_id === currentUserId`.
- `AddAnnouncementForm.tsx` — title + body inputs, submit/cancel, same
  submitting/error state pattern as the other add-forms.
- Subscribes via the existing `useRealtimeRefresh` hook to the
  `announcements` table filtered by `household_id`.

### Navigation

- New route `app/dashboard/announcements/page.tsx` — server component,
  fetches members + announcements, renders `AnnouncementsBoard`, matching
  `app/dashboard/chores/page.tsx`.
- `components/BottomNav.tsx`'s `TABS` array gains `"announcements"`.
- `components/Lane.tsx`'s `CATEGORY_META` and `components/icons.tsx`'s
  `CATEGORY_ICONS` each gain a 5th entry. A new accent color/tint pair is
  added to `app/globals.css`: `--color-announcements: #b1467c` (dusty
  rose/mauve) and `--color-announcements-tint: #f6e8ef` — distinct from
  the existing coral/teal/amber/indigo, and clear of the ink-blue
  `--color-action` reserved for pressable controls. A new line-icon (a
  pushpin glyph, matching the existing outlined-icon style in
  `icons.tsx`) is added as `AnnouncementsIcon`.

  **Design-thesis note:** `app/layout.tsx` embeds a direction contract
  describing "four category highlighter accents" as a deliberate part of
  Roomly's visual identity. Adding a 5th nav tab intentionally breaks that
  "four" framing. This is a known, accepted tradeoff for this feature, not
  an oversight — flagged here so it's visible to anyone reading this spec
  later.

### Dashboard home teaser

`app/dashboard/page.tsx` gains a new section above the existing four
`Lane` summary cards: the 1–2 most recent announcements (pinned ones
prioritized), each teaser linking to `/dashboard/announcements`. If there
are no announcements yet, the section is omitted (no empty-state clutter
on the home screen — the empty state lives on the full tab instead).

## Testing

Manual, in the browser (same constraint as prior work in this repo: a
fresh Supabase project with no SMTP configured blocks new-user signup via
the UI, so full logged-in verification depends on an existing test
account):

- Post an announcement, confirm it appears in the feed and in the
  dashboard teaser.
- Pin a post, confirm it sorts above unpinned posts regardless of age.
- Confirm the delete button only renders for the post's own author.
- Confirm realtime: a change from one session's `router.refresh()` /
  postgres_changes subscription reflects on another open session.

## Out of scope (for this iteration)

- Editing an existing post's title/body.
- Comments or reactions on a post.
- Notifications/push for new announcements.
- Expiry/auto-archiving of old posts.
