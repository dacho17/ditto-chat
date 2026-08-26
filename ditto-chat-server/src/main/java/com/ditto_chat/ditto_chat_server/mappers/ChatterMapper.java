package com.ditto_chat.ditto_chat_server.mappers;

import com.ditto_chat.ditto_chat_server.dtos.ChatterOverviewDto;
import com.ditto_chat.ditto_chat_server.dtos.ChatterRegistrationForm;
import com.ditto_chat.ditto_chat_server.entities.AccountImage;
import com.ditto_chat.ditto_chat_server.entities.ChatThread;
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

    public static ChatterOverviewDto fromChatterToChatterOverviewDto(Chatter chatter, AccountImage accountImage, ChatThread chatThreadWithLoggedInChatter) {
        return new ChatterOverviewDto(chatter.getId().toString(),
            chatter.getName(), chatter.getSurname(),
            chatter.getUsername(), chatter.getEmail(),
            accountImage != null ? accountImage.getUploadedFile().getFileName() : null, // TODO: this value must be corrected! 
            false,
            chatThreadWithLoggedInChatter != null ? chatThreadWithLoggedInChatter.getId().toString() : null
        );
    }
}
