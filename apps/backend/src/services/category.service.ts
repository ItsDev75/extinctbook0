import { prisma } from "../db/prisma";

// Default system categories seeded on first use
const DEFAULT_CATEGORIES = [
    { name: "Food & Drinks", icon: "restaurant-outline", color: "#1A1A1A" },
    { name: "Bills & Rent", icon: "flash-outline", color: "#2A2A2A" },
    { name: "Health", icon: "medkit-outline", color: "#333333" },
    { name: "Travel", icon: "airplane-outline", color: "#555555" },
    { name: "Salary", icon: "cash-outline", color: "#222222" },
];

// ─── Get categories for user (system + own custom) ─────────────────────────
export async function getUserCategories(userId: string) {
    // Ensure system categories exist (idempotent seed)
    await seedSystemCategories();

    return prisma.category.findMany({
        where: {
            OR: [{ userId: null }, { userId }],
        },
        orderBy: [{ isCustom: "asc" }, { name: "asc" }],
    });
}

// ─── Create custom category for user ──────────────────────────────────────
export async function createCategory(
    userId: string,
    data: { name: string; icon: string; color: string }
) {
    const existing = await prisma.category.findFirst({
        where: { name: { equals: data.name, mode: "insensitive" }, userId },
    });
    if (existing) throw new Error("A category with that name already exists");

    return prisma.category.create({
        data: { ...data, isCustom: true, userId },
    });
}

// ─── Delete custom category ────────────────────────────────────────────────
export async function deleteCategory(userId: string, id: string) {
    const cat = await prisma.category.findFirst({ where: { id, userId } });
    if (!cat) throw new Error("Category not found");
    if (!cat.isCustom) throw new Error("Cannot delete system categories");

    const txCount = await prisma.transaction.count({ where: { categoryId: id } });
    if (txCount > 0) throw new Error(`Cannot delete: ${txCount} transactions use this category`);

    await prisma.category.delete({ where: { id } });
}

// ─── Seed system categories (upsert by name, deduplicates on every call) ──
async function seedSystemCategories() {
    const targetNames = DEFAULT_CATEGORIES.map((c) => c.name);

    // 1. Delete any duplicate system rows (keep only the first by createdAt)
    for (const name of targetNames) {
        const dupes = await prisma.category.findMany({
            where: { name, userId: null, isCustom: false },
            orderBy: { id: "asc" },
        });
        if (dupes.length > 1) {
            // Delete all except the first (oldest)
            await prisma.category.deleteMany({
                where: { id: { in: dupes.slice(1).map((d) => d.id) } },
            });
        }
    }

    // 2. Upsert: update icon if stale, create if missing
    for (const cat of DEFAULT_CATEGORIES) {
        const existing = await prisma.category.findFirst({
            where: { name: cat.name, userId: null, isCustom: false },
        });
        if (existing) {
            if (existing.icon !== cat.icon) {
                await prisma.category.update({
                    where: { id: existing.id },
                    data: { icon: cat.icon },
                });
            }
        } else {
            await prisma.category.create({
                data: { ...cat, isCustom: false, userId: null },
            });
        }
    }

    // 3. Remove obsolete system categories with no transactions
    await prisma.category.deleteMany({
        where: {
            userId: null,
            isCustom: false,
            name: { notIn: targetNames },
            transactions: { none: {} },
        },
    });
}
