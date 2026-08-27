package com.ditto_chat.ditto_chat_server.unit;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;

import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;

import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.ditto_chat.ditto_chat_server.TestConstants;
import com.ditto_chat.ditto_chat_server.dtos.ChatterRegistrationForm;
import com.ditto_chat.ditto_chat_server.dtos.ForgotPasswordForm;
import com.ditto_chat.ditto_chat_server.dtos.LoginForm;
import com.ditto_chat.ditto_chat_server.dtos.ResetPasswordForm;
import com.ditto_chat.ditto_chat_server.exceptions.BadRequestException;
import com.ditto_chat.ditto_chat_server.utils.TimeTool;
import com.ditto_chat.ditto_chat_server.validators.AuthValidator;


class AuthValidatorTest {
    private static final Logger logger = LoggerFactory.getLogger(AuthValidatorTest.class);
    private static final Timestamp testStartTimestamp = TimeTool.getCurrentTimestamp();

    private static List<String> possibleNameValidityCases;
    private static List<String> possibleSurnameValidityCases;
    private static List<String> possibleUsernameValidityCases;
    private static List<String> possibleEmailValidityCases;
    private static List<String> possiblePasswordValidityCases;

    @BeforeAll
    static void setUp() {
        possibleNameValidityCases = new ArrayList<>(List.of(TestConstants.INVALID_NAME, TestConstants.VALID_NAME));
        possibleNameValidityCases.addFirst(null);
        
        possibleSurnameValidityCases = new ArrayList<>(List.of(TestConstants.INVALID_SURNAME, TestConstants.VALID_SURNAME));
        possibleSurnameValidityCases.addFirst(null);

        possibleUsernameValidityCases = new ArrayList<>(List.of(TestConstants.INVALID_USERNAME, TestConstants.VALID_USERNAME));
        possibleUsernameValidityCases.addFirst(null);

        possibleEmailValidityCases = new ArrayList<>(List.of(TestConstants.INVALID_EMAIL, TestConstants.VALID_EMAIL));
        possibleEmailValidityCases.addFirst(null);
        
        possiblePasswordValidityCases = new ArrayList<>(List.of(TestConstants.INVALID_PASSWORD, TestConstants.VALID_PASSWORD));
        possiblePasswordValidityCases.addFirst(null);
    }

    @AfterAll
    static void finish() {
        Timestamp testEndTimestamp = TimeTool.getCurrentTimestamp();
        logger.info(String.format("AuthValidatorTest started Running at: %s, and finished at: %s.", testStartTimestamp, testEndTimestamp));
    }

    @Test
    void validateChatterRegistrationForm_invalidCases() {
        List<ChatterRegistrationForm> invalidTestFormList = new ArrayList<>();  // holds permutations of all possible invalid cases
        for (String nameValidityCase : possibleNameValidityCases) {
            for (String surnameValidityCase : possibleSurnameValidityCases) {
                for (String usernameValidityCase : possibleUsernameValidityCases) {
                    for (String emailValidityCase : possibleEmailValidityCases) {
                        for (String passwordValidityCase : possiblePasswordValidityCases) {
                            if (nameValidityCase != TestConstants.VALID_NAME || surnameValidityCase != TestConstants.VALID_SURNAME
                                || usernameValidityCase != TestConstants.VALID_USERNAME
                                || emailValidityCase != TestConstants.VALID_EMAIL || passwordValidityCase != TestConstants.VALID_PASSWORD) 
                                    invalidTestFormList.add(new ChatterRegistrationForm(
                                        nameValidityCase, surnameValidityCase, usernameValidityCase, emailValidityCase, passwordValidityCase
                                    ));
                        }
                    }
                }
            }
        }
        
        for (ChatterRegistrationForm invalidForm : invalidTestFormList) {
            assertThrows(BadRequestException.class, () -> {
                AuthValidator.validateChatterRegistrationForm(invalidForm);
            });
        }
    }

    @Test
    void validateChatterRegistrationForm_validCase() {
        final ChatterRegistrationForm validForm = new ChatterRegistrationForm(
            TestConstants.VALID_NAME, TestConstants.VALID_SURNAME, TestConstants.VALID_USERNAME, TestConstants.VALID_EMAIL, TestConstants.VALID_PASSWORD);

        assertDoesNotThrow(() -> {
            AuthValidator.validateChatterRegistrationForm(validForm);
        });
    }

