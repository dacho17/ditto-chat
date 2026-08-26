package com.ditto_chat.ditto_chat_server.services;

import java.util.UUID;

import org.hibernate.Session;
import org.hibernate.Transaction;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import com.ditto_chat.ditto_chat_server.dtos.AccountImageDto;
import com.ditto_chat.ditto_chat_server.dtos.AccountImageForm;
import com.ditto_chat.ditto_chat_server.entities.AccountImage;
import com.ditto_chat.ditto_chat_server.entities.Chatter;
import com.ditto_chat.ditto_chat_server.entities.UploadedFile;
import com.ditto_chat.ditto_chat_server.mappers.AccountImageMapper;
import com.ditto_chat.ditto_chat_server.repositories.AccountImageRepository;
import com.ditto_chat.ditto_chat_server.repositories.ChatterRepository;

@Service
public class AccountService {
    private final AwsService awsService;
    private final ChatterRepository chatterRepository;
    private final AccountImageRepository accountImageRepository;
    private final Session hibernateSession;
    private final Logger logger = LoggerFactory.getLogger(AccountService.class);

    public AccountService(
        AwsService awsService,
        ChatterRepository chatterRepository,
        AccountImageRepository accountImageRepository,
        Session hibernateSession
    ) {
        this.awsService = awsService;
        this.chatterRepository = chatterRepository;
        this.accountImageRepository = accountImageRepository;
        this.hibernateSession = hibernateSession;
    }

    public AccountImageDto createNewAccountImage(UUID loggedInChatterId, AccountImageForm newAccountImageForm) {
        Chatter loggedInChatter = this.chatterRepository.retrieveById(loggedInChatterId);

        UploadedFile newChatThreadMessagePriorlyUploadedFile =
            this.awsService.retrievePreUploadedFile(newAccountImageForm.getAccountImageFileS3ObjectKey(), loggedInChatter);

        Transaction dbTransaction = this.hibernateSession.beginTransaction();

        this.accountImageRepository.setReplacedAtOfCurrentAccountImageForChatter(loggedInChatter);
        AccountImage newAccountImage =
            AccountImageMapper.fromUploadedFileToAccountImage(newChatThreadMessagePriorlyUploadedFile, loggedInChatter);
        AccountImage newCurrentAccountImage =
            this.accountImageRepository.createAccountImage(newAccountImage);
        dbTransaction.commit();

        return AccountImageMapper.fromAccountImageToAccountImageDto(newCurrentAccountImage);
    }
}
