package com.ditto_chat.ditto_chat_server.controllers;

import java.sql.Timestamp;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.ditto_chat.ditto_chat_server.Constants;
import com.ditto_chat.ditto_chat_server.dtos.ChatterOverviewDto;
import com.ditto_chat.ditto_chat_server.dtos.ChatterRegistrationForm;
import com.ditto_chat.ditto_chat_server.dtos.ForgotPasswordForm;
import com.ditto_chat.ditto_chat_server.dtos.LoginDto;
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
public class AuthController extends GeneralController {
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
	public ResponseEntity<ResponseBody<RedirectUrlDto>> getRegisterPage(
        HttpServletRequest request
	) throws Exception {
		logger.info("GET /register - endpoint accessed.");

		if (chatterAuthenticator.isChatterAuthenticated()) {
			return generateRedirectResponse(
				HttpStatus.OK, ALREADY_LOGGED_IN_MESSAGE, Constants.HOME_URL, this.chatterAuthenticator.getSessionExpiresAt(request)
			);
		}

		logger.info("GET /register - returning response.");
		return generateRedirectResponse(HttpStatus.OK, null, null, null);
	}

	@ResponseStatus(code = HttpStatus.CREATED)
	@PostMapping("/register")
	public ResponseEntity<ResponseBody<RedirectUrlDto>> register(@RequestBody ChatterRegistrationForm chatterRegistrationForm, HttpServletRequest request) throws Exception {
		logger.info("POST /register - endpoint accessed.");
		AuthValidator.validateChatterRegistrationForm(chatterRegistrationForm);

		if (chatterAuthenticator.isChatterAuthenticated()) {
			return generateRedirectResponse(
				HttpStatus.OK, ALREADY_LOGGED_IN_MESSAGE, Constants.HOME_URL, this.chatterAuthenticator.getSessionExpiresAt(request)
			);
		}
		
		authService.registerNewChatter(chatterRegistrationForm);

		logger.info("POST /register - returning response.");
		return generateRedirectResponse(HttpStatus.CREATED, ACCOUNT_REGISTRATION_SUCCESS_MESSAGE, Constants.LOGIN_URL, null);
	}

	@ResponseStatus(code = HttpStatus.OK)
	@GetMapping("/login")
	public ResponseEntity<ResponseBody<RedirectUrlDto>> getLoginPage(
        HttpServletRequest request
	) throws Exception {
		logger.info("GET /login - endpoint accessed.");

		if (chatterAuthenticator.isChatterAuthenticated()) {
			return generateRedirectResponse(
				HttpStatus.OK, ALREADY_LOGGED_IN_MESSAGE, Constants.HOME_URL, this.chatterAuthenticator.getSessionExpiresAt(request)
			);
		}

		logger.info("GET /login - returning response.");
		return generateRedirectResponse(HttpStatus.OK, null, null, null);
	}

	@ResponseStatus(code = HttpStatus.CREATED)
	@PostMapping("/login")
	public ResponseEntity<?> login(
		HttpServletRequest request,
		HttpServletResponse response,
		@RequestBody LoginForm loginForm
	) throws Exception {
		logger.info("POST /login - endpoint accessed.");
		
		AuthValidator.validateLoginForm(loginForm);

		if (chatterAuthenticator.isChatterAuthenticated()) {
			return generateRedirectResponse(
				HttpStatus.OK, ALREADY_LOGGED_IN_MESSAGE, Constants.HOME_URL, this.chatterAuthenticator.getSessionExpiresAt(request)
			);
		}

		String chatterEmail = loginForm.getEmail().trim();
		String chatterPassword = loginForm.getPassword().trim();
		Timestamp loginSessionExpiresAt =
			chatterAuthenticator.createAutheticatedSessionForChatter(chatterEmail, chatterPassword, request, response);		

		ChatterOverviewDto loggedInChatterOverviewDto = authService.registerChatterLogin(chatterEmail);

		logger.info("POST /login - returning response with the Authenticated Session Cookie.");
		return ResponseEntity
			.status(HttpStatus.CREATED)
			.body(new ResponseBody<LoginDto>(
				this.LOGIN_SUCCESS_MESSAGE,
				new LoginDto(loggedInChatterOverviewDto, Constants.HOME_URL),
				loginSessionExpiresAt
			));
	}

