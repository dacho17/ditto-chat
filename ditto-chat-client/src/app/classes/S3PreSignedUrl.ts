export default class S3PreSignedUrl {
    private s3ObjectKey: string;
    private url: string;
    private expiresAtTimestamp: number;

    public constructor(s3ObjectKey: string, url: string, expiresAtTimestamp: number) {
        this.s3ObjectKey = s3ObjectKey;
        this.url = url;
        this.expiresAtTimestamp = expiresAtTimestamp;
    }

    public getS3ObjectKey(): string {
        return this.s3ObjectKey;
    }

    public getUrl(): string {
        return this.url;
    }

    public getExpiresAtTimestamp(): number {
        return this.expiresAtTimestamp;
    }
}
