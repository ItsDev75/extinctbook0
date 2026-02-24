"use client";

import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from "recharts";

const data = [
    { name: "Delivered", value: 189, color: "#22c55e" },
    { name: "Processing", value: 78, color: "#f59e0b" },
    { name: "New", value: 45, color: "#1A73E8" },
    { name: "Dispatched", value: 30, color: "#3b82f6" },
    { name: "Cancelled", value: 12, color: "#ef4444" },
];

export function OrderStatusChart() {
    return (
        <ResponsiveContainer width="100%" height={220}>
            <PieChart>
                <Pie
                    data={data}
                    cx="50%"
                    cy="45%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                    strokeWidth={0}
                >
                    {data.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                    ))}
                </Pie>
                <Tooltip
                    formatter={(v: number, name: string) => [v, name]}
                    contentStyle={{ borderRadius: "12px", border: "1px solid hsl(220 13% 91%)", fontSize: "12px" }}
                />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "12px" }} />
            </PieChart>
        </ResponsiveContainer>
    );
}
