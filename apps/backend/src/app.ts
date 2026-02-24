import express, { Express } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";

import { authRouter } from "./routes/auth.routes";
import { transactionRouter } from "./routes/transaction.routes";
import { categoryRouter } from "./routes/category.routes";
import { caseRouter } from "./routes/case.routes";
import { hearingRouter } from "./routes/hearing.routes";
import { goalRouter } from "./routes/goal.routes";
import { orderRouter } from "./routes/order.routes";
import { adminUserRouter } from "./routes/adminUser.routes";
import { errorHandler } from "./middleware/errorHandler";
import { notFound } from "./middleware/notFound";

const app: Express = express();

// ────────────────────────────────────────────────────
// Security & Parsing Middleware
// ────────────────────────────────────────────────────
app.use(helmet());
app.use(
    cors({
        origin: process.env.NODE_ENV === "production"
            ? ["https://extinctbook.app", "https://admin.extinctbook.app"]
            : true, // allow all in development (Expo, localhost, LAN)
        credentials: true,
    })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// ────────────────────────────────────────────────────
// Rate Limiting
// ────────────────────────────────────────────────────
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 500,
    standardHeaders: true,
    legacyHeaders: false,
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: "Too many auth attempts, please try again later.",
});

app.use(globalLimiter);

// ────────────────────────────────────────────────────
// Health Check
// ────────────────────────────────────────────────────
app.get("/health", (_req, res) => {
    res.json({ status: "ok", version: "1.0.0", timestamp: new Date().toISOString() });
});

// ────────────────────────────────────────────────────
// API Routes
// ────────────────────────────────────────────────────
app.use("/api/auth", authLimiter, authRouter);
app.use("/api/transactions", transactionRouter);
app.use("/api/categories", categoryRouter);
app.use("/api/cases", caseRouter);
app.use("/api/hearings", hearingRouter);
app.use("/api/goals", goalRouter);
app.use("/api/orders", orderRouter);
app.use("/api/admin/users", adminUserRouter);

// ────────────────────────────────────────────────────
// Error Handling
// ────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

export default app;
