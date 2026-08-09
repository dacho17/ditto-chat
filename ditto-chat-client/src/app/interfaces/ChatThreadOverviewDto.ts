import ChatterOverviewDto from "./ChatterOverviewDto";

export default interface ChatThreadOverviewDto {
    id: string;
    chatterOverview: ChatterOverviewDto;
    chatThreadCreatedAt: string;
    numberOfUnseenMessages: number;
    lastMessageTime: string | null;
    lastMessageContent: string | null;
    lastSeenByChatterMessageId: string | null;
    lastSeenByPeerMessageId: string | null;
    chatThreadHistoryClearedAt: string | null;
}
