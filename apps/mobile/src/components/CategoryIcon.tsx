import { Ionicons } from "@expo/vector-icons";

/**
 * Returns true only if the string is a valid Ionicons name
 * (e.g. "restaurant-outline"). Emojis, empty strings, and
 * anything with non-ASCII chars will return false.
 */
function isValidIoniconName(icon: string): boolean {
    return typeof icon === "string" && /^[a-z0-9-]+$/.test(icon);
}

const FALLBACK = "grid-outline" as const;

interface CategoryIconProps {
    icon: string | null | undefined;
    size: number;
    color: string;
    style?: object;
}

/**
 * Safe drop-in for <Ionicons> when rendering a category icon.
 * If the stored icon value is an emoji or invalid, renders the
 * fallback icon instead of throwing a WARN.
 */
export function CategoryIcon({ icon, size, color, style }: CategoryIconProps) {
    const name = isValidIoniconName(icon ?? "") ? (icon as any) : FALLBACK;
    return <Ionicons name={name} size={size} color={color} style={style} />;
}
