package com.ditto_chat.ditto_chat_server.repositories;

import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.hibernate.Session;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import com.ditto_chat.ditto_chat_server.Constants;
import com.ditto_chat.ditto_chat_server.dtos.RawChatThreadOverviewDto;
import com.ditto_chat.ditto_chat_server.entities.ChatThread;
import com.ditto_chat.ditto_chat_server.entities.ChatThreadMessage;
import com.ditto_chat.ditto_chat_server.entities.ChatThreadParticipant;
import com.ditto_chat.ditto_chat_server.entities.Chatter;
import com.ditto_chat.ditto_chat_server.entities.QAccountImage;
import com.ditto_chat.ditto_chat_server.entities.QChatThread;
import com.ditto_chat.ditto_chat_server.entities.QChatThreadMessage;
import com.ditto_chat.ditto_chat_server.entities.QChatThreadParticipant;
import com.ditto_chat.ditto_chat_server.exceptions.DatabaseException;
import com.ditto_chat.ditto_chat_server.helpers.RepositoryHelper;
import com.ditto_chat.ditto_chat_server.utils.FormattingTool;
import com.querydsl.core.Tuple;
import com.querydsl.core.types.Order;
import com.querydsl.core.types.OrderSpecifier;
import com.querydsl.core.types.dsl.BooleanExpression;
import com.querydsl.core.types.dsl.StringExpression;
import com.querydsl.jpa.impl.JPAQueryFactory;

@Repository
public class ChatThreadRepository {
    @Autowired
    private ChatThreadMessageRepository chatThreadMessageRepository;
    @Autowired
    private Session hibernateSession;
    @Autowired
    private JPAQueryFactory queryFactory;
    private final Logger logger = LoggerFactory.getLogger(ChatThreadRepository.class);

    public ChatThread createChatThread(ChatThread newChatThread) {
        try {
            this.hibernateSession.persist(newChatThread);

            logger.info(String.format("New ChatThread with id=%s has been created", newChatThread.getId()));
            return newChatThread;
        } catch (Exception e) {
            logger.error(String.format("An exception occurred while creating new ChatThread. Exception=[%s]",
                FormattingTool.stringifyException(e)));
            throw new DatabaseException();
        }
    }

    public ChatThread retrieveChattersChatThread(UUID chatThreadId, Chatter loggedInChatter) {
        QChatThread qChatThread = QChatThread.chatThread;
        QChatThreadParticipant chatterParticipantAlias = new QChatThreadParticipant("chatterParticipant");

        BooleanExpression isTargetChatThread = qChatThread.id.eq(chatThreadId);
        BooleanExpression isLoggedInChatterChatThreadParticipant = chatterParticipantAlias.chatter.id.eq(loggedInChatter.getId());
        BooleanExpression filterChain = isTargetChatThread.and(isLoggedInChatterChatThreadParticipant);

        try {
            ChatThread retrievedChatThread = this.queryFactory
                .selectFrom(qChatThread)
                .join(chatterParticipantAlias).on(qChatThread.id.eq(chatterParticipantAlias.chatThread.id))
                .where(filterChain)
                .fetchOne();

            if (retrievedChatThread == null) {
                logger.info(String.format("No Chatter's Chat Thread has been found for chatThreadId=%s and loggedInChatterId=%s", chatThreadId, loggedInChatter.getId()));
                return null;
            }

            logger.info(String.format("ChatThread with id=%s has been retrieved for Chatter with id=%s", chatThreadId, loggedInChatter.getId()));
	    	return retrievedChatThread;
        } catch (Exception e) {
            logger.error(String.format("An exception occurred while retrieving ChatThread with id=%s for Chatter with id=%s. Exception=[%s]",
                chatThreadId, loggedInChatter.getId(), FormattingTool.stringifyException(e)));
            throw new DatabaseException();
        }
    }

