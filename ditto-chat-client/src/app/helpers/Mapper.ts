import TimeHelper from "./TimeHelper";
import Chatter from "../classes/Chatter";
import ChatterOverview from "../classes/ChatterOverview";
import ChatThread from "../classes/ChatThread";
import ChatThreadMessage from "../classes/ChatThreadMessage";
import ChatThreadOverview from "../classes/ChatThreadOverview";
import SharedFile from "../classes/SharedFile";
import ChatterDto from "../interfaces/ChatterDto";
import ChatterOverviewDto from "../interfaces/ChatterOverviewDto";
import ChatThreadDto from "../interfaces/ChatThreadDto";
import ChatThreadOverviewDto from "../interfaces/ChatThreadOverviewDto";
import ChatThreadMessageDto from "../interfaces/ChatThreadMessageDto";
import SharedFileDto from "../interfaces/SharedFileDto";


export default class Mapper {
    public static chatterOverviewFromDto(chatterOverviewDto: ChatterOverviewDto): ChatterOverview {
        return new ChatterOverview(
            chatterOverviewDto.id,
            chatterOverviewDto.chatterName,
            chatterOverviewDto.chatterSurname,
            chatterOverviewDto.chatterUsername,
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
            sharedFileDto.fileUrl,
            TimeHelper.dateStringToTimestamp(sharedFileDto.fileSharedAt)
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

    private static getValueOrNull<T>(candidate: T): T | null {
        return candidate !== null && candidate !== undefined
            ? candidate : null;
    }
}
