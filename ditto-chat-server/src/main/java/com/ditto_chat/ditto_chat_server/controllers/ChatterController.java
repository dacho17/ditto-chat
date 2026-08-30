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
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.ditto_chat.ditto_chat_server.Constants;
import com.ditto_chat.ditto_chat_server.dtos.ChatterDto;
import com.ditto_chat.ditto_chat_server.dtos.ResponseBody;
import com.ditto_chat.ditto_chat_server.dtos.ResponsePagedListDto;
import com.ditto_chat.ditto_chat_server.dtos.SharedFileDto;
import com.ditto_chat.ditto_chat_server.helpers.EntityPaginationHelper;
import com.ditto_chat.ditto_chat_server.helpers.auth.Authenticator;
import com.ditto_chat.ditto_chat_server.helpers.auth.ChatterUserDetails;
import com.ditto_chat.ditto_chat_server.services.ChatterService;
import com.ditto_chat.ditto_chat_server.validators.RequestUrlValidator;

import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping(value = "/chatter", produces = { "application/json" })
public class ChatterController extends GeneralController {
    @Autowired
    private ChatterService chatterService;
    @Autowired
    private Authenticator chatterAuthenticator;
	private final Logger logger = LoggerFactory.getLogger(ChatterController.class);

    @ResponseStatus(code = HttpStatus.OK)
    @GetMapping("/{chatterId}")
    public ResponseEntity<ResponseBody<ChatterDto>> getChatter(
        HttpServletRequest request,
        @PathVariable UUID chatterId,
        @AuthenticationPrincipal ChatterUserDetails loggedInChatterUserDetails
    ) throws Exception {
		logger.info(String.format("GET /chatter/%s - endpoint accessed.", chatterId));

        ChatterDto retrievedChatterDto =
            this.chatterService.getPeerChatterWithSharedFilesPage(chatterId, loggedInChatterUserDetails.getId());

        logger.info(String.format("GET /chatter/%s - endpoint accessed - returning response.", chatterId));
		return ResponseEntity
			.status(HttpStatus.OK)
			.body(new ResponseBody<ChatterDto>(
                null,
                retrievedChatterDto,
                this.chatterAuthenticator.getSessionExpiresAt(request)
            ));
    }

    @ResponseStatus(code = HttpStatus.OK)
    @GetMapping("/{chatterId}/shared-files")
    public ResponseEntity<?> getSharedFiles(
        HttpServletRequest request,
        @PathVariable UUID chatterId,
        @RequestParam(required = true) Integer pageNumber,
        @AuthenticationPrincipal ChatterUserDetails loggedInChatterUserDetails
    ) throws Exception {
		logger.info(String.format("GET /chatter/%s/shared-files?pageNumber=%d - endpoint accessed.", chatterId, pageNumber));

        RequestUrlValidator.validatePageNumber(pageNumber);
        
        final boolean isInitialRetrieval = pageNumber == 0;
        ResponsePagedListDto<SharedFileDto> retrievedSharedFileDtosPage =
            this.chatterService.getPeerSharedFilesPage(chatterId, pageNumber, loggedInChatterUserDetails.getId());
        if (EntityPaginationHelper.doesEntityPageExist(retrievedSharedFileDtosPage.getPagedList(), pageNumber, isInitialRetrieval) == false) {
			logger.warn(String.format("Chatter with id=%s requested SharedFile Page which does not exist for between them and PeerChatter with id=%s. The non-existent pageNumber=%d.", loggedInChatterUserDetails.getId(), chatterId, pageNumber));
			String redirectUrl = String.format("%s/%s", Constants.CHATTER_URL, chatterId);
			return generateRedirectResponse(
                HttpStatus.NOT_FOUND,
                Constants.PAGE_NOT_FOUND_ERROR_MESSAGE,
                redirectUrl,
                this.chatterAuthenticator.getSessionExpiresAt(request)
            );
		}

        logger.info(String.format("GET /chatter/%s/shared-files?pageNumber=%d - endpoint accessed - returning response.", chatterId, pageNumber));
		return ResponseEntity
			.status(HttpStatus.OK)
			.body(new ResponseBody<ResponsePagedListDto<SharedFileDto>>(
                null,
                retrievedSharedFileDtosPage,
                this.chatterAuthenticator.getSessionExpiresAt(request)
            ));
    }
}
