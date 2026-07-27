export default class UploadFileIntent {
    private fileName: string;
    private fileType: string;

    public constructor(fileName: string, fileType: string) {
        this.fileName = fileName;
        this.fileType = fileType;
    }
    
    public getFileName(): string {
        return this.fileName;
    }

    public getFileType(): string {
        return this.fileType;
    }
}
