import ChatClientInterface, { ChatServerResponse } from "./ChatClientInterface";
import AwsClientInterface from "./AwsClientInterface";
import DummyChatService from "../helpers/DummyChatService";
import TypeFormatter from "../helpers/TypeFormatter";
import UploadFileIntent from "../classes/UploadFileIntent";
import ChatThreadMessageForm from "../classes/ChatThreadMessageForm";
import ChatterRegistrationForm from "../classes/ChatterRegistrationForm";
import LoginForm from "../classes/LoginForm";
import ForgotPasswordForm from "../classes/ForgotPasswordForm";
import ResetPasswordForm from "../classes/ResetPasswordForm";
import S3PreSignedUrl from "../classes/S3PreSignedUrl";
import PagedListDto from "../interfaces/PagedListDto";
import LoginDto from "../interfaces/LoginDto";
import ChatterOverviewDto from "../interfaces/ChatterOverviewDto";
import S3PreSignedUrlDto from "../interfaces/S3PreSignedUrlDto";
import S3UploadFileResponseDto from "../interfaces/S3UploadFileResponseDto";
import ChatThreadOverviewDto from "../interfaces/ChatThreadOverviewDto";
import ChatterDto from "../interfaces/ChatterDto";
import SharedFileDto from "../interfaces/SharedFileDto";
import ChatThreadDto from "../interfaces/ChatThreadDto";
import ChatThreadMessageDto from "../interfaces/ChatThreadMessageDto";
import CONSTANTS from "../../Constants";

const DUMMY_ACCOUNT_REGISTRATION_SUCCESS_MESSAGE = "You have registered successfully.";
const DUMMY_LOGIN_SUCCESS_MESSAGE = "You are logged in.";
const DUMMY_LOGOUT_SUCCESS_MESSAGE = "You are logged out.";
const DUMMY_ACCOUNT_FILE_UPLOAD_STARTED_MESSAGE = "File Upload Started.";
const DUMMY_ACCOUNT_FILE_UPLOAD_SUCCESS_MESSAGE = "Your File has been Uploaded!";

export default class DummyChatClient implements ChatClientInterface, AwsClientInterface {
    private static dummyChatClientSingletonReference: DummyChatClient | null = null;
    private dummyChatService: DummyChatService;

    private constructor() {
        this.dummyChatService = DummyChatService.getDummyChatService();
    }

    public static getDummyChatClient(): DummyChatClient {
        if (DummyChatClient.dummyChatClientSingletonReference === null) {
            DummyChatClient.dummyChatClientSingletonReference = new DummyChatClient();
        }

        return DummyChatClient.dummyChatClientSingletonReference;
    }

    public async getRegister(): ChatServerResponse<{ redirectUrl: string } | null> {
        console.log(`Received getRegister Request.`);
        console.log(`Responding with null`);
        return Promise.resolve({ 
            message: null,
            data: null
        });
    }

    public async register(registrationForm: ChatterRegistrationForm): ChatServerResponse<{ redirectUrl: string; }> {
        console.log(`Received register Request with registrationForm=${JSON.stringify(registrationForm)}.`);

        this.dummyChatService.addNewDummyChatter(registrationForm);
        console.log(`Responding with message and RedirectUrl to Login Page`);
        return Promise.resolve({ 
            message: DUMMY_ACCOUNT_REGISTRATION_SUCCESS_MESSAGE,
            data: {
                redirectUrl: CONSTANTS.LOGIN_URL
            }
        });
    }

    public async getLogin(): ChatServerResponse<{ redirectUrl: string } | null> {
        console.log(`Received getLogin Request.`);
        console.log(`Responding with null`);
        return Promise.resolve({ 
            message: null,
            data: null
        });
    }

