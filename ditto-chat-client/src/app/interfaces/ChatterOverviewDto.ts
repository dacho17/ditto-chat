export default interface ChatterOverviewDto {
    id: string;
    chatterName: string;
    chatterSurname: string;
    chatterUsername: string;
    chatterImageUrl: string;
    isChatterOnline: boolean;
    chatThreadId: string | null;
}
