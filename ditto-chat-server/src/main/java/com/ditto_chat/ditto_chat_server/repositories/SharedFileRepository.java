package com.ditto_chat.ditto_chat_server.repositories;

import java.util.List;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import com.ditto_chat.ditto_chat_server.Constants;
import com.ditto_chat.ditto_chat_server.entities.ChatThreadParticipant;
import com.ditto_chat.ditto_chat_server.entities.QSharedFile;
import com.ditto_chat.ditto_chat_server.entities.SharedFile;
import com.ditto_chat.ditto_chat_server.exceptions.DatabaseException;
import com.ditto_chat.ditto_chat_server.helpers.RepositoryHelper;
import com.ditto_chat.ditto_chat_server.utils.FormattingTool;
import com.querydsl.core.types.dsl.BooleanExpression;
import com.querydsl.jpa.impl.JPAQueryFactory;

@Repository
public class SharedFileRepository {
    @Autowired
    private JPAQueryFactory queryFactory;
    private final Logger logger = LoggerFactory.getLogger(SharedFileRepository.class);

    public List<SharedFile> retrieveSharedFilePages(UUID targetChatThreadId, Integer pageNumber, ChatThreadParticipant loggedInChatThreadParticipant) {
        QSharedFile qSharedFile = QSharedFile.sharedFile;

        final Integer sharedFilePagesOffset = pageNumber.intValue() * Constants.NUMBER_OF_ITEMS_PER_PAGE;
        final Integer sharedFilePagesLimit = (pageNumber.intValue() + 1) * Constants.NUMBER_OF_ITEMS_PER_PAGE + 1;    // NOTE: Limit is 1 more than the Page Size. Used later in calculations to indicate whether the page is the last page

        BooleanExpression isSharedInTargetChatThread = qSharedFile.chatThreadMessage.chatThread.id.eq(targetChatThreadId);
        BooleanExpression filterChain =
            RepositoryHelper.addMessageNotClearedFilter(isSharedInTargetChatThread, loggedInChatThreadParticipant, qSharedFile.chatThreadMessage);

        try {
            List<SharedFile> retrievedSharedFilePages = this.queryFactory
                .selectFrom(qSharedFile)
                .where(filterChain)
                .orderBy(qSharedFile.chatThreadMessage.messageRegisteredAt.desc())
                .offset(sharedFilePagesOffset)
                .limit(sharedFilePagesLimit)
                .fetch();

            logger.info(String.format("%d Shared Files have been retrieved from targetChatThread with id=%s, and loggedInChatThreadParticipant's (with id=%s) perspective.", retrievedSharedFilePages.size(), targetChatThreadId, loggedInChatThreadParticipant.getId()));
	    	return retrievedSharedFilePages;
        } catch (Exception e) {
            logger.error(String.format("An exception occurred while retrieving SharedFile Pages from targetChatThread with id=%s, and loggedInChatThreadParticipant's (with id=%s) perspective. Exception=[%s]", targetChatThreadId, loggedInChatThreadParticipant.getId(), FormattingTool.stringifyException(e)));
            throw new DatabaseException();
        }
    }
}
