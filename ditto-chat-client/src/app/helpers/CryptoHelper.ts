export default class CryptoHelper {
    public static generateUuid(): string {
        return crypto.randomUUID();
    }
}
