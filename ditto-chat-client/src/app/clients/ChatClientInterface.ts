import UploadFileIntent from "../classes/UploadFileIntent";
import ChatThreadMessageForm from "../classes/ChatThreadMessageForm";
import ChatterDto from "../interfaces/ChatterDto";
import ChatterOverviewDto from "../interfaces/ChatterOverviewDto";
import ChatThreadOverviewDto from "../interfaces/ChatThreadOverviewDto";
import S3PreSignedUrlDto from "../interfaces/S3PreSignedUrlDto";
import SharedFileDto from "../interfaces/SharedFileDto";
import ChatThreadDto from "../interfaces/ChatThreadDto";
import ChatThreadMessageDto from "../interfaces/ChatThreadMessageDto";
import LoginForm from "../classes/LoginForm";
import LoginDto from "../interfaces/LoginDto";
import PagedListDto from "../interfaces/PagedListDto";

// Definition of Type Returned in the Body of HTTP Response from Chat Server
export type ChatServerResponseBody<T> = {
    message: string | null;
    data: T;
};
// Definition of Error Type Returned in the Body of HTTP Response from Chat Server in cases where HTTP Error Code is Sent
export type ChatServerResponseErrorBody = ChatServerResponseBody<{
    redirectUrl: string
} | null>;
// Definition of Response Type Returned by Chat Server
export type ChatServerResponse<T> = Promise<ChatServerResponseBody<T>>;

export default interface ChatClientInterface {
    login(loginForm: LoginForm): ChatServerResponse<LoginDto>;
    logout(): ChatServerResponse<void>;

    getChatThreads(queryParams: URLSearchParams): ChatServerResponse<PagedListDto<ChatThreadOverviewDto>>;
    getChatThreadsWithSelectedChatThread(queryParams: URLSearchParams): ChatServerResponse<{
        selectedChatThread: ChatThreadDto,
        chatThreadsPage: PagedListDto<ChatThreadOverviewDto>
    }>;

    getChatters(queryParams: URLSearchParams): ChatServerResponse<PagedListDto<ChatterOverviewDto>>;

    requestAccountImageUploadUrl(uploadFileIntent: UploadFileIntent): ChatServerResponse<S3PreSignedUrlDto>;

    postChatThread(chatterId: string): ChatServerResponse<ChatThreadDto>;
    getChatThread(chatThreadId: string): ChatServerResponse<ChatThreadDto>;
    getChatThreadMessages(chatThreadId: string, queryParams: URLSearchParams): ChatServerResponse<PagedListDto<ChatThreadMessageDto>>;
    updateLastSeenChatThreadMessage(chatThreadId: string, chatThreadMessageId: string): ChatServerResponse<ChatThreadMessageDto>;
    sendChatThreadMessage(chatThreadId: string, newChatThreadMessage: ChatThreadMessageForm): ChatServerResponse<ChatThreadMessageDto>;
    clearChatThreadHistory(chatThreadId: string): ChatServerResponse<void>;

    getChatter(chatterId: string): ChatServerResponse<ChatterDto>;
    getSharedFiles(chatterId: string, queryParams: URLSearchParams): ChatServerResponse<PagedListDto<SharedFileDto>>;
}
