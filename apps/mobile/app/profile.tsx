import {
    View, Text, StyleSheet, TouchableOpacity,
    ScrollView, Switch, Alert, ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState, useEffect } from "react";
import * as LocalAuthentication from "expo-local-authentication";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Colors, Spacing, Radius } from "@/constants/theme";
import { useTransactions } from "@/hooks/useTransactions";
import { useSummary } from "@/hooks/useTransactions";
import { exportAsPDF, exportAsCSV } from "@/lib/export";
import { clearCache } from "@/lib/cache";

type IoniconsName = React.ComponentProps<typeof Ionicons>["name"];

function SectionHeader({ title }: { title: string }) {
    return <Text style={styles.sectionHeader}>{title}</Text>;
}

function SettingRow({
    icon, label, subtitle, onPress, rightElement, danger,
}: {
    icon: IoniconsName; label: string; subtitle?: string;
    onPress?: () => void; rightElement?: React.ReactNode; danger?: boolean;
}) {
    return (
        <TouchableOpacity onPress={onPress} style={styles.row} activeOpacity={onPress ? 0.6 : 1}>
            <View style={styles.rowLeft}>
                <View style={styles.rowIconBox}>
                    <Ionicons name={icon} size={18} color={danger ? "#CC0000" : Colors.textPrimary} />
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={[styles.rowLabel, danger && styles.rowLabelDanger]}>{label}</Text>
                    {subtitle && <Text style={styles.rowSubtitle}>{subtitle}</Text>}
                </View>
            </View>
            {rightElement ?? (onPress && (
                <Ionicons name="chevron-forward" size={16} color={Colors.textTertiary} />
            ))}
        </TouchableOpacity>
    );
}

