import TimeHelper from "./TimeHelper";
import CryptoHelper from "./CryptoHelper";
import ChatThreadMessageForm from "../classes/ChatThreadMessageForm";
import ChatterRegistrationForm from "../classes/ChatterRegistrationForm";
import ChatterOverviewDto from "../interfaces/ChatterOverviewDto";
import ChatThreadMessageDto from "../interfaces/ChatThreadMessageDto";
import SharedFileDto from "../interfaces/SharedFileDto";
import ChatterDto from "../interfaces/ChatterDto";
import ChatThreadDto from "../interfaces/ChatThreadDto";
import S3PreSignedUrlDto from "../interfaces/S3PreSignedUrlDto";
import S3UploadFileResponseDto from "../interfaces/S3UploadFileResponseDto";
import { SharedFileType } from "../enums/SharedFileType";
import DittoConsultingLogo from '../../assets/ditto-consulting-logo.png';
import ChatterIconImage from '../../assets/david-chat-image.jpg';

export default class DummyChatService {
    private static dummyChatServiceSingletonReference: DummyChatService | null = null;
    private dummyLoggedInChatter: ChatterOverviewDto;
    private dummyChatters: ChatterDto[];
    private dummyChatThreads: ChatThreadDto[];

    private constructor() {
        const generatedDummyLoggedInChatter = DummyChatService.generateDummyLoggedInChatter();
        const generatedDummySharedFiles = DummyChatService.generateDummySharedFiles();
        const generatedDummyChatters = DummyChatService.generateDummyChatters();
        const generatedDummyChatThreads = DummyChatService.generateDummyChatThreads(generatedDummyLoggedInChatter, generatedDummySharedFiles, generatedDummyChatters);

        this.dummyLoggedInChatter = generatedDummyLoggedInChatter;
        this.dummyChatters = generatedDummyChatters;
        this.dummyChatThreads = generatedDummyChatThreads;
    }

    public static getDummyChatService(): DummyChatService {
        if (DummyChatService.dummyChatServiceSingletonReference === null) {
            DummyChatService.dummyChatServiceSingletonReference = new DummyChatService();
        }

        return DummyChatService.dummyChatServiceSingletonReference;
    }

    public getDummyLoggedInChatter(): ChatterOverviewDto {
        return this.dummyLoggedInChatter;
    }

    public getDummyChatters(): ChatterDto[] {
        return this.dummyChatters;
    }

    public getDummyChatThreads(): ChatThreadDto[] {
        return this.dummyChatThreads;
    }

    public addNewDummyChatter(newChatterRegistrationForm: ChatterRegistrationForm): ChatterDto {
        const newlyRegisteredChatter = {
            chatterOverview: {
                id: `new-chatter-id-${this.dummyChatters.length + 1}`,
                chatterName: newChatterRegistrationForm.getName(),
                chatterSurname: newChatterRegistrationForm.getSurname(),
                chatterUsername: newChatterRegistrationForm.getUsername(),
                chatterEmail: newChatterRegistrationForm.getEmail(),
                chatterImageUrl: null,
                isChatterOnline: true,
                chatThreadId: null,
            },
            sharedFiles: []
        } as ChatterDto;

        this.dummyChatters.push(newlyRegisteredChatter);
        this.dummyChatters = DummyChatService.sortChatterDtoList(this.dummyChatters);

        return newlyRegisteredChatter;
    }

    public addNewDummyChatThread(peerChatterId: string): ChatThreadDto {
        const peerChatterIndex = this.dummyChatters.findIndex(chatter => chatter.chatterOverview.id === peerChatterId);

        const newDummyChatThread = {
            chatThreadOverview: {
                id: `chat-thread-id-${this.dummyChatThreads.length + 1}`,
                chatterOverview: this.dummyChatters[peerChatterIndex].chatterOverview,
                chatThreadCreatedAt: TimeHelper.getServerFormattedTimestamp(TimeHelper.getCurrentTimestamp()),
                lastMessageContent: null,
                lastMessageTime: null,
                numberOfUnseenMessages: 0,
                lastSeenByChatterMessageId: null,
                lastSeenByPeerMessageId: null,
                chatThreadHistoryClearedAt: null
            },
            chatThreadMessages: []
        } as ChatThreadDto;
        
        this.dummyChatThreads.push(newDummyChatThread);
        this.dummyChatThreads = DummyChatService.sortChatThreadDtoList(this.dummyChatThreads);

        // chatThreadId is set on the ChatterDto
        this.dummyChatters[peerChatterIndex].chatterOverview.chatThreadId = newDummyChatThread.chatThreadOverview.id;
        
        return newDummyChatThread;
    }

