package com.ditto_chat.ditto_chat_server.validators;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.ditto_chat.ditto_chat_server.exceptions.BadRequestException;

public class GeneralValidator {
    private static final Logger logger = LoggerFactory.getLogger(GeneralValidator.class);

    protected static void throwValidationException(String logMessage) throws BadRequestException  {
        logger.error(logMessage);
        throw new BadRequestException();
    }
}
