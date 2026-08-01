# NataDuit

A minimalist Kakeibo-style expense tracker: expenses are logged into one of four fixed budgeting pillars and reviewed on a calendar.

## Language

**Expense**:
A single logged spend: an entry date, a pillar, a description, and an amount.
_Avoid_: Transaction

**Pillar**:
One of the four fixed Kakeibo budgeting categories an expense is filed under: Needs, Wants, Culture, or Unexpected.
_Avoid_: Category (the codebase currently uses `Category` as the type/field name — a naming tension worth reconciling later, not renamed as part of this decision)

**Entry date**:
The date an expense is filed against on the calendar — defaults to today, or an earlier date via backdating. Never later than today: an expense only ever records spending that has already happened.
_Avoid_: Log date, transaction date

**Backdating**:
Logging an expense against an entry date earlier than today, either via the floating input's trailing `at {{date}}` clause or the day-detail sheet's own add-expense input, whose entry date is implicitly the day it's opened for.
_Avoid_: Retroactive entry, past-dating

**Date-order preference**:
A user setting controlling whether backdating's `at {{date}}` clause is read as day-then-month or month-then-day. Defaults to day-then-month.
