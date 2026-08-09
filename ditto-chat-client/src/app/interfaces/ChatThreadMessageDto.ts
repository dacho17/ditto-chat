import SharedFileDto from "./SharedFileDto";

export default interface ChatThreadMessageDto {
    id: string;
    messageSenderId: string
    messageContent: string;
    attachedFile: SharedFileDto | null;
    messageRegisteredAt: string;
    isMessageSeen: boolean;
}
