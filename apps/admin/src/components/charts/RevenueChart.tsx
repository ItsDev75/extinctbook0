"use client";

import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

const data = [
    { month: "Aug", revenue: 280000 },
    { month: "Sep", revenue: 310000 },
    { month: "Oct", revenue: 295000 },
    { month: "Nov", revenue: 360000 },
    { month: "Dec", revenue: 420000 },
    { month: "Jan", revenue: 395000 },
    { month: "Feb", revenue: 482350 },
];

const formatINR = (value: number) =>
    `₹${(value / 1000).toFixed(0)}K`;

export function RevenueChart() {
    return (
        <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#1A73E8" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#1A73E8" stopOpacity={0} />
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 91%)" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                <YAxis tickFormatter={formatINR} tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                <Tooltip
                    formatter={(v: number) => [`₹${v.toLocaleString("en-IN")}`, "Revenue"]}
                    contentStyle={{ borderRadius: "12px", border: "1px solid hsl(220 13% 91%)", fontSize: "12px" }}
                />
                <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#1A73E8"
                    strokeWidth={2.5}
                    fill="url(#revenueGradient)"
                    dot={{ fill: "#1A73E8", strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6 }}
                />
            </AreaChart>
        </ResponsiveContainer>
    );
}
