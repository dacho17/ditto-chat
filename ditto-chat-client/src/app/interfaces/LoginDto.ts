import ChatterOverviewDto from "./ChatterOverviewDto";

export default interface LoginDto {
    chatterOverview: ChatterOverviewDto;
    sessionExpiresAt: string,
    redirectUrl: string;
}
