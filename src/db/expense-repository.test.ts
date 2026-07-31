import "fake-indexeddb/auto"
import { afterEach, beforeEach, describe, expect, it } from "vitest"
import { ExpenseDatabase } from "@/db/database"
import {
  createExpenseRepository,
  type ExpenseRepository,
} from "@/db/expense-repository"

describe("ExpenseRepository", () => {
  let db: ExpenseDatabase
  let repository: ExpenseRepository

  beforeEach(() => {
    db = new ExpenseDatabase(`test-${crypto.randomUUID()}`)
    repository = createExpenseRepository(db)
  })

  afterEach(async () => {
    await db.delete()
  })

  it("saves an expense and lists it back for its date", async () => {
    await repository.add({
      date: "2026-07-31",
      category: "wants",
      description: "burger",
      amount: 23000,
    })

    const expenses = await repository.listByDate("2026-07-31")

    expect(expenses).toHaveLength(1)
    expect(expenses[0]).toMatchObject({
      date: "2026-07-31",
      category: "wants",
      description: "burger",
      amount: 23000,
    })
  })

  it("removes an expense so it no longer appears in listByDate", async () => {
    const id = await repository.add({
      date: "2026-07-31",
      category: "wants",
      description: "burger",
      amount: 23000,
    })

    await repository.remove(id)

    expect(await repository.listByDate("2026-07-31")).toHaveLength(0)
  })

  it("lists expenses for a month, excluding neighboring months", async () => {
    await repository.add({
      date: "2026-06-30",
      category: "wants",
      description: "june tail",
      amount: 10,
    })
    await repository.add({
      date: "2026-07-01",
      category: "needs",
      description: "july start",
      amount: 20,
    })
    await repository.add({
      date: "2026-07-31",
      category: "culture",
      description: "july end",
      amount: 30,
    })
    await repository.add({
      date: "2026-08-01",
      category: "wants",
      description: "august start",
      amount: 40,
    })

    const expenses = await repository.listByMonth("2026-07")

    expect(expenses.map((expense) => expense.description)).toEqual([
      "july start",
      "july end",
    ])
  })

  it("sums same-day expenses into a per-day total for the month", async () => {
    await repository.add({
      date: "2026-07-09",
      category: "wants",
      description: "coffee",
      amount: 5,
    })
    await repository.add({
      date: "2026-07-09",
      category: "needs",
      description: "lunch",
      amount: 12,
    })
    await repository.add({
      date: "2026-07-11",
      category: "culture",
      description: "book",
      amount: 30,
    })

    const totals = await repository.dayTotals("2026-07")

    expect(totals).toEqual(
      new Map([
        ["2026-07-09", 17],
        ["2026-07-11", 30],
      ])
    )
  })

  it("returns an empty day-totals map for a month with no expenses", async () => {
    expect(await repository.dayTotals("2026-07")).toEqual(new Map())
  })

  it("sums expenses per pillar for the month, including pillars with no spend", async () => {
    await repository.add({
      date: "2026-07-09",
      category: "wants",
      description: "coffee",
      amount: 5,
    })
    await repository.add({
      date: "2026-07-09",
      category: "wants",
      description: "burger",
      amount: 23,
    })
    await repository.add({
      date: "2026-07-11",
      category: "needs",
      description: "electricity",
      amount: 100,
    })

    const totals = await repository.pillarTotals("2026-07")

    expect(totals).toEqual({
      needs: 100,
      wants: 28,
      culture: 0,
      unexpected: 0,
    })
  })

  it("returns all four pillars at zero for a month with no expenses", async () => {
    expect(await repository.pillarTotals("2026-07")).toEqual({
      needs: 0,
      wants: 0,
      culture: 0,
      unexpected: 0,
    })
  })

  it("orders same-day expenses by createdAt within a listByMonth result", async () => {
    await repository.add({
      date: "2026-07-09",
      category: "wants",
      description: "first",
      amount: 1,
    })
    await repository.add({
      date: "2026-07-09",
      category: "wants",
      description: "second",
      amount: 2,
    })

    const expenses = await repository.listByMonth("2026-07")

    expect(expenses.map((expense) => expense.description)).toEqual([
      "first",
      "second",
    ])
  })

  it("rejects a corrupted row (invalid category) when reading by date", async () => {
    await db.expenses.add({
      date: "2026-07-31",
      category: "invalid",
      description: "burger",
      amount: 23000,
      createdAt: Date.now(),
    } as never)

    await expect(repository.listByDate("2026-07-31")).rejects.toThrow()
  })

  it("rejects a corrupted row (invalid category) when reading by month", async () => {
    await db.expenses.add({
      date: "2026-07-31",
      category: "invalid",
      description: "burger",
      amount: 23000,
      createdAt: Date.now(),
    } as never)

    await expect(repository.listByMonth("2026-07")).rejects.toThrow()
  })
})
