import TimeHelper from "./TimeHelper";
import Chatter from "../classes/Chatter";
import ChatterOverview from "../classes/ChatterOverview";
import ChatThread from "../classes/ChatThread";
import ChatThreadMessage from "../classes/ChatThreadMessage";
import ChatThreadOverview from "../classes/ChatThreadOverview";
import SharedFile from "../classes/SharedFile";
import S3PreSignedUrl from "../classes/S3PreSignedUrl";
import ChatterDto from "../interfaces/ChatterDto";
import ChatterOverviewDto from "../interfaces/ChatterOverviewDto";
import ChatThreadDto from "../interfaces/ChatThreadDto";
import ChatThreadOverviewDto from "../interfaces/ChatThreadOverviewDto";
import ChatThreadMessageDto from "../interfaces/ChatThreadMessageDto";
import SharedFileDto from "../interfaces/SharedFileDto";
import S3PreSignedUrlDto from "../interfaces/S3PreSignedUrlDto";
import { SharedFileType } from "../enums/SharedFileType";
import CONSTANTS from "../../Constants";


export default class Mapper {
    public static chatterOverviewFromDto(chatterOverviewDto: ChatterOverviewDto): ChatterOverview {
        return new ChatterOverview(
            chatterOverviewDto.id,
            chatterOverviewDto.chatterName,
            chatterOverviewDto.chatterSurname,
            chatterOverviewDto.chatterUsername,
            chatterOverviewDto.chatterEmail,
            chatterOverviewDto.chatterImageUrl,
            chatterOverviewDto.isChatterOnline,
            Mapper.getValueOrNull(chatterOverviewDto.chatThreadId)
        );
    }

    public static chatThreadOverviewFromDto(chatThreadOverviewDto: ChatThreadOverviewDto): ChatThreadOverview {
        return new ChatThreadOverview(
            chatThreadOverviewDto.id,
            Mapper.chatterOverviewFromDto(chatThreadOverviewDto.chatterOverview),
            TimeHelper.dateStringToTimestamp(chatThreadOverviewDto.chatThreadCreatedAt),
            chatThreadOverviewDto.numberOfUnseenMessages,
            Mapper.getValueOrNull(chatThreadOverviewDto.lastMessageTime) !== null
                ? TimeHelper.dateStringToTimestamp(chatThreadOverviewDto.lastMessageTime) : null,
            Mapper.getValueOrNull(chatThreadOverviewDto.lastMessageContent),
            chatThreadOverviewDto.lastSeenByChatterMessageId,
            chatThreadOverviewDto.lastSeenByPeerMessageId,
            Mapper.getValueOrNull(chatThreadOverviewDto.chatThreadHistoryClearedAt) !== null
                ? TimeHelper.dateStringToTimestamp(chatThreadOverviewDto.chatThreadHistoryClearedAt) : null
        );
    }

    public static chatterFromDto(chatterDto: ChatterDto): Chatter {
        return new Chatter(
            Mapper.chatterOverviewFromDto(chatterDto.chatterOverview),
            chatterDto.sharedFiles.map(sharedFileDto => Mapper.sharedFileFromDto(sharedFileDto))
        );
    }

    public static sharedFileFromDto(sharedFileDto: SharedFileDto): SharedFile {
        return new SharedFile(
            sharedFileDto.fileName,
            sharedFileDto.fileType,
            sharedFileDto.fileUrl,
            TimeHelper.dateStringToTimestamp(sharedFileDto.fileSharedAt),
            sharedFileDto.fileSharedByChatterId
        );
    }

    public static chatThreadFromDto(chatThreadDto: ChatThreadDto, loggedInChatterId: string): ChatThread {
        return new ChatThread(
            Mapper.chatThreadOverviewFromDto(chatThreadDto.chatThreadOverview),
            chatThreadDto.chatThreadMessages.map(chatThreadMessageDto => Mapper.chatThreadMessageFromDto(chatThreadMessageDto, loggedInChatterId))
        );
    }

    public static chatThreadMessageFromDto(chatThreadMessageDto: ChatThreadMessageDto, loggedInChatterId: string): ChatThreadMessage {
        return ChatThreadMessage.createChatThreadMessageFromDto(
            chatThreadMessageDto.id,
            chatThreadMessageDto.messageSenderId,
            chatThreadMessageDto.messageContent,
            Mapper.getValueOrNull(chatThreadMessageDto.attachedFile)
                ? Mapper.sharedFileFromDto(chatThreadMessageDto.attachedFile) : null,
            TimeHelper.dateStringToTimestamp(chatThreadMessageDto.messageRegisteredAt),
            loggedInChatterId !== chatThreadMessageDto.messageSenderId,
            chatThreadMessageDto.isMessageSeen
        );
    }

    public static s3PreSignedUrlFromDto(s3PreSignedUrlDto: S3PreSignedUrlDto): S3PreSignedUrl {
        return new S3PreSignedUrl(
            s3PreSignedUrlDto.url,
            TimeHelper.dateStringToTimestamp(s3PreSignedUrlDto.expiresAt)
        );
    }

    public static inputFileTypeToSharedFileType(inputFileType: string): SharedFileType {
        switch (inputFileType) {
            case CONSTANTS.INPUT_FILE_TYPE_PNG:
                return SharedFileType.PNG;
            case CONSTANTS.INPUT_FILE_TYPE_JPEG:
                return SharedFileType.JPEG;
            case CONSTANTS.INPUT_FILE_TYPE_TEXT:
                return SharedFileType.TXT;
            case CONSTANTS.INPUT_FILE_TYPE_PDF:
                return SharedFileType.PDF;
            default:
                throw new Error("Mapping should not be Called for invalid inputFileType!");
        }
    }

    private static getValueOrNull<T>(candidate: T): T | null {
        return candidate !== null && candidate !== undefined
            ? candidate : null;
    }
}
