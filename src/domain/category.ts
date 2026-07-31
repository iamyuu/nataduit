export const CATEGORIES = ["needs", "wants", "culture", "unexpected"] as const

export type Category = (typeof CATEGORIES)[number]

export const DEFAULT_CATEGORY: Category = "wants"

export const CATEGORY_ALIASES: Record<Category, string[]> = {
  needs: ["needs", "need"],
  wants: ["wants", "want"],
  culture: ["culture"],
  unexpected: ["unexpected"],
}

export function zeroCategoryTotals(): Record<Category, number> {
  return Object.fromEntries(
    CATEGORIES.map((category) => [category, 0])
  ) as Record<Category, number>
}