    @Test
    void validateLoginForm_invalidCases() {
        List<LoginForm> invalidTestFormList = new ArrayList<>();  // holds permutations of all possible invalid cases
        for (String emailValidityCase : possibleEmailValidityCases) {
            for (String passwordValidityCase : possiblePasswordValidityCases) {
                if (emailValidityCase != TestConstants.VALID_EMAIL || passwordValidityCase != TestConstants.VALID_PASSWORD) 
                    invalidTestFormList.add(new LoginForm(
                        emailValidityCase, passwordValidityCase
                    ));
            }
        }
        
        for (LoginForm invalidForm : invalidTestFormList) {
            assertThrows(BadRequestException.class, () -> {
                AuthValidator.validateLoginForm(invalidForm);
            });
        }
    }

    @Test
    void validateLoginForm_validCase() {
        final LoginForm validForm = new LoginForm(
            TestConstants.VALID_EMAIL,
            TestConstants.VALID_PASSWORD
        );

        assertDoesNotThrow(() -> {
            AuthValidator.validateLoginForm(validForm);
        });
    }

    @Test
    void validateForgotPasswordForm_invalidCases() {
        List<ForgotPasswordForm> invalidTestFormList = new ArrayList<>();  // holds permutations of all possible invalid cases
        for (String emailValidityCase : possibleEmailValidityCases) {
            if (emailValidityCase != TestConstants.VALID_EMAIL)
                invalidTestFormList.add(new ForgotPasswordForm(
                    emailValidityCase
                ));
        }
        
        for (ForgotPasswordForm invalidForm : invalidTestFormList) {
            assertThrows(BadRequestException.class, () -> {
                AuthValidator.validateForgotPasswordForm(invalidForm);
            });
        }
    }

    @Test
    void validateForgotPasswordForm_validCase() {
        final ForgotPasswordForm validForm = new ForgotPasswordForm(
            TestConstants.VALID_EMAIL
        );

        assertDoesNotThrow(() -> {
            AuthValidator.validateForgotPasswordForm(validForm);
        });
    }

    @Test
    void validateResetPasswordForm_invalidCases() {
        List<ResetPasswordForm> invalidTestFormList = new ArrayList<>();  // holds permutations of all possible invalid cases
        for (String passwordValidityCase : possiblePasswordValidityCases) {
            for (String repeatedPasswordValidityCase : possiblePasswordValidityCases) {
                if (passwordValidityCase != TestConstants.VALID_PASSWORD || repeatedPasswordValidityCase != TestConstants.VALID_PASSWORD) 
                    invalidTestFormList.add(new ResetPasswordForm(
                        passwordValidityCase, repeatedPasswordValidityCase
                    ));
            }
        }
        
        for (ResetPasswordForm invalidForm : invalidTestFormList) {
            assertThrows(BadRequestException.class, () -> {
                AuthValidator.validateResetPasswordForm(invalidForm);
            });
        }
    }

    @Test
    void validateResetPasswordForm_validCase() {
        final ResetPasswordForm validForm = new ResetPasswordForm(
            TestConstants.VALID_PASSWORD,
            TestConstants.VALID_PASSWORD
        );

        assertDoesNotThrow(() -> {
            AuthValidator.validateResetPasswordForm(validForm);
        });
    }

    @Test
    void validatePasswordResetTokenHash_invalidCases() {
        final String invalidPasswordResetTokenHash = TestConstants.INVALID_PASSWORD_RESET_TOKEN_HASH;

        assertThrows(BadRequestException.class, () -> {
            AuthValidator.validatePasswordResetTokenHash(invalidPasswordResetTokenHash);
        });
    }

    @Test
    void validatePasswordResetTokenHash_validCase() {
        final String validPasswordResetTokenHash = TestConstants.VALID_PASSWORD_RESET_TOKEN_HASH;

        assertDoesNotThrow(() -> {
            AuthValidator.validatePasswordResetTokenHash(validPasswordResetTokenHash);
        });
    }
}
