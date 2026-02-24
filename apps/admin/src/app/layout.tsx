import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-sans",
    display: "swap",
});

export const metadata: Metadata = {
    title: {
        template: "%s | Extinctbook Admin",
        default: "Extinctbook Admin",
    },
    description: "Extinctbook Admin Panel — Manage users, orders, and business operations",
    manifest: "/manifest.json",
    applicationName: "Extinctbook Admin",
    appleWebApp: {
        capable: true,
        statusBarStyle: "default",
        title: "Extinctbook",
    },
};

export const viewport: Viewport = {
    themeColor: "#1A73E8",
    width: "device-width",
    initialScale: 1,
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={`${inter.variable} antialiased`}>
                {children}
            </body>
        </html>
    );
}
