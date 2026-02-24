import type { Metadata } from "next";
import { Shield, Lock, Trash2, Download, ToggleRight } from "lucide-react";

export const metadata: Metadata = { title: "Data & Privacy" };

const privacyControls = [
    {
        label: "Encryption in Transit",
        description: "All data transmitted between client and server is encrypted with TLS 1.3",
        enabled: true,
        icon: Lock,
    },
    {
        label: "Encryption at Rest",
        description: "All database entries and user files are encrypted using AES-256",
        enabled: true,
        icon: Shield,
    },
    {
        label: "Usage Analytics",
        description: "Collect anonymous usage statistics to improve the platform",
        enabled: false,
        icon: ToggleRight,
    },
];

export default function PrivacyPage() {
    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <h1 className="text-2xl font-bold text-foreground">Data & Privacy</h1>
                <p className="text-muted-foreground text-sm mt-1">Configure data collection, security, and compliance settings</p>
            </div>

            {/* Security Controls */}
            <div className="bg-card rounded-2xl border border-border shadow-sm">
                <div className="px-6 py-4 border-b border-border">
                    <h2 className="font-semibold text-foreground">Security Controls</h2>
                </div>
                <div className="divide-y divide-border">
                    {privacyControls.map(({ label, description, enabled, icon: Icon }) => (
                        <div key={label} className="px-6 py-4 flex items-center justify-between gap-4">
                            <div className="flex items-start gap-3">
                                <div className={`mt-0.5 w-9 h-9 rounded-xl flex items-center justify-center ${enabled ? "bg-success/10" : "bg-muted"}`}>
                                    <Icon className={`h-4 w-4 ${enabled ? "text-success" : "text-muted-foreground"}`} />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-foreground">{label}</p>
                                    <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
                                </div>
                            </div>
                            {/* Toggle */}
                            <div className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer ${enabled ? "bg-success" : "bg-border"}`}>
                                <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${enabled ? "translate-x-5 left-0" : "translate-x-0.5 left-0"}`} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Data Actions */}
            <div className="bg-card rounded-2xl border border-border shadow-sm">
                <div className="px-6 py-4 border-b border-border">
                    <h2 className="font-semibold text-foreground">Data Management</h2>
                </div>
                <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button className="flex items-center gap-3 p-4 rounded-2xl border border-border hover:bg-muted transition text-left">
                        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                            <Download className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-foreground">Export All Data</p>
                            <p className="text-xs text-muted-foreground">Download a full backup as JSON/CSV</p>
                        </div>
                    </button>

                    <button className="flex items-center gap-3 p-4 rounded-2xl border border-danger/30 hover:bg-danger/5 transition text-left">
                        <div className="w-9 h-9 rounded-xl bg-danger/10 flex items-center justify-center shrink-0">
                            <Trash2 className="h-4 w-4 text-danger" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-danger">Delete All Data</p>
                            <p className="text-xs text-muted-foreground">Permanently remove all user data — irreversible</p>
                        </div>
                    </button>
                </div>
            </div>

            {/* Compliance Notice */}
            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5">
                <div className="flex items-start gap-3">
                    <Shield className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    <div>
                        <p className="text-sm font-semibold text-foreground">Compliance & Privacy Policy</p>
                        <p className="text-xs text-muted-foreground mt-1">
                            LiveMunshi complies with applicable Indian data protection regulations. All personal data is
                            processed in accordance with our Privacy Policy. Users may request data deletion or export at any time.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
