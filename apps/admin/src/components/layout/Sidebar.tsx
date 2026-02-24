"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Users,
    ShoppingCart,
    BarChart3,
    Shield,
    Settings,
    LogOut,
    Menu,
    X,
} from "lucide-react";
import { useState } from "react";

const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Users", href: "/users", icon: Users },
    { label: "Orders", href: "/orders", icon: ShoppingCart },
    { label: "Analytics", href: "/analytics", icon: BarChart3 },
    { label: "Data & Privacy", href: "/privacy", icon: Shield },
    { label: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
    const pathname = usePathname();
    const [mobileOpen, setMobileOpen] = useState(false);

    const NavContent = () => (
        <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="flex items-center gap-3 px-6 py-6 border-b border-sidebar-border">
                <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary shadow-sm">
                    <span className="text-white text-base font-bold">E</span>
                </div>
                <div>
                    <p className="text-sidebar-foreground font-bold text-sm leading-none">Extinctbook</p>
                    <p className="text-sidebar-foreground/50 text-xs mt-0.5">Admin Panel</p>
                </div>
            </div>

            {/* Nav Links */}
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                {navItems.map(({ label, href, icon: Icon }) => {
                    const isActive = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
                    return (
                        <Link
                            key={href}
                            href={href}
                            onClick={() => setMobileOpen(false)}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${isActive
                                    ? "bg-primary text-white shadow-sm"
                                    : "text-sidebar-foreground hover:bg-sidebar-hover"
                                }`}
                        >
                            <Icon className="h-4 w-4 flex-shrink-0" />
                            {label}
                        </Link>
                    );
                })}
            </nav>

            {/* User / Logout */}
            <div className="px-3 py-4 border-t border-sidebar-border">
                <div className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-sidebar-hover transition cursor-pointer">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">
                        AD
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sidebar-foreground text-xs font-medium truncate">Admin User</p>
                        <p className="text-sidebar-foreground/50 text-xs truncate">admin@extinctbook.com</p>
                    </div>
                    <LogOut className="h-4 w-4 text-sidebar-foreground/50 hover:text-sidebar-foreground transition" />
                </div>
            </div>
        </div>
    );

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex flex-col w-64 shrink-0 bg-sidebar border-r border-sidebar-border h-screen sticky top-0">
                <NavContent />
            </aside>

            {/* Mobile Toggle Button */}
            <button
                onClick={() => setMobileOpen(true)}
                className="lg:hidden fixed top-4 left-4 z-50 w-10 h-10 rounded-xl bg-sidebar text-sidebar-foreground flex items-center justify-center shadow-md"
            >
                <Menu className="h-5 w-5" />
            </button>

            {/* Mobile Drawer */}
            {mobileOpen && (
                <div className="lg:hidden fixed inset-0 z-50">
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={() => setMobileOpen(false)}
                    />
                    <aside className="absolute left-0 top-0 h-full w-64 bg-sidebar flex flex-col shadow-xl">
                        <button
                            onClick={() => setMobileOpen(false)}
                            className="absolute top-4 right-4 text-sidebar-foreground/60 hover:text-sidebar-foreground"
                        >
                            <X className="h-5 w-5" />
                        </button>
                        <NavContent />
                    </aside>
                </div>
            )}
        </>
    );
}
