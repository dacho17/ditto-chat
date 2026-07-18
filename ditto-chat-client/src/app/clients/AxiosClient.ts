import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";

export default class AxiosClient {
    // private static axiosClientSingletonReference: AxiosClient | null = null;
    private client: AxiosInstance | null = null;
    private static DEFAULT_REQUEST_HEADERS = {
        "Content-Type": "application/json"
    };

    protected constructor(serverDomain: string) {
        this.client = axios.create({
            baseURL: `https://${serverDomain}`,
        });

        this.client.interceptors.response.use((response: AxiosResponse) => {
            console.log(`Successful Response Received, with Message : ${response.data.message}`);

            return response;
        }, (err: AxiosError) => {
            let res = err.response;
            let statusCode: number = res?.status!;

            console.error(`Error Status Code (${statusCode}) has been Received from the Server. Response: ${JSON.stringify(err)}`);
            return Promise.reject(res);
        });
    }

    protected async sendGetRequest(url: string, params?: URLSearchParams): Promise<AxiosResponse> {
        return await this.client.get(url, {params, withCredentials: true});
    }

    protected async sendPostRequest(url: string, body?: {}, config?: AxiosRequestConfig) {
        return await this.client.post(url, body, {
            ...config, withCredentials: true,
            headers: AxiosClient.DEFAULT_REQUEST_HEADERS
        });
    }
}
