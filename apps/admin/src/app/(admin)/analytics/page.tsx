"use client";

import { useEffect, useState } from "react";
import { BarChart3, TrendingUp, Users, DollarSign } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

interface DailyData { date: string; income: number; expense: number }
interface CategoryData { categoryName: string; icon: string; total: number; percentage: number }

function formatINR(n: number) {
    return "₹" + Math.abs(n).toLocaleString("en-IN");
}

export default function AnalyticsPage() {
    const [daily, setDaily] = useState<DailyData[]>([]);
    const [categories, setCategories] = useState<CategoryData[]>([]);
    const [loading, setLoading] = useState(true);
    const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") ?? "" : "";

    useEffect(() => {
        const headers = { Authorization: `Bearer ${token}` };
        Promise.all([
            fetch(`${API}/api/transactions/chart/daily?days=30`, { headers }).then(r => r.json()),
            fetch(`${API}/api/transactions/chart/pie?type=expense&period=month`, { headers }).then(r => r.json()),
        ]).then(([d, c]) => {
            if (d.success) setDaily(d.data);
            if (c.success) setCategories(c.data);
        }).finally(() => setLoading(false));
    }, [token]);

    const maxVal = Math.max(...daily.flatMap(d => [d.income, d.expense]), 1);

    return (
        <div className="space-y-8 animate-fade-in">
            <div>
                <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
                <p className="text-muted-foreground text-sm mt-1">Platform-wide transaction insights</p>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {[1, 2].map(i => (
                        <div key={i} className="bg-card rounded-2xl border border-border p-6 h-80 animate-pulse" />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {/* Bar Chart — Daily Income vs Expense */}
                    <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
                        <h2 className="font-semibold text-foreground mb-1">Daily Trend</h2>
                        <p className="text-xs text-muted-foreground mb-6">Last 30 days · income vs expense</p>
                        <div className="flex items-end gap-1 h-48">
                            {daily.slice(-21).map((d, i) => (
                                <div key={i} className="flex-1 flex flex-col items-center gap-0.5 h-full justify-end">
                                    <div
                                        className="w-full bg-foreground rounded-sm min-h-[2px]"
                                        style={{ height: `${Math.round((d.income / maxVal) * 100)}%` }}
                                        title={`Income: ${formatINR(d.income)}`}
                                    />
                                    <div
                                        className="w-full bg-muted-foreground/40 rounded-sm min-h-[2px]"
                                        style={{ height: `${Math.round((d.expense / maxVal) * 100)}%` }}
                                        title={`Expense: ${formatINR(d.expense)}`}
                                    />
                                </div>
                            ))}
                        </div>
                        <div className="flex gap-4 mt-3">
                            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <span className="w-3 h-3 rounded-sm bg-foreground inline-block" /> Income
                            </span>
                            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <span className="w-3 h-3 rounded-sm bg-muted-foreground/40 inline-block" /> Expense
                            </span>
                        </div>
                    </div>

                    {/* Category Breakdown */}
                    <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
                        <h2 className="font-semibold text-foreground mb-1">Top Expense Categories</h2>
                        <p className="text-xs text-muted-foreground mb-6">This month across all users</p>
                        {categories.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-40 text-center">
                                <BarChart3 className="h-8 w-8 text-muted-foreground/30 mb-2" />
                                <p className="text-sm text-muted-foreground">No expense data yet</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {categories.slice(0, 6).map((cat, i) => (
                                    <div key={i}>
                                        <div className="flex justify-between text-sm mb-1.5">
                                            <span className="font-medium text-foreground">{cat.icon} {cat.categoryName}</span>
                                            <span className="text-muted-foreground">{formatINR(cat.total)} · {cat.percentage}%</span>
                                        </div>
                                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-foreground rounded-full"
                                                style={{ width: `${cat.percentage}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
