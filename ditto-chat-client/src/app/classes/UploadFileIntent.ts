import { SharedFileType } from "../enums/SharedFileType";
import { FilePurpose } from "../enums/FilePurpose";

export default class UploadFileIntent {
    private fileName: string;
    private fileType: SharedFileType;
    private fileSize: number;
    private filePurpose: FilePurpose;        

    public constructor(fileName: string, fileType: SharedFileType, fileSize: number, filePurpose: FilePurpose) {
        this.fileName = fileName;
        this.fileType = fileType;
        this.fileSize = fileSize;
        this.filePurpose = filePurpose;
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

    public getFilePurpose(): FilePurpose {
        return this.filePurpose;
    }
}