    public async login(loginForm: LoginForm): ChatServerResponse<LoginDto> {
        console.log(`Received login Request with LoginForm: ${JSON.stringify(loginForm)}`);

        const dummyLoggedInChatter = this.dummyChatService.getDummyLoggedInChatter();
        console.log(`Responding with LoginDto: ${JSON.stringify(dummyLoggedInChatter)}`);
        return Promise.resolve({
            message: DUMMY_LOGIN_SUCCESS_MESSAGE,
            data: {
                chatterOverview: dummyLoggedInChatter,
                redirectUrl: CONSTANTS.HOME_URL
            }
        });
    }

    public async getForgotPasswordPage(): ChatServerResponse<{ redirectUrl: string } | null> {
        console.log(`Received getForgotPasswordPage Request.`);
        console.log(`Responding with null`);
        return Promise.resolve({ 
            message: null,
            data: null
        });
    }

    public async forgotPassword(forgotPasswordForm: ForgotPasswordForm): ChatServerResponse<{ redirectUrl: string } | null> {
        console.log(`Received forgotPassword Request with forgotPasswordForm=${JSON.stringify(forgotPasswordForm)}.`);
        console.log(`Responding with null`);
        return Promise.resolve({ 
            message: null,
            data: null
        });
    }

    public async getResetPasswordPage(): ChatServerResponse<{ redirectUrl: string; } | null> {
        console.log(`Received getResetPasswordPage Request.`);
        console.log(`Responding with null`);
        return Promise.resolve({ 
            message: null,
            data: null
        });
    }

    public async resetPassword(passwordResetToken: string, resetPasswordForm: ResetPasswordForm): ChatServerResponse<{ redirectUrl: string }> {
        console.log(`Received resetPassword Request with passwordResetToken=${passwordResetToken} and resetPasswordForm=${JSON.stringify(resetPasswordForm)}.`);
        console.log(`Responding with null`);
        return Promise.resolve({ 
            message: null,
            data: {
                redirectUrl: CONSTANTS.LOGIN_URL
            }
        });
    }

    public async logout(): ChatServerResponse<{ redirectUrl: string }> {
        console.log(`Received logout Request with nothing`);
        console.log(`Responding with redirectUrl`);
        return Promise.resolve({ 
            message: DUMMY_LOGOUT_SUCCESS_MESSAGE,
            data: {
                redirectUrl: CONSTANTS.LOGIN_URL
            }
        });
    }

    public async requestFileUploadUrl(uploadFileIntent: UploadFileIntent): ChatServerResponse<S3PreSignedUrlDto> {
        console.log(`Received requestFileUploadUrl Request with UploadFileIntent: ${JSON.stringify(uploadFileIntent)}`);

        const dummyS3PreSignedUrl = this.dummyChatService.generateDummyS3PreSignedUrl();
        console.log(`Responding with S3PreSignedUrlDto: ${JSON.stringify(dummyS3PreSignedUrl)}`);
        return Promise.resolve({
            message: DUMMY_ACCOUNT_FILE_UPLOAD_STARTED_MESSAGE,
            data: dummyS3PreSignedUrl
        });
    }

    public async uploadFileToS3(s3PreSignedUploadUrl: S3PreSignedUrl, fileContentStream: ReadableStream): Promise<S3UploadFileResponseDto> {
        console.log(`Received uploadFileToS3 Request with S3PreSignedUrl: ${JSON.stringify(s3PreSignedUploadUrl)}`);

        const dummyS3UploadResponse = this.dummyChatService.generateDummyS3UploadFileResponse();
        console.log(`Respdnding with S3UploadFileResponseDto: ${JSON.stringify(dummyS3UploadResponse)}`);
        return Promise.resolve({
            message: DUMMY_ACCOUNT_FILE_UPLOAD_SUCCESS_MESSAGE,
            data: dummyS3UploadResponse
        });
    }