    public List<RawChatThreadOverviewDto> retrieveChattersChatThreadPages(String chatterNameSearchFilter, Integer pageNumber, Boolean isInitialRetrieval, Boolean isPolling, UUID loggedInChatterId) {
        QChatThread qChatThread = QChatThread.chatThread;
        QChatThreadParticipant loggedInChatterParticipantAlias = new QChatThreadParticipant("loggedInChatterParticipant");
        QChatThreadParticipant peerChatterParticipantAlias = new QChatThreadParticipant("peerChatterParticipant");
        QAccountImage peerAccountImageAlias = new QAccountImage("peerAccountImage");
        QChatThreadMessage unseenChatThreadMessagesAlias = new QChatThreadMessage("unseenChatThreadMessages");

        Integer chatThreadsPagesOffset = isInitialRetrieval == true || isPolling == true
            ? 0 : pageNumber.intValue() * Constants.NUMBER_OF_ITEMS_PER_PAGE;
        Integer chatThreadsPagesLimit = isInitialRetrieval == true || isPolling == true
            ? (pageNumber.intValue() + 1) * Constants.NUMBER_OF_ITEMS_PER_PAGE : Constants.NUMBER_OF_ITEMS_PER_PAGE;

        StringExpression peerChatterFullName =
            peerChatterParticipantAlias.chatter.name.concat(" ").concat(peerChatterParticipantAlias.chatter.surname);
        BooleanExpression doesChatThreadPeerMatchSearchFilter = peerChatterFullName.containsIgnoreCase(chatterNameSearchFilter);
        BooleanExpression isLoggedInChatterChatThreadParticipant = loggedInChatterParticipantAlias.chatter.id.eq(loggedInChatterId);
        BooleanExpression isPeerAccountImageCurrentlyActive = peerAccountImageAlias.replacedAt.isNull();

        BooleanExpression filterChain = doesChatThreadPeerMatchSearchFilter
            .and(isLoggedInChatterChatThreadParticipant)
            .and(isPeerAccountImageCurrentlyActive);

        chatThreadsPagesLimit += 1; // NOTE: Limit is 1 more than the Page Size. Used later in calculations to indicate whether the page is the last page

        try {
            List<Tuple> retrievedChatThreadPages = this.queryFactory
                .select(
                    qChatThread,
                    loggedInChatterParticipantAlias, peerChatterParticipantAlias, peerAccountImageAlias
                )
                .from(qChatThread)
                .join(loggedInChatterParticipantAlias).on(qChatThread.id.eq(loggedInChatterParticipantAlias.chatThread.id))
                .join(peerChatterParticipantAlias).on(qChatThread.id.eq(peerChatterParticipantAlias.chatThread.id))
                .leftJoin(peerAccountImageAlias).on(peerChatterParticipantAlias.chatter.id.eq(peerAccountImageAlias.chatter.id))
                .leftJoin(unseenChatThreadMessagesAlias).on(qChatThread.id.eq(unseenChatThreadMessagesAlias.chatThread.id))
                .groupBy(qChatThread.id, loggedInChatterParticipantAlias.id, peerChatterParticipantAlias.id, peerAccountImageAlias.id)
                .where(filterChain)
                .orderBy(new OrderSpecifier<>(Order.DESC, RepositoryHelper.getLatestChatThreadActivityTimestamp(qChatThread, loggedInChatterParticipantAlias)))
                .offset(chatThreadsPagesOffset)
                .limit(chatThreadsPagesLimit)
                .fetch();

            List<RawChatThreadOverviewDto> rawChatThreadOverviewDtos = new LinkedList<>();
            for (Tuple chatThreadPageTuple: retrievedChatThreadPages) {
                ChatThread retrievedChatThread = chatThreadPageTuple.get(qChatThread);
                ChatThreadParticipant loggedInChatterParticipant = chatThreadPageTuple.get(loggedInChatterParticipantAlias);
                Integer numberOfUnseenChatThreadMessagesByLoggedInChatterParticipant =
                    this.chatThreadMessageRepository.countUnseenChatThreadMessagesByChatter(retrievedChatThread, loggedInChatterParticipant);

                RawChatThreadOverviewDto rawChatThreadOverviewDto = new RawChatThreadOverviewDto(
                    retrievedChatThread,
                    numberOfUnseenChatThreadMessagesByLoggedInChatterParticipant,
                    loggedInChatterParticipant,
                    chatThreadPageTuple.get(peerChatterParticipantAlias),
                    chatThreadPageTuple.get(peerAccountImageAlias)
                );

                rawChatThreadOverviewDtos.add(rawChatThreadOverviewDto);
            }

            logger.info(String.format("%d ChatThreads have been retrieved for LoggedInChatter with id=%s, and chatterNameSearchFilter=%s, pageNumber=%s, isInitialRetrieval=%s, isPolling=%s.",
                rawChatThreadOverviewDtos.size(), loggedInChatterId, chatterNameSearchFilter, pageNumber, isInitialRetrieval, isPolling));
	    	return rawChatThreadOverviewDtos;
        } catch (Exception e) {
            logger.error(String.format("An exception occurred while retrieving ChatThreads for LoggedInChatter with id=%s, and chatterNameSearchFilter=%s, pageNumber=%s, isInitialRetrieval=%s, isPolling=%s. Exception=[%s]",
                loggedInChatterId, chatterNameSearchFilter, pageNumber, isInitialRetrieval, isPolling, FormattingTool.stringifyException(e)));
            throw new DatabaseException();
        }
    }

