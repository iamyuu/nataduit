Status: ready-for-agent

# Kakeibo Expense Tracker — MVP

## Problem Statement

Kakeibo is a Japanese budgeting method built around mindfully recording every expense into one of four reflection categories — needs, wants, culture, and unexpected — so a person can later see the *shape* of their spending, not just the total. In practice, the method fails the moment logging an expense takes more than a few seconds: multi-screen forms, category dropdowns, and date pickers turn a habit meant to build awareness into a chore, and people stop logging within days.

## Solution

A single-page, mobile-first web app whose entire surface is a big monthly calendar (styled after `.scratch/references/kakeibo-calendar.jpg`) and one floating text input. Logging an expense is typing one line — `"{{category}} {{description}} {{amount}}"` — and hitting submit; the category is optional and defaults to "wants". The calendar shows each day's total spend with heatmap shading so the month's pattern is visible at a glance, a monthly per-pillar summary sits below it for the Kakeibo reflection moment, and tapping a day opens a bottom sheet to see or delete that day's individual entries. Everything is stored locally (IndexedDB via Dexie.js) — no accounts, no server, no sync.

## User Stories

1. As a Kakeibo practitioner, I want to log an expense by typing a single line of free text, so that recording spend takes seconds and I actually keep the habit.
2. As a user, I want to omit the category and have it default to "wants", so that I don't have to think about categorization for quick casual purchases.
3. As a user, I want to type a category as the first word (e.g. "need", "culture", "unexpected"), so that the expense is filed under the correct Kakeibo pillar.
4. As a user, I want category matching to be case-insensitive and accept close singular/plural variants, so that small typing differences don't break the parse.
5. As a user, I want an unrecognized first word to be treated as part of the description (not an error), so that the app never rejects a normal purchase just because it doesn't start with a pillar name.
6. As a user, I want to type an amount using "k" shorthand (e.g. "23k" for 23,000), so that I don't have to type long numbers for everyday purchases.
7. As a user, I want to type a decimal amount, with or without the "k" suffix (e.g. "23.5k" or "149.99"), so that I can record exact prices.
8. As a user, I want to optionally prefix or type the amount with a currency symbol (e.g. "$149", "¥35"), so that entry still feels natural even though the app only tracks one active currency.
9. As a user, I want the app to reject an entry with no valid amount and show an inline error, so that I never end up with an unusable expense record.
10. As a user, I want the app to reject an entry with no description and show an inline error, so that every expense stays meaningful when I look back at it.
11. As a user, I want my typed text to remain in the input after a failed submission, so that I can fix it without retyping everything.
12. As a user, I want every expense I log to be saved under today's date automatically, so that entry stays a single action with no extra steps.
13. As a user, I want to see a big calendar for the current month as the app's main screen, so that I can see my spending pattern at a glance.
14. As a user, I want each day cell to show that day's total spend, so that I can quickly spot high-spending days.
15. As a user, I want day cells to be shaded by relative spend (a heatmap), so that I can visually scan the month without reading every number.
16. As a user, I want days with no spend to render without heat shading, so that quiet days are visually distinct from logged ones.
17. As a user, I want the calendar laid out as weekday rows against week-of-month columns (matching the reference image), so that the "week over week" reading of a habit tracker is preserved rather than a generic month grid.
18. As a user, I want days outside the current month shown with a diagonal hatch and non-interactive, so the grid reads as complete without confusing me about which cells are real days.
19. As a user, I want to navigate to the previous/next month via arrows beside the month name, so that I can review my spending history.
20. As a user, I want to tap a day to open a bottom sheet listing that day's expenses, so that I can see the individual purchases behind a day's total.
21. As a user, I want each expense in the bottom sheet to show its category, description, and formatted amount, so that I can review what I logged.
22. As a user, I want to delete an individual expense from the bottom sheet, so that I can correct a mistaken entry (by deleting and re-adding it).
23. As a user, I want a clear empty state when a day has no expenses, so I know the bottom sheet isn't broken, just empty.
24. As a user, I want a monthly summary of totals per Kakeibo pillar (needs/wants/culture/unexpected) below the calendar, so that I can reflect on my spending balance the way Kakeibo intends.
25. As a user, I want a settings icon in the toolbar next to the month name, so that I can reach app settings without leaving the main screen.
26. As a user, I want to change my currency from a small settings sheet, so that all amounts display in my preferred currency.
27. As a user, I want changing the currency to only affect display formatting, not convert past amounts, so that my recorded numbers stay accurate and predictable.
28. As a user, I want all my expense data stored locally on my device, so that the app works offline and I don't need an account.
29. As a user, I want the app optimized for a phone-sized screen, so that I can log expenses on the go, which is when I actually spend money.
30. As a developer, I want the free-text parsing logic isolated in a single pure function, so that every input-format edge case can be unit-tested without a UI or database.
31. As a developer, I want persistence isolated behind a repository interface backed by Dexie, so that data and aggregation logic (day totals, month pillar totals) can be tested without going through the UI.

