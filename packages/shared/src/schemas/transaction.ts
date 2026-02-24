import { z } from "zod";

export const createTransactionSchema = z.object({
    type: z.enum(["expense", "income", "transfer"]),
    amount: z.number().positive("Amount must be positive"),
    currency: z.string().default("INR"),
    categoryId: z.string().uuid("Invalid category ID"),
    paymentMode: z.enum(["cash", "upi", "card", "bank", "wallet"]).default("cash"),
    note: z.string().max(500).optional(),
    date: z.string().datetime(),
    isRecurring: z.boolean().default(false),
    recurringInterval: z.enum(["daily", "weekly", "monthly", "yearly"]).optional(),
});

export const updateTransactionSchema = createTransactionSchema.partial();

export const transactionFiltersSchema = z.object({
    type: z.enum(["expense", "income", "transfer"]).optional(),
    categoryId: z.string().uuid().optional(),
    paymentMode: z.enum(["cash", "upi", "card", "bank", "wallet"]).optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    minAmount: z.coerce.number().optional(),
    maxAmount: z.coerce.number().optional(),
    search: z.string().optional(),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
});

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>;
export type TransactionFilters = z.infer<typeof transactionFiltersSchema>;
