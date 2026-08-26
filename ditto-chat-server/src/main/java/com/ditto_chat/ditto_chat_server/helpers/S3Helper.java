// Following the Documentation at:
    // https://docs.aws.amazon.com/AmazonS3/latest/userguide/PresignedUrlUploadObject.html
    // https://docs.aws.amazon.com/AmazonS3/latest/userguide/using-presigned-url.html
// Client Accessing a presigned URL, temporary uses IAM Principal which generated the URL
// TODO: catch: make sure credentials of the issuer do not expire before presigned url expiration! if they do url expires at the same time as the credentials.

package com.ditto_chat.ditto_chat_server.helpers;

import java.time.Duration;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import com.ditto_chat.ditto_chat_server.dtos.S3PreSignedUrlDto;
import com.ditto_chat.ditto_chat_server.enums.FilePurpose;
import com.ditto_chat.ditto_chat_server.utils.CryptoTool;
import com.ditto_chat.ditto_chat_server.utils.TimeTool;

import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;
import software.amazon.awssdk.services.s3.presigner.model.PutObjectPresignRequest;

@Component
public class S3Helper {
    // @Autowired
    // private S3Presigner dittoChatS3Presigner;

    private final Logger logger = LoggerFactory.getLogger(S3Helper.class);
    private final long PRE_SIGNED_URL_VALIDITY_DURATION_IN_MINUTES = 15;
    private final String DITTO_CHAT_S3_BUCKET_NAME = "ditto-chat-s3-bucket";

    public S3PreSignedUrlDto generatePutPreSignedUrl(String fileName, FilePurpose filePurpose) {
        String s3ObjectKey = this.generateS3ObjectKey(fileName, filePurpose);

        PutObjectRequest putObjectRequest = PutObjectRequest.builder()
            .bucket(DITTO_CHAT_S3_BUCKET_NAME)
            .key(s3ObjectKey)
            .build();

        PutObjectPresignRequest putObjectPresignRequest = PutObjectPresignRequest.builder()
            .putObjectRequest(putObjectRequest)
            .signatureDuration(Duration.ofMinutes(PRE_SIGNED_URL_VALIDITY_DURATION_IN_MINUTES))
            .build();

        // TODO-aws: this code requires interaction with AWS to execute
        // PresignedPutObjectRequest presignedPutObjectRequest
        //     = this.dittoChatS3Presigner.presignPutObject(putObjectPresignRequest);
        // Timestamp preSignedUrlExpiresAt = Timestamp.from(presignedPutObjectRequest.expiration());

        // logger.info(String.format("PUT S3 Pre-Signed URL url=%s has been generated to Upload S3 Object with s3ObjectKey=%s. PreSignedUrl Expires at %s", presignedPutObjectRequest.url().toString(), s3ObjectKey, preSignedUrlExpiresAt));
        return new S3PreSignedUrlDto(s3ObjectKey, "DUMMY-SERVER-URL", TimeTool.addMinutesToTimestamp(TimeTool.getCurrentTimestamp(), (int)PRE_SIGNED_URL_VALIDITY_DURATION_IN_MINUTES));
        // TODO-aws: presignedPutObjectRequest.url().toString(), and preSignedUrlExpiresAt are arguments to the Function
    }

    public S3PreSignedUrlDto generateGetPreSignedUrl(String s3ObjectKey) {
        GetObjectRequest getObjectRequest = GetObjectRequest.builder()
            .bucket(DITTO_CHAT_S3_BUCKET_NAME)
            .key(s3ObjectKey)
            .build();

        GetObjectPresignRequest getObjectPresignRequest = GetObjectPresignRequest.builder()
            .getObjectRequest(getObjectRequest)
            .signatureDuration(Duration.ofMinutes(PRE_SIGNED_URL_VALIDITY_DURATION_IN_MINUTES))
            .build();

        // TODO-aws: this code requires interaction with AWS to execute
        // PresignedGetObjectRequest presignedGetObjectRequest
        //     = this.dittoChatS3Presigner.presignGetObject(getObjectPresignRequest);
        // Timestamp preSignedUrlExpiresAt = Timestamp.from(presignedGetObjectRequest.expiration());

        // logger.info(String.format("GET S3 Pre-Signed URL url=%s has been generated to Retrieve S3 Object with s3ObjectKey=%s. PreSignedUrl Expires at %s", presignedGetObjectRequest.url().toString(), s3ObjectKey, preSignedUrlExpiresAt));
        return new S3PreSignedUrlDto(s3ObjectKey, "DUMMY-SERVER-URL", TimeTool.addMinutesToTimestamp(TimeTool.getCurrentTimestamp(), (int)PRE_SIGNED_URL_VALIDITY_DURATION_IN_MINUTES));
        // return new S3PreSignedUrlDto(s3ObjectKey, presignedGetObjectRequest.url().toString(), preSignedUrlExpiresAt);
        // TODO-aws: presignedPutObjectRequest.url().toString(), and preSignedUrlExpiresAt are arguments to the Function
    }

    private String generateS3ObjectKey(String fileName, FilePurpose filePurpose) {
        String uuid = CryptoTool.generateUUID().toString();
        return String.format("%s/%s-%s", filePurpose.toString(), fileName, uuid);
    }
}
