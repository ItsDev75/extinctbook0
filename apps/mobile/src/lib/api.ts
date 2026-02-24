import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// ── Backend URL — set EXPO_PUBLIC_API_URL in .env.local ────────────────────
// For Android emulator use: http://10.0.2.2:3001
// For physical device use: http://<your-machine-LAN-IP>:3001
const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://10.21.2.50:3001";

export const api = axios.create({
    baseURL: `${BASE_URL}/api`,
    timeout: 15000,
    headers: { "Content-Type": "application/json" },
});

// ── Dev token bootstrap (auto-fetched in __DEV__ if no token stored) ───────
let _devTokenFetching = false;
async function ensureToken(): Promise<string | null> {
    const stored = await AsyncStorage.getItem("@auth_token");
    if (stored) return stored;

    // In dev mode: auto-get a dev token from the backend
    if (__DEV__ && !_devTokenFetching) {
        _devTokenFetching = true;
        try {
            const res = await axios.get(`${BASE_URL}/api/auth/dev-token`);
            if (res.data?.token) {
                await AsyncStorage.setItem("@auth_token", res.data.token);
                return res.data.token;
            }
        } catch (e) {
            console.warn("[api] dev-token fetch failed:", e);
        } finally {
            _devTokenFetching = false;
        }
    }
    return null;
}

// ── Attach JWT token to every request ──────────────────────────────────────
api.interceptors.request.use(async (config) => {
    try {
        const token = await ensureToken();
        if (token) config.headers.Authorization = `Bearer ${token}`;
    } catch {
        // silently proceed without token
    }
    return config;
});

// ── Handle 401 globally — clear token (don't redirect, auth not built yet) ─
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            // Clear bad token — next request will auto-fetch a new dev token
            await AsyncStorage.removeItem("@auth_token");
            console.warn("[api] 401 — token cleared, will refetch on next request");
        }
        return Promise.reject(error);
    }
);

// ── Typed convenience methods ───────────────────────────────────────────────
export const apiGet = <T>(url: string, params?: object) =>
    api.get<{ success: boolean; data: T }>(url, { params }).then((r) => r.data.data);

export const apiPost = <T>(url: string, body: object) =>
    api.post<{ success: boolean; data: T }>(url, body).then((r) => r.data.data);

export const apiPatch = <T>(url: string, body: object) =>
    api.patch<{ success: boolean; data: T }>(url, body).then((r) => r.data.data);

export const apiDelete = (url: string) =>
    api.delete<{ success: boolean }>(url).then((r) => r.data);
