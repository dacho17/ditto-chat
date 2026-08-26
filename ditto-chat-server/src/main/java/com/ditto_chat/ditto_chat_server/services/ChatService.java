package com.ditto_chat.ditto_chat_server.services;

import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.hibernate.Session;
import org.hibernate.Transaction;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import com.ditto_chat.ditto_chat_server.Constants;
import com.ditto_chat.ditto_chat_server.dtos.ChatThreadDto;
import com.ditto_chat.ditto_chat_server.dtos.ChatThreadHistoryClearedDto;
import com.ditto_chat.ditto_chat_server.dtos.ChatThreadMessageDto;
import com.ditto_chat.ditto_chat_server.dtos.ChatThreadMessageForm;
import com.ditto_chat.ditto_chat_server.dtos.ChatThreadOverviewDto;
import com.ditto_chat.ditto_chat_server.dtos.ResponsePagedListDto;
import com.ditto_chat.ditto_chat_server.entities.AccountImage;
import com.ditto_chat.ditto_chat_server.entities.ChatThread;
import com.ditto_chat.ditto_chat_server.entities.ChatThreadMessage;
import com.ditto_chat.ditto_chat_server.entities.ChatThreadParticipant;
import com.ditto_chat.ditto_chat_server.entities.Chatter;
import com.ditto_chat.ditto_chat_server.entities.UploadedFile;
import com.ditto_chat.ditto_chat_server.exceptions.BadRequestException;
import com.ditto_chat.ditto_chat_server.exceptions.InvalidSystemStateException;
import com.ditto_chat.ditto_chat_server.helpers.EntityPaginationHelper;
import com.ditto_chat.ditto_chat_server.mappers.ChatThreadMapper;
import com.ditto_chat.ditto_chat_server.mappers.ChatThreadMessageMapper;
import com.ditto_chat.ditto_chat_server.repositories.AccountImageRepository;
import com.ditto_chat.ditto_chat_server.repositories.ChatThreadMessageRepository;
import com.ditto_chat.ditto_chat_server.repositories.ChatThreadParticipantRepository;
import com.ditto_chat.ditto_chat_server.repositories.ChatThreadRepository;
import com.ditto_chat.ditto_chat_server.repositories.ChatterRepository;

@Service
public class ChatService {
    private final AwsService awsService;
    private final ChatterRepository chatterRepository;
    private final ChatThreadRepository chatThreadRepository;
    private final AccountImageRepository accountImageRepository;
    private final ChatThreadMessageRepository chatThreadMessageRepository;
    private final ChatThreadParticipantRepository chatThreadParticipantRepository;
    private final Session hibernateSession;
    private final Logger logger = LoggerFactory.getLogger(ChatService.class);

    public ChatService(
        AwsService awsService,
        ChatterRepository chatterRepository,
        ChatThreadRepository chatThreadRepository,
        AccountImageRepository accountImageRepository,
        ChatThreadMessageRepository chatThreadMessageRepository,
        ChatThreadParticipantRepository chatThreadParticipantRepository,
        Session hibernateSession
    ) {
        this.awsService = awsService;
        this.chatterRepository = chatterRepository;
        this.chatThreadRepository = chatThreadRepository;
        this.accountImageRepository = accountImageRepository;
        this.chatThreadMessageRepository = chatThreadMessageRepository;
        this.chatThreadParticipantRepository = chatThreadParticipantRepository;
        this.hibernateSession = hibernateSession;
    }

