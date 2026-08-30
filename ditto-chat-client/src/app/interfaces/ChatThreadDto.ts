import ChatThreadOverviewDto from "./ChatThreadOverviewDto";
import ChatThreadMessageDto from "./ChatThreadMessageDto";
import PagedListDto from "./PagedListDto";

export default interface ChatThreadDto {
    chatThreadOverview: ChatThreadOverviewDto;
    chatThreadMessages: PagedListDto<ChatThreadMessageDto>;
}
