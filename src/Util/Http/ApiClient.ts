import axios from 'axios'
import { ApiRequest } from './ApiRequest'
import { ApiError } from './ApiError'

export class ApiClient {
    static shared = new ApiClient();

    request(request: ApiRequest): Promise<any> {
        let payload = {
            method: request.method,
            params: request.params,
            baseURL: request.baseURL,
            headers: request.headers
        };
        return new Promise((resolve, reject) => {
          axios
            .request(payload)
            .then(data => {
                resolve(data);
            })
            .catch(err => {
                const apiError = this.normalizeError(err);
                reject(apiError);
            });
        });
    }

    private normalizeError(error: any): ApiError {
        let data = error.response && error.response.data;
        return {
            status: (data && data.status) || (error.response && error.response.status),
            message: (data && data.message) || error.message,
            code: data && data.code,
            params: data && data.params,
            raw: error
        };
    }
}