export default interface ChatThreadMessageDto {
    id: string;
    messageSenderId: string
    messageContent: string;
    messageRegisteredAt: string;
    // isMessageSeen: boolean;  // NOT SURE IF I NEED THIS!!
}
