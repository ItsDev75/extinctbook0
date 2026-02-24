import {
    View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView,
    KeyboardAvoidingView, Platform, ActivityIndicator, Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { CategoryIcon } from "@/components/CategoryIcon";
import { useState, useCallback } from "react";
import { useRouter, useLocalSearchParams, useFocusEffect } from "expo-router";
import * as Haptics from "expo-haptics";
import { Colors, Spacing, Radius, Shadow } from "@/constants/theme";
import { useCategories } from "@/hooks/useCategories";
import { createTransaction } from "@/hooks/useTransactions";

type TxType = "expense" | "income" | "transfer";
type PaymentMode = "cash" | "upi" | "card" | "bank" | "wallet";

const PAYMENT_MODES: { id: PaymentMode; label: string; icon: string }[] = [
    { id: "cash", label: "Cash", icon: "💵" },
    { id: "upi", label: "UPI", icon: "📱" },
    { id: "card", label: "Card", icon: "💳" },
    { id: "bank", label: "Bank", icon: "🏦" },
    { id: "wallet", label: "Wallet", icon: "👛" },
];

const RECURRING_INTERVALS = [
    { id: "daily", label: "Daily" },
    { id: "weekly", label: "Weekly" },
    { id: "monthly", label: "Monthly" },
    { id: "yearly", label: "Yearly" },
] as const;

export default function AddScreen() {
    const router = useRouter();
    const params = useLocalSearchParams<{ type?: string }>();

    const [txType, setTxType] = useState<TxType>((params.type as TxType) ?? "expense");
    const [amount, setAmount] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [paymentMode, setPaymentMode] = useState<PaymentMode>("cash");
    const [note, setNote] = useState("");
    const [isRecurring, setIsRecurring] = useState(false);
    const [recurringInterval, setRecurringInterval] = useState<"daily" | "weekly" | "monthly" | "yearly">("monthly");
    const [saving, setSaving] = useState(false);
    const [showCustomInput, setShowCustomInput] = useState(false);
    const [customName, setCustomName] = useState("");
    const [creatingCat, setCreatingCat] = useState(false);

    const { data: categories, loading: catLoading, createCategory } = useCategories();
    const today = new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });

    // Reset form every time the Add tab comes into focus
    useFocusEffect(
        useCallback(() => {
            setAmount("");
            setSelectedCategory("");
            setPaymentMode("cash");
            setNote("");
            setIsRecurring(false);
            setRecurringInterval("monthly");
            setShowCustomInput(false);
            setCustomName("");
        }, [])
    );

    const canSave = !!amount && parseFloat(amount) > 0 && !!selectedCategory;

    const handleSave = async () => {
        if (!canSave) return;
        setSaving(true);
        try {
            await createTransaction({
                type: txType,
                amount: parseFloat(amount),
                categoryId: selectedCategory,
                paymentMode,
                note: note || undefined,
                date: new Date().toISOString(),
                isRecurring,
                recurringInterval: isRecurring ? recurringInterval : undefined,
            });
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            router.replace("/(tabs)" as never);
        } catch (err: any) {
            Alert.alert("Error", err.response?.data?.message ?? "Failed to save transaction");
        } finally {
            setSaving(false);
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={["top"]}>
            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
                <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

                    <Text style={styles.title}>Add Transaction</Text>

                    {/* Type toggle — segmented control */}
                    <View style={styles.typeRow}>
                        {(["expense", "income", "transfer"] as TxType[]).map((t, i) => (
                            <TouchableOpacity
                                key={t}
                                onPress={() => setTxType(t)}
                                style={[
                                    styles.typeBtn,
                                    txType === t ? styles.typeFilled : styles.typeOutlined,
                                    i === 0 && { borderRightWidth: 0 },
                                    i === 2 && { borderLeftWidth: 0 },
                                ]}
                            >
                                <Text style={[styles.typeBtnText, txType === t && styles.typeBtnTextActive]}>
                                    {t === "expense" ? "↑ Out" : t === "income" ? "↓ In" : "⇄ Transfer"}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Amount */}
                    <View style={styles.amountRow}>
                        <Text style={styles.currencySymbol}>₹</Text>
                        <TextInput
                            style={styles.amountInput}
                            value={amount}
                            onChangeText={setAmount}
                            placeholder="0"
                            placeholderTextColor={Colors.textTertiary}
                            keyboardType="numeric"
                            autoFocus
                        />
                    </View>

                    {/* Category */}
                    <Text style={styles.sectionLabel}>CATEGORY</Text>
                    {catLoading ? (
                        <ActivityIndicator size="small" color="#000" style={{ marginVertical: Spacing.md }} />
                    ) : (
                        <View style={styles.categoryGrid}>
                            {categories.map((cat) => {
                                const active = selectedCategory === cat.id;
                                return (
                                    <TouchableOpacity
                                        key={cat.id}
                                        onPress={() => setSelectedCategory(cat.id)}
                                        style={[styles.categoryTile, active && styles.categoryTileActive]}
                                    >
                                        <CategoryIcon
                                            icon={cat.icon}
                                            size={20}
                                            color={active ? "#FFF" : "#000"}
                                        />
                                        <Text style={[styles.catName, active && styles.catNameActive]} numberOfLines={1}>
                                            {cat.name}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}

                            {/* + Custom tile */}
                            {!showCustomInput ? (
                                <TouchableOpacity
                                    style={[styles.categoryTile, styles.categoryTileCustom]}
                                    onPress={() => setShowCustomInput(true)}
                                >
                                    <Ionicons name="add-circle-outline" size={20} color={Colors.textTertiary} />
                                    <Text style={styles.catNameCustom}>Custom</Text>
                                </TouchableOpacity>
                            ) : (
                                <View style={styles.customInputWrap}>
                                    <TextInput
                                        style={styles.customInput}
                                        placeholder="Category name"
                                        placeholderTextColor={Colors.textTertiary}
                                        value={customName}
                                        onChangeText={setCustomName}
                                        autoFocus
                                        returnKeyType="done"
                                        onSubmitEditing={async () => {
                                            if (!customName.trim()) return;
                                            setCreatingCat(true);
                                            try {
                                                const cat = await createCategory(customName.trim(), "📦", "#555555");
                                                setSelectedCategory(cat.id);
                                                setShowCustomInput(false);
                                                setCustomName("");
                                            } finally {
                                                setCreatingCat(false);
                                            }
                                        }}
                                    />
                                    {creatingCat
                                        ? <ActivityIndicator size="small" color="#000" />
                                        : <TouchableOpacity onPress={() => setShowCustomInput(false)}>
                                            <Text style={{ color: Colors.textTertiary, fontSize: 13 }}>Cancel</Text>
                                        </TouchableOpacity>
                                    }
                                </View>
                            )}
                        </View>
                    )}

                    {/* Payment Mode */}
                    <Text style={styles.sectionLabel}>PAYMENT MODE</Text>
                    <View style={styles.paymentRow}>
                        {PAYMENT_MODES.map((m) => (
                            <TouchableOpacity
                                key={m.id}
                                onPress={() => setPaymentMode(m.id)}
                                style={[styles.paymentChip, paymentMode === m.id && styles.paymentChipActive]}
                            >
                                <Text style={styles.paymentIcon}>{m.icon}</Text>
                                <Text style={[styles.paymentLabel, paymentMode === m.id && styles.paymentLabelActive]}>
                                    {m.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Date */}
                    <Text style={styles.sectionLabel}>DATE</Text>
                    <View style={styles.inputBox}>
                        <Text style={styles.dateText}>📅  {today}</Text>
                    </View>

                    {/* Note */}
                    <Text style={styles.sectionLabel}>NOTE</Text>
                    <TextInput
                        style={styles.noteInput}
                        placeholder="What was this for? (optional)"
                        placeholderTextColor={Colors.textTertiary}
                        value={note}
                        onChangeText={setNote}
                        multiline
                        numberOfLines={3}
                        textAlignVertical="top"
                    />

                    {/* Recurring */}
                    <TouchableOpacity
                        style={styles.recurringToggle}
                        onPress={() => setIsRecurring(!isRecurring)}
                    >
                        <View>
                            <Text style={styles.recurringTitle}>Recurring Transaction</Text>
                            <Text style={styles.recurringSubtitle}>EMI, salary, subscription</Text>
                        </View>
                        <View style={[styles.toggle, isRecurring && styles.toggleOn]}>
                            <View style={[styles.toggleThumb, isRecurring && styles.toggleThumbOn]} />
                        </View>
                    </TouchableOpacity>

                    {isRecurring && (
                        <View style={styles.intervalRow}>
                            {RECURRING_INTERVALS.map((r) => (
                                <TouchableOpacity
                                    key={r.id}
                                    onPress={() => setRecurringInterval(r.id)}
                                    style={[styles.intervalChip, recurringInterval === r.id && styles.intervalChipActive]}
                                >
                                    <Text style={[styles.intervalLabel, recurringInterval === r.id && styles.intervalLabelActive]}>
                                        {r.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}

                    {/* Save */}
                    <TouchableOpacity
                        onPress={handleSave}
                        disabled={!canSave || saving}
                        style={[styles.saveBtn, (!canSave || saving) && styles.saveBtnDisabled, Shadow.md]}
                    >
                        {saving ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.saveBtnText}>
                                {txType === "expense" ? "↑  Save Expense" : txType === "income" ? "↓  Save Income" : "⇄  Save Transfer"}
                            </Text>
                        )}
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    scroll: { padding: Spacing.base, paddingBottom: 100 },
    title: { fontSize: 26, fontWeight: "900", color: Colors.textPrimary, letterSpacing: -0.6, marginBottom: Spacing.lg },

    // Type toggle
    typeRow: { flexDirection: "row", marginBottom: Spacing.lg, borderWidth: 1.5, borderColor: "#000", borderRadius: Radius.sm, overflow: "hidden" },
    typeBtn: { flex: 1, paddingVertical: 16, alignItems: "center", borderWidth: 0 },
    typeFilled: { backgroundColor: "#000" },
    typeOutlined: { backgroundColor: "#FFF" },
    typeBtnText: { fontSize: 13, fontWeight: "700", color: "#000" },
    typeBtnTextActive: { color: "#FFF" },

    // Amount
    amountRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", marginBottom: Spacing.xl, paddingVertical: Spacing.lg, borderBottomWidth: 1, borderBottomColor: Colors.border },
    currencySymbol: { fontSize: 40, fontWeight: "900", color: Colors.textSecondary, marginRight: 4 },
    amountInput: { fontSize: 72, fontWeight: "900", color: Colors.textPrimary, minWidth: 80, textAlign: "center", letterSpacing: -2 },

    // Section
    sectionLabel: { fontSize: 10, fontWeight: "600", color: Colors.textTertiary, letterSpacing: 1.8, textTransform: "uppercase", marginBottom: Spacing.sm, marginTop: Spacing.lg },

    // Category
    categoryGrid: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.sm },
    categoryTile: { width: "48%", flexDirection: "row", alignItems: "center", gap: Spacing.md, paddingVertical: 16, paddingHorizontal: Spacing.md, backgroundColor: Colors.surface, borderRadius: Radius.sm, borderWidth: 1.5, borderColor: Colors.border },
    categoryTileActive: { backgroundColor: "#000", borderColor: "#000" },
    categoryTileCustom: { borderStyle: "dashed", borderColor: Colors.textTertiary },
    catName: { fontSize: 13, fontWeight: "600", color: Colors.textSecondary, flex: 1 },
    catNameActive: { color: "#FFF" },
    catNameCustom: { fontSize: 13, fontWeight: "600", color: Colors.textTertiary, flex: 1 },
    customInputWrap: { width: "100%", flexDirection: "row", alignItems: "center", gap: Spacing.md, paddingVertical: 12, paddingHorizontal: Spacing.md, backgroundColor: Colors.surface, borderRadius: Radius.sm, borderWidth: 1.5, borderColor: "#000" },
    customInput: { flex: 1, fontSize: 14, fontWeight: "600", color: Colors.textPrimary },

    // Payment mode chips
    paymentRow: { flexDirection: "row", gap: Spacing.sm, flexWrap: "wrap" },
    paymentChip: { flexDirection: "row", alignItems: "center", gap: 6, paddingVertical: 10, paddingHorizontal: 14, borderRadius: Radius.full, borderWidth: 1.5, borderColor: Colors.border, backgroundColor: Colors.surface },
    paymentChipActive: { backgroundColor: "#000", borderColor: "#000" },
    paymentIcon: { fontSize: 16 },
    paymentLabel: { fontSize: 13, fontWeight: "600", color: Colors.textSecondary },
    paymentLabelActive: { color: "#FFF" },

    // Input
    inputBox: { backgroundColor: Colors.surface, borderRadius: Radius.sm, padding: 16, borderWidth: 1, borderColor: Colors.border },
    dateText: { fontSize: 15, fontWeight: "500", color: Colors.textPrimary },
    noteInput: { backgroundColor: Colors.surface, borderRadius: Radius.sm, padding: 16, borderWidth: 1, borderColor: Colors.border, fontSize: 15, color: Colors.textPrimary, minHeight: 88 },

    // Recurring
    recurringToggle: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: Spacing.md, borderTopWidth: 1, borderTopColor: Colors.divider, marginTop: Spacing.lg },
    recurringTitle: { fontSize: 15, fontWeight: "600", color: Colors.textPrimary },
    recurringSubtitle: { fontSize: 12, color: Colors.textTertiary, marginTop: 2 },
    toggle: { width: 48, height: 28, borderRadius: 14, backgroundColor: Colors.border, justifyContent: "center", paddingHorizontal: 3 },
    toggleOn: { backgroundColor: "#000" },
    toggleThumb: { width: 22, height: 22, borderRadius: 11, backgroundColor: "#FFF" },
    toggleThumbOn: { alignSelf: "flex-end" },
    intervalRow: { flexDirection: "row", gap: Spacing.sm, marginBottom: Spacing.md },
    intervalChip: { flex: 1, paddingVertical: 10, alignItems: "center", borderRadius: Radius.sm, borderWidth: 1.5, borderColor: Colors.border, backgroundColor: Colors.surface },
    intervalChipActive: { backgroundColor: "#000", borderColor: "#000" },
    intervalLabel: { fontSize: 12, fontWeight: "600", color: Colors.textSecondary },
    intervalLabelActive: { color: "#FFF" },

    // Save
    saveBtn: { borderRadius: Radius.sm, paddingVertical: 20, alignItems: "center", marginTop: Spacing.lg, backgroundColor: "#000" },
    saveBtnDisabled: { opacity: 0.25 },
    saveBtnText: { fontSize: 17, fontWeight: "900", color: "#FFF", letterSpacing: 0.5 },
});
