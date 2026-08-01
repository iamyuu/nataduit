# Inline token highlight uses an overlay backdrop, not contentEditable

Status: accepted

The expense input highlights recognized category, date-clause, and amount tokens inline as the user types (inspired by Samsung Reminder's date-chip highlighting). A native `<input>` can't render mid-text colored spans, so two implementations were on the table: rebuild the input as a `contentEditable` element rendering real styled spans as DOM content, or keep the native `<input>` and fake the effect with an overlay — make the input's own text transparent and stack a non-interactive backdrop `<div>` behind it that mirrors the same text with highlighted `<span>`s, kept in sync on every keystroke.

We chose the overlay. `contentEditable` would allow true inline pill shapes (rounded background, padding) instead of flat background-color spans, but hands over cursor placement, IME composition, copy/paste, and mobile keyboard behavior to manual DOM management — all things a native `<input>` already gets right for free. For a single-line plain-text field where no other rich formatting is needed, that reliability was worth more than the shape flexibility.

The trade-off: highlights render as flat inline background color, not rounded pill chips like the Reminder app's reference screenshot.
