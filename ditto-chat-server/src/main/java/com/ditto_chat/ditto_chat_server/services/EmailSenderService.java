package com.ditto_chat.ditto_chat_server.services;

import java.sql.Timestamp;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import com.ditto_chat.ditto_chat_server.dtos.EmailDto;
import com.ditto_chat.ditto_chat_server.exceptions.EmailSendingException;
import com.ditto_chat.ditto_chat_server.utils.FormattingTool;
import com.ditto_chat.ditto_chat_server.utils.TimeTool;

@Service
public class EmailSenderService {
    @Autowired
    private JavaMailSender javaMailSender;
    @Value("${spring.mail.username}")
    private String EMAIL_SENDER_USERNAME;
    @Value("${client.domain}")
    private String BOOKING_CLIENT_DOMAIN;

    private final Logger logger = LoggerFactory.getLogger(EmailSenderService.class);
    private final String EMAIL_SUBJECT = "Password Reset Request";
    private final String EMAIL_CONTENT = "You have requested a password reset.\n\nAccess the following link to reset your password:\n%s/tenant/reset-password?passwordResetToken=%s\n\nThe link will be active for the next 30 minutes.";
 
    public Timestamp sendEmail(EmailDto emailDtoToSend) {
        try {
            SimpleMailMessage mailMessage
                = new SimpleMailMessage();
 
            mailMessage.setFrom(this.EMAIL_SENDER_USERNAME);
            mailMessage.setTo(emailDtoToSend.getRecipient());
            mailMessage.setText(emailDtoToSend.getContent());
            mailMessage.setSubject(emailDtoToSend.getSubject());
 
            this.javaMailSender.send(mailMessage);
            Timestamp emailSentAt = TimeTool.getCurrentTimestamp();

            logger.info(String.format("An email [email=%s] has successfully been sent at %s.", emailDtoToSend.toString(), emailSentAt.toString()));
            return emailSentAt;
        } catch (Exception e) {
            logger.error(String.format("An exception occurred while sending an email [email=%s]. Exception=[%s]",
                emailDtoToSend.toString(), FormattingTool.stringifyException(e)));
            throw new EmailSendingException();
        }
    }

    public EmailDto generatePasswordResetEmail(String email, String passwordResetTokenHash) {
        String httpsBookingClientUrl = "https://" + this.BOOKING_CLIENT_DOMAIN;

        String emailContent = String.format(this.EMAIL_CONTENT, httpsBookingClientUrl, passwordResetTokenHash);
        return new EmailDto(email, this.EMAIL_SUBJECT, emailContent);
    }
}
