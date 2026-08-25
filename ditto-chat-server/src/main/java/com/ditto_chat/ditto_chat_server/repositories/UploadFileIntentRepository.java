package com.ditto_chat.ditto_chat_server.repositories;

import org.hibernate.Session;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import com.ditto_chat.ditto_chat_server.entities.QUploadFileIntent;
import com.ditto_chat.ditto_chat_server.entities.UploadFileIntent;
import com.ditto_chat.ditto_chat_server.exceptions.DatabaseException;
import com.ditto_chat.ditto_chat_server.utils.FormattingTool;
import com.querydsl.jpa.impl.JPAQueryFactory;

@Repository
public class UploadFileIntentRepository {
    @Autowired
    private Session hibernateSession;
    @Autowired
    private JPAQueryFactory queryFactory;
    private final Logger logger = LoggerFactory.getLogger(UploadFileIntentRepository.class);

    public UploadFileIntent createUploadFileIntent(UploadFileIntent newUploadFileIntent) {
        try {
            this.hibernateSession.persist(newUploadFileIntent);

            logger.info(String.format("New UploadFileIntent with id=%s has been created", newUploadFileIntent.getId()));
            return newUploadFileIntent;
        } catch (Exception e) {
            logger.error(String.format("An exception occurred while creating new UploadFileIntent. Exception=[%s]",
                FormattingTool.stringifyException(e)));
            throw new DatabaseException();
        }
    }

    public UploadFileIntent retrieveByS3ObjectKey(String s3ObjectKey) {
        QUploadFileIntent qUploadFileIntent = QUploadFileIntent.uploadFileIntent;

        try {
            UploadFileIntent foundUploadFileIntent = this.queryFactory
                .selectFrom(qUploadFileIntent)
                .where(qUploadFileIntent.s3ObjectKey.eq(s3ObjectKey))
                .fetchOne();
            
            if (foundUploadFileIntent == null) {
                logger.info(String.format("No UploadFileIntents have been found with s3ObjectKey=%s.", s3ObjectKey));
                return null;
            }

            logger.info(String.format("UploadFileIntent with id=%s has been retrieved by s3ObjectKey=%s.", foundUploadFileIntent.getId(), foundUploadFileIntent.getS3ObjectKey()));
	    	return foundUploadFileIntent;
        } catch (Exception e) {
            logger.error(String.format("An exception occurred while retrieving UploadFileIntent by s3ObjectKey=%s. Exception=[%s]",
                s3ObjectKey, FormattingTool.stringifyException(e)));
            throw new DatabaseException();
        }
    }
}
