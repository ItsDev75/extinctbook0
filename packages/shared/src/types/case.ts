export type CaseStatus = "active" | "disposed" | "stayed" | "adjourned" | "pending";
export type CourtType = "supreme_court" | "high_court" | "district_court" | "tribunal" | "other";

export interface LegalClient {
    id: string;
    userId: string;
    name: string;
    mobile: string;
    email?: string;
    address?: string;
    createdAt: string;
}

export interface LegalMatter {
    id: string;
    userId: string;
    clientId: string;
    caseNumber: string;
    title: string;
    petitioner: string;
    respondent: string;
    court: CourtType;
    courtName: string;
    status: CaseStatus;
    filedAt: string;
    nextHearingAt?: string;
    notes?: string;
    createdAt: string;
    updatedAt: string;
}

export interface Hearing {
    id: string;
    matterId: string;
    scheduledAt: string;
    courtroom?: string;
    judge?: string;
    outcome?: string;
    notes?: string;
    isMine: boolean;
    createdAt: string;
}

export interface DisplayBoardEntry {
    itemNumber: number;
    caseNumber: string;
    petitioner: string;
    respondent: string;
    status: "current" | "next" | "completed" | "pending";
    courtroom: string;
}
