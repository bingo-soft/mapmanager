import { HttpMethod } from './HttpMethod'

export type ApiRequest = {
    method: HttpMethod;
    baseURL?: string;
    params?: unknown;
    headers?: unknown;
    data?: unknown;
}