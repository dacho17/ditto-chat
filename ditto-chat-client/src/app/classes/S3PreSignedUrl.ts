export default class S3PreSignedUrl {
    private url: string;
    private expiresAtTimestamp: number;

    public constructor(url: string, expiresAtTimestamp: number) {
        this.url = url;
        this.expiresAtTimestamp = expiresAtTimestamp;
    }

    public getUrl(): string {
        return this.url;
    }

    public getExpiresAtTimestamp(): number {
        return this.expiresAtTimestamp;
    }
}