    public ChatThreadDto createChatThreadWithPeerChatter(UUID loggedInChatterId, UUID peerChatterId) {
        Transaction dbTransaction = this.hibernateSession.beginTransaction();
        
        Chatter loggedInChatter = this.chatterRepository.retrieveById(loggedInChatterId);
        Chatter foundPeerChatter = this.chatterRepository.retrieveById(peerChatterId);
        if (foundPeerChatter == null) {
            logger.error(String.format("Peer Chatter with id=%s has not been found. New Chat Thread will not be created with the Chatter.", peerChatterId));
			throw new BadRequestException();
        }

        ChatThread newChatThreadWithPeerChatter =
            this.chatThreadRepository.createChatThread(ChatThreadMapper.newNonGroupChatThread(loggedInChatter, foundPeerChatter));
        List<ChatThreadParticipant> newChatThreadParticipants = newChatThreadWithPeerChatter.getChatThreadParticipants();

        ChatThreadParticipant loggedInChatterParticipant =
            newChatThreadParticipants.stream()
                .filter(chatThreadParticipant -> chatThreadParticipant.getChatter().getId().equals(loggedInChatter.getId()))
                .findFirst().orElse(null);
        ChatThreadParticipant peerChatterParticipant =
            newChatThreadParticipants.stream()
                .filter(chatThreadParticipant -> chatThreadParticipant.getChatter().getId().equals(foundPeerChatter.getId()))
                .findFirst().orElse(null);

        AccountImage peerChatParticipantAccountImage
            = this.accountImageRepository.retrieveCurrentAccountImageForChatter(foundPeerChatter);

        dbTransaction.commit();

        ChatThreadOverviewDto newChatThreadOverviewDto = ChatThreadMapper.fromChatThreadToChatThreadOverviewDto(
            newChatThreadWithPeerChatter, 0, loggedInChatterParticipant, peerChatterParticipant, peerChatParticipantAccountImage
        );
        
        return ChatThreadMapper.toChatThreadDto(newChatThreadOverviewDto, new ResponsePagedListDto<ChatThreadMessageDto>(new ArrayList<>(), true));
    }

    public ChatThreadDto getChattersChatThread(UUID loggedInChatterId, UUID requestedChatThreadId) {
        Chatter loggedInChatter = this.chatterRepository.retrieveById(loggedInChatterId);
        ChatThread retrievedChatThread = this.retrieveChattersChatThreadHelper(requestedChatThreadId, loggedInChatter);

        List<ChatThreadParticipant> retrievedChatThreadParticipants = this.validateAndReturnChatThreadParticipants(retrievedChatThread);

        ChatThreadParticipant loggedInChatterParticipant =
            retrievedChatThreadParticipants.stream()
                .filter(chatThreadParticipant -> chatThreadParticipant.getChatter().getId().equals(loggedInChatter.getId()))
                .findFirst().orElse(null);
        ChatThreadParticipant peerChatterParticipant =
            retrievedChatThreadParticipants.stream()
                .filter(chatThreadParticipant -> chatThreadParticipant.getChatter().getId().equals(loggedInChatter.getId()) == false)
                .findFirst().orElse(null);
        AccountImage peerChatParticipantAccountImage
            = this.accountImageRepository.retrieveCurrentAccountImageForChatter(peerChatterParticipant.getChatter());
        Integer numberOfUnseenMessagesInChatThreadByLoggedInChatter
            = this.chatThreadMessageRepository.countUnseenChatThreadMessagesByChatter(retrievedChatThread, loggedInChatterParticipant);

        final boolean isInitialRetrieval = true;
        final Integer chatThreadMessagesPageNumber = 0;
        List<ChatThreadMessage> chatThreadMessagesPage =
            this.chatThreadMessageRepository.retrieveChatThreadMessagesPage(retrievedChatThread, chatThreadMessagesPageNumber, loggedInChatterParticipant);
        boolean isLastChatThreadMessagesPage = EntityPaginationHelper.isLastEntityPage(chatThreadMessagesPage, chatThreadMessagesPageNumber, isInitialRetrieval);
        EntityPaginationHelper.removeAdditionalEntityOnPage(chatThreadMessagesPage, chatThreadMessagesPageNumber, isInitialRetrieval);
        
        List<ChatThreadMessageDto> chatThreadMessagesDtoPage = chatThreadMessagesPage.stream()
            .map(chatThreadMessage -> ChatThreadMessageMapper.fromChatThreadMessageToChatThreadMessageDto(chatThreadMessage, loggedInChatterParticipant))
            .toList();

        ChatThreadOverviewDto requestedChatThreadOverviewDto = ChatThreadMapper.fromChatThreadToChatThreadOverviewDto(
            retrievedChatThread, numberOfUnseenMessagesInChatThreadByLoggedInChatter,
            loggedInChatterParticipant, peerChatterParticipant, peerChatParticipantAccountImage
        );

        return ChatThreadMapper.toChatThreadDto(
            requestedChatThreadOverviewDto,
            new ResponsePagedListDto<ChatThreadMessageDto>(chatThreadMessagesDtoPage, isLastChatThreadMessagesPage)
        );
    }

