import type { ParseError } from "@/utils/parse-expense-input"
import { ExpenseInputForm } from "@/components/molecules/expense-input-form"

interface FloatingInputProps {
  onSubmit: (raw: string) => Promise<ParseError | undefined>
}

export function FloatingInput({ onSubmit }: FloatingInputProps) {
  return (
    <ExpenseInputForm
      onSubmit={onSubmit}
      className="fixed inset-x-0 bottom-0 mx-auto w-full max-w-md px-4 pb-6"
    />
  )
}
