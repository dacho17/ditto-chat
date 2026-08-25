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
import com.ditto_chat.ditto_chat_server.dtos.ChatterOverviewDto;
import com.ditto_chat.ditto_chat_server.dtos.ResponseBody;
import com.ditto_chat.ditto_chat_server.dtos.ResponsePagedListDto;
import com.ditto_chat.ditto_chat_server.helpers.EntityPaginationHelper;
import com.ditto_chat.ditto_chat_server.helpers.auth.ChatterUserDetails;
import com.ditto_chat.ditto_chat_server.services.ChattersService;
import com.ditto_chat.ditto_chat_server.validators.RequestUrlValidator;

@RestController
@RequestMapping(value = "", produces = { "application/json" })
public class ChattersController extends GeneralController {
    @Autowired
    private ChattersService chattersService;
	private final Logger logger = LoggerFactory.getLogger(ChattersController.class);

	@ResponseStatus(code = HttpStatus.OK)
	@GetMapping("/chatters")
	public ResponseEntity<?> getChatters(
        @RequestParam(required = true) String searchFilter, @RequestParam(required = true) Integer pageNumber, @RequestParam(required = true) Boolean isInitialRetrieval,
		@AuthenticationPrincipal ChatterUserDetails chatterUserDetails
    ) throws Exception {
		logger.info(String.format("GET /chatters?searchFilter=%s&pageNumber=%d&isInitialRetrieval=%s - endpoint accessed.", searchFilter, pageNumber, isInitialRetrieval));
		
        RequestUrlValidator.validateSearchFilter(searchFilter);
        RequestUrlValidator.validatePageNumber(pageNumber);

        ResponsePagedListDto<ChatterOverviewDto> chatterOverviewPages
            = this.chattersService.getChattersPages(searchFilter, pageNumber, isInitialRetrieval, chatterUserDetails.getId());
		if (EntityPaginationHelper.doesEntityPageExist(chatterOverviewPages.getPageList(), pageNumber, isInitialRetrieval) == false) {
			logger.warn(String.format("Chatter with id=%s requested Chatter Page which does not exist for searchFilter=%s, pageNumber=%d, isInitialRetrieval=%s",
				chatterUserDetails.getId(), searchFilter, pageNumber, isInitialRetrieval));
			String redirectUrl = String.format("%s?searchFilter=%s&pageNumber=%d&isInitialRetrieval=%s", Constants.CHATTERS_URL, searchFilter, 0, true);
			return generateRedirectResponse(HttpStatus.NOT_FOUND, Constants.PAGE_NOT_FOUND_ERROR_MESSAGE, redirectUrl);
		}

		logger.info(String.format("GET /chatters?searchFilter=%s&pageNumber=%d&isInitialRetrieval=%s - returning response.", searchFilter, pageNumber,
			isInitialRetrieval));
		return ResponseEntity
			.status(HttpStatus.OK)
			.body(new ResponseBody<ResponsePagedListDto<ChatterOverviewDto>>(null, chatterOverviewPages));
	}
}
