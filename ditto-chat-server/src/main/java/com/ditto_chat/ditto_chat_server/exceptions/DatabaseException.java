package com.ditto_chat.ditto_chat_server.exceptions;

public class DatabaseException extends RuntimeException {
	private static final long serialVersionUID = 1L;
	
	public DatabaseException() {}
	
	public DatabaseException(String message) {
		super(message);
	}
}
