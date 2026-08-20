package com.ditto_chat.ditto_chat_server.controllers;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.ditto_chat.ditto_chat_server.Constants;
import com.ditto_chat.ditto_chat_server.dtos.ChatterRegistrationForm;
import com.ditto_chat.ditto_chat_server.dtos.ForgotPasswordForm;
import com.ditto_chat.ditto_chat_server.dtos.LoginForm;
import com.ditto_chat.ditto_chat_server.dtos.RedirectUrlDto;
import com.ditto_chat.ditto_chat_server.dtos.ResetPasswordForm;
import com.ditto_chat.ditto_chat_server.dtos.ResponseBody;
import com.ditto_chat.ditto_chat_server.helpers.auth.Authenticator;
import com.ditto_chat.ditto_chat_server.services.AuthService;
import com.ditto_chat.ditto_chat_server.validators.AuthValidator;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@RestController
@RequestMapping(value = "", produces = { "application/json" })
public class AuthController {
    @Autowired
	private AuthService authService;
	@Autowired
	private Authenticator chatterAuthenticator;
	private final Logger logger = LoggerFactory.getLogger(AuthController.class);
	private final String ALREADY_LOGGED_IN_MESSAGE = "You are already logged in";
	private final String ACCOUNT_REGISTRATION_SUCCESS_MESSAGE = "You have registered successfully";
	private final String LOGIN_SUCCESS_MESSAGE = "You are logged in";
	private final String RESET_PASSWORD_LINK_SENT_SUCCESS_MESSAGE = "We sent a reset password link to your email";
	private final String PASSWORD_RESET_SUCCESS_MESSAGE = "Password successfully reset";

	@ResponseStatus(code = HttpStatus.OK)
	@GetMapping("/register")
	public ResponseEntity<ResponseBody<RedirectUrlDto>> getRegisterPage() throws Exception {
		logger.info("GET /register - endpoint accessed.");

		if (chatterAuthenticator.isChatterAuthenticated()) {
			return generateRedirectResponse(HttpStatus.OK, ALREADY_LOGGED_IN_MESSAGE, Constants.HOME_URL);
		}

		logger.info("GET /register - returning response.");
		return generateRedirectResponse(HttpStatus.OK, null, null);
	}

	@ResponseStatus(code = HttpStatus.CREATED)
	@PostMapping("/register")
	public ResponseEntity<ResponseBody<RedirectUrlDto>> register(@RequestBody ChatterRegistrationForm chatterRegistrationForm, HttpServletRequest request) throws Exception {
		logger.info("POST /register - endpoint accessed.");
		AuthValidator.validateChatterRegistrationForm(chatterRegistrationForm);

		if (chatterAuthenticator.isChatterAuthenticated()) {
			return generateRedirectResponse(HttpStatus.OK, ALREADY_LOGGED_IN_MESSAGE, Constants.HOME_URL);
		}
		
		authService.registerNewChatter(chatterRegistrationForm);

		logger.info("POST /register - returning response.");
		return generateRedirectResponse(HttpStatus.CREATED, ACCOUNT_REGISTRATION_SUCCESS_MESSAGE, Constants.LOGIN_URL);
	}

	@ResponseStatus(code = HttpStatus.OK)
	@GetMapping("/login")
	public ResponseEntity<ResponseBody<RedirectUrlDto>> getLoginPage() throws Exception {
		logger.info("GET /login - endpoint accessed.");

		if (chatterAuthenticator.isChatterAuthenticated()) {
			return generateRedirectResponse(HttpStatus.OK, ALREADY_LOGGED_IN_MESSAGE, Constants.HOME_URL);
		}

		logger.info("GET /login - returning response.");
		return generateRedirectResponse(HttpStatus.OK, null, null);
	}


