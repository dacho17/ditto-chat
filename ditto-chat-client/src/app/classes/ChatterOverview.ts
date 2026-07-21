export default class ChatterOverview {
    private chatterName: string;
    private chatterSurname: string;
    private chatterUsername: string;
    private chatterImageUrl: string;
    private isChatterOnline: boolean;

    public constructor(
        chatterName: string,
        chatterSurname: string,
        chatterUsername: string,
        chatterImageUrl: string,
        isChatterOnline: boolean,
    ) {
        this.chatterName = chatterName;
        this.chatterSurname = chatterSurname;
        this.chatterUsername = chatterUsername;
        this.chatterImageUrl = chatterImageUrl;
        this.isChatterOnline = isChatterOnline;
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
}
