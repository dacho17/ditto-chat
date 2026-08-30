package com.ditto_chat.ditto_chat_server.repositories;

import java.util.List;
import java.util.UUID;

import org.hibernate.Session;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import com.ditto_chat.ditto_chat_server.entities.AccountImage;
import com.ditto_chat.ditto_chat_server.entities.Chatter;
import com.ditto_chat.ditto_chat_server.entities.QAccountImage;
import com.ditto_chat.ditto_chat_server.exceptions.DatabaseException;
import com.ditto_chat.ditto_chat_server.utils.FormattingTool;
import com.ditto_chat.ditto_chat_server.utils.TimeTool;
import com.querydsl.core.types.dsl.BooleanExpression;
import com.querydsl.jpa.impl.JPAQueryFactory;

@Repository
public class AccountImageRepository {
    @Autowired
    private Session hibernateSession;
    @Autowired
    private JPAQueryFactory queryFactory;
    private final Logger logger = LoggerFactory.getLogger(AccountImageRepository.class);

    public AccountImage createAccountImage(AccountImage newAccountImage) {
        try {
            this.hibernateSession.persist(newAccountImage);

            logger.info(String.format("New AccountImage with id=%s has been created", newAccountImage.getId()));
            return newAccountImage;
        } catch (Exception e) {
            logger.error(String.format("An exception occurred while creating a new AccountImage. Exception=[%s]",
                FormattingTool.stringifyException(e)));
            throw new DatabaseException();
        }
    }

    public AccountImage retrieveCurrentAccountImageForChatter(Chatter chatter) {
        QAccountImage qAccountImage = QAccountImage.accountImage;

        BooleanExpression isChattersImage = qAccountImage.chatter.id.eq(chatter.getId());
        BooleanExpression isCurrentlyActive = qAccountImage.replacedAt.isNull();

        BooleanExpression filterChain = isChattersImage.and(isCurrentlyActive);
        try {
            AccountImage retrievedCurrentAccountImage = this.queryFactory
                .selectFrom(qAccountImage)
                .where(filterChain)
                .fetchFirst();

            if (retrievedCurrentAccountImage == null) {
                logger.info(String.format("No Account Image has been found for Chatter with email=%s.", chatter.getEmail()));
                return null;
            }

            logger.info(String.format("Current AccountImage with id=%s has been retrieved for the target Chatter", retrievedCurrentAccountImage.getId()));
	    	return retrievedCurrentAccountImage;
        } catch (Exception e) {
            logger.error(String.format("An exception occurred while retrieving Current AccountImage for the Chatter with id=%s. Exception=[%s]",
                chatter.getId(), FormattingTool.stringifyException(e)));
            throw new DatabaseException();
        }
    }

    public List<AccountImage> retrieveCurrentAccountImagesForChatters(List<Chatter> chatters) {
        QAccountImage qAccountImage = QAccountImage.accountImage;

        List<UUID> chatterIds = chatters.stream().map(chatter -> chatter.getId()).toList();
        BooleanExpression isOneOfChattersAccountImage = qAccountImage.chatter.id.in(chatterIds);
        BooleanExpression isCurrentlyActive = qAccountImage.replacedAt.isNull();

        BooleanExpression filterChain = isOneOfChattersAccountImage.and(isCurrentlyActive);
        try {
            List<AccountImage> retrievedAccountImages = this.queryFactory
                .selectFrom(qAccountImage)
                .where(filterChain)
                .fetch();

            logger.info(String.format("%d/%d AccountImages have been retrieved for the target Chatters", retrievedAccountImages.size(), chatters.size()));
	    	return retrievedAccountImages;
        } catch (Exception e) {
            logger.error(String.format("An exception occurred while retrieving Account Images for the list of Chatters. Exception=[%s]",
                FormattingTool.stringifyException(e)));
            throw new DatabaseException();
        }
    }

    public void setReplacedAtOfCurrentAccountImageForChatter(Chatter chatter) {
        QAccountImage qAccountImage = QAccountImage.accountImage;

        BooleanExpression isAccountImageChatters = qAccountImage.chatter.id.eq(chatter.getId());
        BooleanExpression isAccountImageCurrent = qAccountImage.replacedAt.isNotNull();
        BooleanExpression filterChain = isAccountImageChatters.and(isAccountImageCurrent);

        try {
            long numberOfUpdatedEntries = this.queryFactory
                .update(qAccountImage)
                .where(filterChain)
                .set(qAccountImage.replacedAt, TimeTool.getCurrentTimestamp())
                .execute();

            logger.info(String.format("%d current Account Images for Chatter with id=%s, have been Replaced.", numberOfUpdatedEntries, chatter.getId()));
	    	return;
        } catch (Exception e) {
            logger.error(String.format("Exception occurred while attempting to update replacedAt of Chatter's (with id=%s) current Account Image. Exception=[%s]",
                chatter.getId(), FormattingTool.stringifyException(e)));
            throw new DatabaseException();
        }
    }
}
