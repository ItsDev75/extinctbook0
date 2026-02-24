import { Router, Response } from "express";
import type { Router as ExpressRouter } from "express";
import { z } from "zod";
import { authenticate, AuthRequest } from "../middleware/auth";
import { getUserCategories, createCategory, deleteCategory } from "../services/category.service";

export const categoryRouter: ExpressRouter = Router();

const createCategorySchema = z.object({
    name: z.string().min(1).max(50),
    icon: z.string().min(1).max(10),
    color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Must be a valid hex color"),
});

// ── GET /api/categories — PUBLIC (no auth required) ───────────────────────
// Returns system categories + user's custom categories.
// If no token provided, returns only system categories.
categoryRouter.get("/", async (req: AuthRequest, res: Response) => {
    try {
        // Try to extract userId from token (optional)
        let userId: string | undefined;
        const authHeader = req.headers.authorization;
        if (authHeader?.startsWith("Bearer ")) {
            try {
                const jwt = await import("jsonwebtoken");
                const decoded = jwt.default.verify(
                    authHeader.split(" ")[1],
                    (process.env.JWT_SECRET as string) || "dev_secret_key_change_in_prod"
                ) as { id: string };
                userId = decoded.id;
            } catch {
                // Invalid token — proceed as anonymous (system categories only)
            }
        }
        const categories = await getUserCategories(userId ?? "anonymous");
        res.json({ success: true, data: categories });
    } catch (err: any) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ── POST /api/categories — requires auth ──────────────────────────────────
categoryRouter.post("/", authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const parsed = createCategorySchema.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({ success: false, errors: parsed.error.flatten().fieldErrors });
            return;
        }
        const category = await createCategory(req.user!.id, parsed.data);
        res.status(201).json({ success: true, data: category });
    } catch (err: any) {
        const status = err.message.includes("already exists") ? 409 : 500;
        res.status(status).json({ success: false, message: err.message });
    }
});

// ── DELETE /api/categories/:id — requires auth ────────────────────────────
categoryRouter.delete("/:id", authenticate, async (req: AuthRequest, res: Response) => {
    try {
        await deleteCategory(req.user!.id, req.params.id as string);
        res.json({ success: true, message: "Category deleted" });
    } catch (err: any) {
        const status = err.message.includes("not found") ? 404
            : err.message.includes("system") ? 403
                : err.message.includes("transactions") ? 409
                    : 500;
        res.status(status).json({ success: false, message: err.message });
    }
});
