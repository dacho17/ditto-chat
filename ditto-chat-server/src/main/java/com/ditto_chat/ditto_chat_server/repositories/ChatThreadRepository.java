package com.ditto_chat.ditto_chat_server.repositories;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import com.ditto_chat.ditto_chat_server.entities.ChatThread;
import com.ditto_chat.ditto_chat_server.entities.Chatter;
import com.ditto_chat.ditto_chat_server.entities.QChatThread;
import com.ditto_chat.ditto_chat_server.entities.QChatThreadParticipant;
import com.ditto_chat.ditto_chat_server.exceptions.DatabaseException;
import com.ditto_chat.ditto_chat_server.utils.FormattingTool;
import com.querydsl.core.Tuple;
import com.querydsl.core.types.dsl.BooleanExpression;
import com.querydsl.jpa.impl.JPAQueryFactory;

@Repository
public class ChatThreadRepository {
    @Autowired
    private JPAQueryFactory queryFactory;
    private final Logger logger = LoggerFactory.getLogger(ChatThreadRepository.class);

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
}
