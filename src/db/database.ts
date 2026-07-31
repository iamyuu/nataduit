import Dexie, { type EntityTable } from "dexie"
import { z } from "zod"
import { categorySchema } from "@/domain/category"

export const expenseSchema = z.object({
  id: z.number(),
  date: z.string(),
  category: categorySchema,
  description: z.string(),
  amount: z.number(),
  createdAt: z.number(),
})

export type Expense = z.infer<typeof expenseSchema>

export class ExpenseDatabase extends Dexie {
  expenses!: EntityTable<Expense, "id">

  constructor(name = "kakeibo") {
    super(name)
    this.version(1).stores({
      expenses: "++id, date",
    })
  }
}

export const db = new ExpenseDatabase()
