export default class SharedFile {
    private fileName: string;
    private fileUrl: string;

    public constructor(fileName: string, fileUrl: string) {
        this.fileName = fileName;
        this.fileUrl = fileUrl;
    }
    
    public getFileName(): string {
        return this.fileName;
    }

    public getFileUrl(): string {
        return this.fileUrl;
    }
}
