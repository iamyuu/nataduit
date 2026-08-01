import * as React from "react"
import { ArrowUpIcon } from "@phosphor-icons/react"

import type { Category } from "@/domain/category"
import { useDateOrder } from "@/providers/date-order-provider"
import {
  getExpenseInputHighlights,
  type InputHighlight,
  type ParseError,
} from "@/utils/parse-expense-input"
import { cn } from "@/utils/misc"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/atoms/input-group"

const PARSE_ERROR_MESSAGES: Record<ParseError, string> = {
  "missing-amount": 'Add an amount, like "23k" or "$23"',
  "missing-description": "Add a short description",
  "future-date": "That date hasn't happened yet",
}

const CATEGORY_HIGHLIGHT_CLASSES: Record<Category, string> = {
  needs: "bg-pillar-needs/20 text-pillar-needs",
  wants: "bg-pillar-wants/20 text-pillar-wants",
  culture: "bg-pillar-culture/20 text-pillar-culture",
  unexpected: "bg-pillar-unexpected/20 text-pillar-unexpected",
}

function highlightClassName(highlight: InputHighlight): string {
  switch (highlight.kind) {
    case "category":
      return CATEGORY_HIGHLIGHT_CLASSES[highlight.category]
    case "date":
      return "bg-highlight-date/20 text-highlight-date"
    case "date-future":
      return "bg-destructive/20 text-destructive"
    case "amount":
      return "bg-primary/20 text-primary"
  }
}

function renderHighlightedValue(
  value: string,
  highlights: InputHighlight[]
): React.ReactNode {
  if (highlights.length === 0) return value

  const segments: React.ReactNode[] = []
  let cursor = 0

  highlights.forEach((highlight) => {
    if (highlight.start > cursor) {
      segments.push(value.slice(cursor, highlight.start))
    }
    segments.push(
      <span
        key={highlight.start}
        className={cn("rounded-sm", highlightClassName(highlight))}
      >
        {value.slice(highlight.start, highlight.end)}
      </span>
    )
    cursor = highlight.end
  })

  if (cursor < value.length) segments.push(value.slice(cursor))
  return segments
}

interface ExpenseInputFormProps {
  onSubmit: (raw: string) => Promise<ParseError | undefined>
  placeholder?: string
  className?: string
  /** Starts at 75% width, growing to 100% on focus and shrinking back on
   * blur-while-empty or successful submit. Height stays fixed throughout.
   * Off by default for inputs that already live inside their own focused
   * context (e.g. an open drawer). */
  expandOnFocus?: boolean
}

export function ExpenseInputForm({
  onSubmit,
  placeholder = "burger 23k",
  className,
  expandOnFocus = false,
}: ExpenseInputFormProps) {
  const { dateOrder } = useDateOrder()
  const [value, setValue] = React.useState("")
  const [error, setError] = React.useState<ParseError>()
  const [isExpanded, setIsExpanded] = React.useState(false)

  const inputRef = React.useRef<HTMLInputElement>(null)
  const backdropRef = React.useRef<HTMLDivElement>(null)

  const highlights = React.useMemo(
    () => getExpenseInputHighlights(value, { dateOrder }),
    [value, dateOrder]
  )

  function syncBackdropScroll() {
    if (inputRef.current && backdropRef.current) {
      backdropRef.current.scrollLeft = inputRef.current.scrollLeft
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()

    const submitError = await onSubmit(value)
    if (submitError) {
      setError(submitError)
      return
    }

    setError(undefined)
    setValue("")
    if (expandOnFocus) setIsExpanded(false)
  }

  return (
    <form onSubmit={handleSubmit} className={className}>
      {error && (
        <p className="mb-1.5 px-2.5 text-xs text-destructive">
          {PARSE_ERROR_MESSAGES[error]}
        </p>
      )}
      <InputGroup
        className={cn(
          "mx-auto h-10 bg-background shadow-lg transition-[width] duration-150",
          expandOnFocus && !isExpanded ? "w-3/4" : "w-full"
        )}
      >
        <div className="relative h-full flex-1">
          <div
            ref={backdropRef}
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 overflow-hidden px-2.5 py-1 text-base whitespace-pre md:text-sm"
          >
            {renderHighlightedValue(value, highlights)}
          </div>
          <InputGroupInput
            ref={inputRef}
            value={value}
            onChange={(event) => {
              setValue(event.target.value)
              syncBackdropScroll()
            }}
            onScroll={syncBackdropScroll}
            onFocus={() => expandOnFocus && setIsExpanded(true)}
            onBlur={() => expandOnFocus && value === "" && setIsExpanded(false)}
            placeholder={placeholder}
            aria-label="Add an expense"
            className="absolute inset-0 h-full w-full text-transparent caret-foreground selection:bg-primary/30"
          />
        </div>
        <InputGroupAddon align="inline-end">
          <InputGroupButton
            type="submit"
            size="icon-sm"
            aria-label="Add expense"
          >
            <ArrowUpIcon />
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    </form>
  )
}
