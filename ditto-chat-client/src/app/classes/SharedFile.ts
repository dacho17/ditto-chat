export default class SharedFile {
    private fileName: string;
    private fileUrl: string;
    private fileSharedAtTimstamp: number | null; // can be unknown when sharedFile is initially created in /chat and while confirmation from server has not yet arrived

    public constructor(fileName: string, fileUrl: string, fileSharedAtTimstamp: number | null) {
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

    public getFileSharedAtTimestamp(): number | null {
        return this.fileSharedAtTimstamp;
    }
}
