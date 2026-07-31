import { describe, expect, it } from "vitest"
import { cn } from "@/utils/misc"

describe("cn", () => {
  it("merges conflicting Tailwind classes, keeping the last one", () => {
    expect(cn("px-2 py-1", "px-4")).toBe("py-1 px-4")
  })

  it("drops falsy values", () => {
    const isActive = false
    expect(cn("px-2", isActive && "py-1", null, undefined)).toBe("px-2")
  })
})
