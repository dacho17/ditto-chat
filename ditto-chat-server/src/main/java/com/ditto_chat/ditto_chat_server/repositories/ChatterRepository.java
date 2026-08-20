package com.ditto_chat.ditto_chat_server.repositories;

import java.sql.Timestamp;
import java.util.List;
import java.util.UUID;

import org.hibernate.Session;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import com.ditto_chat.ditto_chat_server.Constants;
import com.ditto_chat.ditto_chat_server.entities.Chatter;
import com.ditto_chat.ditto_chat_server.entities.QChatter;
import com.ditto_chat.ditto_chat_server.exceptions.DatabaseException;
import com.ditto_chat.ditto_chat_server.utils.FormattingTool;
import com.ditto_chat.ditto_chat_server.utils.TimeTool;
import com.querydsl.core.types.dsl.BooleanExpression;
import com.querydsl.core.types.dsl.StringExpression;
import com.querydsl.jpa.impl.JPAQueryFactory;

@Repository
public class ChatterRepository {
    @Autowired
    private Session hibernateSession;
    @Autowired
    private JPAQueryFactory queryFactory;
    private final Logger logger = LoggerFactory.getLogger(ChatterRepository.class);
    
    public void createChatter(Chatter newChatter) {
        try {
            this.hibernateSession.persist(newChatter);

            logger.info(String.format("New Chatter with id=%s has been created", newChatter.getId()));
        } catch (Exception e) {
            logger.error(String.format("An exception occurred while creating new Chatter. Exception=[%s]",
                FormattingTool.stringifyException(e)));
            throw new DatabaseException();
        }
    }

    public Chatter retrieveByEmail(String email) {
        QChatter qChatter = QChatter.chatter;

        try {
            Chatter foundChatter = this.queryFactory
                .selectFrom(qChatter)
                .where(qChatter.email.eq(email))
                .fetchOne();
            
            if (foundChatter == null) {
                logger.info(String.format("No Chatters have been found with email=%s.", email));
                return null;
            }

            logger.info(String.format("Chatter with id=%s has been retrieved by email=%s.", foundChatter.getId(), email));
	    	return foundChatter;
        } catch (Exception e) {
            logger.error(String.format("An exception occurred while retrieving Chatter by email=%s. Exception=[%s]",
                email, FormattingTool.stringifyException(e)));
            throw new DatabaseException();
        }
    }

    public Chatter retrieveByEmailOrUsername(String email, String username) {
        QChatter qChatter = QChatter.chatter;

        try {
            Chatter foundChatter = this.queryFactory
                .selectFrom(qChatter)
                .where(qChatter.email.eq(email).or(qChatter.username.eq(username)))
                .fetchOne();
            
            if (foundChatter == null) {
                logger.info(String.format("No Chatters have been found related to the email=%s nor username=%s.", email, username));
                return null;
            }

            logger.info(String.format("Chatter with id=%s has been retrieved by email=%s or username=%s.", foundChatter.getId(), email, username));
	    	return foundChatter;
        } catch (Exception e) {
            logger.error(String.format("An exception occurred while retrieving Chatter by email=%s or username=%s. Exception=[%s]",
                email, username, FormattingTool.stringifyException(e)));
            throw new DatabaseException();
        }
    }

    public Chatter retrieveByPasswordResetTokenHash(String passwordResetTokenHash) {
        QChatter qChatter = QChatter.chatter;

        try {
            Chatter foundChatter = this.queryFactory
                .selectFrom(qChatter)
                .where(qChatter.passwordResetTokenHash.eq(passwordResetTokenHash))
                .fetchOne();
            
            if (foundChatter == null) {
                logger.info(String.format("No Chatters have been found with passwordResetTokenHash=%s.", passwordResetTokenHash));
                return null;
            }

            logger.info(String.format("Chatter with id=%s has been retrieved by passwordResetTokenHash=%s.", foundChatter.getId(), passwordResetTokenHash));
	    	return foundChatter;
        } catch (Exception e) {
            logger.error(String.format("An exception occurred while retrieving Chatter by passwordResetTokenHash=%s. Exception=[%s]",
                passwordResetTokenHash, FormattingTool.stringifyException(e)));
            throw new DatabaseException();
        }
    }

