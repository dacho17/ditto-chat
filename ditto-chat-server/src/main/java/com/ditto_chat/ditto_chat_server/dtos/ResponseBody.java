package com.ditto_chat.ditto_chat_server.dtos;

import java.sql.Timestamp;

// NOTE: Getters are Required since they are Called when Mapping POJO to JSON when returning HTTP Response
public class ResponseBody<T>{
    private String message;
	private T data;
	private Timestamp authSessionExpiresAt;
	
	public ResponseBody(String message, T data, Timestamp authSessionExpiresAt) {
		this.message = message;
		this.data = data;
		this.authSessionExpiresAt = authSessionExpiresAt;
	}

	public String getMessage() {
		return message;
	}

	public T getData() {
		return data;
	}

	public Timestamp getAuthSessionExpiresAt() {
		return authSessionExpiresAt;
	}

	@Override
	public String toString() {
		return "ResponseBody: [message=" + message + ", data=" + data + ", authSessionExpiresAt=" + authSessionExpiresAt + "]";
	}
}
