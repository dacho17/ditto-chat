package com.ditto_chat.ditto_chat_server.exceptions;

public class AuthenticationException extends RuntimeException {
    private static final long serialVersionUID = 1L;
	
	public AuthenticationException() {}
	
	public AuthenticationException(String message) {
		super(message);
	}
}
