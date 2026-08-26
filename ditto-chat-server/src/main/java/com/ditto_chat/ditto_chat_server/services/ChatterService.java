package com.ditto_chat.ditto_chat_server.services;

import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import com.ditto_chat.ditto_chat_server.dtos.ChatterDto;
import com.ditto_chat.ditto_chat_server.dtos.ChatterOverviewDto;
import com.ditto_chat.ditto_chat_server.dtos.ResponsePagedListDto;
import com.ditto_chat.ditto_chat_server.dtos.SharedFileDto;
import com.ditto_chat.ditto_chat_server.entities.AccountImage;
import com.ditto_chat.ditto_chat_server.entities.ChatThread;
import com.ditto_chat.ditto_chat_server.entities.ChatThreadParticipant;
import com.ditto_chat.ditto_chat_server.entities.Chatter;
import com.ditto_chat.ditto_chat_server.entities.SharedFile;
import com.ditto_chat.ditto_chat_server.exceptions.BadRequestException;
import com.ditto_chat.ditto_chat_server.exceptions.PageNotFoundException;
import com.ditto_chat.ditto_chat_server.helpers.EntityPaginationHelper;
import com.ditto_chat.ditto_chat_server.mappers.ChatterMapper;
import com.ditto_chat.ditto_chat_server.mappers.SharedFileMapper;
import com.ditto_chat.ditto_chat_server.repositories.AccountImageRepository;
import com.ditto_chat.ditto_chat_server.repositories.ChatThreadRepository;
import com.ditto_chat.ditto_chat_server.repositories.ChatterRepository;
import com.ditto_chat.ditto_chat_server.repositories.SharedFileRepository;

@Service
public class ChatterService {
    private final ChatterRepository chatterRepository;
    private final AccountImageRepository accountImageRepository;
    private final ChatThreadRepository chatThreadRepository;
    private final SharedFileRepository sharedFileRepository;
    private final Logger logger = LoggerFactory.getLogger(ChatterService.class);

    public ChatterService(
        ChatterRepository chatterRepository,
        AccountImageRepository accountImageRepository,
        ChatThreadRepository chatThreadRepository,
        SharedFileRepository sharedFileRepository
    ) {
        this.chatterRepository = chatterRepository;
        this.accountImageRepository = accountImageRepository;
        this.chatThreadRepository = chatThreadRepository;
        this.sharedFileRepository = sharedFileRepository;
    }

    public ChatterDto getPeerChatterWithSharedFilesPage(UUID peerChatterId, UUID loggedInChatterId) {
        Chatter foundPeerChatter = this.chatterRepository.retrieveById(peerChatterId);
        if (foundPeerChatter == null) {
            logger.error(String.format("Peer Chatter with id=%s has not been found. No ChatterDto will be returned.", peerChatterId));
			throw new BadRequestException();
        }

        AccountImage peerChatterAccountImage
            = this.accountImageRepository.retrieveCurrentAccountImageForChatter(foundPeerChatter);

        Map<String, ChatThread> retrievedChatThreadInMap =
            this.chatThreadRepository.retrieveChatThreadsBetweenChatterAndPeerChatters(loggedInChatterId, List.of(foundPeerChatter));

        final Integer pageNumber = 0;
        final boolean isInitialRetrieval = true;
        ChatThread retrievedChatThread = null;
        ChatThreadParticipant loggedInChatThreadParticipant = null;
        List<SharedFile> sharedFilesInChatThread = new LinkedList<>();
        if (retrievedChatThreadInMap.size() == 1) {
            retrievedChatThread = retrievedChatThreadInMap.get(foundPeerChatter.getId().toString());
            loggedInChatThreadParticipant = retrievedChatThread.getChatThreadParticipants().stream()
                .filter(chatThreadParticipant -> chatThreadParticipant.getChatter().getId().equals(loggedInChatterId))
                .findFirst().orElse(null);
            sharedFilesInChatThread =
                this.sharedFileRepository.retrieveSharedFilePages(retrievedChatThread.getId(), pageNumber, loggedInChatThreadParticipant);
            EntityPaginationHelper.removeAdditionalEntityOnPage(sharedFilesInChatThread, pageNumber, isInitialRetrieval);
        }

        ChatterOverviewDto retrievedChatterOverviewDto =
            ChatterMapper.fromChatterToChatterOverviewDto(foundPeerChatter, peerChatterAccountImage, retrievedChatThread);
        ResponsePagedListDto<SharedFileDto> sharedFilesDtosInChatThread = new ResponsePagedListDto<>(
            sharedFilesInChatThread.stream().map(sharedFile -> SharedFileMapper.fromSharedFileToSharedFileDto(
                sharedFile, sharedFile.getChatThreadMessage().getSenderChatThreadParticipant().getChatter().getId())
            ).toList(),
            EntityPaginationHelper.isLastEntityPage(sharedFilesInChatThread, pageNumber, isInitialRetrieval)
        );

        return new ChatterDto(retrievedChatterOverviewDto, sharedFilesDtosInChatThread);
    }

    public ResponsePagedListDto<SharedFileDto> getPeerSharedFilesPage(UUID peerChatterId, Integer pageNumber, UUID loggedInChatterId) {
        Chatter foundPeerChatter = this.chatterRepository.retrieveById(peerChatterId);
        if (foundPeerChatter == null) {
            logger.error(String.format("Peer Chatter with id=%s has not been found. No ChatterDto will be returned.", peerChatterId));
			throw new BadRequestException();
        }

        Map<String, ChatThread> retrievedChatThreadInMap =
            this.chatThreadRepository.retrieveChatThreadsBetweenChatterAndPeerChatters(loggedInChatterId, List.of(foundPeerChatter));

        final boolean isInitialRetrieval = pageNumber == 0;
        ChatThread retrievedChatThread = null;
        ChatThreadParticipant loggedInChatThreadParticipant = null;
        List<SharedFile> targetSharedFilesPage = new LinkedList<>();
        if (retrievedChatThreadInMap.size() == 1) {
            retrievedChatThread = retrievedChatThreadInMap.get(foundPeerChatter.getId().toString());
            loggedInChatThreadParticipant = retrievedChatThread.getChatThreadParticipants().stream()
                .filter(chatThreadParticipant -> chatThreadParticipant.getChatter().getId().equals(loggedInChatterId))
                .findFirst().orElse(null);
            targetSharedFilesPage =
                this.sharedFileRepository.retrieveSharedFilePages(retrievedChatThread.getId(), pageNumber, loggedInChatThreadParticipant);
            EntityPaginationHelper.removeAdditionalEntityOnPage(targetSharedFilesPage, pageNumber, isInitialRetrieval);
        } else {
            logger.error(String.format("Chatter with id=%s requested pageNumber=%d of SharedFiles with loggedInChatter (id=%s). The ChatThread between the Chatters has not been found. SharedFilePage will not be returned.", loggedInChatterId, pageNumber, peerChatterId));
            throw new PageNotFoundException();
        }

        return new ResponsePagedListDto<>(
            targetSharedFilesPage.stream().map(sharedFile -> SharedFileMapper.fromSharedFileToSharedFileDto(
                sharedFile, sharedFile.getChatThreadMessage().getSenderChatThreadParticipant().getChatter().getId())
            ).toList(),
            EntityPaginationHelper.isLastEntityPage(targetSharedFilesPage, pageNumber, isInitialRetrieval)
        );
    }
}
