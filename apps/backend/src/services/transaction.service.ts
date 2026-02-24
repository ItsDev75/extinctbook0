import { Prisma } from "@prisma/client";
import { prisma } from "../db/prisma";
import type { CreateTransactionInput, UpdateTransactionInput, TransactionFilters } from "@extinctbook/shared";

// ─── Get transactions with full filter support ─────────────────────────────
export async function getUserTransactions(userId: string, filters: TransactionFilters) {
    const {
        type, categoryId, paymentMode,
        startDate, endDate,
        minAmount, maxAmount,
        search, page, limit,
    } = filters;

    const where: Prisma.TransactionWhereInput = {
        userId,
        ...(type && { type }),
        ...(categoryId && { categoryId }),
        ...(paymentMode && { paymentMode }),
        ...(startDate || endDate ? {
            date: {
                ...(startDate && { gte: new Date(startDate) }),
                ...(endDate && { lte: new Date(endDate) }),
            },
        } : {}),
        ...(minAmount !== undefined || maxAmount !== undefined ? {
            amount: {
                ...(minAmount !== undefined && { gte: new Prisma.Decimal(minAmount) }),
                ...(maxAmount !== undefined && { lte: new Prisma.Decimal(maxAmount) }),
            },
        } : {}),
        ...(search && {
            OR: [
                { note: { contains: search, mode: "insensitive" } },
                { category: { name: { contains: search, mode: "insensitive" } } },
            ],
        }),
    };

    const [total, transactions] = await Promise.all([
        prisma.transaction.count({ where }),
        prisma.transaction.findMany({
            where,
            include: { category: true },
            orderBy: { date: "desc" },
            skip: (page - 1) * limit,
            take: limit,
        }),
    ]);

    return {
        data: transactions.map(serializeTransaction),
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    };
}

// ─── Get single transaction ───────────────────────────────────────────────
export async function getTransactionById(userId: string, id: string) {
    const tx = await prisma.transaction.findFirst({
        where: { id, userId },
        include: { category: true },
    });
    if (!tx) return null;
    return serializeTransaction(tx);
}

// ─── Create transaction ────────────────────────────────────────────────────
export async function createTransaction(userId: string, data: CreateTransactionInput) {
    // Validate category exists and belongs to this user or is system-level
    const category = await prisma.category.findFirst({
        where: {
            id: data.categoryId,
            OR: [{ userId }, { userId: null }],
        },
    });
    if (!category) throw new Error("Category not found or not accessible");

    const tx = await prisma.transaction.create({
        data: {
            userId,
            type: data.type,
            amount: new Prisma.Decimal(data.amount),
            currency: data.currency ?? "INR",
            categoryId: data.categoryId,
            paymentMode: data.paymentMode ?? "cash",
            note: data.note,
            date: new Date(data.date),
            isRecurring: data.isRecurring ?? false,
            recurringInterval: data.recurringInterval,
        },
        include: { category: true },
    });

    return serializeTransaction(tx);
}

// ─── Update transaction ────────────────────────────────────────────────────
export async function updateTransaction(userId: string, id: string, data: UpdateTransactionInput) {
    const existing = await prisma.transaction.findFirst({ where: { id, userId } });
    if (!existing) throw new Error("Transaction not found");

    const tx = await prisma.transaction.update({
        where: { id },
        data: {
            ...(data.type && { type: data.type }),
            ...(data.amount !== undefined && { amount: new Prisma.Decimal(data.amount) }),
            ...(data.currency && { currency: data.currency }),
            ...(data.categoryId && { categoryId: data.categoryId }),
            ...(data.paymentMode && { paymentMode: data.paymentMode }),
            ...(data.note !== undefined && { note: data.note }),
            ...(data.date && { date: new Date(data.date) }),
            ...(data.isRecurring !== undefined && { isRecurring: data.isRecurring }),
            ...(data.recurringInterval !== undefined && { recurringInterval: data.recurringInterval }),
        },
        include: { category: true },
    });

    return serializeTransaction(tx);
}

// ─── Delete transaction ────────────────────────────────────────────────────
export async function deleteTransaction(userId: string, id: string) {
    const existing = await prisma.transaction.findFirst({ where: { id, userId } });
    if (!existing) throw new Error("Transaction not found");
    await prisma.transaction.delete({ where: { id } });
}

