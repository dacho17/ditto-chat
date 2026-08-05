export default class UploadFileIntent {
    private fileName: string;
    private fileType: string;
    private fileSize: number;

    public constructor(fileName: string, fileType: string, fileSize: number) {
        this.fileName = fileName;
        this.fileType = fileType;
        this.fileSize = fileSize;
    }
    
    public getFileName(): string {
        return this.fileName;
    }

    public getFileType(): string {
        return this.fileType;
    }

    public getFileSize(): number {
        return this.fileSize;
    }
}
