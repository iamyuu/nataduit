import Dexie, { type EntityTable } from "dexie"
import type { Category } from "@/domain/category"

export interface Expense {
  id: number
  date: string
  category: Category
  description: string
  amount: number
  createdAt: number
}

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
