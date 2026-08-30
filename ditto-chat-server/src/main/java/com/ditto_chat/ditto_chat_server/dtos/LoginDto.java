package com.ditto_chat.ditto_chat_server.dtos;

public class LoginDto {
    private ChatterOverviewDto chatterOverview;
    private String redirectUrl;

    public LoginDto(ChatterOverviewDto chatterOverview, String redirectUrl) {
        this.chatterOverview = chatterOverview;
        this.redirectUrl = redirectUrl;
    }

    public ChatterOverviewDto getChatterOverview() {
        return chatterOverview;
    }

    public String getRedirectUrl() {
        return redirectUrl;
    }
}
