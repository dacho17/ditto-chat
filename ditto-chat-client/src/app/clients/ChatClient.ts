import AxiosClient from "./AxiosClient";
import ChatClientInterface, { ChatServerResponse } from "./ChatClientInterface";
import DummyChatClient from "./DummyChatClient";
import ViteHelper from "../helpers/ViteHelper";
import ChatterRegistrationForm from "../classes/ChatterRegistrationForm";
import LoginForm from "../classes/LoginForm";
import UploadFileIntent from "../classes/UploadFileIntent";
import ChatThreadMessageForm from "../classes/ChatThreadMessageForm";
import PagedListDto from "../interfaces/PagedListDto";
import LoginDto from "../interfaces/LoginDto";
import ChatterOverviewDto from "../interfaces/ChatterOverviewDto";
import S3PreSignedUrlDto from "../interfaces/S3PreSignedUrlDto";
import ChatThreadOverviewDto from "../interfaces/ChatThreadOverviewDto";
import ChatterDto from "../interfaces/ChatterDto";
import SharedFileDto from "../interfaces/SharedFileDto";
import ChatThreadDto from "../interfaces/ChatThreadDto";
import ChatThreadMessageDto from "../interfaces/ChatThreadMessageDto";
import CONSTANTS from "../../Constants";

export default class ChatClient extends AxiosClient implements ChatClientInterface {
    private static chatClientSingletonReference: ChatClient | null = null;
    private static CHAT_SERVER_DOMAIN: string = "localhost";
    private static CHAT_SERVER_PORT: number = 8080;
    
    private constructor () {
        super(`${ChatClient.CHAT_SERVER_DOMAIN}:${ChatClient.CHAT_SERVER_PORT}`);
    }

    public static getChatClient(): ChatClientInterface {
        if (ViteHelper.isDevEnvironment() === true) {
            return DummyChatClient.getDummyChatClient();
        } else {
           if (ChatClient.chatClientSingletonReference === null) {
                ChatClient.chatClientSingletonReference = new ChatClient();
            }

            return ChatClient.chatClientSingletonReference;
        }
    }

    public async getRegister(): ChatServerResponse<void> {
        const axiosResponse = await this.sendGetRequest<ChatServerResponse<void>>(
            `${CONSTANTS.REGISTER_URL}`
        );
        return axiosResponse.data;
    }

    public async register(registrationForm: ChatterRegistrationForm): ChatServerResponse<{ redirectUrl: string }> {
        const axiosResponse = await this.sendPostRequest<ChatServerResponse<{ redirectUrl: string }>>(
            `${CONSTANTS.REGISTER_URL}`,
            registrationForm
        );
        return axiosResponse.data;
    }

    public async getLogin(): ChatServerResponse<void> {
        const axiosResponse = await this.sendGetRequest<ChatServerResponse<void>>(
            `${CONSTANTS.LOGIN_URL}`
        );
        return axiosResponse.data;        
    }

    public async login(loginForm: LoginForm): ChatServerResponse<LoginDto> {
        const axiosResponse = await this.sendPostRequest<ChatServerResponse<LoginDto>>(
            `${CONSTANTS.LOGIN_URL}`,
            loginForm
        );
        return axiosResponse.data;
    }

    public async logout(): ChatServerResponse<{ redirectUrl: string }> {
       const axiosResponse = await this.sendPostRequest<ChatServerResponse<{ redirectUrl: string }>>(
            `${CONSTANTS.LOGOUT_URL}`
        );
        return axiosResponse.data;
    }

    public async getChatThreads(queryParams: URLSearchParams): ChatServerResponse<PagedListDto<ChatThreadOverviewDto>> {
        const axiosResponse = await this.sendGetRequest<ChatServerResponse<PagedListDto<ChatThreadOverviewDto>>>(
            `${CONSTANTS.HOME_URL}`,
            queryParams
        );
        return axiosResponse.data;
    }