    public addNewChatThreadMessage(chatThreadId: string, newChatThreadMessageForm: ChatThreadMessageForm): ChatThreadMessageDto {
        const chatThreadIndex = this.dummyChatThreads.findIndex(chatThread => chatThread.chatThreadOverview.id === chatThreadId);

        let attachedFile  = null;
        if (newChatThreadMessageForm.getAttachedFile() !== null) {
            attachedFile = {
                fileName: newChatThreadMessageForm.getAttachedFile().getFileName(),
                fileType: newChatThreadMessageForm.getAttachedFile().getFileType(),
                fileUrl: ChatterIconImage,
                fileSharedAt: TimeHelper.getServerFormattedTimestamp(TimeHelper.getCurrentTimestamp()),
                fileSharedByChatterId: this.dummyLoggedInChatter.id
            } as SharedFileDto;
        }

        const registeredChatThreadMessage = {
            id: `new-message-from-chatter-${this.dummyLoggedInChatter.id}-randomguid-${CryptoHelper.generateUuid()}`,
            messageSenderId: `${this.dummyLoggedInChatter.id}`,
            messageContent: `${newChatThreadMessageForm.getMessage()} (Newly sent Message)`,
            attachedFile: attachedFile,
            messageRegisteredAt: TimeHelper.getServerFormattedTimestamp(TimeHelper.getCurrentTimestamp()),
            isMessageSeen: true
        } as ChatThreadMessageDto;

        this.dummyChatThreads[chatThreadIndex].chatThreadMessages.push(registeredChatThreadMessage);
        this.dummyChatThreads[chatThreadIndex].chatThreadMessages
            = DummyChatService.sortChatThreadMessageDtoList(this.dummyChatThreads[chatThreadIndex].chatThreadMessages);
            
        this.dummyChatThreads[chatThreadIndex].chatThreadOverview.lastMessageContent = registeredChatThreadMessage.messageContent;
        this.dummyChatThreads[chatThreadIndex].chatThreadOverview.lastMessageTime = registeredChatThreadMessage.messageRegisteredAt;

        // Updating sharedFiles on ChatterDto if File was attached to the ChatThreadMessage
        if (registeredChatThreadMessage.attachedFile !== null) {
            const peerChatterDtoIndex = this.dummyChatters.findIndex(chatter =>
                chatter.chatterOverview.id === this.dummyChatThreads[chatThreadIndex].chatThreadOverview.chatterOverview.id);
            
            this.dummyChatters[peerChatterDtoIndex].sharedFiles.push(registeredChatThreadMessage.attachedFile);
            this.dummyChatters[peerChatterDtoIndex].sharedFiles = DummyChatService.sortSharedFileDtoList(this.dummyChatters[peerChatterDtoIndex].sharedFiles);
        }

        return registeredChatThreadMessage;
    }

    // Function simulates a peer sending a chatThreadMessage to a random ChatThread
    public simulateSendingChatThreadMessage(): void {
        const lastDummyChatThreadIndex = this.dummyChatThreads.length - 1;
        const randomMessagedChatThreadIndex = Math.round(lastDummyChatThreadIndex * Math.random());   // this will return a random valid dummyChatThreadIndex
        const newlyMessagedChatThreadId = this.dummyChatThreads[randomMessagedChatThreadIndex].chatThreadOverview.id;

        this.addNewPeerSentChatThreadMessage(newlyMessagedChatThreadId);
    }

