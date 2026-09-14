# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Next.js (App Router, TypeScript), Tailwind CSS, Supabase (Postgres, Auth via email/password, Realtime).

## Users

College and shared-student-housing roommates (dorms, shared apartments/houses). They're often on their phones between classes, coordinating quickly rather than sitting down for a long session.

## Product Purpose

"Roomly" coordinates daily shared-household living for a group of roommates: splitting expenses, rotating chores, maintaining a shared grocery list, and tracking quiet hours. Success means roommates spend less time arguing about who owes what or whose turn it is, because the household's shared state is visible and stays in sync in real time.

## Positioning

A single shared household hub instead of juggling separate single-purpose apps (an expense-splitter, a chore chart, a group chat for groceries). Everything lives under one household with real-time sync, so an action one roommate takes is immediately visible to the others.

## Operating Context

- A household is a group of roommates who join via a shared invite code.
- Core workflows: log a shared expense with a custom split, see running balances; define recurring chores that auto-rotate through members; add/check off shared grocery items; set personal quiet-hours schedules that merge into one household view.
- Used casually and briefly, often on mobile, between other activities.

## Capabilities and Constraints

- Auth: email/password sign-up and login (Supabase Auth).
- Household membership is invite-code based; a user belongs to one household at a time in this version.
- Expense splits support custom per-person amounts, not just even splits.
- Chore rotation auto-advances to the next member in join order when a chore is marked done.
- Quiet hours are a recurring weekly schedule per member (not one-off requests or live "quiet now" status in this version).
- Real-time sync via Supabase Realtime on all shared tables (expenses, chores, groceries, quiet hours, membership).

## Brand Commitments

Name: Roomly.

## Evidence on Hand

None yet — no existing copy, logo, or brand assets. This is a new build.

## Product Principles

- Shared state should feel instantly live — no manual refresh to see a roommate's update.
- Casual, low-friction interactions over dense/formal UI, matching brief mobile-between-class usage.
- One household hub beats several disconnected single-purpose tools.
- Fairness is explicit: balances, rotations, and schedules are always visible, not just implied.

## Accessibility & Inclusion

No specific requirement established beyond standard web accessibility (readable contrast, keyboard/touch operability).
