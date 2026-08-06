export default class ViteHelper {
    public static isDevEnvironment(): boolean {
        return import.meta.env.DEV === true;
    }
}