    private addNewPeerSentChatThreadMessage(chatThreadId: string): void {
        const chatThreadIndex = this.dummyChatThreads.findIndex(chatThread => chatThread.chatThreadOverview.id === chatThreadId);
        const peerChatterId = this.dummyChatThreads[chatThreadIndex].chatThreadOverview.chatterOverview.id;

        const newPeerSentChatThreadMessage = {
            id: `new-polled-message-from-chatter-${peerChatterId}-randomguid-${CryptoHelper.generateUuid()}`,
            messageSenderId: `${peerChatterId}`,
            messageContent: `This is a simulated new message which was polled.`,
            attachedFile: null,
            messageRegisteredAt: TimeHelper.getServerFormattedTimestamp(TimeHelper.getCurrentTimestamp()),
            isMessageSeen: false
        } as ChatThreadMessageDto;

        this.dummyChatThreads[chatThreadIndex].chatThreadMessages.push(newPeerSentChatThreadMessage);
        this.dummyChatThreads[chatThreadIndex].chatThreadMessages
            = DummyChatService.sortChatThreadMessageDtoList(this.dummyChatThreads[chatThreadIndex].chatThreadMessages);

        this.dummyChatThreads[chatThreadIndex].chatThreadOverview.lastMessageContent = newPeerSentChatThreadMessage.messageContent;
        this.dummyChatThreads[chatThreadIndex].chatThreadOverview.lastMessageTime = newPeerSentChatThreadMessage.messageRegisteredAt;
    }

    public clearChatThreadHistory(chatThreadId: string): { chatThreadHistoryClearedAt: string } {
        const chatThreadHistoryClearedAt = TimeHelper.getServerFormattedTimestamp(TimeHelper.getCurrentTimestamp());

        const chatThreadIndex = this.dummyChatThreads.findIndex(chatThread => chatThread.chatThreadOverview.id === chatThreadId);

        this.dummyChatThreads[chatThreadIndex].chatThreadMessages = [];
        this.dummyChatThreads[chatThreadIndex].chatThreadOverview.chatThreadHistoryClearedAt = chatThreadHistoryClearedAt
        this.dummyChatThreads[chatThreadIndex].chatThreadOverview.numberOfUnseenMessages = 0;
        this.dummyChatThreads[chatThreadIndex].chatThreadOverview.lastMessageContent = null;
        this.dummyChatThreads[chatThreadIndex].chatThreadOverview.lastMessageTime = null;
        this.dummyChatThreads[chatThreadIndex].chatThreadOverview.lastSeenByChatterMessageId = null;
        this.dummyChatThreads[chatThreadIndex].chatThreadOverview.lastSeenByPeerMessageId = null;

        const peerChatterDtoIndex = this.dummyChatters.findIndex(chatter =>
            chatter.chatterOverview.id === this.dummyChatThreads[chatThreadIndex].chatThreadOverview.chatterOverview.id);
        this.dummyChatters[peerChatterDtoIndex].sharedFiles = [];

        return {
            chatThreadHistoryClearedAt: chatThreadHistoryClearedAt
        };
    }

    public updateLastSeenByChatterMessageId(chatThreadId: string, newLastSeenByChatterMessageId: string): ChatThreadMessageDto {
        const targetChatThreadIndex = this.dummyChatThreads.findIndex(chatThread => chatThread.chatThreadOverview.id === chatThreadId);
        
        const newLastSeenByChatterMessage = this.dummyChatThreads[targetChatThreadIndex].chatThreadMessages
            .find(chatThreadMessage => chatThreadMessage.id === newLastSeenByChatterMessageId);
        if (newLastSeenByChatterMessage === undefined) {
            throw Error("updateLastSeenByChatterMessageId - target message does not exist!");
        }

        const currentLastSeenByChatterMessageId = this.dummyChatThreads[targetChatThreadIndex].chatThreadOverview.lastSeenByChatterMessageId;
        if (currentLastSeenByChatterMessageId === null) {
            this.dummyChatThreads[targetChatThreadIndex].chatThreadOverview.lastSeenByChatterMessageId = newLastSeenByChatterMessageId;
            return newLastSeenByChatterMessage;
        }
        
        const chatThreadMessageList = this.dummyChatThreads[targetChatThreadIndex].chatThreadMessages;
        let lastSeenByChatterMessage: ChatThreadMessageDto = null;
        for (let i = 0; chatThreadMessageList.length; i++) {
            if (chatThreadMessageList[i].id === newLastSeenByChatterMessageId) {
                this.dummyChatThreads[targetChatThreadIndex].chatThreadOverview.lastSeenByChatterMessageId = newLastSeenByChatterMessageId;
                lastSeenByChatterMessage = chatThreadMessageList[i];
                break;
            } else if (chatThreadMessageList[i].id === currentLastSeenByChatterMessageId) {
                lastSeenByChatterMessage = chatThreadMessageList[i];
                break;
            }
        }

        const { updatedIsSeenChatThreadMessageDtoList } = DummyChatService.setIsSeenValueOnChatThreadMessageDtoList(
            this.dummyChatThreads[targetChatThreadIndex].chatThreadMessages,
            lastSeenByChatterMessage.id,
            this.dummyLoggedInChatter
        );

        this.dummyChatThreads[targetChatThreadIndex].chatThreadMessages = updatedIsSeenChatThreadMessageDtoList;
        return lastSeenByChatterMessage;
    }

