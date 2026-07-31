import { describe, expect, it } from "vitest"
import { parseExpenseInput } from "@/parsing/parse-expense-input"

describe("parseExpenseInput", () => {
  it("defaults to wants and applies the k suffix when no category is given", () => {
    expect(parseExpenseInput("burger 23k")).toEqual({
      ok: true,
      value: { category: "wants", description: "burger", amount: 23000 },
    })
  })

  it("matches a leading category alias and keeps the rest as a multi-word description", () => {
    expect(parseExpenseInput("need electricty 100k")).toEqual({
      ok: true,
      value: { category: "needs", description: "electricty", amount: 100000 },
    })
    expect(parseExpenseInput("unexpected tire repairs 5k")).toEqual({
      ok: true,
      value: {
        category: "unexpected",
        description: "tire repairs",
        amount: 5000,
      },
    })
  })

  it("strips a leading currency symbol from the amount", () => {
    expect(parseExpenseInput("culture svg course $149")).toEqual({
      ok: true,
      value: { category: "culture", description: "svg course", amount: 149 },
    })
    expect(parseExpenseInput("culture atomic book ¥35")).toEqual({
      ok: true,
      value: { category: "culture", description: "atomic book", amount: 35 },
    })
    expect(parseExpenseInput("wants tea £4")).toEqual({
      ok: true,
      value: { category: "wants", description: "tea", amount: 4 },
    })
    expect(parseExpenseInput("wants noodles Rp15000")).toEqual({
      ok: true,
      value: { category: "wants", description: "noodles", amount: 15000 },
    })
  })

  it("accepts a currency symbol combined with a decimal and the k suffix", () => {
    expect(parseExpenseInput("wants coffee $23.5k")).toEqual({
      ok: true,
      value: { category: "wants", description: "coffee", amount: 23500 },
    })
  })

  it("matches a category alias case-insensitively", () => {
    expect(parseExpenseInput("NEED electricty 100k")).toEqual({
      ok: true,
      value: { category: "needs", description: "electricty", amount: 100000 },
    })
  })

  it("accepts decimal amounts with and without the k suffix", () => {
    expect(parseExpenseInput("wants coffee 23.5k")).toEqual({
      ok: true,
      value: { category: "wants", description: "coffee", amount: 23500 },
    })
    expect(parseExpenseInput("wants coffee 149.99")).toEqual({
      ok: true,
      value: { category: "wants", description: "coffee", amount: 149.99 },
    })
  })

  it("accepts a currency symbol combined with the k suffix", () => {
    expect(parseExpenseInput("wants coffee $23k")).toEqual({
      ok: true,
      value: { category: "wants", description: "coffee", amount: 23000 },
    })
  })

  it("rejects input with no valid amount as the last token", () => {
    expect(parseExpenseInput("burger")).toEqual({
      ok: false,
      error: "missing-amount",
    })
    expect(parseExpenseInput("burger for lunch")).toEqual({
      ok: false,
      error: "missing-amount",
    })
    expect(parseExpenseInput("")).toEqual({
      ok: false,
      error: "missing-amount",
    })
    expect(parseExpenseInput("   ")).toEqual({
      ok: false,
      error: "missing-amount",
    })
  })

  it("rejects input with nothing left for the description", () => {
    expect(parseExpenseInput("50k")).toEqual({
      ok: false,
      error: "missing-description",
    })
    expect(parseExpenseInput("needs 100k")).toEqual({
      ok: false,
      error: "missing-description",
    })
  })

  it("tolerates irregular whitespace between tokens", () => {
    expect(parseExpenseInput("  unexpected   tire  repairs   5k  ")).toEqual({
      ok: true,
      value: {
        category: "unexpected",
        description: "tire repairs",
        amount: 5000,
      },
    })
  })
})
