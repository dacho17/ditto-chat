import { AxiosResponse } from "axios";
import AxiosClient from "./AxiosClient";
import CONSTANTS from "../../Constants";

export default class ChatClient extends AxiosClient {
    private static chatClientSingletonReference: ChatClient | null = null;
    private static CHAT_SERVER_DOMAIN: string = "localhost";
    private static CHAT_SERVER_PORT: number = 8080;
    
    private constructor () {
        super(`${ChatClient.CHAT_SERVER_DOMAIN}:${ChatClient.CHAT_SERVER_PORT}`);
    }

    private static getChatClient(): ChatClient {
        if (ChatClient.chatClientSingletonReference !== null) {
            return ChatClient.chatClientSingletonReference;
        }

        ChatClient.chatClientSingletonReference = new ChatClient();
        return ChatClient.chatClientSingletonReference;
    }

    /* Fill out Endpoints as they are Required by Components/Slices
    public static async getRegisterPage(): Promise<AxiosResponse<>> {   // TODO: define Type of Response!
        return await ChatClient.getChatClient().sendGetRequest(CONSTANTS.REGISTER_URL);
    }
    public static async register(body: {}): Promise<AxiosResponse<>> {  // TODO: define Type of body and Response!
        return await ChatClient.getChatClient().sendPostRequest(CONSTANTS.REGISTER_URL, body);
    }
    public static async getLoginPage(): Promise<AxiosResponse<>> {   // TODO: define Type of Response!
        return await ChatClient.getChatClient().sendGetRequest(CONSTANTS.LOGIN_URL);
    }
    public static async login(body: {}): Promise<AxiosResponse<>> {  // TODO: define Type of body and Response!
        return await ChatClient.getChatClient().sendPostRequest(CONSTANTS.LOGIN_URL, body);
    }
    public static async logout(body: {}): Promise<AxiosResponse<>> {  // TODO: define Type of body and Response!
        return await ChatClient.getChatClient().sendPostRequest(CONSTANTS.LOGOUT_URL, body);
    }

    public static async getLatestChatMessages(): Promise<AxiosResponse<>> {   // TODO: define Type of Response!
        return await ChatClient.getChatClient().sendGetRequest(CONSTANTS.GET_LATEST_CHAT_MESSAGES_URL);
    }
    public static async getOlderChatMessages(): Promise<AxiosResponse<>> {   // TODO: define Type of Response!
        return await ChatClient.getChatClient().sendGetRequest(CONSTANTS.GET_OLDER_CHAT_MESSAGES_URL);
    }
    public static async updateLastSeenChatMessage(body: {}): Promise<AxiosResponse<>> {  // TODO: define Type of body and Response!
        return await ChatClient.getChatClient().sendPostRequest(CONSTANTS.UPDATE_LAST_SEEN_CHAT_MESSAGE_URL, body);
    }
    public static async sendChatMessage(body: {}): Promise<AxiosResponse<>> {  // TODO: define Type of body and Response!
        return await ChatClient.getChatClient().sendPostRequest(CONSTANTS.SEND_CHAT_MESSAGE_URL, body);
    }
    */
}
