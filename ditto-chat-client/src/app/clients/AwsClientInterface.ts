import S3PreSignedUrlDto from "../interfaces/S3PreSignedUrlDto";
import S3UploadFileResponseDto from "../interfaces/S3UploadFileResponseDto";

export default interface AwsClientInterface {
    uploadAccountImageToS3(s3PreSignedUploadUrl: S3PreSignedUrlDto, fileContentStream: ReadableStream): Promise<S3UploadFileResponseDto>;
}
