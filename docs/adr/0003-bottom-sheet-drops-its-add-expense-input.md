# Bottom sheet drops its add-expense input

Status: accepted

[0001](0001-bottom-sheet-gains-its-own-add-expense-input.md) gave the day-detail bottom sheet its own embedded add-expense input, reasoning that the sheet's entry date was already fixed by which day it was opened for, so it didn't need the floating input's `at {{date}}` clause at all.

That reasoning assumed backdating only worked _from inside_ a day's sheet. It doesn't anymore: the floating input's `at {{date}}` clause (see `CONTEXT.md`) already lets a user target any past day from anywhere in the app, including a day whose sheet isn't open. The in-sheet input was solving a problem the floating input already solves, just with a second, redundant UI for it. We reverted to the original MVP spec's read + delete only scope for the bottom sheet — adding an expense, backdated or not, always goes through the one floating input.
