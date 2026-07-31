export const CATEGORIES = ["needs", "wants", "culture", "unexpected"] as const

export type Category = (typeof CATEGORIES)[number]
