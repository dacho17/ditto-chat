package com.ditto_chat.ditto_chat_server.controllers;

import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.ditto_chat.ditto_chat_server.Constants;
import com.ditto_chat.ditto_chat_server.dtos.ChatThreadDto;
import com.ditto_chat.ditto_chat_server.dtos.ChatThreadHistoryClearedDto;
import com.ditto_chat.ditto_chat_server.dtos.ChatThreadMessageDto;
import com.ditto_chat.ditto_chat_server.dtos.ChatThreadMessageForm;
import com.ditto_chat.ditto_chat_server.dtos.ResponseBody;
import com.ditto_chat.ditto_chat_server.dtos.ResponsePagedListDto;
import com.ditto_chat.ditto_chat_server.helpers.EntityPaginationHelper;
import com.ditto_chat.ditto_chat_server.helpers.auth.Authenticator;
import com.ditto_chat.ditto_chat_server.helpers.auth.ChatterUserDetails;
import com.ditto_chat.ditto_chat_server.services.ChatService;
import com.ditto_chat.ditto_chat_server.validators.ChatValidator;
import com.ditto_chat.ditto_chat_server.validators.RequestUrlValidator;

import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping(value = "/chat", produces = { "application/json" })
public class ChatController extends GeneralController {
    @Autowired
	private ChatService chatService;
    @Autowired
    private Authenticator chatterAuthenticator;
	private final Logger logger = LoggerFactory.getLogger(ChatController.class);
    private final String CHAT_THREAD_HISTORY_CLEARED_AT_SUCCESS_MESSAGE = "Chat History is cleared";

    @ResponseStatus(code = HttpStatus.CREATED)
    @PostMapping("/{chatterId}")
    public ResponseEntity<ResponseBody<ChatThreadDto>> newChatThread(
        HttpServletRequest request,
        @PathVariable UUID chatterId,
        @AuthenticationPrincipal ChatterUserDetails loggedInChatterUserDetails
    ) throws Exception {
		logger.info(String.format("POST /chat/%s - endpoint accessed.", chatterId));

        ChatThreadDto newChatThreadDto =
            this.chatService.createChatThreadWithPeerChatter(loggedInChatterUserDetails.getId(), chatterId);

        logger.info(String.format("POST /chat/%s - endpoint accessed - returning response.", chatterId));
		return ResponseEntity
			.status(HttpStatus.CREATED)
			.body(new ResponseBody<ChatThreadDto>(
                null,
                newChatThreadDto,
                this.chatterAuthenticator.getSessionExpiresAt(request)
            ));
    }

    @ResponseStatus(code = HttpStatus.OK)
    @GetMapping("/{chatThreadId}")
    public ResponseEntity<ResponseBody<ChatThreadDto>> getChatThread(
        HttpServletRequest request,
        @PathVariable UUID chatThreadId,
        @AuthenticationPrincipal ChatterUserDetails loggedInChatterUserDetails
    ) throws Exception {
		logger.info(String.format("GET /chat/%s - endpoint accessed.", chatThreadId));

        ChatThreadDto retrievedChatThreadDto =
            this.chatService.getChattersChatThread(loggedInChatterUserDetails.getId(), chatThreadId);

        logger.info(String.format("GET /chat/%s - endpoint accessed - returning response.", chatThreadId));
		return ResponseEntity
			.status(HttpStatus.OK)
			.body(new ResponseBody<ChatThreadDto>(
                null,
                retrievedChatThreadDto,
                this.chatterAuthenticator.getSessionExpiresAt(request)
            ));
    }

    @ResponseStatus(code = HttpStatus.OK)
    @GetMapping("/{chatThreadId}/get-latest-messages")
    public ResponseEntity<?> getChatThreadMessages(
        HttpServletRequest request,
        @PathVariable UUID chatThreadId,
        @RequestParam(required = true) Integer pageNumber,
        @AuthenticationPrincipal ChatterUserDetails loggedInChatterUserDetails
    ) throws Exception {
		logger.info(String.format("GET /chat/%s/get-latest-messages - endpoint accessed.", chatThreadId));

        RequestUrlValidator.validatePageNumber(pageNumber);
        final boolean isInitialRetrieval = false;

        ResponsePagedListDto<ChatThreadMessageDto> chatThreaadMessagesDtoPage
            = this.chatService.getChatThreadMessagesPage(loggedInChatterUserDetails.getId(), chatThreadId, pageNumber);
        if (EntityPaginationHelper.doesEntityPageExist(chatThreaadMessagesDtoPage.getPagedList(), pageNumber, isInitialRetrieval) == false) {
			logger.warn(String.format("Chatter with id=%s requested ChatThreadMessage Page which does not exist for chatThreadId=%s and pageNumber=%d",
				loggedInChatterUserDetails.getId(), chatThreadId, pageNumber));
			String redirectUrl = String.format("%s/%s", Constants.CHAT_URL, chatThreadId);
			return generateRedirectResponse(
                HttpStatus.NOT_FOUND,
                Constants.PAGE_NOT_FOUND_ERROR_MESSAGE,
                redirectUrl,
                this.chatterAuthenticator.getSessionExpiresAt(request)
            );
		}

        logger.info(String.format("GET /chat/%s/get-latest-messages - returning response.", chatThreadId));
		return ResponseEntity
			.status(HttpStatus.OK)
			.body(new ResponseBody<ResponsePagedListDto<ChatThreadMessageDto>>(
                null,
                chatThreaadMessagesDtoPage,
                this.chatterAuthenticator.getSessionExpiresAt(request)
            ));
    }

