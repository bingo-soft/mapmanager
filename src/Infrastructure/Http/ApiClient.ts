import axios, { AxiosError } from "axios"
import { ApiRequest } from "./ApiRequest"
import { ApiError } from "./ApiError"

/** ApiClient */
export class ApiClient {

    /**
     * Performs API request
     * @param request - request params
     * @return result of API request
     */
    public static request(request: ApiRequest): Promise<any> {
        const payload = {
            method: request["method"] || null,
            params: request["params"] || null,
            baseURL: request["base_url"] || null,
            headers: request["headers"] || null,
            data: request["data"] || null,
            responseType: request["responseType"] || null
        };
        if (request["axios_params"]) {
            for (const k in <any> request["axios_params"]) {
                payload[k] = request.axios_params[k] || null;
            }
        }
        axios.interceptors.request.use(request["request_on_fullfilled"], request["request_on_rejected"]);
        axios.interceptors.response.use(request["response_on_fullfilled"], request["response_on_rejected"]);
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