/**
 * Format a date string for display (e.g., "22 Feb 2026")
 */
export function formatDate(dateStr: string): string {
    return new Intl.DateTimeFormat("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    }).format(new Date(dateStr));
}

/**
 * Format a date for time display (e.g., "9:30 AM")
 */
export function formatTime(dateStr: string): string {
    return new Intl.DateTimeFormat("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    }).format(new Date(dateStr));
}

/**
 * Get ISO date string for today
 */
export function todayISO(): string {
    return new Date().toISOString().split("T")[0];
}

/**
 * Get start of the current week (Monday)
 */
export function startOfWeekISO(): string {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(now.setDate(diff)).toISOString().split("T")[0];
}

/**
 * Get start of current month
 */
export function startOfMonthISO(): string {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
}

/**
 * Get last N days as ISO strings
 */
export function lastNDays(n: number): string[] {
    return Array.from({ length: n }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (n - 1 - i));
        return d.toISOString().split("T")[0];
    });
}
