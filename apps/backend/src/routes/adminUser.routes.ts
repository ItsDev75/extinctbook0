import { Router, Response } from "express";
import type { Router as ExpressRouter } from "express";
import { authenticate, requireRole, AuthRequest } from "../middleware/auth";
import {
    listUsers,
    getUserById,
    updateUserRole,
    deactivateUser,
    deleteUser,
    getPlatformAnalytics,
} from "../services/adminUser.service";

export const adminUserRouter: ExpressRouter = Router();
adminUserRouter.use(authenticate);
adminUserRouter.use(requireRole("admin"));

// ── GET /api/admin/users?search=&role=&page=&limit= ───────────────────────
adminUserRouter.get("/", async (_req: AuthRequest, res: Response) => {
    try {
        const { search, role, page, limit } = _req.query as Record<string, string>;
        const result = await listUsers({
            search,
            role,
            page: page ? parseInt(page) : 1,
            limit: limit ? Math.min(parseInt(limit), 100) : 20,
        });
        res.json({ success: true, ...result });
    } catch (err: any) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ── GET /api/admin/users/analytics ────────────────────────────────────────
adminUserRouter.get("/analytics", async (_req: AuthRequest, res: Response) => {
    try {
        const data = await getPlatformAnalytics();
        res.json({ success: true, data });
    } catch (err: any) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ── GET /api/admin/users/:id ──────────────────────────────────────────────
adminUserRouter.get("/:id", async (req: AuthRequest, res: Response) => {
    try {
        const user = await getUserById(req.params.id as string);
        if (!user) {
            res.status(404).json({ success: false, message: "User not found" });
            return;
        }
        res.json({ success: true, data: user });
    } catch (err: any) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ── PATCH /api/admin/users/:id/role ──────────────────────────────────────
adminUserRouter.patch("/:id/role", async (req: AuthRequest, res: Response) => {
    try {
        const { role } = req.body;
        if (!role) {
            res.status(400).json({ success: false, message: "role is required" });
            return;
        }
        const user = await updateUserRole(req.params.id as string, role as string);
        res.json({ success: true, data: user });
    } catch (err: any) {
        const status = err.message.includes("not found") ? 404
            : err.message.includes("Invalid") ? 400
                : 500;
        res.status(status).json({ success: false, message: err.message });
    }
});

// ── PATCH /api/admin/users/:id/deactivate ─────────────────────────────────
adminUserRouter.patch("/:id/deactivate", async (req: AuthRequest, res: Response) => {
    try {
        const user = await deactivateUser(req.params.id as string);
        res.json({ success: true, data: user });
    } catch (err: any) {
        const status = err.message.includes("not found") ? 404 : 500;
        res.status(status).json({ success: false, message: err.message });
    }
});

// ── DELETE /api/admin/users/:id ───────────────────────────────────────────
adminUserRouter.delete("/:id", async (req: AuthRequest, res: Response) => {
    try {
        await deleteUser(req.params.id as string);
        res.json({ success: true, message: "User deleted" });
    } catch (err: any) {
        const status = err.message.includes("not found") ? 404 : 500;
        res.status(status).json({ success: false, message: err.message });
    }
});
