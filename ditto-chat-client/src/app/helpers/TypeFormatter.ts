export default class TypeFormatter {
    public static stringToInt(value: string): number | null {
        const candidateValue = parseInt(value);
        
        if (candidateValue !== null && candidateValue !== undefined) {
            return candidateValue;
        } else {
            return null;
        }
    }

    public static booleanToString(value: boolean): string {
        if (value === true) {
            return "true";
        }

        return "false";
    }

    public static stringToBoolean(value: string): boolean {
        if (value === "true") {
            return true;
        }

        return false;
    }
}
