package com.ditto_chat.ditto_chat_server.dtos;

// NOTE: Getters are Required since they are Called when Mapping POJO to JSON when returning HTTP Response
public class ResponseBody<T>{
    private String message;
	private T data;
	
	public ResponseBody(String message, T data) {
		this.message = message;
		this.data = data;
	}

	public String getMessage() {
		return message;
	}

	public T getData() {
		return data;
	}

	@Override
	public String toString() {
		return "ResponseBody: [message=" + message + ", data=" + data + "]";
	}
}
