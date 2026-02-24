"use client";

import { Settings, Bell, Shield, Globe, Moon } from "lucide-react";

function SettingRow({ icon: Icon, label, description, children }: {
    icon: React.ElementType; label: string; description?: string; children?: React.ReactNode;
}) {
    return (
        <div className="flex items-center justify-between px-6 py-4 border-b border-border last:border-0">
            <div className="flex items-center gap-4">
                <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                    <p className="text-sm font-medium text-foreground">{label}</p>
                    {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
                </div>
            </div>
            {children}
        </div>
    );
}

export default function SettingsPage() {
    return (
        <div className="space-y-8 animate-fade-in max-w-2xl">
            <div>
                <h1 className="text-2xl font-bold text-foreground">Settings</h1>
                <p className="text-muted-foreground text-sm mt-1">Admin panel preferences and configuration</p>
            </div>

            <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-border">
                    <h2 className="font-semibold text-foreground">Appearance</h2>
                </div>
                <SettingRow icon={Moon} label="Dark Mode" description="Toggle between light and dark theme">
                    <button className="relative w-11 h-6 rounded-full bg-foreground transition-colors">
                        <span className="absolute right-0.5 top-0.5 w-5 h-5 rounded-full bg-background transition-transform" />
                    </button>
                </SettingRow>
                <SettingRow icon={Globe} label="Language" description="Admin panel display language">
                    <select className="text-sm border border-input rounded-lg px-3 py-1.5 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary">
                        <option>English</option>
                        <option>Hindi</option>
                    </select>
                </SettingRow>
            </div>

            <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-border">
                    <h2 className="font-semibold text-foreground">Notifications</h2>
                </div>
                <SettingRow icon={Bell} label="New User Alerts" description="Get notified when new users register">
                    <button className="relative w-11 h-6 rounded-full bg-muted transition-colors">
                        <span className="absolute left-0.5 top-0.5 w-5 h-5 rounded-full bg-white border border-border transition-transform" />
                    </button>
                </SettingRow>
            </div>

            <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-border">
                    <h2 className="font-semibold text-foreground">Security</h2>
                </div>
                <SettingRow icon={Shield} label="Admin Token" description="Backend API base URL for this panel">
                    <input
                        type="password"
                        placeholder="Paste JWT token..."
                        onChange={(e) => localStorage.setItem("admin_token", e.target.value)}
                        className="text-sm border border-input rounded-lg px-3 py-1.5 bg-background text-foreground w-64 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                </SettingRow>
                <SettingRow icon={Globe} label="Backend API URL" description="e.g. http://10.21.2.50:3001">
                    <input
                        type="text"
                        defaultValue={process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001"}
                        className="text-sm border border-input rounded-lg px-3 py-1.5 bg-background text-foreground w-64 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                </SettingRow>
            </div>

            <p className="text-xs text-muted-foreground text-center pb-4">
                Extinctbook Admin Panel · v1.0.0
            </p>
        </div>
    );
}
