import ChatterOverview from "./ChatterOverview";

export default class ChatThreadOverview {
    private id: string;
    private chatter: ChatterOverview;
    private numberOfUnseenMessages: number;
    private lastMessageTime: string | null;
    private lastMessage: string | null;

    public constructor(
        id: string,
        chatter: ChatterOverview,
        numberOfUnseenMessages: number,
        lastMessageTime: string | null,
        lastMessage: string | null,
    ) {
        this.id = id;
        this.chatter = chatter;
        this.numberOfUnseenMessages = numberOfUnseenMessages;
        this.lastMessageTime = lastMessageTime;
        this.lastMessage = lastMessage;
    }

    public getId(): string {
        return this.id;
    }

    public getChatter(): ChatterOverview {
        return this.chatter;
    }

    public getNumberOfUnseenMessages(): number {
        return this.numberOfUnseenMessages;
    }

    public getLastMessageTime(): string | null {
        return this.lastMessageTime;
    }

    public getLastMessage(): string | null {
        return this.lastMessage;
    }
}