    public List<Chatter> retrieveChatterPages(String chatterNameSearchFilter, Integer pageNumber, Boolean isInitialRetrieval, UUID requesterChatterId) {
        QChatter qChatter = QChatter.chatter;

        Integer chatterPagesOffset = isInitialRetrieval == true
            ? 0 : pageNumber.intValue() * Constants.NUMBER_OF_ITEMS_PER_PAGE;
        Integer chatterPagesLimit = isInitialRetrieval == true
            ? (pageNumber.intValue() + 1) * Constants.NUMBER_OF_ITEMS_PER_PAGE : Constants.NUMBER_OF_ITEMS_PER_PAGE;

        StringExpression chatterFullName = qChatter.name.concat(" ").concat(qChatter.surname);
        BooleanExpression doesMatchSearchFilter = chatterFullName.containsIgnoreCase(chatterNameSearchFilter);
        BooleanExpression isNotRequesterChatter = qChatter.id.ne(requesterChatterId);
        BooleanExpression filterChain = doesMatchSearchFilter.and(isNotRequesterChatter);

        chatterPagesLimit += 1; // NOTE: Limit is 1 more than the Page Size. Used later in calculations to indicate whether the page is the last page

        try {
            List<Chatter> retrievedChatterPages = this.queryFactory
                .selectFrom(qChatter)
                .where(filterChain)
                .orderBy(chatterFullName.desc())
                .offset(chatterPagesOffset)
                .limit(chatterPagesLimit)
                .fetch();

            logger.info(String.format("%d Chatters have been retrieved based on chatterNameSearchFilter=%s, pageNumber=%d, isInitialRetrieval=%s",
                retrievedChatterPages.size(), chatterNameSearchFilter, pageNumber, isInitialRetrieval));
	    	return retrievedChatterPages;
        } catch (Exception e) {
            logger.error(String.format("An exception occurred while retrieving Chatter Pages based on chatterNameSearchFilter=%s, pageNumber=%d, isInitialRetrieval=%s. Exception=[%s]",
                chatterNameSearchFilter, pageNumber, isInitialRetrieval, FormattingTool.stringifyException(e)));
            throw new DatabaseException();
        }
    }

    public void updateChatterLastLoginAt(Chatter loggedInChatter) {
        QChatter qChatter = QChatter.chatter;

        BooleanExpression doesMatchEntryId = qChatter.id.eq(loggedInChatter.getId());

        try {
            long numberOfUpdatedEntries = this.queryFactory
                .update(qChatter)
                .where(doesMatchEntryId)
                .set(qChatter.lastLoginAt, TimeTool.getCurrentTimestamp())
                .execute();

            if (numberOfUpdatedEntries != 1) {
                logger.error(String.format("updateChatterLastLoginAt failed to update lastLoginAt of Chatter with id=%s.", loggedInChatter.getId()));
                throw new DatabaseException();
            }

            logger.info(String.format("LastLoginAt of Chatter with id=%s has been updated.", loggedInChatter.getId()));
	    	return;
        } catch (Exception e) {
            logger.error(String.format("Exception occurred while attempting to update lastLoginAt of Chatter with id=%s. Exception=[%s]",
                loggedInChatter.getId(), FormattingTool.stringifyException(e)));
            throw new DatabaseException();
        }
    }

    public void updateChatterPasswordReset(Chatter requestingChatter, String passwordResetTokenHash, Timestamp passwordResetValidUntil) {
        QChatter qChatter = QChatter.chatter;

        BooleanExpression doesMatchEntryId = qChatter.id.eq(requestingChatter.getId());

		try {
            long numberOfUpdatedEntries = this.queryFactory
                .update(qChatter)
                .where(doesMatchEntryId)
                .set(qChatter.passwordResetTokenHash, passwordResetTokenHash)
                .set(qChatter.passwordResetValidUntil, passwordResetValidUntil)
                .execute();

            if (numberOfUpdatedEntries != 1) {
                logger.error(String.format("updateChatterPasswordReset failed to update ResetPassword details on request of Chatter with id=%s.", requestingChatter.getId()));
                throw new DatabaseException();
            }

            logger.info(String.format("ResetPassword details of Chatter with id=%s has been updated. passwordResetTokenHash=%s, passwordResetValidUntil=%s", requestingChatter.getId(), passwordResetTokenHash, passwordResetValidUntil));
	    	return;
        } catch (Exception e) {
            logger.error(String.format("Exception occurred while attempting to update ResetPassword details of Chatter with id=%s. Exception=[%s]",
                requestingChatter.getId(), FormattingTool.stringifyException(e)));
            throw new DatabaseException();
        }
	}

    public void updateChatterPassword(Chatter loggedInChatter, String newPassword) {
        QChatter qChatter = QChatter.chatter;

        BooleanExpression doesMatchEntryId = qChatter.id.eq(loggedInChatter.getId());

        try {
            long numberOfUpdatedEntries = this.queryFactory
                .update(qChatter)
                .where(doesMatchEntryId)
                .set(qChatter.password, newPassword)
                .execute();

            if (numberOfUpdatedEntries != 1) {
                logger.error(String.format("updateChatterPassword failed to update password of Chatter with id=%s.", loggedInChatter.getId()));
                throw new DatabaseException();
            }

            logger.info(String.format("Password of Chatter with id=%s has been updated.", loggedInChatter.getId()));
	    	return;
        } catch (Exception e) {
            logger.error(String.format("Exception occurred while attempting to update password of Chatter with id=%s. Exception=[%s]",
                loggedInChatter.getId(), FormattingTool.stringifyException(e)));
            throw new DatabaseException();
        }
    }
}
