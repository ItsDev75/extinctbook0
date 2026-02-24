import { Router, Response } from "express";
import { authenticate, AuthRequest } from "../middleware/auth";

export const hearingRouter = Router();
hearingRouter.use(authenticate);

// GET /api/hearings
hearingRouter.get("/", (_req: AuthRequest, res: Response) => {
    res.json({ success: true, data: [] });
});

// GET /api/hearings/display-board/:courtId
hearingRouter.get("/display-board/:courtId", (req: AuthRequest, res: Response) => {
    res.json({ success: true, data: [], courtId: req.params.courtId });
});

// POST /api/hearings
hearingRouter.post("/", (req: AuthRequest, res: Response) => {
    res.status(201).json({ success: true, message: "Hearing scheduled" });
});

// PATCH /api/hearings/:id
hearingRouter.patch("/:id", (req: AuthRequest, res: Response) => {
    res.json({ success: true, message: "Hearing updated" });
});
