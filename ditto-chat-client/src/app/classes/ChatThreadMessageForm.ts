export default class ChatThreadMessageForm {
    private message: string;
    private chatMessageClientRef: string;  // NOTE: sent to service, but used only on client
    private isMessageResent: boolean;

    public constructor(
        message: string,
        chatMessageClientRef: string,
        isMessageResent: boolean
    ) {
        this.message = message;
        this.chatMessageClientRef = chatMessageClientRef;
        this.isMessageResent = isMessageResent;
    }

    public getMessage(): string {
        return this.message;
    }

    public getChatMessageClientRef(): string {
        return this.chatMessageClientRef;
    }

    public getIsMessageResent(): boolean {
        return this.isMessageResent;
    }
}
