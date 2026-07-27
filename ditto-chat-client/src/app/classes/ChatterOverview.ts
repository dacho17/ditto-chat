export default class ChatterOverview {
    private id: string;
    private chatterName: string;
    private chatterSurname: string;
    private chatterUsername: string;
    private chatterImageUrl: string;
    private isChatterOnline: boolean;
    private chatThreadId: string | null;

    public constructor(
        id: string,
        chatterName: string,
        chatterSurname: string,
        chatterUsername: string,
        chatterImageUrl: string,
        isChatterOnline: boolean,
        chatThreadId: string | null
    ) {
        this.id = id;
        this.chatterName = chatterName;
        this.chatterSurname = chatterSurname;
        this.chatterUsername = chatterUsername;
        this.chatterImageUrl = chatterImageUrl;
        this.isChatterOnline = isChatterOnline;
        this.chatThreadId = chatThreadId;
    }

    public getId(): string {
        return this.id;
    }

    public getChatterName(): string {
        return this.chatterName;
    }

    public getChatterSurname(): string {
        return this.chatterSurname;
    }

    public getChatterFullName(): string {
        return `${this.chatterName} ${this.chatterSurname}`;
    }

    public getChatterUsername(): string {
        return this.chatterUsername;
    }

    public getChatterImageUrl(): string {
        return this.chatterImageUrl;
    }

    public getIsChatterOnline(): boolean {
        return this.isChatterOnline;
    }

    public getChatThreadId(): string | null {
        return this.chatThreadId;
    }
}