// ─── Summary (daily/weekly/monthly/yearly) ─────────────────────────────────
export async function getTransactionSummary(userId: string) {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(startOfDay);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    const aggregate = async (start: Date) => {
        const [income, expense] = await Promise.all([
            prisma.transaction.aggregate({
                where: { userId, type: "income", date: { gte: start } },
                _sum: { amount: true },
            }),
            prisma.transaction.aggregate({
                where: { userId, type: "expense", date: { gte: start } },
                _sum: { amount: true },
            }),
        ]);
        return {
            income: Number(income._sum.amount ?? 0),
            expense: Number(expense._sum.amount ?? 0),
        };
    };

    const [today, thisWeek, thisMonth, thisYear, allTime] = await Promise.all([
        aggregate(startOfDay),
        aggregate(startOfWeek),
        aggregate(startOfMonth),
        aggregate(startOfYear),
        aggregate(new Date(0)), // epoch = all time
    ]);

    return {
        totalIncome: allTime.income,
        totalExpense: allTime.expense,
        balance: allTime.income - allTime.expense,
        today,
        thisWeek,
        thisMonth,
        thisYear,
        currency: "INR",
    };
}

// ─── Category breakdown for pie chart ─────────────────────────────────────
export async function getCategoryBreakdown(
    userId: string,
    type: "expense" | "income" = "expense",
    period: "today" | "week" | "month" | "year" | "all" = "month"
) {
    const start = getPeriodStart(period);

    const grouped = await prisma.transaction.groupBy({
        by: ["categoryId"],
        where: {
            userId,
            type,
            ...(start && { date: { gte: start } }),
        },
        _sum: { amount: true },
        _count: { id: true },
        orderBy: { _sum: { amount: "desc" } },
    });

    const total = grouped.reduce((s, g) => s + Number(g._sum.amount ?? 0), 0);

    const categories = await prisma.category.findMany({
        where: { id: { in: grouped.map((g) => g.categoryId) } },
    });
    const catMap = new Map(categories.map((c) => [c.id, c]));

    return grouped.map((g) => {
        const cat = catMap.get(g.categoryId);
        const catTotal = Number(g._sum.amount ?? 0);
        return {
            categoryId: g.categoryId,
            categoryName: cat?.name ?? "Unknown",
            icon: cat?.icon ?? "📦",
            total: catTotal,
            count: g._count.id,
            percentage: total > 0 ? Math.round((catTotal / total) * 100) : 0,
        };
    });
}

// ─── Daily spending for bar chart (last N days) ────────────────────────────
export async function getDailySpending(userId: string, days = 30) {
    const start = new Date();
    start.setDate(start.getDate() - days);
    start.setHours(0, 0, 0, 0);

    const transactions = await prisma.transaction.findMany({
        where: {
            userId,
            type: { in: ["income", "expense"] },
            date: { gte: start },
        },
        select: { date: true, amount: true, type: true },
        orderBy: { date: "asc" },
    });

    // Group by date string
    const map = new Map<string, { income: number; expense: number }>();
    for (const tx of transactions) {
        const key = tx.date.toISOString().split("T")[0];
        if (!map.has(key)) map.set(key, { income: 0, expense: 0 });
        const entry = map.get(key)!;
        if (tx.type === "income") entry.income += Number(tx.amount);
        else if (tx.type === "expense") entry.expense += Number(tx.amount);
    }

    // Fill missing days with zeros
    const result = [];
    for (let i = days; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const key = d.toISOString().split("T")[0];
        const entry = map.get(key) ?? { income: 0, expense: 0 };
        result.push({ date: key, ...entry });
    }
    return result;
}

// ─── Helpers ───────────────────────────────────────────────────────────────
function getPeriodStart(period: string): Date | null {
    const now = new Date();
    if (period === "today") return new Date(now.getFullYear(), now.getMonth(), now.getDate());
    if (period === "week") {
        const d = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        d.setDate(d.getDate() - d.getDay());
        return d;
    }
    if (period === "month") return new Date(now.getFullYear(), now.getMonth(), 1);
    if (period === "year") return new Date(now.getFullYear(), 0, 1);
    return null;
}

// Serialize Prisma Decimal → number for JSON responses
function serializeTransaction(tx: any) {
    return {
        ...tx,
        amount: Number(tx.amount),
        date: tx.date.toISOString(),
        createdAt: tx.createdAt.toISOString(),
        updatedAt: tx.updatedAt.toISOString(),
        category: tx.category
            ? { ...tx.category, color: tx.category.color }
            : undefined,
    };
}
