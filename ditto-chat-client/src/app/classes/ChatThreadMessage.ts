import SharedFile from "./SharedFile";
import { ChatThreadMessageStatus } from "../enums/ChatThreadMessageStatus";

export default class ChatThreadMessage {
    private clientRef: string | null;
    private status: ChatThreadMessageStatus;
    private id: string | null;
    private messageSenderId: string;
    private messageContent: string;
    private attachedFile: SharedFile | null;
    private messageTimestamp: number;
    private isMessageReceived: boolean;
    private isMessageSeen: boolean;
    private isAttachingFile: boolean;

    private constructor(
        clientRef: string | null,
        status: ChatThreadMessageStatus,
        id: string | null,
        messageSenderId: string,
        messageContent: string,
        attachedFile: SharedFile | null,
        messageTimestamp: number,
        isMessageReceived: boolean,
        isMessageSeen: boolean,
        isAttachingFile: boolean

    ) {
        this.clientRef = clientRef;
        this.status = status;
        this.id = id;
        this.messageSenderId = messageSenderId;
        this.messageContent = messageContent;
        this.attachedFile = attachedFile;
        this.messageTimestamp = messageTimestamp;
        this.isMessageReceived = isMessageReceived;
        this.isMessageSeen = isMessageSeen;
        this.isAttachingFile = isAttachingFile;
    }

    // called when mapping ChatThreadMessageDto received from the Server
    public static createChatThreadMessageFromDto(
        id: string,
        messageSenderId: string,
        messageContent: string,
        attachedFile: SharedFile | null,
        messageTimestamp: number,
        isMessageReceived: boolean,
        isMessageSeen: boolean
    ): ChatThreadMessage {
        return new ChatThreadMessage(
            null, ChatThreadMessageStatus.CONFIRMED, id, messageSenderId, messageContent, attachedFile, messageTimestamp, isMessageReceived, isMessageSeen, false
        );
    }

    // called when sending ChatThreadMessage (creating brand new message)
    public static createNewChatThreadMessage(
        clientRef: string,
        messageSenderId: string,
        messageContent: string,
        attachedFile: SharedFile | null,
        messageTimestamp: number,
        isAttachingFile: boolean,
    ): ChatThreadMessage {
        return new ChatThreadMessage(
            clientRef, ChatThreadMessageStatus.SENDING, null, messageSenderId, messageContent, attachedFile, messageTimestamp, false, true, isAttachingFile
        );
    }

    public getClientRef(): string | null {
        return this.clientRef;
    }

    public setClientRef(clientRef: string): void {
        this.clientRef = clientRef;
    }

    public getStatus(): ChatThreadMessageStatus {
        return this.status;
    }

    public setStatus(status: ChatThreadMessageStatus): void {
        this.status = status;
    }

    public getId(): string | null {
        return this.id;
    }

    public setId(id: string): void {
        this.id = id;
    }

    public getMessageSenderId(): string {
        return this.messageSenderId;
    }

    public getMessageContent(): string {
        return this.messageContent;
    }

    public getAttachedFile(): SharedFile | null {
        return this.attachedFile;
    }

    public setAttachedFile(attachedFile: SharedFile): void {
        this.attachedFile = attachedFile;
    }

    public getMessageTimestamp(): number {
        return this.messageTimestamp;
    }

    public setMessageTimestamp(messageTimestamp: number): void {
        this.messageTimestamp = messageTimestamp;
    }

    public getIsMessageReceived(): boolean {
        return this.isMessageReceived;
    }

    public getIsMessageSeen(): boolean {
        return this.isMessageSeen;
    }

    public setIsMessageSeen(isMessageSeen: boolean): void {
        this.isMessageSeen = isMessageSeen;
    }

    public getIsAttachingFile(): boolean {
        return this.isAttachingFile;
    }

    public setIsAttachingFile(isAttachingFile: boolean): void {
        this.isAttachingFile = isAttachingFile;
    }
}