    @ResponseStatus(code = HttpStatus.CREATED)
    @PostMapping("/{chatThreadId}/update-last-seen-message/{chatThreadMessageId}")
    public ResponseEntity<ResponseBody<ChatThreadMessageDto>> updateLastSeenMessage(
        HttpServletRequest request,
        @PathVariable UUID chatThreadId,
        @PathVariable UUID chatThreadMessageId,
        @AuthenticationPrincipal ChatterUserDetails loggedInChatterUserDetails
    ) throws Exception {
        logger.info(String.format("POST /chat/%s/update-last-seen-message/%s - endpoint accessed.", chatThreadId, chatThreadMessageId));

        ChatThreadMessageDto lastSeenChatThreadMessageDto =
            this.chatService.updateLastSeenMessageByLoggedInChatter(loggedInChatterUserDetails.getId(), chatThreadId, chatThreadMessageId);

        logger.info(String.format("GET /chat/%s/get-latest-messages - returning response.", chatThreadId));
		return ResponseEntity
			.status(HttpStatus.CREATED)
			.body(new ResponseBody<ChatThreadMessageDto>(
                null,
                lastSeenChatThreadMessageDto,
                this.chatterAuthenticator.getSessionExpiresAt(request)
            ));
    }

    @ResponseStatus(code = HttpStatus.CREATED)
    @PostMapping("/{chatThreadId}/send-message")
    public ResponseEntity<ResponseBody<ChatThreadMessageDto>> sendChatThreadMessage(
        HttpServletRequest request,
        @PathVariable UUID chatThreadId,
        @RequestBody ChatThreadMessageForm chatThreadMessageForm,
        @AuthenticationPrincipal ChatterUserDetails loggedInChatterUserDetails
    ) throws Exception {
        logger.info(String.format("POST /chat/%s/send-message - endpoint accessed.", chatThreadId));

        ChatValidator.validateChatThreadMessageForm(chatThreadMessageForm);

        ChatThreadMessageDto sentChatThreadMessageDto
            = this.chatService.createChatThreadMessageInChatThread(loggedInChatterUserDetails.getId(), chatThreadMessageForm, chatThreadId);
    
        logger.info(String.format("POST /chat/%s/send-message - returning response.", chatThreadId));
		return ResponseEntity
			.status(HttpStatus.CREATED)
			.body(new ResponseBody<ChatThreadMessageDto>(
                null,
                sentChatThreadMessageDto,
                this.chatterAuthenticator.getSessionExpiresAt(request)
            ));
    }

    @ResponseStatus(code = HttpStatus.CREATED)
    @PostMapping("/{chatThreadId}/clear-history")
    public ResponseEntity<ResponseBody<ChatThreadHistoryClearedDto>> clearChatThreadHistory(
        HttpServletRequest request,
        @PathVariable UUID chatThreadId,
        @AuthenticationPrincipal ChatterUserDetails loggedInChatterUserDetails
    ) throws Exception {
        logger.info(String.format("POST /chat/%s/clear-history - endpoint accessed.", chatThreadId));

        ChatThreadHistoryClearedDto newChatThreadHistoryClearedDto
            = this.chatService.clearChattersChatThreadHistory(loggedInChatterUserDetails.getId(), chatThreadId);

        logger.info(String.format("POST /chat/%s/clear-history - returning response.", chatThreadId));
		return ResponseEntity
			.status(HttpStatus.CREATED)
			.body(new ResponseBody<ChatThreadHistoryClearedDto>(
                this.CHAT_THREAD_HISTORY_CLEARED_AT_SUCCESS_MESSAGE,
                newChatThreadHistoryClearedDto,
                this.chatterAuthenticator.getSessionExpiresAt(request)
            ));
    }
}
