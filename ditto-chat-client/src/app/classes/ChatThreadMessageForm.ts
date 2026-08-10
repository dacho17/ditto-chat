import SharedFile from "./SharedFile";

export default class ChatThreadMessageForm {
    private message: string;
    private attachedFile: SharedFile | null;
    private chatMessageClientRef: string;  // NOTE: sent to service, but used only on client
    private isMessageResent: boolean;

    public constructor(
        message: string,
        attachedFile: SharedFile | null,
        chatMessageClientRef: string,
        isMessageResent: boolean
    ) {
        this.message = message;
        this.attachedFile = attachedFile;
        this.chatMessageClientRef = chatMessageClientRef;
        this.isMessageResent = isMessageResent;
    }

    public getMessage(): string {
        return this.message;
    }

    public getAttachedFile(): SharedFile | null {
        return this.attachedFile;
    }

    public getChatMessageClientRef(): string {
        return this.chatMessageClientRef;
    }

    public getIsMessageResent(): boolean {
        return this.isMessageResent;
    }
}