    public generateDummyS3PreSignedUrl(): S3PreSignedUrlDto {
        return {
            url: "./dummy_account_image",
            expiresAt: TimeHelper.getServerFormattedTimestamp(TimeHelper.addSecondsToTimeStamp(TimeHelper.getCurrentTimestamp(), 60 * 15)),
        } as S3PreSignedUrlDto;
    }

    public generateDummyS3UploadFileResponse(): S3UploadFileResponseDto {
        return {
            // NOTE: the response is Empty
        } as S3UploadFileResponseDto;
    }

    public static sortChatThreadMessageDtoList(chatThreadMessageDtoList: ChatThreadMessageDto[]): ChatThreadMessageDto[] {
        const sortedList = chatThreadMessageDtoList.sort((first, second) => {
            return TimeHelper.dateStringToTimestamp(second.messageRegisteredAt) - TimeHelper.dateStringToTimestamp(first.messageRegisteredAt);
        });
        
        return sortedList;
    }

    public static sortSharedFileDtoList(sharedFileDtoList: SharedFileDto[]): SharedFileDto[] {
        const sortedList = sharedFileDtoList.sort((first, second) => {
            return TimeHelper.dateStringToTimestamp(second.fileSharedAt) - TimeHelper.dateStringToTimestamp(first.fileSharedAt);
        });

        return sortedList;
    }

    public static sortChatThreadDtoList(chatThreadDtoList: ChatThreadDto[]): ChatThreadDto[] {
        const sortedList = chatThreadDtoList.sort((first, second) => {
            const firstLatestChatThreadActivityDate = DummyChatService.getLatestChatThreadDtoActivityDate(
                first.chatThreadOverview.chatThreadCreatedAt, first.chatThreadOverview.lastMessageTime, first.chatThreadOverview.chatThreadHistoryClearedAt
            );
            const secondLatestChatThreadActivityDate = DummyChatService.getLatestChatThreadDtoActivityDate(
                second.chatThreadOverview.chatThreadCreatedAt, second.chatThreadOverview.lastMessageTime, second.chatThreadOverview.chatThreadHistoryClearedAt
            );

            return TimeHelper.dateStringToTimestamp(secondLatestChatThreadActivityDate) - TimeHelper.dateStringToTimestamp(firstLatestChatThreadActivityDate);
        });

        return sortedList;
    }

    public static sortChatterDtoList(chatterDtoList: ChatterDto[]): ChatterDto[] {
        const getChatterOverviewFullName = (chatterOverviewDto: ChatterOverviewDto) =>
                `${chatterOverviewDto.chatterName} ${chatterOverviewDto.chatterSurname}`;

        const sortedList = chatterDtoList.sort((first, second) => {
            const firstChatterFullName = getChatterOverviewFullName(first.chatterOverview);
            const secondChatterFullName = getChatterOverviewFullName(second.chatterOverview);
            
            return firstChatterFullName.toLowerCase().localeCompare(secondChatterFullName.toLowerCase());
        });

        return sortedList;
    }

    private static generateDummyLoggedInChatter(): ChatterOverviewDto {
        return {
            id: "logged-in-chatter-id",
            chatterName: "LoggedIn",
            chatterSurname: "Chatter",
            chatterUsername: "loggedin-chatter",
            chatterImageUrl: ChatterIconImage,
            isChatterOnline: true,
            chatThreadId: null,
        } as ChatterOverviewDto;
    }

