import { Router, Response } from "express";
import type { Router as ExpressRouter } from "express";
import { authenticate, AuthRequest } from "../middleware/auth";

export const goalRouter: ExpressRouter = Router();
goalRouter.use(authenticate);

// GET /api/goals
goalRouter.get("/", (_req: AuthRequest, res: Response) => {
    res.json({ success: true, data: [] });
});

// POST /api/goals
goalRouter.post("/", (req: AuthRequest, res: Response) => {
    res.status(201).json({ success: true, message: "Goal created" });
});

// PATCH /api/goals/:id
goalRouter.patch("/:id", (req: AuthRequest, res: Response) => {
    res.json({ success: true, message: "Goal updated" });
});

// DELETE /api/goals/:id
goalRouter.delete("/:id", (req: AuthRequest, res: Response) => {
    res.json({ success: true, message: "Goal deleted" });
});

// GET /api/goals/sips
goalRouter.get("/sips", (_req: AuthRequest, res: Response) => {
    res.json({ success: true, data: [] });
});

// GET /api/goals/insurance
goalRouter.get("/insurance", (_req: AuthRequest, res: Response) => {
    res.json({ success: true, data: [] });
});

// POST /api/goals/risk-profile
goalRouter.post("/risk-profile", (req: AuthRequest, res: Response) => {
    res.json({ success: true, data: { score: 0, profile: "moderate" } });
});
