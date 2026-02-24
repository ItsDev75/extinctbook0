import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    const deleted = await prisma.category.deleteMany({ where: { userId: null } });
    console.log(`✅ Deleted ${deleted.count} old system categories`);
    console.log("The backend will auto-seed 5 fresh ones on next API call to /api/categories");
}

main().finally(() => prisma.$disconnect());