    // fileSharedByChatterId is not set in this Function. It is set in generateDummyChatThreadMessages when Files are attached to the sent Messages and the sender is known
    private static generateDummySharedFiles(): SharedFileDto[] {
        const DUMMY_NUMBER_OF_GENERATED_SHARED_FILES = 24;
        return Array.from({ length: DUMMY_NUMBER_OF_GENERATED_SHARED_FILES }, (_, index) => {
            const fileIndex = index + 1;
            return {
                fileName: `Shared File ${fileIndex}/${DUMMY_NUMBER_OF_GENERATED_SHARED_FILES}`,
                fileType: index % 2 === 0 ? SharedFileType.PNG : SharedFileType.JPEG,
                fileSharedAt: DummyChatService.getFileSharedAtDate(fileIndex),
                fileUrl: index % 2 === 0 ? DittoConsultingLogo : ChatterIconImage
            } as SharedFileDto;
        });
    }

    // NOTES:
        // chatThreadIds are assigned to null here. They are set during DUMMY_OPENED_CHAT_THREADS generation...
        // sharedFiles are not assigned yet.
    private static generateDummyChatters(): ChatterDto[] {
        const DUMMY_NUMBER_OF_EXPLICITLY_DEFINED_CHATTERS = 4;
        const DUMMY_NUMBER_OF_GENERATED_CHATTERS = 20;
        const DUMMY_TOTAL_NUMBER_OF_CHATTERS = DUMMY_NUMBER_OF_EXPLICITLY_DEFINED_CHATTERS + DUMMY_NUMBER_OF_GENERATED_CHATTERS;
        return [
            {
                chatterOverview: {
                    id: "peer-chatter-id-1",
                    chatterName: "David",
                    chatterSurname: "Dosenovic",
                    chatterUsername: "david.dosenovic",
                    chatterEmail: "david.dosenovic@gmail.com",
                    chatterImageUrl: ChatterIconImage,
                    isChatterOnline: true,
                    chatThreadId: null
                },
                sharedFiles: []
            },
            {
                chatterOverview: {
                    id: "peer-chatter-id-2",
                    chatterName: "Keyser",
                    chatterSurname: "Soze",
                    chatterUsername: "keyser.soze",
                    chatterEmail: "keyser.soze@gmail.com",
                    chatterImageUrl: null,
                    isChatterOnline: false,
                    chatThreadId: null
                },
                sharedFiles: []
            },
            {
                chatterOverview: {
                    id: "peer-chatter-id-3",
                    chatterName: "Mr.",
                    chatterSurname: "X",
                    chatterUsername: "mr.x",
                    chatterEmail: "mr.x@gmail.com",
                    chatterImageUrl: ChatterIconImage,
                    isChatterOnline: true,
                    chatThreadId: null
                },
                sharedFiles: []
            },
            {
                chatterOverview: {
                    id: "peer-chatter-id-4",
                    chatterName: "Jehova",
                    chatterSurname: "Witness",
                    chatterUsername: "jehova.witness",
                    chatterEmail: "jehova.witness@gmail.com",
                    chatterImageUrl: ChatterIconImage,
                    isChatterOnline: true,
                    chatThreadId: null
                },
                sharedFiles: []
            },
            ...Array.from({ length: DUMMY_NUMBER_OF_GENERATED_CHATTERS }, (_, index) => {
                const chatterIndex = DUMMY_NUMBER_OF_EXPLICITLY_DEFINED_CHATTERS + 1 + index;
                return {
                    chatterOverview: {
                        id: `peer-chatter-id-${chatterIndex}`,
                        chatterName: "Generated",
                        chatterSurname: `Chatter Number${chatterIndex}/${DUMMY_TOTAL_NUMBER_OF_CHATTERS}`,
                        chatterUsername: `generated.chatternumber${chatterIndex}`,
                        chatterEmail: `generated.chatternumber${chatterIndex}@gmail.com`,
                        chatterImageUrl: index % 2 === 0 ? ChatterIconImage : DittoConsultingLogo,
                        isChatterOnline: index % 3 === 0 ? true : false,
                        chatThreadId: null
                    },
                    sharedFiles: []
                } as ChatterDto
            })
        ] as ChatterDto[];
    }

