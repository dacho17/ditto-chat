import { ChatThreadMessageStatus } from "../enums/ChatThreadMessageStatus";

export default class ChatThreadMessage {
    private clientRef: string | null;
    private status: ChatThreadMessageStatus;
    private id: string | null;
    private messageSenderId: string;
    private messageContent: string;
    private messageTimestamp: number;
    private isMessageSeen: boolean;

    public constructor(
        status: ChatThreadMessageStatus,
        messageSenderId: string,
        messageContent: string,
        messageTimestamp: number,
        isMessageSeen: boolean,
    ) {
        this.status = status;
        this.messageSenderId = messageSenderId;
        this.messageContent = messageContent;
        this.messageTimestamp = messageTimestamp;
        this.isMessageSeen = isMessageSeen;
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

    public getMessageTimestamp(): number {
        return this.messageTimestamp;
    }

    public getIsMessageSeen(): boolean {
        return this.isMessageSeen;
    }

    public setIsMessageSeen(isMessageSeen: boolean): void {
        this.isMessageSeen = isMessageSeen;
    }

    public isMessageReceived(loggedInChatterId: string): boolean {
        return this.messageSenderId !== loggedInChatterId;
    }
}
