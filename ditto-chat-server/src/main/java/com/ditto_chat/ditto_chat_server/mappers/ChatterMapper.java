package com.ditto_chat.ditto_chat_server.mappers;

import com.ditto_chat.ditto_chat_server.dtos.ChatterRegistrationForm;
import com.ditto_chat.ditto_chat_server.entities.Chatter;
import com.ditto_chat.ditto_chat_server.utils.CryptoTool;
import com.ditto_chat.ditto_chat_server.utils.TimeTool;

public class ChatterMapper {
    public static Chatter fromChatterRegistrationFormToChatter(ChatterRegistrationForm chatterRegistrationForm) {
        return new Chatter(
            CryptoTool.generateUUID(),
            chatterRegistrationForm.getName().trim(), chatterRegistrationForm.getSurname().trim(),
            chatterRegistrationForm.getUsername().trim(), chatterRegistrationForm.getEmail().trim(),
            CryptoTool.hashString(chatterRegistrationForm.getPassword().trim()),
            TimeTool.getCurrentTimestamp()
        );
	}
}