    // NOTE: isMessageSeen Prop on chatThreadMessages is not set here. It is set when ChatThreads are defined and messages generated and assigned to the ChatThreads
    private static generateDummyChatThreadMessages(chatterId: string, numberOfMessages: number, generatedDummyLoggedInChatter: ChatterOverviewDto, generatedDummySharedFiles: SharedFileDto[]): ChatThreadMessageDto[] {
        return Array.from({ length: numberOfMessages }, (_, index) => {
            const messageSenderChatterId = index % 2 === 0
                ? generatedDummyLoggedInChatter.id
                : chatterId;
            
            const attachedFile = index === 0
                ? generatedDummySharedFiles[index] : null;
            if (attachedFile !== null) {
                attachedFile.fileSharedByChatterId = messageSenderChatterId;
            }

            const messageIndex = index + 1;
            return {
                id: `message-from-chatter-${messageSenderChatterId}-randomguid-${CryptoHelper.generateUuid()}`,
                messageSenderId: messageSenderChatterId,
                messageContent: index % 4 === 0
                    ? `DummyMessage ${messageIndex}/${numberOfMessages}: Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since 1966, when designers at Letraset and James Mosley, the librarian at St Bride Printing Library in London, took a 1914 Cicero translation and scrambled it to make dummy text for Letraset's Body Type sheets. It has survived not only many decades, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised thanks to these sheets and more recently with desktop publishing software like Aldus PageMaker and Microsoft Word including versions of Lorem Ipsum`
                    : `DummyMessage: ${messageIndex}/${numberOfMessages}`,
                attachedFile: attachedFile,
                messageRegisteredAt: attachedFile !== null ? attachedFile.fileSharedAt : DummyChatService.getMessageRegisteredAtDate(messageIndex)
            } as ChatThreadMessageDto;
        });
    }

    // NOTES:
        // chatThreadIds are set on ChatterDtos
        // sharedFiles are set on ChatterDtos
        // isMessageSeen is set on ChatThreadMessages
    private static generateDummyChatThreads(generatedDummyLoggedInChatter: ChatterOverviewDto, generatedDummySharedFiles: SharedFileDto[], generatedDummyChatters: ChatterDto[]): ChatThreadDto[] {
        const DUMMY_NUMBER_OF_GENERATED_OPENED_CHAT_THREADS = 14;
        return Array.from({ length: DUMMY_NUMBER_OF_GENERATED_OPENED_CHAT_THREADS }, (_, index) => {
            // Setting chatThreadIds on ChatterDtos
            generatedDummyChatters[index].chatterOverview.chatThreadId = `chat-thread-id-${index + 1}`;

            const numberOfMessagesExchangedInChatThread = DUMMY_NUMBER_OF_GENERATED_OPENED_CHAT_THREADS - index;
            const exchangedChatMessages =
                DummyChatService.generateDummyChatThreadMessages(
                    generatedDummyChatters[index].chatterOverview.id, numberOfMessagesExchangedInChatThread, generatedDummyLoggedInChatter, generatedDummySharedFiles);
            const sortedExchangedChatThreadMessages = DummyChatService.sortChatThreadMessageDtoList(exchangedChatMessages);

            // Setting sharedFiles on ChatterDtos
            const sharedFilesWithinChatThread = sortedExchangedChatThreadMessages
                .filter(chatThreadMessage => chatThreadMessage.attachedFile !== null)
                .map(chatThreadMessage => chatThreadMessage.attachedFile);
            const sortedSharedFilesWithinChatThread = DummyChatService.sortSharedFileDtoList(sharedFilesWithinChatThread);
            generatedDummyChatters[index].sharedFiles = sortedSharedFilesWithinChatThread;

            // determining lastSeen Message by Chatter following Pattern receivedMesages[chatThreadIndex % receivedMesages.length]
            const receivedMesages
                = sortedExchangedChatThreadMessages.filter(
                    message => message.messageSenderId !== generatedDummyLoggedInChatter.id);
            const lastSeenMessageByChatter = receivedMesages.length > 0
                ? receivedMesages[index % receivedMesages.length]
                : null;

            // determining lastSeen Message by Peer following Pattern receivedMesages[chatThreadIndex % sentMessages.length]
            const sentMessages
                = sortedExchangedChatThreadMessages.filter(message => message.messageSenderId === generatedDummyLoggedInChatter.id);
            const lastSeenMessageByPeer = sentMessages.length > 0
                ? sentMessages[index % sentMessages.length]
                : null;

            // determining lastMessage Time and Content
            const lastMessageContent = sortedExchangedChatThreadMessages.length > 0
                ? sortedExchangedChatThreadMessages[0].messageContent
                : null;
            const lastMessageTime = sortedExchangedChatThreadMessages.length > 0
                ? sortedExchangedChatThreadMessages[0].messageRegisteredAt
                : null;

            // setting isMessageSeen Property on ChatThreadMessages
            const { updatedIsSeenChatThreadMessageDtoList, numberOfUnseenMessages}
                = DummyChatService.setIsSeenValueOnChatThreadMessageDtoList(
                    sortedExchangedChatThreadMessages,
                    lastSeenMessageByChatter !== null ? lastSeenMessageByChatter.id : null,
                    generatedDummyLoggedInChatter
                );

            return {
                chatThreadOverview: {
                    id: `chat-thread-id-${index + 1}`,
                    chatterOverview: generatedDummyChatters[index].chatterOverview,
                    chatThreadCreatedAt: lastMessageTime !== null
                        ? updatedIsSeenChatThreadMessageDtoList[updatedIsSeenChatThreadMessageDtoList.length - 1].messageRegisteredAt
                        : `2026-01-01 09:42:00`,
                    lastMessageContent: lastMessageContent,
                    lastMessageTime: lastMessageTime,
                    numberOfUnseenMessages: numberOfUnseenMessages,
                    lastSeenByChatterMessageId: lastSeenMessageByChatter !== null ? lastSeenMessageByChatter.id : null,
                    lastSeenByPeerMessageId: lastSeenMessageByPeer !== null ? lastSeenMessageByPeer.id : null,
                    chatThreadHistoryClearedAt: null
                },
                chatThreadMessages: updatedIsSeenChatThreadMessageDtoList
            } as ChatThreadDto;
        });
    }

