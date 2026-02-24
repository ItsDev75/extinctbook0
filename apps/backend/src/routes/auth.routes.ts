import { Router, Request, Response } from "express";
import type { Router as ExpressRouter } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { prisma } from "../db/prisma";

export const authRouter: ExpressRouter = Router();

// ── GET /api/auth/dev-token (DEV ONLY) ────────────────────────────────────
// Creates a persistent demo user and returns a signed JWT.
// Use this during development before auth is implemented.
authRouter.get("/dev-token", async (_req: Request, res: Response) => {
    if (process.env.NODE_ENV === "production") {
        res.status(404).json({ success: false, message: "Not found" });
        return;
    }
    try {
        const DEV_EMAIL = "dev@extinctbook.local";
        let user = await prisma.user.findUnique({ where: { email: DEV_EMAIL } });
        if (!user) {
            const hash = await bcrypt.hash("devpass123", 10);
            user = await prisma.user.create({
                data: {
                    name: "Dev User",
                    email: DEV_EMAIL,
                    mobile: "9999999999",
                    password: hash,
                    isVerified: true,
                    role: "user",
                },
            });
        }
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            (process.env.JWT_SECRET as string) || "dev_secret_key_change_in_prod",
            { expiresIn: "30d" }
        );
        res.json({ success: true, token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    } catch (err: any) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// POST /api/auth/register
authRouter.post("/register", (req: Request, res: Response) => {
    res.json({ success: true, message: "Register endpoint — connect to service" });
});

// POST /api/auth/verify-otp
authRouter.post("/verify-otp", (req: Request, res: Response) => {
    res.json({ success: true, message: "OTP verified — connect to service" });
});

// POST /api/auth/login
authRouter.post("/login", (req: Request, res: Response) => {
    res.json({ success: true, message: "Login endpoint — connect to service" });
});

// POST /api/auth/forgot-password
authRouter.post("/forgot-password", (req: Request, res: Response) => {
    res.json({ success: true, message: "Forgot password — connect to service" });
});

// POST /api/auth/reset-password
authRouter.post("/reset-password", (req: Request, res: Response) => {
    res.json({ success: true, message: "Reset password — connect to service" });
});

// POST /api/auth/resend-otp
authRouter.post("/resend-otp", (req: Request, res: Response) => {
    res.json({ success: true, message: "Resend OTP — connect to service" });
});
