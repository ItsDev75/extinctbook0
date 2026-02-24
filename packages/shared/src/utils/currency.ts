/**
 * Format a number as Indian currency (INR)
 */
export function formatINR(amount: number): string {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: 2,
    }).format(amount);
}

/**
 * Format a number with a currency code
 */
export function formatCurrency(amount: number, currency = "INR"): string {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency,
        minimumFractionDigits: 2,
    }).format(amount);
}

/**
 * Convert a currency amount string to number
 */
export function parseCurrencyInput(value: string): number {
    return parseFloat(value.replace(/[^0-9.]/g, "")) || 0;
}
