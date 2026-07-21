import { ChatThreadMessageStatus } from "../enums/ChatThreadMessageStatus";

export default class ChatThreadMessage {
    private clientRef: string | null;
    private status: ChatThreadMessageStatus;
    private id: string | null;
    private messageSenderId: string;
    private messageContent: string;
    private messageTime: string;
    private isMessageReceived: boolean;
    private isMessageSeen: boolean;

    public constructor(
        status: ChatThreadMessageStatus,
        messageSenderId: string,
        messageContent: string,
        messageTime: string,
        isMessageReceived: boolean,
        isMessageSeen: boolean,
    ) {
        this.status = status;
        this.messageSenderId = messageSenderId;
        this.messageContent = messageContent;
        this.messageTime = messageTime;
        this.isMessageReceived = isMessageReceived;
        this.isMessageSeen = isMessageSeen;
    }

    public getClientRef(): string | null {
        return this.clientRef;
    }

    public setClientRef(clientRef: string): void {
        this.clientRef = clientRef;
    }

    public getStatus(): string {
        return this.status;
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

    public getMessageTime(): string {
        return this.messageTime;
    }

    public getIsMessageReceived(): boolean {
        return this.isMessageReceived;
    }

    public getIsMessageSeen(): boolean {
        return this.isMessageSeen;
    }
}
