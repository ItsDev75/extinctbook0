import AsyncStorage from "@react-native-async-storage/async-storage";
import type { TransactionWithCategory, SpendingSummary } from "@extinctbook/shared";

const KEYS = {
    transactions: "@cache_transactions",
    summary: "@cache_summary",
    cacheTime: "@cache_time",
};

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

// ─── Save transactions to cache ─────────────────────────────────────────────
export async function cacheTransactions(data: TransactionWithCategory[]) {
    await AsyncStorage.setItem(KEYS.transactions, JSON.stringify(data));
    await AsyncStorage.setItem(KEYS.cacheTime, Date.now().toString());
}

// ─── Load cached transactions ────────────────────────────────────────────────
export async function getCachedTransactions(): Promise<TransactionWithCategory[] | null> {
    try {
        const raw = await AsyncStorage.getItem(KEYS.transactions);
        if (!raw) return null;
        return JSON.parse(raw) as TransactionWithCategory[];
    } catch {
        return null;
    }
}

// ─── Save summary ─────────────────────────────────────────────────────────────
export async function cacheSummary(data: SpendingSummary) {
    await AsyncStorage.setItem(KEYS.summary, JSON.stringify(data));
}

// ─── Load cached summary ─────────────────────────────────────────────────────
export async function getCachedSummary(): Promise<SpendingSummary | null> {
    try {
        const raw = await AsyncStorage.getItem(KEYS.summary);
        if (!raw) return null;
        return JSON.parse(raw) as SpendingSummary;
    } catch {
        return null;
    }
}

// ─── Check if cache is stale ──────────────────────────────────────────────────
export async function isCacheStale(): Promise<boolean> {
    const raw = await AsyncStorage.getItem(KEYS.cacheTime);
    if (!raw) return true;
    return Date.now() - parseInt(raw, 10) > CACHE_TTL_MS;
}

// ─── Clear all cache ──────────────────────────────────────────────────────────
export async function clearCache() {
    await Promise.all([
        AsyncStorage.removeItem(KEYS.transactions),
        AsyncStorage.removeItem(KEYS.summary),
        AsyncStorage.removeItem(KEYS.cacheTime),
    ]);
}
