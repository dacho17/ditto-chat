export default class SharedFile {
    private fileName: string;
    private fileUrl: string;
    private fileSharedAtTimstamp: number;

    public constructor(fileName: string, fileUrl: string, fileSharedAtTimstamp: number) {
        this.fileName = fileName;
        this.fileUrl = fileUrl;
        this.fileSharedAtTimstamp = fileSharedAtTimstamp;
    }
    
    public getFileName(): string {
        return this.fileName;
    }

    public getFileUrl(): string {
        return this.fileUrl;
    }

    public getFileSharedAtTimestamp(): number {
        return this.fileSharedAtTimstamp;
    }
}
