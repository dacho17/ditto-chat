package com.ditto_chat.ditto_chat_server.helpers.auth;

import java.io.IOException;
import java.io.PrintWriter;

import com.ditto_chat.ditto_chat_server.Constants;
import com.ditto_chat.ditto_chat_server.dtos.RedirectUrlDto;
import com.ditto_chat.ditto_chat_server.dtos.ResponseBody;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletResponse;

public class AuthExceptionResponseHelper {
	public static final String UNAUTHENTICATED_ERROR_MESSAGE = "Please log in";
	public static final String UNAUTHORIZED_ERROR_MESSAGE = "You may not perform this action";

	public static void sendUnauthenticatedResponse(HttpServletResponse response) throws IOException, ServletException {
		String responseBodyJson = AuthExceptionResponseHelper.generateJsonResponseBody(UNAUTHENTICATED_ERROR_MESSAGE, Constants.LOGIN_URL);
		sendResponse(response, HttpServletResponse.SC_UNAUTHORIZED, responseBodyJson);
	}

	public static void sendUnauthorizedResponse(HttpServletResponse response) throws IOException, ServletException {
		String responseBodyJson = AuthExceptionResponseHelper.generateJsonResponseBody(UNAUTHORIZED_ERROR_MESSAGE, Constants.HOME_URL);
		sendResponse(response, HttpServletResponse.SC_FORBIDDEN, responseBodyJson);
	}

    private static void sendResponse(HttpServletResponse response, int responseStatusCode, String responseBodyJson) throws IOException, ServletException {
		response.setStatus(responseStatusCode);
		response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        PrintWriter out = response.getWriter();
        out.print(responseBodyJson);
        out.flush();
 	}

	private static String generateJsonResponseBody(String message, String redirectUrl) {
		Gson gson = new GsonBuilder().create();
		return gson.toJson(new ResponseBody<RedirectUrlDto>(message, new RedirectUrlDto(redirectUrl)));
	}
}
