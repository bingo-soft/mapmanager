import { HttpMethod } from './HttpMethod'

export type ApiRequest = {
    method: HttpMethod;
    base_url?: string;
    params?: unknown;
    headers?: unknown;
    data?: unknown;
    axios_params?: unknown;
}