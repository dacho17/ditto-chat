export default class ViteHelper {
    public static isDevEnvironment(): boolean {
        return import.meta.env.DEV === true;
    }

    public static isUsingDummyService(): boolean {
        return import.meta.env.VITE_USE_DUMMY_SERVICE === "true";
    }
    
    public static getDittoChatServerDomain(): string {
        return import.meta.env.VITE_DITTO_CHAT_SERVER_DOMAIN;
    }

    public static getDittoChatServerPort(): string {
        return import.meta.env.VITE_DITTO_CHAT_SERVER_HTTP_PORT;
    }
}
