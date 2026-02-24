export type UserRole = "user" | "lawyer" | "wealth_client" | "admin" | "field_agent" | "manager";

export interface User {
    id: string;
    name: string;
    email: string;
    mobile: string;
    role: UserRole;
    avatarUrl?: string;
    isVerified: boolean;
    isDarkMode: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface AuthSession {
    user: User;
    accessToken: string;
    refreshToken: string;
    expiresAt: string;
}

export interface OtpRecord {
    id: string;
    userId: string;
    code: string;
    expiresAt: string;
    isUsed: boolean;
}
