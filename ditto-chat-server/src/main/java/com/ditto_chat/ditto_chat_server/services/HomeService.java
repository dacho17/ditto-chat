package com.ditto_chat.ditto_chat_server.services;

import java.util.List;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import com.ditto_chat.ditto_chat_server.dtos.ChatThreadOverviewDto;
import com.ditto_chat.ditto_chat_server.dtos.RawChatThreadOverviewDto;
import com.ditto_chat.ditto_chat_server.dtos.ResponsePagedListDto;
import com.ditto_chat.ditto_chat_server.helpers.EntityPaginationHelper;
import com.ditto_chat.ditto_chat_server.mappers.ChatThreadMapper;
import com.ditto_chat.ditto_chat_server.repositories.ChatThreadRepository;

@Service
public class HomeService {
    private ChatThreadRepository chatThreadRepository;
    private final Logger logger = LoggerFactory.getLogger(HomeService.class);

    public HomeService(ChatThreadRepository chatThreadRepository) {
        this.chatThreadRepository = chatThreadRepository;
    }

    public ResponsePagedListDto<ChatThreadOverviewDto> getChatThreadsPages(String peerChatterNameSearchFilter, Integer pageNumber, Boolean isInitialRetrieval, Boolean isPolling, UUID loggedInChatterId) {
        List<RawChatThreadOverviewDto> rawChatThreadOverviewDtos = this.chatThreadRepository.retrieveChattersChatThreadPages(
            peerChatterNameSearchFilter, pageNumber, isInitialRetrieval, isPolling, loggedInChatterId
        );
        boolean isLastChatThreadsPage = EntityPaginationHelper.isLastEntityPage(rawChatThreadOverviewDtos, pageNumber, isInitialRetrieval || isPolling);
        EntityPaginationHelper.removeAdditionalEntityOnPage(rawChatThreadOverviewDtos, pageNumber, isInitialRetrieval || isPolling);

        List<ChatThreadOverviewDto> chatThreadOverviewDtoPages = rawChatThreadOverviewDtos.stream()
            .map(rawChatThreadOverviewDto -> ChatThreadMapper.fromChatThreadToChatThreadOverviewDto(
                rawChatThreadOverviewDto.getChatThread(),
                rawChatThreadOverviewDto.getNumberOfUnseenMessagesByLoggedInChatter(),
                rawChatThreadOverviewDto.getLoggedInChatThreadParticipant(),
                rawChatThreadOverviewDto.getPeerChatThreadParticipant(),
                rawChatThreadOverviewDto.getPeerAccountImage()
            )).toList();

        return new ResponsePagedListDto<>(chatThreadOverviewDtoPages, isLastChatThreadsPage);
    }
}
