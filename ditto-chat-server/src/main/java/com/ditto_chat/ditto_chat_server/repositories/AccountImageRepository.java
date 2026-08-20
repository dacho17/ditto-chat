package com.ditto_chat.ditto_chat_server.repositories;

import java.util.List;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import com.ditto_chat.ditto_chat_server.entities.AccountImage;
import com.ditto_chat.ditto_chat_server.entities.Chatter;
import com.ditto_chat.ditto_chat_server.entities.QAccountImage;
import com.ditto_chat.ditto_chat_server.exceptions.DatabaseException;
import com.ditto_chat.ditto_chat_server.utils.FormattingTool;
import com.querydsl.core.types.dsl.BooleanExpression;
import com.querydsl.jpa.impl.JPAQueryFactory;

@Repository
public class AccountImageRepository {
    @Autowired
    private JPAQueryFactory queryFactory;
    private final Logger logger = LoggerFactory.getLogger(AccountImageRepository.class);

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
                // .join().on(qRoomTypeDailyAvailability.roomType.id.eq(qRoomType.id)) TODO: confirm that UploadedImage is retrieved automatically (EAGERLY). If yes this line can be deleted!
                .fetch();

            logger.info(String.format("%d/%d AccountImages have been retrieved for the target Chatters", retrievedAccountImages.size(), chatters.size()));
	    	return retrievedAccountImages;
        } catch (Exception e) {
            logger.error(String.format("An exception occurred while retrieving Account Images for the list of Chatters. Exception=[%s]",
                FormattingTool.stringifyException(e)));
            throw new DatabaseException();
        }
    }
}
