package com.ditto_chat.ditto_chat_server.controllers;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import com.ditto_chat.ditto_chat_server.dtos.RedirectUrlDto;
import com.ditto_chat.ditto_chat_server.dtos.ResponseBody;

public class GeneralController {
    protected ResponseEntity<ResponseBody<RedirectUrlDto>> generateRedirectResponse(HttpStatus httpCode, String responseMessage, String redirectUrl) {
		return ResponseEntity
			.status(httpCode)
			.body(new ResponseBody<RedirectUrlDto>(responseMessage, new RedirectUrlDto(redirectUrl)));
	}
}
