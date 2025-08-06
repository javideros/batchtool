// Legacy JSR-352 form data type - kept for backward compatibility
export type JSR352BatchJobFormData = {
    batchName: string;
    functionalAreaCode?: "" | "ED" | "IN" | "DC" | "SE" | "AR" | "AL" | "ST" | "RP";
    frequency?: "DLY" | "WLY" | "MLY" | "QLY" | "ALY" | "ONR";
    packageName?: string;
    batchProperties?: Array<{
      key: string;
      value: string;
      type: "String" | "Long" | "Date" | "Double";
    }>;
    batchListeners?: Array<{
      listenerName: string;
    }>;
    stepItems?: Array<{
      id: string;
      type: string;
      stepName: string;
      addProcessor?: boolean;
    }>;
}