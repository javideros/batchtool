export type JSR352BatchJobFormData = {
    batchName: string;
    functionalAreaCd?: "" | "ED" | "IN" | "DC" | "SE" | "AR " | "AL" | "ST" | "RP ";
    frequency?: "DLY" | "WLY" | "MLY" | "QLY" | "ALY" | "ONR";
    packageName?: string
    batchProperties?: string[];
    stepItems?: unknown[];
}