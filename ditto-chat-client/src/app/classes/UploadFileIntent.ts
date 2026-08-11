import { SharedFileType } from "../enums/SharedFileType";

export default class UploadFileIntent {
    private fileName: string;
    private fileType: SharedFileType;
    private fileSize: number;

    public constructor(fileName: string, fileType: SharedFileType, fileSize: number) {
        this.fileName = fileName;
        this.fileType = fileType;
        this.fileSize = fileSize;
    }
    
    public getFileName(): string {
        return this.fileName;
    }

    public getFileType(): SharedFileType {
        return this.fileType;
    }

    public getFileSize(): number {
        return this.fileSize;
    }
}
