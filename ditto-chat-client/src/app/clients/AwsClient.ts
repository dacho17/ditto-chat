import AxiosClient from "./AxiosClient";
import AwsClientInterface from "./AwsClientInterface";
import DummyChatClient from "./DummyChatClient";
import ViteHelper from "../helpers/ViteHelper";
import S3PreSignedUrl from "../classes/S3PreSignedUrl";
import S3UploadFileResponseDto from "../interfaces/S3UploadFileResponseDto";
import CONSTANTS from "../../Constants";

export default class AwsClient extends AxiosClient implements AwsClientInterface {
    private static awsClientSingletonReference: AwsClient | null = null;

    private constructor () {
        super(null);
    }

    public static getAwsClient(): AwsClientInterface {
        if (ViteHelper.isDevEnvironment() === true) {
            return DummyChatClient.getDummyChatClient();
        } else {
            if (AwsClient.awsClientSingletonReference === null) {
                AwsClient.awsClientSingletonReference = new AwsClient();
            }

            return AwsClient.awsClientSingletonReference;
        }
    }

    public async uploadFileToS3(s3PreSignedUploadUrl: S3PreSignedUrl, fileContentStream: ReadableStream): Promise<S3UploadFileResponseDto> {
        const targetUrl = s3PreSignedUploadUrl.getUrl();
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
