import { HttpMethod } from './HttpMethod'

export type ApiRequest = {
    method: HttpMethod;
    base_url?: string;
    params?: unknown;
    headers?: unknown;
    data?: unknown;
    additional_params?: unknown;
}