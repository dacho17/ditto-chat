import ChatterOverview from "./ChatterOverview";

export default class ChatThreadOverview {
    private id: string;
    private chatterOverview: ChatterOverview;
    private chatThreadCreatedAtTimestamp: number;
    private numberOfUnseenMessages: number;
    private lastMessageTimestamp: number | null;
    private lastMessage: string | null;
    private lastSeenByChatterMessageId: string | null;
    private lastSeenByPeerMessageId: string | null;
    private chatThreadHistoryClearedAtTimestamp: number | null;

    public constructor(
        id: string,
        chatterOverview: ChatterOverview,
        chatThreadCreatedAtTimestamp: number,
        numberOfUnseenMessages: number,
        lastMessageTimestamp: number | null,
        lastMessage: string | null,
        lastSeenByChatterMessageId: string | null,
        lastSeenByPeerMessageId: string | null,
        chatThreadHistoryClearedAtTimestamp: number | null
    ) {
        this.id = id;
        this.chatterOverview = chatterOverview;
        this.chatThreadCreatedAtTimestamp = chatThreadCreatedAtTimestamp;
        this.numberOfUnseenMessages = numberOfUnseenMessages;
        this.lastMessageTimestamp = lastMessageTimestamp;
        this.lastMessage = lastMessage;
        this.lastSeenByChatterMessageId = lastSeenByChatterMessageId;
        this.lastSeenByPeerMessageId = lastSeenByPeerMessageId;
        this.chatThreadHistoryClearedAtTimestamp = chatThreadHistoryClearedAtTimestamp;
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

    public getLastSeenByChatterMessageId(): string | null {
        return this.lastSeenByChatterMessageId;
    }

    public setLastSeenByChatterMessageId(lastSeenByChatterMessageId: string): void {
        this.lastSeenByChatterMessageId = lastSeenByChatterMessageId;
    }

    public getLastSeenByPeerMessageId(): string | null {
        return this.lastSeenByPeerMessageId;
    }

    public setLastSeenByPeerMessageId(lastSeenByPeerMessageId: string): void {
        this.lastSeenByPeerMessageId = lastSeenByPeerMessageId;
    }

    public getChatThreadHistoryClearedAtTimestamp(): number | null {
        return this.chatThreadHistoryClearedAtTimestamp;
    }

    public setChatThreadHistoryClearedAtTimestamp(chatThreadHistoryClearedAtTimestamp: number): void {
        this.chatThreadHistoryClearedAtTimestamp = chatThreadHistoryClearedAtTimestamp;
    }

    public getLatestChatThreadActivityTimestamp(): number | null {
        const setTimestamps = [this.chatThreadCreatedAtTimestamp];
        if (this.lastMessageTimestamp !== null) {
            setTimestamps.push(this.lastMessageTimestamp);
        }

        if (this.chatThreadHistoryClearedAtTimestamp !== null) {
            setTimestamps.push(this.chatThreadHistoryClearedAtTimestamp);
        }
        
        return Math.max(...setTimestamps);
    }
}
