import { useState, useEffect, useCallback } from "react";
import { apiGet, apiPost, apiDelete } from "../lib/api";
import type { Category } from "@extinctbook/shared";

export function useCategories() {
    const [data, setData] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetch = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await apiGet<Category[]>("/categories");
            setData(res);
        } catch (e: any) {
            setError(e.response?.data?.message ?? "Failed to load categories");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetch(); }, [fetch]);

    const createCategory = async (name: string, icon: string, color: string) => {
        const cat = await apiPost<Category>("/categories", { name, icon, color });
        setData((prev) => [...prev, cat]);
        return cat;
    };

    const deleteCategory = async (id: string) => {
        await apiDelete(`/categories/${id}`);
        setData((prev) => prev.filter((c) => c.id !== id));
    };

    return { data, loading, error, refetch: fetch, createCategory, deleteCategory };
}
