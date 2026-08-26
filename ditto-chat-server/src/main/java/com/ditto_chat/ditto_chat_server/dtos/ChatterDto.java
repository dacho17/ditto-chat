package com.ditto_chat.ditto_chat_server.dtos;

public class ChatterDto {
    private ChatterOverviewDto chatterOverview;
    private ResponsePagedListDto<SharedFileDto> sharedFiles;
    
    public ChatterDto(ChatterOverviewDto chatterOverview, ResponsePagedListDto<SharedFileDto> sharedFiles) {
        this.chatterOverview = chatterOverview;
        this.sharedFiles = sharedFiles;
    }

    public ChatterOverviewDto getChatterOverview() {
        return chatterOverview;
    }

    public ResponsePagedListDto<SharedFileDto> getSharedFiles() {
        return sharedFiles;
    }
}
