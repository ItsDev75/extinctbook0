export type TransactionType = "expense" | "income" | "transfer";
export type PaymentMode = "cash" | "upi" | "card" | "bank" | "wallet";
export type RecurringInterval = "daily" | "weekly" | "monthly" | "yearly";

export interface Transaction {
    id: string;
    userId: string;
    type: TransactionType;
    amount: number;
    currency: string;
    categoryId: string;
    paymentMode: PaymentMode;
    note?: string;
    date: string;
    isRecurring: boolean;
    recurringInterval?: RecurringInterval;
    createdAt: string;
    updatedAt: string;
}

export interface TransactionWithCategory extends Transaction {
    category: Category;
}

export interface Category {
    id: string;
    name: string;
    icon: string;
    color: string;
    isCustom: boolean;
    userId?: string;
}

export interface SpendingSummary {
    totalIncome: number;
    totalExpense: number;
    balance: number;
    today: { income: number; expense: number };
    thisWeek: { income: number; expense: number };
    thisMonth: { income: number; expense: number };
    thisYear: { income: number; expense: number };
    currency: string;
}

export interface CategoryBreakdown {
    categoryId: string;
    categoryName: string;
    icon: string;
    total: number;
    count: number;
    percentage: number;
}

export interface DailySpending {
    date: string;        // "YYYY-MM-DD"
    income: number;
    expense: number;
}

export interface SparklinePoint {
    date: string;
    amount: number;
}
