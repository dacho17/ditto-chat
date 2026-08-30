import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import ViteHelper from "../helpers/ViteHelper";

export default class AxiosClient {
    private client: AxiosInstance | null = null;
    private static DEFAULT_REQUEST_HEADERS = {
        "Content-Type": "application/json"
    };

    protected constructor(serverDomain: string | null) {
        const httpProtocolPrefix = this.getHttpProtocolPrefix();
        const baseServerUrl = serverDomain !== null ? `${httpProtocolPrefix}://${serverDomain}` : null;
        this.client = axios.create({
            baseURL: baseServerUrl,
        });

        this.client.interceptors.response.use((response: AxiosResponse) => {
            console.log(`Successful Response Received from the Server. Response: ${JSON.stringify(response)}`);

            return response;
        }, (err: AxiosError) => {
            let res = err.response;
            let statusCode: number = res?.status!;

            console.error(`Error Status Code (${statusCode}) has been Received from the Server. Response: ${JSON.stringify(err)}`);
            return Promise.reject(res);
        });
    }

    protected async sendGetRequest<T>(url: string, params?: URLSearchParams): Promise<AxiosResponse<T>> {
        return await this.client.get(url, {params, withCredentials: true});
    }

    protected async sendPostRequest<T>(url: string, body?: {}, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
        return await this.client.post(url, body, {
            headers: AxiosClient.DEFAULT_REQUEST_HEADERS,
            withCredentials: true,
            ...config
        });
    }

    protected async sendPutRequest<T>(url: string, body?: {}, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
        return await this.client.put(url, body, {
            headers: AxiosClient.DEFAULT_REQUEST_HEADERS,
            ...config
        });
    }

    private getHttpProtocolPrefix(): string {
        return ViteHelper.isDevEnvironment() ? "http" : "https";
    }
}
