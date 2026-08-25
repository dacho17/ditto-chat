package com.ditto_chat.ditto_chat_server.repositories;

import java.util.List;
import java.util.UUID;

import org.hibernate.Session;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import com.ditto_chat.ditto_chat_server.Constants;
import com.ditto_chat.ditto_chat_server.entities.ChatThread;
import com.ditto_chat.ditto_chat_server.entities.ChatThreadMessage;
import com.ditto_chat.ditto_chat_server.entities.ChatThreadParticipant;
import com.ditto_chat.ditto_chat_server.entities.QChatThreadMessage;
import com.ditto_chat.ditto_chat_server.exceptions.DatabaseException;
import com.ditto_chat.ditto_chat_server.utils.FormattingTool;
import com.querydsl.core.types.dsl.BooleanExpression;
import com.querydsl.core.types.dsl.Expressions;
import com.querydsl.core.types.dsl.NumberPath;
import com.querydsl.jpa.impl.JPAQueryFactory;

@Repository
public class ChatThreadMessageRepository {
    @Autowired
    private Session hibernateSession;
    @Autowired
    private JPAQueryFactory queryFactory;
    private final Logger logger = LoggerFactory.getLogger(ChatThreadMessageRepository.class);

    public ChatThreadMessage createChatThreadMessage(ChatThreadMessage newChatThreadMessage) {
        try {
            this.hibernateSession.persist(newChatThreadMessage);

            logger.info(String.format("New ChatThreadMessage with id=%s has been created", newChatThreadMessage.getId()));
            return newChatThreadMessage;
        } catch (Exception e) {
            logger.error(String.format("An exception occurred while creating new ChatThreadMessage. Exception=[%s]",
                FormattingTool.stringifyException(e)));
            throw new DatabaseException();
        }
    }

    public ChatThreadMessage retrieveById(UUID targetChatThreadMessageId, ChatThreadParticipant loggedInChatterParticipant) {
        QChatThreadMessage qChatThreadMessage = QChatThreadMessage.chatThreadMessage;

        BooleanExpression doesIdMatch = qChatThreadMessage.id.eq(targetChatThreadMessageId);
        BooleanExpression filterChain = this.addMessageNotClearedFilter(doesIdMatch, loggedInChatterParticipant, qChatThreadMessage);

        try {
            ChatThreadMessage foundChatThreadMessage = this.queryFactory
                .selectFrom(qChatThreadMessage)
                .where(filterChain)
                .fetchOne();
            
            if (foundChatThreadMessage == null) {
                logger.info(String.format("No ChatThreadMessages have been found with chatThreadMessageId=%s.", targetChatThreadMessageId));
                return null;
            }

            logger.info(String.format("ChatThreadMessage with id=%s has been retrieved by id.", foundChatThreadMessage.getId()));
	    	return foundChatThreadMessage;
        } catch (Exception e) {
            logger.error(String.format("An exception occurred while retrieving ChatThreadMessage by id=%s. Exception=[%s]",
                targetChatThreadMessageId, FormattingTool.stringifyException(e)));
            throw new DatabaseException();
        }
    }

    public List<ChatThreadMessage> retrieveChatThreadMessagesPage(ChatThread targetChatThread, Integer pageNumber, ChatThreadParticipant loggedInChatterParticipant) {
        QChatThreadMessage qChatThreadMessage = QChatThreadMessage.chatThreadMessage;

        BooleanExpression isInTargetChatThread = qChatThreadMessage.chatThread.id.eq(targetChatThread.getId());
        BooleanExpression filterChain = this.addMessageNotClearedFilter(isInTargetChatThread, loggedInChatterParticipant, qChatThreadMessage);

        try {
            List<ChatThreadMessage> retrievedChatThreadMessages = this.queryFactory
                .selectFrom(qChatThreadMessage)
                .where(filterChain)
                .orderBy(qChatThreadMessage.messageRegisteredAt.desc())
                .offset(pageNumber.intValue() * Constants.NUMBER_OF_ITEMS_PER_PAGE)
                .limit(Constants.NUMBER_OF_ITEMS_PER_PAGE + 1)
                .fetch();

            logger.info(String.format("%d ChatThreadMessages have been retrieved for ChatThread with id=%s, on pageNumber=%d.",
                retrievedChatThreadMessages.size(), targetChatThread.getId(), pageNumber));
	    	return retrievedChatThreadMessages;
        } catch (Exception e) {
            logger.error(String.format("An exception occurred while retrieving ChatThreadMessage PageNumber=%d for ChatThread with id=%s. Exception=[%s]",
                pageNumber, targetChatThread.getId(), FormattingTool.stringifyException(e)));
            throw new DatabaseException();
        }
    }

