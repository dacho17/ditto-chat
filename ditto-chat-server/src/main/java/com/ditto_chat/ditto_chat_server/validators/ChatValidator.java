package com.ditto_chat.ditto_chat_server.validators;

import com.ditto_chat.ditto_chat_server.dtos.ChatThreadMessageForm;

public class ChatValidator extends GeneralValidator{
    private static final short MINIMAL_CHAT_THREAD_MESSAGE_CONTENT_LENGTH = 1;

    public static void validateChatThreadMessageForm(ChatThreadMessageForm chatThreadMessageForm) {
        boolean isAttachmentSent = chatThreadMessageForm.isAttachmentSent();
        boolean isMessageContentValid = ChatValidator.isChatThreadMessageContentValid(chatThreadMessageForm.getMessageContent(), isAttachmentSent);
		if (isMessageContentValid == false) {
			throwValidationException(String.format("MessageContent validation has failed in validateChatThreadMessageForm for messageContent=%s and isAttachmentSent=%s.",
				chatThreadMessageForm.getMessageContent(), isAttachmentSent));
		}
    }

    private static boolean isChatThreadMessageContentValid(String chatThreadMessageContent, boolean isAttachmentSent) {
        if (isAttachmentSent == true) {
            return chatThreadMessageContent != null && 0 <= chatThreadMessageContent.trim().length();
        } else {
            return chatThreadMessageContent != null && ChatValidator.MINIMAL_CHAT_THREAD_MESSAGE_CONTENT_LENGTH <= chatThreadMessageContent.trim().length();
        }
    }
}