    public async getChatThreads(queryParams: URLSearchParams): ChatServerResponse<PagedListDto<ChatThreadOverviewDto>> {
        console.log(`Received getChatThreads Request with queryParams: ${JSON.stringify(queryParams.toString())}`);

        const pageNumber = TypeFormatter.stringToInt(queryParams.get(CONSTANTS.PAGE_NUMBER_QUERY_PARAMETER));
        const chatThreadSearchFilter = queryParams.get(CONSTANTS.SEARCH_FILTER_QUERY_PARAMETER);
        const isInitialRetrieval = TypeFormatter.stringToBoolean(queryParams.get(CONSTANTS.IS_INITIAL_RETRIEVAL_QUERY_PARAMETER));
        const isPollingQueryParameter = queryParams.get(CONSTANTS.IS_POLLING_QUERY_PARAMTER) !== null
            ? TypeFormatter.stringToBoolean(queryParams.get(CONSTANTS.IS_POLLING_QUERY_PARAMTER))
            : false;

        if (isPollingQueryParameter === true) {
            this.dummyChatService.simulateSendingChatThreadMessage();
        }

        const applyFilter = (chatterOverviewDto: ChatterOverviewDto): boolean => {
            return `${chatterOverviewDto.chatterName} ${chatterOverviewDto.chatterSurname}`.toLowerCase().includes(chatThreadSearchFilter.toLowerCase());
        }

        const sortedAndFilteredChatThreadOverviews = DummyChatService.sortChatThreadDtoList(this.dummyChatService.getDummyChatThreads())
            .filter(chatThreadDto => applyFilter(chatThreadDto.chatThreadOverview.chatterOverview))
            .map(chatThreadDto => chatThreadDto.chatThreadOverview);

        const chatThreadOverviewPage = isInitialRetrieval === true || isPollingQueryParameter === true
            ? sortedAndFilteredChatThreadOverviews.slice(0, (pageNumber + 1) * CONSTANTS.NUMBER_OF_ITEMS_PER_PAGE)
            : sortedAndFilteredChatThreadOverviews.slice(pageNumber * CONSTANTS.NUMBER_OF_ITEMS_PER_PAGE, (pageNumber + 1) * CONSTANTS.NUMBER_OF_ITEMS_PER_PAGE);

        const responseData = {
            pagedList: chatThreadOverviewPage,
            isLastPage: sortedAndFilteredChatThreadOverviews.length <= (pageNumber + 1) * CONSTANTS.NUMBER_OF_ITEMS_PER_PAGE
        } as PagedListDto<ChatThreadOverviewDto>;

        console.log(`Responding with PagedListDto<ChatThreadOverviewDto> containing ${responseData.pagedList.length} entries`);

        return Promise.resolve({
            message: null,
            data: responseData
        });
    }

    public async getChatters(queryParams: URLSearchParams): ChatServerResponse<PagedListDto<ChatterOverviewDto>> {
        console.log(`Received getChatters Request with queryParams: ${JSON.stringify(queryParams.toString())}`);

        const pageNumber = TypeFormatter.stringToInt(queryParams.get(CONSTANTS.PAGE_NUMBER_QUERY_PARAMETER));
        const chatterSearchFilter = queryParams.get(CONSTANTS.SEARCH_FILTER_QUERY_PARAMETER);
        const isInitialRetrieval = TypeFormatter.stringToBoolean(queryParams.get(CONSTANTS.IS_INITIAL_RETRIEVAL_QUERY_PARAMETER));

        const applyFilter = (chatterOverviewDto: ChatterOverviewDto): boolean =>
                `${chatterOverviewDto.chatterName} ${chatterOverviewDto.chatterSurname}`.toLowerCase().includes(chatterSearchFilter.toLowerCase());
        const sortedAndFilteredChatterOverviews = DummyChatService.sortChatterDtoList(this.dummyChatService.getDummyChatters())
            .filter(chatterDto => applyFilter(chatterDto.chatterOverview))
            .map(chatterDto => chatterDto.chatterOverview);

        const chatterOverviewPage = isInitialRetrieval === true
            ? sortedAndFilteredChatterOverviews.slice(0, (pageNumber + 1) * CONSTANTS.NUMBER_OF_ITEMS_PER_PAGE)
            : sortedAndFilteredChatterOverviews.slice(pageNumber * CONSTANTS.NUMBER_OF_ITEMS_PER_PAGE, (pageNumber + 1) * CONSTANTS.NUMBER_OF_ITEMS_PER_PAGE);

        const responseData = {
            pagedList: chatterOverviewPage,
            isLastPage: sortedAndFilteredChatterOverviews.length <= (pageNumber + 1) * CONSTANTS.NUMBER_OF_ITEMS_PER_PAGE
        } as PagedListDto<ChatterOverviewDto>;
    
        console.log(`Responding with PagedListDto<ChatThreadOverviewDto> containing ${responseData.pagedList.length} entries`);
        return Promise.resolve({
            message: null,
            data:  responseData
        });
    }

