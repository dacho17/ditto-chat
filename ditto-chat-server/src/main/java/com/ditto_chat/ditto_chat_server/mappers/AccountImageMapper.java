package com.ditto_chat.ditto_chat_server.mappers;

import com.ditto_chat.ditto_chat_server.dtos.AccountImageDto;
import com.ditto_chat.ditto_chat_server.entities.AccountImage;
import com.ditto_chat.ditto_chat_server.entities.Chatter;
import com.ditto_chat.ditto_chat_server.entities.UploadedFile;
import com.ditto_chat.ditto_chat_server.utils.CryptoTool;

public class AccountImageMapper {
    public static AccountImage fromUploadedFileToAccountImage(UploadedFile accountImageUploadedFile, Chatter accountImageChatter) {
        return new AccountImage(
            CryptoTool.generateUUID(),
            accountImageChatter,
            accountImageUploadedFile
        );
    }

    public static AccountImageDto fromAccountImageToAccountImageDto(AccountImage accountImage) {
        return new AccountImageDto("TODO/" + accountImage.getUploadedFile().getS3ObjectKey());
    }
}
