import { zeroCategoryTotals, type Category } from "@/domain/category"
import { db, type Expense, type ExpenseDatabase } from "@/db/database"

export type NewExpense = Omit<Expense, "id" | "createdAt">

export interface ExpenseRepository {
  add(expense: NewExpense): Promise<number>
  remove(id: number): Promise<void>
  listByDate(date: string): Promise<Expense[]>
  listByMonth(yearMonth: string): Promise<Expense[]>
  dayTotals(yearMonth: string): Promise<Map<string, number>>
  pillarTotals(yearMonth: string): Promise<Record<Category, number>>
}

export function createExpenseRepository(
  db: ExpenseDatabase
): ExpenseRepository {
  async function listByMonth(yearMonth: string) {
    const expenses = await db.expenses
      .where("date")
      .startsWith(yearMonth)
      .toArray()
    return expenses.sort(
      (a, b) => a.date.localeCompare(b.date) || a.createdAt - b.createdAt
    )
  }

  return {
    async add(expense) {
      return db.expenses.add({ ...expense, createdAt: Date.now() })
    },
    async remove(id) {
      await db.expenses.delete(id)
    },
    async listByDate(date) {
      return db.expenses.where("date").equals(date).sortBy("createdAt")
    },
    listByMonth,
    async dayTotals(yearMonth) {
      const expenses = await listByMonth(yearMonth)
      const totals = new Map<string, number>()
      for (const expense of expenses) {
        totals.set(
          expense.date,
          (totals.get(expense.date) ?? 0) + expense.amount
        )
      }
      return totals
    },
    async pillarTotals(yearMonth) {
      const expenses = await listByMonth(yearMonth)
      const totals = zeroCategoryTotals()
      for (const expense of expenses) {
        totals[expense.category] += expense.amount
      }
      return totals
    },
  }
}

export const expenseRepository = createExpenseRepository(db)
