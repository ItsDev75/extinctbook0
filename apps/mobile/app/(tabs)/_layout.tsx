import { Tabs } from "expo-router";
import { Platform, View, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/constants/theme";

type IconName = React.ComponentProps<typeof Ionicons>["name"];

const tabs: { name: string; label: string; icon: IconName; iconActive: IconName }[] = [
    { name: "index", label: "Home", icon: "home-outline", iconActive: "home" },
    { name: "add", label: "Add", icon: "add-circle-outline", iconActive: "add-circle" },
    { name: "history", label: "History", icon: "time-outline", iconActive: "time" },
];

export default function TabLayout() {
    const insets = useSafeAreaInsets();

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: Colors.primary,
                tabBarInactiveTintColor: Colors.textTertiary,
                tabBarStyle: {
                    backgroundColor: Colors.surface,
                    borderTopColor: Colors.border,
                    borderTopWidth: 1,
                    height: 72 + (Platform.OS === "ios" ? insets.bottom : 0),
                    paddingBottom: Platform.OS === "ios" ? insets.bottom : 10,
                    paddingTop: 8,
                },
                tabBarLabelStyle: {
                    fontSize: 13,
                    fontWeight: "600",
                    marginTop: 2,
                },
            }}
        >
            {tabs.map(({ name, label, icon, iconActive }) => (
                <Tabs.Screen
                    key={name}
                    name={name}
                    options={{
                        title: label,
                        tabBarIcon: ({ color, focused }) =>
                            name === "add" ? (
                                <View style={styles.addBtn}>
                                    <Ionicons name="add" size={32} color="#fff" />
                                </View>
                            ) : (
                                <Ionicons name={focused ? iconActive : icon} size={26} color={color} />
                            ),
                        ...(name === "add" && { tabBarLabel: () => null }),
                    }}
                />
            ))}
        </Tabs>
    );
}

const styles = StyleSheet.create({
    addBtn: {
        width: 58,
        height: 58,
        borderRadius: 29,
        backgroundColor: Colors.primary,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 4,
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
        elevation: 8,
    },
});
