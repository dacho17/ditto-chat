import ChatClientInterface, { ChatServerResponse } from "./ChatClientInterface";
import AwsClientInterface from "./AwsClientInterface";
import CryptoHelper from "../helpers/CryptoHelper";
import TimeHelper from "../helpers/TimeHelper";
import TypeFormatter from "../helpers/TypeFormatter";
import UploadFileIntent from "../classes/UploadFileIntent";
import ChatThreadMessageForm from "../classes/ChatThreadMessageForm";
import ChatterRegistrationForm from "../classes/ChatterRegistrationForm";
import LoginForm from "../classes/LoginForm";
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
import DittoConsultingLogo from '../../assets/ditto-consulting-logo.png';
import ChatterIconImage from '../../assets/david-chat-image.jpg';

const DUMMY_ACCOUNT_REGISTRATION_SUCCESS_MESSAGE = "You have registered successfully.";
const DUMMY_LOGIN_SUCCESS_MESSAGE = "You are logged in.";
const DUMMY_LOGOUT_SUCCESS_MESSAGE = "You are logged out.";
const DUMMY_ACCOUNT_IMAGE_UPLOAD_STARTED_MESSAGE = "Image Upload Started.";
const DUMMY_ACCOUNT_IMAGE_UPLOAD_SUCCESS_MESSAGE = "Your Image has been Changed!";

// CORRECT
const DUMMY_LOGGED_IN_CHATTER_OVERVIEW = {
    id: "logged-in-chatter-id",
    chatterName: "LoggedIn",
    chatterSurname: "Chatter",
    chatterUsername: "logged-chatter",
    chatterImageUrl: ChatterIconImage,
    isChatterOnline: true,
    chatThreadId: null
} as ChatterOverviewDto;

// CORRECT
const DUMMY_NUMBER_OF_GENERATED_SHARED_FILES = 23;
const DUMMY_SHARED_FILES = Array.from({ length: DUMMY_NUMBER_OF_GENERATED_SHARED_FILES }, (_, index) => {
    const fileIndex = index + 1;
    return {
        fileName: `Shared File ${fileIndex}/${DUMMY_NUMBER_OF_GENERATED_SHARED_FILES}`,
        fileSharedAt: `2026-04-${fileIndex} 05:${fileIndex}:00`,
        fileUrl: index % 2 === 0 ? DittoConsultingLogo : ChatterIconImage
    } as SharedFileDto;
});

// CORRECT. Sloppy. Files are Shared with Chatters even if no Messages have been exchanged. Message != FileShare here!!!
const DUMMY_NUMBER_OF_DEFINED_CHATTERS = 4;
const DUMMY_NUMBER_OF_GENERATED_CHATTERS = 20;
const DUMMY_NUMBER_OF_GENERATED_OPENED_CHAT_THREADS = 14;
const DUMMY_ALL_CHATTERS = [
    {
        chatterOverview: {
            id: "peer-chatter-id-1",
            chatterName: "David",
            chatterSurname: "Dosenovic",
            chatterUsername: "david.dosenovic",
            chatterImageUrl: ChatterIconImage,
            isChatterOnline: true,
            chatThreadId: null  // NOTE: set during DUMMY_OPENED_CHAT_THREADS generation...
        },
        sharedFiles: [
            ...DUMMY_SHARED_FILES.slice(0, DUMMY_NUMBER_OF_GENERATED_SHARED_FILES)
        ]
    },
    {
        chatterOverview: {
            id: "peer-chatter-id-2",
            chatterName: "Keyser",
            chatterSurname: "Soze",
            chatterUsername: "keyser.soze",
            chatterImageUrl: ChatterIconImage,
            isChatterOnline: false
        },
        sharedFiles: [
            ...DUMMY_SHARED_FILES.slice(0, DUMMY_NUMBER_OF_GENERATED_SHARED_FILES - (DUMMY_NUMBER_OF_GENERATED_SHARED_FILES % CONSTANTS.NUMBER_OF_ITEMS_PER_PAGE))
        ]
    },
    {
        chatterOverview: {
            id: "peer-chatter-id-3",
            chatterName: "Mr.",
            chatterSurname: "X",
            chatterUsername: "mr.x",
            chatterImageUrl: ChatterIconImage,
            isChatterOnline: true
        },
        sharedFiles: [
            ...DUMMY_SHARED_FILES.slice(0, (DUMMY_NUMBER_OF_GENERATED_SHARED_FILES - (DUMMY_NUMBER_OF_GENERATED_SHARED_FILES % CONSTANTS.NUMBER_OF_ITEMS_PER_PAGE)) - 1)
        ]
    },
    {
        chatterOverview: {
            id: "peer-chatter-id-4",
            chatterName: "Jehova",
            chatterSurname: "Witness",
            chatterUsername: "jehova.witness",
            chatterImageUrl: ChatterIconImage,
            isChatterOnline: true
        },
        sharedFiles: [
            ...DUMMY_SHARED_FILES.slice(0, 1)
        ]
    },
    ...Array.from({ length: DUMMY_NUMBER_OF_GENERATED_CHATTERS }, (_, index) => {
        const chatterIndex = 5 + index;
        return {
            chatterOverview: {
                id: `peer-chatter-id-${chatterIndex}`,
                chatterName: "Generated",
                chatterSurname: `Chatter Number${chatterIndex}/${DUMMY_NUMBER_OF_DEFINED_CHATTERS + DUMMY_NUMBER_OF_GENERATED_CHATTERS}`,
                chatterUsername: `generated.chatternumber${chatterIndex}`,
                chatterImageUrl: index % 2 === 0 ? ChatterIconImage : DittoConsultingLogo,
                isChatterOnline: index % 3 === 0 ? true : false
            },
            sharedFiles: chatterIndex <= DUMMY_NUMBER_OF_GENERATED_OPENED_CHAT_THREADS ? [
                ...DUMMY_SHARED_FILES.slice(0, chatterIndex % DUMMY_NUMBER_OF_GENERATED_CHATTERS)
            ] : []
        } as ChatterDto
    })
] as ChatterDto[];

