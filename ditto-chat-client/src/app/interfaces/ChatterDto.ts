import ChatterOverviewDto from "./ChatterOverviewDto";
import SharedFileDto from "./SharedFileDto";

export default interface ChatterDto {
    chatterOverview: ChatterOverviewDto;
    sharedFiles: SharedFileDto[];
}
