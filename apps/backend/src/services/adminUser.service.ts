import { prisma } from "../db/prisma";

// ─── List all users with pagination + search ───────────────────────────────
export async function listUsers(params: {
    search?: string;
    role?: string;
    page?: number;
    limit?: number;
}) {
    const { search, role, page = 1, limit = 20 } = params;

    const where: any = {
        ...(role && { role }),
        ...(search && {
            OR: [
                { name: { contains: search, mode: "insensitive" } },
                { email: { contains: search, mode: "insensitive" } },
                { mobile: { contains: search, mode: "insensitive" } },
            ],
        }),
    };

    const [total, users] = await Promise.all([
        prisma.user.count({ where }),
        prisma.user.findMany({
            where,
            select: {
                id: true,
                name: true,
                email: true,
                mobile: true,
                role: true,
                isVerified: true,
                createdAt: true,
                _count: { select: { transactions: true } },
            },
            orderBy: { createdAt: "desc" },
            skip: (page - 1) * limit,
            take: limit,
        }),
    ]);

    // Stats
    const [totalCount, verifiedCount] = await Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { isVerified: true } }),
    ]);

    return {
        data: users.map((u) => ({
            ...u,
            createdAt: u.createdAt.toISOString(),
            transactionCount: u._count.transactions,
        })),
        pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
        stats: { total: totalCount, verified: verifiedCount, unverified: totalCount - verifiedCount },
    };
}

// ─── Get user by ID (for admin detail view) ────────────────────────────────
export async function getUserById(id: string) {
    const user = await prisma.user.findUnique({
        where: { id },
        include: {
            _count: { select: { transactions: true, categories: true } },
        },
    });
    if (!user) return null;
    return {
        ...user,
        password: undefined, // never leak password hash
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
    };
}

// ─── Update user role ──────────────────────────────────────────────────────
export async function updateUserRole(id: string, role: string) {
    const valid = ["user", "lawyer", "wealth_client", "admin", "field_agent", "manager"];
    if (!valid.includes(role)) throw new Error("Invalid role");

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw new Error("User not found");

    return prisma.user.update({
        where: { id },
        data: { role: role as any },
        select: { id: true, name: true, email: true, role: true },
    });
}

// ─── Deactivate user (mark as unverified to block login) ──────────────────
export async function deactivateUser(id: string) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw new Error("User not found");

    return prisma.user.update({
        where: { id },
        data: { isVerified: false },
        select: { id: true, name: true, isVerified: true },
    });
}

// ─── Delete user (cascades transactions via Prisma schema) ────────────────
export async function deleteUser(id: string) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw new Error("User not found");
    await prisma.user.delete({ where: { id } });
}

// ─── Platform-wide analytics for dashboard ────────────────────────────────
export async function getPlatformAnalytics() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const [
        totalUsers,
        newUsersThisMonth,
        newUsersPrevMonth,
        totalTransactions,
        totalIncome,
        totalExpense,
    ] = await Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { createdAt: { gte: startOfMonth } } }),
        prisma.user.count({ where: { createdAt: { gte: prevMonth, lte: endPrevMonth } } }),
        prisma.transaction.count(),
        prisma.transaction.aggregate({ where: { type: "income" }, _sum: { amount: true } }),
        prisma.transaction.aggregate({ where: { type: "expense" }, _sum: { amount: true } }),
    ]);

    return {
        totalUsers,
        newUsersThisMonth,
        userGrowth: newUsersPrevMonth > 0
            ? `${Math.round(((newUsersThisMonth - newUsersPrevMonth) / newUsersPrevMonth) * 100)}%`
            : "—",
        totalTransactions,
        totalIncome: Number(totalIncome._sum.amount ?? 0),
        totalExpense: Number(totalExpense._sum.amount ?? 0),
        netBalance: Number(totalIncome._sum.amount ?? 0) - Number(totalExpense._sum.amount ?? 0),
    };
}
