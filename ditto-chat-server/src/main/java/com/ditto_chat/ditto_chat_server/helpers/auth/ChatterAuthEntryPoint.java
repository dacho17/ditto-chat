package com.ditto_chat.ditto_chat_server.helpers.auth;

import java.io.IOException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class ChatterAuthEntryPoint implements AuthenticationEntryPoint {	
	@Autowired
	private AuthResponseHelper authResponseHelper;
	private final Logger logger = LoggerFactory.getLogger(ChatterAuthEntryPoint.class);

	@Override
	public void commence(HttpServletRequest request, HttpServletResponse response,
			AuthenticationException authException) throws IOException, ServletException {
		logger.warn(String.format("Chatter endpoint was attempted to be accessed while not being authenticated. Exception=[%s]",
			authException.getMessage()));
		
		this.authResponseHelper.sendUnauthenticatedResponse(request, response);
 	}
}
