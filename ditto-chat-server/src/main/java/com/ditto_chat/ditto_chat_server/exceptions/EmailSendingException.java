package com.ditto_chat.ditto_chat_server.exceptions;

public class EmailSendingException extends RuntimeException {
    private static final long serialVersionUID = 1L;
	
	public EmailSendingException() {}
	
	public EmailSendingException(String message) {
		super(message);
	}
}
