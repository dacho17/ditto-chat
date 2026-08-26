package com.ditto_chat.ditto_chat_server.helpers;

import java.sql.Timestamp;

import com.ditto_chat.ditto_chat_server.entities.ChatThread;
import com.ditto_chat.ditto_chat_server.entities.ChatThreadMessage;
import com.ditto_chat.ditto_chat_server.entities.ChatThreadParticipant;
import com.ditto_chat.ditto_chat_server.entities.QChatThread;
import com.ditto_chat.ditto_chat_server.entities.QChatThreadMessage;
import com.ditto_chat.ditto_chat_server.entities.QChatThreadParticipant;
import com.querydsl.core.types.Expression;
import com.querydsl.core.types.dsl.BooleanExpression;
import com.querydsl.core.types.dsl.CaseBuilder;
import com.querydsl.core.types.dsl.DateTimeExpression;

public class RepositoryHelper {
    public static BooleanExpression addMessageNotClearedFilter(BooleanExpression filterChain, ChatThreadParticipant loggedInChatterParticipant, QChatThreadMessage qChatThreadMessage) {
        if (loggedInChatterParticipant.getClearedChatThreadHistoryAt() == null) {
            return filterChain;
        }

        BooleanExpression isMessageNotCleared = qChatThreadMessage.messageRegisteredAt.after(loggedInChatterParticipant.getClearedChatThreadHistoryAt());
        return filterChain.and(isMessageNotCleared);
    }

    public static BooleanExpression addAfterLastSeenMessageByLoggedInChatter(BooleanExpression filterChain, ChatThreadParticipant loggedInChatterParticipant, QChatThreadMessage qChatThreadMessage) {
        if (loggedInChatterParticipant.getLastSeenChatThreadMessage() == null) {
            return filterChain;
        }

        BooleanExpression isAfterLastSeenMessageByLoggedInChatter =
            qChatThreadMessage.messageRegisteredAt.after(loggedInChatterParticipant.getLastSeenChatThreadMessage().getMessageRegisteredAt());
        return filterChain.and(isAfterLastSeenMessageByLoggedInChatter);
    }

    public static BooleanExpression addCurrentBeforeNewLastSeenChatThreadMessage(BooleanExpression filterChain, ChatThreadParticipant loggedInChatterParticipant, ChatThreadMessage newLastSeenChatThreadMessage, QChatThreadParticipant qChatThreadParticipant) {
        if (loggedInChatterParticipant.getLastSeenChatThreadMessage() == null) {
            return filterChain;
        }

        BooleanExpression isCurrentBeforeNewLastSeenChatThreadMessage =
            qChatThreadParticipant.lastSeenChatThreadMessage.messageRegisteredAt.before(
                    newLastSeenChatThreadMessage.getMessageRegisteredAt());
        return filterChain.and(isCurrentBeforeNewLastSeenChatThreadMessage);
    }


    public static BooleanExpression addCurrentBeforeNewLastChatThreadMessage(BooleanExpression filterChain, ChatThread targetChatThread, ChatThreadMessage newLastChatThreadMessage, QChatThread qChatThread) {
        if (targetChatThread.getLastChatThreadMessage() == null) {
            return filterChain;
        }

        BooleanExpression isCurrentBeforeNewLastChatThreadMessage =
            qChatThread.lastChatThreadMessage.messageRegisteredAt.before(newLastChatThreadMessage.getMessageRegisteredAt());
        
        return filterChain.and(isCurrentBeforeNewLastChatThreadMessage);
    }

    public static Expression<Timestamp> getLatestChatThreadActivityTimestamp(QChatThread qChatThread, QChatThreadParticipant qLoggedInChatThreadParticipant) {
        DateTimeExpression<Timestamp> chatThreadLastMessageTimestamp =
            qChatThread.lastChatThreadMessage.messageRegisteredAt.coalesce(qChatThread.createdAt);
        DateTimeExpression<Timestamp> chatThreadHistoryClearedAtTimestamp =
            qLoggedInChatThreadParticipant.clearedChatThreadHistoryAt.coalesce(qChatThread.createdAt);

        Expression<Timestamp> latestChatThreadActivityTimestamp = new CaseBuilder()
            .when(chatThreadLastMessageTimestamp.after(chatThreadHistoryClearedAtTimestamp)).then(chatThreadLastMessageTimestamp)
            .otherwise(chatThreadHistoryClearedAtTimestamp);
        return latestChatThreadActivityTimestamp;
    }
}
