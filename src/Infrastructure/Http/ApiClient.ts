import axios from "axios"
import { AxiosError } from "axios"
import { ApiRequest } from "./ApiRequest"
import { ApiError } from "./ApiError"

/** ApiClient */
export class ApiClient {

    /**
     * Performs API request
     * @param request - request params
     * @return result of API request
     */
    public static request(request: ApiRequest): Promise<string> {
        const payload = {
            method: request.method,
            params: request.params,
            baseURL: request.base_url,
            headers: request.headers,
            data: request.data
        };
        return new Promise((resolve, reject) => {
          axios
            .request(payload)
            .then(data => {
                resolve(data.data);
            })
            .catch(err => {
                const apiError = ApiClient.normalizeError(err);
                reject(apiError);
            });
        }); 
    }

    /**
     * Normalizes error message
     * @param error - request params
     * @return object representing normalized error
     */
    private static normalizeError(error: AxiosError): ApiError {
        const data = error.response && error.response.data;
        return {
            status: (data && data.status) || (error.response && error.response.status),
            message: (data && data.message) || error.message,
            code: data && data.code,
            params: data && data.params,
            raw: error
        };
    }
}