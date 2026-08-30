import { SharedFileType } from "../enums/SharedFileType";

export default interface SharedFileDto {
    fileName: string;
    sharedFileType: SharedFileType;
    fileUrl: string;
    fileSharedAt: string;
    fileSharedByChatterId: string;
}
