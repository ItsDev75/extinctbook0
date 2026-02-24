import {
    View, Text, StyleSheet, TouchableOpacity, SectionList,
    ActivityIndicator, RefreshControl, TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useState, useCallback } from "react";
import { Colors, Spacing, Radius, Shadow } from "@/constants/theme";
import { CategoryIcon } from "@/components/CategoryIcon";
import { useTransactions, useSummary, usePieChart, useDailyChart } from "@/hooks/useTransactions";
import { exportAsPDF, exportAsCSV } from "@/lib/export";
import { BarChart, CategoryBreakdownChart } from "@/components/Charts";
import type { TransactionWithCategory } from "@extinctbook/shared";

type FilterType = "all" | "expense" | "income" | "transfer";
type FilterPayment = "all" | "cash" | "upi" | "card" | "bank" | "wallet";

function formatINR(n: number) {
    return Math.abs(n).toLocaleString("en-IN");
}

function groupByDate(transactions: TransactionWithCategory[]) {
    const groups = new Map<string, TransactionWithCategory[]>();
    for (const tx of transactions) {
        const key = new Date(tx.date).toLocaleDateString("en-IN", {
            day: "numeric", month: "long", year: "numeric",
        });
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key)!.push(tx);
    }
    return Array.from(groups.entries()).map(([title, data]) => ({ title, data }));
}

