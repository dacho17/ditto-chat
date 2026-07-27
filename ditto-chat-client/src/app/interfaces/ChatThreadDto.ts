import ChatThreadOverviewDto from "./ChatThreadOverviewDto";
import ChatThreadMessageDto from "./ChatThreadMessageDto";

export default interface ChatThreadDto {
    chatThreadOverview: ChatThreadOverviewDto;
    chatThreadMessages: ChatThreadMessageDto[];
}
