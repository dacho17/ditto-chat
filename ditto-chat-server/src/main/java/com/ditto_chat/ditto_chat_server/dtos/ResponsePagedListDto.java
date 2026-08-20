package com.ditto_chat.ditto_chat_server.dtos;

import java.util.List;

public class ResponsePagedListDto<T> {
    private final List<T> pageList;
	private final boolean isLastPage;

    public ResponsePagedListDto(List<T> pageList, boolean isLastPage) {
        this.pageList = pageList;
        this.isLastPage = isLastPage;
    }

    public List<T> getPageList() {
        return pageList;
    }

    public boolean isLastPage() {
        return isLastPage;
    }
}
