package com.ditto_chat.ditto_chat_server.controllers;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.ditto_chat.ditto_chat_server.dtos.ResponseBody;
import com.ditto_chat.ditto_chat_server.exceptions.AuthenticationException;
import com.ditto_chat.ditto_chat_server.exceptions.BadRequestException;
import com.ditto_chat.ditto_chat_server.exceptions.DatabaseException;
import com.ditto_chat.ditto_chat_server.exceptions.EmailSendingException;
import com.ditto_chat.ditto_chat_server.exceptions.InvalidSystemStateException;
import com.ditto_chat.ditto_chat_server.exceptions.PageNotFoundException;
import com.ditto_chat.ditto_chat_server.exceptions.ResourceConflictException;
import com.ditto_chat.ditto_chat_server.helpers.auth.Authenticator;

import jakarta.servlet.http.HttpServletRequest;

@RestControllerAdvice
public class ExceptionController {
    @Autowired
    private Authenticator chatterAuthenticator;

	private final Logger logger = LoggerFactory.getLogger(ExceptionController.class);
	private final String BAD_REQUEST_ERROR_MESSAGE = "Please check that the information you provided has been entered correctly";
	private final String PAGE_NOT_FOUND_ERROR_MESAGE = "Requested page was not found";
	private final String UNAUTHORIZED_ACTION_ERROR_MESSAGE = "You can not perform this action";
	private final String RESOURCE_CONFLICT_ERROR_MESSAGE = "This action can not be performed";
	private final String INVALID_SYSTEM_STATE_ERROR_MESSAGE = "Internal error occurred. Please report this to our IT support";
	private final String INTERNAL_SERVICE_ERROR_MESSAGE = "Internal error occurred. Please try again";
	
	@ExceptionHandler
	public ResponseEntity<ResponseBody<?>> handleException(BadRequestException e, HttpServletRequest request) {
		logger.warn(String.format("Exception of type %s occured, API is returning %s response.", e.getClass().toString(), HttpStatus.BAD_REQUEST));
		return ResponseEntity
				.status(HttpStatus.BAD_REQUEST)
				.body(new ResponseBody<>(
					this.getResponseMessage(e.getMessage(), BAD_REQUEST_ERROR_MESSAGE),
					null,
					this.chatterAuthenticator.getSessionExpiresAt(request)
				));
	}

	@ExceptionHandler
	public ResponseEntity<ResponseBody<?>> handleException(AuthenticationException e, HttpServletRequest request) {
		logger.warn(String.format("Exception of type %s occured, API is returning %s response.", e.getClass().toString(), HttpStatus.UNAUTHORIZED));
		return ResponseEntity
				.status(HttpStatus.UNAUTHORIZED)
				.body(new ResponseBody<>(
					this.getResponseMessage(e.getMessage(), UNAUTHORIZED_ACTION_ERROR_MESSAGE),
					null,
					this.chatterAuthenticator.getSessionExpiresAt(request)
				));
	}

	@ExceptionHandler
	public ResponseEntity<ResponseBody<?>> handleException(PageNotFoundException e, HttpServletRequest request) {
		logger.warn(String.format("Exception of type %s occured, API is returning %s response.", e.getClass().toString(), HttpStatus.NOT_FOUND));
		return ResponseEntity
				.status(HttpStatus.NOT_FOUND)
				.body(new ResponseBody<>(
					this.getResponseMessage(e.getMessage(), PAGE_NOT_FOUND_ERROR_MESAGE),
					null,
					this.chatterAuthenticator.getSessionExpiresAt(request)
				));
	}

	@ExceptionHandler
	public ResponseEntity<ResponseBody<?>> handleException(ResourceConflictException e, HttpServletRequest request) {
		logger.warn(String.format("Exception of type %s occured, API is returning %s response.", e.getClass().toString(), HttpStatus.CONFLICT));
		return ResponseEntity
				.status(HttpStatus.CONFLICT)
				.body(new ResponseBody<>(
					this.getResponseMessage(e.getMessage(), RESOURCE_CONFLICT_ERROR_MESSAGE),
					null,
					this.chatterAuthenticator.getSessionExpiresAt(request)
				));
	}

	@ExceptionHandler
	public ResponseEntity<ResponseBody<?>> handleException(InvalidSystemStateException e, HttpServletRequest request) {
		logger.warn(String.format("Exception of type %s occured, API is returning %s response.", e.getClass().toString(), HttpStatus.CONFLICT));
		return ResponseEntity
				.status(HttpStatus.CONFLICT)
				.body(new ResponseBody<>(
					this.getResponseMessage(e.getMessage(), INVALID_SYSTEM_STATE_ERROR_MESSAGE),
					null,
					this.chatterAuthenticator.getSessionExpiresAt(request)
				));
	}

	@ExceptionHandler
	public ResponseEntity<ResponseBody<?>> handleException(EmailSendingException e, HttpServletRequest request) {
		logger.warn(String.format("Exception of type %s occured, API is returning %s response.", e.getClass().toString(), HttpStatus.INTERNAL_SERVER_ERROR));
		return ResponseEntity
				.status(HttpStatus.INTERNAL_SERVER_ERROR)
				.body(new ResponseBody<>(
					this.getResponseMessage(e.getMessage(), INTERNAL_SERVICE_ERROR_MESSAGE),
					null,
					this.chatterAuthenticator.getSessionExpiresAt(request)
				));
	}

	@ExceptionHandler
	public ResponseEntity<ResponseBody<?>> handleException(DatabaseException e, HttpServletRequest request) {
		logger.warn(String.format("Exception of type %s occured, API is returning %s response.", e.getClass().toString(), HttpStatus.INTERNAL_SERVER_ERROR));
		return ResponseEntity
				.status(HttpStatus.INTERNAL_SERVER_ERROR)
				.body(new ResponseBody<>(
					this.getResponseMessage(e.getMessage(), INTERNAL_SERVICE_ERROR_MESSAGE),
					null,
					this.chatterAuthenticator.getSessionExpiresAt(request)
				));
	}

	private String getResponseMessage(String exceptionMessage, String defaultExceptionMessage) {
		if (exceptionMessage == null || exceptionMessage.length() == 0) {
			return defaultExceptionMessage;
		}

		return exceptionMessage;
	}
}
