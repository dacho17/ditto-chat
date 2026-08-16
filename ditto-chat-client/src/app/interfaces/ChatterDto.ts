import ChatterOverviewDto from "./ChatterOverviewDto";
import PagedListDto from "./PagedListDto";
import SharedFileDto from "./SharedFileDto";

export default interface ChatterDto {
    chatterOverview: ChatterOverviewDto;
    sharedFiles: PagedListDto<SharedFileDto>;
}
