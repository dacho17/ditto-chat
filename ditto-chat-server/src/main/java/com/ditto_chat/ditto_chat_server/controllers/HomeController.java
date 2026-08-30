package com.ditto_chat.ditto_chat_server.controllers;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.ditto_chat.ditto_chat_server.Constants;
import com.ditto_chat.ditto_chat_server.dtos.ChatThreadOverviewDto;
import com.ditto_chat.ditto_chat_server.dtos.ResponseBody;
import com.ditto_chat.ditto_chat_server.dtos.ResponsePagedListDto;
import com.ditto_chat.ditto_chat_server.helpers.EntityPaginationHelper;
import com.ditto_chat.ditto_chat_server.helpers.auth.Authenticator;
import com.ditto_chat.ditto_chat_server.helpers.auth.ChatterUserDetails;
import com.ditto_chat.ditto_chat_server.services.HomeService;
import com.ditto_chat.ditto_chat_server.validators.RequestUrlValidator;

import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping(value = "/home", produces = { "application/json" })
public class HomeController extends GeneralController {
    @Autowired
    private HomeService homeService;
    @Autowired
    private Authenticator chatterAuthenticator;
	private final Logger logger = LoggerFactory.getLogger(HomeController.class);

	@ResponseStatus(code = HttpStatus.OK)
	@GetMapping("")
    public ResponseEntity<?> getChatThreads(
        HttpServletRequest request,
        @RequestParam(required = true) String searchFilter,
        @RequestParam(required = true) Integer pageNumber,
        @RequestParam(required = true) Boolean isInitialRetrieval,
        @RequestParam(required = true) Boolean isPolling,
        @AuthenticationPrincipal ChatterUserDetails loggedInChatterUserDetails
    ) throws Exception {
		logger.info(String.format("GET /home?searchFilter=%s&pageNumber=%d&isInitialRetrieval=%s&isPolling=%s - endpoint accessed.", searchFilter, pageNumber, isInitialRetrieval, isPolling));

        RequestUrlValidator.validateSearchFilter(searchFilter);
        RequestUrlValidator.validatePageNumber(pageNumber);

        ResponsePagedListDto<ChatThreadOverviewDto> chatThreadOverviewDtoPages
            = this.homeService.getChatThreadsPages(searchFilter, pageNumber, isInitialRetrieval, isPolling, loggedInChatterUserDetails.getId());
		if (EntityPaginationHelper.doesEntityPageExist(chatThreadOverviewDtoPages.getPagedList(), pageNumber, isInitialRetrieval) == false) {
			logger.warn(String.format("Chatter with id=%s requested Chatter Page which does not exist for searchFilter=%s, pageNumber=%d, isInitialRetrieval=%s, isPolling=%s",
				loggedInChatterUserDetails.getId(), searchFilter, pageNumber, isInitialRetrieval, isPolling));
			String redirectUrl =
                String.format("%s?searchFilter=%s&pageNumber=%d&isInitialRetrieval=%s%isPolling=%s", Constants.HOME_URL, searchFilter, 0, true, false);
			return generateRedirectResponse(
                HttpStatus.NOT_FOUND,
                Constants.PAGE_NOT_FOUND_ERROR_MESSAGE,
                redirectUrl,
                this.chatterAuthenticator.getSessionExpiresAt(request)
            );
		}

		logger.info(String.format("GET /home?searchFilter=%s&pageNumber=%d&isInitialRetrieval=%s&isPolling=%s - returning response.", searchFilter, pageNumber, isInitialRetrieval, isPolling));
		return ResponseEntity
			.status(HttpStatus.OK)
			.body(new ResponseBody<ResponsePagedListDto<ChatThreadOverviewDto>>(
                null,
                chatThreadOverviewDtoPages,
                this.chatterAuthenticator.getSessionExpiresAt(request)
            ));
    }
}
