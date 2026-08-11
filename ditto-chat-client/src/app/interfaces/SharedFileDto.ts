import { SharedFileType } from "../enums/SharedFileType";

export default interface SharedFileDto {
    fileName: string;
    fileType: SharedFileType;
    fileUrl: string;
    fileSharedAt: string;
    fileSharedByChatterId: string;
}
