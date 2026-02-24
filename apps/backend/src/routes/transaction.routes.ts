import { Router, Response } from "express";
import { authenticate, AuthRequest } from "../middleware/auth";
import { transactionFiltersSchema, createTransactionSchema, updateTransactionSchema } from "@extinctbook/shared";
import {
    getUserTransactions,
    getTransactionById,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    getTransactionSummary,
    getCategoryBreakdown,
    getDailySpending,
} from "../services/transaction.service";

export const transactionRouter = Router();
transactionRouter.use(authenticate);

// ── GET /api/transactions ──────────────────────────────────────────────────
// Supports: type, categoryId, paymentMode, startDate, endDate,
//           minAmount, maxAmount, search, page, limit
transactionRouter.get("/", async (req: AuthRequest, res: Response) => {
    try {
        const parsed = transactionFiltersSchema.safeParse(req.query);
        if (!parsed.success) {
            res.status(400).json({ success: false, errors: parsed.error.flatten().fieldErrors });
            return;
        }
        const result = await getUserTransactions(req.user!.id, parsed.data);
        res.json({ success: true, ...result });
    } catch (err: any) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ── GET /api/transactions/summary ─────────────────────────────────────────
transactionRouter.get("/summary", async (req: AuthRequest, res: Response) => {
    try {
        const data = await getTransactionSummary(req.user!.id);
        res.json({ success: true, data });
    } catch (err: any) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ── GET /api/transactions/chart/pie?type=expense&period=month ─────────────
transactionRouter.get("/chart/pie", async (req: AuthRequest, res: Response) => {
    try {
        const type = (req.query.type as "expense" | "income") || "expense";
        const period = (req.query.period as string) || "month";
        const data = await getCategoryBreakdown(req.user!.id, type, period as any);
        res.json({ success: true, data });
    } catch (err: any) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ── GET /api/transactions/chart/daily?days=30 ─────────────────────────────
transactionRouter.get("/chart/daily", async (req: AuthRequest, res: Response) => {
    try {
        const days = Math.min(Number(req.query.days) || 30, 365);
        const data = await getDailySpending(req.user!.id, days);
        res.json({ success: true, data });
    } catch (err: any) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ── GET /api/transactions/:id ─────────────────────────────────────────────
transactionRouter.get("/:id", async (req: AuthRequest, res: Response) => {
    try {
        const tx = await getTransactionById(req.user!.id, req.params.id);
        if (!tx) {
            res.status(404).json({ success: false, message: "Transaction not found" });
            return;
        }
        res.json({ success: true, data: tx });
    } catch (err: any) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ── POST /api/transactions ────────────────────────────────────────────────
transactionRouter.post("/", async (req: AuthRequest, res: Response) => {
    try {
        const parsed = createTransactionSchema.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({ success: false, errors: parsed.error.flatten().fieldErrors });
            return;
        }
        const tx = await createTransaction(req.user!.id, parsed.data);
        res.status(201).json({ success: true, data: tx });
    } catch (err: any) {
        const status = err.message.includes("not found") ? 404 : 500;
        res.status(status).json({ success: false, message: err.message });
    }
});

// ── PATCH /api/transactions/:id ───────────────────────────────────────────
transactionRouter.patch("/:id", async (req: AuthRequest, res: Response) => {
    try {
        const parsed = updateTransactionSchema.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({ success: false, errors: parsed.error.flatten().fieldErrors });
            return;
        }
        const tx = await updateTransaction(req.user!.id, req.params.id, parsed.data);
        res.json({ success: true, data: tx });
    } catch (err: any) {
        const status = err.message.includes("not found") ? 404 : 500;
        res.status(status).json({ success: false, message: err.message });
    }
});

// ── DELETE /api/transactions/:id ──────────────────────────────────────────
transactionRouter.delete("/:id", async (req: AuthRequest, res: Response) => {
    try {
        await deleteTransaction(req.user!.id, req.params.id);
        res.json({ success: true, message: "Transaction deleted" });
    } catch (err: any) {
        const status = err.message.includes("not found") ? 404 : 500;
        res.status(status).json({ success: false, message: err.message });
    }
});
