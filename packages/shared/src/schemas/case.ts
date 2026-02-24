import { z } from "zod";

export const createMatterSchema = z.object({
    clientId: z.string().uuid(),
    caseNumber: z.string().min(1, "Case number is required"),
    title: z.string().min(1, "Title is required"),
    petitioner: z.string().min(1),
    respondent: z.string().min(1),
    court: z.enum(["supreme_court", "high_court", "district_court", "tribunal", "other"]),
    courtName: z.string().min(1),
    filedAt: z.string().datetime(),
    notes: z.string().optional(),
});

export const createHearingSchema = z.object({
    matterId: z.string().uuid(),
    scheduledAt: z.string().datetime(),
    courtroom: z.string().optional(),
    judge: z.string().optional(),
    notes: z.string().optional(),
});

export type CreateMatterInput = z.infer<typeof createMatterSchema>;
export type CreateHearingInput = z.infer<typeof createHearingSchema>;
