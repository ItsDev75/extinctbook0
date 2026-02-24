"use client";

import { useEffect, useState } from "react";
import { Users, DollarSign, TrendingUp, ArrowUpRight, BarChart3 } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

interface Analytics {
    totalUsers: number;
    newUsersThisMonth: number;
    userGrowth: string;
    totalTransactions: number;
    totalIncome: number;
    totalExpense: number;
    netBalance: number;
}

function formatINR(n: number) {
    return "₹" + Math.abs(n).toLocaleString("en-IN");
}

export default function DashboardPage() {
    const [data, setData] = useState<Analytics | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const token = localStorage.getItem("admin_token") ?? "";
        fetch(`${API}/api/admin/users/analytics`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((r) => r.json())
            .then((r) => { if (r.success) setData(r.data); else setError(r.message); })
            .catch(() => setError("Backend unreachable"))
            .finally(() => setLoading(false));
    }, []);

    const stats = data ? [
        { label: "Total Users", value: data.totalUsers.toLocaleString(), sub: `+${data.newUsersThisMonth} this month`, icon: Users, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-900/20" },
        { label: "Net Balance", value: formatINR(data.netBalance), sub: "All time across all users", icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
        { label: "Total Income", value: formatINR(data.totalIncome), sub: "All income transactions", icon: ArrowUpRight, color: "text-foreground", bg: "bg-muted" },
        { label: "Total Transactions", value: data.totalTransactions.toLocaleString(), sub: "Across all users", icon: BarChart3, color: "text-warning", bg: "bg-warning/10" },
    ] : [];

    return (
        <div className="space-y-8 animate-fade-in">
            <div>
                <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
                <p className="text-muted-foreground text-sm mt-1">Platform overview — live data from backend</p>
            </div>

            {error && (
                <div className="rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-700 dark:text-red-400">
                    ⚠️ {error} — check backend connection and admin token in localStorage.
                </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                {loading
                    ? Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="bg-card rounded-2xl border border-border p-5 animate-pulse h-28" />
                    ))
                    : stats.map(({ label, value, sub, icon: Icon, color, bg }) => (
                        <div key={label} className="bg-card rounded-2xl border border-border p-5 shadow-sm hover:shadow-md transition-shadow">
                            <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-4`}>
                                <Icon className={`h-5 w-5 ${color}`} />
                            </div>
                            <p className="text-2xl font-bold text-foreground">{value}</p>
                            <p className="text-sm font-medium text-muted-foreground mt-0.5">{label}</p>
                            <p className="text-xs text-muted-foreground/60 mt-1">{sub}</p>
                        </div>
                    ))
                }
            </div>

            {/* Income vs Expense Split */}
            {data && (
                <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
                    <h2 className="font-semibold text-foreground mb-4">Income vs Expense</h2>
                    <div className="space-y-4">
                        {[
                            { label: "Income", amount: data.totalIncome, total: data.totalIncome + data.totalExpense, color: "bg-foreground" },
                            { label: "Expense", amount: data.totalExpense, total: data.totalIncome + data.totalExpense, color: "bg-muted-foreground" },
                        ].map(({ label, amount, total, color }) => {
                            const pct = total > 0 ? Math.round((amount / total) * 100) : 0;
                            return (
                                <div key={label}>
                                    <div className="flex justify-between text-sm mb-1.5">
                                        <span className="font-medium text-foreground">{label}</span>
                                        <span className="text-muted-foreground">{formatINR(amount)} · {pct}%</span>
                                    </div>
                                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                                        <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* User Growth */}
            {data && (
                <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
                    <h2 className="font-semibold text-foreground mb-2">User Growth</h2>
                    <p className="text-sm text-muted-foreground">
                        <span className="text-green-600 font-semibold">{data.userGrowth}</span> growth vs last month ·{" "}
                        <span className="font-semibold text-foreground">{data.newUsersThisMonth}</span> new users this month
                    </p>
                </div>
            )}
        </div>
    );
}
