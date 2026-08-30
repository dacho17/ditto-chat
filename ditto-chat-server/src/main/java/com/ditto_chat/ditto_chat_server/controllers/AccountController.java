package com.ditto_chat.ditto_chat_server.controllers;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.ditto_chat.ditto_chat_server.dtos.AccountImageDto;
import com.ditto_chat.ditto_chat_server.dtos.AccountImageForm;
import com.ditto_chat.ditto_chat_server.dtos.ResponseBody;
import com.ditto_chat.ditto_chat_server.helpers.auth.Authenticator;
import com.ditto_chat.ditto_chat_server.helpers.auth.ChatterUserDetails;
import com.ditto_chat.ditto_chat_server.services.AccountService;
import com.ditto_chat.ditto_chat_server.validators.AccountValidator;

import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping(value = "/account", produces = { "application/json" })
public class AccountController extends GeneralController {
    @Autowired
    private AccountService accountService;
    @Autowired
    private Authenticator chatterAuthenticator;
	private final Logger logger = LoggerFactory.getLogger(AccountController.class);
    private final String NEW_ACCOUNT_IMAGE_SET_SUCCESS_MESSAGE = "You updated your account image";

	@ResponseStatus(code = HttpStatus.CREATED)
	@PostMapping("/new-account-image")
    public ResponseEntity<ResponseBody<AccountImageDto>> newAccountImage(
        HttpServletRequest request,
        @RequestBody AccountImageForm newAccountImageForm,
        @AuthenticationPrincipal ChatterUserDetails loggedInChatterUserDetails
    ) throws Exception {
        logger.info(String.format("POST /account/new-account-image - endpoint accessed."));

        AccountValidator.validateAccountImageForm(newAccountImageForm);

        AccountImageDto newCurrentAccountImageDto
            = this.accountService.createNewAccountImage(loggedInChatterUserDetails.getId(), newAccountImageForm);

        logger.info(String.format("POST /account/new-account-image - returning response."));
		return ResponseEntity
			.status(HttpStatus.CREATED)
			.body(new ResponseBody<AccountImageDto>(
                this.NEW_ACCOUNT_IMAGE_SET_SUCCESS_MESSAGE,
                newCurrentAccountImageDto,
                this.chatterAuthenticator.getSessionExpiresAt(request)
            ));
    }
}
