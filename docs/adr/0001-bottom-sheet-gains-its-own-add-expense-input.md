# Bottom sheet gains its own add-expense input

Status: superseded by [0003](0003-bottom-sheet-drops-its-add-expense-input.md)

The original MVP spec (`.scratch/kakeibo-expense-tracker/spec.md`, "Interaction structure") deliberately scoped the day-detail bottom sheet as read + delete only, with no add/edit capability — corrections were meant to happen via delete-then-re-enter through the main floating input. That held as long as every entry was implicitly dated today.

Backdating (see `CONTEXT.md`) breaks that assumption: a day's bottom sheet is now a natural place to add an expense _for that specific day_, without needing the floating input's `at {{date}}` clause at all — the entry date is already fixed by which sheet is open. We reversed the original decision and gave the sheet its own embedded add-expense input, reusing the same free-text parsing grammar as the floating input.
