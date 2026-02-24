"use client";

import { useEffect, useState, useCallback } from "react";
import { Users, MoreVertical, Search } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

interface User {
    id: string;
    name: string;
    email: string;
    mobile: string;
    role: string;
    isVerified: boolean;
    createdAt: string;
    transactionCount: number;
}

interface Stats { total: number; verified: number; unverified: number }

const roleBadge: Record<string, string> = {
    user: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    lawyer: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    admin: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    wealth_client: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    field_agent: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    manager: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
};

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [actionUserId, setActionUserId] = useState<string | null>(null);

    const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") ?? "" : "";

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                ...(search && { search }),
                ...(roleFilter && { role: roleFilter }),
                page: page.toString(),
                limit: "20",
            });
            const res = await fetch(`${API}/api/admin/users?${params}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (data.success) {
                setUsers(data.data);
                setStats(data.stats);
                setTotalPages(data.pagination.totalPages);
            }
        } finally {
            setLoading(false);
        }
    }, [search, roleFilter, page, token]);

    useEffect(() => { fetchUsers(); }, [fetchUsers]);

    const handleRoleChange = async (id: string, role: string) => {
        await fetch(`${API}/api/admin/users/${id}/role`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ role }),
        });
        setActionUserId(null);
        fetchUsers();
    };

    const handleDeactivate = async (id: string) => {
        await fetch(`${API}/api/admin/users/${id}/deactivate`, {
            method: "PATCH",
            headers: { Authorization: `Bearer ${token}` },
        });
        fetchUsers();
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this user? All their transactions will be deleted.")) return;
        await fetch(`${API}/api/admin/users/${id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
        });
        fetchUsers();
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">User Management</h1>
                    <p className="text-muted-foreground text-sm mt-1">Manage roles, permissions, and accounts</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                            className="pl-9 pr-4 py-2 rounded-xl border border-input bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>
                    <select
                        value={roleFilter}
                        onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
                        className="px-3 py-2 rounded-xl border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                        <option value="">All roles</option>
                        {["user", "lawyer", "wealth_client", "admin", "field_agent", "manager"].map((r) => (
                            <option key={r} value={r}>{r}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Stats */}
            {stats && (
                <div className="grid grid-cols-3 gap-4">
                    {[
                        { label: "Total Users", value: stats.total, color: "text-foreground" },
                        { label: "Verified", value: stats.verified, color: "text-emerald-600" },
                        { label: "Unverified", value: stats.unverified, color: "text-red-600" },
                    ].map(({ label, value, color }) => (
                        <div key={label} className="bg-card rounded-2xl border border-border p-4 text-center shadow-sm">
                            <p className={`text-2xl font-bold ${color}`}>{value}</p>
                            <p className="text-xs text-muted-foreground mt-1">{label}</p>
                        </div>
                    ))}
                </div>
            )}

            {/* Table */}
            <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-border">
                    <h2 className="font-semibold text-foreground">All Users</h2>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                    </div>
                ) : users.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <Users className="h-10 w-10 text-muted-foreground/40 mb-3" />
                        <p className="text-sm font-medium text-muted-foreground">No users found</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-muted/50">
                                <tr>
                                    {["Name", "Email / Mobile", "Role", "Txns", "Verified", "Joined", ""].map((h) => (
                                        <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {users.map((u) => (
                                    <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                                        <td className="px-4 py-3 font-medium text-foreground">{u.name}</td>
                                        <td className="px-4 py-3">
                                            <p className="text-foreground">{u.email}</p>
                                            <p className="text-muted-foreground text-xs">{u.mobile}</p>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-semibold ${roleBadge[u.role] ?? "bg-muted text-muted-foreground"}`}>
                                                {u.role}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-muted-foreground">{u.transactionCount}</td>
                                        <td className="px-4 py-3">
                                            <span className={`text-xs font-semibold ${u.isVerified ? "text-emerald-600" : "text-red-500"}`}>
                                                {u.isVerified ? "✓ Yes" : "✗ No"}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-muted-foreground text-xs">
                                            {new Date(u.createdAt).toLocaleDateString("en-IN")}
                                        </td>
                                        <td className="px-4 py-3 relative">
                                            <button
                                                onClick={() => setActionUserId(actionUserId === u.id ? null : u.id)}
                                                className="p-1 rounded-lg hover:bg-muted transition-colors"
                                            >
                                                <MoreVertical className="h-4 w-4 text-muted-foreground" />
                                            </button>
                                            {actionUserId === u.id && (
                                                <div className="absolute right-4 top-10 z-20 bg-card border border-border rounded-xl shadow-lg py-1 w-44">
                                                    <p className="px-3 py-1 text-xs text-muted-foreground font-semibold">Change Role</p>
                                                    {["user", "lawyer", "admin", "field_agent", "manager"].map((r) => (
                                                        <button
                                                            key={r}
                                                            onClick={() => handleRoleChange(u.id, r)}
                                                            className="w-full text-left px-3 py-1.5 text-sm hover:bg-muted transition-colors"
                                                        >
                                                            {r}
                                                        </button>
                                                    ))}
                                                    <div className="border-t border-border mt-1 pt-1">
                                                        <button
                                                            onClick={() => handleDeactivate(u.id)}
                                                            className="w-full text-left px-3 py-1.5 text-sm text-amber-600 hover:bg-muted transition-colors"
                                                        >
                                                            Deactivate
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(u.id)}
                                                            className="w-full text-left px-3 py-1.5 text-sm text-red-600 hover:bg-muted transition-colors"
                                                        >
                                                            Delete User
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="px-6 py-4 border-t border-border flex items-center justify-between">
                        <p className="text-xs text-muted-foreground">Page {page} of {totalPages}</p>
                        <div className="flex gap-2">
                            <button
                                disabled={page <= 1}
                                onClick={() => setPage(page - 1)}
                                className="px-3 py-1.5 text-xs rounded-lg border border-border bg-background disabled:opacity-40 hover:bg-muted transition-colors"
                            >
                                ← Prev
                            </button>
                            <button
                                disabled={page >= totalPages}
                                onClick={() => setPage(page + 1)}
                                className="px-3 py-1.5 text-xs rounded-lg border border-border bg-background disabled:opacity-40 hover:bg-muted transition-colors"
                            >
                                Next →
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