// CORRECT.
const DUMMY_NUMBER_OF_GENERATED_CHAT_THREAD_MESSAGES = 31;
const GENERATE_DUMMY_CHAT_THREAD_MESSAGES = (chatterId: string) => {    
    return Array.from({ length: DUMMY_NUMBER_OF_GENERATED_CHAT_THREAD_MESSAGES }, (_, index) => {
        const messageSenderChatterId = index % 2 === 0
            ? DUMMY_LOGGED_IN_CHATTER_OVERVIEW.id
            : chatterId;
        
        const messageIndex = index + 1;
        return {
            id: `chatter-${messageSenderChatterId}-${CryptoHelper.generateUuid()}`,
            messageSenderId: messageSenderChatterId,
            messageContent: index % 7 === 0
                ? `DummyMessage ${messageIndex}/${DUMMY_NUMBER_OF_GENERATED_CHAT_THREAD_MESSAGES}: Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since 1966, when designers at Letraset and James Mosley, the librarian at St Bride Printing Library in London, took a 1914 Cicero translation and scrambled it to make dummy text for Letraset's Body Type sheets. It has survived not only many decades, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised thanks to these sheets and more recently with desktop publishing software like Aldus PageMaker and Microsoft Word including versions of Lorem Ipsum`
                : `DummyMessage: ${messageIndex}/${DUMMY_NUMBER_OF_GENERATED_CHAT_THREAD_MESSAGES}`,
            messageRegisteredAt: `2026-05-${messageIndex} 05:${messageIndex}:00`
        } as ChatThreadMessageDto;
    });
};

// CORRECT.
const DUMMY_OPENED_CHAT_THREADS = Array.from({ length: DUMMY_NUMBER_OF_GENERATED_OPENED_CHAT_THREADS }, (_, index) => {
    const exchangedChatMessages =
        GENERATE_DUMMY_CHAT_THREAD_MESSAGES(DUMMY_ALL_CHATTERS[index].chatterOverview.id)
        .slice(0, index);
    const numberOfUnseenMessages = index % 4 === 0
        ? index : 0;

    const lastMessageContent = exchangedChatMessages.length !== 0
        ? exchangedChatMessages[exchangedChatMessages.length - 1].messageContent
        : null;
    const lastMessageTime = exchangedChatMessages.length !== 0
        ? exchangedChatMessages[exchangedChatMessages.length - 1].messageRegisteredAt
        : null;

    // Setting chatThreadIds on DUMMY_ALL_CHATTERS with DUMMY_OPENED_CHAT_THREAD
    DUMMY_ALL_CHATTERS[index].chatterOverview.chatThreadId = `chat-thread-id-${index + 1}`;

    return {
        chatThreadOverview: {
            id: `chat-thread-id-${index + 1}`,
            chatterOverview: DUMMY_ALL_CHATTERS[index].chatterOverview,
            chatThreadCreatedAt: lastMessageTime !== null
                ? exchangedChatMessages[0].messageRegisteredAt
                : `2026-07-24 09:42:00`,
            lastMessageContent: lastMessageContent,
            lastMessageTime: lastMessageTime,
            numberOfUnseenMessages: numberOfUnseenMessages
        },
        chatThreadMessages: exchangedChatMessages
    } as ChatThreadDto;
});

