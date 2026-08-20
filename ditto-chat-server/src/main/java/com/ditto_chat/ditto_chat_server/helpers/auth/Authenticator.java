package com.ditto_chat.ditto_chat_server.helpers.auth;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.stereotype.Component;

import com.ditto_chat.ditto_chat_server.exceptions.AuthenticationException;
import com.ditto_chat.ditto_chat_server.utils.FormattingTool;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class Authenticator {
	private DaoAuthenticationProvider chatterAuthProvider;
	private final Logger logger = LoggerFactory.getLogger(Authenticator.class);
	private final String INCORRECT_CREDENTIALS_ERROR_MESSAGE = "Please insert correct credentials";

	public Authenticator(DaoAuthenticationProvider chatterAuthProvider) {
		this.chatterAuthProvider = chatterAuthProvider;
	}

	public void createAutheticatedSessionForChatter(String email, String password, HttpServletRequest request, HttpServletResponse response) {
		try {
			UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(email, password);

			AuthenticationManager chatterAuthManager = new ProviderManager(this.chatterAuthProvider);
			Authentication authentication = chatterAuthManager.authenticate(authToken);

			SecurityContextHolder.getContext().setAuthentication(authentication);
			request.getSession(true); // forces session creation

			new HttpSessionSecurityContextRepository()
		        .saveContext(SecurityContextHolder.getContext(), request, response);

			logger.info(String.format("A session has successfully been created for the Chatter with email=%s.", email));
			return;
		} catch (UsernameNotFoundException | BadCredentialsException e) {
			logger.warn(String.format("Chatter with email=%s attempted to log in with invalid credentials.", email));
			throw new AuthenticationException(this.INCORRECT_CREDENTIALS_ERROR_MESSAGE);
		} catch (Exception e) {
			logger.error(String.format("An exception has occurred while creating a Session with Spring Security for Chatter with email=%s. Exception=[%s]",
				email, FormattingTool.stringifyException(e)));
			throw new AuthenticationException();
		}
	}

	public boolean isChatterAuthenticated() {
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
		if (authentication == null || !authentication.isAuthenticated()
				|| authentication instanceof AnonymousAuthenticationToken) {
			return false;
		}

		return true;
	}
}
