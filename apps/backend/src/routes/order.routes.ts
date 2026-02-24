import { Router, Response } from "express";
import { authenticate, requireRole, AuthRequest } from "../middleware/auth";

export const orderRouter = Router();
orderRouter.use(authenticate);
orderRouter.use(requireRole("admin", "manager", "field_agent"));

// GET /api/orders
orderRouter.get("/", (_req: AuthRequest, res: Response) => {
    res.json({ success: true, data: [] });
});

// GET /api/orders/:id
orderRouter.get("/:id", (req: AuthRequest, res: Response) => {
    res.json({ success: true, data: null });
});

// POST /api/orders
orderRouter.post("/", (req: AuthRequest, res: Response) => {
    res.status(201).json({ success: true, message: "Order created" });
});

// PATCH /api/orders/:id/status
orderRouter.patch("/:id/status", (req: AuthRequest, res: Response) => {
    res.json({ success: true, message: "Order status updated" });
});

// GET /api/orders/metrics
orderRouter.get("/metrics", requireRole("admin", "manager"), (_req: AuthRequest, res: Response) => {
    res.json({
        success: true,
        data: { totalOrders: 0, pendingOrders: 0, revenue: 0, activeUsers: 0, period: "month" },
    });
});