export default function ProfileScreen() {
    const router = useRouter();
    const [biometricEnabled, setBiometricEnabled] = useState(false);
    const [biometricAvailable, setBiometricAvailable] = useState(false);
    const [exporting, setExporting] = useState(false);

    const { data: transactions } = useTransactions({ limit: 1000 });
    const { data: summary } = useSummary();

    useEffect(() => {
        (async () => {
            const hasHardware = await LocalAuthentication.hasHardwareAsync();
            const enrolled = await LocalAuthentication.isEnrolledAsync();
            setBiometricAvailable(hasHardware && enrolled);
            const stored = await AsyncStorage.getItem("@biometric_enabled");
            setBiometricEnabled(stored === "true");
        })();
    }, []);

    const toggleBiometric = async (value: boolean) => {
        if (value) {
            const result = await LocalAuthentication.authenticateAsync({
                promptMessage: "Verify your identity to enable biometric login",
                fallbackLabel: "Use PIN",
            });
            if (!result.success) return;
        }
        setBiometricEnabled(value);
        await AsyncStorage.setItem("@biometric_enabled", value.toString());
    };

    const handleExportPDF = async () => {
        if (!transactions?.length) { Alert.alert("No data", "Add some transactions first"); return; }
        setExporting(true);
        try {
            await exportAsPDF(transactions, {
                totalIncome: summary?.totalIncome ?? 0,
                totalExpense: summary?.totalExpense ?? 0,
                balance: summary?.balance ?? 0,
            });
        } catch (e: any) {
            Alert.alert("Export failed", e.message);
        } finally { setExporting(false); }
    };

    const handleExportCSV = async () => {
        if (!transactions?.length) { Alert.alert("No data", "Add some transactions first"); return; }
        setExporting(true);
        try { await exportAsCSV(transactions); }
        catch (e: any) { Alert.alert("Export failed", e.message); }
        finally { setExporting(false); }
    };

    const handleSignOut = async () => {
        Alert.alert("Sign out", "Are you sure?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Sign out", style: "destructive",
                onPress: async () => {
                    await AsyncStorage.removeItem("@auth_token");
                    await clearCache();
                    router.replace("/(tabs)" as never);
                },
            },
        ]);
    };

    return (
        <SafeAreaView style={styles.container} edges={["top"]}>
            <View style={styles.header}>
                <Text style={styles.title}>Settings</Text>
                <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
                    <Ionicons name="close" size={24} color={Colors.textPrimary} />
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
                {/* Account */}
                <SectionHeader title="ACCOUNT" />
                <View style={styles.card}>
                    <SettingRow icon="person-outline" label="Edit Profile" subtitle="Name, email, mobile" onPress={() => { }} />
                    <SettingRow icon="key-outline" label="Change Password" onPress={() => { }} />
                </View>

                {/* Security */}
                <SectionHeader title="SECURITY" />
                <View style={styles.card}>
                    <SettingRow
                        icon="finger-print-outline"
                        label="Biometric Login"
                        subtitle={biometricAvailable ? "Face ID / Fingerprint" : "Not available on this device"}
                        rightElement={
                            <Switch
                                value={biometricEnabled}
                                onValueChange={toggleBiometric}
                                disabled={!biometricAvailable}
                                trackColor={{ false: Colors.border, true: "#000" }}
                                thumbColor="#fff"
                            />
                        }
                    />
                </View>

                {/* Data Export */}
                <SectionHeader title="DATA" />
                <View style={styles.card}>
                    <SettingRow
                        icon="document-text-outline"
                        label="Export as PDF"
                        subtitle={`${transactions?.length ?? 0} transactions`}
                        onPress={handleExportPDF}
                        rightElement={exporting
                            ? <ActivityIndicator size="small" color="#000" />
                            : <Ionicons name="chevron-forward" size={16} color={Colors.textTertiary} />
                        }
                    />
                    <SettingRow
                        icon="stats-chart-outline"
                        label="Export as CSV"
                        subtitle="For Excel, Google Sheets"
                        onPress={handleExportCSV}
                    />
                    <SettingRow
                        icon="trash-outline"
                        label="Clear Cache"
                        subtitle="Free up local storage"
                        onPress={async () => {
                            await clearCache();
                            Alert.alert("Done", "Cache cleared");
                        }}
                    />
                </View>

                {/* App */}
                <SectionHeader title="APP" />
                <View style={styles.card}>
                    <SettingRow icon="shield-checkmark-outline" label="Privacy Policy" onPress={() => { }} />
                    <SettingRow icon="information-circle-outline" label="Version" subtitle="1.0.0" />
                </View>

                {/* Sign out */}
                <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
                    <Ionicons name="log-out-outline" size={18} color="#CC0000" />
                    <Text style={styles.signOutText}>Sign Out</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: Spacing.base, borderBottomWidth: 1, borderBottomColor: Colors.divider },
    title: { fontSize: 20, fontWeight: "900", color: Colors.textPrimary, letterSpacing: -0.4 },
    scroll: { padding: Spacing.base, paddingBottom: 60 },
    sectionHeader: { fontSize: 10, fontWeight: "600", color: Colors.textTertiary, letterSpacing: 1.8, textTransform: "uppercase", marginTop: Spacing.lg, marginBottom: Spacing.sm, paddingHorizontal: 4 },
    card: { backgroundColor: Colors.surface, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border, overflow: "hidden", marginBottom: Spacing.sm },
    row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: Spacing.base, borderBottomWidth: 1, borderBottomColor: Colors.divider },
    rowLeft: { flexDirection: "row", alignItems: "center", gap: Spacing.md, flex: 1 },
    rowIconBox: { width: 32, height: 32, borderRadius: 8, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, alignItems: "center", justifyContent: "center" },
    rowLabel: { fontSize: 15, fontWeight: "500", color: Colors.textPrimary },
    rowLabelDanger: { color: "#CC0000" },
    rowSubtitle: { fontSize: 12, color: Colors.textTertiary, marginTop: 2 },
    signOutBtn: { marginTop: Spacing.xl, padding: Spacing.base, backgroundColor: Colors.surface, borderRadius: Radius.md, borderWidth: 1.5, borderColor: "#CC0000", alignItems: "center", flexDirection: "row", justifyContent: "center", gap: Spacing.sm },
    signOutText: { fontSize: 15, fontWeight: "700", color: "#CC0000" },
});