    public async getChatter(chatterId: string): ChatServerResponse<ChatterDto> {
        console.log(`Received getChatter Request with chatterId: ${chatterId}`);
        
        const foundChatter = this.dummyChatService.getDummyChatters().find((chatterDto) => 
            chatterDto.chatterOverview.id === chatterId
        );

        const sortedSharedFilesWithChatter = DummyChatService.sortSharedFileDtoList(foundChatter.sharedFiles);
        const responseData = structuredClone(foundChatter);
        responseData.sharedFiles = sortedSharedFilesWithChatter;

        // returning only first, sorted Page of the sharedFiles!
        if (responseData !== null) {
            responseData.sharedFiles = responseData.sharedFiles.slice(0, CONSTANTS.NUMBER_OF_ITEMS_PER_PAGE);
        }
        
        console.log(`Responding with chatterDto: ${JSON.stringify(responseData)}`);
        return Promise.resolve({
            message: null,
            data: responseData
        });
    }

    public async getSharedFiles(chatterId: string, queryParams: URLSearchParams): ChatServerResponse<PagedListDto<SharedFileDto>> {
        console.log(`Received getSharedFiles Request with chatterId: ${chatterId}, and queryParams: ${JSON.stringify(queryParams.toString())}`);

        const pageNumber = TypeFormatter.stringToInt(queryParams.get(CONSTANTS.PAGE_NUMBER_QUERY_PARAMETER));
        const foundChatter = this.dummyChatService.getDummyChatters()
            .find(chatterDto => chatterDto.chatterOverview.id === chatterId);

        const sortedSharedFilesWithChatter = DummyChatService.sortSharedFileDtoList(foundChatter.sharedFiles);
        const sharedFilesPage = sortedSharedFilesWithChatter.slice(pageNumber * CONSTANTS.NUMBER_OF_ITEMS_PER_PAGE, (pageNumber + 1) * CONSTANTS.NUMBER_OF_ITEMS_PER_PAGE);

        const responseData = {
            pagedList: sharedFilesPage,
            isLastPage: foundChatter.sharedFiles.length <= (pageNumber + 1) * CONSTANTS.NUMBER_OF_ITEMS_PER_PAGE
        } as PagedListDto<SharedFileDto>;
    
        console.log(`Responding with PagedListDto<SharedFileDto> containing ${responseData.pagedList.length} entries`);
        return Promise.resolve({
            message: null,
            data: responseData
        });
    }

    public async postChatThread(chatterId: string): ChatServerResponse<ChatThreadDto> {
        console.log(`Received postChatThread Request with chatterId: ${chatterId}`);

        const newDummyChatThread = this.dummyChatService.addNewDummyChatThread(chatterId);

        console.log(`Responding with ChatThreadDto: ${JSON.stringify(newDummyChatThread)}`);
        return Promise.resolve({
            message: null,
            data: newDummyChatThread
        });
    }

