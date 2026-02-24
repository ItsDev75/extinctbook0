import { View, Text, StyleSheet } from "react-native";
import { CategoryIcon } from "@/components/CategoryIcon";
import { Colors, Spacing } from "@/constants/theme";

// ─── Mini Bar Chart (daily income vs expense) ─────────────────────────────
interface BarData { date: string; income: number; expense: number }

export function BarChart({ data, days = 14 }: { data: BarData[]; days?: number }) {
    const slice = data.slice(-days);
    const max = Math.max(...slice.flatMap((d) => [d.income, d.expense]), 1);

    return (
        <View>
            <View style={bar.grid}>
                {slice.map((d, i) => (
                    <View key={i} style={bar.col}>
                        <View style={bar.barPair}>
                            {/* Income bar */}
                            <View style={[bar.bar, bar.barIn, { height: `${Math.round((d.income / max) * 100)}%` as any }]} />
                            {/* Expense bar */}
                            <View style={[bar.bar, bar.barOut, { height: `${Math.round((d.expense / max) * 100)}%` as any }]} />
                        </View>
                        <Text style={bar.label} numberOfLines={1}>
                            {new Date(d.date).getDate()}
                        </Text>
                    </View>
                ))}
            </View>
            <View style={bar.legend}>
                <View style={bar.legendItem}>
                    <View style={[bar.dot, { backgroundColor: "#000" }]} />
                    <Text style={bar.legendLabel}>Income</Text>
                </View>
                <View style={bar.legendItem}>
                    <View style={[bar.dot, { backgroundColor: Colors.textTertiary }]} />
                    <Text style={bar.legendLabel}>Expense</Text>
                </View>
            </View>
        </View>
    );
}

const bar = StyleSheet.create({
    grid: { flexDirection: "row", alignItems: "flex-end", height: 120, gap: 6 },
    col: { flex: 1, alignItems: "center", height: "100%" },
    barPair: { flex: 1, width: "100%", flexDirection: "row", alignItems: "flex-end", gap: 2 },
    bar: { flex: 1, borderRadius: 3, minHeight: 2 },
    barIn: { backgroundColor: "#000000" },
    barOut: { backgroundColor: Colors.textTertiary },
    label: { fontSize: 9, color: Colors.textTertiary, marginTop: 4 },
    legend: { flexDirection: "row", justifyContent: "center", gap: Spacing.base, marginTop: Spacing.sm },
    legendItem: { flexDirection: "row", alignItems: "center", gap: 6 },
    dot: { width: 8, height: 8, borderRadius: 99 },
    legendLabel: { fontSize: 11, color: Colors.textSecondary, fontWeight: "500" },
});

// ─── Horizontal Category Breakdown (replaces pie chart) ───────────────────
interface CategoryData { categoryName: string; icon: string; total: number; percentage: number }

export function CategoryBreakdownChart({ data }: { data: CategoryData[] }) {
    const top = data.slice(0, 6);

    if (!top.length) {
        return (
            <View style={pie.empty}>
                <Text style={pie.emptyText}>No data for this period</Text>
            </View>
        );
    }

    return (
        <View style={pie.container}>
            {top.map((item, i) => (
                <View key={i} style={pie.row}>
                    <View style={pie.iconBox}>
                        <CategoryIcon
                            icon={item.icon}
                            size={16}
                            color={Colors.textPrimary}
                        />
                    </View>
                    <View style={{ flex: 1 }}>
                        <View style={pie.labelRow}>
                            <Text style={pie.catName}>{item.categoryName}</Text>
                            <Text style={pie.catPct}>{item.percentage}%</Text>
                        </View>
                        <View style={pie.track}>
                            <View style={[pie.fill, { width: `${item.percentage}%` as any }]} />
                        </View>
                    </View>
                </View>
            ))}
        </View>
    );
}

const pie = StyleSheet.create({
    container: { gap: Spacing.md },
    row: { flexDirection: "row", alignItems: "center", gap: Spacing.md },
    iconBox: { width: 30, height: 30, borderRadius: 8, backgroundColor: Colors.surface, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: Colors.border },
    labelRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 5 },
    catName: { fontSize: 13, fontWeight: "600", color: Colors.textPrimary },
    catPct: { fontSize: 12, fontWeight: "700", color: Colors.textSecondary },
    track: { height: 6, backgroundColor: Colors.surface, borderRadius: 99, overflow: "hidden", borderWidth: 1, borderColor: Colors.border },
    fill: { height: "100%", backgroundColor: "#000", borderRadius: 99 },
    empty: { alignItems: "center", paddingVertical: Spacing.xl },
    emptyText: { color: Colors.textTertiary, fontSize: 13 },
});
