import ChatterOverviewDto from "./ChatterOverviewDto";

export default interface LoginDto {
    chatterOverview: ChatterOverviewDto;
    redirectUrl: string;
}
