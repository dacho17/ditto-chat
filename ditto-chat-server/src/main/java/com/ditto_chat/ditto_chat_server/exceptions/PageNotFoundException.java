package com.ditto_chat.ditto_chat_server.exceptions;

public class PageNotFoundException extends RuntimeException {
    private static final long serialVersionUID = 1L;
	
	public PageNotFoundException() {}
	
	public PageNotFoundException(String message) {
		super(message);
	}
}