// CORRECT.
const DUMMY_S3_PRE_SIGNED_URL = {
    url: "./dummy_account_image",
    expiresAt: TimeHelper.getServerFormattedTimestamp(TimeHelper.addSecondsToTimeStamp(TimeHelper.getCurrentTimestamp(), 60 * 15))
} as S3PreSignedUrlDto;
const DUMMY_S3_UPLOAD_FILE_RESPONSE = {
    // NOTE: the response is Empty
} as S3UploadFileResponseDto;

export default class DummyChatClient implements ChatClientInterface, AwsClientInterface {
    private static dummyChatClientSingletonReference: DummyChatClient | null = null;

    private constructor() {}

    public static getDummyChatClient(): DummyChatClient {
        if (DummyChatClient.dummyChatClientSingletonReference === null) {
            DummyChatClient.dummyChatClientSingletonReference = new DummyChatClient();
        }

        return DummyChatClient.dummyChatClientSingletonReference;
    }

    public async getRegister(): ChatServerResponse<void> {
        console.log(`Received getRegister Request.`);
        console.log(`Responding with null`);
        return Promise.resolve({ 
            message: null,
            data: null
        });
    }

    public async register(registrationForm: ChatterRegistrationForm): ChatServerResponse<{ redirectUrl: string; }> {
        console.log(`Received register Request with registrationForm=${JSON.stringify(registrationForm)}.`);
        console.log(`Responding with message and RedirectUrl to Login Page`);
        return Promise.resolve({ 
            message: DUMMY_ACCOUNT_REGISTRATION_SUCCESS_MESSAGE,
            data: {
                redirectUrl: CONSTANTS.LOGIN_URL
            }
        });
    }

    public async getLogin(): ChatServerResponse<void> {
        console.log(`Received getLogin Request.`);
        console.log(`Responding with null`);
        return Promise.resolve({ 
            message: null,
            data: null
        });
    }

    public async login(loginForm: LoginForm): ChatServerResponse<LoginDto> {
        console.log(`Received LoginForm: ${JSON.stringify(loginForm)}`);
        console.log(`Responding with LoginDto: ${JSON.stringify(DUMMY_LOGGED_IN_CHATTER_OVERVIEW)}`);
        return Promise.resolve({
            message: DUMMY_LOGIN_SUCCESS_MESSAGE,
            data: {
                chatterOverview: DUMMY_LOGGED_IN_CHATTER_OVERVIEW,
                redirectUrl: CONSTANTS.HOME_URL
            }
        });
    }

    public async logout(): ChatServerResponse<{ redirectUrl: string }> {
        console.log(`Nothing Received on /logout`);
        console.log(`Responding with redirectUrl`);
        return Promise.resolve({ 
            message: DUMMY_LOGOUT_SUCCESS_MESSAGE,
            data: {
                redirectUrl: CONSTANTS.LOGIN_URL
            }
        });
    }

    public async requestAccountImageUploadUrl(uploadFileIntent: UploadFileIntent): ChatServerResponse<S3PreSignedUrlDto> {
        console.log(`Received UploadFileIntent: ${JSON.stringify(uploadFileIntent)}`);
        console.log(`Responding with S3PreSignedUrlDto: ${JSON.stringify(DUMMY_S3_PRE_SIGNED_URL)}`);
        return Promise.resolve({
            message: DUMMY_ACCOUNT_IMAGE_UPLOAD_STARTED_MESSAGE,
            data: DUMMY_S3_PRE_SIGNED_URL
        });
    }

