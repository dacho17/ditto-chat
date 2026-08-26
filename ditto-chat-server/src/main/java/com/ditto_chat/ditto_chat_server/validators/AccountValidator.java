package com.ditto_chat.ditto_chat_server.validators;

import com.ditto_chat.ditto_chat_server.dtos.AccountImageForm;

public class AccountValidator extends GeneralValidator {
    public static void validateAccountImageForm(AccountImageForm accountImageForm) {
            boolean isS3ObjectKeyValid = AwsValidator.validateS3ObjectKey(accountImageForm.getAccountImageFileS3ObjectKey());
            if (isS3ObjectKeyValid == false) {
                throwValidationException(String.format("s3ObjectKey validation has failed in validateAccountImageForm for s3ObjectKey=%s.",
                    accountImageForm.getAccountImageFileS3ObjectKey()));
            }
    }
}
