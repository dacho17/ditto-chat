import AxiosClient from "./AxiosClient";
import AwsClientInterface from "./AwsClientInterface";
import DummyChatClient from "./DummyChatClient";
import S3PreSignedUrlDto from "../interfaces/S3PreSignedUrlDto";
import S3UploadFileResponseDto from "../interfaces/S3UploadFileResponseDto";
import CONSTANTS from "../../Constants";

const EXECUTION_ENVIRONMENT = "DEV";    // TODO: Read this Value Dynamically

export default class AwsClient extends AxiosClient implements AwsClientInterface {
    private static awsClientSingletonReference: AwsClient | null = null;

    private constructor () {
        super(null);
    }

    public static getAwsClient(): AwsClientInterface {
        if (EXECUTION_ENVIRONMENT === "DEV") {
            return DummyChatClient.getDummyChatClient();
        } else {
            if (AwsClient.awsClientSingletonReference === null) {
                AwsClient.awsClientSingletonReference = new AwsClient();
            }

            return AwsClient.awsClientSingletonReference;
        }
    }

    public async uploadAccountImageToS3(s3PreSignedUploadUrl: S3PreSignedUrlDto, fileContentStream: ReadableStream): Promise<S3UploadFileResponseDto> {
        const targetUrl = s3PreSignedUploadUrl.url;
        const axiosResponse = await this.sendPutRequest<Promise<S3UploadFileResponseDto>>(
            targetUrl,
            fileContentStream,
            {
                headers: {
                    "Content-Type": CONSTANTS.CONTENT_TYPE_STREAM
                }
            }
        );

        return axiosResponse.data;
    }
}
