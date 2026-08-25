package com.ditto_chat.ditto_chat_server.repositories;

import java.sql.Timestamp;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import com.ditto_chat.ditto_chat_server.entities.ChatThreadMessage;
import com.ditto_chat.ditto_chat_server.entities.ChatThreadParticipant;
import com.ditto_chat.ditto_chat_server.entities.QChatThreadParticipant;
import com.ditto_chat.ditto_chat_server.exceptions.DatabaseException;
import com.ditto_chat.ditto_chat_server.utils.FormattingTool;
import com.ditto_chat.ditto_chat_server.utils.TimeTool;
import com.querydsl.core.types.dsl.BooleanExpression;
import com.querydsl.jpa.impl.JPAQueryFactory;

@Repository
public class ChatThreadParticipantRepository {
    @Autowired
    private JPAQueryFactory queryFactory;
    private final Logger logger = LoggerFactory.getLogger(ChatThreadParticipantRepository.class);

    public void updateLastSeenChatThreadMessage(ChatThreadParticipant loggedInChatThreadParticipant, ChatThreadMessage newLastSeenChatThreadMessage) {
        QChatThreadParticipant qChatThreadParticipant = QChatThreadParticipant.chatThreadParticipant;

        BooleanExpression doesMatchEntryId = qChatThreadParticipant.id.eq(loggedInChatThreadParticipant.getId());
        BooleanExpression filterChain =
            this.addCurrentBeforeNewLastSeenChatThreadMessage(doesMatchEntryId, loggedInChatThreadParticipant, newLastSeenChatThreadMessage, qChatThreadParticipant);

        try {
            long numberOfUpdatedEntries = this.queryFactory
                .update(qChatThreadParticipant)
                .where(filterChain)
                .set(qChatThreadParticipant.lastSeenChatThreadMessage, newLastSeenChatThreadMessage)
                .execute();

            if (numberOfUpdatedEntries != 1) {
                logger.error(String.format("updateLastSeenChatThreadMessage failed to update lastSeenChatThreadMessage of ChatThreadParticipant with id=%s.", loggedInChatThreadParticipant.getId()));
                throw new DatabaseException();
            }

            loggedInChatThreadParticipant.setLastSeenChatThreadMessage(newLastSeenChatThreadMessage);
            logger.info(String.format("lastSeenChatThreadMessage of ChatThreadParticipant with id=%s has been updated to newLastSeenChatThreadMessage with id=%s.", loggedInChatThreadParticipant.getId(), newLastSeenChatThreadMessage.getId()));
	    	return;
        } catch (Exception e) {
            logger.error(String.format("Exception occurred while attempting to update lastSeenChatThreadMessage of loggedInChatThreadParticipant with id=%s to newLastSeenChatThreadMessage with id=%s. Exception=[%s]",
                loggedInChatThreadParticipant.getId(), newLastSeenChatThreadMessage.getId(), FormattingTool.stringifyException(e)));
            throw new DatabaseException();
        }
    }

    public Timestamp updateClearedChatThreadHistoryAt(ChatThreadParticipant loggedInChatThreadParticipant) {
        QChatThreadParticipant qChatThreadParticipant = QChatThreadParticipant.chatThreadParticipant;

        BooleanExpression doesMatchEntryId = qChatThreadParticipant.id.eq(loggedInChatThreadParticipant.getId());

        Timestamp newClearedChatThreadHistoryAtTimestamp = TimeTool.getCurrentTimestamp();
        try {
            long numberOfUpdatedEntries = this.queryFactory
                .update(qChatThreadParticipant)
                .where(doesMatchEntryId)
                .set(qChatThreadParticipant.clearedChatThreadHistoryAt, newClearedChatThreadHistoryAtTimestamp)
                .execute();

            if (numberOfUpdatedEntries != 1) {
                logger.error(String.format("updateClearedChatThreadHistoryAt failed to update clearedChatThreadHistoryAt of ChatThreadParticipant with id=%s.", loggedInChatThreadParticipant.getId()));
                throw new DatabaseException();
            }

            logger.info(String.format("clearedChatThreadHistoryAt of ChatThreadParticipant with id=%s has been updated to clearedChatThreadHistoryAt=%s.", loggedInChatThreadParticipant.getId(), newClearedChatThreadHistoryAtTimestamp));
	    	return newClearedChatThreadHistoryAtTimestamp;
        } catch (Exception e) {
            logger.error(String.format("Exception occurred while attempting to update clearedChatThreadHistoryAt of loggedInChatThreadParticipant with id=%s. Exception=[%s]",
                loggedInChatThreadParticipant.getId(), FormattingTool.stringifyException(e)));
            throw new DatabaseException();
        }
    }

    private BooleanExpression addCurrentBeforeNewLastSeenChatThreadMessage(BooleanExpression filterChain, ChatThreadParticipant loggedInChatterParticipant, ChatThreadMessage newLastSeenChatThreadMessage, QChatThreadParticipant qChatThreadParticipant) {
        if (loggedInChatterParticipant.getLastSeenChatThreadMessage() == null) {
            return filterChain;
        }

        BooleanExpression isCurrentBeforeNewLastSeenChatThreadMessage =
            qChatThreadParticipant.lastSeenChatThreadMessage.messageRegisteredAt.before(
                    newLastSeenChatThreadMessage.getMessageRegisteredAt());
        return filterChain.and(isCurrentBeforeNewLastSeenChatThreadMessage);
    }
}
