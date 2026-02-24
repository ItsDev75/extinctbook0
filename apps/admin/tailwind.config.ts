import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: "class",
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                border: "hsl(var(--color-border))",
                input: "hsl(var(--color-input))",
                background: "hsl(var(--color-background))",
                foreground: "hsl(var(--color-foreground))",
                surface: "hsl(var(--color-surface))",
                primary: {
                    DEFAULT: "hsl(var(--color-primary))",
                    foreground: "hsl(var(--color-primary-foreground))",
                    hover: "hsl(var(--color-primary-hover))",
                },
                card: {
                    DEFAULT: "hsl(var(--color-card))",
                    foreground: "hsl(var(--color-card-foreground))",
                },
                muted: {
                    DEFAULT: "hsl(var(--color-surface))",
                    foreground: "hsl(var(--color-muted-foreground))",
                },
                success: {
                    DEFAULT: "hsl(var(--color-success))",
                    foreground: "hsl(var(--color-success-foreground))",
                },
                danger: {
                    DEFAULT: "hsl(var(--color-danger))",
                    foreground: "hsl(var(--color-danger-foreground))",
                },
                warning: {
                    DEFAULT: "hsl(var(--color-warning))",
                    foreground: "hsl(var(--color-warning-foreground))",
                },
                sidebar: {
                    DEFAULT: "hsl(var(--color-sidebar))",
                    foreground: "hsl(var(--color-sidebar-foreground))",
                    active: "hsl(var(--color-sidebar-active))",
                    hover: "hsl(var(--color-sidebar-hover))",
                    border: "hsl(var(--color-sidebar-border))",
                },
            },
            fontFamily: {
                sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
            },
            borderRadius: {
                DEFAULT: "var(--radius)",
                sm: "var(--radius-sm)",
                lg: "var(--radius-lg)",
            },
            boxShadow: {
                sm: "var(--shadow-sm)",
                DEFAULT: "var(--shadow)",
                md: "var(--shadow-md)",
                lg: "var(--shadow-lg)",
            },
            animation: {
                "fade-in": "fadeIn 0.2s ease-out",
                "slide-in-from-top": "slideInFromTop 0.3s ease-out",
                "slide-in-from-right": "slideInFromRight 0.3s ease-out",
                "pulse-subtle": "pulseSubtle 2s infinite",
            },
            keyframes: {
                fadeIn: {
                    from: { opacity: "0" },
                    to: { opacity: "1" },
                },
                slideInFromTop: {
                    from: { opacity: "0", transform: "translateY(-8px)" },
                    to: { opacity: "1", transform: "translateY(0)" },
                },
                slideInFromRight: {
                    from: { opacity: "0", transform: "translateX(8px)" },
                    to: { opacity: "1", transform: "translateX(0)" },
                },
                pulseSubtle: {
                    "0%, 100%": { opacity: "1" },
                    "50%": { opacity: "0.6" },
                },
            },
        },
    },
    plugins: [],
};

export default config;
