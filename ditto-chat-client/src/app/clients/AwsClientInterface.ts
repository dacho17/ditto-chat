import S3PreSignedUrl from "../classes/S3PreSignedUrl";
import S3UploadFileResponseDto from "../interfaces/S3UploadFileResponseDto";

export default interface AwsClientInterface {
    uploadFileToS3(s3PreSignedUploadUrl: S3PreSignedUrl, fileContentStream: ReadableStream): Promise<S3UploadFileResponseDto>;
}
