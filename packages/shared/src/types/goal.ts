export type GoalType = "retirement" | "education" | "home" | "travel" | "emergency" | "other";
export type RiskProfile = "conservative" | "moderate" | "aggressive";

export interface FinancialGoal {
    id: string;
    userId: string;
    name: string;
    type: GoalType;
    targetAmount: number;
    currentAmount: number;
    targetDate: string;
    currency: string;
    createdAt: string;
    updatedAt: string;
}

export interface SipEntry {
    id: string;
    userId: string;
    fundName: string;
    amount: number;
    frequency: "monthly" | "quarterly" | "annually";
    nextDueAt: string;
    startedAt: string;
    isActive: boolean;
}

export interface InsurancePolicy {
    id: string;
    userId: string;
    policyName: string;
    insurer: string;
    type: "life" | "health" | "vehicle" | "other";
    premiumAmount: number;
    premiumFrequency: "monthly" | "quarterly" | "annually";
    nextDueAt: string;
    maturityAt?: string;
    coverAmount: number;
    isActive: boolean;
}

export interface RiskProfileResult {
    userId: string;
    score: number;
    profile: RiskProfile;
    recommendation: string;
    completedAt: string;
}
