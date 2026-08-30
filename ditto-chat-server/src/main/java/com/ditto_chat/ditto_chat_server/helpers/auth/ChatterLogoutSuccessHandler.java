package com.ditto_chat.ditto_chat_server.helpers.auth;

import java.io.IOException;

import org.jspecify.annotations.Nullable;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.logout.LogoutSuccessHandler;
import org.springframework.stereotype.Component;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class ChatterLogoutSuccessHandler implements LogoutSuccessHandler {
	@Autowired
	private AuthResponseHelper authResponseHelper;
    private final Logger logger = LoggerFactory.getLogger(ChatterLogoutSuccessHandler.class);

    @Override
    public void onLogoutSuccess(HttpServletRequest request, HttpServletResponse response,
            @Nullable Authentication authentication) throws IOException, ServletException {
		logger.info(String.format("Logging Out Chatter with Principal=%s....", authentication.getPrincipal().toString()));

        this.authResponseHelper.sendLogoutResponse(request, response);
    }
}
