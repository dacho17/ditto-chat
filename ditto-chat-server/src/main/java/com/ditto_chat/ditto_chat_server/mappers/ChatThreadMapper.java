package com.ditto_chat.ditto_chat_server.mappers;

import java.sql.Timestamp;
import java.util.LinkedList;
import java.util.List;

import com.ditto_chat.ditto_chat_server.dtos.ChatThreadDto;
import com.ditto_chat.ditto_chat_server.dtos.ChatThreadMessageDto;
import com.ditto_chat.ditto_chat_server.dtos.ChatThreadOverviewDto;
import com.ditto_chat.ditto_chat_server.dtos.ResponsePagedListDto;
import com.ditto_chat.ditto_chat_server.entities.AccountImage;
import com.ditto_chat.ditto_chat_server.entities.ChatThread;
import com.ditto_chat.ditto_chat_server.entities.ChatThreadParticipant;
import com.ditto_chat.ditto_chat_server.entities.Chatter;
import com.ditto_chat.ditto_chat_server.utils.CryptoTool;
import com.ditto_chat.ditto_chat_server.utils.TimeTool;

public class ChatThreadMapper {
    public static ChatThread newNonGroupChatThread(Chatter loggedInChatter, Chatter peerChatter) {
        Timestamp chatThreadCreatedAtTimestamp = TimeTool.getCurrentTimestamp();
        List<ChatThreadParticipant> newChatThreadParticipants = new LinkedList<>();

        ChatThread newChatThead = new ChatThread(
            CryptoTool.generateUUID(),
            false,
            chatThreadCreatedAtTimestamp,
            newChatThreadParticipants
        );

        ChatThreadParticipant loggedInChatterParticipant = new ChatThreadParticipant(
            CryptoTool.generateUUID(),
            chatThreadCreatedAtTimestamp,
            loggedInChatter,
            newChatThead
        );

        ChatThreadParticipant peeChatThreadParticipant = new ChatThreadParticipant(
            CryptoTool.generateUUID(),
            chatThreadCreatedAtTimestamp,
            peerChatter,
            newChatThead
        );

        newChatThreadParticipants.add(loggedInChatterParticipant);
        newChatThreadParticipants.add(peeChatThreadParticipant);
    
        return newChatThead;
    }

    public static ChatThreadOverviewDto fromChatThreadToChatThreadOverviewDto(ChatThread chatThread, Integer numberOfUnseenMessages, ChatThreadParticipant loggedInChatterParticipant, ChatThreadParticipant peerChatterParticipant, AccountImage peerChatterAccountImage) {
        Timestamp lastChatThreadMessageRegisteredAt = null;
        String lastChatThreadMessageContent = null;
        if (chatThread.getLastChatThreadMessage() != null && (loggedInChatterParticipant.getClearedChatThreadHistoryAt() == null ||
            chatThread.getLastChatThreadMessage().getMessageRegisteredAt().after(loggedInChatterParticipant.getClearedChatThreadHistoryAt()))
        ) {
            lastChatThreadMessageRegisteredAt = chatThread.getLastChatThreadMessage().getMessageRegisteredAt();
            lastChatThreadMessageContent = chatThread.getLastChatThreadMessage().getMessageContent();
        }

        String loggedInChatterLastSeenChatThreadMessage = null;
        if (loggedInChatterParticipant.getLastSeenChatThreadMessage() != null && (loggedInChatterParticipant.getClearedChatThreadHistoryAt() == null ||
            loggedInChatterParticipant.getLastSeenChatThreadMessage().getMessageRegisteredAt().after(loggedInChatterParticipant.getClearedChatThreadHistoryAt()))
        ) {
            loggedInChatterLastSeenChatThreadMessage = loggedInChatterParticipant.getLastSeenChatThreadMessage().getId().toString();
        }
        
        String peerChatterLastSeenChatThreadMessage = null;
        if (peerChatterParticipant.getLastSeenChatThreadMessage() != null && (loggedInChatterParticipant.getClearedChatThreadHistoryAt() == null ||
            peerChatterParticipant.getLastSeenChatThreadMessage().getMessageRegisteredAt().after(peerChatterParticipant.getClearedChatThreadHistoryAt()))
        ) {
            peerChatterLastSeenChatThreadMessage = peerChatterParticipant.getLastSeenChatThreadMessage().getId().toString();
        }

        return new ChatThreadOverviewDto(
            chatThread.getId().toString(),
            ChatterMapper.fromChatterToChatterOverviewDto(peerChatterParticipant.getChatter(), peerChatterAccountImage, chatThread),
            chatThread.getCreatedAt(),
            numberOfUnseenMessages,
            lastChatThreadMessageRegisteredAt,
            lastChatThreadMessageContent,
            loggedInChatterLastSeenChatThreadMessage,
            peerChatterLastSeenChatThreadMessage,
            loggedInChatterParticipant.getClearedChatThreadHistoryAt()
        );
    }

    public static ChatThreadDto toChatThreadDto(ChatThreadOverviewDto chatThreadOverviewDto, ResponsePagedListDto<ChatThreadMessageDto> chatThreadMessagePagedListDto) {
        return new ChatThreadDto(chatThreadOverviewDto, chatThreadMessagePagedListDto);
    }
}
