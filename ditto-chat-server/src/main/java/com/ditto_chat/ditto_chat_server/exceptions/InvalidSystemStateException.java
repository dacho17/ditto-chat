package com.ditto_chat.ditto_chat_server.exceptions;

public class InvalidSystemStateException extends RuntimeException {
	private static final long serialVersionUID = 1L;
	
	public InvalidSystemStateException() {}
	
	public InvalidSystemStateException(String message) {
		super(message);
	}    
}
