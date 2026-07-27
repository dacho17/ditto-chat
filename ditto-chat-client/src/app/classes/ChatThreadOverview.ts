import ChatterOverview from "./ChatterOverview";

export default class ChatThreadOverview {
    private id: string;
    private chatterOverview: ChatterOverview;
    private chatThreadCreatedAtTimestamp: number;
    private numberOfUnseenMessages: number;
    private lastMessageTimestamp: number | null;
    private lastMessage: string | null;

    public constructor(
        id: string,
        chatterOverview: ChatterOverview,
        chatThreadCreatedAtTimestamp: number,
        numberOfUnseenMessages: number,
        lastMessageTimestamp: number | null,
        lastMessage: string | null,
    ) {
        this.id = id;
        this.chatterOverview = chatterOverview;
        this.chatThreadCreatedAtTimestamp = chatThreadCreatedAtTimestamp;
        this.numberOfUnseenMessages = numberOfUnseenMessages;
        this.lastMessageTimestamp = lastMessageTimestamp;
        this.lastMessage = lastMessage;
    }

    public getId(): string {
        return this.id;
    }

    public getChatterOverview(): ChatterOverview {
        return this.chatterOverview;
    }

    public getChatThreadCreatedAtTimestamp(): number {
        return this.chatThreadCreatedAtTimestamp;
    }

    public getNumberOfUnseenMessages(): number {
        return this.numberOfUnseenMessages;
    }

    public setNumberOfUnseenMessages(numberOfUnseenMessages: number): void {
        this.numberOfUnseenMessages = numberOfUnseenMessages;
    }

    public getLastMessageTimestamp(): number | null {
        return this.lastMessageTimestamp;
    }

    public setLastMessageTimestamp(lastMessageTimestamp: number): void {
        this.lastMessageTimestamp = lastMessageTimestamp;
    }

    public getLastMessage(): string | null {
        return this.lastMessage;
    }

    public setLastMessage(lastMessage: string): void {
        this.lastMessage = lastMessage;
    }
}
