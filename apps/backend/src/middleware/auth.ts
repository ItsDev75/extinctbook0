import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../db/prisma";
import bcrypt from "bcryptjs";

export interface AuthRequest extends Request {
    user?: {
        id: string;
        role: string;
        email: string;
    };
}

// ── Dev user bootstrap (created once, cached in memory) ────────────────────
let _devUserId: string | null = null;

async function getOrCreateDevUser(): Promise<{ id: string; role: string; email: string }> {
    if (_devUserId) return { id: _devUserId, role: "user", email: "dev@extinctbook.local" };

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
    _devUserId = user.id;
    return { id: user.id, role: user.role, email: user.email };
}

export async function authenticate(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    const authHeader = req.headers.authorization;

    // ── Dev mode bypass: no token + development environment → use dev user ──
    if (!authHeader && process.env.NODE_ENV !== "production") {
        try {
            req.user = await getOrCreateDevUser();
            next();
            return;
        } catch (err) {
            res.status(500).json({ success: false, message: "Dev mode: failed to create dev user" });
            return;
        }
    }

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({ success: false, message: "No token provided" });
        return;
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
            id: string;
            role: string;
            email: string;
        };
        req.user = decoded;
        next();
    } catch {
        res.status(401).json({ success: false, message: "Invalid or expired token" });
    }
}

export function requireRole(...roles: string[]) {
    return (req: AuthRequest, res: Response, next: NextFunction): void => {
        if (!req.user) {
            res.status(401).json({ success: false, message: "Unauthorized" });
            return;
        }
        if (!roles.includes(req.user.role)) {
            res.status(403).json({ success: false, message: "Forbidden: insufficient role" });
            return;
        }
        next();
    };
}
