package com.ditto_chat.ditto_chat_server.helpers.auth;

import java.io.IOException;
import java.io.PrintWriter;
import java.sql.Timestamp;

import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import com.ditto_chat.ditto_chat_server.Constants;
import com.ditto_chat.ditto_chat_server.dtos.RedirectUrlDto;
import com.ditto_chat.ditto_chat_server.dtos.ResponseBody;
import com.ditto_chat.ditto_chat_server.utils.TimeTool;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class AuthResponseHelper {
	public final String LOGOUT_SUCCESS_MESSAGE = "You logged out";
	public final String UNAUTHENTICATED_ERROR_MESSAGE = "Please log in";
	public final String UNAUTHORIZED_ERROR_MESSAGE = "You may not perform this action";

	public void sendLogoutResponse(HttpServletRequest request, HttpServletResponse response) throws IOException, ServletException {
		String responseBodyJson = this.generateJsonResponseBody(LOGOUT_SUCCESS_MESSAGE, Constants.LOGIN_URL, request);
		this.sendResponse(response, HttpServletResponse.SC_OK, responseBodyJson);
	}
	
	public void sendUnauthenticatedResponse(HttpServletRequest request, HttpServletResponse response) throws IOException, ServletException {
		String responseBodyJson = this.generateJsonResponseBody(UNAUTHENTICATED_ERROR_MESSAGE, Constants.LOGIN_URL, request);
		this.sendResponse(response, HttpServletResponse.SC_UNAUTHORIZED, responseBodyJson);
	}

	public void sendUnauthorizedResponse(HttpServletRequest request, HttpServletResponse response) throws IOException, ServletException {
		String responseBodyJson = this.generateJsonResponseBody(UNAUTHORIZED_ERROR_MESSAGE, Constants.HOME_URL, request);
		this.sendResponse(response, HttpServletResponse.SC_FORBIDDEN, responseBodyJson);
	}

    private void sendResponse(HttpServletResponse response, int responseStatusCode, String responseBodyJson) throws IOException, ServletException {
		response.setStatus(responseStatusCode);
		response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        PrintWriter out = response.getWriter();
        out.print(responseBodyJson);
        out.flush();
 	}

	private String generateJsonResponseBody(String message, String redirectUrl, HttpServletRequest request) {
		Gson gson = new GsonBuilder().create();
		return gson.toJson(new ResponseBody<RedirectUrlDto>(
			message,
			new RedirectUrlDto(redirectUrl),
			this.getSessionExpiresAt(request)
		));
	}

	// NOTE: this Function is a duplicate from Authenticator Class, and a combination of its isChatterAuthenticated and getSessionExpiresAt Functions. It was copied because this Class forms a circular dependency with WebSecurityConfig Class if Authenticator Class is injected into this one! Ideally this circular dependency needs to be resolved!
	private Timestamp getSessionExpiresAt(HttpServletRequest request) {
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
		boolean isChatterAuthenticated =
			(authentication == null || !authentication.isAuthenticated() || authentication instanceof AnonymousAuthenticationToken)
				? false : true;

		if (isChatterAuthenticated == false) {
			return null;
		}

		return TimeTool.addSecondsToTimestamp(
			new Timestamp(request.getSession().getLastAccessedTime()),
			request.getSession().getMaxInactiveInterval()
		);
	}
}
