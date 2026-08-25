package com.ditto_chat.ditto_chat_server.services;

import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.hibernate.Session;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import com.ditto_chat.ditto_chat_server.dtos.ChatterOverviewDto;
import com.ditto_chat.ditto_chat_server.dtos.ResponsePagedListDto;
import com.ditto_chat.ditto_chat_server.entities.AccountImage;
import com.ditto_chat.ditto_chat_server.entities.ChatThread;
import com.ditto_chat.ditto_chat_server.entities.Chatter;
import com.ditto_chat.ditto_chat_server.helpers.EntityPaginationHelper;
import com.ditto_chat.ditto_chat_server.mappers.ChatterMapper;
import com.ditto_chat.ditto_chat_server.repositories.AccountImageRepository;
import com.ditto_chat.ditto_chat_server.repositories.ChatThreadRepository;
import com.ditto_chat.ditto_chat_server.repositories.ChatterRepository;

@Service
public class ChattersService {
    private ChatterRepository chatterRepository;
    private AccountImageRepository accountImageRepository;
    private ChatThreadRepository chatThreadRepository;
    private Session hibernateSession;
    private final Logger logger = LoggerFactory.getLogger(ChattersService.class);
    
    public ChattersService(
        ChatterRepository chatterRepository,
        AccountImageRepository accountImageRepository,
        ChatThreadRepository chatThreadRepository,
        Session hibernateSession
    ) {
        this.chatterRepository = chatterRepository;
        this.accountImageRepository = accountImageRepository;
        this.chatThreadRepository = chatThreadRepository;
        this.hibernateSession = hibernateSession;
    }

    public ResponsePagedListDto<ChatterOverviewDto> getChattersPages(String searchFilter, Integer pageNumber, Boolean isInitialRetrieval, UUID loggedInChatterId) {
        List<Chatter> pagedPeerChatters
            = this.chatterRepository.retrieveChatterPages(searchFilter, pageNumber, isInitialRetrieval, loggedInChatterId);
        boolean isLastChattersPage = EntityPaginationHelper.isLastEntityPage(pagedPeerChatters, pageNumber, isInitialRetrieval);
        List<AccountImage> peerChatterCurrentAccountImages
            = this.accountImageRepository.retrieveCurrentAccountImagesForChatters(pagedPeerChatters);
        EntityPaginationHelper.removeAdditionalEntityOnPage(pagedPeerChatters, pageNumber, isInitialRetrieval);

        Map<String, ChatThread> chatThreadsBetweenLoggedInAndPeerChatters
            = this.chatThreadRepository.retrieveChatThreadsBetweenChatterAndPeerChatters(loggedInChatterId, pagedPeerChatters);

        List<ChatterOverviewDto> peerChatterOverviewDtos = new LinkedList<>();
        for (Chatter peerChatter: pagedPeerChatters) {
            AccountImage peerChatterAccountImage = peerChatterCurrentAccountImages
                .stream()
                .filter(accountImage -> accountImage.getChatter().getId().equals(peerChatter.getId()))
                .findFirst().orElse(null);
            ChatThread chatThreadBetweenLoggedInAndPeerChatter = chatThreadsBetweenLoggedInAndPeerChatters.get(peerChatter.getId().toString());

            peerChatterOverviewDtos.add(
                ChatterMapper.fromChatterToChatterOverviewDto(peerChatter, peerChatterAccountImage, chatThreadBetweenLoggedInAndPeerChatter)
            );
        }

        return new ResponsePagedListDto<>(peerChatterOverviewDtos, isLastChattersPage);
    }
}
