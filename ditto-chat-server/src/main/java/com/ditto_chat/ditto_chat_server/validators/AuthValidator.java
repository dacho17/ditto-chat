package com.ditto_chat.ditto_chat_server.validators;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.ditto_chat.ditto_chat_server.dtos.ChatterRegistrationForm;
import com.ditto_chat.ditto_chat_server.dtos.ForgotPasswordForm;
import com.ditto_chat.ditto_chat_server.dtos.LoginForm;
import com.ditto_chat.ditto_chat_server.dtos.ResetPasswordForm;
import com.ditto_chat.ditto_chat_server.utils.FormattingTool;
import com.ditto_chat.ditto_chat_server.utils.CryptoTool;

import jakarta.mail.internet.InternetAddress;

public class AuthValidator extends GeneralValidator{
    private static final Logger logger = LoggerFactory.getLogger(AuthValidator.class);
    private static final short MINIMAL_CHATTER_NAME_LENGTH = 2;
    private static final short MINIMAL_CHATTER_USERNAME_LENGTH = 6;
    private static final short MINIMAL_PASSWORD_LENGTH = 6;

    public static void validateChatterRegistrationForm(ChatterRegistrationForm chatterRegistrationForm) {
		boolean isNameValid = AuthValidator.validateChatterName(chatterRegistrationForm.getName());
		boolean isSurnameValid = AuthValidator.validateChatterName(chatterRegistrationForm.getSurname());
		if (isNameValid == false || isSurnameValid == false) {
			throwValidationException(String.format("Name validation has failed in validateChatterRegistrationForm for name=%s and surname=%s.", 
				chatterRegistrationForm.getName(), chatterRegistrationForm.getSurname()));
		}

        boolean isUsernameValid = AuthValidator.validateChatterUsername(chatterRegistrationForm.getUsername());
		if (isUsernameValid == false) {
			throwValidationException(String.format("Username validation has failed in validateChatterRegistrationForm for username=%s.",
				chatterRegistrationForm.getUsername()));
		}

		boolean isEmailValid = AuthValidator.validateEmail(chatterRegistrationForm.getEmail());
		if (isEmailValid == false) {
			throwValidationException(String.format("Email validation has failed in validateChatterRegistrationForm for email=%s.",
				chatterRegistrationForm.getEmail()));
		}

		boolean isPasswordValid = AuthValidator.validatePassword(chatterRegistrationForm.getPassword());
		if (isPasswordValid == false) {
			throwValidationException(String.format("Password validation has failed in validateChatterRegistrationForm."));
		}
    }

    public static void validateLoginForm(LoginForm loginForm) {
		boolean isEmailValid = AuthValidator.validateEmail(loginForm.getEmail());
		if (isEmailValid == false) {
			throwValidationException(String.format("Email validation has failed in validateLoginForm for email=%s.",
				loginForm.getEmail()));
		}

		boolean isPasswordValid = AuthValidator.validatePassword(loginForm.getPassword());
		if (isPasswordValid == false) {
			throwValidationException(String.format("Password validation has failed in validateLoginForm."));
		}
    }

    public static void validateForgotPasswordForm(ForgotPasswordForm forgotPasswordForm) {
		boolean isEmailValid = AuthValidator.validateEmail(forgotPasswordForm.getEmail());
		if (isEmailValid == false) {
			throwValidationException(String.format("Email validation has failed in validateForgotPasswordForm for email=%s.",
				forgotPasswordForm.getEmail()));
		}
    }

    public static void validateResetPasswordForm(ResetPasswordForm resetPasswordForm) {
		boolean isPasswordValid = AuthValidator.validatePassword(resetPasswordForm.getPassword());
		if (isPasswordValid == false) {
			throwValidationException(String.format("Password validation has failed in validateResetPasswordForm."));
		}

        boolean isRepeatedPasswordValid = AuthValidator.validatePassword(resetPasswordForm.getRepeatedPassword());
		if (isRepeatedPasswordValid == false) {
			throwValidationException(String.format("Repeated Password validation has failed in validateResetPasswordForm."));
		}

		boolean doPasswordsMatch = resetPasswordForm.getPassword().equals(resetPasswordForm.getRepeatedPassword());
		if (doPasswordsMatch != true) {
			throwValidationException("Password Matching has failed in validateResetPasswordForm. Received passwords do not match.");
		}
    }

	public static void validatePasswordResetTokenHash(String passwordResetTokenHash) {
		boolean isTokenCorrectlyHashed = CryptoTool.isHashedWithBcrypt(passwordResetTokenHash);
		
		if (isTokenCorrectlyHashed == false) {
			throwValidationException(String.format(
				"Password reset token Validation in validatePasswordResetTokenHash failed for passwordResetTokenHash=%s.", passwordResetTokenHash));
		}
	}

    private static boolean validateChatterName(String name) {
        return name != null && name.trim().length() >= AuthValidator.MINIMAL_CHATTER_NAME_LENGTH;
    }

    private static boolean validateChatterUsername(String username) {
        return username != null && username.trim().length() >= AuthValidator.MINIMAL_CHATTER_USERNAME_LENGTH;
    }

	private static boolean validateEmail(String email) {
		if (email == null) return false;

		try {
			InternetAddress addr = new InternetAddress(email.trim());
			addr.validate();
			return true;
		} catch (Exception e) {
			logger.error(String.format("An exception occurred while validating an email. ExceptionMessage=[%s]", FormattingTool.stringifyException(e)));
			return false;
		}
	}

	private static boolean validatePassword(String password) {
		return password != null && password.trim().length() >= AuthValidator.MINIMAL_PASSWORD_LENGTH;
	}
}
