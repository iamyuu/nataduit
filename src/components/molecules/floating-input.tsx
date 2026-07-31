import * as React from "react"
import { ArrowUpIcon } from "@phosphor-icons/react"

import type { ParseError } from "@/parsing/parse-expense-input"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/atoms/input-group"

const ERROR_MESSAGES: Record<ParseError, string> = {
  "missing-amount": 'Add an amount, like "23k" or "$23"',
  "missing-description": "Add a short description",
}

interface FloatingInputProps {
  onSubmit: (raw: string) => Promise<ParseError | undefined>
}

export function FloatingInput({ onSubmit }: FloatingInputProps) {
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
    <form
      onSubmit={handleSubmit}
      className="fixed inset-x-0 bottom-0 mx-auto w-full max-w-md px-4 pb-6"
    >
      {error && (
        <p className="mb-1.5 px-2.5 text-xs text-destructive">
          {ERROR_MESSAGES[error]}
        </p>
      )}
      <InputGroup className="h-10 bg-background shadow-lg">
        <InputGroupInput
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="burger 23k"
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
