export default class ChatterOverview {
    private id: string;
    private chatterName: string;
    private chatterSurname: string;
    private chatterUsername: string;
    private chatterEmail: string;
    private chatterImageUrl: string | null;
    private isChatterOnline: boolean;
    private chatThreadId: string | null;

    public constructor(
        id: string,
        chatterName: string,
        chatterSurname: string,
        chatterUsername: string,
        chatterEmail: string,
        chatterImageUrl: string | null,
        isChatterOnline: boolean,
        chatThreadId: string | null
    ) {
        this.id = id;
        this.chatterName = chatterName;
        this.chatterSurname = chatterSurname;
        this.chatterUsername = chatterUsername;
        this.chatterEmail = chatterEmail;
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

    public getChatterEmail(): string {
        return this.chatterEmail;
    }

    public getChatterImageUrl(): string | null{
        return this.chatterImageUrl;
    }

    public setChatterImageUrl(chatterImageUrl: string): void {
        this.chatterImageUrl = chatterImageUrl;
    }

    public getIsChatterOnline(): boolean {
        return this.isChatterOnline;
    }

    public getChatThreadId(): string | null {
        return this.chatThreadId;
    }

    public static getShallowCopy(chatterOverview: ChatterOverview): ChatterOverview {
        return new ChatterOverview(
            chatterOverview.id,
            chatterOverview.chatterName,
            chatterOverview.chatterSurname,
            chatterOverview.chatterUsername,
            chatterOverview.chatterEmail,
            chatterOverview.chatterImageUrl,
            chatterOverview.isChatterOnline,
            chatterOverview.chatThreadId
        );
    }
}