    public async getChatThread(chatThreadId: string): ChatServerResponse<ChatThreadDto> {
        console.log(`Received getChatThread Request with chatThreadId: ${chatThreadId}`);

        const foundChatThread = this.dummyChatService.getDummyChatThreads()
            .find((chatThreadDto) => chatThreadDto.chatThreadOverview.id === chatThreadId);
        const sortedChatThreadMessages = DummyChatService.sortChatThreadMessageDtoList(foundChatThread.chatThreadMessages);

        const responseData = structuredClone(foundChatThread);
        responseData.chatThreadMessages = sortedChatThreadMessages.slice(0, CONSTANTS.NUMBER_OF_ITEMS_PER_PAGE);
        
        console.log(`Responding with ChatThreadDto: ${JSON.stringify(responseData)}`);
        return Promise.resolve({
            message: null,
            data: responseData
        });
    }

    public async getChatThreadMessages(chatThreadId: string, queryParams: URLSearchParams): ChatServerResponse<PagedListDto<ChatThreadMessageDto>> {
        console.log(`Received getChatThreadMessages Request with chatThreadId: ${chatThreadId}, and queryParams: ${JSON.stringify(queryParams.toString())}`);

        const pageNumber = TypeFormatter.stringToInt(queryParams.get(CONSTANTS.PAGE_NUMBER_QUERY_PARAMETER));

        const foundChatThread = this.dummyChatService.getDummyChatThreads()
            .find((chatThreadDto) => chatThreadDto.chatThreadOverview.id === chatThreadId);

        const sortedChatThreadMessages = DummyChatService.sortChatThreadMessageDtoList(foundChatThread.chatThreadMessages);
        const sortedChatThreadMessagesPage =
            sortedChatThreadMessages.slice(pageNumber * CONSTANTS.NUMBER_OF_ITEMS_PER_PAGE, (pageNumber + 1) * CONSTANTS.NUMBER_OF_ITEMS_PER_PAGE);

        const responseData = {
            pagedList: sortedChatThreadMessagesPage,
            isLastPage: sortedChatThreadMessages.length <= (pageNumber + 1) * CONSTANTS.NUMBER_OF_ITEMS_PER_PAGE
        } as PagedListDto<ChatThreadMessageDto>;

        console.log(`Responding with PagedListDto<ChatThreadMessageDto> containing ${responseData.pagedList.length} entries`);
        return Promise.resolve({
            message: null,
            data: responseData
        });
    }

    public async updateLastSeenChatThreadMessage(chatThreadId: string, chatThreadMessageId: string): ChatServerResponse<ChatThreadMessageDto> {
        console.log(`Received updateLastSeenChatThreadMessage Request with chatThreadId: ${chatThreadId}, and chatThreadMessageId: ${chatThreadMessageId}`);

        const newLastSeenChatThreadMessage = this.dummyChatService.updateLastSeenByChatterMessageId(chatThreadId, chatThreadMessageId);

        console.log(`Responding with ChatThreadMessageDto: ${JSON.stringify(newLastSeenChatThreadMessage)}`);
        return Promise.resolve({ 
            message: null,
            data: newLastSeenChatThreadMessage
        });
    }

    public async sendChatThreadMessage(chatThreadId: string, newChatThreadMessage: ChatThreadMessageForm): ChatServerResponse<ChatThreadMessageDto> {
        console.log(`Received sendChatThreadMessage Request with chatThreadId: ${chatThreadId}, and ChatThreadMessageForm: ${JSON.stringify(newChatThreadMessage)}`);

        const registeredChatThreadMessage = this.dummyChatService.addNewChatThreadMessage(chatThreadId, newChatThreadMessage);

        console.log(`Responding with ${JSON.stringify(registeredChatThreadMessage)}`);
        return Promise.resolve({ 
            message: null,
            data: registeredChatThreadMessage
        });
    }

    public async clearChatThreadHistory(chatThreadId: string): ChatServerResponse<{ chatThreadHistoryClearedAt: string }> {
        console.log(`Received clearChatThreadHistory Request with chatThreadId: ${chatThreadId}`);

        const resData = this.dummyChatService.clearChatThreadHistory(chatThreadId);

        console.log(`Responding with: ${JSON.stringify(resData)}`);
        return Promise.resolve({ 
            message: null,
            data: resData
        });
    }
}
