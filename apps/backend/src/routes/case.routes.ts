import { Router, Response } from "express";
import { authenticate, AuthRequest } from "../middleware/auth";

export const caseRouter = Router();
caseRouter.use(authenticate);

// GET /api/cases
caseRouter.get("/", (_req: AuthRequest, res: Response) => {
    res.json({ success: true, data: [] });
});

// GET /api/cases/:id
caseRouter.get("/:id", (req: AuthRequest, res: Response) => {
    res.json({ success: true, data: null });
});

// POST /api/cases
caseRouter.post("/", (req: AuthRequest, res: Response) => {
    res.status(201).json({ success: true, message: "Case created" });
});

// PATCH /api/cases/:id
caseRouter.patch("/:id", (req: AuthRequest, res: Response) => {
    res.json({ success: true, message: "Case updated" });
});

// DELETE /api/cases/:id
caseRouter.delete("/:id", (req: AuthRequest, res: Response) => {
    res.json({ success: true, message: "Case deleted" });
});

// GET /api/cases/search
caseRouter.get("/search", (req: AuthRequest, res: Response) => {
    res.json({ success: true, data: [] });
});