    public Map<String, ChatThread> retrieveChatThreadsBetweenChatterAndPeerChatters(UUID chatterId, List<Chatter> peerChatters) {
        QChatThread qChatThread = QChatThread.chatThread;
        QChatThreadParticipant chatterParticipantAlias = new QChatThreadParticipant("chatterParticipant");
        QChatThreadParticipant peerChatterParticipantAlias = new QChatThreadParticipant("peerChatterParticipant");

        List<UUID> peerChatterIds = peerChatters.stream().map(chatter -> chatter.getId()).toList();

        BooleanExpression isNonGroupChatThread = qChatThread.isGroupChatThread.isFalse();
        BooleanExpression isChatterChatThreadParticipant = chatterParticipantAlias.chatter.id.eq(chatterId);
        BooleanExpression isPeerChatterChatThreadParticipant = peerChatterParticipantAlias.chatter.id.in(peerChatterIds);
        BooleanExpression filterChain = isNonGroupChatThread.and(isChatterChatThreadParticipant).and(isPeerChatterChatThreadParticipant);

        try {
            List<Tuple> retrievedChatThreadChatterIdTuples = this.queryFactory
                .select(qChatThread, peerChatterParticipantAlias.chatter.id)
                .from(qChatThread)
                .join(chatterParticipantAlias).on(qChatThread.id.eq(chatterParticipantAlias.chatThread.id))
                .join(peerChatterParticipantAlias).on(qChatThread.id.eq(peerChatterParticipantAlias.chatThread.id))
                .where(filterChain)
                .fetch();

            Map<String, ChatThread> peerChatterChatThreadsWithLoggedInChatter
                = new HashMap<>();
            for (Tuple peerChatterChatThreadTuple: retrievedChatThreadChatterIdTuples) {
                peerChatterChatThreadsWithLoggedInChatter.put(
                    peerChatterChatThreadTuple.get(peerChatterParticipantAlias.chatter.id).toString(),
                    peerChatterChatThreadTuple.get(qChatThread)
                );
            }

            logger.info(String.format("%d/%d ChatThreads have been retrieved between the Chatter with id=%s, and the target Peer Chatters",
                peerChatterChatThreadsWithLoggedInChatter.size(), peerChatters.size(), chatterId));
	    	return peerChatterChatThreadsWithLoggedInChatter;
        } catch (Exception e) {
            logger.error(String.format("An exception occurred while retrieving ChatThreads between the Chatter with id=%s and their Peer Chatters. Exception=[%s]",
                chatterId, FormattingTool.stringifyException(e)));
            throw new DatabaseException();
        }
    }

    public void updateLastChatThreadMessage(ChatThread targetChatThread, ChatThreadMessage newLastChatThreadMessage) {
        QChatThread qChatThread = QChatThread.chatThread;

        BooleanExpression doesMatchEntryId = qChatThread.id.eq(targetChatThread.getId());
        BooleanExpression filterChain =
            RepositoryHelper.addCurrentBeforeNewLastChatThreadMessage(doesMatchEntryId, targetChatThread, newLastChatThreadMessage, qChatThread);

        try {
            long numberOfUpdatedEntries = this.queryFactory
                .update(qChatThread)
                .where(filterChain)
                .set(qChatThread.lastChatThreadMessage, newLastChatThreadMessage)
                .execute();

            if (numberOfUpdatedEntries != 1) {
                logger.error(String.format("updateLastChatThreadMessage failed to update lastChatThreadMessage of ChatThread with id=%s to ChatThreadMessage with id=%s.", targetChatThread.getId(), newLastChatThreadMessage.getId()));
                throw new DatabaseException();
            }

            logger.info(String.format("lastChatThreadMessage of ChatThread with id=%s has been updated to ChatThreadMessage with id=%s.", targetChatThread.getId(), newLastChatThreadMessage.getId()));
	    	return;
        } catch (Exception e) {
            logger.error(String.format("Exception occurred while attempting to update lastChatThreadMessage of ChatThread with id=%s to ChatThreadMessage with id=%s. Exception=[%s]",
                targetChatThread.getId(), newLastChatThreadMessage.getId(), FormattingTool.stringifyException(e)));
            throw new DatabaseException();
        }
    }
}