    public async uploadAccountImageToS3(s3PreSignedUploadUrl: S3PreSignedUrlDto, fileContentStream: ReadableStream): Promise<S3UploadFileResponseDto> {
        console.log(`Received S3PreSignedUrlDto: ${JSON.stringify(s3PreSignedUploadUrl)}`);
        console.log(`Respdnding with S3UploadFileResponseDto: ${JSON.stringify(DUMMY_S3_UPLOAD_FILE_RESPONSE)}`);
        return Promise.resolve({
            message: DUMMY_ACCOUNT_IMAGE_UPLOAD_SUCCESS_MESSAGE,
            data: DUMMY_S3_UPLOAD_FILE_RESPONSE
        });
    }

    public async getChatThreads(queryParams: URLSearchParams): ChatServerResponse<PagedListDto<ChatThreadOverviewDto>> {
        console.log(`Received queryParams: ${JSON.stringify(queryParams.toString())}`);

        const pageNumber = TypeFormatter.stringToInt(queryParams.get(CONSTANTS.PAGE_NUMBER_QUERY_PARAMETER));
        const chatThreadSearchFilter = queryParams.get(CONSTANTS.SEARCH_FILTER_QUERY_PARAMETER);
        const isInitialRetrieval = TypeFormatter.stringToBoolean(queryParams.get(CONSTANTS.IS_INITIAL_RETRIEVAL_QUERY_PARAMETER));

        const applyFilter = (chatterOverviewDto: ChatterOverviewDto): boolean => {
            return `${chatterOverviewDto.chatterName} ${chatterOverviewDto.chatterSurname}`.toLowerCase().includes(chatThreadSearchFilter.toLowerCase());
        }

        const PAGED_DUMMY_DATA = DUMMY_OPENED_CHAT_THREADS
            .filter(chatThreadDto => applyFilter(chatThreadDto.chatThreadOverview.chatterOverview))
            .map(chatThreadDto => chatThreadDto.chatThreadOverview)
            .sort((first, second) => {
                const firstLatestChatThreadActivityTimestamp =
                    first.lastMessageTime !== null ? TimeHelper.dateStringToTimestamp(first.lastMessageTime) : TimeHelper.dateStringToTimestamp(first.chatThreadCreatedAt);
                const secondLatestChatThreadActivityTimestamp =
                    second.lastMessageTime !== null ? TimeHelper.dateStringToTimestamp(second.lastMessageTime) : TimeHelper.dateStringToTimestamp(second.chatThreadCreatedAt);
                
                return secondLatestChatThreadActivityTimestamp - firstLatestChatThreadActivityTimestamp;
            });

        const chatThreadOverviewPage = isInitialRetrieval === true
            ? PAGED_DUMMY_DATA.slice(0, (pageNumber + 1) * CONSTANTS.NUMBER_OF_ITEMS_PER_PAGE)
            : PAGED_DUMMY_DATA.slice(pageNumber * CONSTANTS.NUMBER_OF_ITEMS_PER_PAGE, (pageNumber + 1) * CONSTANTS.NUMBER_OF_ITEMS_PER_PAGE);

        const responseData = {
            pagedList: chatThreadOverviewPage,
            isLastPage: PAGED_DUMMY_DATA.length <= (pageNumber + 1) * CONSTANTS.NUMBER_OF_ITEMS_PER_PAGE
        } as PagedListDto<ChatThreadOverviewDto>;

        console.log(`Responding with PagedListDto<ChatThreadOverviewDto> containing ${responseData.pagedList.length} entries`);

        return Promise.resolve({
            message: null,
            data: responseData
        });
    }

    public async getChatThreadsWithSelectedChatThread(queryParams: URLSearchParams): ChatServerResponse<{
        selectedChatThread: ChatThreadDto,
        chatThreadsPage: PagedListDto<ChatThreadOverviewDto>
    }> {
        console.log(`Received queryParams: ${JSON.stringify(queryParams.toString())}`);

        queryParams.set(CONSTANTS.IS_INITIAL_RETRIEVAL_QUERY_PARAMETER, "true");
        const chatThreadsRes = await this.getChatThreads(queryParams);
        const chatThreadRes = await this.getChatThread(queryParams.get(CONSTANTS.SELECTED_CHAT_THREAD_ID_QUERY_PARAMETER));

        console.log(`Responding with:\nselectedChatThread: ${JSON.stringify(chatThreadRes.data)}\nPagedListDto<ChatThreadOverviewDto> containing ${chatThreadsRes.data.pagedList.length} entries`);

        return Promise.resolve({
            message: null,
            data: {
                selectedChatThread: chatThreadRes.data,
                chatThreadsPage: chatThreadsRes.data
            }
        });
    }

