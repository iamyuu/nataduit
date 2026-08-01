import * as React from "react"
import { ArrowUpIcon } from "@phosphor-icons/react"

import type { ParseError } from "@/utils/parse-expense-input"
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

interface ExpenseInputFormProps {
  onSubmit: (raw: string) => Promise<ParseError | undefined>
  placeholder?: string
  className?: string
}

export function ExpenseInputForm({
  onSubmit,
  placeholder = "burger 23k",
  className,
}: ExpenseInputFormProps) {
  const [value, setValue] = React.useState("")
  const [error, setError] = React.useState<ParseError>()

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()

    const submitError = await onSubmit(value)
    if (submitError) {
      setError(submitError)
      return
    }

    setError(undefined)
    setValue("")
  }

  return (
    <form onSubmit={handleSubmit} className={className}>
      {error && (
        <p className="mb-1.5 px-2.5 text-xs text-destructive">
          {PARSE_ERROR_MESSAGES[error]}
        </p>
      )}
      <InputGroup className="h-10 bg-background shadow-lg">
        <InputGroupInput
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder={placeholder}
          aria-label="Add an expense"
        />
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
