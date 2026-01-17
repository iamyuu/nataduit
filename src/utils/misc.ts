import { defineConfig } from "cva";
import { twMerge } from "tailwind-merge";

export type { VariantProps } from "cva";

// Configure cva with tailwind-merge for better class name merging
export const { cva, cx, compose } = defineConfig({
  hooks: {
    onComplete: (className) => twMerge(className),
  },
});