    public async getChatters(queryParams: URLSearchParams): ChatServerResponse<PagedListDto<ChatterOverviewDto>> {
        console.log(`Received queryParams: ${JSON.stringify(queryParams.toString())}`);

        const pageNumber = TypeFormatter.stringToInt(queryParams.get(CONSTANTS.PAGE_NUMBER_QUERY_PARAMETER));
        const chatterSearchFilter = queryParams.get(CONSTANTS.SEARCH_FILTER_QUERY_PARAMETER);
        const isInitialRetrieval = TypeFormatter.stringToBoolean(queryParams.get(CONSTANTS.IS_INITIAL_RETRIEVAL_QUERY_PARAMETER));

        const getChatterOvervirewFullName = (chatterOverviewDto: ChatterOverviewDto) =>
                `${chatterOverviewDto.chatterName} ${chatterOverviewDto.chatterSurname}`;
        const applyFilter = (chatterOverviewDto: ChatterOverviewDto): boolean =>
                getChatterOvervirewFullName(chatterOverviewDto).toLowerCase().includes(chatterSearchFilter.toLowerCase());

        const FILTERED_DUMMY_DATA = DUMMY_ALL_CHATTERS
            .toSorted((first, second) => {
                const firstChatterFullName = getChatterOvervirewFullName(first.chatterOverview);
                const secondChatterFullName = getChatterOvervirewFullName(second.chatterOverview);
                
                return firstChatterFullName.toLowerCase().localeCompare(secondChatterFullName.toLowerCase());
            })
            .filter(chatterDto => applyFilter(chatterDto.chatterOverview))
            .map(chatterDto => chatterDto.chatterOverview);

        const chatterOverviewPage = isInitialRetrieval === true
            ? FILTERED_DUMMY_DATA.slice(0, (pageNumber + 1) * CONSTANTS.NUMBER_OF_ITEMS_PER_PAGE)
            : FILTERED_DUMMY_DATA.slice(pageNumber * CONSTANTS.NUMBER_OF_ITEMS_PER_PAGE, (pageNumber + 1) * CONSTANTS.NUMBER_OF_ITEMS_PER_PAGE);

        const responseData = {
            pagedList: chatterOverviewPage,
            isLastPage: FILTERED_DUMMY_DATA.length <= (pageNumber + 1) * CONSTANTS.NUMBER_OF_ITEMS_PER_PAGE
        } as PagedListDto<ChatterOverviewDto>;
    
        // console.log(`Responding with PagedListDto<ChatterOverviewDto>: ${JSON.stringify(responseData)}`);
        console.log(`Responding with PagedListDto<ChatThreadOverviewDto> containing ${responseData.pagedList.length} entries`);

        return Promise.resolve({
            message: null,
            data:  responseData
        });
    }

    public async getChatter(chatterId: string): ChatServerResponse<ChatterDto> {
        console.log(`Received chatterId: ${chatterId}`);
        
        const foundChatter = DUMMY_ALL_CHATTERS.find((chatterDto) => 
            chatterDto.chatterOverview.id === chatterId
        );

        const responseData = structuredClone(foundChatter);
        responseData.sharedFiles.sort((first, second) => {
            return TimeHelper.dateStringToTimestamp(second.fileSharedAt) - TimeHelper.dateStringToTimestamp(first.fileSharedAt);
        });

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
        console.log(`Rececived chatterId: ${chatterId}, and queryParams: ${JSON.stringify(queryParams.toString())}`);

        const pageNumber = TypeFormatter.stringToInt(queryParams.get(CONSTANTS.PAGE_NUMBER_QUERY_PARAMETER));
        const foundChatter = DUMMY_ALL_CHATTERS
            .find(chatterDto => chatterDto.chatterOverview.id === chatterId);

        foundChatter.sharedFiles.sort((first, second) => {
            return TimeHelper.dateStringToTimestamp(second.fileSharedAt) - TimeHelper.dateStringToTimestamp(first.fileSharedAt);
        });

        const sharedFilesPage = foundChatter.sharedFiles.slice(pageNumber * CONSTANTS.NUMBER_OF_ITEMS_PER_PAGE, (pageNumber + 1) * CONSTANTS.NUMBER_OF_ITEMS_PER_PAGE);

        const responseData = {
            pagedList: sharedFilesPage,
            isLastPage: foundChatter.sharedFiles.length <= (pageNumber + 1) * CONSTANTS.NUMBER_OF_ITEMS_PER_PAGE
        } as PagedListDto<SharedFileDto>;
    
        console.log(`Responding with PagedListDto<SharedFileDto> containing ${responseData.pagedList.length} entries`);
        // console.log(`Responding with PagedListDto<SharedFileDto>: ${responseData}`);

        return Promise.resolve({
            message: null,
            data: responseData
        });
    }

