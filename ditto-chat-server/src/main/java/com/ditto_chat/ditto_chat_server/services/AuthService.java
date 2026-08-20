package com.ditto_chat.ditto_chat_server.services;

import java.sql.Timestamp;

import org.hibernate.Session;
import org.hibernate.Transaction;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import com.ditto_chat.ditto_chat_server.dtos.ChatterRegistrationForm;
import com.ditto_chat.ditto_chat_server.dtos.EmailDto;
import com.ditto_chat.ditto_chat_server.entities.Chatter;
import com.ditto_chat.ditto_chat_server.exceptions.BadRequestException;
import com.ditto_chat.ditto_chat_server.exceptions.ResourceConflictException;
import com.ditto_chat.ditto_chat_server.mappers.ChatterMapper;
import com.ditto_chat.ditto_chat_server.repositories.ChatterRepository;
import com.ditto_chat.ditto_chat_server.utils.CryptoTool;
import com.ditto_chat.ditto_chat_server.utils.TimeTool;

@Service
public class AuthService {
    private EmailSenderService emailSenderService;
    private ChatterRepository chatterRepository;
    private Session hibernateSession;
    private final Logger logger = LoggerFactory.getLogger(AuthService.class);
    private final String EMAIL_ALREADY_IN_USE_MESSAGE = "Please use different email";
    private final String UNKNOWN_EMAIL_MESSAGE = "Please enter your email correctly";
    private final String RESET_PASSWORD_EXPIRED_MESSAGE = "Please send new password reset request";
    private final int MINUTES_TO_RESET_PASSWORD = 30;

    public AuthService(
        ChatterRepository chatterRepository,
        EmailSenderService emailSenderService,
        Session hibernateSession
    ) {
        this.chatterRepository = chatterRepository;
        this.emailSenderService = emailSenderService;
        this.hibernateSession = hibernateSession;
    }

    public void registerNewChatter(ChatterRegistrationForm chatterRegistrationForm) {
        Chatter chatterWithSameEmail = this.chatterRepository.retrieveByEmail(chatterRegistrationForm.getEmail());
        if (chatterWithSameEmail != null) {
            logger.info(String.format("Chatter with email=%s already exists in the database. New Chatter with the same email can not be registered.", chatterRegistrationForm.getEmail()));
			throw new ResourceConflictException(this.EMAIL_ALREADY_IN_USE_MESSAGE);
        }

        Transaction dbTransaction = this.hibernateSession.beginTransaction();
        
        Chatter chatterToCreate = ChatterMapper.fromChatterRegistrationFormToChatter(chatterRegistrationForm);
        this.chatterRepository.createChatter(chatterToCreate);

        dbTransaction.commit();
    }

    public void registerChatterLogin(String email) {
        Transaction dbTransaction = this.hibernateSession.beginTransaction();

        Chatter foundChatter = this.chatterRepository.retrieveByEmail(email);
        if (foundChatter == null) {
            logger.error(String.format("Chatter with email=%s has not been found. Login will not be registered for the Chatter.", email));
			throw new BadRequestException();
        }

        this.chatterRepository.updateChatterLastLoginAt(foundChatter);
        dbTransaction.commit();
    }

    public void enablePasswordResetForChatter(String email) {
        Chatter foundChatter = this.chatterRepository.retrieveByEmail(email);
        if (foundChatter == null) {
            logger.warn(String.format("Chatter with email=%s has not been found. Password Reset Request is not valid.", email));
			throw new BadRequestException(this.UNKNOWN_EMAIL_MESSAGE);
        }

        Transaction dbTransaction = this.hibernateSession.beginTransaction();
        
        String passwordResetTokenHash = CryptoTool.hashString(CryptoTool.generateUUID().toString());
        Timestamp passwordResetValidUntil = this.generateDeadlineForPasswordReset();
        this.chatterRepository.updateChatterPasswordReset(foundChatter, passwordResetTokenHash, passwordResetValidUntil);

        EmailDto resetPasswordEmailDto = this.emailSenderService.generatePasswordResetEmail(foundChatter.getEmail(), foundChatter.getPasswordResetTokenHash());
        this.emailSenderService.sendEmail(resetPasswordEmailDto);

        dbTransaction.commit();
    }

    public void resetPasswordForChatter(String newChatterPassword, String passwordResetTokenHash) {
        Chatter foundChatter = this.chatterRepository.retrieveByPasswordResetTokenHash(passwordResetTokenHash);
        if (foundChatter == null) {
            logger.warn(String.format("Chatter with passwordResetTokenHash=%s has not been found. Password Reset Request is not valid.", passwordResetTokenHash));
			throw new BadRequestException();
        }

        if (this.isPasswordResetUnexpired(foundChatter.getPasswordResetValidUntil()) == false) {
			logger.warn(String.format("Chatter's (id=%s) passwordResetTokenHash=%s has expired on=%s",
                foundChatter.getId(), passwordResetTokenHash, foundChatter.getPasswordResetValidUntil()));
			throw new BadRequestException(this.RESET_PASSWORD_EXPIRED_MESSAGE);
        }

        Transaction dbTransaction = this.hibernateSession.beginTransaction();

        String newPasswordHash = CryptoTool.hashString(newChatterPassword);
        this.chatterRepository.updateChatterPassword(foundChatter, newPasswordHash);
        dbTransaction.commit();
    }

    private Timestamp generateDeadlineForPasswordReset() {
        Timestamp currentTimestamp = TimeTool.getCurrentTimestamp();
        return TimeTool.addMinutesToTimestamp(currentTimestamp, MINUTES_TO_RESET_PASSWORD);
	}

    private boolean isPasswordResetUnexpired(Timestamp passwordResetValidUntilTimestamp) {
        long currentTime = TimeTool.getCurrentTimestamp().getTime();
		long passwordRequestValidUntilTime = passwordResetValidUntilTimestamp.getTime();

		if (currentTime >= passwordRequestValidUntilTime) {
            return false;
        }

        return true;
    }
}
