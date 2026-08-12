export default interface ChatterOverviewDto {
    id: string;
    chatterName: string;
    chatterSurname: string;
    chatterUsername: string;
    chatterEmail: string;
    chatterImageUrl: string | null;
    isChatterOnline: boolean;
    chatThreadId: string | null;
}
