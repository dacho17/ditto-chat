import ChatterRegistrationForm from "../classes/ChatterRegistrationForm";
import LoginForm from "../classes/LoginForm";
import ForgotPasswordForm from "../classes/ForgotPasswordForm";
import ResetPasswordForm from "../classes/ResetPasswordForm";
import UploadFileIntent from "../classes/UploadFileIntent";
import ChatThreadMessageForm from "../classes/ChatThreadMessageForm";
import AccountImageForm from "../classes/AccountImageForm";
import AccountImageDto from "../interfaces/AccountImageDto";
import ChatterDto from "../interfaces/ChatterDto";
import ChatterOverviewDto from "../interfaces/ChatterOverviewDto";
import ChatThreadOverviewDto from "../interfaces/ChatThreadOverviewDto";
import S3PreSignedUrlDto from "../interfaces/S3PreSignedUrlDto";
import SharedFileDto from "../interfaces/SharedFileDto";
import ChatThreadDto from "../interfaces/ChatThreadDto";
import ChatThreadMessageDto from "../interfaces/ChatThreadMessageDto";
import LoginDto from "../interfaces/LoginDto";
import PagedListDto from "../interfaces/PagedListDto";

// Definition of Type Returned in the Body of HTTP Response from Chat Server
export type ChatServerResponseBody<T> = {
    message: string | null;
    data: T;
    authSessionExpiresAt: string | null;
};
// Definition of Error Type Returned in the Body of HTTP Response from Chat Server in cases where HTTP Error Code is Sent
export type ChatServerResponseErrorBody = ChatServerResponseBody<{
    redirectUrl: string
} | null>;
// Definition of Response Type Returned by Chat Server
export type ChatServerResponse<T> = Promise<ChatServerResponseBody<T>>;

export default interface ChatClientInterface {
    // Auth Endpoints
    getRegister(): ChatServerResponse<{ redirectUrl: string } | null>;
    register(registrationForm: ChatterRegistrationForm): ChatServerResponse<{ redirectUrl: string }>;
    getLogin(): ChatServerResponse<{ redirectUrl: string } | null>;
    login(loginForm: LoginForm): ChatServerResponse<LoginDto | { redirectUrl: string }>;
    getForgotPasswordPage(): ChatServerResponse<{ redirectUrl: string } | null>;
    forgotPassword(forgotPasswordForm: ForgotPasswordForm): ChatServerResponse<{ redirectUrl: string } | null>;
    getResetPasswordPage(): ChatServerResponse<{ redirectUrl: string } | null>;
    resetPassword(passwordResetToken: string, resetPasswordForm: ResetPasswordForm): ChatServerResponse<{ redirectUrl: string }>;
    logout(): ChatServerResponse<{ redirectUrl: string }>;

    // AWs Endpoints
    newUploadFileIntent(uploadFileIntentForm: UploadFileIntent): ChatServerResponse<S3PreSignedUrlDto>;

    // Account Endpoints
    newAccountImage(newAccountImageForm: AccountImageForm): ChatServerResponse<AccountImageDto>;

    // Home Endpoints
    getChatThreads(queryParams: URLSearchParams): ChatServerResponse<PagedListDto<ChatThreadOverviewDto>>;

    // Chatters Endpoints
    getChatters(queryParams: URLSearchParams): ChatServerResponse<PagedListDto<ChatterOverviewDto>>;

    // Chat Endpoints
    newChatThread(chatterId: string): ChatServerResponse<ChatThreadDto>;
    getChatThread(chatThreadId: string): ChatServerResponse<ChatThreadDto>;
    getChatThreadMessages(chatThreadId: string, queryParams: URLSearchParams): ChatServerResponse<PagedListDto<ChatThreadMessageDto>>;
    updateLastSeenChatThreadMessage(chatThreadId: string, chatThreadMessageId: string): ChatServerResponse<ChatThreadMessageDto>;
    sendChatThreadMessage(chatThreadId: string, newChatThreadMessage: ChatThreadMessageForm): ChatServerResponse<ChatThreadMessageDto>;
    clearChatThreadHistory(chatThreadId: string): ChatServerResponse<{ chatThreadHistoryClearedAt: string }>;

    // Chatter Endpoints
    getChatter(chatterId: string): ChatServerResponse<ChatterDto>;
    getSharedFiles(chatterId: string, queryParams: URLSearchParams): ChatServerResponse<PagedListDto<SharedFileDto>>;
}