    private static setIsSeenValueOnChatThreadMessageDtoList(chatThreadMessageDtoList: ChatThreadMessageDto[], lastSeenByChatterMessageId: string | null, generatedDummyLoggedInChatter: ChatterOverviewDto): {
        updatedIsSeenChatThreadMessageDtoList: ChatThreadMessageDto[], numberOfUnseenMessages: number} {    

        let isChatThreadMessageNewerThanLastSeen = true;
        const sortedChatThreadMessageDtoList = DummyChatService.sortChatThreadMessageDtoList(chatThreadMessageDtoList);
        const resultChatThreadMessageList = sortedChatThreadMessageDtoList.map(chatThreadMessage => {
            if (chatThreadMessage.messageSenderId === generatedDummyLoggedInChatter.id) {   // this case prevents SENDING and FAILED messages from being considered
                chatThreadMessage.isMessageSeen = true;
                return chatThreadMessage;
            }

            if (isChatThreadMessageNewerThanLastSeen === false) {
                chatThreadMessage.isMessageSeen = true;
                return chatThreadMessage;
            }

            if (chatThreadMessage.id === lastSeenByChatterMessageId) {
                isChatThreadMessageNewerThanLastSeen = false;
                chatThreadMessage.isMessageSeen = true;
                return chatThreadMessage;
            }

            // chatThreadMessage is Received and is after the Last Seen (message is unseen)
            chatThreadMessage.isMessageSeen = false;
            return chatThreadMessage;
        });

        return {
            updatedIsSeenChatThreadMessageDtoList: resultChatThreadMessageList,
            numberOfUnseenMessages: resultChatThreadMessageList.filter(chatThreadMessage => chatThreadMessage.isMessageSeen === false).length
        };
    }

    private static getFileSharedAtDate(fileIndex: number): string {
        return `2026-04-${fileIndex} 05:${fileIndex}:00`;
    }

    private static getMessageRegisteredAtDate(messageIndex: number): string {
        return `2026-05-${messageIndex} 05:${messageIndex}:00`;
    }

    private static getLatestChatThreadDtoActivityDate(chatThreadCreatedAt: string, lastMessageTime: string | null, chatThreadHistoryClearedAt: string | null): string {
        const chatThreadActivitiyTimestamps = [TimeHelper.dateStringToTimestamp(chatThreadCreatedAt)];
        if (lastMessageTime !== null) {
            chatThreadActivitiyTimestamps.push(TimeHelper.dateStringToTimestamp(lastMessageTime));
        }

        if (chatThreadHistoryClearedAt !== null) {
            chatThreadActivitiyTimestamps.push(TimeHelper.dateStringToTimestamp(chatThreadHistoryClearedAt));
        }
        
        return TimeHelper.getServerFormattedTimestamp(Math.max(...chatThreadActivitiyTimestamps));
    }
}