export default function HistoryScreen() {
    const [typeFilter, setTypeFilter] = useState<FilterType>("all");
    const [paymentFilter, setPaymentFilter] = useState<FilterPayment>("all");
    const [search, setSearch] = useState("");
    const [refreshing, setRefreshing] = useState(false);
    const [exporting, setExporting] = useState(false);
    const [showInsights, setShowInsights] = useState(false);

    const { data: pieData } = usePieChart("expense", "month");
    const { data: barData } = useDailyChart(14);

    const filters = {
        type: typeFilter !== "all" ? typeFilter : undefined,
        paymentMode: paymentFilter !== "all" ? paymentFilter : undefined,
        search: search || undefined,
        limit: 100,
    };

    const { data: transactions, loading, refetch } = useTransactions({ ...(filters as any), limit: 500 });
    const { data: summary, refetch: refetchSummary } = useSummary();

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await Promise.all([refetch(), refetchSummary()]);
        setRefreshing(false);
    }, [refetch, refetchSummary]);

    const handleExport = async (format: "pdf" | "csv") => {
        if (!transactions.length) return;
        setExporting(true);
        try {
            if (format === "pdf") {
                await exportAsPDF(transactions, {
                    totalIncome: summary?.totalIncome ?? 0,
                    totalExpense: summary?.totalExpense ?? 0,
                    balance: summary?.balance ?? 0,
                });
            } else {
                await exportAsCSV(transactions);
            }
        } finally {
            setExporting(false);
        }
    };

    const sections = groupByDate(transactions);

    return (
        <SafeAreaView style={styles.container} edges={["top"]}>
            {/* Summary Band */}
            <View style={styles.summaryBand}>
                <View style={styles.sumItem}>
                    <Text style={styles.sumLabel}>INCOME</Text>
                    <Text style={styles.sumIn}>+₹{formatINR(summary?.thisMonth.income ?? 0)}</Text>
                </View>
                <View style={styles.sumDivider} />
                <View style={styles.sumItem}>
                    <Text style={styles.sumLabel}>SPENT</Text>
                    <Text style={styles.sumOut}>-₹{formatINR(summary?.thisMonth.expense ?? 0)}</Text>
                </View>
                <View style={styles.sumDivider} />
                <View style={styles.sumItem}>
                    <Text style={styles.sumLabel}>NET</Text>
                    <Text style={styles.sumNet}>₹{formatINR((summary?.thisMonth.income ?? 0) - (summary?.thisMonth.expense ?? 0))}</Text>
                </View>
            </View>

            {/* Insights toggle */}
            <TouchableOpacity
                style={styles.insightsToggle}
                onPress={() => setShowInsights(!showInsights)}
            >
                <Text style={styles.insightsToggleText}>📊  Insights</Text>
                <Ionicons
                    name={showInsights ? "chevron-up" : "chevron-down"}
                    size={16}
                    color={Colors.textTertiary}
                />
            </TouchableOpacity>

            {showInsights && (
                <View style={styles.insightsPanel}>
                    <Text style={styles.insightsSectionLabel}>DAILY TREND — LAST 14 DAYS</Text>
                    <BarChart data={barData} days={14} />
                    <View style={styles.insightsDivider} />
                    <Text style={styles.insightsSectionLabel}>TOP SPEND CATEGORIES — THIS MONTH</Text>
                    <CategoryBreakdownChart data={pieData} />
                </View>
            )}

            {/* Search */}
            <View style={styles.searchRow}>
                <Ionicons name="search-outline" size={16} color={Colors.textTertiary} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search..."
                    placeholderTextColor={Colors.textTertiary}
                    value={search}
                    onChangeText={setSearch}
                />
            </View>

            {/* Type Filter chips */}
            <View style={styles.filterRow}>
                {(["all", "expense", "income", "transfer"] as FilterType[]).map((t) => (
                    <TouchableOpacity
                        key={t}
                        onPress={() => setTypeFilter(t)}
                        style={[styles.chip, typeFilter === t && styles.chipActive]}
                    >
                        <Text style={[styles.chipText, typeFilter === t && styles.chipTextActive]}>
                            {t === "all" ? "All" : t === "expense" ? "↑ Out" : t === "income" ? "↓ In" : "⇄ Transfer"}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Payment mode filter */}
            <View style={[styles.filterRow, { marginTop: -Spacing.sm }]}>
                {(["all", "cash", "upi", "card", "bank", "wallet"] as FilterPayment[]).map((p) => (
                    <TouchableOpacity
                        key={p}
                        onPress={() => setPaymentFilter(p)}
                        style={[styles.chip, paymentFilter === p && styles.chipActive]}
                    >
                        <Text style={[styles.chipText, paymentFilter === p && styles.chipTextActive]}>
                            {p === "all" ? "All modes" : p.toUpperCase()}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Transaction list */}
            {loading ? (
                <ActivityIndicator size="large" color="#000" style={{ marginTop: 40 }} />
            ) : (
                <SectionList
                    sections={sections}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={{ paddingBottom: 100 }}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#000" />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <Ionicons name="file-tray-outline" size={36} color={Colors.textTertiary} style={{ marginBottom: 8 }} />
                            <Text style={styles.emptyTitle}>No transactions found</Text>
                            <Text style={styles.emptySubtext}>Try changing your filters</Text>
                        </View>
                    }
                    ListFooterComponent={
                        transactions.length > 0 ? (
                            <View style={styles.exportRow}>
                                <TouchableOpacity
                                    style={styles.exportBtn}
                                    onPress={() => handleExport("pdf")}
                                    disabled={exporting}
                                >
                                    {exporting
                                        ? <ActivityIndicator size="small" color="#fff" />
                                        : <Text style={styles.exportBtnText}>📄  Export PDF</Text>
                                    }
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.exportBtn, styles.exportBtnOutlined]}
                                    onPress={() => handleExport("csv")}
                                    disabled={exporting}
                                >
                                    <Text style={styles.exportBtnOutlinedText}>📊  Export CSV</Text>
                                </TouchableOpacity>
                            </View>
                        ) : null
                    }
                    renderSectionHeader={({ section }) => (
                        <View style={styles.dateHeader}>
                            <Text style={styles.dateHeaderText}>{section.title}</Text>
                        </View>
                    )}
                    renderItem={({ item: tx }) => (
                        <View style={styles.txRow}>
                            <View style={styles.txIcon}>
                                <CategoryIcon
                                    icon={tx.category?.icon}
                                    size={20}
                                    color={Colors.textPrimary}
                                />
                            </View>
                            <View style={styles.txInfo}>
                                <Text style={styles.txName}>{tx.category?.name ?? "Unknown"}</Text>
                                <Text style={styles.txMeta}>
                                    {tx.paymentMode?.toUpperCase()}{tx.note ? ` · ${tx.note}` : ""}
                                    {tx.isRecurring ? <Ionicons name="repeat-outline" size={11} color={Colors.textTertiary} /> : null}
                                </Text>
                            </View>
                            <Text style={[styles.txAmount, tx.type !== "income" && styles.txAmountOut]}>
                                {tx.type === "income" ? "+" : "-"}₹{formatINR(tx.amount)}
                            </Text>
                        </View>
                    )}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },

    // Summary band
    summaryBand: { flexDirection: "row", backgroundColor: "#000", paddingVertical: Spacing.lg, paddingHorizontal: Spacing.base },
    sumItem: { flex: 1, alignItems: "center" },
    sumLabel: { fontSize: 9, fontWeight: "600", color: "rgba(255,255,255,0.45)", letterSpacing: 1.5, marginBottom: 4 },
    sumIn: { fontSize: 16, fontWeight: "800", color: "#FFFFFF" },
    sumOut: { fontSize: 16, fontWeight: "500", color: "rgba(255,255,255,0.7)" },
    sumNet: { fontSize: 16, fontWeight: "700", color: "#FFFFFF" },
    sumDivider: { width: 1, backgroundColor: "rgba(255,255,255,0.12)", marginVertical: 4 },

    // Search
    searchRow: { flexDirection: "row", alignItems: "center", gap: Spacing.sm, margin: Spacing.base, marginBottom: Spacing.sm, padding: 12, backgroundColor: Colors.surface, borderRadius: Radius.sm, borderWidth: 1, borderColor: Colors.border },
    searchInput: { flex: 1, fontSize: 14, color: Colors.textPrimary },

    // Filters
    filterRow: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.sm, paddingHorizontal: Spacing.base, marginBottom: Spacing.sm },
    chip: { paddingVertical: 7, paddingHorizontal: 14, borderRadius: Radius.full, borderWidth: 1.5, borderColor: Colors.border, backgroundColor: Colors.surface },
    chipActive: { backgroundColor: "#000", borderColor: "#000" },
    chipText: { fontSize: 12, fontWeight: "600", color: Colors.textSecondary },
    chipTextActive: { color: "#FFF" },

    // Section header
    dateHeader: { paddingHorizontal: Spacing.base, paddingVertical: 8, backgroundColor: Colors.background, borderBottomWidth: 1, borderBottomColor: Colors.divider },
    dateHeaderText: { fontSize: 11, fontWeight: "600", color: Colors.textTertiary, letterSpacing: 1.2 },

    // Transaction row
    txRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: Spacing.base, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.divider },
    txIcon: { width: 40, height: 40, borderRadius: Radius.xs, backgroundColor: Colors.surface, alignItems: "center", justifyContent: "center", marginRight: Spacing.md, borderWidth: 1, borderColor: Colors.border },
    txEmoji: { fontSize: 20 },
    txInfo: { flex: 1 },
    txName: { fontSize: 14, fontWeight: "600", color: Colors.textPrimary, marginBottom: 2 },
    txMeta: { fontSize: 11, color: Colors.textTertiary },
    txAmount: { fontSize: 15, fontWeight: "800", color: Colors.amountIn },
    txAmountOut: { fontWeight: "500", color: Colors.amountOut },

    // Empty
    emptyState: { alignItems: "center", paddingTop: 60 },
    emptyEmoji: { fontSize: 40, marginBottom: Spacing.sm },
    emptyTitle: { fontSize: 17, fontWeight: "700", color: Colors.textPrimary, marginBottom: 6 },
    emptySubtext: { fontSize: 14, color: Colors.textTertiary },

    // Export buttons
    exportRow: { flexDirection: "row", gap: Spacing.sm, padding: Spacing.base, paddingBottom: 120 },
    exportBtn: { flex: 1, backgroundColor: "#000", borderRadius: Radius.sm, paddingVertical: 14, alignItems: "center" },
    exportBtnText: { fontSize: 14, fontWeight: "700", color: "#FFF" },
    exportBtnOutlined: { backgroundColor: "#FFF", borderWidth: 1.5, borderColor: "#000" },
    exportBtnOutlinedText: { fontSize: 14, fontWeight: "700", color: "#000" },

    // Insights panel
    insightsToggle: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: Spacing.base, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.divider },
    insightsToggleText: { fontSize: 13, fontWeight: "700", color: Colors.textPrimary },
    insightsPanel: { padding: Spacing.base, borderBottomWidth: 1, borderBottomColor: Colors.divider, backgroundColor: Colors.surface },
    insightsSectionLabel: { fontSize: 9, fontWeight: "600", color: Colors.textTertiary, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: Spacing.sm },
    insightsDivider: { height: 1, backgroundColor: Colors.divider, marginVertical: Spacing.lg },
});