    public async getChatters(queryParams: URLSearchParams): ChatServerResponse<PagedListDto<ChatterOverviewDto>> {
        const axiosResponse = await this.sendGetRequest<ChatServerResponse<PagedListDto<ChatterOverviewDto>>>(
            `${CONSTANTS.CHATTERS_URL}`,
            queryParams
        );
        return axiosResponse.data;
    }

    public async requestFileUploadUrl(uploadFileIntent: UploadFileIntent): ChatServerResponse<S3PreSignedUrlDto> {
        const axiosResponse = await this.sendPostRequest<ChatServerResponse<S3PreSignedUrlDto>>(
            `${CONSTANTS.ACCOUNT_URL}${CONSTANTS.REQUEST_UPLOAD_FILE_URL}`,
            uploadFileIntent
        );
        return axiosResponse.data;
    }

    public async postChatThread(chatterId: string): ChatServerResponse<ChatThreadDto> {
        const axiosResponse = await this.sendPostRequest<ChatServerResponse<ChatThreadDto>>(
            `${CONSTANTS.CHAT_URL}/${chatterId}`
        );
        return axiosResponse.data;
    }

    public async getChatThread(chatThreadId: string): ChatServerResponse<ChatThreadDto> {
        const axiosResponse = await this.sendGetRequest<ChatServerResponse<ChatThreadDto>>(
            `${CONSTANTS.CHAT_URL}/${chatThreadId}`
        );
        return axiosResponse.data;
    }

    public async getChatThreadMessages(chatThreadId: string, queryParams: URLSearchParams): ChatServerResponse<PagedListDto<ChatThreadMessageDto>> {
        const axiosResponse = await this.sendGetRequest<ChatServerResponse<PagedListDto<ChatThreadMessageDto>>>(
            `${CONSTANTS.CHAT_URL}/${chatThreadId}${CONSTANTS.GET_LATEST_CHAT_MESSAGES_URL}`,
            queryParams
        );
        return axiosResponse.data;
    }

    public async updateLastSeenChatThreadMessage(chatThreadId: string, chatThreadMessageId: string): ChatServerResponse<ChatThreadMessageDto> {
        const axiosResponse = await this.sendPostRequest<ChatServerResponse<ChatThreadMessageDto>>(
            `${CONSTANTS.CHAT_URL}/${chatThreadId}${CONSTANTS.UPDATE_LAST_SEEN_CHAT_MESSAGE_URL}/${chatThreadMessageId}`
        );
        return axiosResponse.data;
    }

    public async sendChatThreadMessage(chatThreadId: string, newChatThreadMessage: ChatThreadMessageForm): ChatServerResponse<ChatThreadMessageDto> {
        const axiosResponse = await this.sendPostRequest<ChatServerResponse<ChatThreadMessageDto>>(
            `${CONSTANTS.CHAT_URL}/${chatThreadId}${CONSTANTS.SEND_CHAT_MESSAGE_URL}`,
            newChatThreadMessage
        );
        return axiosResponse.data;
    }

    public async clearChatThreadHistory(chatThreadId: string): ChatServerResponse<{ chatThreadHistoryClearedAt: string }> {
        const axiosResponse = await this.sendGetRequest<ChatServerResponse<{ chatThreadHistoryClearedAt: string }>>(
            `${CONSTANTS.CHAT_URL}/${chatThreadId}${CONSTANTS.CLEAR_CHAT_HISTORY_URL}`
        );
        return axiosResponse.data;
    }

    public async getChatter(chatterId: string): ChatServerResponse<ChatterDto> {
        const axiosResponse = await this.sendGetRequest<ChatServerResponse<ChatterDto>>(
            `${CONSTANTS.CHATTER_URL}/${chatterId}`
        );
        return axiosResponse.data;
    }

    public async getSharedFiles(chatterId: string, queryParams: URLSearchParams): ChatServerResponse<PagedListDto<SharedFileDto>> {
        const axiosResponse = await this.sendGetRequest<ChatServerResponse<PagedListDto<SharedFileDto>>>(
            `${CONSTANTS.CHATTER_URL}/${chatterId}${CONSTANTS.CHATTER_SHARED_FILES}`,
            queryParams
        );
        return axiosResponse.data;
    }
}
