import { describe, expect, it } from "vitest"
import { formatCompactCurrency } from "@/domain/currency"

describe("formatCompactCurrency", () => {
  it("renders amounts under 1000 as a plain integer with the currency symbol", () => {
    expect(formatCompactCurrency(149, "USD")).toBe("$149")
    expect(formatCompactCurrency(999, "USD")).toBe("$999")
  })

  it("renders thousands with a k suffix, dropping a trailing .0", () => {
    expect(formatCompactCurrency(1000, "USD")).toBe("$1k")
    expect(formatCompactCurrency(23000, "USD")).toBe("$23k")
  })

  it("keeps one decimal place when it's not a whole thousand", () => {
    expect(formatCompactCurrency(23500, "USD")).toBe("$23.5k")
  })

  it("rounds to one decimal, dropping the decimal if it rounds to a whole thousand", () => {
    expect(formatCompactCurrency(23030, "USD")).toBe("$23k")
  })

  it("renders millions with an M suffix", () => {
    expect(formatCompactCurrency(1000000, "USD")).toBe("$1M")
    expect(formatCompactCurrency(1500000, "USD")).toBe("$1.5M")
  })

  it("rolls a thousands value that rounds up to 1000k over into 1M instead", () => {
    expect(formatCompactCurrency(999950, "USD")).toBe("$1M")
  })

  it("uses the symbol for the given currency", () => {
    expect(formatCompactCurrency(1500000, "IDR")).toBe("Rp1.5M")
  })
})
