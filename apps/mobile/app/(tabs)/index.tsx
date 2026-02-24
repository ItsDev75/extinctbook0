import {
    ScrollView, View, Text, StyleSheet, TouchableOpacity,
    TextInput, Linking, ActivityIndicator, RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useState, useCallback } from "react";
import { useRouter, useFocusEffect } from "expo-router";
import { Colors, Spacing, Radius, Shadow } from "@/constants/theme";
import { CategoryIcon } from "@/components/CategoryIcon";
import { useSummary } from "@/hooks/useTransactions";
import { useTransactions, deleteTransactionById } from "@/hooks/useTransactions";
import type { TransactionWithCategory } from "@extinctbook/shared";

function formatINR(n: number) {
    return Math.abs(n).toLocaleString("en-IN");
}

function sendToWhatsApp(tx: TransactionWithCategory) {
    const sign = tx.amount >= 0 ? "+" : "-";
    const msg = `${sign}₹${formatINR(tx.amount)} — ${tx.category?.name ?? ""}\nvia Extinctbook`;
    Linking.openURL(`https://wa.me/?text=${encodeURIComponent(msg)}`);
}

// ─── Skeleton loader ───────────────────────────────────────────────────────
function SkeletonRow() {
    return (
        <View style={styles.skel}>
            <View style={styles.skelIcon} />
            <View style={{ flex: 1, gap: 6 }}>
                <View style={[styles.skelLine, { width: "60%" }]} />
                <View style={[styles.skelLine, { width: "35%", opacity: 0.5 }]} />
            </View>
            <View style={[styles.skelLine, { width: 60 }]} />
        </View>
    );
}

