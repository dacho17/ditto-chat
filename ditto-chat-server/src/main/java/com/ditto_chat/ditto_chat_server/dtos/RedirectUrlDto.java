package com.ditto_chat.ditto_chat_server.dtos;

public class RedirectUrlDto {
    private String redirectUrl;

    public RedirectUrlDto(String redirectUrl) {
        this.redirectUrl = redirectUrl;
    }

    public String getRedirectUrl() {
        return redirectUrl;
    }

    @Override
	public String toString() {
		return "RedirectUrlDto: [redirectUrl=" + redirectUrl + "]";
	}
}
