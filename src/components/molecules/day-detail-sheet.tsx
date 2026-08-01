import * as React from "react"

import { expenseRepository } from "@/db/expense-repository"
import type { Expense } from "@/db/database"
import { formatCurrency, type CurrencyCode } from "@/domain/currency"
import { parseDateKey } from "@/domain/date"
import { useCurrency } from "@/providers/currency-provider"
import { useDateOrder } from "@/providers/date-order-provider"
import { parseExpenseInput, type ParseError } from "@/utils/parse-expense-input"
import { DeleteButton } from "@/components/atoms/delete-button"
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/atoms/drawer"
import { ExpenseInputForm } from "@/components/molecules/expense-input-form"

interface DayDetailSheetProps {
  dateKey: string | undefined
  onClose: () => void
  onExpensesChanged: (entryDate?: string) => void
}

export function DayDetailSheet({
  dateKey,
  onClose,
  onExpensesChanged,
}: DayDetailSheetProps) {
  const { currency } = useCurrency()
  const { dateOrder } = useDateOrder()
  const [expenses, setExpenses] = React.useState<Expense[]>([])
  const [refreshToken, setRefreshToken] = React.useState(0)

  React.useEffect(() => {
    if (!dateKey) return

    let cancelled = false
    expenseRepository.listByDate(dateKey).then((result) => {
      if (!cancelled) setExpenses(result)
    })
    return () => {
      cancelled = true
    }
  }, [dateKey, refreshToken])

  async function handleAdd(raw: string): Promise<ParseError | undefined> {
    if (!dateKey) return undefined

    const result = parseExpenseInput(raw, { dateOrder })
    if (!result.ok) return result.error

    const date = result.value.date ?? dateKey
    await expenseRepository.add({ ...result.value, date })
    setRefreshToken((token) => token + 1)
    onExpensesChanged(date)
    return undefined
  }

  async function handleDelete(id: number) {
    await expenseRepository.remove(id)
    setRefreshToken((token) => token + 1)
    onExpensesChanged()
  }

  const total = expenses.reduce((sum, expense) => sum + expense.amount, 0)
  const title = dateKey
    ? parseDateKey(dateKey).toLocaleDateString(undefined, {
        weekday: "long",
        month: "long",
        day: "numeric",
      })
    : ""

  return (
    <Drawer
      open={dateKey !== undefined}
      onOpenChange={(open) => !open && onClose()}
    >
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{title}</DrawerTitle>
          <p className="text-sm text-muted-foreground">
            {formatCurrency(total, currency)} total
          </p>
        </DrawerHeader>
        {dateKey && (
          <div className="px-4 pb-4">
            <ExpenseInputForm onSubmit={handleAdd} />
          </div>
        )}
        <div className="flex flex-col overflow-y-auto px-4 pb-6">
          {expenses.length === 0 ? (
            <EmptyExpenseList />
          ) : (
            expenses.map((expense) => (
              <ExpenseRow
                key={expense.id}
                expense={expense}
                currency={currency}
                onDelete={() => handleDelete(expense.id)}
              />
            ))
          )}
        </div>
      </DrawerContent>
    </Drawer>
  )
}

interface ExpenseRowProps {
  expense: Expense
  currency: CurrencyCode
  onDelete: () => void
}

function ExpenseRow({ expense, currency, onDelete }: ExpenseRowProps) {
  return (
    <div className="flex items-center justify-between gap-2 border-b border-border py-3 last:border-0">
      <div className="flex flex-col">
        <span className="text-sm font-medium">{expense.description}</span>
        <span className="text-xs text-muted-foreground capitalize">
          {expense.category}
        </span>
      </div>
      <div className="flex items-center gap-1">
        <span className="text-sm font-medium">
          {formatCurrency(expense.amount, currency)}
        </span>
        <DeleteButton onConfirm={onDelete}>{expense.description}</DeleteButton>
      </div>
    </div>
  )
}

function EmptyExpenseList() {
  return (
    <p className="py-6 text-center text-sm text-muted-foreground">
      No expenses logged
    </p>
  )
}
