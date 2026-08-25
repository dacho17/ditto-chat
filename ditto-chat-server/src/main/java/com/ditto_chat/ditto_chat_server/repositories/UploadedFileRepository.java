package com.ditto_chat.ditto_chat_server.repositories;

import org.hibernate.Session;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import com.ditto_chat.ditto_chat_server.entities.QUploadedFile;
import com.ditto_chat.ditto_chat_server.entities.UploadedFile;
import com.ditto_chat.ditto_chat_server.exceptions.DatabaseException;
import com.ditto_chat.ditto_chat_server.utils.FormattingTool;
import com.querydsl.jpa.impl.JPAQueryFactory;

@Repository
public class UploadedFileRepository {
    @Autowired
    private Session hibernateSession;
    @Autowired
    private JPAQueryFactory queryFactory;
    private final Logger logger = LoggerFactory.getLogger(UploadedFileRepository.class);

    public UploadedFile createUploadedFile(UploadedFile newUploadedFile) {
        try {
            this.hibernateSession.persist(newUploadedFile);

            logger.info(String.format("New UploadedFile with id=%s has been created", newUploadedFile.getId()));
            return newUploadedFile;
        } catch (Exception e) {
            logger.error(String.format("An exception occurred while creating a new UploadedFile. Exception=[%s]",
                FormattingTool.stringifyException(e)));
            throw new DatabaseException();
        }
    }

    public UploadedFile retrieveByS3ObjectKey(String s3ObjectKey) {
        QUploadedFile qUploadedFile = QUploadedFile.uploadedFile;

        try {
            UploadedFile foundUploadedFile = this.queryFactory
                .selectFrom(qUploadedFile)
                .where(qUploadedFile.s3ObjectKey.eq(s3ObjectKey))
                .fetchOne();
            
            if (foundUploadedFile == null) {
                logger.info(String.format("No UploadedFiles have been found with s3ObjectKey=%s.", s3ObjectKey));
                return null;
            }

            logger.info(String.format("UploadedFile with id=%s has been retrieved by s3ObjectKey=%s.", foundUploadedFile.getId(), foundUploadedFile.getS3ObjectKey()));
	    	return foundUploadedFile;
        } catch (Exception e) {
            logger.error(String.format("An exception occurred while retrieving UploadedFile by s3ObjectKey=%s. Exception=[%s]",
                s3ObjectKey, FormattingTool.stringifyException(e)));
            throw new DatabaseException();
        }
    }
}
