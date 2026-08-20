package com.ditto_chat.ditto_chat_server.exceptions;

public class ResourceConflictException extends RuntimeException {
    private static final long serialVersionUID = 1L;
	
	public ResourceConflictException() {}
	
	public ResourceConflictException(String message) {
		super(message);
	}
}
