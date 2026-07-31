import * as React from "react"

import { expenseRepository } from "@/db/expense-repository"
import type { Expense } from "@/db/database"
import { formatCurrency } from "@/domain/currency"
import { parseDateKey } from "@/domain/date"
import { useCurrency } from "@/providers/currency-provider"
import { DeleteButton } from "@/components/atoms/delete-button"
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/atoms/drawer"

interface DayDetailSheetProps {
  dateKey: string | undefined
  onClose: () => void
  onExpenseDeleted: () => void
}

export function DayDetailSheet({
  dateKey,
  onClose,
  onExpenseDeleted,
}: DayDetailSheetProps) {
  const { currency } = useCurrency()
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

  async function handleDelete(id: number) {
    await expenseRepository.remove(id)
    setRefreshToken((token) => token + 1)
    onExpenseDeleted()
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
        <div className="flex flex-col overflow-y-auto px-4 pb-6">
          {expenses.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No expenses logged
            </p>
          ) : (
            expenses.map((expense) => (
              <div
                key={expense.id}
                className="flex items-center justify-between gap-2 border-b border-border py-3 last:border-0"
              >
                <div className="flex flex-col">
                  <span className="text-sm font-medium">
                    {expense.description}
                  </span>
                  <span className="text-xs text-muted-foreground capitalize">
                    {expense.category}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-sm font-medium">
                    {formatCurrency(expense.amount, currency)}
                  </span>
                  <DeleteButton
                    label={expense.description}
                    onConfirm={() => handleDelete(expense.id)}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </DrawerContent>
    </Drawer>
  )
}
