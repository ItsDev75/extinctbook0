export type OrderStatus = "new" | "processing" | "dispatched" | "delivered" | "cancelled";
export type UserSystemRole = "admin" | "manager" | "field_agent";

export interface Order {
    id: string;
    clientName: string;
    clientEmail: string;
    items: OrderItem[];
    totalAmount: number;
    status: OrderStatus;
    assignedTo?: string;
    createdAt: string;
    updatedAt: string;
}

export interface OrderItem {
    id: string;
    orderId: string;
    name: string;
    quantity: number;
    unitPrice: number;
}

export interface AdminUser {
    id: string;
    name: string;
    email: string;
    role: UserSystemRole;
    isActive: boolean;
    lastLoginAt?: string;
    createdAt: string;
}

export interface BusinessMetrics {
    totalOrders: number;
    pendingOrders: number;
    revenue: number;
    activeUsers: number;
    period: "day" | "week" | "month";
}
