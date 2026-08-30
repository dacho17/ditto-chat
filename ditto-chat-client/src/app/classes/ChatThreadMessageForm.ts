export default class ChatThreadMessageForm {
    private messageContent: string;
    private attachedFileS3ObjectKey: string | null;
    private chatMessageClientRef: string;   // NOTE: sent to service, but used only on client
    private isMessageResent: boolean;       // NOTE: sent to service, but used only on client

    public constructor(
        messageContent: string,
        attachedFileS3ObjectKey: string | null,
        chatMessageClientRef: string,
        isMessageResent: boolean
    ) {
        this.messageContent = messageContent;
        this.attachedFileS3ObjectKey = attachedFileS3ObjectKey;
        this.chatMessageClientRef = chatMessageClientRef;
        this.isMessageResent = isMessageResent;
    }

    public getMessageContent(): string {
        return this.messageContent;
    }

    public getAttachedFileS3ObjectKey(): string | null {
        return this.attachedFileS3ObjectKey;
    }

    public getChatMessageClientRef(): string {
        return this.chatMessageClientRef;
    }

    public getIsMessageResent(): boolean {
        return this.isMessageResent;
    }
}
