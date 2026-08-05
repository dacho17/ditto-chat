import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";

export default class AxiosClient {
    private client: AxiosInstance | null = null;
    private static DEFAULT_REQUEST_HEADERS = {
        "Content-Type": "application/json"
    };

    protected constructor(serverDomain: string | null) {
        const baseServerUrl = serverDomain !== null ? `https://${serverDomain}` : null;
        this.client = axios.create({
            baseURL: baseServerUrl,
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
}
