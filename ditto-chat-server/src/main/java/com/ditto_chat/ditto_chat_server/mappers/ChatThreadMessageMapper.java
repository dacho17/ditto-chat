package com.ditto_chat.ditto_chat_server.mappers;

import com.ditto_chat.ditto_chat_server.dtos.ChatThreadMessageDto;
import com.ditto_chat.ditto_chat_server.entities.ChatThread;
import com.ditto_chat.ditto_chat_server.entities.ChatThreadMessage;
import com.ditto_chat.ditto_chat_server.entities.ChatThreadParticipant;
import com.ditto_chat.ditto_chat_server.entities.UploadedFile;
import com.ditto_chat.ditto_chat_server.utils.CryptoTool;
import com.ditto_chat.ditto_chat_server.utils.TimeTool;

public class ChatThreadMessageMapper {
    public static ChatThreadMessage createNewChatThreadMesasage(ChatThreadParticipant senderChatThreadParticipant, ChatThread messagedChatThread, String messageContent, UploadedFile possiblyAttachedUploadedFile) {
        return new ChatThreadMessage(
            CryptoTool.generateUUID(),
            messageContent.trim(),
            TimeTool.getCurrentTimestamp(),
            senderChatThreadParticipant,
            messagedChatThread,
            possiblyAttachedUploadedFile
        );
    }

    public static ChatThreadMessageDto fromChatThreadMessageToChatThreadMessageDto(ChatThreadMessage chatThreadMessage, ChatThreadParticipant loggedInChatterParticipant) {
        return new ChatThreadMessageDto(
            chatThreadMessage.getId().toString(),
            chatThreadMessage.getSenderChatThreadParticipant().getChatter().getId().toString(),
            chatThreadMessage.getMessageContent(),
            chatThreadMessage.getSharedFile() != null
                ? SharedFileMapper.fromSharedFileToSharedFileDto(
                    chatThreadMessage.getSharedFile(), chatThreadMessage.getSenderChatThreadParticipant().getChatter().getId()
                ) : null,
            chatThreadMessage.getMessageRegisteredAt(),
            isChatThreadMessageSeen(chatThreadMessage, loggedInChatterParticipant)
        );
    }

    private static boolean isChatThreadMessageSeen(ChatThreadMessage chatThreadMessage, ChatThreadParticipant loggedInChatterParticipant) {
        boolean isMessageSendByLoggedInChatterParticipant =
            chatThreadMessage.getSenderChatThreadParticipant().getId().equals(loggedInChatterParticipant.getId());
        if (isMessageSendByLoggedInChatterParticipant == true) {
            return true;
        }

        // chatThreadMessage is received. It needs to be checked whether the message is after the last seen message
        ChatThreadMessage lastSeenChatThreadMessageByLoggedInChatterParticipant =
            loggedInChatterParticipant.getLastSeenChatThreadMessage();
        if (lastSeenChatThreadMessageByLoggedInChatterParticipant == null) {
            // if chatter has seen no messages, all received messages are unseen
            return false;
        }

        // if message was registered before last seen message, it was already seen
        return lastSeenChatThreadMessageByLoggedInChatterParticipant.getMessageRegisteredAt().getTime() >= chatThreadMessage.getMessageRegisteredAt().getTime();
    }
}
