export default interface S3PreSignedUrlDto {
    s3ObjectKey: string;
    url: string;
    expiresAt: string;
}
