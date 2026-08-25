package com.ditto_chat.ditto_chat_server.services;

import org.hibernate.Session;
import org.hibernate.Transaction;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import com.ditto_chat.ditto_chat_server.dtos.S3PreSignedUrlDto;
import com.ditto_chat.ditto_chat_server.dtos.UploadFileIntentForm;
import com.ditto_chat.ditto_chat_server.dtos.UploadedFileToS3NotificationDto;
import com.ditto_chat.ditto_chat_server.entities.UploadFileIntent;
import com.ditto_chat.ditto_chat_server.entities.UploadedFile;
import com.ditto_chat.ditto_chat_server.exceptions.InvalidSystemStateException;
// import com.ditto_chat.ditto_chat_server.helpers.S3Helper;
import com.ditto_chat.ditto_chat_server.mappers.UploadFileIntentMapper;
import com.ditto_chat.ditto_chat_server.mappers.UploadedFileMapper;
import com.ditto_chat.ditto_chat_server.repositories.UploadFileIntentRepository;
import com.ditto_chat.ditto_chat_server.repositories.UploadedFileRepository;

@Service
public class AwsService {
    // private S3Helper s3Helper;
    private UploadFileIntentRepository uploadFileIntentRepository;
    private UploadedFileRepository uploadedFileRepository;
    private Session hibernateSession;
    private final Logger logger = LoggerFactory.getLogger(AwsService.class);

    public AwsService(
        // S3Helper s3Helper,
        UploadFileIntentRepository uploadFileIntentRepository,
        UploadedFileRepository uploadedFileRepository,
        Session hibernateSession
    ) {
        // this.s3Helper = s3Helper;
        this.uploadFileIntentRepository = uploadFileIntentRepository;
        this.uploadedFileRepository = uploadedFileRepository;
        this.hibernateSession = hibernateSession;
    }

    // public S3PreSignedUrlDto registerNewUploadFileIntent(UploadFileIntentForm uploadFileIntentForm) {
    //     S3PreSignedUrlDto uploadFileIntentS3PreSignedUrlDto
    //         = this.s3Helper.generatePutPreSignedUrl(uploadFileIntentForm.getFileName(), uploadFileIntentForm.getFilePurpose());
        
    //     Transaction dbTransaction = this.hibernateSession.beginTransaction();
        
    //     UploadFileIntent newUploadFileIntent =
    //         UploadFileIntentMapper.fromUploadFileIntentFormToUploadFileIntent(uploadFileIntentForm, uploadFileIntentS3PreSignedUrlDto);
    //     this.uploadFileIntentRepository.createUploadFileIntent(newUploadFileIntent);
    //     dbTransaction.commit();

    //     return uploadFileIntentS3PreSignedUrlDto;
    // }

    public void registerUploadedFile(UploadedFileToS3NotificationDto uploadedFileToS3NotificationDto) {        
        Transaction dbTransaction = this.hibernateSession.beginTransaction();

        UploadFileIntent relatedUploadFileIntent
            = this.uploadFileIntentRepository.retrieveByS3ObjectKey(uploadedFileToS3NotificationDto.getObjectKey());
        if (relatedUploadFileIntent == null) {
            logger.error(String.format("Uploaded File was attempted to be Registered through AWS S3 Event. Matching UploadFileIntent with s3ObjectKey=%s has not been found.\nThis situation should not happen.", uploadedFileToS3NotificationDto.getObjectKey()));
            throw new InvalidSystemStateException();
        }

        UploadedFile uploadedFileToRegister =
            UploadedFileMapper.createUploadedFileFromUploadFileIntent(relatedUploadFileIntent, uploadedFileToS3NotificationDto);
        this.uploadedFileRepository.createUploadedFile(uploadedFileToRegister);
        dbTransaction.commit();
    }
}
