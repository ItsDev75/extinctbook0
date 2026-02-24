import type { Metadata } from "next";
import { Package, Truck, CheckCircle, XCircle, Clock, ChevronRight, ShoppingCart } from "lucide-react";

export const metadata: Metadata = { title: "Order Fulfillment" };

// TODO: fetch from GET /api/orders

const stages = [
    { key: "new", label: "New", icon: Clock, color: "text-primary", bg: "bg-primary/10", count: 0 },
    { key: "processing", label: "Processing", icon: Package, color: "text-warning", bg: "bg-warning/10", count: 0 },
    { key: "dispatched", label: "Dispatched", icon: Truck, color: "text-blue-500", bg: "bg-blue-100 dark:bg-blue-900/30", count: 0 },
    { key: "delivered", label: "Delivered", icon: CheckCircle, color: "text-success", bg: "bg-success/10", count: 0 },
    { key: "cancelled", label: "Cancelled", icon: XCircle, color: "text-danger", bg: "bg-danger/10", count: 0 },
];

export default function OrdersPage() {
    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <h1 className="text-2xl font-bold text-foreground">Order Fulfillment</h1>
                <p className="text-muted-foreground text-sm mt-1">Track and manage orders from inception to delivery</p>
            </div>

            {/* Pipeline */}
            <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
                <h2 className="font-semibold text-foreground mb-4">Fulfillment Pipeline</h2>
                <div className="flex items-center gap-2 overflow-x-auto pb-2">
                    {stages.map((stage, i) => {
                        const Icon = stage.icon;
                        return (
                            <div key={stage.key} className="flex items-center gap-2 shrink-0">
                                <div className="flex flex-col items-center gap-2">
                                    <div className={`w-12 h-12 rounded-2xl ${stage.bg} flex items-center justify-center`}>
                                        <Icon className={`h-5 w-5 ${stage.color}`} />
                                    </div>
                                    <span className={`text-lg font-bold ${stage.color}`}>{stage.count}</span>
                                    <span className="text-xs text-muted-foreground whitespace-nowrap">{stage.label}</span>
                                </div>
                                {i < stages.length - 1 && <ChevronRight className="h-5 w-5 text-border shrink-0 mx-1" />}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Empty State */}
            <div className="bg-card rounded-2xl border border-border shadow-sm">
                <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                    <h2 className="font-semibold text-foreground">All Orders</h2>
                    <input
                        type="text"
                        placeholder="Search orders..."
                        className="px-4 py-2 rounded-xl border border-input bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                </div>
                <div className="flex flex-col items-center justify-center py-16 text-center">
                    <ShoppingCart className="h-10 w-10 text-muted-foreground/40 mb-3" />
                    <p className="text-sm font-medium text-muted-foreground">No orders yet</p>
                    <p className="text-xs text-muted-foreground/70 mt-1">Orders will appear here once the API is connected</p>
                </div>
            </div>
        </div>
    );
}
