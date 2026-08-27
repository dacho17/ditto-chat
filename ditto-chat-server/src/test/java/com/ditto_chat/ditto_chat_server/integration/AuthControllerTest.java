package com.ditto_chat.ditto_chat_server.integration;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;

import java.sql.Timestamp;

import org.hibernate.Session;
import org.hibernate.Transaction;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.MethodOrderer;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestMethodOrder;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.springframework.test.web.servlet.result.MockMvcResultMatchers;

import com.ditto_chat.ditto_chat_server.TestConstants;
import com.ditto_chat.ditto_chat_server.dtos.ChatterRegistrationForm;
import com.ditto_chat.ditto_chat_server.dtos.ForgotPasswordForm;
import com.ditto_chat.ditto_chat_server.dtos.LoginForm;
import com.ditto_chat.ditto_chat_server.dtos.ResetPasswordForm;
import com.ditto_chat.ditto_chat_server.entities.Chatter;
import com.ditto_chat.ditto_chat_server.repositories.ChatterRepository;
import com.ditto_chat.ditto_chat_server.utils.TimeTool;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

// TODO: write the controller tests following this pattern
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.MOCK)
@AutoConfigureMockMvc
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
public class AuthControllerTest {
    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private ChatterRepository chatterRepository;
    @Autowired
    private Session hibernateSession;
    private static Gson gson = new GsonBuilder().create();
    private static final Logger logger = LoggerFactory.getLogger(AuthControllerTest.class);
    private static final Timestamp testStartTimestamp = TimeTool.getCurrentTimestamp();

    @AfterAll
    static void finish() {
        final Timestamp testEndTimestamp = TimeTool.getCurrentTimestamp();
        logger.info(String.format("AuthValidatorTest started Running at: %s, and finished at: %s.", testStartTimestamp, testEndTimestamp));
    }

    @Test
    @Order(value = 1)
	void register_success() throws Exception {
		ChatterRegistrationForm newChatterRegistrationForm =
            new ChatterRegistrationForm(TestConstants.VALID_NAME, TestConstants.VALID_SURNAME,
                TestConstants.VALID_USERNAME,
                TestConstants.VALID_EMAIL, TestConstants.VALID_PASSWORD
            );
	
        mockMvc.perform(
            MockMvcRequestBuilders.post("/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(gson.toJson(newChatterRegistrationForm)))
                .andExpect(MockMvcResultMatchers.status().isCreated());
	}

    @Test
    @Order(value = 2)
    void login_success() throws Exception {
		LoginForm registeredChatterLoginForm =
            new LoginForm(TestConstants.VALID_EMAIL, TestConstants.VALID_PASSWORD);
	
        mockMvc.perform(
            MockMvcRequestBuilders.post("/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(gson.toJson(registeredChatterLoginForm)))
                .andExpect(MockMvcResultMatchers.status().isCreated());

        Chatter loggedInChatter = this.chatterRepository.retrieveByEmail(TestConstants.VALID_EMAIL);
        assertNotNull(loggedInChatter.getLastLoginAt());
    }

    @Test
    @Order(value = 3)
    void forgotPassword_success() throws Exception {
		ForgotPasswordForm registeredChatterForgotPasswordForm =
            new ForgotPasswordForm(TestConstants.VALID_EMAIL);
	
        mockMvc.perform(
            MockMvcRequestBuilders.post("/forgot-password")
                .contentType(MediaType.APPLICATION_JSON)
                .content(gson.toJson(registeredChatterForgotPasswordForm)))
                .andExpect(MockMvcResultMatchers.status().isCreated());

        Chatter forgetfulChatter = this.chatterRepository.retrieveByEmail(TestConstants.VALID_EMAIL);
        assertNotNull(forgetfulChatter.getPasswordResetTokenHash());
        assertNotNull(forgetfulChatter.getPasswordResetValidUntil());
    }

    @Test
    @Order(value = 4)
    void resetPassword_success() throws Exception {
        Chatter registeredChatter = this.chatterRepository.retrieveByEmail(TestConstants.VALID_EMAIL);
        assertNotNull(registeredChatter);

        String passwordResetTokenHash = registeredChatter.getPasswordResetTokenHash();
        assertNotNull(passwordResetTokenHash);

        String passwordHashBeforeReset = registeredChatter.getPassword();
		ResetPasswordForm registeredChatterResetPasswordForm =
            new ResetPasswordForm(TestConstants.RESET_VALID_PASSWORD, TestConstants.RESET_VALID_PASSWORD);
	
        mockMvc.perform(
            MockMvcRequestBuilders.post(String.format("/reset-password?passwordResetToken=%s", passwordResetTokenHash))
                .contentType(MediaType.APPLICATION_JSON)
                .content(gson.toJson(registeredChatterResetPasswordForm)))
                .andExpect(MockMvcResultMatchers.status().isCreated());

        Chatter registeredChatterWithResetPassword = this.chatterRepository.retrieveByEmail(TestConstants.VALID_EMAIL);
        assertNotNull(registeredChatterWithResetPassword);
        assertNull(registeredChatterWithResetPassword.getPasswordResetTokenHash());
        assertNull(registeredChatterWithResetPassword.getPasswordResetValidUntil());
        assertFalse(registeredChatterWithResetPassword.getPassword().equals(passwordHashBeforeReset));
    }

    @Test
    @Order(value = 5)
    void cleanupTestData() {
        logger.info("Cleaning up test data...");
        Chatter registeredChatter = this.chatterRepository.retrieveByEmail(TestConstants.VALID_EMAIL);

        Transaction dbTransaction = this.hibernateSession.beginTransaction();		
        hibernateSession.remove(registeredChatter);
        dbTransaction.commit();

        Chatter removedRegisteredChatter = this.chatterRepository.retrieveByEmail(TestConstants.VALID_EMAIL);
        assertNull(removedRegisteredChatter);

        logger.info("Test Data Cleaned!");
    }
}