export default function HomeScreen() {
    const [search, setSearch] = useState("");
    const [refreshing, setRefreshing] = useState(false);
    const router = useRouter();

    const { data: summary, loading: sumLoading, refetch: refetchSummary } = useSummary();
    const { data: transactions, loading: txLoading, refetch: refetchTx } = useTransactions({ limit: 5 });

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await Promise.all([refetchSummary(), refetchTx()]);
        setRefreshing(false);
    }, [refetchSummary, refetchTx]);

    // Refetch every time this screen comes into focus (e.g. after adding a transaction)
    useFocusEffect(
        useCallback(() => {
            refetchSummary();
            refetchTx();
        }, [refetchSummary, refetchTx])
    );

    const filtered = transactions.filter((tx) =>
        (tx.category?.name ?? "").toLowerCase().includes(search.toLowerCase()) ||
        (tx.note ?? "").toLowerCase().includes(search.toLowerCase())
    );

    return (
        <SafeAreaView style={styles.container} edges={["top"]}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scroll}
                keyboardShouldPersistTaps="handled"
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#000" />
                }
            >
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.appName}>Extinctbook</Text>
                    <TouchableOpacity
                        style={styles.gearBtn}
                        onPress={() => router.push("/profile" as never)}
                        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                    >
                        <Ionicons name="settings-outline" size={22} color={Colors.textSecondary} />
                    </TouchableOpacity>
                </View>

                {/* Balance Card */}
                <View style={[styles.balanceCard, Shadow.md]}>
                    <Text style={styles.balanceLabel}>TOTAL BALANCE</Text>
                    {sumLoading ? (
                        <View style={[styles.skelLine, { width: "60%", height: 52, marginVertical: 8, backgroundColor: "rgba(255,255,255,0.15)" }]} />
                    ) : (
                        <Text style={styles.balanceAmount}>
                            ₹{formatINR(summary?.balance ?? 0)}
                        </Text>
                    )}
                    <View style={styles.dividerLine} />
                    <View style={styles.todayRow}>
                        <View style={styles.todayItem}>
                            <Text style={styles.todayArrow}>↓ IN</Text>
                            <Text style={styles.todayAmount}>
                                ₹{formatINR(summary?.today.income ?? 0)}
                            </Text>
                        </View>
                        <View style={styles.todayItem}>
                            <Text style={styles.todayArrow}>↑ OUT</Text>
                            <Text style={styles.todayAmount}>
                                ₹{formatINR(summary?.today.expense ?? 0)}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Quick Actions */}
                <View style={styles.quickActions}>
                    <TouchableOpacity
                        style={[styles.quickBtnFilled, Shadow.sm]}
                        onPress={() => router.push({ pathname: "/(tabs)/add", params: { type: "expense" } } as never)}
                    >
                        <Text style={styles.quickBtnFilledText}>↑  Money Out</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.quickBtnOutlined, Shadow.sm]}
                        onPress={() => router.push({ pathname: "/(tabs)/add", params: { type: "income" } } as never)}
                    >
                        <Text style={styles.quickBtnOutlinedText}>↓  Money In</Text>
                    </TouchableOpacity>
                </View>

                {/* Search */}
                <View style={styles.searchBar}>
                    <Ionicons name="search-outline" size={18} color={Colors.textTertiary} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search by category or note..."
                        placeholderTextColor={Colors.textTertiary}
                        value={search}
                        onChangeText={setSearch}
                    />
                </View>

                {/* Recent Transactions */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionLabel}>RECENT</Text>
                    <TouchableOpacity onPress={() => router.push("/(tabs)/history" as never)}>
                        <Text style={styles.sectionLink}>See all →</Text>
                    </TouchableOpacity>
                </View>

                {txLoading ? (
                    [1, 2, 3].map((k) => <SkeletonRow key={k} />)
                ) : filtered.length === 0 ? (
                    <View style={styles.emptyCard}>
                        <Ionicons name="card-outline" size={40} color={Colors.textTertiary} style={{ marginBottom: 8 }} />
                        <Text style={styles.emptyTitle}>No transactions yet</Text>
                        <Text style={styles.emptySubtext}>
                            Tap <Text style={{ fontWeight: "900" }}>+</Text> below to add your first entry
                        </Text>
                    </View>
                ) : (
                    filtered.slice(0, 5).map((tx) => (
                        <TouchableOpacity
                            key={tx.id}
                            style={styles.txRow}
                            onLongPress={() => sendToWhatsApp(tx)}
                        >
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
                                    {tx.note ?? ""}{tx.note ? " · " : ""}{new Date(tx.date).toLocaleDateString("en-IN")}
                                </Text>
                            </View>
                            <View style={styles.txRight}>
                                <Text style={[styles.txAmount, tx.type !== "income" && styles.txAmountOut]}>
                                    {tx.type === "income" ? "+" : "-"}₹{formatINR(tx.amount)}
                                </Text>
                                <TouchableOpacity onPress={() => sendToWhatsApp(tx)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                                    <Ionicons name="logo-whatsapp" size={16} color={Colors.whatsapp} />
                                </TouchableOpacity>
                            </View>
                        </TouchableOpacity>
                    ))
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    scroll: { paddingBottom: 100 },
    header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: Spacing.base, paddingTop: Spacing.lg, paddingBottom: Spacing.lg },
    appName: { fontSize: 28, fontWeight: "900", color: Colors.textPrimary, letterSpacing: -0.8 },
    gearBtn: { width: 40, height: 40, backgroundColor: Colors.surface, borderRadius: Radius.xs, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: Colors.border },
    balanceCard: { backgroundColor: "#000000", marginHorizontal: Spacing.base, borderRadius: Radius.md, padding: Spacing.lg, marginBottom: Spacing.base },
    balanceLabel: { fontSize: 10, fontWeight: "600", color: "rgba(255,255,255,0.45)", letterSpacing: 2 },
    balanceAmount: { color: "#FFFFFF", fontSize: 52, fontWeight: "900", marginTop: 4, letterSpacing: -2 },
    dividerLine: { height: 1, backgroundColor: "rgba(255,255,255,0.12)", marginVertical: Spacing.md },
    todayRow: { flexDirection: "row", gap: Spacing.xl },
    todayItem: { gap: 3 },
    todayArrow: { fontSize: 10, fontWeight: "600", color: "rgba(255,255,255,0.45)", letterSpacing: 1.5 },
    todayAmount: { fontSize: 20, fontWeight: "700", color: "#FFFFFF" },
    quickActions: { flexDirection: "row", gap: Spacing.sm, paddingHorizontal: Spacing.base, marginBottom: Spacing.base },
    quickBtnFilled: { flex: 1, backgroundColor: "#000000", borderRadius: Radius.sm, paddingVertical: 16, alignItems: "center" },
    quickBtnFilledText: { fontSize: 15, fontWeight: "700", color: "#FFFFFF", letterSpacing: 0.3 },
    quickBtnOutlined: { flex: 1, backgroundColor: "#FFFFFF", borderRadius: Radius.sm, paddingVertical: 16, alignItems: "center", borderWidth: 1.5, borderColor: "#000000" },
    quickBtnOutlinedText: { fontSize: 15, fontWeight: "700", color: "#000000", letterSpacing: 0.3 },
    searchBar: { flexDirection: "row", alignItems: "center", gap: Spacing.sm, backgroundColor: Colors.surface, borderRadius: Radius.sm, paddingHorizontal: Spacing.base, paddingVertical: 14, borderWidth: 1, borderColor: Colors.border, marginHorizontal: Spacing.base, marginBottom: Spacing.lg },
    searchInput: { flex: 1, fontSize: 15, color: Colors.textPrimary },
    sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: Spacing.base, marginBottom: Spacing.sm },
    sectionLabel: { fontSize: 11, fontWeight: "600", color: Colors.textTertiary, letterSpacing: 1.5 },
    sectionLink: { fontSize: 13, fontWeight: "500", color: Colors.textSecondary },
    emptyCard: { marginHorizontal: Spacing.base, backgroundColor: Colors.surface, borderRadius: Radius.md, padding: Spacing.xl, alignItems: "center", borderWidth: 1, borderColor: Colors.border },
    emptyEmoji: { fontSize: 36, marginBottom: Spacing.sm },
    emptyTitle: { fontSize: 17, fontWeight: "700", color: Colors.textPrimary, marginBottom: 6 },
    emptySubtext: { fontSize: 14, color: Colors.textSecondary, textAlign: "center", lineHeight: 20 },
    txRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: Spacing.base, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: Colors.divider },
    txIcon: { width: 44, height: 44, borderRadius: Radius.xs, backgroundColor: Colors.surface, alignItems: "center", justifyContent: "center", marginRight: Spacing.md, borderWidth: 1, borderColor: Colors.border },
    txEmoji: { fontSize: 22 },
    txInfo: { flex: 1 },
    txName: { fontSize: 15, fontWeight: "600", color: Colors.textPrimary, marginBottom: 2 },
    txMeta: { fontSize: 12, color: Colors.textTertiary },
    txRight: { alignItems: "flex-end", gap: 4 },
    txAmount: { fontSize: 16, fontWeight: "800", color: Colors.amountIn },
    txAmountOut: { fontWeight: "500", color: Colors.amountOut },
    // Skeleton
    skel: { flexDirection: "row", alignItems: "center", paddingHorizontal: Spacing.base, paddingVertical: 14, gap: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.divider },
    skelIcon: { width: 44, height: 44, borderRadius: Radius.xs, backgroundColor: Colors.surface },
    skelLine: { height: 14, borderRadius: 4, backgroundColor: Colors.surface },
});
