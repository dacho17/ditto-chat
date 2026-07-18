import { ChatMessageStatus } from "../enums/ChatMessageStatus";

export default interface ChatMessage {
    chatMessageStatus: ChatMessageStatus;
    messageSender: string;
    messageTime: string;
    messageContent: string;
    isMessageSeen: boolean;
}