## Implementation Decisions

**Modules**

- `parseExpenseInput` — a pure function, the single source of truth for turning raw floating-input text into either a valid expense draft or a validation error. No I/O.
- `ExpenseRepository` — a Dexie-backed module owning all reads/writes to the expense ledger, including the aggregation queries the calendar and summary need.
- A `currency` setting stored in `localStorage` (not Dexie) under one key — it's a single scalar value with no query needs, so it doesn't belong in the ledger's persistence layer.
- UI components (calendar grid, day cell, floating input, bottom sheet, settings sheet, pillar summary) are thin: they call the parser and repository and render their results. No business logic lives in components.

**Parsing grammar**

- Input shape: `{{category?}} {{description}} {{amount}}`, whitespace-separated.
- **Category** (optional, first token only): matched case-insensitively against a fixed alias map for the four pillars — `needs` (`needs`, `need`), `wants` (`wants`, `want`), `culture` (`culture`), `unexpected` (`unexpected`). If the first token doesn't match any alias, it's treated as the start of the description and category defaults to `wants`.
- **Amount** (required, always the last token): an optional leading currency symbol (from the supported set below), a numeric value (decimals allowed), and an optional trailing `k`/`K` suffix meaning ×1,000 (e.g. `23k`, `23.5k`, `$149`, `¥35`, `$23k`). The symbol is parsed and discarded — it does not select or change the active currency, it's purely accepted so the input still reads naturally.
- **Description** (required): everything between the category (if matched) and the amount token. Empty description is a validation error.
- Validation errors: `missing-amount` (last token isn't a valid amount), `missing-description` (nothing left between category and amount). Both are surfaced inline near the floating input; the typed text is preserved for correction. No entry is ever saved from an unparseable string.

**Currency**

- One global currency, stored in `localStorage`, changed via a settings bottom sheet reached from a toolbar icon next to the month name.
- Supported currency list for the MVP: USD (`$`), JPY (`¥`), EUR (`€`), GBP (`£`), IDR (`Rp`) — covers the symbols used in the brief's own examples plus common regional coverage; the settings sheet is just a picker over this fixed list.
- Stored amounts are plain numbers with no currency tag — changing the active currency only changes how existing and future amounts are *formatted* (via `Intl.NumberFormat`), never their stored value. There is no conversion between currencies.

**Data model (Dexie)**

- Single table `expenses`: `id` (auto-increment PK), `date` (`YYYY-MM-DD` string, indexed), `category` (`"needs" | "wants" | "culture" | "unexpected"`), `description` (string), `amount` (number), `createdAt` (timestamp, for stable ordering within a day).
- Only `date` is indexed. A month's records are fetched by a `date` range query once per month view; day totals and pillar totals are computed client-side by reducing that already-fetched set — at realistic personal-expense volumes (tens of entries/month) a second index for `category` isn't worth the schema complexity.
- `ExpenseRepository` surface: `add(expense)`, `remove(id)`, `listByDate(date)`, `listByMonth(yearMonth)`, `dayTotals(yearMonth): Map<date, number>`, `pillarTotals(yearMonth): Record<Category, number>`.
- Every write goes through `date = today` — there is no day-selection state; backdating a past day is explicitly out of scope for this MVP (see below).

**Calendar & heatmap**

- Grid replicates `.scratch/references/kakeibo-calendar.jpg` exactly: weekday rows (Mon–Sun) as the fixed axis, week-of-month as columns, days outside the current month rendered with a diagonal hatch and disabled.
- Each in-month cell shows only that day's total (no per-pillar breakdown on the cell itself).
- Heatmap shading buckets the current month's non-zero day totals into 5 discrete steps via linear min–max scaling, mapped onto the existing `--chart-1` … `--chart-5` custom properties in `src/styles/global.css` (lightest → darkest for lowest → highest spend). Days with zero spend render with no fill, only the cell border/number.

**Interaction structure**

- Floating input is fixed at the bottom of the screen, always targets "today," and is hidden while the bottom sheet is open.
- Tapping any in-month day cell (spend or no spend) opens the bottom sheet for that date: a header with the day's total, a list of that day's expenses (category, description, formatted amount), and a delete action per row. No add/edit inside the sheet — corrections are delete-then-re-enter via the floating input.
- The monthly pillar summary is a compact section below the calendar grid, showing the four pillar totals for the month currently in view, formatted in the active currency.

## Testing Decisions

- Test runner: **Vitest** — none is configured in this scaffold yet; this spec introduces it (matches the existing Vite toolchain).
- Good tests here assert on external behavior — the parser's input/output contract and the repository's persisted/queried data — never on internal implementation details of either.
- **`parseExpenseInput`**: table-driven unit tests, no I/O. Cover: every example from the brief ("burger 23k", "need electricty 100k", "unexpected tire repairs 5k", "culture svg course $149", "culture atomic book ¥35"), category aliasing and case-insensitivity, unmatched first word falling through to description + default "wants", decimal amounts with and without the `k` suffix, currency-symbol stripping, missing amount, missing description, and extra/irregular whitespace.
- **`ExpenseRepository`**: integration tests against a real Dexie instance backed by `fake-indexeddb` (no browser required). Cover `add`/`remove`/`listByDate`/`listByMonth` correctness and the `dayTotals`/`pillarTotals` aggregation math, including month boundaries and days/months with zero entries.
- No component/UI tests in this MVP spec — the UI layer is intentionally thin over the two seams above. This is a fresh scaffold with no prior test code, so this spec establishes the convention: tests colocated as `*.test.ts` next to the module they cover.

## Out of Scope

- **Multi-currency / conversion** — one global currency only; a typed currency symbol is cosmetic and never changes or tags the stored amount.
- **Income, budget targets, and savings-goal tracking** — this MVP is expense-logging only; the traditional Kakeibo income/savings-goal reflection is a distinct, larger future effort.
- **Desktop-responsive layout** — mobile-first only; no breakpoint/layout work for wider viewports.
- **Editing existing expenses** — the bottom sheet supports delete only; corrections happen via delete + re-add through the floating input.
- **Backdating expenses to a past day** — the floating input always targets today; there is no flow yet for logging an expense against an earlier date.
- **Accounts, sync, multi-device, and offline-conflict handling** — data lives in one browser's IndexedDB with no account system.

## Further Notes

- The calendar's exact visual structure (transposed weekday-rows grid, diagonal hatch for out-of-month days, heatmap shading) is drawn directly from `.scratch/references/kakeibo-calendar.jpg` — treat it as the visual source of truth, not just a mood reference.
- Heatmap and any other categorical/sequential coloring should reuse the `--chart-1`…`--chart-5` tokens already defined in `src/styles/global.css` rather than introducing new color values.
- Backdating past-day expenses (noted as out of scope above) is a likely near-term follow-up once this MVP ships — worth revisiting as its own effort rather than folding in now.
- This spec was synthesized from an extensive prior requirements conversation covering parsing grammar, storage choice, currency handling, and UI structure; no additional stakeholder interview was conducted per `/to-spec`'s process.