    public Integer countUnseenChatThreadMessagesByChatter(ChatThread targetChatThread, ChatThreadParticipant loggedInChatThreadParticipant) {
        QChatThreadMessage qChatThreadMessage = QChatThreadMessage.chatThreadMessage;
        NumberPath<Long> count = Expressions.numberPath(Long.class, "c");

        BooleanExpression isInTargetChatThread = qChatThreadMessage.chatThread.id.eq(targetChatThread.getId());
        BooleanExpression isReceivedByLoggedInChatter = qChatThreadMessage.senderChatThreadParticipant.id.ne(loggedInChatThreadParticipant.getId());
        BooleanExpression filterChain =
            this.addMessageNotClearedFilter(isInTargetChatThread.and(isReceivedByLoggedInChatter), loggedInChatThreadParticipant, qChatThreadMessage);
        filterChain =
            this.addAfterLastSeenMessageByLoggedInChatter(filterChain, loggedInChatThreadParticipant, qChatThreadMessage);

        try {
            Long numberOfUnseenChatThreadMessages = this.queryFactory
                .select(qChatThreadMessage.id.count().as(count))
                .from(qChatThreadMessage)
                .where(filterChain)
                .fetchOne();

            logger.info(String.format("Chatter with id=%s currently has %d unseen ChatThreadMessages in ChatThread with id=%s.",
                loggedInChatThreadParticipant.getChatter().getId(), numberOfUnseenChatThreadMessages, targetChatThread.getId()));
	    	return Math.toIntExact(numberOfUnseenChatThreadMessages.longValue());
        } catch (Exception e) {
            logger.error(String.format("An exception occurred while counting Unseen ChatThreadMessages by Chatter with id=%s in ChatThread with id=%s. Exception=[%s]",
                loggedInChatThreadParticipant.getChatter().getId(), targetChatThread.getId(), FormattingTool.stringifyException(e)));
            throw new DatabaseException();
        }
    }

    private BooleanExpression addMessageNotClearedFilter(BooleanExpression filterChain, ChatThreadParticipant loggedInChatterParticipant, QChatThreadMessage qChatThreadMessage) {
        if (loggedInChatterParticipant.getClearedChatThreadHistoryAt() == null) {
            return filterChain;
        }

        BooleanExpression isMessageNotCleared = qChatThreadMessage.messageRegisteredAt.after(loggedInChatterParticipant.getClearedChatThreadHistoryAt());
        return filterChain.and(isMessageNotCleared);
    }

    private BooleanExpression addAfterLastSeenMessageByLoggedInChatter(BooleanExpression filterChain, ChatThreadParticipant loggedInChatterParticipant, QChatThreadMessage qChatThreadMessage) {
        if (loggedInChatterParticipant.getLastSeenChatThreadMessage() == null) {
            return filterChain;
        }

        BooleanExpression isAfterLastSeenMessageByLoggedInChatter =
            qChatThreadMessage.messageRegisteredAt.after(loggedInChatterParticipant.getLastSeenChatThreadMessage().getMessageRegisteredAt());
        return filterChain.and(isAfterLastSeenMessageByLoggedInChatter);
    }
}
