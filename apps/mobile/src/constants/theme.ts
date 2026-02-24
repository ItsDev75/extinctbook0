// ╔═══════════════════════════════════════════════════╗
// ║  EXTINCTBOOK DESIGN SYSTEM                        ║
// ║  Philosophy: Editorial. Stark. Senior-friendly.   ║
// ╚═══════════════════════════════════════════════════╝

// ── Palette: Black & White ────────────────────────────
export const Colors = {
    primary: "#000000",
    primaryLight: "#F2F2F2",
    success: "#1A1A1A",
    danger: "#1A1A1A",
    warning: "#555555",
    info: "#333333",
    background: "#FFFFFF",
    surface: "#F8F8F8",
    surfaceElevated: "#FFFFFF",
    border: "#E8E8E8",
    divider: "#F0F0F0",
    textPrimary: "#0A0A0A",
    textSecondary: "#505050",
    textTertiary: "#9A9A9A",
    textInverse: "#FFFFFF",
    amountIn: "#000000",   // income — bold weight signals it
    amountOut: "#505050",   // expense — lighter
    whatsapp: "#25D366",   // external brand only
};

// ── Typography: System Fonts with Intentional Weight ─
// Uses platform system font (SF Pro on iOS, Roboto on Android)
// Differentiation through: weight, size, letter-spacing, line-height
export const Typography = {
    // Display — hero numbers (balance amount)
    displayNumber: {
        fontSize: 52,
        fontWeight: "900" as const,
        letterSpacing: -2,
        lineHeight: 58,
    },

    // Headings — tight tracking, heavy weight
    h1: { fontSize: 30, fontWeight: "900" as const, letterSpacing: -0.8, lineHeight: 36 },
    h2: { fontSize: 24, fontWeight: "800" as const, letterSpacing: -0.5, lineHeight: 30 },
    h3: { fontSize: 19, fontWeight: "700" as const, letterSpacing: -0.3, lineHeight: 25 },
    h4: { fontSize: 16, fontWeight: "600" as const, letterSpacing: -0.2, lineHeight: 22 },

    // Body — comfortable for seniors
    body: { fontSize: 16, fontWeight: "400" as const, letterSpacing: 0, lineHeight: 24 },
    bodyMedium: { fontSize: 16, fontWeight: "500" as const, letterSpacing: 0, lineHeight: 24 },
    bodyStrong: { fontSize: 16, fontWeight: "700" as const, letterSpacing: 0, lineHeight: 24 },

    // Labels — uppercase tracked (editorial detail)
    caption: { fontSize: 13, fontWeight: "400" as const, letterSpacing: 0, lineHeight: 18 },
    label: { fontSize: 11, fontWeight: "600" as const, letterSpacing: 1.4, lineHeight: 16 },
    overline: { fontSize: 11, fontWeight: "600" as const, letterSpacing: 1.4, lineHeight: 16 },
};

// ── Border-Radius: Sharp philosophy ──────────────────
// Commit: cards/buttons use 6-8px. Full-round ONLY for avatars.
export const Radius = {
    none: 0,
    xs: 4,
    sm: 6,   // buttons, inputs
    md: 8,   // cards
    lg: 12,  // large cards
    xl: 16,  // bottom sheets
    full: 9999, // avatar/pill ONLY
};

// ── Spacing: More air than standard ──────────────────
export const Spacing = {
    xs: 4,
    sm: 8,
    md: 12,
    base: 20,
    lg: 28,
    xl: 36,
    xxl: 48,
    xxxl: 64,
};

// ── Shadow: Near-flat for starkness ──────────────────
export const Shadow = {
    sm: { shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
    md: { shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 3 },
    lg: { shadowColor: "#000", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.12, shadowRadius: 14, elevation: 6 },
};

export const CategoryColors = ["#111", "#333", "#555", "#777", "#222", "#444"];
