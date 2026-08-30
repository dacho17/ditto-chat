package com.ditto_chat.ditto_chat_server.helpers.auth;

import java.io.IOException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class ChatterAccessDeniedHandler implements AccessDeniedHandler {
	@Autowired
	private AuthResponseHelper authResponseHelper;
	private final Logger logger = LoggerFactory.getLogger(ChatterAccessDeniedHandler.class);

	@Override
	public void handle(HttpServletRequest request, HttpServletResponse response,
			AccessDeniedException accessDeniedException) throws IOException, ServletException {
		logger.warn(String.format("Chatter endpoint was attempted to be accessed while not being authorized. Exception=[%s]",
			accessDeniedException.getMessage()));

        this.authResponseHelper.sendUnauthorizedResponse(request, response);
	}
}
