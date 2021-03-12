import axios from "axios"
import { AxiosError } from "axios"
import { ApiRequest } from "./ApiRequest"
import { ApiError } from "./ApiError"

/** @class ApiClient */
export class ApiClient {

    /**
     * Sets opacity of layer
     *
     * @function request
     * @memberof ApiClient
     * @static
     * @param {ApiRequest} request - request params
     * @param {Number} opacity - opacity to set (from 0 to 1)
     * @return {Promise<string>} - promise
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