	@ResponseStatus(code = HttpStatus.OK)
	@GetMapping("/forgot-password")
	public ResponseEntity<ResponseBody<RedirectUrlDto>> getForgotPasswordPage(
		HttpServletRequest request
	) throws Exception {
		logger.info("GET /forgot-password - endpoint accessed.");

		if (chatterAuthenticator.isChatterAuthenticated()) {
			return generateRedirectResponse(
				HttpStatus.OK, ALREADY_LOGGED_IN_MESSAGE, Constants.HOME_URL, this.chatterAuthenticator.getSessionExpiresAt(request)
			);
		}

		logger.info("GET /forgot-password - returning response.");
		return generateRedirectResponse(HttpStatus.OK, null, null, null);
	}

	@ResponseStatus(code = HttpStatus.CREATED)
	@PostMapping("/forgot-password")
	public ResponseEntity<ResponseBody<RedirectUrlDto>> forgotPassword(
		HttpServletRequest request,
		@RequestBody ForgotPasswordForm forgotPasswordForm
	) throws Exception {
		logger.info("POST /forgot-password - endpoint accessed.");
		
		AuthValidator.validateForgotPasswordForm(forgotPasswordForm);

		if (chatterAuthenticator.isChatterAuthenticated()) {
			return generateRedirectResponse(
				HttpStatus.OK, ALREADY_LOGGED_IN_MESSAGE, Constants.HOME_URL, this.chatterAuthenticator.getSessionExpiresAt(request)
			);
		}

		authService.enablePasswordResetForChatter(forgotPasswordForm.getEmail().trim());
		
		logger.info("POST /forgot-password - returning response.");
		return generateRedirectResponse(
			HttpStatus.CREATED, RESET_PASSWORD_LINK_SENT_SUCCESS_MESSAGE, null, null
		);
	}

	@ResponseStatus(code = HttpStatus.OK)
	@GetMapping("/reset-password")
	public ResponseEntity<ResponseBody<RedirectUrlDto>> getResetPasswordPage(
		HttpServletRequest request
	) throws Exception {
		logger.info("GET /reset-password - endpoint accessed.");

		if (chatterAuthenticator.isChatterAuthenticated()) {
			return generateRedirectResponse(
				HttpStatus.OK, ALREADY_LOGGED_IN_MESSAGE, Constants.HOME_URL, this.chatterAuthenticator.getSessionExpiresAt(request)
			);
		}

		logger.info("GET /reset-password - returning response.");
		return generateRedirectResponse(HttpStatus.OK, null, null, null);
	}

	@ResponseStatus(code = HttpStatus.CREATED)
	@PostMapping("/reset-password/{passwordResetToken}")
	public ResponseEntity<ResponseBody<RedirectUrlDto>> resetPassword(
		HttpServletRequest request,
		@PathVariable String passwordResetToken,
		@RequestBody ResetPasswordForm resetPasswordForm
	) throws Exception {
		logger.info(String.format("POST /reset-password/%s - endpoint accessed.", passwordResetToken));
		
		AuthValidator.validateResetPasswordForm(resetPasswordForm);
		AuthValidator.validatePasswordResetTokenHash(passwordResetToken);

		if (chatterAuthenticator.isChatterAuthenticated()) {
			return generateRedirectResponse(
				HttpStatus.OK, ALREADY_LOGGED_IN_MESSAGE, Constants.HOME_URL, this.chatterAuthenticator.getSessionExpiresAt(request)
			);
		}

		authService.resetPasswordForChatter(resetPasswordForm.getPassword().trim(), passwordResetToken);
		
		logger.info(String.format("POST /reset-password/%s - returning response.", passwordResetToken));
		return generateRedirectResponse(
			HttpStatus.CREATED, PASSWORD_RESET_SUCCESS_MESSAGE, Constants.LOGIN_URL, null
		);
	}
}
