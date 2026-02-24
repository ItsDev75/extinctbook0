import { useState, useEffect, useCallback } from "react";
import { api, apiGet, apiPost, apiPatch, apiDelete } from "../lib/api";
import type {
    TransactionWithCategory,
    SpendingSummary,
    CategoryBreakdown,
    DailySpending,
} from "@extinctbook/shared";

// ─── Types ────────────────────────────────────────────────────────────────
interface Pagination {
    total: number; page: number; limit: number; totalPages: number;
}

interface TransactionFilters {
    type?: "expense" | "income" | "transfer";
    categoryId?: string;
    paymentMode?: "cash" | "upi" | "card" | "bank" | "wallet";
    startDate?: string;
    endDate?: string;
    minAmount?: number;
    maxAmount?: number;
    search?: string;
    page?: number;
    limit?: number;
}

// ─── Fetch transactions list ───────────────────────────────────────────────
export function useTransactions(filters: TransactionFilters = {}) {
    const [data, setData] = useState<TransactionWithCategory[]>([]);
    const [pagination, setPagination] = useState<Pagination | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetch = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // The backend spreads result: { success, data: [...], pagination: {} }
            // so we use api.get directly instead of apiGet (which would only extract .data)
            const res = await api.get<{
                success: boolean;
                data: TransactionWithCategory[];
                pagination: Pagination;
            }>("/transactions", { params: filters });
            setData(res.data.data ?? []);
            setPagination(res.data.pagination ?? null);
        } catch (e: any) {
            setError(e.response?.data?.message ?? "Failed to load transactions");
        } finally {
            setLoading(false);
        }
    }, [JSON.stringify(filters)]);

    useEffect(() => { fetch(); }, [fetch]);
    return { data, pagination, loading, error, refetch: fetch };
}

// ─── Fetch summary (balance, today, week, month, year) ────────────────────
export function useSummary() {
    const [data, setData] = useState<SpendingSummary | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetch = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await apiGet<SpendingSummary>("/transactions/summary");
            setData(res);
        } catch (e: any) {
            setError(e.response?.data?.message ?? "Failed to load summary");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetch(); }, [fetch]);
    return { data, loading, error, refetch: fetch };
}

// ─── Fetch pie chart data ─────────────────────────────────────────────────
export function usePieChart(type: "expense" | "income" = "expense", period = "month") {
    const [data, setData] = useState<CategoryBreakdown[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setLoading(true);
        apiGet<CategoryBreakdown[]>("/transactions/chart/pie", { type, period })
            .then(setData)
            .catch((e) => setError(e.response?.data?.message ?? "Failed to load chart"))
            .finally(() => setLoading(false));
    }, [type, period]);

    return { data, loading, error };
}

// ─── Fetch bar chart data ─────────────────────────────────────────────────
export function useDailyChart(days = 30) {
    const [data, setData] = useState<DailySpending[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        apiGet<DailySpending[]>("/transactions/chart/daily", { days })
            .then(setData)
            .catch(() => { })
            .finally(() => setLoading(false));
    }, [days]);

    return { data, loading };
}

// ─── Create transaction ────────────────────────────────────────────────────
export async function createTransaction(body: {
    type: "expense" | "income" | "transfer";
    amount: number;
    categoryId: string;
    paymentMode?: "cash" | "upi" | "card" | "bank" | "wallet";
    note?: string;
    date: string;
    isRecurring?: boolean;
    recurringInterval?: "daily" | "weekly" | "monthly" | "yearly";
}) {
    return apiPost<TransactionWithCategory>("/transactions", body);
}

// ─── Update transaction ────────────────────────────────────────────────────
export async function updateTransaction(id: string, body: Partial<Parameters<typeof createTransaction>[0]>) {
    return apiPatch<TransactionWithCategory>(`/transactions/${id}`, body);
}

// ─── Delete transaction ────────────────────────────────────────────────────
export async function deleteTransactionById(id: string) {
    return apiDelete(`/transactions/${id}`);
}