    public async postChatThread(chatterId: string): ChatServerResponse<ChatThreadDto> {
        console.log(`Received chatterId: ${chatterId}`);

        const foundChatter = DUMMY_ALL_CHATTERS
            .find(chatter => chatter.chatterOverview.id === chatterId);

        const responseData = {
            chatThreadOverview: {
                id: `chat-thread-id-${DUMMY_OPENED_CHAT_THREADS.length + 1}`,
                chatterOverview: foundChatter.chatterOverview,
                chatThreadCreatedAt: TimeHelper.getServerFormattedTimestamp(TimeHelper.getCurrentTimestamp()),
                lastMessageContent: null,
                lastMessageTime: null,
                numberOfUnseenMessages: 0
            },
            chatThreadMessages: []
        } as ChatThreadDto;
        
        // relating newly created dummy data to intially existing dummy data
        foundChatter.chatterOverview.chatThreadId = responseData.chatThreadOverview.id;
        DUMMY_OPENED_CHAT_THREADS.push(responseData);
        
        console.log(`Responding with ChatThreadDto: ${JSON.stringify(responseData)}`);

        return Promise.resolve({
            message: null,
            data: responseData
        });
    }

    public async getChatThread(chatThreadId: string): ChatServerResponse<ChatThreadDto> {
        console.log(`Rececived chatThreadId: ${chatThreadId}`);

        const foundChatThread = DUMMY_OPENED_CHAT_THREADS
            .find((chatThreadDto) => chatThreadDto.chatThreadOverview.id === chatThreadId);
        const responseData = structuredClone(foundChatThread);

        // returning only first Page of the messages!
        if (responseData !== null) {
            responseData.chatThreadMessages = responseData.chatThreadMessages
                .sort((first, second) => {
                    return TimeHelper.dateStringToTimestamp(second.messageRegisteredAt) - TimeHelper.dateStringToTimestamp(first.messageRegisteredAt);
                })
                .slice(0, CONSTANTS.NUMBER_OF_ITEMS_PER_PAGE);
        }
        
        console.log(`Responding with ChatThreadDto: ${JSON.stringify(responseData)}`);
        return Promise.resolve({
            message: null,
            data: responseData
        });
    }

    public async getChatThreadMessages(chatThreadId: string, queryParams: URLSearchParams): ChatServerResponse<PagedListDto<ChatThreadMessageDto>> {
        console.log(`Rececived chatThreadId: ${chatThreadId}, and queryParams: ${JSON.stringify(queryParams.toString())}`);

        const pageNumber = TypeFormatter.stringToInt(queryParams.get(CONSTANTS.PAGE_NUMBER_QUERY_PARAMETER));

        const foundChatThread = DUMMY_OPENED_CHAT_THREADS
            .find((chatThreadDto) => chatThreadDto.chatThreadOverview.id === chatThreadId);

        const allChatThreadMessages = foundChatThread.chatThreadMessages;
        const chatThreadMessagePage
            = allChatThreadMessages.sort((first, second) => {
                return TimeHelper.dateStringToTimestamp(second.messageRegisteredAt) - TimeHelper.dateStringToTimestamp(first.messageRegisteredAt);
            }).slice(pageNumber * CONSTANTS.NUMBER_OF_ITEMS_PER_PAGE, (pageNumber + 1) * CONSTANTS.NUMBER_OF_ITEMS_PER_PAGE);

        const responseData = {
            pagedList: chatThreadMessagePage,
            isLastPage: allChatThreadMessages.length <= (pageNumber + 1) * CONSTANTS.NUMBER_OF_ITEMS_PER_PAGE
        } as PagedListDto<ChatThreadMessageDto>;

        // console.log(`Responding with PagedListDto<ChatThreadMessageDto>: ${JSON.stringify(responseData)}`);
        console.log(`Responding with PagedListDto<ChatThreadMessageDto> containing ${responseData.pagedList.length} entries`);

        return Promise.resolve({
            message: null,
            data: responseData
        });
    }

