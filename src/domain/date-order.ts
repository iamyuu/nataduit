import { z } from "zod"

export const DATE_ORDERS = ["day-month", "month-day"] as const

export const dateOrderSchema = z.enum(DATE_ORDERS)

export type DateOrder = (typeof DATE_ORDERS)[number]

export const DEFAULT_DATE_ORDER: DateOrder = "day-month"
