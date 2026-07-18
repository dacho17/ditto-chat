export default interface ChatThreadOverview {
    chatterName: string;
    chatterImageUrl: string;
    isChatterOnline: boolean;

    lastMessage: string | null;
    lastMessageTime: string | null;
    numberOfUnreadMessages: number;
}
