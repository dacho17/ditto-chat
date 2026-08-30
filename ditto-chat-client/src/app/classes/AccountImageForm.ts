export default class AccountImageForm {
    private accountImageFileS3ObjectKey: string;

    public constructor(accountImageFileS3ObjectKey: string) {
        this.accountImageFileS3ObjectKey = accountImageFileS3ObjectKey;
    }

    public getAccountImageFileS3ObjectKey(): string {
        return this.accountImageFileS3ObjectKey;
    }
}