    public ResponsePagedListDto<ChatThreadMessageDto> getChatThreadMessagesPage(UUID loggedInChatterId, UUID requestedChatThreadId, Integer pageNumber) {
        Chatter loggedInChatter = this.chatterRepository.retrieveById(loggedInChatterId);
        ChatThread retrievedChatThread = this.retrieveChattersChatThreadHelper(requestedChatThreadId, loggedInChatter);

        List<ChatThreadParticipant> retrievedChatThreadParticipants = this.validateAndReturnChatThreadParticipants(retrievedChatThread);

        ChatThreadParticipant loggedInChatterParticipant =
            retrievedChatThreadParticipants.stream()
                .filter(chatThreadParticipant -> chatThreadParticipant.getChatter().getId().equals(loggedInChatter.getId()))
                .findFirst().orElse(null);

        final boolean isInitialRetrieval = true;
        List<ChatThreadMessage> chatThreadMessagesPage =
            this.chatThreadMessageRepository.retrieveChatThreadMessagesPage(retrievedChatThread, pageNumber, loggedInChatterParticipant);
        boolean isLastChatThreadMessagesPage = EntityPaginationHelper.isLastEntityPage(chatThreadMessagesPage, pageNumber, isInitialRetrieval);
        EntityPaginationHelper.removeAdditionalEntityOnPage(chatThreadMessagesPage, pageNumber, isInitialRetrieval);

        List<ChatThreadMessageDto> chatThreadMessagesDtoPage = chatThreadMessagesPage.stream()
            .map(chatThreadMessage -> ChatThreadMessageMapper.fromChatThreadMessageToChatThreadMessageDto(chatThreadMessage, loggedInChatterParticipant))
            .toList();

        return new ResponsePagedListDto<ChatThreadMessageDto>(
            chatThreadMessagesDtoPage,
            isLastChatThreadMessagesPage
        );
    }

