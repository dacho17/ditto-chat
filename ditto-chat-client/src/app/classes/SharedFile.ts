import { SharedFileType } from "../enums/SharedFileType";

export default class SharedFile {
    private fileName: string;
    private fileType: SharedFileType;
    private fileUrl: string;
    private fileSharedAtTimstamp: number | null; // can be unknown when sharedFile is initially created in /chat and while confirmation from server has not yet arrived
    private fileSharedByChatterId: string;

    public constructor(fileName: string, fileType: SharedFileType, fileUrl: string, fileSharedAtTimstamp: number | null, fileSharedByChatterId: string) {
        this.fileName = fileName;
        this.fileType = fileType;
        this.fileUrl = fileUrl;
        this.fileSharedAtTimstamp = fileSharedAtTimstamp;
        this.fileSharedByChatterId = fileSharedByChatterId;
    }
    
    public getFileName(): string {
        return this.fileName;
    }

    public getFileType(): SharedFileType {
        return this.fileType;
    }

    public getFileUrl(): string {
        return this.fileUrl;
    }

    public getFileSharedAtTimestamp(): number | null {
        return this.fileSharedAtTimstamp;
    }

    public getFileSharedByChatterId(): string {
        return this.fileSharedByChatterId;
    }
}
