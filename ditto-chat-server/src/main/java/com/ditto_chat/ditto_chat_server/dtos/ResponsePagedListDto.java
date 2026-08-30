package com.ditto_chat.ditto_chat_server.dtos;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

public class ResponsePagedListDto<T> {
    private final List<T> pagedList;
    @JsonProperty("isLastPage")
	private final boolean isLastPage;

    public ResponsePagedListDto(List<T> pagedList, boolean isLastPage) {
        this.pagedList = pagedList;
        this.isLastPage = isLastPage;
    }

    public List<T> getPagedList() {
        return pagedList;
    }

    public boolean isLastPage() {
        return isLastPage;
    }
}
