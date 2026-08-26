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

import com.ditto_chat.ditto_chat_server.dtos.ResponseBody;
import com.ditto_chat.ditto_chat_server.dtos.S3PreSignedUrlDto;
import com.ditto_chat.ditto_chat_server.dtos.UploadFileIntentForm;
import com.ditto_chat.ditto_chat_server.dtos.UploadedFileToS3NotificationDto;
import com.ditto_chat.ditto_chat_server.helpers.auth.ChatterUserDetails;
import com.ditto_chat.ditto_chat_server.services.AwsService;
import com.ditto_chat.ditto_chat_server.validators.AwsValidator;

@RestController
@RequestMapping(value = "/aws", produces = { "application/json" })
public class AwsController extends GeneralController {
    @Autowired
	private AwsService awsService;
	private final Logger logger = LoggerFactory.getLogger(AwsController.class);
    
    @ResponseStatus(code = HttpStatus.CREATED)
    @PostMapping("/upload-file-intent")
    public ResponseEntity<ResponseBody<S3PreSignedUrlDto>> newUploadFileIntent(
        @RequestBody UploadFileIntentForm uploadFileIntentForm,
        @AuthenticationPrincipal ChatterUserDetails loggedInChatterUserDetails
    ) throws Exception {
		logger.info("POST /aws/upload-file-intent - endpoint accessed.");

        AwsValidator.validateUploadFileIntentForm(uploadFileIntentForm);

        S3PreSignedUrlDto s3PreSignedUrlDto
            = this.awsService.registerNewUploadFileIntent(uploadFileIntentForm);

		logger.info("POST /aws/upload-file-intent - returning response.");
		return ResponseEntity
				.status(HttpStatus.CREATED)
				.body(new ResponseBody<S3PreSignedUrlDto>(null, s3PreSignedUrlDto));
    }

    @ResponseStatus(code = HttpStatus.CREATED)
	@PostMapping("/file-uploaded-event")
	public ResponseEntity<ResponseBody<?>> fileUploadedToS3Event(
        @RequestBody UploadedFileToS3NotificationDto uploadedFileToS3NotificationDto
    ) throws Exception {
        logger.info("POST /aws/file-uploaded-event - endpoint accessed.");

        AwsValidator.validateUploadedFileToS3NotificationDto(uploadedFileToS3NotificationDto);

        this.awsService.registerUploadedFile(uploadedFileToS3NotificationDto);        

		logger.info("POST /aws/file-uploaded-event - returning response.");
		return ResponseEntity
				.status(HttpStatus.CREATED)
				.body(new ResponseBody<>(null, null));
    }
}