	@ResponseStatus(code = HttpStatus.CREATED)
	@PostMapping("/login")
	public ResponseEntity<ResponseBody<RedirectUrlDto>> login(@RequestBody LoginForm loginForm, HttpServletRequest request, HttpServletResponse response) throws Exception {
		logger.info("POST /login - endpoint accessed.");
		
		AuthValidator.validateLoginForm(loginForm);

		if (chatterAuthenticator.isChatterAuthenticated()) {
			return generateRedirectResponse(HttpStatus.OK, ALREADY_LOGGED_IN_MESSAGE, Constants.HOME_URL);
		}

		String chatterEmail = loginForm.getEmail().trim();
		String chatterPassword = loginForm.getPassword().trim();
		chatterAuthenticator.createAutheticatedSessionForChatter(chatterEmail, chatterPassword, request, response);		
		authService.registerChatterLogin(chatterEmail);

		logger.info("POST /login - returning response with the Authenticated Session Cookie.");
		return generateRedirectResponse(HttpStatus.CREATED, LOGIN_SUCCESS_MESSAGE, Constants.HOME_URL);
	}

	@ResponseStatus(code = HttpStatus.OK)
	@GetMapping("/forgot-password")
	public ResponseEntity<ResponseBody<RedirectUrlDto>> getForgotPasswordPage() throws Exception {
		logger.info("GET /forgot-password - endpoint accessed.");

		if (chatterAuthenticator.isChatterAuthenticated()) {
			return generateRedirectResponse(HttpStatus.OK, ALREADY_LOGGED_IN_MESSAGE, Constants.HOME_URL);
		}

		logger.info("GET /forgot-password - returning response.");
		return generateRedirectResponse(HttpStatus.OK, null, null);
	}

	@ResponseStatus(code = HttpStatus.CREATED)
	@PostMapping("/forgot-password")
	public ResponseEntity<ResponseBody<RedirectUrlDto>> forgotPassword(@RequestBody ForgotPasswordForm forgotPasswordForm) throws Exception {
		logger.info("POST /forgot-password - endpoint accessed.");
		
		AuthValidator.validateForgotPasswordForm(forgotPasswordForm);

		if (chatterAuthenticator.isChatterAuthenticated()) {
			return generateRedirectResponse(HttpStatus.OK, ALREADY_LOGGED_IN_MESSAGE, Constants.HOME_URL);
		}

		authService.enablePasswordResetForChatter(forgotPasswordForm.getEmail().trim());
		
		logger.info("POST /forgot-password - returning response.");
		return generateRedirectResponse(HttpStatus.CREATED, RESET_PASSWORD_LINK_SENT_SUCCESS_MESSAGE, null);
	}

	@ResponseStatus(code = HttpStatus.OK)
	@GetMapping("/reset-password")
	public ResponseEntity<ResponseBody<RedirectUrlDto>> getResetPasswordPage() throws Exception {
		logger.info("GET /reset-password - endpoint accessed.");

		if (chatterAuthenticator.isChatterAuthenticated()) {
			return generateRedirectResponse(HttpStatus.OK, ALREADY_LOGGED_IN_MESSAGE, Constants.HOME_URL);
		}

		logger.info("GET /reset-password - returning response.");
		return generateRedirectResponse(HttpStatus.OK, null, null);
	}

	@ResponseStatus(code = HttpStatus.CREATED)
	@PostMapping("/reset-password")
	public ResponseEntity<ResponseBody<RedirectUrlDto>> resetPassword(@RequestParam(required = true) String passwordResetToken, @RequestBody ResetPasswordForm resetPasswordForm) throws Exception {
		logger.info("POST /reset-password - endpoint accessed.");
		
		AuthValidator.validateResetPasswordForm(resetPasswordForm);
		AuthValidator.validatePasswordResetTokenHash(passwordResetToken);

		if (chatterAuthenticator.isChatterAuthenticated()) {
			return generateRedirectResponse(HttpStatus.OK, ALREADY_LOGGED_IN_MESSAGE, Constants.HOME_URL);
		}

		authService.resetPasswordForChatter(resetPasswordForm.getPassword().trim(), passwordResetToken);
		
		logger.info("POST /reset-password - returning response.");
		return generateRedirectResponse(HttpStatus.CREATED, PASSWORD_RESET_SUCCESS_MESSAGE, Constants.LOGIN_URL);
	}

	private ResponseEntity<ResponseBody<RedirectUrlDto>> generateRedirectResponse(HttpStatus httpCode, String responseMessage, String redirectUrl) {
		return ResponseEntity
			.status(httpCode)
			.body(new ResponseBody<RedirectUrlDto>(responseMessage, new RedirectUrlDto(redirectUrl)));
	}
}