    public ChatThreadMessageDto updateLastSeenMessageByLoggedInChatter(UUID loggedInChatterId, UUID requestedChatThreadId, UUID newLastSeenChatThreadMessageId) {
        Chatter loggedInChatter = this.chatterRepository.retrieveById(loggedInChatterId);
        ChatThread retrievedChatThread = this.retrieveChattersChatThreadHelper(requestedChatThreadId, loggedInChatter);

        List<ChatThreadParticipant> retrievedChatThreadParticipants = this.validateAndReturnChatThreadParticipants(retrievedChatThread);

        ChatThreadParticipant loggedInChatterParticipant =
            retrievedChatThreadParticipants.stream()
                .filter(chatThreadParticipant -> chatThreadParticipant.getChatter().getId().equals(loggedInChatter.getId()))
                .findFirst().orElse(null);

        ChatThreadMessage newLastSeenMessageByLoggedInChatter =
            this.chatThreadMessageRepository.retrieveById(newLastSeenChatThreadMessageId, loggedInChatterParticipant);
        if (newLastSeenMessageByLoggedInChatter == null) {
            logger.error(String.format("Chatter with id=%s attempted to update chatThreadMessage with id=%s as the last seen ChatThreadMessage in ChatThread with id=%s. Referenced ChatThread does not exist,", loggedInChatter.getId(), newLastSeenChatThreadMessageId, retrievedChatThread.getId()));
            throw new BadRequestException();
        } else if (newLastSeenMessageByLoggedInChatter.getChatThread().getId().equals(requestedChatThreadId) == false) {
            logger.error(String.format("Chatter with id=%s attempted to update chatThreadMessage with id=%s as the last seen ChatThreadMessage in ChatThread with id=%s. ChatThreadMessage is not in the Referenced ChatThread,", loggedInChatter.getId(), newLastSeenChatThreadMessageId, retrievedChatThread.getId()));
            throw new BadRequestException();
        } else if (newLastSeenMessageByLoggedInChatter.getSenderChatThreadParticipant().getId().equals(loggedInChatterParticipant.getId()) == true) {
            logger.error(String.format("Chatter with id=%s attempted to update chatThreadMessage with id=%s as the last seen ChatThreadMessage in ChatThread with id=%s. Referenced ChatThreadMessage was sent by the Logged in Chatter.", loggedInChatter.getId(), newLastSeenChatThreadMessageId, retrievedChatThread.getId()));
            throw new BadRequestException();
        }

        // ChatThreadMessage is sent by the Peer and is in the ChatThread
        ChatThreadMessage currentLastSeenMessageByLoggedInChatter =
            loggedInChatterParticipant.getLastSeenChatThreadMessage();
        if (currentLastSeenMessageByLoggedInChatter == null) {
            logger.info(String.format("Chatter with id=%s did not seen any ChatThreadMessages in ChatThread with id=%s so far. ChatThreadMessage with id=%s will be set as the lastSeenMessage.", loggedInChatter.getId(), retrievedChatThread.getId(), newLastSeenChatThreadMessageId));

            return this.updateLastSeenChatThreadMessageHelper(loggedInChatterParticipant, newLastSeenMessageByLoggedInChatter);
        } else if (newLastSeenMessageByLoggedInChatter.getMessageRegisteredAt().getTime() > currentLastSeenMessageByLoggedInChatter.getMessageRegisteredAt().getTime()) {
            logger.info(String.format("So far last seen ChatThreadMessage by Chatter with id=%s in ChatThread with id=%s was ChatThredMessage with id=%s, registeredAt=%s. New LastSeenMessage by Chatter is ChatThreadMessage with id=%s, registeredAt=%s", loggedInChatter.getId(), retrievedChatThread.getId(), currentLastSeenMessageByLoggedInChatter.getId(), currentLastSeenMessageByLoggedInChatter.getMessageRegisteredAt(), newLastSeenMessageByLoggedInChatter.getId(), newLastSeenMessageByLoggedInChatter.getMessageRegisteredAt()));
            
            return this.updateLastSeenChatThreadMessageHelper(loggedInChatterParticipant, newLastSeenMessageByLoggedInChatter);
        } else {
            logger.warn(String.format("So far last seen ChatThreadMessage by Chatter with id=%s in ChatThread with id=%s was ChatThredMessage with id=%s, registeredAt=%s. Attempt was made to register ChatThreadMessage with id=%s, registeredAt=%s as the last seen message. The attempted ChatThreadMesage is not newer than the currently registered one. The request is ignored.", loggedInChatter.getId(), retrievedChatThread.getId(), currentLastSeenMessageByLoggedInChatter.getId(), currentLastSeenMessageByLoggedInChatter.getMessageRegisteredAt(), newLastSeenMessageByLoggedInChatter.getId(), newLastSeenMessageByLoggedInChatter.getMessageRegisteredAt()));

            return ChatThreadMessageMapper.fromChatThreadMessageToChatThreadMessageDto(currentLastSeenMessageByLoggedInChatter, loggedInChatterParticipant);
        }
    }

    public ChatThreadMessageDto createChatThreadMessageInChatThread(UUID loggedInChatterId, ChatThreadMessageForm newChatThreadMessageForm, UUID messagedChatThreadId) {
        Transaction dbTransaction = this.hibernateSession.beginTransaction();

        Chatter loggedInChatter = this.chatterRepository.retrieveById(loggedInChatterId);
        ChatThread retrievedChatThread = this.retrieveChattersChatThreadHelper(messagedChatThreadId, loggedInChatter);

        List<ChatThreadParticipant> retrievedChatThreadParticipants = this.validateAndReturnChatThreadParticipants(retrievedChatThread);

        ChatThreadParticipant loggedInChatterParticipant =
            retrievedChatThreadParticipants.stream()
                .filter(chatThreadParticipant -> chatThreadParticipant.getChatter().getId().equals(loggedInChatter.getId()))
                .findFirst().orElse(null);


        boolean isAttachmentSent = newChatThreadMessageForm.isAttachmentSent();
        UploadedFile newChatThreadMessagePriorlyUploadedFile = isAttachmentSent == true
            ? this.awsService.retrievePreUploadedFile(newChatThreadMessageForm.getAttachedFileS3ObjectKey(), loggedInChatter)
            : null;

        ChatThreadMessage newChatThreadMessage =
            ChatThreadMessageMapper.createNewChatThreadMesasage(loggedInChatterParticipant, retrievedChatThread, newChatThreadMessageForm.getMessageContent(), newChatThreadMessagePriorlyUploadedFile);
        ChatThreadMessage createdChatThreadMessage = this.chatThreadMessageRepository.createChatThreadMessage(newChatThreadMessage);

        this.chatThreadRepository.updateLastChatThreadMessage(retrievedChatThread, createdChatThreadMessage);
        dbTransaction.commit();

        return ChatThreadMessageMapper.fromChatThreadMessageToChatThreadMessageDto(createdChatThreadMessage, loggedInChatterParticipant);
    }