    public async updateLastSeenChatThreadMessage(chatThreadId: string, chatThreadMessageId: string): ChatServerResponse<ChatThreadMessageDto> {
        console.log(`Rececived chatThreadId: ${chatThreadId}, and chatThreadMessageId: ${chatThreadMessageId}`);

        const foundChatThread = DUMMY_OPENED_CHAT_THREADS
            .find((chatThreadDto) => chatThreadDto.chatThreadOverview.id === chatThreadId);

        const newLastSeenChatThreadMessage = foundChatThread.chatThreadMessages.find(chatThreadMessage => chatThreadMessage.id === chatThreadMessageId);
        foundChatThread.chatThreadOverview.lastMessageContent = newLastSeenChatThreadMessage.messageContent;
        foundChatThread.chatThreadOverview.lastMessageTime = newLastSeenChatThreadMessage.messageRegisteredAt;

        console.log(`Found ChatThreadDto updated to: ${JSON.stringify(foundChatThread)}. \nResponding with ChatThreadMessageDto: ${JSON.stringify(newLastSeenChatThreadMessage)}`);
        return Promise.resolve({ 
            message: null,
            data: newLastSeenChatThreadMessage
        });
    }

    public async sendChatThreadMessage(chatThreadId: string, newChatThreadMessage: ChatThreadMessageForm): ChatServerResponse<ChatThreadMessageDto> {
        console.log(`Rececived chatThreadId: ${chatThreadId}, and ChatThreadMessageForm: ${JSON.stringify(newChatThreadMessage)}`);

        const foundChatThread = DUMMY_OPENED_CHAT_THREADS
            .find((chatThreadDto) => chatThreadDto.chatThreadOverview.id === chatThreadId);

        const registeredChatThreadMessage = {
            id: `chatter-${DUMMY_LOGGED_IN_CHATTER_OVERVIEW.id}-chat-thread-message-id-${foundChatThread.chatThreadMessages.length + 1}`,
            messageSenderId: `${DUMMY_LOGGED_IN_CHATTER_OVERVIEW.id}`,
            messageContent: `Newly sent Message: ${newChatThreadMessage.getMessage()}`,
            messageRegisteredAt: TimeHelper.getServerFormattedTimestamp(TimeHelper.getCurrentTimestamp())
        } as ChatThreadMessageDto;

        foundChatThread.chatThreadMessages.push(registeredChatThreadMessage);
        foundChatThread.chatThreadOverview.lastMessageContent = registeredChatThreadMessage.messageContent;
        foundChatThread.chatThreadOverview.lastMessageTime = registeredChatThreadMessage.messageRegisteredAt;

        console.log(`Responding with ${JSON.stringify(registeredChatThreadMessage)}`);
        return Promise.resolve({ 
            message: null,
            data: registeredChatThreadMessage
        });
    }

    public async clearChatThreadHistory(chatThreadId: string): ChatServerResponse<void> {
        console.log(`Received chatThreadId: ${chatThreadId}`);

        const foundChatThread = DUMMY_OPENED_CHAT_THREADS.find(chatThread => chatThread.chatThreadOverview.id === chatThreadId);
        foundChatThread.chatThreadMessages = [];
        foundChatThread.chatThreadOverview.lastMessageContent = null;
        foundChatThread.chatThreadOverview.lastMessageTime = null;
        foundChatThread.chatThreadOverview.numberOfUnseenMessages = 0;

        console.log(`Found ChatThreadDto updated to: ${JSON.stringify(foundChatThread)}. \nResponding with null`);
        return Promise.resolve({ 
            message: null,
            data: null
        });
    }
}