    public ChatThreadHistoryClearedDto clearChattersChatThreadHistory(UUID loggedInChatterId, UUID targetChatThreadId) {
        Transaction dbTransaction = this.hibernateSession.beginTransaction();

        Chatter loggedInChatter = this.chatterRepository.retrieveById(loggedInChatterId);
        ChatThread retrievedChatThread = this.retrieveChattersChatThreadHelper(targetChatThreadId, loggedInChatter);

        List<ChatThreadParticipant> retrievedChatThreadParticipants = this.validateAndReturnChatThreadParticipants(retrievedChatThread);

        ChatThreadParticipant loggedInChatterParticipant =
            retrievedChatThreadParticipants.stream()
                .filter(chatThreadParticipant -> chatThreadParticipant.getChatter().getId().equals(loggedInChatter.getId()))
                .findFirst().orElse(null);

        Timestamp newClearedChatThreadHistoryAtTimestamp =
            this.chatThreadParticipantRepository.updateClearedChatThreadHistoryAt(loggedInChatterParticipant);
        dbTransaction.commit();

        return new ChatThreadHistoryClearedDto(newClearedChatThreadHistoryAtTimestamp);
    }

    private ChatThread retrieveChattersChatThreadHelper(UUID requestedChatThreadId, Chatter loggedInChatter) {
        ChatThread retrievedChatThread = this.chatThreadRepository.retrieveChattersChatThread(requestedChatThreadId, loggedInChatter);
        if (retrievedChatThread == null) {
            logger.error(String.format("Chatter with id=%s has requested ChatThread with id=%s, which does not exist. Error Message is returned to the Client.",
                loggedInChatter.getId(), requestedChatThreadId));
            throw new BadRequestException();
        }

        return retrievedChatThread;
    }

    private List<ChatThreadParticipant> validateAndReturnChatThreadParticipants(ChatThread targetChatThread) {
        List<ChatThreadParticipant> retrievedChatThreadParticipants = targetChatThread.getChatThreadParticipants();
        if (retrievedChatThreadParticipants.size() != Constants.NUMBER_OF_PARTICIPANTS_IN_NON_GROUP_CHAT_THREAD) {
            logger.error(String.format("Number of Participants in the Retrieved ChatThread with id=%s is not %d. Chatter's ChatThread will not be returned.",
                targetChatThread.getId(), Constants.NUMBER_OF_PARTICIPANTS_IN_NON_GROUP_CHAT_THREAD));
            throw new InvalidSystemStateException();
        }

        return retrievedChatThreadParticipants;
    }

    private ChatThreadMessageDto updateLastSeenChatThreadMessageHelper(ChatThreadParticipant loggedInChatterParticipant, ChatThreadMessage newLastSeenMessageByLoggedInChatter) {
        Transaction dbTransaction = this.hibernateSession.beginTransaction();
        
        this.chatThreadParticipantRepository.updateLastSeenChatThreadMessage(loggedInChatterParticipant, newLastSeenMessageByLoggedInChatter);
        dbTransaction.commit();

        return ChatThreadMessageMapper.fromChatThreadMessageToChatThreadMessageDto(newLastSeenMessageByLoggedInChatter, loggedInChatterParticipant);
    }
}
